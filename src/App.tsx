import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import Analyzer from './components/Analyzer';
import New_dashboard from './components/New_dashboard';
import { ShieldAlert, Info } from 'lucide-react';
import Reports from './components/Reports';


export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard_1'|'analyzer'|'dashboard' | 'chatbot' | 'reports'>('dashboard');

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {activeTab === 'dashboard_1' && <New_dashboard/>}
        {activeTab === 'analyzer' && <Analyzer />}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'chatbot' && <Chatbot />}
        {activeTab === 'reports' && <Reports />}

        {/* Global Alert Overlay (Subtle) */}
        <div className="absolute bottom-6 right-6 z-50">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Info className="text-amber-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">System Notice</p>
              <p className="text-[11px] text-white/60 leading-relaxed">
                WatchOut is currently in Beta. AI analysis should be verified by medical experts.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
