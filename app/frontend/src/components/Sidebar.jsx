import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, Settings, Stethoscope, LogOut } from 'lucide-react';

export default function Sidebar({ onLogout }) {
  const navItems = [
    { label: 'Overview', path: '/', icon: <LayoutDashboard size={20} /> },
    { label: 'Patients Intake', path: '/patients', icon: <Users size={20} /> },
    { label: 'Live Triage', path: '/triage', icon: <Activity size={20} /> },
    { label: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 border-r border-[var(--border-color)] bg-[var(--surface-color)] hidden md:flex flex-col select-none z-10 transition-colors duration-300">
      
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-[var(--border-color)] transition-colors duration-300">
        <div className="flex items-center gap-2 text-[var(--color-navy)] dark:text-white font-['Sora'] font-bold text-lg">
          <Stethoscope className="text-[var(--color-teal)]" size={24} />
          <span>WBC</span>
        </div>
        <span className="ml-2 text-sm font-medium text-[var(--muted-color)] tracking-wide uppercase pt-1">Clinics</span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-6 px-3 flex flex-col gap-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) => 
              `px-3 py-2.5 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-[var(--color-teal)]/10 text-[var(--color-teal)] dark:bg-[var(--color-teal)]/20 dark:text-[var(--color-teal-light)]' 
                  : 'text-[var(--muted-color)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--text-color)]'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Profile / Info */}
      <div className="p-4 border-t border-[var(--border-color)] transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--color-teal)] to-[var(--color-navy)] flex items-center justify-center text-white font-bold text-sm">
            Dr
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-semibold truncate">Dr. Ajay</p>
            <p className="text-xs text-[var(--muted-color)] truncate">Lead Physician</p>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-[var(--muted-color)] hover:text-[var(--color-t-red)] hover:bg-[var(--color-t-red-bg)] rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
