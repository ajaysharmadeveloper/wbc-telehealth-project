import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import LiveTriage from './pages/LiveTriage';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { Moon, Sun, Search, Bell } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState('light');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize theme
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  // Apply theme to document body
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-[var(--bg-color)] overflow-hidden transition-colors duration-300 animate-fade-in">
        
        {/* Navigation Rail */}
        <Sidebar onLogout={() => setIsAuthenticated(false)} />

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col md:ml-64 relative min-h-screen max-w-full">
          
          {/* Top Header */}
          <header className="h-16 border-b border-[var(--border-color)] bg-[var(--surface-color)]/80 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between transition-colors duration-300">
            
            <div className="flex items-center gap-4 flex-1">
              {/* Search Bar - Mocked */}
              <div className="relative max-w-sm hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-color)]" size={16} />
                <input 
                  type="text" 
                  placeholder="Search patient ID or condition..." 
                  className="pl-9 pr-4 py-1.5 bg-black/5 dark:bg-white/5 border border-transparent focus:border-[var(--color-teal)] outline-none rounded-lg text-sm w-full transition-all text-[var(--text-color)] placeholder:text-[var(--muted-color)]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[var(--muted-color)] hover:text-[var(--text-color)] transition-colors relative">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-t-red)] rounded-full border border-[var(--surface-color)]"></span>
              </button>
              
              <div className="w-px h-6 bg-[var(--border-color)] mx-1"></div>
              
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[var(--muted-color)] hover:text-[var(--text-color)] transition-colors inline-flex items-center gap-2"
                aria-label="Toggle Custom Theme"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
            </div>
            
          </header>

          {/* Page Content Scrollable Area */}
          <div className="flex-1 overflow-y-auto w-full">
            <Routes>
              {/* Main Routing Setup */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/triage" element={<LiveTriage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          
        </main>
      </div>
    </BrowserRouter>
  );
}
