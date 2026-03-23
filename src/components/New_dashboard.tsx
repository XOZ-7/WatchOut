import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";

type QueryType = {
  query: string;
  tone: string;
  biobert: string;
  confidence: number;
};

const ChartsDashboard = () => {
  const userId = "user1";

  const [data, setData] = useState<QueryType[]>([]);
  const [filtered, setFiltered] = useState<QueryType[]>([]);

  const [tone, setTone] = useState("");
  const [verdict, setVerdict] = useState("");
  const [confidence, setConfidence] = useState<[number, number]>([0, 1]);
  const [logic, setLogic] = useState("AND");

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDocs(
        collection(db, "Users", userId, "queries")
      );

      const queries: QueryType[] = snap.docs.map((doc) => {
        const d = doc.data();
        return {
          query: d.query ?? "",
          tone: d.tone ?? "",
          biobert: d.biobert ?? "",
          confidence: d.confidence ?? 0,
        };
      });

      setData(queries);
      setFiltered(queries);
    };

    fetchData();
  }, []);

  useEffect(() => {
    let result = [...data];

    type ConditionFn = (q: QueryType) => boolean;
    const conditions: ConditionFn[] = [];

    if (tone) conditions.push((q) => q.tone === tone);
    if (verdict)
      conditions.push((q) => q.biobert === verdict.toUpperCase());

    conditions.push(
      (q) =>
        q.confidence >= confidence[0] && q.confidence <= confidence[1]
    );

    result = result.filter((q) => {
      if (logic === "AND") return conditions.every((fn) => fn(q));
      if (logic === "OR") return conditions.some((fn) => fn(q));
      if (logic === "NOT") return !conditions.every((fn) => fn(q));
      return true;
    });

    setFiltered(result);
  }, [tone, verdict, confidence, logic, data]);

  const groupCount = (key: "tone" | "biobert") => {
    return Object.values(
      filtered.reduce((acc: Record<string, any>, curr) => {
        acc[curr[key]] = acc[curr[key]] || {
          name: curr[key],
          count: 0,
        };
        acc[curr[key]].count++;
        return acc;
      }, {})
    );
  };

  const getConfidenceBuckets = () => {
    return Object.values(
      filtered.reduce((acc: Record<string, any>, curr) => {
        const start = Math.floor(curr.confidence * 5) / 5;
        const end = (start + 0.2).toFixed(1);
        const label = `${start.toFixed(1)}-${end}`;

        acc[label] = acc[label] || { name: label, count: 0 };
        acc[label].count++;

        return acc;
      }, {})
    );
  };

  // Ensure positive comes before negative
  const toneData = groupCount("tone").sort((a: any, b: any) => {
    if (a.name === "positive") return -1;
    if (b.name === "positive") return 1;
    if (a.name === "negative") return 1;
    if (b.name === "negative") return -1;
    return 0;
  });
  const verdictData = groupCount("biobert");
  const confidenceData = getConfidenceBuckets();

  // 🎨 COLOR HELPERS
  const getToneColor = (name: string) => {
    if (name === "Positive") return "#22c55e"; // green
    if (name === "Negative") return "#ef4444"; // red
    return "#888";
  };

  const getVerdictColor = (name: string) => {
    if (name === "Valid") return "#22c55e";
    if (name === "Invalid") return "#ef4444";
    return "#888";
  };

  const confidenceColors = [
    "#ef4444", // low - red
    "#f97316", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#3b82f6", // blue (very high)
  ];

  return (
    <div className="p-8 h-full overflow-y-auto space-y-8 bg-[#0a0a0a] text-white">
      <h1 className="text-3xl font-semibold tracking-tight">
        Analytics Dashboard
      </h1>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          className="bg-[#111] border border-white/10 text-white p-3 rounded-xl"
          onChange={(e) => setTone(e.target.value)}
        >
          <option value="">Tone</option>
          <option value="positive">Positive</option>
          <option value="negative">Negative</option>
        </select>

        <select
          className="bg-[#111] border border-white/10 text-white p-3 rounded-xl"
          onChange={(e) => setVerdict(e.target.value)}
        >
          <option value="">Verdict</option>
          <option value="valid">Valid</option>
          <option value="invalid">Invalid</option>
        </select>

        <select
          className="bg-[#111] border border-white/10 text-white p-3 rounded-xl"
          onChange={(e) => setLogic(e.target.value)}
        >
          <option value="AND">AND</option>
          <option value="OR">OR</option>
          <option value="NOT">NOT</option>
        </select>

        {/* RANGE */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-white/60">
            Confidence: {confidence[0].toFixed(2)} - {confidence[1].toFixed(2)}
          </label>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={confidence[0]}
            className="accent-white"
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (val <= confidence[1]) {
                setConfidence([val, confidence[1]]);
              }
            }}
          />

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={confidence[1]}
            className="accent-white"
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (val >= confidence[0]) {
                setConfidence([confidence[0], val]);
              }
            }}
          />
        </div>
      </div>

      {/* VERDICT CHART */}
      <div className="bg-[#111] border border-white/10 p-6 rounded-2xl shadow-lg">
        <h2 className="text-lg font-medium mb-4 text-white/90">
          Verdict Distribution
        </h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={verdictData}>
            <CartesianGrid stroke="#222" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip contentStyle={{ backgroundColor: "#e4dddd", border: "1px solid #333", color: "#0f0e0e" }} />
            <Bar dataKey="count">
              {verdictData.map((entry, index) => (
                <Cell key={index} fill={getVerdictColor(entry.name)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* CONFIDENCE CHART */}
      <div className="bg-[#111] border border-white/10 p-6 rounded-2xl shadow-lg">
        <h2 className="text-lg font-medium mb-4 text-white/90">
          Confidence Distribution
        </h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={confidenceData}>
            <CartesianGrid stroke="#222" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip contentStyle={{ backgroundColor: "#e4dddd", border: "1px solid #333", color: "#0f0e0e" }} />
            <Bar dataKey="count">
              {confidenceData.map((_, index) => (
                <Cell key={index} fill={confidenceColors[index % confidenceColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* TONE CHART */}
      <div className="bg-[#111] border border-white/10 p-6 rounded-2xl shadow-lg">
        <h2 className="text-lg font-medium mb-4 text-white/90">
          Tone Distribution
        </h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={toneData}>
            <CartesianGrid stroke="#222" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip contentStyle={{ backgroundColor: "#e4dddd", border: "1px solid #333", color: "#0f0e0e" }} />
            <Bar dataKey="count">
              {toneData.map((entry, index) => (
                <Cell key={index} fill={getToneColor(entry.name)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default ChartsDashboard;
