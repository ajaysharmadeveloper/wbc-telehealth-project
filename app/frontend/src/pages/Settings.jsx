import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Sliders, BellRing, Save } from 'lucide-react';

export default function Settings() {
  const [strictness, setStrictness] = useState(80);
  const [escalateRed, setEscalateRed] = useState(true);
  const [autoWaitlist, setAutoWaitlist] = useState(true);

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      
      <div className="mb-8">
        <h1 className="text-2xl font-['Sora'] font-bold mb-1 flex items-center gap-2">
          <SettingsIcon size={24} className="text-[var(--color-teal)]" /> 
          System Configuration
        </h1>
        <p className="text-[var(--muted-color)] text-sm">Manage AI Engine thresholds and clinic notification rules.</p>
      </div>

      <div className="flex flex-col gap-6">

        {/* AI Guardrails Section */}
        <div className="card">
          <div className="p-5 border-b border-[var(--border-color)] flex items-center gap-3">
            <Shield className="text-[var(--color-navy)] dark:text-white" size={20} />
            <h2 className="font-semibold text-[var(--text-color)]">AI Guardrail Parameters</h2>
          </div>
          <div className="p-6 flex flex-col gap-6">
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium text-sm text-[var(--text-color)]">Triage Strictness Threshold</label>
                <span className="text-sm font-bold text-[var(--color-teal)]">{strictness}%</span>
              </div>
              <p className="text-xs text-[var(--muted-color)] mb-4">Higher values make the AI more cautious, flagging more patients as YELLOW or RED.</p>
              <input 
                type="range" 
                min="50" 
                max="100" 
                value={strictness}
                onChange={e => setStrictness(e.target.value)}
                className="w-full h-2 bg-[var(--border-color)] rounded-lg appearance-none cursor-pointer accent-[var(--color-teal)]"
              />
            </div>

            <hr className="border-[var(--border-color)]" />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-sm text-[var(--text-color)]">Enforce Disclaimers</h4>
                <p className="text-xs text-[var(--muted-color)] mt-1">Force AI to prefix medical advice with emergency liability warnings.</p>
              </div>
              <div className="w-11 h-6 bg-[var(--color-teal)] rounded-full relative cursor-pointer opacity-50 cursor-not-allowed">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>

          </div>
        </div>

        {/* Auto Actions */}
        <div className="card">
          <div className="p-5 border-b border-[var(--border-color)] flex items-center gap-3">
            <Sliders className="text-[var(--color-navy)] dark:text-white" size={20} />
            <h2 className="font-semibold text-[var(--text-color)]">Automated Actions</h2>
          </div>
          <div className="p-6 flex flex-col gap-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-sm text-[var(--text-color)]">Auto-book YELLOW Triages</h4>
                <p className="text-xs text-[var(--muted-color)] mt-1">Automatically place YELLOW patients into the daily clinic waiting list.</p>
              </div>
              <div 
                onClick={() => setAutoWaitlist(!autoWaitlist)}
                className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${autoWaitlist ? 'bg-[var(--color-teal)]' : 'bg-[var(--border-color)]'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${autoWaitlist ? 'left-6' : 'left-1'}`}></div>
              </div>
            </div>

            <hr className="border-[var(--border-color)]" />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-sm text-[var(--text-color)] flex items-center gap-2">
                  <BellRing size={14} className="text-[var(--color-t-red)]" /> Pager Escalation for RED
                </h4>
                <p className="text-xs text-[var(--muted-color)] mt-1">Send a direct SMS alert to the on-call physician for any RED triage.</p>
              </div>
              <div 
                onClick={() => setEscalateRed(!escalateRed)}
                className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${escalateRed ? 'bg-[var(--color-teal)]' : 'bg-[var(--border-color)]'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${escalateRed ? 'left-6' : 'left-1'}`}></div>
              </div>
            </div>

          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button className="px-5 py-2.5 rounded-lg font-semibold text-sm border border-[var(--border-color)] text-[var(--text-color)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Discard Changes</button>
          <button className="px-5 py-2.5 rounded-lg font-semibold text-sm bg-[var(--color-navy)] text-white dark:bg-white dark:text-black flex items-center gap-2 transition-transform active:scale-95 shadow-md">
            <Save size={16} /> Save Configuration
          </button>
        </div>

      </div>
    </div>
  );
}
