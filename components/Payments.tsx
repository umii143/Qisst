
import React, { useState, useEffect } from 'react';
import { Member, PaymentRecord, Cycle, AppSettings } from '../types';
import { Check, X, Calendar, PlusCircle, Trophy, CheckCheck, CircleDollarSign, CalendarDays, Save, CheckCircle2 } from 'lucide-react';

interface PaymentsProps {
  members: Member[];
  cycles: Cycle[];
  setCycles: React.Dispatch<React.SetStateAction<Cycle[]>>;
  payments: PaymentRecord[];
  setPayments: React.Dispatch<React.SetStateAction<PaymentRecord[]>>;
  settings: AppSettings;
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
}

export const Payments: React.FC<PaymentsProps> = ({
  members,
  cycles,
  setCycles,
  payments,
  setPayments,
  settings,
  setMembers
}) => {
  const [activeCycleId, setActiveCycleId] = useState<string>(cycles.length > 0 ? cycles[0].id : '');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    if (!activeCycleId && cycles.length > 0) {
      setActiveCycleId(cycles[0].id);
    }
  }, [cycles, activeCycleId]);

  const createNewCycle = (selectedDate: string) => {
    const cycleNum = cycles.length + 1;
    const dateObj = new Date(selectedDate);
    
    const newCycle: Cycle = {
      id: `cycle-${Date.now()}`,
      label: `${settings.frequency === 'MONTHLY' ? 'Month' : 'Cycle'} ${cycleNum}`,
      startDate: dateObj.toISOString(),
      isCompleted: false
    };
    setCycles([newCycle, ...cycles]);
    setActiveCycleId(newCycle.id);
    setIsDatePickerOpen(false);
  };

  const togglePayment = (memberId: string, cycleId: string) => {
    const existingPaymentIndex = payments.findIndex(p => p.memberId === memberId && p.cycleId === cycleId);
    if (existingPaymentIndex >= 0) {
      const newPayments = [...payments];
      newPayments.splice(existingPaymentIndex, 1);
      setPayments(newPayments);
    } else {
      const newPayment: PaymentRecord = {
        memberId,
        cycleId,
        status: 'PAID',
        datePaid: new Date().toISOString()
      };
      setPayments([...payments, newPayment]);
    }
  };

  const handleSaveCollection = () => {
    setShowSuccessPopup(true);
    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 3000);
  };

  const handleDrawWinner = (cycleId: string) => {
    const eligibleMembers = members.filter(m => !m.hasReceivedPot);
    if (eligibleMembers.length === 0) {
      alert("Everyone has received the pot!");
      return;
    }
    const winnerIndex = Math.floor(Math.random() * eligibleMembers.length);
    const winner = eligibleMembers[winnerIndex];
    if (confirm(`🎉 Conduct Lucky Draw?\n\nWinner: ${winner.name}`)) {
      const updatedCycles = cycles.map(c => c.id === cycleId ? { ...c, winnerId: winner.id, isCompleted: true } : c);
      setCycles(updatedCycles);
      setMembers(members.map(m => m.id === winner.id ? { ...m, hasReceivedPot: true, receivedDate: new Date().toISOString() } : m));
    }
  };

  const currentCycle = cycles.find(c => c.id === activeCycleId);
  const getPaymentStatus = (memberId: string, cycleId: string) => {
    return payments.some(p => p.memberId === memberId && p.cycleId === cycleId && p.status === 'PAID');
  };

  return (
    <div className="max-w-3xl mx-auto pb-32 relative">
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center text-center max-w-xs w-full border border-emerald-100">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Records Saved</h3>
            <p className="text-slate-500 font-medium text-sm mb-6">Daily collection updated successfully</p>
            <div className="pt-4 border-t border-slate-100 w-full">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Powered by</p>
              <p className="text-sm font-black text-blue-600">Umar Ali</p>
            </div>
          </div>
        </div>
      )}

      {/* Header Card */}
      <div className="glass-panel p-6 rounded-[2.5rem] mb-6">
        <div className="flex justify-between items-center mb-6">
           <div>
             <h2 className="text-2xl font-black text-slate-800 tracking-tight">Collection Entry</h2>
             <p className="text-sm text-slate-500 font-medium">Daily management console</p>
           </div>
           <button 
            onClick={() => setIsDatePickerOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl font-black shadow-lg shadow-blue-200 active:scale-95 transition-transform"
          >
            <CalendarDays className="w-5 h-5" /> New Date
          </button>
        </div>

        {isDatePickerOpen && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-[1.5rem] animate-in zoom-in-95">
            <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Select Start Date</p>
            <div className="flex gap-2">
              <input 
                type="date" 
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 outline-none focus:border-blue-500"
              />
              <button 
                onClick={() => createNewCycle(customDate)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black shadow-md"
              >
                Create
              </button>
            </div>
          </div>
        )}

        {cycles.length > 0 && (
          <div className="bg-white p-2 rounded-[1.5rem] border border-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600 ml-3" />
            <select 
              value={activeCycleId} 
              onChange={(e) => setActiveCycleId(e.target.value)}
              className="flex-1 bg-transparent font-black text-slate-800 text-lg outline-none px-2 appearance-none py-2"
            >
              {cycles.map(c => (
                <option key={c.id} value={c.id}>
                  {c.label} ({new Date(c.startDate).toLocaleDateString('en-GB')})
                </option>
              ))}
            </select>
            {currentCycle && !currentCycle.winnerId && (
               <button onClick={() => handleDrawWinner(currentCycle.id)} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-md uppercase tracking-widest mr-1">
                 Draw
               </button>
            )}
          </div>
        )}
      </div>

      {cycles.length === 0 ? (
        <div className="text-center py-24 glass-panel rounded-[2.5rem]">
          <div className="inline-flex p-6 bg-slate-50 rounded-full mb-4">
             <Calendar className="w-12 h-12 text-slate-300" />
          </div>
          <p className="font-black text-slate-800 text-xl mb-1">No Active Collections</p>
          <p className="text-slate-400 font-medium">Click "New Date" to start a collection cycle</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-8">
            {members.map(member => {
              const isPaid = currentCycle ? getPaymentStatus(member.id, currentCycle.id) : false;
              return (
                <div key={member.id} className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-50 flex items-center justify-between group hover:border-blue-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-colors ${
                      isPaid ? 'bg-emerald-50 text-emerald-600' : 
                      member.hasReceivedPot ? 'bg-purple-50 text-purple-600' : 'bg-slate-50 text-slate-400'
                    }`}>
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-black text-slate-800 block">{member.name}</span>
                      {member.hasReceivedPot && (
                        <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Previous Winner</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                     <button
                      disabled={!currentCycle}
                      onClick={() => currentCycle && togglePayment(member.id, currentCycle.id)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all active:scale-95 ${
                        isPaid 
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' 
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {isPaid ? <Check className="w-5 h-5" /> : 'Unpaid'}
                    </button>

                     <button 
                      disabled={!currentCycle || isPaid}
                      onClick={() => currentCycle && togglePayment(member.id, currentCycle.id)}
                      className={`p-3 rounded-2xl border-2 font-black transition-all active:scale-95 ${
                        isPaid ? 'border-transparent text-emerald-600' : 'border-blue-50 text-blue-600 hover:bg-blue-50'
                      }`}
                      title="Quick Pay"
                     >
                       <CircleDollarSign className="w-6 h-6" />
                     </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            onClick={handleSaveCollection}
            className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-lg shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-[0.98] transition-all hover:bg-slate-800"
          >
            <Save className="w-6 h-6" />
            Save Today's Collection
          </button>
        </>
      )}
    </div>
  );
};
