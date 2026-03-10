import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { ShieldAlert, ShieldCheck, AlertTriangle, Activity, TrendingUp, Users, FileText, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const data = [
  { name: 'Mon', flagged: 4, verified: 12 },
  { name: 'Tue', flagged: 7, verified: 15 },
  { name: 'Wed', flagged: 3, verified: 18 },
  { name: 'Thu', flagged: 8, verified: 14 },
  { name: 'Fri', flagged: 5, verified: 22 },
  { name: 'Sat', flagged: 2, verified: 25 },
  { name: 'Sun', flagged: 6, verified: 20 },
];

const pieData = [
  { name: 'Misinformation', value: 35, color: '#ef4444' },
  { name: 'Verified', value: 55, color: '#10b981' },
  { name: 'Suspicious', value: 10, color: '#f59e0b' },
];

const recentActivity = [
  { id: 1, content: 'COVID-19 vaccine causes infertility claim', flag: 'Misinformation', confidence: 98, time: '2h ago' },
  { id: 2, content: 'Analysis of prescription for Ibuprofen', flag: 'Verified', confidence: 95, time: '4h ago' },
  { id: 3, content: 'New herbal cure for diabetes advertisement', flag: 'Suspicious', confidence: 72, time: '6h ago' },
  { id: 4, content: 'Lab report verification for blood test', flag: 'Verified', confidence: 99, time: '12h ago' },
];

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8 bg-[#0a0a0a] min-h-full text-white overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">Real-time monitoring of medical misinformation detection.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-white/60 uppercase tracking-widest">Live System Status</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Analyzed" value="1,284" icon={FileText} trend="+12%" color="emerald" />
        <StatCard title="Flagged Content" value="342" icon={ShieldAlert} trend="+5%" color="red" />
        <StatCard title="Verified Claims" value="894" icon={ShieldCheck} trend="+18%" color="blue" />
        <StatCard title="Avg Confidence" value="94.2%" icon={Activity} trend="+2%" color="amber" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Misinformation Trends
            </h3>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs text-white/60 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorFlagged" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="flagged" stroke="#ef4444" fillOpacity={1} fill="url(#colorFlagged)" strokeWidth={2} />
                <Area type="monotone" dataKey="verified" stroke="#10b981" fillOpacity={1} fill="url(#colorVerified)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
          <h3 className="text-lg font-semibold">Content Distribution</h3>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold">1.2k</span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest">Total</span>
            </div>
          </div>
          <div className="space-y-3">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-white/60">{item.name}</span>
                </div>
                <span className="font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Analysis Activity</h3>
          <button className="text-emerald-400 text-xs font-medium hover:underline">View All Reports</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-white/40 uppercase tracking-widest border-b border-white/10">
                <th className="px-6 py-4 font-medium">Content / Claim</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Confidence</th>
                <th className="px-6 py-4 font-medium">Time</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentActivity.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-white/90 line-clamp-1">{item.content}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      item.flag === 'Misinformation' ? "bg-red-500/20 text-red-400" :
                      item.flag === 'Verified' ? "bg-emerald-500/20 text-emerald-400" :
                      "bg-amber-500/20 text-amber-400"
                    )}>
                      {item.flag}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 w-16 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500" 
                          style={{ width: `${item.confidence}%` }} 
                        />
                      </div>
                      <span className="text-xs text-white/60">{item.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-white/40">{item.time}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-white/40 hover:text-white transition-colors">
                      <Info className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, color }: any) {
  const colors: any = {
    emerald: "text-emerald-400 bg-emerald-400/10",
    red: "text-red-400 bg-red-400/10",
    blue: "text-blue-400 bg-blue-400/10",
    amber: "text-amber-400 bg-amber-400/10",
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className={cn("p-3 rounded-2xl", colors[color])}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded-lg">
          {trend}
        </span>
      </div>
      <div>
        <p className="text-white/40 text-xs font-medium uppercase tracking-widest">{title}</p>
        <h4 className="text-2xl font-bold mt-1">{value}</h4>
      </div>
    </motion.div>
  );
}
