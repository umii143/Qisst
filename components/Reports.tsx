
import React, { useState, useMemo } from 'react';
import { Member, PaymentRecord, Cycle, AppSettings } from '../types';
import { FileBarChart, CheckCircle, XCircle, ChevronRight, TrendingUp, PieChart, Calendar } from 'lucide-react';

interface ReportsProps {
  members: Member[];
  cycles: Cycle[];
  payments: PaymentRecord[];
  settings: AppSettings;
  onMemberClick: (member: Member) => void;
}

type ReportPeriod = 'TODAY' | 'WEEK' | 'MONTH';

export const Reports: React.FC<ReportsProps> = ({ members, cycles, payments, settings, onMemberClick }) => {
  const [period, setPeriod] = useState<ReportPeriod>('TODAY');

  const stats = useMemo(() => {
    const now = new Date();
    
    // Helper to get start of day in local time for comparison
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    
    const startOfToday = startOfDay(now);
    
    // Start of week (Sunday)
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - now.getDay());
    const startOfWeek = startOfDay(sunday);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    let filteredCycles = cycles;
    if (period === 'TODAY') {
      filteredCycles = cycles.filter(c => startOfDay(new Date(c.startDate)) === startOfToday);
    } else if (period === 'WEEK') {
      filteredCycles = cycles.filter(c => startOfDay(new Date(c.startDate)) >= startOfWeek);
    } else if (period === 'MONTH') {
      filteredCycles = cycles.filter(c => startOfDay(new Date(c.startDate)) >= startOfMonth);
    }

    const cycleIds = filteredCycles.map(c => c.id);
    const periodPayments = payments.filter(p => cycleIds.includes(p.cycleId));
    
    // Total instances expected (Members * Active cycles in this period)
    const totalExpectedInstances = members.length * filteredCycles.length;
    
    const totalPaidCount = periodPayments.filter(p => p.status === 'PAID').length;
    const totalUnpaidCount = totalExpectedInstances - totalPaidCount;
    
    // For listing people:
    // If multiple cycles, a member is in 'Paid' list if they paid for ALL selected cycles
    // or we can show them based on the latest cycle in the filtered set.
    // Let's go with the most recent cycle in the filtered set for simplicity of "Who paid today"
    const latestCycleInPeriod = filteredCycles[0]; // Assuming cycles is sorted newest first
    
    let paidList: Member[] = [];
    let unpaidList: Member[] = [];

    if (latestCycleInPeriod) {
      const paidMemberIds = new Set(
        payments
          .filter(p => p.cycleId === latestCycleInPeriod.id && p.status === 'PAID')
          .map(p => p.memberId)
      );
      paidList = members.filter(m => paidMemberIds.has(m.id));
      unpaidList = members.filter(m => !paidMemberIds.has(m.id));
    }

    return {
      totalPaidCount,
      totalUnpaidCount,
      totalAmountPaid: totalPaidCount * settings.installmentAmount,
      totalAmountUnpaid: totalUnpaidCount * settings.installmentAmount,
      paidList,
      unpaidList,
      completionRate: totalExpectedInstances > 0 ? (totalPaidCount / totalExpectedInstances) * 100 : 0
    };
  }, [period, members, cycles, payments, settings]);

  const PeriodButton = ({ type, label }: { type: ReportPeriod, label: string }) => (
    <button
      onClick={() => setPeriod(type)}
      className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2 ${
        period === type 
          ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
          : 'bg-white border-slate-100 text-slate-400'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="pb-24 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
          <FileBarChart className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Financial Reports</h2>
      </div>

      <div className="flex gap-2 mb-8 bg-white/50 p-1.5 rounded-[1.5rem] border border-white">
        <PeriodButton type="TODAY" label="Today" />
        <PeriodButton type="WEEK" label="Weekly" />
        <PeriodButton type="MONTH" label="Monthly" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Received</p>
          <p className="text-xl font-black text-emerald-600">{settings.currency} {stats.totalAmountPaid.toLocaleString()}</p>
          <TrendingUp className="absolute -bottom-2 -right-2 w-16 h-16 text-emerald-500/10" />
        </div>
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Awaiting</p>
          <p className="text-xl font-black text-red-500">{settings.currency} {stats.totalAmountUnpaid.toLocaleString()}</p>
          <PieChart className="absolute -bottom-2 -right-2 w-16 h-16 text-red-500/10" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm mb-8">
        <div className="flex justify-between items-end mb-4">
          <h3 className="font-black text-slate-800">Collection Rate</h3>
          <span className="text-2xl font-black text-blue-600">{Math.round(stats.completionRate)}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-1000 shadow-inner shadow-black/5" 
            style={{ width: `${stats.completionRate}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-400 uppercase">
          <span>{stats.totalPaidCount} Completed</span>
          <span>{stats.totalUnpaidCount} Pending</span>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h4 className="px-2 text-xs font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Cleared ({stats.paidList.length})
          </h4>
          <div className="space-y-2">
            {stats.paidList.length === 0 ? (
               <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm font-medium">No records found for this selection.</p>
               </div>
            ) : (
              stats.paidList.map(member => (
                <div 
                  key={member.id} 
                  onClick={() => onMemberClick(member)}
                  className="bg-white p-4 rounded-2xl border border-slate-50 flex items-center justify-between hover:border-emerald-100 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{member.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Status: Paid</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h4 className="px-2 text-xs font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <XCircle className="w-4 h-4" /> Pending ({stats.unpaidList.length})
          </h4>
          <div className="space-y-2">
            {stats.unpaidList.length === 0 && members.length > 0 ? (
               <div className="p-8 text-center bg-emerald-50 rounded-3xl border border-dashed border-emerald-200">
                  <p className="text-emerald-600 text-sm font-bold">Everyone has settled their dues!</p>
               </div>
            ) : stats.unpaidList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm font-medium">Add members to track payments.</p>
               </div>
            ) : (
              stats.unpaidList.map(member => (
                <div 
                  key={member.id} 
                  onClick={() => onMemberClick(member)}
                  className="bg-white p-4 rounded-2xl border border-slate-50 flex items-center justify-between hover:border-red-100 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{member.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Status: Awaiting</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-red-500 transition-colors" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
