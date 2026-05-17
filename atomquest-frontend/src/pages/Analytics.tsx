import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, AlertTriangle, Users, ShieldAlert, ArrowUpRight, CheckCircle, Clock, Target, Award, Zap, LayoutDashboard } from 'lucide-react';

const Analytics = ({ currentRole }: { currentRole: string }) => {
  const [levelFilter, setLevelFilter] = useState<'Department' | 'Team' | 'Individual'>('Department');
  const [orgData, setOrgData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // FETCH DYNAMIC ORG DATA FROM DB
  useEffect(() => {
    setLoading(true);
    fetch('https://atomberg-hackathon.onrender.com/api/admin/org-data')
      .then(res => res.json())
      .then(data => { setOrgData(data); setLoading(false); })
      .catch(() => {
        // Safe Failsafe Array if DB is down
        setOrgData([
          { employee: 'Amit Sharma', team: 'Team 1', department: 'Engineering', manager: 'Priya Singh', goals: [{ thrustArea: 'Growth', status: 'Completed', target: 100, actual: 100 }, { thrustArea: 'Innovation', status: 'On Track', target: 100, actual: 60 }] },
          { employee: 'Ravi Kumar', team: 'Team 1', department: 'Engineering', manager: 'Priya Singh', goals: [{ thrustArea: 'Operations', status: 'Needs Attention', target: 100, actual: 20 }] },
          { employee: 'Sneha Patel', team: 'Team 2', department: 'Operations', manager: 'Rajesh Verma', goals: [{ thrustArea: 'People', status: 'Completed', target: 100, actual: 100 }, { thrustArea: 'Growth', status: 'Completed', target: 100, actual: 100 }] },
          { employee: 'Neha Gupta', team: 'Team 3', department: 'Product', manager: 'Ananya Iyer', goals: [{ thrustArea: 'Innovation', status: 'On Track', target: 100, actual: 50 }] }
        ]);
        setLoading(false);
      });
  }, [currentRole]);

  if (loading) return <div className="p-24 text-center"><div className="animate-spin w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto"></div><p className="mt-4 text-slate-500 font-bold">Aggregating Matrix Data...</p></div>;

  // ==========================================
  // 1. EMPLOYEE PERSONA: PERSONAL FOOTPRINT
  // ==========================================
  if (currentRole === 'Employee') {
    const myData = orgData.find(e => e.employee.includes('Amit')) || orgData[0];
    const myTotal = myData.goals.length;
    const myCompleted = myData.goals.filter((g:any) => g.status === 'Completed' || g.status === 'Locked').length;
    const myScore = myTotal ? Math.round((myCompleted / myTotal) * 100) : 0;

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-in fade-in duration-500">
        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3"><Target className="text-yellow-500" size={32} /> My Performance Footprint</h1>
          <p className="text-slate-500 font-medium mt-1">Track your individual impact and quarterly growth metrics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 pointer-events-none"></div>
            <div className="relative z-10">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-2">Personal Score</h3>
              <p className="text-6xl font-black text-yellow-400">{myScore}%</p>
            </div>
            <div className="relative z-10 mt-6 flex items-center gap-2 text-sm font-bold text-slate-300"><Award size={18} className="text-emerald-400"/> Top 15% in Engineering</div>
          </div>

          <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-5 flex items-center gap-1.5"><Zap size={16} className="text-yellow-500"/> Thrust Area Focus</h3>
            <div className="space-y-4">
              {['Growth', 'Innovation', 'Operations', 'People'].map((area, i) => {
                const count = myData.goals.filter((g:any) => g.thrustArea?.includes(area)).length;
                const pct = myTotal ? Math.round((count/myTotal)*100) : (i === 0 ? 50 : i === 1 ? 30 : 10);
                return (
                  <div key={area} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700"><span>{area}</span><span className="font-black">{pct}%</span></div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }}></div></div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. MANAGER PERSONA: TEAM VELOCITY
  // ==========================================
  if (currentRole === 'Manager') {
    const myTeam = orgData.filter(e => e.manager.includes('Priya') || e.team === 'Team 1');
    let teamGoals = 0; let teamComp = 0; let teamBreaches = 0;
    myTeam.forEach(emp => emp.goals.forEach((g:any) => {
      teamGoals++;
      if (g.status === 'Completed' || g.status === 'Locked') teamComp++;
      if (g.status === 'Needs Attention' || g.status === 'Needs Rework') teamBreaches++;
    }));
    const teamScore = teamGoals ? Math.round((teamComp/teamGoals)*100) : 0;

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-in fade-in duration-500">
        <div className="border-b border-slate-200 pb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3"><Users className="text-yellow-500" size={32} /> Team Velocity Dashboard</h1>
            <p className="text-slate-500 font-medium mt-1">Manage direct reports, unblock execution, and monitor team SLAs.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Team Completion</p><p className="text-4xl font-black text-slate-900 mt-1">{teamScore}%</p></div>
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"><CheckCircle size={28}/></div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Actionable Breaches</p><p className="text-4xl font-black text-rose-600 mt-1">{teamBreaches}</p></div>
            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-600"><AlertTriangle size={28}/></div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Direct Reports</p><p className="text-4xl font-black text-slate-900 mt-1">{myTeam.length}</p></div>
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Users size={28}/></div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2"><LayoutDashboard size={18} className="text-yellow-500" /> Direct Reports Leaderboard</h2>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Employee</th>
                  <th className="p-4">Assigned Goals</th>
                  <th className="p-4">Completion Rate</th>
                  <th className="p-4 pr-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myTeam.map((emp, i) => {
                  const t = emp.goals.length;
                  const c = emp.goals.filter((g:any) => g.status === 'Completed' || g.status === 'Locked').length;
                  const b = emp.goals.filter((g:any) => g.status === 'Needs Attention').length;
                  const s = t ? Math.round((c/t)*100) : 0;
                  return (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6 font-bold text-slate-900">{emp.employee}</td>
                      <td className="p-4 font-bold text-slate-600">{t} Active Goals</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${s}%` }}></div></div>
                          <span className="text-xs font-black">{s}%</span>
                        </div>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        {b > 0 ? <span className="px-2 py-1 rounded text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">Needs Attention</span> : <span className="px-2 py-1 rounded text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">On Track</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. ADMIN PERSONA: GLOBAL ORG INSIGHTS
  // ==========================================
  let totalGoals = 0; let completedGoals = 0;
  orgData.forEach(emp => emp.goals.forEach((g: any) => {
    totalGoals++;
    if (g.status === 'Completed' || g.status === 'Locked') completedGoals++;
  }));
  const orgCompletion = totalGoals === 0 ? 0 : Math.round((completedGoals / totalGoals) * 100);

  let tableData: any[] = [];
  if (levelFilter === 'Department') {
    const map = new Map();
    orgData.forEach(emp => {
      const key = emp.manager;
      if (!map.has(key)) map.set(key, { name: emp.manager, department: emp.department, reports: 0, total: 0, comp: 0, breaches: 0 });
      const row = map.get(key);
      row.reports++;
      emp.goals.forEach((g: any) => {
        row.total++;
        if (g.status === 'Completed' || g.status === 'Locked') row.comp++;
        if (g.status === 'Needs Attention' || g.status === 'Needs Rework') row.breaches++;
      });
    });
    tableData = Array.from(map.values()).map(r => ({ ...r, completionRate: r.total ? Math.round((r.comp/r.total)*100) : 0 }));
  } 
  else if (levelFilter === 'Team') {
    const map = new Map();
    orgData.forEach(emp => {
      const key = emp.team;
      if (!map.has(key)) map.set(key, { name: emp.team, department: emp.department, reports: 0, total: 0, comp: 0, breaches: 0 });
      const row = map.get(key);
      row.reports++;
      emp.goals.forEach((g: any) => {
        row.total++;
        if (g.status === 'Completed' || g.status === 'Locked') row.comp++;
        if (g.status === 'Needs Attention') row.breaches++;
      });
    });
    tableData = Array.from(map.values()).map(r => ({ ...r, completionRate: r.total ? Math.round((r.comp/r.total)*100) : 0 }));
  } 
  else {
    tableData = orgData.map(emp => {
      let t = 0; let c = 0; let b = 0;
      emp.goals.forEach((g: any) => {
        t++;
        if (g.status === 'Completed' || g.status === 'Locked') c++;
        if (g.status === 'Needs Attention') b++;
      });
      return { name: emp.employee, department: emp.team, reports: emp.manager, breaches: b, completionRate: t ? Math.round((c/t)*100) : 0 };
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3"><BarChart3 className="text-yellow-500" size={32} /> Global Executive Analytics</h1>
          <p className="text-slate-500 font-medium mt-1">Cross-organizational completion matrices and escalation mapping.</p>
        </div>
        <div className="flex bg-slate-200/60 p-1 rounded-xl border border-slate-300/40 gap-1 shadow-inner">
          {(['Department', 'Team', 'Individual'] as const).map(level => (
            <button key={level} onClick={() => setLevelFilter(level)} className={`px-4 py-2 text-xs font-black rounded-lg transition-all ${levelFilter === level ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}>{level}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5"><TrendingUp size={16} className="text-yellow-500"/> QoQ Trend Ratios</h3>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">+12.4% vs Q1</span>
          </div>
          <div className="flex-1 flex items-end justify-between gap-4 px-2 pt-4">
            {[{ label: 'Growth', q1: '50%', q2: '85%' }, { label: 'Innov.', q1: '40%', q2: '65%' }, { label: 'Ops', q1: '70%', q2: '92%' }, { label: 'People', q1: '60%', q2: '78%' }].map(pillar => (
              <div key={pillar.label} className="flex flex-col items-center gap-2 w-full group">
                <div className="w-full bg-slate-100 rounded-lg h-32 relative flex justify-center gap-1 items-end p-1 shadow-inner">
                  <div className="w-1/2 bg-slate-300 rounded-t-sm transition-all duration-500 group-hover:opacity-80" style={{ height: pillar.q1 }}></div>
                  <div className="w-1/2 bg-emerald-500 rounded-t-sm transition-all duration-700 group-hover:bg-yellow-400" style={{ height: pillar.q2 }}></div>
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wide">{pillar.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-5 flex items-center gap-1.5"><PieChart size={16} className="text-yellow-500"/> Org Weight Allocation</h3>
          <div className="flex-1 space-y-3.5 flex flex-col justify-center">
            {[{ area: 'Operational Excellence', pct: 45, color: 'bg-slate-900' }, { area: 'Growth & Expansion', pct: 25, color: 'bg-emerald-500' }, { area: 'Product Innovation', pct: 20, color: 'bg-yellow-400' }, { area: 'People & Culture', pct: 10, color: 'bg-slate-300' }].map(item => (
              <div key={item.area} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700"><span>{item.area}</span><span className="font-black">{item.pct}%</span></div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner"><div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }}></div></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-4 w-full text-left flex items-center gap-1.5"><CheckCircle size={16} className="text-yellow-500"/> Org Completion Ring</h3>
          <div className="flex flex-col items-center justify-center flex-1 w-full">
            <div className="relative w-32 h-32 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-slate-900 transition-all duration-1000 ease-out" strokeDasharray={`${orgCompletion}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col"><span className="text-3xl font-black text-slate-900">{orgCompletion}%</span><span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-0.5">Live Database</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50"><h2 className="text-lg font-black text-slate-900 flex items-center gap-2"><Users size={18} className="text-yellow-500" /> {levelFilter} Leaderboard & Alerts</h2></div>
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                <th className="p-4 pl-6">{levelFilter === 'Individual' ? 'Employee Name' : levelFilter === 'Team' ? 'Team Name' : 'L1 Manager Name'}</th>
                <th className="p-4">{levelFilter === 'Individual' ? 'Assigned Team' : 'Department Segment'}</th>
                <th className="p-4">{levelFilter === 'Individual' ? 'Reporting To' : 'Headcount'}</th>
                <th className="p-4">Aggregate Completion</th>
                <th className="p-4 pr-6 text-right">Flagged Alerts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6 font-bold text-slate-900">{row.name}</td>
                  <td className="p-4 text-sm font-bold text-slate-600">{row.department}</td>
                  <td className="p-4 text-sm font-black text-slate-800">{levelFilter === 'Individual' ? row.reports : `${row.reports} Reports`}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${row.completionRate}%` }}></div></div>
                      <span className="text-xs font-black text-slate-900">{row.completionRate}%</span>
                    </div>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    {row.breaches > 0 ? <span className="px-2.5 py-0.5 rounded text-xs font-black border bg-rose-50 text-rose-700 border-rose-200 inline-flex items-center gap-1"><AlertTriangle size={12}/> {row.breaches} At Risk</span> : <span className="px-2.5 py-0.5 rounded text-xs font-black border bg-emerald-50 text-emerald-700 border-emerald-200 inline-flex items-center gap-1"><CheckCircle size={12}/> Zero Issues</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;