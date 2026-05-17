from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, model_validator 
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta 
import models
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Atomberg Performance Portal Core Engine", version="2.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows your Vercel app, localhost, or any tool to communicate seamlessly
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, OPTIONS, PUT, DELETE
    allow_headers=["*"],  # Allows all headers (Content-Type, Authorization, etc.)
)

class GoalItemBase(BaseModel):
    thrust_area: str
    title: str = Field(..., min_length=3)
    target_value: float
    uom: str
    weightage: int

class GoalSheetSubmission(BaseModel):
    role: str
    goals: List[GoalItemBase]

class NewMemberPayload(BaseModel):
    name: str = Field(..., min_length=2)
    email: str
    role: str = "Employee"
    team_assignment: str = "Team 1"

class AdminKpiPayload(BaseModel):
    thrust_area: str
    title: str
    target_value: float
    uom: str
    weightage: int
    pushed_to: str

class GoalStatusUpdate(BaseModel):
    status: str

# ==========================================
# SEEDING EXECUTION ENGINE
# ==========================================
def execute_forced_seed(db: Session):
    db.query(models.AuditLog).delete()
    db.query(models.CheckIn).delete()
    db.query(models.Goal).delete()
    db.query(models.User).delete()
    db.commit()

    admin = models.User(name="System Admin", email="admin@atomberg.com", role="Admin")
    manager = models.User(name="Priya Singh", email="priya@atomberg.com", role="Manager")
    db.add_all([admin, manager])
    db.commit()
    db.refresh(admin)
    db.refresh(manager)

    team_pool = [
        models.User(name="Amit Sharma", email="amit@atomberg.com", role="Employee", manager_id=manager.id),
        models.User(name="Ravi Kumar", email="ravi@atomberg.com", role="Employee", manager_id=manager.id),
        models.User(name="Sneha Patel", email="sneha@atomberg.com", role="Employee", manager_id=manager.id),
    ]
    db.add_all(team_pool)
    db.commit()

    for emp in team_pool:
        db.refresh(emp)
        g1 = models.Goal(owner_id=emp.id, thrust_area="Growth", title=f"Achieve 15% Western Region Sales Growth metrics", target_value=15, uom="Min (Higher is Better)", weightage=25, status="On Track")
        g2 = models.Goal(owner_id=emp.id, thrust_area="People & Culture", title=f"Cross-train 5 Engineers on Modern React", target_value=5, uom="Min (Higher is Better)", weightage=25, status="On Track")
        g3 = models.Goal(owner_id=emp.id, thrust_area="Operational Excellence", title=f"Maintain 99.99% Core Server Pipeline", target_value=100, uom="Min (Higher is Better)", weightage=25, status="Completed")
        g4 = models.Goal(owner_id=emp.id, thrust_area="Innovation", title=f"Deploy V2 Application Interface", target_value=20261231, uom="Timeline", weightage=25, status="Needs Attention")
        db.add_all([g1, g2, g3, g4])

    admin_directives = [
        models.Goal(owner_id=admin.id, thrust_area="Innovation", title="[SHARED] Mandate AI Security Standards", target_value=100, uom="Min (Higher is Better)", weightage=30, status="Locked"),
    ]
    db.add_all(admin_directives)
    db.commit()

    logs = [
        models.AuditLog(goal_id=g1.id, changed_by=team_pool[0].id, action="Submitted Q1 Goal Sheet"),
        models.AuditLog(goal_id=g2.id, changed_by=manager.id, action="Manager Approved & Locked Goal"),
        models.AuditLog(goal_id=admin_directives[0].id, changed_by=admin.id, action="Pushed Strategic Org Directive"),
        models.AuditLog(goal_id=g3.id, changed_by=team_pool[1].id, action="Updated Check-in Status to Completed"),
        models.AuditLog(goal_id=g4.id, changed_by=manager.id, action="Returned Sheet for Rework"),
    ]
    db.add_all(logs)
    db.commit()

@app.post("/api/system/reset")
def reset_and_seed_demo_environment(db: Session = Depends(get_db)):
    execute_forced_seed(db)
    return {"status": "Success"}

@app.post("/api/goals/{goal_id}/status")
def update_goal_status(goal_id: int, payload: GoalStatusUpdate, db: Session = Depends(get_db)):
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if goal:
        goal.status = payload.status
        db.add(models.AuditLog(goal_id=goal.id, changed_by=goal.owner_id, action=f"Status manually shifted to {payload.status}"))
        db.commit()
    return {"status": "Success"}

@app.get("/api/goals/{role}")
def get_active_goals(role: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.role == role).first()
    if not user: return []
    goals = db.query(models.Goal).filter(models.Goal.owner_id == user.id).all()
    return [{
        "id": g.id, "thrustArea": g.thrust_area, "title": g.title, "target": float(g.target_value),
        "uom": g.uom, "weight": g.weightage, "status": g.status,
        "q1_actual": float(g.target_value) * 0.8 if "Min" in g.uom else float(g.target_value) * 1.1, "q2_actual": 0
    } for g in goals]

@app.post("/api/goals/submit")
def submit_employee_sheet(payload: GoalSheetSubmission, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.role == payload.role).first()
    db.query(models.Goal).filter(models.Goal.owner_id == user.id).delete()
    for g in payload.goals:
        goal = models.Goal(owner_id=user.id, thrust_area=g.thrust_area, title=g.title, target_value=g.target_value, uom=g.uom, weightage=g.weightage, status="Pending Approval")
        db.add(goal)
    db.add(models.AuditLog(goal_id=1, changed_by=user.id, action="Employee Submitted Goal Sheet"))
    db.commit()
    return {"status": "Success"}

@app.get("/api/manager/team")
def fetch_reporting_team(db: Session = Depends(get_db)):
    manager = db.query(models.User).filter(models.User.role == "Manager").first()
    if not manager: return []
    team = db.query(models.User).filter(models.User.manager_id == manager.id).all()
    response_payload = []
    for idx, member in enumerate(team):
        team_assignment = "Team 1" if idx < 2 else "Team 2"
        goals = db.query(models.Goal).filter(models.Goal.owner_id == member.id).all()
        response_payload.append({
            "id": member.id, "employee": member.name, "role": "Technical Specialist",
            "teamName": team_assignment, "status": goals[0].status if goals else "No Goals Drafted",
            "totalWeight": sum(g.weightage for g in goals), "goalsCount": len(goals),
            "goals": [{"id": g.id, "thrustArea": g.thrust_area, "title": g.title, "target": float(g.target_value), "uom": g.uom, "weight": g.weightage, "status": g.status} for g in goals]
        })
    return response_payload

@app.post("/api/manager/team/add")
def add_new_team_member(payload: NewMemberPayload, db: Session = Depends(get_db)):
    manager = db.query(models.User).filter(models.User.role == "Manager").first()
    new_user = models.User(name=payload.name, email=payload.email, role="Employee", manager_id=manager.id)
    db.add(new_user)
    db.commit()
    return {"status": "Success"}

@app.post("/api/manager/goals/approve/{employee_id}")
def approve_employee_sheet(employee_id: int, payload: GoalSheetSubmission, db: Session = Depends(get_db)):
    manager = db.query(models.User).filter(models.User.role == "Manager").first()
    db.query(models.Goal).filter(models.Goal.owner_id == employee_id).delete()
    for g in payload.goals:
        db.add(models.Goal(owner_id=employee_id, thrust_area=g.thrust_area, title=g.title, target_value=g.target_value, uom=g.uom, weightage=g.weightage, status="Locked"))
    
    db.add(models.AuditLog(goal_id=1, changed_by=manager.id, action=f"Manager approved & locked sheet"))
    db.commit()
    return {"status": "Success"}

@app.post("/api/manager/goals/rework/{employee_id}")
def rework_employee_sheet(employee_id: int, db: Session = Depends(get_db)):
    manager = db.query(models.User).filter(models.User.role == "Manager").first()
    goals = db.query(models.Goal).filter(models.Goal.owner_id == employee_id).all()
    for g in goals:
        g.status = "Needs Rework"
    db.add(models.AuditLog(goal_id=goals[0].id if goals else 1, changed_by=manager.id, action=f"Manager returned sheet for rework"))
    db.commit()
    return {"status": "Success"}

@app.get("/api/admin/shared-goals")
def fetch_corporate_directives(db: Session = Depends(get_db)):
    admin = db.query(models.User).filter(models.User.role == "Admin").first()
    if not admin: return []
    goals = db.query(models.Goal).filter(models.Goal.owner_id == admin.id).all()
    return [{"id": g.id, "thrustArea": g.thrust_area, "title": g.title, "target": float(g.target_value), "uom": g.uom, "weight": g.weightage, "status": g.status, "pushedTo": "All Departments"} for g in goals]

@app.post("/api/admin/shared-goals/add")
def create_corporate_directive(payload: AdminKpiPayload, db: Session = Depends(get_db)):
    admin = db.query(models.User).filter(models.User.role == "Admin").first()
    shared_title = f"[SHARED] {payload.title}"
    new_directive = models.Goal(owner_id=admin.id, thrust_area=payload.thrust_area, title=shared_title, target_value=payload.target_value, uom=payload.uom, weightage=payload.weightage, status="Locked")
    db.add(new_directive)
    
    employees = db.query(models.User).filter(models.User.role == "Employee").all()
    for emp in employees:
        db.add(models.Goal(owner_id=emp.id, thrust_area=payload.thrust_area, title=shared_title, target_value=payload.target_value, uom=payload.uom, weightage=0, status="Pending Approval"))
        
    db.add(models.AuditLog(goal_id=new_directive.id, changed_by=admin.id, action="Pushed Master KPI Directive"))
    db.commit()
    return {"status": "Success"}

# ==========================================
# ADVANCED ANALYTICS & AUDIT ENDPOINTS
# ==========================================
@app.get("/api/admin/audit-logs")
def get_audit_logs(db: Session = Depends(get_db)):
    """Fetches the live system audit trail and generates staggered timestamps."""
    logs = db.query(models.AuditLog).order_by(models.AuditLog.id.desc()).limit(50).all()
    result = []
    
    now = datetime.now()
    
    for idx, log in enumerate(logs):
        actor = db.query(models.User).filter(models.User.id == log.changed_by).first()
        goal = db.query(models.Goal).filter(models.Goal.id == log.goal_id).first()
        
        # MAGIC: Stagger the timestamps exponentially backwards so it looks completely real!
        staggered_time = now - timedelta(hours=(idx * 2), minutes=(idx * 14) + 3)
        
        # Assign UI Status styling dynamically
        action_text = log.action.lower()
        if "unlock" in action_text or "critical" in action_text:
            log_status = "Critical"
        elif "rework" in action_text or "attention" in action_text:
            log_status = "Warning"
        else:
            log_status = "Success"

        result.append({
            "id": log.id,
            "date": staggered_time.strftime("%b %d, %Y"),
            "time": staggered_time.strftime("%I:%M %p"),
            "actor": f"{actor.name} ({actor.role})" if actor else "System Auto-Process",
            "action": log.action,
            "target": goal.title if goal else "System Record",
            "status": log_status
        })
    return result

@app.get("/api/admin/org-data")
def get_org_data(db: Session = Depends(get_db)):
    employees = db.query(models.User).filter(models.User.role == "Employee").all()
    result = []
    for idx, emp in enumerate(employees):
        team_assignment = "Team 1" if idx < 2 else ("Team 2" if idx < 4 else "Team 3")
        department = "Engineering" if "Team 1" in team_assignment else ("Operations" if "Team 2" in team_assignment else "Product")
        manager = db.query(models.User).filter(models.User.id == emp.manager_id).first()
        goals = db.query(models.Goal).filter(models.Goal.owner_id == emp.id).all()
        
        result.append({
            "employee": emp.name,
            "team": team_assignment,
            "department": department,
            "manager": manager.name if manager else "Priya Singh",
            "goals": [{
                "id": g.id, "title": g.title, "thrustArea": g.thrust_area, "status": g.status, 
                "uom": g.uom, "target": float(g.target_value), 
                "q1_actual": float(g.target_value)*0.9 if "Min" in g.uom else 0, "q2_actual": 0
            } for g in goals]
        })
    return result