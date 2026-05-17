import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Bell, AlertTriangle, UserCheck, ShieldAlert, Target, Plus, TrendingUp, Clock, Zap, Megaphone, Lightbulb, Award } from 'lucide-react';
import heroBg from '../assets/hero-banner.png'; 

// --- DYNAMIC ROLE DATA ---
const EMPLOYEE_GOALS = [
  { id: 1, title: "Expand B2B Distribution Network", progress: 40, status: "On Track", weight: 30 },
  { id: 2, title: "Complete Advanced Leadership Training", progress: 100, status: "Completed", weight: 20 },
  { id: 3, title: "Reduce Assembly Line TAT by 2%", progress: 10, status: "Needs Attention", weight: 50 },
];

const MANAGER_GOALS = [
  { id: 101, title: "Team: Achieve 15% Western Region Sales Growth", progress: 85, status: "On Track", weight: 50 },
  { id: 102, title: "Team: Cross-train 5 engineers on React", progress: 20, status: "Needs Attention", weight: 20 },
  { id: 103, title: "Team: Maintain 99.9% Server Uptime", progress: 100, status: "Completed", weight: 30 },
];

const ADMIN_GOALS = [
  { id: 201, title: "ORG: Increase Company Revenue by 20% YoY", progress: 65, status: "On Track", weight: 40 },
  { id: 202, title: "ORG: Reduce Cloud Infrastructure Costs by 10%", progress: 5, status: "Needs Attention", weight: 30 },
  { id: 203, title: "ORG: Launch New Smart Home App", progress: 95, status: "On Track", weight: 30 },
];

const Dashboard = ({ currentRole }: { currentRole: string }) => {
  // Select the correct data based on the dropdown
  const currentGoalsList = currentRole === 'Employee' ? EMPLOYEE_GOALS : currentRole === 'Manager' ? MANAGER_GOALS : ADMIN_GOALS;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Hero Banner */}
      <Link to="/goals" className="block rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white hover:shadow-md hover:border-yellow-400 transition-all cursor-pointer group relative">
        <img src={heroBg} alt="Welcome" className="w-full h-auto object-cover block" />
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center">
           <span className="opacity-0 group-hover:opacity-100 bg-slate-900 text-white px-6 py-2 rounded-full font-bold shadow-lg transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">
             Go to Goal Sheet &rarr;
           </span>
        </div>
      </Link>

      {/* KPI Bar */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex items-center gap-4 hover:border-yellow-400 transition-colors">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><Target size={24}/></div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Active Goals</p>
            <p className="text-2xl font-black text-slate-900">{currentGoalsList.length}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex items-center gap-4 hover:border-yellow-400 transition-colors">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center"><TrendingUp size={24}/></div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Avg. Progress</p>
            <p className="text-2xl font-black text-slate-900">
              {Math.round(currentGoalsList.reduce((acc, curr) => acc + curr.progress, 0) / currentGoalsList.length)}%
            </p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex items-center gap-4 hover:border-yellow-400 transition-colors">
          <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center"><Clock size={24}/></div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Days to Check-in</p>
            <p className="text-2xl font-black text-slate-900">5 Days</p>
          </div>
        </div>
      </section>
      
      {/* BALANCED GRID SYSTEM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        
        <section className="col-span-2 flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <BarChart2 size={20} className="text-yellow-500" /> The Atomberg Pulse
          </h3>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col p-2">
             <div className="flex items-start gap-4 p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors rounded-t-lg">
               <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Megaphone size={18} /></div>
               <div>
                 <p className="font-bold text-slate-800 text-base">Leadership Update</p>
                 <p className="text-slate-500 text-sm mt-1">Town Hall Recap: Celebrating 1 Million Smart Fans sold globally! Watch the VOD on the portal.</p>
               </div>
             </div>
             <div className="flex items-start gap-4 p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
               <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><Lightbulb size={18} /></div>
               <div>
                 <p className="font-bold text-slate-800 text-base">Innovation Spotlight</p>
                 <p className="text-slate-500 text-sm mt-1">See how the R&D team is tackling next-gen energy efficiency with the new BLDC motor architecture.</p>
               </div>
             </div>
             <div className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors rounded-b-lg">
               <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0"><Award size={18} /></div>
               <div>
                 <p className="font-bold text-slate-800 text-base">Core Values Shoutout</p>
                 <p className="text-slate-500 text-sm mt-1">Massive kudos to the Western Sales Team for exemplifying Customer Obsession this quarter.</p>
               </div>
             </div>
          </div>
        </section>

        {/* Quick Actions - Height matches Pulse */}
        <section className="flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Zap size={20} className="text-yellow-500" /> Quick Actions
          </h3>
          <div className="flex-1 flex flex-col">
            {currentRole === 'Employee' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-sm flex-1 flex flex-col justify-center">
                <AlertTriangle size={28} className="text-yellow-600 mb-4" />
                <h4 className="font-bold text-slate-900 text-lg mb-2">Q1 Check-in Due</h4>
                <p className="text-sm text-slate-700 mb-6 leading-relaxed">Your quarterly performance review window closes in exactly 5 days. Ensure your targets are updated.</p>
                <Link to="/check-ins" className="text-sm font-bold text-slate-900 hover:text-white bg-yellow-400 hover:bg-yellow-500 px-4 py-3 rounded-lg text-center transition-colors shadow-sm">
                  Update Progress &rarr;
                </Link>
              </div>
            )}
            {currentRole === 'Manager' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm flex-1 flex flex-col justify-center">
                <UserCheck size={28} className="text-red-600 mb-4" />
                <h4 className="font-bold text-slate-900 text-lg mb-2">Approvals Pending</h4>
                <p className="text-sm text-slate-700 mb-6 leading-relaxed">You have 2 team members waiting for their Q2 goal sheets to be reviewed and approved.</p>
                <Link to="/goals" className="text-sm font-bold text-white hover:text-white bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg text-center transition-colors shadow-sm">
                  Review Queue &rarr;
                </Link>
              </div>
            )}
            {currentRole === 'Admin' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm flex-1 flex flex-col justify-center">
                <ShieldAlert size={28} className="text-blue-600 mb-4" />
                <h4 className="font-bold text-slate-900 text-lg mb-2">Compliance Alert</h4>
                <p className="text-sm text-slate-700 mb-6 leading-relaxed">12% of the organization has not submitted their goals. Send an automated reminder.</p>
                <button className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg w-full transition-colors shadow-sm">
                  Send Escalation &rarr;
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Dynamic Goals Overview Widget */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Target size={20} className="text-yellow-500"/> 
            {currentRole === 'Employee' ? 'My Current Goals' : currentRole === 'Manager' ? 'Team Target Overview' : 'Organizational KPIs'}
          </h3>
          {currentRole === 'Employee' && (
            <Link to="/goals" className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm">
              <Plus size={16} /> Manage Goals
            </Link>
          )}
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {currentGoalsList.map((goal) => (
            <div key={goal.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-slate-100 hover:bg-slate-50 transition-colors gap-6">
              <div className="flex-1">
                <span className="font-bold text-slate-800 block text-lg">{goal.title}</span>
                <span className="text-sm text-slate-500 mt-1 font-medium">Weightage: {goal.weight}%</span>
              </div>
              
              <div className="w-full sm:w-1/3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-600">Progress Tracking</span>
                  <span className="font-bold text-slate-900">{goal.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${goal.progress === 100 ? 'bg-green-500' : goal.progress < 25 ? 'bg-red-400' : 'bg-yellow-400'}`} style={{ width: `${goal.progress}%` }}></div>
                </div>
              </div>

              <div className="w-full sm:w-1/4 flex justify-end items-center">
                 <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                   goal.status === 'Needs Attention' ? 'bg-red-50 text-red-700 border border-red-200' : 
                   goal.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-50 text-slate-700 border border-slate-200'
                 }`}>
                   {goal.status}
                 </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;