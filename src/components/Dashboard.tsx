import React, { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { ShieldAlert, ShieldCheck, Activity, TrendingUp, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { db } from "../firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Dashboard() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    valid: 0,
    invalid: 0,
    avgConfidence: 0
  });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDocs(
        collection(db, "Users", "user1", "queries")
      );

      const raw = snap.docs.map(doc => doc.data());

      let total = 0;
      let valid = 0;
      let invalid = 0;
      let confidenceSum = 0;

      const grouped: any = {};

      raw.forEach((item: any) => {
        if (!item.createdAt) return;

        total++;

        if (item.biobert?.toLowerCase() === "valid") valid++;
        if (item.biobert?.toLowerCase() === "invalid") invalid++;

        confidenceSum += item.confidence || 0;

        const date = item.createdAt.toDate();
        const day = date.toLocaleDateString("en-US", { weekday: "short" });

        if (!grouped[day]) {
          grouped[day] = { name: day, flagged: 0, verified: 0 };
        }

        if (item.biobert?.toLowerCase() === "invalid") {
          grouped[day].flagged += 1;
        } else if (item.biobert?.toLowerCase() === "valid") {
          grouped[day].verified += 1;
        }
      });

      const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

      const sortedChart = daysOrder
        .map(day => grouped[day])
        .filter(Boolean);

      setChartData(sortedChart);

      setStats({
        total,
        valid,
        invalid,
        avgConfidence: total ? confidenceSum / total : 0
      });

      // 🔥 Recent 5 queries (latest first)
      const recentSnap = await getDocs(
        query(
          collection(db, "Users", "user1", "queries"),
          orderBy("createdAt", "desc"),
          limit(5)
        )
      );

      setRecent(recentSnap.docs.map(doc => doc.data()));
    };

    fetchData();
  }, []);

  return (
    <div className="p-8 space-y-8 bg-[#0a0a0a] min-h-full text-white overflow-y-auto">
      
      {/* Header */}
      <h1 className="text-3xl font-bold">System Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Analyzed" value={stats.total} icon={FileText} />
        <StatCard title="Invalid Claims" value={stats.invalid} icon={ShieldAlert} />
        <StatCard title="Valid Claims" value={stats.valid} icon={ShieldCheck} />
        <StatCard 
                title="Avg Confidence" 
                value={`${stats.avgConfidence.toFixed(2)}%`} 
                icon={Activity} 
              />
      </div>

      {/* Chart */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          Misinformation Trends
        </h3>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#ffffff40" />
              <YAxis stroke="#ffffff40" />
              <Tooltip />

              <Area type="monotone" dataKey="flagged" stroke="#ef4444" fillOpacity={0.2} fill="#ef4444" />
              <Area type="monotone" dataKey="verified" stroke="#10b981" fillOpacity={0.2} fill="#10b981" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🔥 Recent Claims */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
        <h3 className="text-lg font-semibold">Recent Claims</h3>

        {recent.map((item, index) => (
          <div key={index} className="flex justify-between items-center bg-[#111] p-4 rounded-xl">
            
            <p className="text-white/90 max-w-[75%] line-clamp-1">
              {item.query}
            </p>

            <span className={cn(
              "px-3 py-1 text-sm rounded-full font-medium",
              item.biobert?.toLowerCase() === "valid"
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            )}>
              {item.biobert}
            </span>

          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }: any) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white/5 border border-white/10 rounded-3xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-6 h-6 text-white/70" />
      </div>

      <p className="text-white/40 text-xs uppercase">{title}</p>
      <h4 className="text-2xl font-bold mt-1">{value}</h4>
    </motion.div>
  );
}
