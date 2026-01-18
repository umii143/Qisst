
import React, { useState, useEffect } from 'react';
import { Home, Users, Wallet, Settings as SettingsIcon, BrainCircuit, ExternalLink, FileBarChart } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Members } from './components/Members';
import { Payments } from './components/Payments';
import { Settings } from './components/Settings';
import { MemberDetail } from './components/MemberDetail';
import { Receipt } from './components/Receipt';
import { Reports } from './components/Reports';
import { AppSettings, Cycle, Member, PaymentRecord, ViewState } from './types';

// Initial Mock Data
const INITIAL_SETTINGS: AppSettings = {
  committeeName: 'My Committee',
  installmentAmount: 1000,
  currency: 'PKR',
  frequency: 'MONTHLY'
};

export default function App() {
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<{ member: Member, cycle: Cycle } | null>(null);

  // Persistence
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('qisst_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('qisst_members');
    return saved ? JSON.parse(saved) : [];
  });
  const [cycles, setCycles] = useState<Cycle[]>(() => {
    const saved = localStorage.getItem('qisst_cycles');
    return saved ? JSON.parse(saved) : [];
  });
  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem('qisst_payments');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => localStorage.setItem('qisst_settings', JSON.stringify(settings)), [settings]);
  useEffect(() => localStorage.setItem('qisst_members', JSON.stringify(members)), [members]);
  useEffect(() => localStorage.setItem('qisst_cycles', JSON.stringify(cycles)), [cycles]);
  useEffect(() => localStorage.setItem('qisst_payments', JSON.stringify(payments)), [payments]);

  // Helper for toggle payment from Detail View
  const handleTogglePayment = (memberId: string, cycleId: string) => {
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

  const handleOpenReceipt = (member: Member, cycle: Cycle) => {
    setActiveReceipt({ member, cycle });
  };

  const calculatePot = () => {
    let multiplier = 1;
    if (settings.frequency === 'DAILY') multiplier = 30;
    if (settings.frequency === 'WEEKLY') multiplier = 4;
    return members.length * settings.installmentAmount * multiplier;
  };

  // Main Render Logic
  const renderContent = () => {
    if (selectedMember) {
      return (
        <MemberDetail 
          member={selectedMember}
          cycles={cycles}
          payments={payments}
          settings={settings}
          onBack={() => setSelectedMember(null)}
          onTogglePayment={(cycleId) => handleTogglePayment(selectedMember.id, cycleId)}
          onViewReceipt={handleOpenReceipt}
        />
      );
    }

    switch (view) {
      case 'DASHBOARD':
        return (
          <Dashboard 
            settings={settings} 
            members={members} 
            cycles={cycles} 
            payments={payments} 
            onViewReceipt={handleOpenReceipt} 
          />
        );
      case 'MEMBERS':
        return <Members members={members} setMembers={setMembers} onMemberClick={setSelectedMember} />;
      case 'PAYMENTS':
        return (
          <Payments 
            members={members} 
            cycles={cycles} 
            setCycles={setCycles} 
            payments={payments} 
            setPayments={setPayments} 
            settings={settings} 
            setMembers={setMembers} 
          />
        );
      case 'REPORTS':
        return (
          <Reports 
            members={members} 
            cycles={cycles} 
            payments={payments} 
            settings={settings} 
            onMemberClick={setSelectedMember}
          />
        );
      case 'SETTINGS':
        return <Settings settings={settings} onSave={setSettings} />;
      default:
        return <Dashboard settings={settings} members={members} cycles={cycles} payments={payments} onViewReceipt={handleOpenReceipt} />;
    }
  };

  const NavButton = ({ id, label, icon: Icon }: { id: ViewState, label: string, icon: any }) => (
    <button
      onClick={() => {
        setView(id);
        setSelectedMember(null); // Reset detail view on nav change
      }}
      className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
        view === id 
          ? 'text-blue-600 bg-blue-50' 
          : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <Icon className={`w-5 h-5 mb-1 ${view === id ? 'fill-blue-600/20' : ''}`} />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen font-sans text-slate-800">
      
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 glass-nav z-20 px-6 py-4 flex items-center justify-between print:hidden border-b-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-100">Q</div>
          <span className="font-black text-2xl tracking-tighter text-slate-800">QisstPro</span>
        </div>
        <a 
          href="https://wa.me/923168432329" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col items-end group"
        >
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Support</span>
          <span className="text-[10px] font-black text-slate-800 group-hover:text-blue-600 transition-colors flex items-center gap-1">
            Umar Ali <ExternalLink className="w-2.5 h-2.5" />
          </span>
        </a>
      </div>

      {/* Main Content Area */}
      <main className="pt-24 px-4 pb-28 max-w-lg mx-auto min-h-screen print:p-0">
        {renderContent()}

        {/* Developer Credit in Footer */}
        <div className="mt-12 mb-4 text-center print:hidden">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Enterprise Qisst Management</p>
          <a 
            href="https://wa.me/923168432329" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-blue-600 transition-all text-xs font-bold inline-flex items-center gap-2 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 active:scale-95"
          >
            Built by <span className="font-black text-slate-900">Umar Ali</span> 
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </a>
        </div>
      </main>

      {/* Receipt Modal Overlay */}
      {activeReceipt && (
        <Receipt 
          member={activeReceipt.member}
          cycle={activeReceipt.cycle}
          settings={settings}
          potAmount={calculatePot()}
          onClose={() => setActiveReceipt(null)}
        />
      )}

      {/* Bottom Navigation (Mobile First) */}
      <div className="fixed bottom-0 left-0 right-0 glass-nav z-30 pb-safe print:hidden border-t-0 rounded-t-[2rem]">
        <div className="flex justify-around items-center p-3 max-w-lg mx-auto">
          <NavButton id="DASHBOARD" label="Home" icon={Home} />
          <NavButton id="MEMBERS" label="Users" icon={Users} />
          <NavButton id="PAYMENTS" label="Pay" icon={Wallet} />
          <NavButton id="REPORTS" label="Reports" icon={FileBarChart} />
          <NavButton id="SETTINGS" label="Setup" icon={SettingsIcon} />
        </div>
      </div>

    </div>
  );
}
