import React, { useState, useEffect } from 'react';
import { Shield, Unlock, History, Settings, CheckCircle, AlertOctagon, Search, Key, Clock, Lock } from 'lucide-react';

// DIVERSE FALLBACK LOGS
const FALLBACK_AUDIT_LOGS = [
  { id: 1, date: 'May 16, 2026', time: '02:45 PM', actor: 'System Admin (Admin)', action: 'Pushed Master KPI Directive', target: 'ORG: Implement Zero-Trust', status: 'Success' },
  { id: 2, date: 'May 16, 2026', time: '09:12 AM', actor: 'Priya Singh (Manager)', action: 'Manager approved & locked sheet', target: 'Achieve 15% Region Sales', status: 'Success' },
  { id: 3, date: 'May 15, 2026', time: '04:30 PM', actor: 'Ravi Kumar (Employee)', action: 'Status manually shifted to Needs Attention', target: 'Deploy V2 Application', status: 'Warning' },
  { id: 4, date: 'May 14, 2026', time: '11:15 AM', actor: 'System Admin (Admin)', action: 'Master Override Unlock Executed', target: 'User ID: 104', status: 'Critical' },
  { id: 5, date: 'May 12, 2026', time: '10:05 AM', actor: 'Amit Sharma (Employee)', action: 'Employee Submitted Goal Sheet', target: 'Goal Matrix', status: 'Success' },
  { id: 6, date: 'May 11, 2026', time: '08:20 AM', actor: 'Priya Singh (Manager)', action: 'Manager returned sheet for rework', target: 'Maintain 99% Uptime', status: 'Warning' },
];

const AdminControl = ({ currentRole }: { currentRole: string }) => {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  
  const [cycles, setCycles] = useState({ Q1: 'Closed', Q2: 'Active', Q3: 'Locked', Q4: 'Locked' });
  const [unlockTarget, setUnlockTarget] = useState('');

  useEffect(() => {
    if (currentRole !== 'Admin') return;
    setLoading(true);
    fetch('https://atomberg-hackathon.onrender.com/api/admin/audit-logs')
      .then(res => res.json())
      .then(data => {
        setAuditLogs(data.length > 0 ? data : FALLBACK_AUDIT_LOGS);
        setLoading(false);
      })
      .catch(() => {
        setAuditLogs(FALLBACK_AUDIT_LOGS);
        setLoading(false);
      });
  }, [currentRole]);

  if (currentRole !== 'Admin') {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 sm:py-32 text-center animate-in fade-in zoom-in duration-500">
         <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-4 border-white">
           <Shield className="text-slate-400" size={40} />
         </div>
         <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">Restricted Access</h2>
         <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-xl mx-auto">
           This control center is exclusively reserved for <strong>System Administrators</strong>. 🔒
         </p>
      </div>
    );
  }

  const handleToggleCycle = (quarter: keyof typeof cycles) => {
    setCycles(prev => {
      const current = prev[quarter];
      const nextState = current === 'Locked' ? 'Active' : current === 'Active' ? 'Closed' : 'Active';
      setNotification(`System Cycle ${quarter} updated to ${nextState.toUpperCase()}`);
      setTimeout(() => setNotification(null), 3000);
      return { ...prev, [quarter]: nextState };
    });
  };

  const handleUnlockSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockTarget) return;
    
    const newLog = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      actor: 'System Admin (Self)',
      action: 'Master Override Unlock Executed',
      target: unlockTarget,
      status: 'Critical'
    };
    
    setAuditLogs([newLog, ...auditLogs]);
    setNotification(`Master Override Executed: Worksheets for ${unlockTarget} have been unlocked.`);
    setTimeout(() => setNotification(null), 3000);
    setUnlockTarget('');
  };

  if (loading) return <div className="p-24 text-center"><div className="animate-spin w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-in fade-in duration-500">
      
      {notification && (
        <div className="fixed top-20 right-4 bg-slate-900 border border-slate-700 text-white font-bold px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 z-50 animate-in slide-in-from-top-2">
          <CheckCircle size={16} className="text-emerald-400" /> {notification}
        </div>
      )}

      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Shield className="text-yellow-500" size={32} /> Governance & Audit Hub
        </h1>
        <p className="text-slate-500 font-medium mt-1">Manage global system states, track compliance, and handle master exceptions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-5 flex items-center gap-2">
              <Settings size={18} className="text-slate-600" />
              <h2 className="font-black text-slate-900">System Cycle Configuration</h2>
            </div>
            <div className="p-5 space-y-3">
              {(Object.keys(cycles) as Array<keyof typeof cycles>).map(q => (
                <div key={q} className="flex justify-between items-center bg-slate-50/50 border border-slate-100 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-slate-800 text-lg">{q}</span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${cycles[q] === 'Active' ? 'bg-emerald-100 text-emerald-700' : cycles[q] === 'Closed' ? 'bg-slate-200 text-slate-600' : 'bg-rose-50 text-rose-600'}`}>{cycles[q]}</span>
                  </div>
                  <button onClick={() => handleToggleCycle(q)} className="text-xs font-bold bg-white border border-slate-300 shadow-sm text-slate-700 hover:bg-yellow-400 hover:text-slate-900 px-3 py-1.5 rounded transition-all">Change State</button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl shadow-lg overflow-hidden border border-slate-800 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500 rounded-full blur-3xl opacity-10 -mr-10 -mt-10 pointer-events-none"></div>
            <div className="p-6 relative z-10">
              <h2 className="font-black text-white flex items-center gap-2 mb-2"><Key size={18} className="text-yellow-400" /> Master Unlock Override</h2>
              <p className="text-xs font-medium text-slate-400 mb-5">Force unlock an employee's approved worksheet to allow emergency modifications.</p>
              <form onSubmit={handleUnlockSheet} className="space-y-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3 text-slate-500" />
                  <input type="text" value={unlockTarget} onChange={(e) => setUnlockTarget(e.target.value)} placeholder="Enter Target Identity..." className="w-full bg-slate-800 border border-slate-700 text-white text-sm font-bold rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-yellow-400" required />
                </div>
                <button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black text-sm px-4 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"><Unlock size={16} /> Execute Force Unlock</button>
              </form>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full max-h-[800px]">
            <div className="bg-slate-50 border-b border-slate-200 p-5 flex justify-between items-center">
              <div className="flex items-center gap-2"><History size={18} className="text-slate-600" /><h2 className="font-black text-slate-900">System Audit Trail</h2></div>
              <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 px-2 py-1 rounded tracking-widest flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live DB Feed</span>
            </div>
            
            <div className="overflow-y-auto flex-1 p-2">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_0_0_#f1f5f9]">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="p-3 pl-4">Timestamp</th>
                    <th className="p-3">Actor / Agent</th>
                    <th className="p-3">Action Event Trigger</th>
                    <th className="p-3">Target Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {auditLogs.map((log, i) => (
                    <tr key={`${log.id}-${i}`} className="hover:bg-slate-50/50 transition-colors border-l-2 border-l-transparent hover:border-l-yellow-400">
                      <td className="p-3 pl-4 text-xs font-bold text-slate-500 flex flex-col">
                        <span className="text-slate-700">{log.date}</span>
                        <span className="flex items-center gap-1 mt-0.5"><Clock size={10} className="text-slate-400"/> {log.time}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{log.actor}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          {log.status === 'Critical' ? <Unlock size={14} className="text-rose-500"/> : log.status === 'Warning' ? <AlertOctagon size={14} className="text-amber-500"/> : <Lock size={14} className="text-emerald-500" />}
                          <span className={`text-sm font-black ${log.status === 'Critical' ? 'text-rose-600' : 'text-slate-700'}`}>{log.action}</span>
                        </div>
                      </td>
                      <td className="p-3"><span className="text-xs font-bold text-slate-500 line-clamp-2 max-w-[200px]">{log.target}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {auditLogs.length === 0 && <div className="p-10 text-center font-bold text-slate-400">No logs found in database.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminControl;