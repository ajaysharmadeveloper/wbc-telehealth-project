import React, { useState, useEffect } from 'react';
import { Activity, Clock, Server, CheckCircle2 } from 'lucide-react';
import PatientModal from '../components/PatientModal';

const initialEvents = [
  { id: 'PT-8805', age: 39, symptoms: 'Blurry vision, elevated blood glucose', triage: 'RED', time: 'Just now', msg: 'System flagged immediate RED due to glucose indicators.' },
  { id: 'PT-8806', age: 55, symptoms: 'General fatigue, slow wound healing', triage: 'YELLOW', time: '2m ago', msg: 'Assigned YELLOW standard queue.' },
];

const simulatedIncoming = [
  { id: 'PT-8811', age: 29, symptoms: 'Dry mouth, frequent urination', triage: 'YELLOW', msg: 'Symptoms match preliminary diabetes onset profiles.' },
  { id: 'PT-8812', age: 67, symptoms: 'Unconscious, rapid pulse', triage: 'RED', msg: 'CRITICAL EMERGENCY: Bypassing standard queue.' },
  { id: 'PT-8813', age: 41, symptoms: 'Headache from screen time', triage: 'GREEN', msg: 'Assessed as low risk.' },
  { id: 'PT-8814', age: 55, symptoms: 'Tingling in feet, high HbA1c history', triage: 'RED', msg: 'Neuropathy indicators triggered escalation.' }
];

export default function LiveTriage() {
  const [events, setEvents] = useState(initialEvents);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [pulse, setPulse] = useState(false);

  // Simulate websockets receiving new live assessments
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < simulatedIncoming.length) {
        setPulse(true);
        setTimeout(() => setPulse(false), 500);
        
        const newEvent = { ...simulatedIncoming[index], time: 'Just now' };
        setEvents(prev => [newEvent, ...prev].map(p => {
          if (p.time === 'Just now' && p.id !== newEvent.id) return { ...p, time: '1m ago' };
          return p;
        }));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 7000); // New patient every 7 seconds for the demo

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-['Sora'] font-bold mb-1 flex items-center gap-2">
            <Activity size={24} className={pulse ? "text-[var(--color-t-red)] animate-pulse" : "text-[var(--color-teal)]"} /> 
            Live Assessment Feed
          </h1>
          <p className="text-[var(--muted-color)] text-sm">Monitoring WebSocket Stream from the AI Triage Engine.</p>
        </div>
        <div className="flex items-center gap-4 text-sm font-semibold">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/5 dark:bg-white/5 border border-green-500/30 rounded-lg text-green-600 dark:text-green-400">
            <Server size={14} /> AI Engine Online
          </div>
        </div>
      </div>

      {/* Stream Terminal */}
      <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl shadow-lg flex-1 overflow-hidden flex flex-col relative">
        <div className="bg-[#0F172A] text-white p-3 text-xs font-mono uppercase tracking-widest flex items-center justify-between border-b border-white/10 shrink-0">
          <span>Terminal: wbc_ai_engine_v1.2</span>
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> RECEIVING</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 font-mono text-sm relative">
          {events.length === 0 && <p className="text-[var(--muted-color)] p-4">Waiting for incoming triage requests...</p>}
          
          {events.map((evt, idx) => (
            <div 
              key={evt.id + idx} 
              onClick={() => setSelectedPatient(evt)}
              className="group p-4 border border-[var(--border-color)] rounded-lg hover:border-[var(--color-teal)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-all animate-slide-up bg-[var(--bg-color)]"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-[var(--color-teal)] font-bold">{evt.id}</span>
                  <span className="text-[var(--muted-color)] text-xs bg-[var(--surface-color)] px-2 py-0.5 rounded border border-[var(--border-color)]">{evt.time}</span>
                </div>
                {evt.triage === 'RED' && <span className="text-[var(--color-t-red)] font-bold text-xs bg-[var(--color-t-red-bg)] px-2 py-0.5 rounded">RED PRIORITY</span>}
                {evt.triage === 'YELLOW' && <span className="text-yellow-600 dark:text-yellow-400 font-bold text-xs bg-yellow-100 dark:bg-yellow-900/40 px-2 py-0.5 rounded">YELLOW</span>}
                {evt.triage === 'GREEN' && <span className="text-[var(--color-t-green)] font-bold text-xs bg-[var(--color-t-green-bg)] px-2 py-0.5 rounded">GREEN</span>}
              </div>
              <p className="text-[var(--text-color)] mb-2 font-sans text-[13px]">{evt.symptoms}</p>
              <div className="flex items-start gap-2 text-[12px] text-[var(--muted-color)] border-t border-[var(--border-color)] pt-3 mt-3">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                <span><span className="font-semibold text-[var(--text-color)]">System Output:</span> {evt.msg}</span>
              </div>
            </div>
          ))}

        </div>
        
        {/* Fading overlay at top of scroll */}
        <div className="absolute top-11 left-0 right-0 h-8 bg-gradient-to-b from-[var(--surface-color)] to-transparent pointer-events-none"></div>
      </div>
      
      <PatientModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
    </div>
  );
}
