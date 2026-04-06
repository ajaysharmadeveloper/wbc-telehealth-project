import React, { useState } from 'react';
import { Search, Filter, Stethoscope, AlertTriangle, ArrowUpRight } from 'lucide-react';
import PatientModal from '../components/PatientModal';

const extendedMockPatients = [
  { id: 'PT-8801', age: 45, symptoms: 'Excessive thirst, continuous fatigue', triage: 'YELLOW', time: 'Today 10:24 AM' },
  { id: 'PT-8802', age: 62, symptoms: 'Dizziness, confusion, rapid breathing', triage: 'RED', time: 'Today 10:01 AM' },
  { id: 'PT-8803', age: 28, symptoms: 'Mild headache, normal glucose', triage: 'GREEN', time: 'Today 09:12 AM' },
  { id: 'PT-8804', age: 51, symptoms: 'Numbness in toes, recurring tingling', triage: 'YELLOW', time: 'Yesterday 04:30 PM' },
  { id: 'PT-8805', age: 39, symptoms: 'Blurry vision, elevated blood glucose', triage: 'RED', time: 'Yesterday 02:15 PM' },
  { id: 'PT-8806', age: 55, symptoms: 'General fatigue, slow wound healing', triage: 'YELLOW', time: 'Yesterday 11:45 AM' },
  { id: 'PT-8807', age: 31, symptoms: 'Slight ankle swelling, normal readings', triage: 'GREEN', time: 'Apr 04 03:20 PM' },
  { id: 'PT-8808', age: 72, symptoms: 'Shortness of breath, extreme lethargy', triage: 'RED', time: 'Apr 04 01:10 PM' },
  { id: 'PT-8809', age: 48, symptoms: 'Frequent urination at night', triage: 'YELLOW', time: 'Apr 03 09:30 AM' },
  { id: 'PT-8810', age: 22, symptoms: 'Routine check-in, feeling fine', triage: 'GREEN', time: 'Apr 03 08:20 AM' },
];

export default function Patients() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, RED, YELLOW, GREEN
  const [selectedPatient, setSelectedPatient] = useState(null);

  const filteredPatients = extendedMockPatients.filter(p => {
    const matchesSearch = p.id.toLowerCase().includes(search.toLowerCase()) || p.symptoms.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'ALL' || p.triage === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-['Sora'] font-bold mb-1 flex items-center gap-2">
            <Stethoscope size={24} className="text-[var(--color-teal)]" /> 
            Patient Directory
          </h1>
          <p className="text-[var(--muted-color)] text-sm">Full log of triaged patient data processed by the AI layer.</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-color)]" size={18} />
          <input 
            type="text" 
            placeholder="Search patient ID or symptoms..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-[var(--surface-color)] border border-[var(--border-color)] focus:border-[var(--color-teal)] outline-none rounded-xl text-sm w-full transition-all text-[var(--text-color)] placeholder:text-[var(--muted-color)] shadow-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 bg-[var(--surface-color)] border border-[var(--border-color)] p-1.5 rounded-xl shadow-sm w-full md:w-auto overflow-x-auto">
          {['ALL', 'RED', 'YELLOW', 'GREEN'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                filter === f 
                  ? f === 'ALL' ? 'bg-[var(--color-navy)] text-white dark:bg-white dark:text-black' : 
                    f === 'RED' ? 'bg-[var(--color-t-red)] text-white' : 
                    f === 'YELLOW' ? 'bg-[#EAB308] text-white' : 
                    'bg-[var(--color-t-green)] text-white'
                  : 'text-[var(--muted-color)] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {f === 'RED' && <AlertTriangle size={14} />}
              {f === 'ALL' ? 'All Patients' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Container */}
      <div className="card w-full flex-1 min-h-[500px]">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead className="bg-black/5 dark:bg-white/5 border-b border-[var(--border-color)]">
              <tr className="text-xs uppercase tracking-wider text-[var(--muted-color)] font-semibold">
                <th className="py-4 pl-6 font-semibold">Action</th>
                <th className="py-4 px-4 font-semibold">Patient ID</th>
                <th className="py-4 px-4 font-semibold">Triage Priority</th>
                <th className="py-4 px-4 font-semibold">Reported Symptoms</th>
                <th className="py-4 pr-6 font-semibold text-right">Processed Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[var(--muted-color)]">
                    No patients match the given search/filter.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p, i) => (
                  <tr key={i} onClick={() => setSelectedPatient(p)} className="border-b border-[var(--border-color)] last:border-0 table-row-hover group">
                    <td className="py-4 pl-6">
                      <button className="text-[var(--muted-color)] group-hover:text-[var(--color-teal)] transition-colors p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md">
                        <ArrowUpRight size={18} />
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-sm">{p.id}</div>
                      <div className="text-[12px] text-[var(--muted-color)]">Age: {p.age}</div>
                    </td>
                    <td className="py-4 px-4">
                      {p.triage === 'RED' && <span className="badge bg-[var(--color-t-red-bg)] text-[var(--color-t-red)] border border-red-200/50">RED Priority</span>}
                      {p.triage === 'YELLOW' && <span className="badge bg-[var(--color-t-yellow-bg)] text-[var(--color-t-yellow)] border border-yellow-200/50">YELLOW Standard</span>}
                      {p.triage === 'GREEN' && <span className="badge bg-[var(--color-t-green-bg)] text-[var(--color-t-green)] border border-green-200/50">GREEN Routine</span>}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-[13px] text-[var(--text-color)] max-w-sm truncate">{p.symptoms}</div>
                    </td>
                    <td className="py-4 pr-6 text-right">
                      <div className="text-[12px] font-medium text-[var(--muted-color)]">{p.time}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Patient Detail Modal Overlay */}
      <PatientModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
    </div>
  );
}
