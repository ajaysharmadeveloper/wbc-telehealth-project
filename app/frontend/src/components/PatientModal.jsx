import React from 'react';
import { X, Activity, BrainCircuit, FileText } from 'lucide-react';

export default function PatientModal({ patient, onClose }) {
  if (!patient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-['Sora'] font-bold text-[var(--text-color)]">{patient.id}</h2>
              {patient.triage === 'RED' && <span className="bg-[var(--color-t-red-bg)] text-[var(--color-t-red)] px-2.5 py-0.5 rounded-full text-xs font-bold">Priority RED</span>}
              {patient.triage === 'YELLOW' && <span className="bg-[var(--color-t-yellow-bg)] text-[var(--color-t-yellow)] px-2.5 py-0.5 rounded-full text-xs font-bold">Standard YELLOW</span>}
              {patient.triage === 'GREEN' && <span className="bg-[var(--color-t-green-bg)] text-[var(--color-t-green)] px-2.5 py-0.5 rounded-full text-xs font-bold">Routine GREEN</span>}
            </div>
            <p className="text-sm text-[var(--muted-color)]">Age: {patient.age}y &nbsp;·&nbsp; Processed: {patient.time}</p>
          </div>
          <button onClick={onClose} className="p-2 text-[var(--muted-color)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--text-color)] rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Col: Analysis */}
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--muted-color)] flex items-center gap-2 mb-3">
                <BrainCircuit size={16} /> AI Symptom Extraction
              </h3>
              <div className="bg-black/5 dark:bg-white/5 rounded-xl p-4 text-sm text-[var(--text-color)] font-mono leading-relaxed overflow-x-auto border border-[var(--border-color)] object-contain">
                &#123; <br />
                &nbsp;&nbsp;"primary_symptoms": ["{patient.symptoms}"], <br />
                &nbsp;&nbsp;"glucose_level": "unknown", <br />
                &nbsp;&nbsp;"duration": "48 hours+", <br />
                &nbsp;&nbsp;"risk_factors": ["potential dka", "dehydration"] <br />
                &#125;
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--muted-color)] flex items-center gap-2 mb-3">
                <Activity size={16} /> Initial Assessment Summary
              </h3>
              <div className="text-sm text-[var(--text-color)] p-4 border border-[var(--border-color)] rounded-xl leading-relaxed">
                Patient reports symptoms heavily correlated with diabetes complications. Triage Level set autonomously by AI due to the presence of multiple severe indicators. Recommended clinical follow-up immediately.
              </div>
            </div>
          </div>

          {/* Right Col: Transcript Snippet */}
          <div className="flex flex-col h-full border border-[var(--border-color)] rounded-xl overflow-hidden">
            <div className="bg-black/5 dark:bg-white/5 p-3 border-b border-[var(--border-color)] flex items-center gap-2">
              <FileText size={16} className="text-[var(--muted-color)]" />
              <span className="text-sm font-semibold text-[var(--text-color)]">Chat Transcript Snippet</span>
            </div>
            <div className="p-4 flex flex-col gap-3 bg-[var(--bg-color)] flex-1 overflow-y-auto w-full text-sm">
              <div className="self-end bg-[var(--color-teal)] text-white px-3 py-2 rounded-xl max-w-[85%] rounded-br-sm shadow-sm">
                I'm feeling really weird. {patient.symptoms.toLowerCase()}.
              </div>
              <div className="self-start bg-[var(--surface-color)] text-[var(--text-color)] border border-[var(--border-color)] px-3 py-2 rounded-xl max-w-[85%] rounded-bl-sm shadow-sm">
                I'm sorry you are feeling that way. Can you tell me if you have a history of diabetes or if you recently checked your blood sugar?
              </div>
              <div className="self-end bg-[var(--color-teal)] text-white px-3 py-2 rounded-xl max-w-[85%] rounded-br-sm shadow-sm">
                Yes, type 2, but I don't have my meter with me.
              </div>
               <div className="self-start bg-[var(--surface-color)] text-[var(--text-color)] border border-[var(--border-color)] px-3 py-2 rounded-xl max-w-[85%] rounded-bl-sm shadow-sm">
                Thank you for letting me know. Because of your symptoms, I am alerting our clinic staff immediately.
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[var(--border-color)] bg-black/5 dark:bg-white/5 flex justify-end gap-3 rounded-b-2xl">
          <button className="px-4 py-2 border border-[var(--border-color)] text-[var(--text-color)] rounded-lg font-semibold text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Route to Nurse</button>
          <button className="px-4 py-2 bg-[var(--color-teal)] text-white rounded-lg font-semibold text-sm hover:bg-[var(--color-teal-dark)] transition-colors shadow-md">Open Full Chart</button>
        </div>

      </div>
    </div>
  );
}
