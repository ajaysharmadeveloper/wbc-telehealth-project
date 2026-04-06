import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, Clock, CalendarCheck, TrendingUp } from 'lucide-react';
import PatientModal from '../components/PatientModal';

const mockData = [
  { time: '08:00', patients: 2, urgent: 0 },
  { time: '10:00', patients: 8, urgent: 1 },
  { time: '12:00', patients: 15, urgent: 3 },
  { time: '14:00', patients: 11, urgent: 2 },
  { time: '16:00', patients: 18, urgent: 4 },
  { time: '18:00', patients: 7, urgent: 0 },
];

const mockPatients = [
  { id: 'PT-8801', age: 45, symptoms: 'Excessive thirst, fatigue', triage: 'YELLOW', time: '10 Mins Ago' },
  { id: 'PT-8802', age: 62, symptoms: 'Dizziness, confusion, rapid breathing', triage: 'RED', time: '34 Mins Ago' },
  { id: 'PT-8803', age: 28, symptoms: 'Mild headache, normal glucose', triage: 'GREEN', time: '1 Hr Ago' },
  { id: 'PT-8804', age: 51, symptoms: 'Numbness in toes', triage: 'YELLOW', time: '2 Hrs Ago' },
];

function KPICard({ title, value, subtext, icon, type }) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`p-3 rounded-xl flex-shrink-0
        ${type === 'urgent' ? 'bg-[var(--color-t-red-bg)] text-[var(--color-t-red)]' : 
          type === 'booking' ? 'bg-[var(--color-t-yellow-bg)] text-[var(--color-t-yellow)]' : 
          'bg-[var(--color-t-green-bg)] text-[var(--color-t-green)]'}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--muted-color)]">{title}</p>
        <h3 className="text-2xl font-['Sora'] font-bold text-[var(--text-color)] my-1">{value}</h3>
        <p className="text-xs text-[var(--muted-color)] flex items-center gap-1">
          <TrendingUp size={12} className={type === 'urgent' ? 'text-[var(--color-t-red)]' : 'text-[var(--color-t-green)]'} />
          {subtext}
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [selectedPatient, setSelectedPatient] = useState(null);

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-['Sora'] font-bold mb-1">Morning Overview</h1>
          <p className="text-[var(--muted-color)] text-sm">Real-time clinic triage metrics for today.</p>
        </div>
        <div className="text-sm text-[var(--muted-color)] hidden sm:block">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KPICard 
          title="Total Screened Today" 
          value="42" 
          subtext="12% higher than yesterday" 
          icon={<CalendarCheck size={22} />} 
          type="success"
        />
        <KPICard 
          title="Urgent Cases (RED)" 
          value="4" 
          subtext="Requires immediate attention" 
          icon={<AlertCircle size={22} />} 
          type="urgent"
        />
        <KPICard 
          title="Avg. Triage Wait" 
          value="2m 14s" 
          subtext="Automated by AI Engine" 
          icon={<Clock size={22} />} 
          type="booking"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--muted-color)] mb-6">Patient Influx (Today)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-teal)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-teal)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUrgent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-t-red)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--color-t-red)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-color)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-color)' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                  labelStyle={{ color: 'var(--muted-color)', fontSize: '12px', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="patients" name="Total Intake" stroke="var(--color-teal)" strokeWidth={2} fillOpacity={1} fill="url(#colorPatients)" />
                <Area type="monotone" dataKey="urgent" name="Urgent (Red)" stroke="var(--color-t-red)" strokeWidth={2} fillOpacity={1} fill="url(#colorUrgent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="card lg:col-span-1 flex flex-col">
          <div className="p-5 border-b border-[var(--border-color)]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--muted-color)]">Latest Triage Events</h3>
          </div>
          <div className="flex-1 overflow-y-auto w-full">
            <table className="w-full text-left border-collapse">
              <tbody>
                {mockPatients.map((p, i) => (
                  <tr key={i} onClick={() => setSelectedPatient(p)} className="border-b border-[var(--border-color)] last:border-0 table-row-hover">
                    <td className="py-4 pl-5">
                      <div className="font-medium text-[13px]">{p.id} <span className="font-normal text-[var(--muted-color)]">· {p.age}y</span></div>
                      <div className="text-[12px] text-[var(--muted-color)] mt-0.5 max-w-[180px] truncate">{p.symptoms}</div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {p.triage === 'RED' && <span className="badge bg-[var(--color-t-red-bg)] text-[var(--color-t-red)]">RED Priority</span>}
                      {p.triage === 'YELLOW' && <span className="badge bg-[var(--color-t-yellow-bg)] text-[var(--color-t-yellow)]">YELLOW</span>}
                      {p.triage === 'GREEN' && <span className="badge bg-[var(--color-t-green-bg)] text-[var(--color-t-green)]">GREEN</span>}
                      <div className="text-[11px] text-[var(--muted-color)] mt-1.5">{p.time}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 text-center border-t border-[var(--border-color)] mt-auto bg-black/5 dark:bg-white/5 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            <span className="text-xs font-semibold text-[var(--color-teal)]">View All Patients →</span>
          </div>
        </div>
        
      </div>
      
      {/* Patient Detail Modal */}
      <PatientModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
    </div>
  );
}
