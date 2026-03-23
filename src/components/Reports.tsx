import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

type QueryType = {
  query: string;
  tone: string;
  biobert: string;
  confidence: number;
};

const Reports = () => {
  const userId = "user1";

  const [data, setData] = useState<QueryType[]>([]);

  useEffect(() => {
    

const fetchData = async () => {
  const q = query(
    collection(db, "Users", userId, "queries"),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q); // ✅ only ONE argument

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
};

    fetchData();
  }, []);

  // Normalize to handle "Invalid" / "INVALID" etc
  const normalize = (v: string) => v?.toLowerCase();

  const getBorderColor = (verdict: string) => {
    const v = normalize(verdict);
    if (v === "valid") return "border-green-500";
    if (v === "invalid") return "border-red-500";
    return "border-white/10";
  };

  const getBadgeColor = (verdict: string) => {
    const v = normalize(verdict);
    if (v === "valid") return "bg-green-500/20 text-green-400";
    if (v === "invalid") return "bg-red-500/20 text-red-400";
    return "bg-white/10 text-white";
  };

  return (
    <div className="p-8 overflow-y-auto bg-[#0a0a0a] h-screen text-white">
      <h1 className="text-3xl font-semibold mb-6">Reports</h1>

      {/* SCROLLABLE LIST */}
      <div className="space-y-4 overflow-y-auto overflow-x-visible pr-2 scrollbar-hide">
        {data.map((item, index) => (
          <div
            key={index}
            className={`group relative flex justify-between items-center p-4 rounded-2xl bg-[#111] border ${getBorderColor(
              item.biobert
            )} transition-all duration-200 hover:scale-[1.01]`}
          >
            {/* Query */}
            <p className="text-white/90 max-w-[80%]">
              {item.query}
            </p>

            {/* Verdict Badge */}
            <span
              className={`px-3 py-1 text-sm rounded-full font-medium ${getBadgeColor(
                item.biobert
              )}`}
            >
              {item.biobert}
            </span>

            {/* Hover Info */}
            <div className="fixed hidden group-hover:block z-[9999] bg-[#1a1a1a] border border-white/10 text-sm text-white p-3 rounded-xl shadow-lg"
                style={{
                top: "50%",
                right: "20px",
                transform: "translateY(-50%)"
     }}>
              <p>
                <span className="text-white/60">Tone:</span> {item.tone}
              </p>
              <p>
                <span className="text-white/60">Confidence:</span>{" "}
                {item.confidence.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
