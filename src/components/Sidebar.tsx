import React from 'react';
import { LayoutDashboard, MessageSquare, ShieldAlert, History, LogOut, Activity, User as UserIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FirebaseUser } from '../firebase';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeTab: 'dashboard' | 'reports' | 'history' | 'analyser';
  setActiveTab: (tab: 'dashboard' | 'reports' | 'history' | 'analyser') => void;
  onLogout: () => void;
  user?: FirebaseUser | null;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout, user }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyser', label: 'Data Analyser', icon: Activity },
    { id: 'reports', label: 'Analysis Reports', icon: ShieldAlert },
  ];

  return (
    <div className="w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Activity className="text-black w-6 h-6" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg tracking-tight">WatchOut</h1>
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-medium">Medical Guard</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-emerald-400" : "group-hover:text-emerald-400")} />
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        {user && (
          <div className="px-4 py-4 mb-2 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-emerald-500/20" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-emerald-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.displayName || 'Guest User'}</p>
              <p className="text-[10px] text-white/40 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button 
          onClick={() => setActiveTab('history')}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
            activeTab === 'history' ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white"
          )}
        >
          <History className="w-5 h-5" />
          <span className="font-medium text-sm">Analysis History</span>
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/70 hover:bg-red-400/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}

