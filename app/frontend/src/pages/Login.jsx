import React, { useState } from 'react';
import { Stethoscope, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('ajay@wbc.clinics.com');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      onLogin();
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)] p-4 animate-fade-in relative overflow-hidden">
      
      {/* Decorative Blob */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-teal)]/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-navy)]/10 dark:bg-white/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-[var(--surface-color)]/80 backdrop-blur-xl border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden z-10">
        
        <div className="p-8 text-center border-b border-[var(--border-color)] bg-black/5 dark:bg-white/5">
          <div className="w-14 h-14 bg-[var(--color-teal)] text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Stethoscope size={30} />
          </div>
          <h2 className="text-2xl font-bold font-['Sora'] text-[var(--text-color)] mb-1">Telehealth Engine</h2>
          <p className="text-sm text-[var(--muted-color)]">Provider Access Portal</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            <div>
              <label className="block text-sm font-semibold text-[var(--text-color)] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-color)]" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-teal)] text-[var(--text-color)] transition-colors" 
                  placeholder="doctor@clinic.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--text-color)] mb-1.5">Security Passcode</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-color)]" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-teal)] text-[var(--text-color)] transition-colors" 
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-color)] hover:text-[var(--color-teal)] transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-[var(--color-teal)] rounded border-[var(--border-color)] bg-[var(--bg-color)]" defaultChecked />
                <span className="text-[var(--text-color)] font-medium">Remember me</span>
              </label>
              <a href="#" className="text-[var(--color-teal)] font-semibold hover:underline">Support</a>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-2 bg-[var(--color-navy)] dark:bg-white text-white dark:text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <span className="flex items-center gap-2">Authenticating <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black rounded-full animate-spin"></div></span>
              ) : (
                <>Access Dashboard <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>

          </form>
        </div>
      </div>
      
    </div>
  );
}
