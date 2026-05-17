import React, { useState, useEffect } from 'react';
import { ShieldAlert, Trash2, Plus, CheckCircle, XCircle, Lock, Layers, RefreshCw, Send, Clock } from 'lucide-react';

interface EmployeeGoal {
  id: number;
  thrustArea: string;
  title: string;
  target: number;
  uom: string;
  weight: number;
  status?: string;
  q1_actual?: number;
  q2_actual?: number;
}

interface TeamMember {
  id: number;
  employee: string;
  role: string;
  teamName: string;
  status: string;
  totalWeight: number;
  goalsCount: number;
  goals: EmployeeGoal[];
}

// ==========================================
// FAILSAFE DEMO DATA 
// ==========================================
const FALLBACK_EMPLOYEE: EmployeeGoal[] = [
  { id: 1, thrustArea: 'Growth', title: 'Achieve 15% Western Region Sales', target: 15, uom: 'Min (Higher is Better)', weight: 25, status: 'Locked', q2_actual: 8 },
  { id: 2, thrustArea: 'People & Culture', title: 'Cross-train 5 Engineers on React', target: 5, uom: 'Min (Higher is Better)', weight: 25, status: 'Locked', q2_actual: 2 },
  { id: 3, thrustArea: 'Operational Excellence', title: 'Maintain 99.99% Uptime', target: 100, uom: 'Min (Higher is Better)', weight: 25, status: 'Pending Approval' },
  { id: 4, thrustArea: 'Innovation', title: 'Deploy V2 Application Interface', target: 20261231, uom: 'Timeline', weight: 15, status: 'Locked' },
  { id: 5, thrustArea: 'Growth', title: 'Launch 2 New Product Lines', target: 2, uom: 'Min (Higher is Better)', weight: 10 }
];

const FALLBACK_MANAGER: TeamMember[] = [
  { 
    id: 101, employee: 'Amit Sharma', role: 'Frontend Engineer', teamName: 'Team 1', status: 'Locked', totalWeight: 100, goalsCount: 4, 
    goals: [
      { id: 1, thrustArea: 'Growth', title: 'Maximize Strategic Client Growth', target: 15, uom: 'Min (Higher is Better)', weight: 25 },
      { id: 2, thrustArea: 'Operational Excellence', title: 'Clear Backlog Ticket Queue', target: 100, uom: 'Min (Higher is Better)', weight: 25 },
      { id: 3, thrustArea: 'Innovation', title: 'Deploy Internal Utilities', target: 5, uom: 'Min (Higher is Better)', weight: 25 },
      { id: 4, thrustArea: 'People & Culture', title: 'Conclude Bootcamps', target: 100, uom: 'Min (Higher is Better)', weight: 25 }
    ]
  },
  { 
    id: 102, employee: 'Ravi Kumar', role: 'Backend Engineer', teamName: 'Team 1', status: 'Pending Approval', totalWeight: 100, goalsCount: 4, 
    goals: [
      { id: 5, thrustArea: 'Growth', title: 'Optimize Cloud Database', target: 100, uom: 'Min (Higher is Better)', weight: 40 },
      { id: 6, thrustArea: 'Innovation', title: 'Launch AI Microservice', target: 20261115, uom: 'Timeline', weight: 30 },
      { id: 7, thrustArea: 'Operational Excellence', title: 'Reduce API Latency', target: 2, uom: 'Max (Lower is Better)', weight: 30 }
    ]
  },
  { 
    id: 103, employee: 'Sneha Patel', role: 'QA Lead', teamName: 'Team 2', status: 'Needs Rework', totalWeight: 100, goalsCount: 3, 
    goals: [
      { id: 8, thrustArea: 'Operational Excellence', title: 'Achieve Zero Critical Bugs in Prod', target: 0, uom: 'Zero-Based', weight: 50 },
      { id: 9, thrustArea: 'People & Culture', title: 'Hire 3 Automation Testers', target: 3, uom: 'Min (Higher is Better)', weight: 25 },
      { id: 10, thrustArea: 'Innovation', title: 'Migrate to Playwright', target: 100, uom: 'Min (Higher is Better)', weight: 25 }
    ]
  }
];

const FALLBACK_ADMIN = [
  { id: 201, thrustArea: 'Innovation', title: 'ORG: Mandate AI Security Standards', target: 100, uom: 'Min (Higher is Better)', weight: 30, pushedTo: 'All Departments' },
  { id: 202, thrustArea: 'Operational Excellence', title: 'ORG: Implement Zero-Trust Network', target: 100, uom: 'Min (Higher is Better)', weight: 20, pushedTo: 'All Departments' }
];

const GoalSheet = ({ currentRole }: { currentRole: string }) => {
  const [employeeGoals, setEmployeeGoals] = useState<EmployeeGoal[]>([]);
  const [managerQueue, setManagerQueue] = useState<TeamMember[]>([]);
  const [adminDirectives, setAdminDirectives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTeamFilter, setActiveTeamFilter] = useState<string>('All Teams');

  const [dirTitle, setDirTitle] = useState('');
  const [dirArea, setDirArea] = useState('Innovation');
  const [dirWeight, setDirWeight] = useState(25);
  const [dirTarget, setDirTarget] = useState(100);
  const [dirUom, setDirUom] = useState('Min (Higher is Better)');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ==========================================
  // DATA FETCHING & OFFLINE DEMO FALLBACK
  // ==========================================
  const loadDataPipelines = () => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    const fetchUrl = currentRole === 'Employee' ? 'http://localhost:8000/api/goals/Employee'
      : currentRole === 'Manager' ? 'http://localhost:8000/api/manager/team'
      : 'http://localhost:8000/api/admin/shared-goals';

    fetch(fetchUrl)
      .then(res => res.json())
      .then(data => { 
        if (!data || data.length === 0) throw new Error("Empty DB");
        if (currentRole === 'Employee') setEmployeeGoals(data);
        else if (currentRole === 'Manager') setManagerQueue(data);
        else setAdminDirectives(data);
        setLoading(false); 
      })
      .catch(() => {
        console.warn("Using Failsafe Offline Demo Data");
        if (currentRole === 'Employee') setEmployeeGoals(FALLBACK_EMPLOYEE);
        else if (currentRole === 'Manager') setManagerQueue(FALLBACK_MANAGER);
        else setAdminDirectives(FALLBACK_ADMIN);
        setLoading(false);
      });
  };

  useEffect(() => { loadDataPipelines(); }, [currentRole]);

  // --- TIMELINE DATE UTILS ---
  const toInt = (dateStr: string) => parseInt(dateStr.replace(/-/g, '')) || 0;
  const toDateStr = (intVal: number) => {
    if (!intVal) return '';
    const s = String(intVal);
    return s.length === 8 ? `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}` : '';
  };

  const handleAddGoal = () => {
    if (employeeGoals.length >= 8) return;
    setEmployeeGoals([...employeeGoals, { id: Date.now(), thrustArea: 'Growth', title: '', target: 100, uom: 'Min (Higher is Better)', weight: 10 }]);
  };

  const handleUpdateGoal = (id: number, field: keyof EmployeeGoal, value: any) => {
    setEmployeeGoals(employeeGoals.map(g => g.id === id ? { ...g, [field]: value } : g));
  };
  
  const handleManagerUpdateGoal = (memberId: number, goalId: number, field: keyof EmployeeGoal, value: any) => {
    setManagerQueue(prev => prev.map(m => {
      if (m.id !== memberId) return m;
      return { ...m, goals: m.goals.map(g => g.id === goalId ? { ...g, [field]: value } : g) };
    }));
  };

  const handleRemoveGoal = (id: number) => {
    setEmployeeGoals(employeeGoals.filter(g => g.id !== id));
  };

  const handleSubmitToBackend = async () => {
    setErrorMessage(null); setSuccessMessage(null);
    const formattedGoals = employeeGoals.map(g => ({ thrust_area: g.thrustArea, title: g.title, target_value: g.target, uom: g.uom, weightage: g.weight }));
    try {
      const response = await fetch('http://localhost:8000/api/goals/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: currentRole, goals: formattedGoals }) });
      const data = await response.json();
      if (response.ok) setSuccessMessage("Worksheet successfully synced with database.");
      else setErrorMessage(data.detail || "Validation check failure.");
    } catch { 
      setSuccessMessage("Worksheet updated locally (Offline Demo Mode)."); 
    }
  };

  const handleManagerAction = async (employeeId: number, action: 'approve' | 'rework') => {
    const endpoint = action === 'approve' ? `/api/manager/goals/approve/${employeeId}` : `/api/manager/goals/rework/${employeeId}`;
    const member = managerQueue.find(m => m.id === employeeId);
    if (!member) return;
    const formattedGoals = member.goals.map(g => ({ thrust_area: g.thrustArea, title: g.title, target_value: g.target, uom: g.uom, weightage: g.weight }));
    
    try {
      await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: 'Employee', goals: formattedGoals })
      });
      setSuccessMessage(action === 'approve' ? "Sheet approved & locked." : "Sheet returned for rework.");
      loadDataPipelines();
    } catch { 
      setManagerQueue(prev => prev.map(m => m.id === employeeId ? { ...m, status: action === 'approve' ? 'Locked' : 'Needs Rework' } : m));
      setSuccessMessage(action === 'approve' ? "Sheet approved (Offline Mode)." : "Sheet returned (Offline Mode)."); 
    }
  };

  const handleAddCorporateDirective = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:8000/api/admin/shared-goals/add', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ thrust_area: dirArea, title: dirTitle, target_value: dirTarget, uom: dirUom, weightage: dirWeight, pushed_to: 'All Departments' })
      });
      setSuccessMessage("KPI securely pushed to all employee worksheets.");
      setDirTitle(''); loadDataPipelines();
    } catch { 
      const newDirective = { id: Date.now(), thrustArea: dirArea, title: `ORG: ${dirTitle}`, target: dirTarget, uom: dirUom, weight: dirWeight, pushedTo: 'All Departments' };
      setAdminDirectives(prev => [...prev, newDirective]);
      setSuccessMessage("KPI securely pushed (Offline Demo Mode).");
      setDirTitle('');
    }
  };

  const filteredManagerQueue = activeTeamFilter === 'All Teams' 
    ? managerQueue 
    : managerQueue.filter(m => m.teamName === activeTeamFilter);

  if (loading) return <div className="p-24 text-center"><div className="animate-spin w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-in fade-in duration-500">
      <div className="border-b border-slate-200 pb-6 mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Goal Validation Matrix</h1>
          <p className="text-slate-500 font-medium mt-1">Design, assign, and validate quarterly objectives.</p>
        </div>
      </div>

      {successMessage && <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 font-bold flex items-center gap-2 animate-in slide-in-from-top-2"><CheckCircle size={18} /> {successMessage}</div>}
      {errorMessage && <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-800 font-bold flex items-center gap-2 animate-in slide-in-from-top-2"><XCircle size={18} /> {errorMessage}</div>}

      {/* --- EMPLOYEE VIEW STATE --- */}
      {currentRole === 'Employee' && (
        <div className="flex flex-col xl:flex-row gap-6 items-start">
          <div className="flex-1 space-y-6 w-full">
            {employeeGoals.map((goal) => {
              const isShared = goal.title.startsWith("[SHARED]") || goal.title.startsWith("ORG:");
              const displayTitle = goal.title.replace("[SHARED] ", "").replace("ORG: ", "");
              
              // BRD Security Validations
              const isApproved = goal.status === 'Locked' || goal.status === 'Completed';
              const isPending = goal.status === 'Pending Approval';
              const isReadOnly = isShared || isApproved || isPending;

              return (
                <div key={goal.id} className={`bg-white border-2 rounded-xl shadow-sm overflow-hidden relative group transition-all duration-200 ${isShared ? 'border-blue-300 bg-blue-50/20' : 'border-slate-200 hover:border-yellow-400'}`}>
                  {/* Badges */}
                  {isShared && <div className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 absolute top-0 left-0 rounded-br-lg flex items-center gap-1 shadow-sm"><Lock size={10}/> Admin Directive</div>}
                  {isApproved && <div className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 absolute top-0 right-0 rounded-bl-lg flex items-center gap-1 shadow-sm"><CheckCircle size={10}/> Approved & Active</div>}
                  {isPending && <div className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 absolute top-0 right-0 rounded-bl-lg flex items-center gap-1 shadow-sm"><Clock size={10}/> Pending Review</div>}
                  
                  <div className={`p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end ${isShared || isApproved || isPending ? 'pt-8' : ''}`}>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-wider">Thrust Area</label>
                      <select disabled={isReadOnly} value={goal.thrustArea} onChange={(e) => handleUpdateGoal(goal.id, 'thrustArea', e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none disabled:opacity-60 disabled:cursor-not-allowed focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"><option>Growth</option><option>Innovation</option><option>Operational Excellence</option><option>People & Culture</option></select>
                    </div>
                    
                    <div className="sm:col-span-2 lg:col-span-4">
                      <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-wider">Goal Metric Title</label>
                      <input disabled={isReadOnly} type="text" value={displayTitle} onChange={(e) => handleUpdateGoal(goal.id, 'title', e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 outline-none disabled:opacity-60 disabled:cursor-not-allowed focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400" />
                    </div>
                    
                    <div className="col-span-1 lg:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-wider">{goal.uom === 'Timeline' ? 'Deadline' : 'Target'}</label>
                      {goal.uom === 'Timeline' ? (
                        <input disabled={isReadOnly} type="date" value={toDateStr(goal.target)} onChange={(e) => handleUpdateGoal(goal.id, 'target', toInt(e.target.value))} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-black text-slate-800 outline-none disabled:opacity-60 disabled:cursor-not-allowed focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400" />
                      ) : (
                        <input disabled={isReadOnly} type="number" value={goal.target} onChange={(e) => handleUpdateGoal(goal.id, 'target', Number(e.target.value))} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-black text-slate-800 outline-none disabled:opacity-60 disabled:cursor-not-allowed focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400" />
                      )}
                    </div>
                    
                    {/* BRD GAP FIX: Phase 2 Achievement Input replaces UoM dropdown if goal is approved */}
                    {isApproved ? (
                      <div className="col-span-1 lg:col-span-2 relative">
                        <label className="block text-[10px] font-black text-emerald-600 mb-1.5 uppercase tracking-wider animate-pulse">Log Actuals (Q2)</label>
                        {goal.uom === 'Timeline' ? (
                          <input type="date" value={toDateStr(goal.q2_actual || 0)} onChange={(e) => handleUpdateGoal(goal.id, 'q2_actual', toInt(e.target.value))} className="w-full bg-emerald-50 border border-emerald-300 rounded-lg px-3 py-2 text-sm font-black text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-400" />
                        ) : (
                          <input type="number" value={goal.q2_actual || ''} onChange={(e) => handleUpdateGoal(goal.id, 'q2_actual', Number(e.target.value))} placeholder="Enter value..." className="w-full bg-emerald-50 border border-emerald-300 rounded-lg px-3 py-2 text-sm font-black text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-400" />
                        )}
                      </div>
                    ) : (
                      <div className="col-span-1 lg:col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-wider">Criteria [UoM]</label>
                        <select disabled={isReadOnly} value={goal.uom} onChange={(e) => handleUpdateGoal(goal.id, 'uom', e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none disabled:opacity-60 disabled:cursor-not-allowed focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"><option>Min (Higher is Better)</option><option>Max (Lower is Better)</option><option>Zero-Based</option><option>Timeline</option></select>
                      </div>
                    )}
                    
                    <div className="col-span-1 lg:col-span-1 relative">
                      <label className={`block text-[10px] font-black mb-1.5 uppercase tracking-wider ${isShared ? 'text-blue-600' : 'text-slate-400'}`}>Weight</label>
                      <input disabled={isApproved || isPending} type="number" value={goal.weight} onChange={(e) => handleUpdateGoal(goal.id, 'weight', Number(e.target.value))} className={`w-full bg-white border rounded-lg px-3 py-2 text-sm font-black outline-none disabled:opacity-60 disabled:cursor-not-allowed ${isShared ? 'border-blue-400 text-blue-700 shadow-inner' : 'border-slate-300 text-yellow-600 focus:ring-2 focus:ring-yellow-400'}`} />
                    </div>
                    
                    {!isReadOnly && <button onClick={() => handleRemoveGoal(goal.id)} className="absolute right-3 top-3 text-slate-300 hover:text-red-500 transition-colors lg:opacity-0 lg:group-hover:opacity-100"><Trash2 size={16} /></button>}
                  </div>
                </div>
              );
            })}
            
            <button onClick={handleAddGoal} disabled={employeeGoals.length >= 8} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:bg-slate-50 hover:border-slate-400 flex justify-center items-center gap-2 shadow-sm transition-all disabled:opacity-50"><Plus size={18} /> Append Objective</button>
          </div>

          <div className="w-full xl:w-80 bg-slate-900 text-white rounded-2xl p-6 shadow-xl xl:sticky xl:top-24 shrink-0">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><ShieldAlert size={18} className="text-yellow-400"/> BRD Audit Controls</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center bg-slate-800 p-4 rounded-lg border border-slate-700">
                <span className="text-slate-300 text-sm font-medium">Accumulated Weight:</span>
                <span className={`text-2xl font-black ${employeeGoals.reduce((sum, g) => sum + g.weight, 0) === 100 ? 'text-green-400' : 'text-red-400'}`}>
                  {employeeGoals.reduce((sum, g) => sum + g.weight, 0)}%
                </span>
              </div>
              <div className="space-y-2.5 text-xs sm:text-sm px-1">
                <div className="flex items-center gap-3">{employeeGoals.length > 0 && employeeGoals.length <= 8 ? <CheckCircle size={16} className="text-green-400 shrink-0"/> : <XCircle size={16} className="text-red-400 shrink-0"/>}<span>1-8 constraints boundaries</span></div>
                <div className="flex items-center gap-3">{employeeGoals.reduce((sum, g) => sum + g.weight, 0) === 100 ? <CheckCircle size={16} className="text-green-400 shrink-0"/> : <XCircle size={16} className="text-red-400 shrink-0"/>}<span>Weightage sum targets exactly 100%</span></div>
                <div className="flex items-center gap-3">{employeeGoals.every(g => g.weight >= 10) && employeeGoals.length > 0 ? <CheckCircle size={16} className="text-green-400 shrink-0"/> : <XCircle size={16} className="text-red-400 shrink-0"/>}<span>Min 10% weight per record boundary</span></div>
              </div>
            </div>

            <button 
              disabled={!(employeeGoals.reduce((sum, g) => sum + g.weight, 0) === 100 && employeeGoals.every(g => g.weight >= 10) && employeeGoals.length <= 8 && employeeGoals.length > 0)} 
              onClick={handleSubmitToBackend} 
              className="w-full py-3.5 bg-yellow-400 text-slate-900 font-bold rounded-lg hover:bg-yellow-500 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              Sync Matrix & Actuals
            </button>
          </div>
        </div>
      )}

      {/* --- MANAGER INLINE EDITING VIEW --- */}
      {currentRole === 'Manager' && (
        <div className="space-y-6">
          <div className="flex flex-wrap bg-slate-200/60 p-1 rounded-xl w-fit border border-slate-300/40 gap-1 shadow-inner mb-6">
            {['All Teams', 'Team 1', 'Team 2', 'Team 3'].map(teamOpt => (
              <button key={teamOpt} onClick={() => setActiveTeamFilter(teamOpt)} className={`px-4 sm:px-5 py-2 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 ${activeTeamFilter === teamOpt ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}><Layers size={13} className={activeTeamFilter === teamOpt ? "text-yellow-500" : "text-slate-400"}/>{teamOpt}</button>
            ))}
          </div>

          {filteredManagerQueue.map((item) => {
            const memberWeight = item.goals.reduce((s,g) => s + g.weight, 0);
            const isValid = memberWeight === 100;

            return (
            <div key={item.id} className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-slate-300 transition-colors">
              <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-black text-lg text-slate-900">{item.employee}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded border ${item.status === 'Locked' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : item.status === 'Needs Rework' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{item.status}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 ${isValid ? 'text-slate-500' : 'bg-red-100 text-red-700 font-black'}`}>
                      {isValid ? <CheckCircle size={12} className="text-emerald-500"/> : <XCircle size={12}/>} Wt: {memberWeight}%
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={() => handleManagerAction(item.id, 'rework')} className="flex-1 sm:flex-none bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"><RefreshCw size={14}/> Return for Rework</button>
                  <button disabled={!isValid || item.status === 'Locked'} onClick={() => handleManagerAction(item.id, 'approve')} className="flex-1 sm:flex-none bg-slate-950 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"><CheckCircle size={14}/> Approve & Lock</button>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-4 bg-white">
                <div className="hidden lg:grid grid-cols-12 gap-3 text-[10px] font-black text-slate-400 uppercase tracking-wider px-2">
                  <div className="col-span-4">Objective Title</div>
                  <div className="col-span-3">Measurement Criteria</div>
                  <div className="col-span-3">Plan Target</div>
                  <div className="col-span-2">Weightage</div>
                </div>

                {item.goals.map(goal => (
                  <div key={goal.id} className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center bg-slate-50/50 lg:bg-transparent p-3 lg:p-0 rounded-lg border border-slate-100 lg:border-none">
                    <div className="lg:col-span-4">
                      <label className="block lg:hidden text-[10px] font-bold text-slate-400 uppercase mb-1">Title</label>
                      <input disabled={item.status === 'Locked'} type="text" value={goal.title} onChange={(e) => handleManagerUpdateGoal(item.id, goal.id, 'title', e.target.value)} className="w-full text-sm font-bold border border-slate-300 rounded-lg p-2.5 outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 disabled:opacity-60 disabled:bg-slate-50" />
                    </div>
                    <div className="lg:col-span-3">
                      <label className="block lg:hidden text-[10px] font-bold text-slate-400 uppercase mb-1">Criteria</label>
                      <select disabled={item.status === 'Locked'} value={goal.uom} onChange={(e) => handleManagerUpdateGoal(item.id, goal.id, 'uom', e.target.value)} className="w-full text-sm font-bold border border-slate-300 rounded-lg p-2.5 outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 disabled:opacity-60 disabled:bg-slate-50">
                        <option>Min (Higher is Better)</option><option>Max (Lower is Better)</option><option>Zero-Based</option><option>Timeline</option>
                      </select>
                    </div>
                    <div className="lg:col-span-3">
                      <label className="block lg:hidden text-[10px] font-bold text-slate-400 uppercase mb-1">Target</label>
                      {goal.uom === 'Timeline' ? (
                        <input disabled={item.status === 'Locked'} type="date" value={toDateStr(goal.target)} onChange={(e) => handleManagerUpdateGoal(item.id, goal.id, 'target', toInt(e.target.value))} className="w-full text-sm font-bold border border-slate-300 rounded-lg p-2.5 outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 disabled:opacity-60 disabled:bg-slate-50"/> 
                      ) : (
                        <input disabled={item.status === 'Locked'} type="number" value={goal.target} onChange={(e) => handleManagerUpdateGoal(item.id, goal.id, 'target', Number(e.target.value))} className="w-full text-sm font-bold border border-slate-300 rounded-lg p-2.5 outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 disabled:opacity-60 disabled:bg-slate-50" />
                      )}
                    </div>
                    <div className="lg:col-span-2 relative">
                      <label className="block lg:hidden text-[10px] font-bold text-slate-400 uppercase mb-1">Weight</label>
                      <input disabled={item.status === 'Locked'} type="number" value={goal.weight} onChange={(e) => handleManagerUpdateGoal(item.id, goal.id, 'weight', Number(e.target.value))} className="w-full text-sm font-black border border-slate-300 rounded-lg p-2.5 outline-none text-yellow-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 disabled:opacity-60 disabled:bg-slate-50" />
                      <span className="absolute right-3 top-2.5 lg:top-3 text-xs font-black text-slate-400">%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )})}
        </div>
      )}

      {/* --- ADMIN VIEW --- */}
      {currentRole === 'Admin' && (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <form onSubmit={handleAddCorporateDirective} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm w-full lg:w-1/2 space-y-4">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2"><Send className="text-yellow-500"/> Push Strategic KPI to All Employees</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Thrust Domain</label><select value={dirArea} onChange={e => setDirArea(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-bold outline-none focus:ring-1 focus:ring-yellow-400"><option>Growth</option><option>Innovation</option><option>Operational Excellence</option><option>People & Culture</option></select></div>
                <div><label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Criteria Type</label><select value={dirUom} onChange={e => setDirUom(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-bold outline-none focus:ring-1 focus:ring-yellow-400"><option>Min (Higher is Better)</option><option>Max (Lower is Better)</option><option>Timeline</option><option>Zero-Based</option></select></div>
              </div>
              <div><label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Directive Title</label><input type="text" value={dirTitle} onChange={e => setDirTitle(e.target.value)} required className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-bold outline-none focus:ring-1 focus:ring-yellow-400" placeholder="e.g. Enforce SOC2 Compliance" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">{dirUom === 'Timeline' ? 'Deadline' : 'Target Metric'}</label>
                  {dirUom === 'Timeline' ? <input type="date" onChange={e => setDirTarget(toInt(e.target.value))} required className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-bold outline-none focus:ring-1 focus:ring-yellow-400" /> : <input type="number" value={dirTarget} onChange={e => setDirTarget(Number(e.target.value))} required className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-bold outline-none focus:ring-1 focus:ring-yellow-400" />}
                </div>
                <div><label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Mandated Weightage (%)</label><input type="number" value={dirWeight} onChange={e => setDirWeight(Number(e.target.value))} required min={10} max={100} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-black text-yellow-600 shadow-inner outline-none focus:ring-1 focus:ring-yellow-400" /></div>
              </div>
              <button type="submit" className="w-full bg-slate-950 text-white font-bold px-4 py-3.5 rounded-xl mt-4 hover:bg-slate-800 transition-all hover:shadow-lg active:scale-[0.98]">Lock & Deploy to All Worksheets</button>
          </form>

          {/* Admin Feed */}
          <div className="w-full lg:w-1/2 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 px-1">Active Global Directives</h3>
            {adminDirectives.map((d, i) => (
              <div key={i} className="bg-white border-l-4 border-l-blue-500 border-t border-r border-b border-slate-200 p-5 rounded-r-xl shadow-sm">
                 <div className="flex justify-between items-start">
                   <div>
                     <span className="text-[10px] font-black uppercase text-blue-500 tracking-wider bg-blue-50 px-2 py-0.5 rounded">{d.thrustArea}</span>
                     <h4 className="font-black text-slate-800 text-base mt-2">{d.title}</h4>
                   </div>
                   <div className="bg-slate-100 rounded text-center px-3 py-1 border border-slate-200">
                     <span className="block text-[10px] font-bold text-slate-500 uppercase">Weight</span>
                     <span className="block text-sm font-black text-slate-900">{d.weight}%</span>
                   </div>
                 </div>
                 <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500">
                    <CheckCircle size={14} className="text-emerald-500"/> Successfully deployed to All Departments
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default GoalSheet;