
import React from 'react';
import { Member, AppSettings, Cycle } from '../types';
import { Printer, X, Share2, CheckCircle2, QrCode } from 'lucide-react';

interface ReceiptProps {
  member: Member;
  cycle: Cycle;
  settings: AppSettings;
  potAmount: number;
  onClose: () => void;
}

export const Receipt: React.FC<ReceiptProps> = ({ member, cycle, settings, potAmount, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative print:shadow-none print:m-0 print:w-full print:max-w-none">
        
        {/* Action Buttons - Hidden in Print */}
        <div className="absolute top-6 right-6 flex gap-2 print:hidden">
          <button 
            onClick={handlePrint}
            className="p-3 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
          >
            <Printer className="w-5 h-5" />
          </button>
          <button 
            onClick={onClose}
            className="p-3 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Content */}
        <div id="printable-receipt" className="p-8">
          <div className="text-center mb-8 pt-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl text-white font-black text-2xl mb-4 shadow-lg shadow-blue-200">
              Q
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">QisstPro</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Payment Confirmation</p>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-block bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-2 border border-emerald-100">
                Committee Disbursed
              </div>
              <h2 className="text-3xl font-black text-slate-900">
                {settings.currency} {potAmount.toLocaleString()}
              </h2>
              <p className="text-slate-500 text-sm font-medium mt-1">Total Committee Pot</p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-6 space-y-4 border border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm font-bold">RECIPIENT</span>
                <span className="text-slate-800 font-extrabold">{member.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm font-bold">COMMITTEE</span>
                <span className="text-slate-800 font-extrabold">{settings.settingsName || settings.committeeName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm font-bold">CYCLE</span>
                <span className="text-slate-800 font-extrabold">{cycle.label}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm font-bold">DATE</span>
                <span className="text-slate-800 font-extrabold">{new Date(member.receivedDate || Date.now()).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm font-bold">STATUS</span>
                <span className="text-emerald-600 font-black flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> SUCCESS
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 py-4">
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                 <QrCode className="w-24 h-24 text-slate-800" />
              </div>
              <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                This is a digitally generated receipt by QisstPro.<br/>
                Verification Code: {cycle.id.slice(-8).toUpperCase()}
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-200 text-center">
             <p className="text-slate-800 font-bold text-sm">Thank you for using QisstPro!</p>
             <p className="text-slate-400 text-xs mt-1 italic">Organized & Managed Professionally</p>
          </div>
        </div>

        {/* Mobile footer for sharing instructions */}
        <div className="bg-slate-900 p-6 text-center print:hidden">
          <button 
            onClick={handlePrint}
            className="w-full bg-white text-slate-900 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
          >
            <Share2 className="w-5 h-5" />
            Save / Print Receipt
          </button>
          <p className="text-slate-500 text-[10px] mt-4">
            TIP: Select "Save as PDF" on your phone to keep a digital copy.
          </p>
        </div>
      </div>
    </div>
  );
};
