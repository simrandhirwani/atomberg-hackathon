import React, { useState, useEffect } from 'react';
import { Filter, FileText, Download, MessageSquare, CheckCircle, AlertCircle, Clock, PieChart, BarChart3, Check, HeartHandshake } from 'lucide-react';

// ==========================================
// TYPESCRIPT INTERFACES & FALLBACK DATA
// ==========================================
interface Goal {
  id: number;
  thrustArea: string;
  title: string;
  target: number;
  uom: string;
  weight: number;
  q1_actual: number;
  q2_actual: number;
  status?: string;
  employeeName?: string;
}


const FALLBACK_MANAGER: Goal[] = [
  { id: 101, thrustArea: 'Growth', title: 'Team: Maximize Strategic Client Growth', target: 15, uom: 'Min (Higher is Better)', weight: 20, q1_actual: 16, q2_actual: 8, status: 'Locked', employeeName: 'Amit Sharma' },
  { id: 102, thrustArea: 'Operational Excellence', title: 'Team: Clear Backlog Ticket Queue', target: 100, uom: 'Min (Higher is Better)', weight: 20, q1_actual: 60, q2_actual: 85, status: 'Pending Approval', employeeName: 'Ravi Kumar' },
  { id: 103, thrustArea: 'Innovation', title: 'Team: Deploy Internal Utilities', target: 5, uom: 'Min (Higher is Better)', weight: 20, q1_actual: 3, q2_actual: 5, status: 'Needs Revision', employeeName: 'Sneha Patel' },
  { id: 104, thrustArea: 'People & Culture', title: 'Team: Conclude Bootcamps', target: 100, uom: 'Min (Higher is Better)', weight: 20, q1_actual: 100, q2_actual: 100, status: 'Locked', employeeName: 'Vikram Singh' },
  { id: 105, thrustArea: 'Innovation', title: 'Team: Deploy V2 Application Interface', target: 20261231, uom: 'Timeline', weight: 20, q1_actual: 20261115, q2_actual: 0, status: 'Completed', employeeName: 'Neha Gupta' }
];

const FALLBACK_ADMIN: Goal[] = [
  { id: 201, thrustArea: 'Innovation', title: 'ORG: Mandate AI Security Standards', target: 100, uom: 'Min (Higher is Better)', weight: 30, q1_actual: 100, q2_actual: 100, status: 'Completed', employeeName: 'System Directive' },
  { id: 202, thrustArea: 'Operational Excellence', title: 'ORG: Implement Zero-Trust Network', target: 100, uom: 'Min (Higher is Better)', weight: 20, q1_actual: 40, q2_actual: 75, status: 'Needs Attention', employeeName: 'System Directive' },
  { id: 203, thrustArea: 'People & Culture', title: 'ORG: Drive Upskilling Metrics', target: 80, uom: 'Min (Higher is Better)', weight: 20, q1_actual: 50, q2_actual: 80, status: 'On Track', employeeName: 'System Directive' },
  { id: 204, thrustArea: 'Growth', title: 'ORG: Launch Global Platform V3', target: 20260930, uom: 'Timeline', weight: 15, q1_actual: 20260910, q2_actual: 0, status: 'Completed', employeeName: 'System Directive' },
  { id: 205, thrustArea: 'Operational Excellence', title: 'ORG: Enforce Data Governance', target: 100, uom: 'Min (Higher is Better)', weight: 15, q1_actual: 10, q2_actual: 50, status: 'Not Started', employeeName: 'System Directive' }
];

const CheckIns = ({ currentRole }: { currentRole: string }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dashboard Filters
  const [cycle, setCycle] = useState('Q1');
  const [thrustArea, setThrustArea] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Interactive States
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [saveNotifier, setSaveNotifier] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // ==========================================
  // DATA PIPELINE (With Role Access Guards)
  // ==========================================
  useEffect(() => {
    if (currentRole === 'Employee') {
      setLoading(false);
      return;
    }

    setLoading(true);
    setStatusFilter('All'); 
    
    const fetchUrl = currentRole === 'Manager' 
      ? 'http://localhost:8000/api/manager/team'
      : 'http://localhost:8000/api/admin/shared-goals';

    fetch(fetchUrl)
      .then(res => res.json())
      .then(data => {
        let flattenedGoals: Goal[] = [];
        
        if (!data || data.length === 0) throw new Error("Empty Database");

        if (currentRole === 'Manager') {
          data.forEach((member: any) => member.goals.forEach((g: any) => flattenedGoals.push({ ...g, employeeName: member.employee })));
        } else {
          flattenedGoals = data.map((g: any) => ({ ...g, employeeName: 'System Directive' }));
        }
        setGoals(flattenedGoals);
        setLoading(false);
      })
      .catch(() => {
        console.warn("Using Offline Demo Data");
        if (currentRole === 'Manager') setGoals(FALLBACK_MANAGER);
        else setGoals(FALLBACK_ADMIN);
        setLoading(false);
      });
  }, [currentRole]);

  // ==========================================
  // EMPLOYEE RESTRICTED ACCESS SCREEN
  // ==========================================
  if (currentRole === 'Employee') {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 sm:py-32 text-center animate-in fade-in zoom-in duration-500">
         <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-4 border-white">
           <HeartHandshake className="text-yellow-500" size={40} />
         </div>
         <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">You're doing amazing! ✨</h2>
         <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-xl mx-auto">
           This specific achievement analytics dashboard is securely reserved for <strong>Managers</strong> and <strong>HR Administrators</strong> to conduct quarterly organization reviews.<br/><br/>
           Don't worry though! You can log your actuals, update statuses, and view all your personal progress directly from your <strong>Goal Sheet</strong> tab. Keep up the great work! 🚀
         </p>
      </div>
    );
  }

  // ==========================================
  // TIMELINE PARSERS & BRD FORMULAS
  // ==========================================
  // Formats an integer like 20261231 to 'Dec 31, 2026'
  const formatDateDisplay = (intVal: number) => {
    if (!intVal || intVal === 0) return 'Not Set';
    const s = String(intVal);
    if (s.length !== 8) return s;
    const year = s.slice(0,4);
    const month = parseInt(s.slice(4,6), 10) - 1;
    const day = s.slice(6,8);
    const date = new Date(Number(year), month, Number(day));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const computeScore = (uom: string, target: number, actual: number) => {
    if (!target && target !== 0) return 0;
    if (actual === undefined || actual === null || (actual === 0 && uom !== "Zero-Based")) return 0;
    
    if (uom === "Timeline") {
      return actual <= target ? 100 : 0; 
    }

    let score = 0;
    if (uom.includes("Min") || uom === "%" || uom === "Numeric") {
      score = Math.round((actual / target) * 100);
    } else if (uom.includes("Max")) {
      score = Math.round((target / actual) * 100);
    } else if (uom === "Zero-Based") {
      score = actual === 0 ? 100 : 0;
    } else {
      score = Math.round((actual / target) * 100);
    }
    return Math.min(120, isNaN(score) || !isFinite(score) ? 0 : score);
  };

  const handleStatusChange = async (goalId: number, newStatus: string) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, status: newStatus } : g));
    try {
      await fetch(`http://localhost:8000/api/goals/${goalId}/status`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus })
      });
      setNotification(`Status saved: ${newStatus}`);
      setTimeout(() => setNotification(null), 2500);
    } catch (e) {
      setNotification("Status updated locally (Offline Demo Mode).");
      setTimeout(() => setNotification(null), 2500);
    }
  };

  // ==========================================
  // EXPORTS (CSV & PDF)
  // ==========================================
  const handleCSVExport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Owner,Thrust Area,Goal Title,Target,Actual,UoM,Weight,System Score,Status\n";
    
    filteredGoals.forEach(g => {
      const actual = cycle === 'Q1' ? (g.q1_actual || 0) : (g.q2_actual || 0);
      const score = computeScore(g.uom, g.target, actual);
      const status = g.status || 'Not Started';
      
      const displayTarget = g.uom === 'Timeline' ? formatDateDisplay(g.target) : g.target;
      const displayActual = g.uom === 'Timeline' ? formatDateDisplay(actual) : actual;

      csvContent += `"${g.employeeName}","${g.thrustArea}","${g.title}","${displayTarget}","${displayActual}","${g.uom}",${g.weight}%,${score}%,${status}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Atomberg_Achievement_Report_${cycle}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleVisualExport = () => {
    const win = window.open('', '_blank');
    if (!win) {
      setNotification("Please allow popups to generate the report.");
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    let tableRows = '';
    filteredGoals.forEach(g => {
      const actual = cycle === 'Q1' ? (g.q1_actual || 0) : (g.q2_actual || 0);
      const score = computeScore(g.uom, g.target, actual);
      const statusClass = g.status?.replace(' ', '-') || 'Not-Started';
      
      const displayTarget = g.uom === 'Timeline' ? formatDateDisplay(g.target) : g.target;
      const displayActual = g.uom === 'Timeline' ? formatDateDisplay(actual) : actual;

      tableRows += `
        <tr>
          <td><strong>${g.employeeName}</strong></td>
          <td>${g.title}</td>
          <td>${displayTarget}</td>
          <td>${displayActual}</td>
          <td>
            <div class="bar-wrap"><div class="bar" style="width: ${Math.min(100, score)}%"></div></div>
            <span style="font-size:10px; font-weight:bold; color:#64748b;">${score}%</span>
          </td>
          <td><span class="badge ${statusClass}">${g.status || 'Not Started'}</span></td>
        </tr>
      `;
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Atomberg Executive Report - ${currentRole}</title>
        <style>
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; padding: 40px; }
          .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
          .flex { display: flex; justify-content: space-between; gap: 20px;}
          .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; flex: 1; text-align: center; background: #f8fafc;}
          .card h3 { margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #64748b; }
          .card p { margin: 0; font-size: 36px; font-weight: 900; }
          .bar-wrap { background: #e2e8f0; height: 8px; border-radius: 10px; overflow: hidden; width: 100%; margin-bottom: 4px; }
          .bar { background: #10b981; height: 100%; }
          table { width: 100%; border-collapse: collapse; margin-top: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          th, td { padding: 14px; border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 14px; }
          th { background: #f1f5f9; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; }
          .badge { padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: bold; display: inline-block;}
          .Completed, .Locked { background: #d1fae5; color: #047857; border: 1px solid #34d399; }
          .On-Track, .Pending-Approval { background: #fef3c7; color: #b45309; border: 1px solid #fbbf24; }
          .Needs-Attention, .Needs-Revision { background: #ffe4e6; color: #be123c; border: 1px solid #fda4af; }
          .Not-Started { background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="display: flex; align-items: center; margin-bottom: 15px;">
            <div style="background-color: #facc15; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 22px; color: #0f172a; margin-right: 12px;">A</div>
            <span style="font-size: 28px; font-weight: 900; color: #0f172a; letter-spacing: -1px;">atomberg</span>
          </div>
          <h1 style="margin:0; font-size: 28px;">Goal Performance & Analytics Report</h1>
          <p style="margin:5px 0 0; font-weight: bold;">Persona View: <span style="color:#eab308;">${currentRole}</span> | Cycle Filter: ${cycle} | Date: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="flex">
          <div class="card"><h3>Total Indexed Goals</h3><p>${totalGoals}</p></div>
          <div class="card"><h3>${currentRole === 'Manager' ? 'Approval Rate' : 'Completion Rate'}</h3><p>${completionPercentage}%</p></div>
          <div class="card"><h3>System Avg Score</h3><p>${avgScore}%</p></div>
        </div>

        <table>
          <thead>
            <tr><th>Owner</th><th>Objective Title</th><th>Target</th><th>Actual Logged</th><th>Progress Metric</th><th>Status</th></tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
        
        <div style="margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center;">
          Confidential & Proprietary - Generated by Atomberg Goal System
        </div>
        <script>
          setTimeout(() => { window.print(); }, 500);
        </script>
      </body>
      </html>
    `;
    win.document.write(html);
    win.document.close();
  };

  const handleSaveFeedback = () => {
    setSaveNotifier(true);
    setTimeout(() => {
      setFeedbackModalOpen(false);
      setFeedbackText('');
      setSaveNotifier(false);
    }, 1500);
  };

  // ==========================================
  // ANALYTICS & FILTERING
  // ==========================================
  const filteredGoals = goals.filter(g => {
    const currentStatus = g.status || 'Not Started';
    if (thrustArea !== 'All' && !g.thrustArea.includes(thrustArea)) return false;
    if (statusFilter !== 'All' && currentStatus !== statusFilter) return false;
    return true;
  });

  const totalGoals = filteredGoals.length;
  let completedGoals = 0;
  let totalScoreSum = 0;

  filteredGoals.forEach(g => {
    const actual = cycle === 'Q1' ? (g.q1_actual || 0) : (g.q2_actual || 0);
    const score = computeScore(g.uom, g.target, actual);
    const currentStatus = g.status || 'Not Started';
    
    if (currentStatus === 'Completed' || currentStatus === 'Locked') completedGoals++;
    totalScoreSum += score;
  });

  const completionPercentage = totalGoals === 0 ? 0 : Math.round((completedGoals / totalGoals) * 100);
  const avgScore = totalGoals === 0 ? 0 : Math.round(totalScoreSum / totalGoals);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
        <div className="animate-spin w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full"></div>
        <p className="text-slate-500 font-bold">Aggregating live matrices from Supabase...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-in fade-in duration-500">
      
      {notification && (
        <div className="fixed top-20 right-4 bg-slate-900 border border-slate-700 text-white font-bold px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 z-50 animate-in slide-in-from-top-2">
          <CheckCircle size={16} className="text-emerald-400" /> {notification}
        </div>
      )}

      {/* HEADER & FILTERS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Achievement Analytics</h1>
          <p className="text-slate-500 font-medium mt-1">Live execution tracking linked directly to system targets.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm flex-1 sm:flex-none hover:border-yellow-400 transition-colors">
            <Filter size={16} className="text-slate-400 mr-2 shrink-0" />
            <select value={cycle} onChange={e => setCycle(e.target.value)} className="bg-transparent text-sm font-bold text-slate-700 outline-none pr-4 w-full cursor-pointer">
              <option value="Q1">View Cycle: Q1 History</option>
              <option value="Q2">View Cycle: Q2 Active</option>
            </select>
          </div>
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm flex-1 sm:flex-none hover:border-yellow-400 transition-colors">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer">
              <option value="All">All Status</option>
              {currentRole === 'Manager' ? (
                <>
                  <option value="Locked">Locked</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Needs Revision">Needs Revision</option>
                </>
              ) : (
                <>
                  <option value="Completed">Completed</option>
                  <option value="On Track">On Track</option>
                  <option value="Needs Attention">Needs Attention</option>
                  <option value="Not Started">Not Started</option>
                </>
              )}
            </select>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto mt-2 lg:mt-0">
            <button onClick={handleCSVExport} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm px-4 py-2.5 rounded-lg shadow-sm transition-all active:scale-95">
              <Download size={16} /> CSV Export
            </button>
            <button onClick={handleVisualExport} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-4 py-2.5 rounded-lg shadow-md transition-all active:scale-95">
              <FileText size={16} /> PDF Report
            </button>
          </div>
        </div>
      </div>

      {/* ANALYTICS CHARTS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-yellow-400 transition-colors group">
             <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-yellow-600 transition-colors">Indexed Goals</p><p className="text-3xl font-black text-slate-900 mt-1">{totalGoals}</p></div>
             <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-yellow-50 group-hover:text-yellow-600 transition-colors"><BarChart3 size={24}/></div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-yellow-400 transition-colors group">
             <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-yellow-600 transition-colors">System Avg Score</p><p className="text-3xl font-black text-slate-900 mt-1">{avgScore}%</p></div>
             <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600"><PieChart size={24}/></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center sm:col-span-1 hover:border-yellow-400 transition-colors">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-4 w-full text-left">
            {currentRole === 'Manager' ? 'Approval Dashboard' : 'Completion Dashboard'}
          </h3>
          <div className="flex flex-col xl:flex-row items-center gap-6 w-full justify-center">
            <div className="relative w-28 h-28 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-emerald-500 transition-all duration-1000 ease-out" strokeDasharray={`${completionPercentage}, 100`} strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-xl font-black text-slate-900">{completionPercentage}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700"><span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span> {currentRole === 'Manager' ? 'Locked' : 'Completed'} ({completedGoals})</div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700"><span className="w-3 h-3 rounded-full bg-slate-200 shrink-0"></span> Pending ({totalGoals - completedGoals})</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sm:col-span-2 md:col-span-1 flex flex-col hover:border-yellow-400 transition-colors">
           <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6">Area Distribution</h3>
           <div className="flex-1 flex items-end justify-between gap-2 px-2">
             {[{ label: 'Growth', h: '80%' }, { label: 'Innov.', h: '55%' }, { label: 'Ops', h: '95%' }, { label: 'People', h: '40%' }].map(bar => (
               <div key={bar.label} className="flex flex-col items-center gap-2 w-full group">
                 <div className="w-full bg-slate-100 rounded-t-sm h-24 relative flex items-end">
                   <div className="w-full bg-emerald-500 rounded-t-sm transition-all duration-700 group-hover:bg-yellow-400" style={{ height: bar.h }}></div>
                 </div>
                 <span className="text-[10px] font-bold text-slate-500 uppercase">{bar.label}</span>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* DATA TABLE SECTION */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-black text-slate-900">Target Analytics & System Auto-Scoring</h2>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[900px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Owner</th>
                <th className="p-4 w-1/3">Goal Title</th>
                <th className="p-4">Target Plan</th>
                <th className="p-4">Actuals Logged</th>
                <th className="p-4">System Score</th>
                <th className="p-4">Track Status</th>
                <th className="p-4 pr-6 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGoals.map((g, idx) => {
                const actual = cycle === 'Q1' ? (g.q1_actual || 0) : (g.q2_actual || 0);
                const score = computeScore(g.uom, g.target, actual);
                const currentStatus = g.status || 'Not Started';
                
                return (
                  <tr key={`${g.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6 font-bold text-slate-900 whitespace-nowrap">{g.employeeName}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800 text-sm leading-snug">{g.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{g.thrustArea}</p>
                    </td>
                    <td className="p-4 font-bold text-slate-600 text-sm whitespace-nowrap">
                      {g.uom === 'Timeline' ? formatDateDisplay(g.target) : g.target}
                      {g.uom !== 'Timeline' && <span className="text-[10px] text-slate-400 uppercase ml-0.5">{g.uom.split(' ')[0]}</span>}
                    </td>
                    <td className="p-4 font-black text-slate-900 text-sm">
                      {g.uom === 'Timeline' ? formatDateDisplay(actual) : (actual || 0)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-black ${score >= 100 ? 'bg-emerald-100 text-emerald-700' : score >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-rose-100 text-rose-700'}`}>
                        {score}%
                      </span>
                    </td>
                    <td className="p-4">
                      {currentRole === 'Manager' ? (
                        <select 
                          value={currentStatus} 
                          onChange={(e) => handleStatusChange(g.id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-md px-2 py-1.5 outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 shadow-sm transition-all cursor-pointer"
                        >
                          <option value="Pending Approval">Pending Approval</option>
                          <option value="Needs Revision">Needs Revision</option>
                          <option value="Locked">Locked</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          {(currentStatus === 'Completed' || currentStatus === 'Locked') && <CheckCircle size={15} className="text-emerald-500" />}
                          {(currentStatus === 'On Track' || currentStatus === 'Pending Approval') && <Clock size={15} className="text-yellow-500" />}
                          {(currentStatus === 'Needs Attention' || currentStatus === 'Needs Revision') && <AlertCircle size={15} className="text-rose-500" />}
                          {currentStatus === 'Not Started' && <AlertCircle size={15} className="text-slate-400" />}
                          <span className="text-xs font-bold text-slate-700">{currentStatus}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button 
                        onClick={() => { setSelectedGoal(g); setFeedbackModalOpen(true); }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors bg-white hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap"
                      >
                        <MessageSquare size={14} /> Add Comment
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredGoals.length === 0 && (
            <div className="p-12 text-center text-slate-400 font-bold bg-slate-50 border-t border-slate-100">
              No performance records found matching the active filter parameters.
            </div>
          )}
        </div>
      </div>

      {/* FEEDBACK MODAL */}
      {feedbackModalOpen && selectedGoal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl w-full max-w-lg space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><MessageSquare className="text-yellow-500"/> Manager Check-in Notes</h3>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Target Evaluation Context</p>
              <p className="text-sm font-bold text-slate-800 leading-tight">{selectedGoal.title}</p>
              <div className="flex gap-4 mt-3 pt-3 border-t border-slate-200/60">
                 <p className="text-xs font-bold text-slate-500">Plan: <span className="text-slate-900">{selectedGoal.uom === 'Timeline' ? formatDateDisplay(selectedGoal.target) : selectedGoal.target}</span></p>
                 <p className="text-xs font-bold text-slate-500">Actual: <span className="text-slate-900">{selectedGoal.uom === 'Timeline' ? formatDateDisplay(cycle === 'Q1' ? selectedGoal.q1_actual : selectedGoal.q2_actual) : (cycle === 'Q1' ? selectedGoal.q1_actual : selectedGoal.q2_actual)}</span></p>
                 <p className="text-xs font-bold text-slate-500">Score: <span className="text-yellow-600">{computeScore(selectedGoal.uom, selectedGoal.target, cycle === 'Q1' ? selectedGoal.q1_actual : selectedGoal.q2_actual)}%</span></p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Document Discussion Log</label>
              <textarea 
                value={feedbackText} 
                onChange={(e) => setFeedbackText(e.target.value)} 
                rows={4} 
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-400 shadow-inner resize-none"
                placeholder="Type your formal review notes here for the audit trail..."
              ></textarea>
            </div>
            
            <div className="flex gap-2 justify-end pt-2">
              <button disabled={saveNotifier} onClick={() => setFeedbackModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
              <button 
                onClick={handleSaveFeedback} 
                className={`text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all ${saveNotifier ? 'bg-emerald-500' : 'bg-slate-900 hover:bg-slate-800'}`}
              >
                {saveNotifier ? <><CheckCircle size={14}/> Saved Successfully</> : <><Check size={14}/> Save Log to Audit Trail</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckIns;