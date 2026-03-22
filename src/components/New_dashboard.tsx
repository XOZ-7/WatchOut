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

  // FILTER STATES
  const [tone, setTone] = useState("");
  const [verdict, setVerdict] = useState("");
  const [confidence, setConfidence] = useState<[number, number]>([0, 1]);
  const [logic, setLogic] = useState("AND");

  // ---------------- FETCH DATA ---------------- //
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

  // ---------------- APPLY FILTERS ---------------- //
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

  // ---------------- DATA PROCESSING ---------------- //

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

  const toneData = groupCount("tone");
  const verdictData = groupCount("biobert");
  const confidenceData = getConfidenceBuckets();
  console.log(toneData, verdictData, confidenceData);

  // ---------------- UI ---------------- //

  return (
    <div className="p-6 h-full overflow-y-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">
        Filtered Analytics Dashboard
      </h1>

      {/* FILTERS */}
      <div className="grid grid-cols-4 gap-4">
        <select 
        className="bg-white text-black p-2 rounded"
        onChange={(e) => setTone(e.target.value)}>
          <option value="">Tone</option>
          <option value="positive">Positive</option>
          <option value="negative">Negative</option>
        </select>

        <select 
        className="bg-white text-black p-2 rounded"
        onChange={(e) => setVerdict(e.target.value)}>
          <option value="">Verdict</option>
          <option value="valid">Valid</option>
          <option value="invalid">Invalid</option>
        </select>

        <select 
        className="bg-white text-black p-2 rounded"
        onChange={(e) => setLogic(e.target.value)}>
          <option value="AND">AND</option>
          <option value="OR">OR</option>
          <option value="NOT">NOT</option>
        </select>

        <div>
          <label className="text-white text-sm">Confidence</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            onChange={(e) =>
              setConfidence([0, parseFloat(e.target.value)])
            }
          />
        </div>
      </div>
            
      {/* TONE CHART */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-black text-lg font-semibold mb-3">Tone Distribution</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={toneData}>
            <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
            <XAxis dataKey="name"  stroke="#000" />
            <YAxis  stroke="#000"/>
            <Tooltip 
                contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #ccc",
                color: "#000",
                }}
            />
            <Bar dataKey="count" fill="#3b82f6"/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* VERDICT CHART */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-black text-lg font-semibold mb-3">Verdict Distribution</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={verdictData}>
            <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
            <XAxis dataKey="name"  stroke="#000" />
            <YAxis  stroke="#000"/>
            <Tooltip 
                contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #ccc",
                color: "#000",
                }}
            />
            <Bar dataKey="count" fill="#3b82f6"/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* CONFIDENCE CHART */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-black text-lg font-semibold mb-3">Confidence Distribution</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={confidenceData}>
            <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
            <XAxis dataKey="name"  stroke="#000" />
            <YAxis  stroke="#000"/>
            <Tooltip 
                contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #ccc",
                color: "#000",
                }}
            />
            <Bar dataKey="count" fill="#3b82f6"/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartsDashboard;