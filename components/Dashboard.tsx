
import React from 'react';
import { AppSettings, Member, Cycle, PaymentRecord } from '../types';
import { Wallet, Users, Trophy, CalendarDays, ReceiptText, CheckCheck, TrendingUp, UserCheck } from 'lucide-react';

interface DashboardProps {
  settings: AppSettings;
  members: Member[];
  cycles: Cycle[];
  payments: PaymentRecord[];
  onViewReceipt: (member: Member, cycle: Cycle) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ settings, members, cycles, payments, onViewReceipt }) => {
  const currentCycle = cycles.length > 0 ? cycles[0] : null;
  const totalMembers = members.length;
  const winnersCount = members.filter(m => m.hasReceivedPot).length;
  const activeMembers = totalMembers - winnersCount;
  const completedCycles = cycles.filter(c => c.isCompleted).length;
  
  let multiplier = 1;
  if (settings.frequency === 'DAILY') multiplier = 30;
  if (settings.frequency === 'WEEKLY') multiplier = 4;

  const perPersonMonthly = settings.installmentAmount * multiplier;
  const totalPotValue = totalMembers * perPersonMonthly;

  const StatCard = ({ label, value, icon: Icon, color, subtext, gradient }: any) => (
    <div className={`bg-white p-5 rounded-[2rem] flex flex-col justify-between shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all`}>
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
          <p className="text-2xl font-black text-slate-800 tracking-tight">{value}</p>
        </div>
        <div className={`p-2.5 rounded-2xl ${color} bg-opacity-10 transition-transform group-hover:scale-110`}>
          <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
      {subtext && <p className="text-[10px] font-bold text-slate-400 mt-auto relative z-10">{subtext}</p>}
      <div className={`absolute -bottom-6 -right-6 w-20 h-20 ${color} opacity-[0.03] rounded-full blur-xl`}></div>
    </div>
  );

  return (
    <div className="pb-24 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200 mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest mb-3">Professional Committee Management</p>
          <h1 className="text-4xl font-black mb-6 tracking-tighter">{settings.committeeName}</h1>
          <div className="flex flex-wrap gap-3">
            <span className="bg-white/10 px-4 py-2 rounded-2xl text-xs font-black backdrop-blur-xl border border-white/10 flex items-center gap-2">
               <Wallet className="w-4 h-4 text-blue-300" />
               {settings.currency} {settings.installmentAmount.toLocaleString()}
            </span>
            <span className="bg-white/10 px-4 py-2 rounded-2xl text-xs font-black backdrop-blur-xl border border-white/10 flex items-center gap-2">
               <Users className="w-4 h-4 text-blue-300" />
               {totalMembers} Registered
            </span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[60px] -ml-16 -mb-16"></div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard 
          label="Total Pot" 
          value={`${settings.currency} ${totalPotValue.toLocaleString()}`} 
          icon={Trophy} 
          color="bg-purple-600"
          subtext={`Monthly Projection`}
        />
        <StatCard 
          label="Registered" 
          value={totalMembers} 
          icon={UserCheck} 
          color="bg-blue-600"
          subtext={`${activeMembers} Active Waitlist`}
        />
        <StatCard 
          label="Closed Cycles" 
          value={completedCycles} 
          icon={CheckCheck} 
          color="bg-emerald-600"
          subtext={`${cycles.length} Total Cycles`}
        />
        <StatCard 
          label="Collection" 
          value={currentCycle ? `${Math.round((payments.filter(p => p.cycleId === currentCycle.id && p.status === 'PAID').length / (totalMembers || 1)) * 100)}%` : '0%'} 
          icon={TrendingUp} 
          color="bg-amber-600"
          subtext="Active Cycle Rate"
        />
      </div>

      {/* Logic Explanation Card for User */}
      <div className="glass-panel p-6 rounded-[2.5rem] mb-8 border border-white">
         <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-black text-slate-800 tracking-tight">Summary Details</h3>
         </div>
         <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white/50 rounded-2xl border border-slate-50">
               <span className="text-slate-500 text-sm font-bold">Contribution ({settings.frequency})</span>
               <span className="font-black text-slate-800">{settings.currency} {settings.installmentAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/50 rounded-2xl border border-slate-50">
               <span className="text-slate-500 text-sm font-bold">Monthly Target</span>
               <span className="font-black text-slate-800">{settings.currency} {perPersonMonthly.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-5 bg-blue-600 rounded-[1.5rem] shadow-xl shadow-blue-100">
               <span className="text-white text-sm font-black uppercase tracking-widest">Grand Winner Gets</span>
               <span className="font-black text-white text-2xl tracking-tighter">{settings.currency} {totalPotValue.toLocaleString()}</span>
            </div>
         </div>
      </div>

      {/* Active Cycle Status */}
      <div className="mb-4 px-2">
        <h3 className="font-black text-slate-800 tracking-tight flex items-center gap-2">
           <CalendarDays className="w-5 h-5 text-blue-600" /> Current Tracking
        </h3>
      </div>
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
          {currentCycle ? (
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Reference</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tighter">{currentCycle.label}</p>
                  <p className="text-xs text-slate-400 font-bold mt-1">{new Date(currentCycle.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric'})}</p>
                </div>
                <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${currentCycle.isCompleted ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {currentCycle.isCompleted ? 'Closed' : 'Active Now'}
                </div>
              </div>
              
              {currentCycle.winnerId ? (
                <div className="mt-4 p-5 bg-purple-600 rounded-[1.5rem] shadow-xl shadow-purple-100 flex items-center justify-between text-white">
                    <div>
                      <p className="text-[10px] font-black text-purple-200 uppercase tracking-widest mb-1">Pot Disbursed To</p>
                      <p className="text-xl font-black tracking-tight">
                        {members.find(m => m.id === currentCycle.winnerId)?.name}
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        const winner = members.find(m => m.id === currentCycle.winnerId);
                        if (winner) onViewReceipt(winner, currentCycle);
                      }}
                      className="bg-white text-purple-600 p-4 rounded-2xl shadow-lg hover:scale-105 transition-transform"
                    >
                      <ReceiptText className="w-6 h-6" />
                    </button>
                </div>
              ) : (
                <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <span>Collection Progress</span>
                       <span>{payments.filter(p => p.cycleId === currentCycle.id && p.status === 'PAID').length} / {totalMembers} PAID</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                       <div 
                         className="bg-blue-600 h-3 rounded-full transition-all duration-1000 shadow-lg" 
                         style={{ width: `${(payments.filter(p => p.cycleId === currentCycle.id && p.status === 'PAID').length / (totalMembers || 1)) * 100}%` }}
                       ></div>
                    </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <CalendarDays className="w-8 h-8 text-slate-200" />
              </div>
              <p className="text-slate-400 font-bold">No active cycle started yet.</p>
              <p className="text-slate-300 text-xs mt-1">Start from the "Pay" tab.</p>
            </div>
          )}
      </div>
    </div>
  );
};
