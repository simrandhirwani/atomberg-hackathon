from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, Boolean, Text, DateTime, func
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    role = Column(String(50), nullable=False)  # Employee, Manager, Admin
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    goals = relationship("Goal", back_populates="owner")

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    thrust_area = Column(String(100), nullable=False)
    title = Column(Text, nullable=False)
    target_value = Column(Numeric, nullable=False)
    uom = Column(String(50), nullable=False)  # Numeric, %, Timeline, Zero-based
    weightage = Column(Integer, nullable=False) # Enforced min 10% on business layer
    status = Column(String(50), default="Draft")  # Draft, Pending Approval, Locked

    created_at = Column(DateTime, server_default=func.now())
    owner = relationship("User", back_populates="goals")
    checkins = relationship("CheckIn", back_populates="goal", cascade="all, delete-orphan")

class CheckIn(Base):
    __tablename__ = "checkins"

    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=False)
    quarter = Column(String(2), nullable=False)  # Q1, Q2, Q3, Q4
    achievement_value = Column(Numeric, nullable=False)
    status = Column(String(50), nullable=False)  # Not Started, On Track, Completed
    manager_comment = Column(Text, nullable=True)
    locked = Column(Boolean, default=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    goal = relationship("Goal", back_populates="checkins")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=False)
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(Text, nullable=False)
    timestamp = Column(DateTime, server_default=func.now())