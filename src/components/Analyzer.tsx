import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function QueryAnalyzer() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [explanation, setExplanation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [explaining, setExplaining] = useState(false);

  const userId = "user1";

  const handleSubmit = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setExplanation(null);

    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      const data = await response.json();
      setResult(data);

      // 🔥 Save to Firestore
      await addDoc(
        collection(db, "Users", userId, "queries"),
        {
          query: query,
          biobert: data.biobert,
          tone: data.tone,
          confidence: data.confidence ?? null,
          createdAt: serverTimestamp()
        }
      );

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 NEW: Explain function
  const handleExplain = async () => {
    if (!query.trim()) return;

    setExplaining(true);

    try {
      const response = await fetch('http://localhost:8000/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      const data = await response.json();

      setExplanation(data); 
      // expected format:
      // { reasoning: "...", sources: [{title, url}] }

    } catch (error) {
      console.error(error);
    } finally {
      setExplaining(false);
    }
  };

  return (
    <div className="p-6 text-white space-y-4">
      <h2 className="text-xl font-semibold">Data Analyzer</h2>

      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter medical query..."
        className="w-full bg-white/5 p-3 rounded-lg border border-white/10"
        rows={4}
      />

      {/* 🔥 Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          className="bg-emerald-500 text-black px-4 py-2 rounded-lg"
        >
          {loading ? 'Analyzing...' : 'Submit'}
        </button>

        <button
          onClick={handleExplain}
          className="bg-emerald-500 text-black px-4 py-2 rounded-lg"
        >
          {explaining ? 'Explaining...' : 'Explain'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-2">
          <p><strong>Tone:</strong> {result.tone}</p>
          <p><strong>Validity:</strong> {result.biobert}</p>
          <p><strong>Confidence:</strong> {result.confidence}</p>
        </div>
      )}

      {/* 🔥 Explanation Section */}
      {explanation && (
        <div className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-4">
          
          <div>
            <h3 className="font-semibold text-emerald-400 mb-2">Explanation</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              {explanation.reasoning}
            </p>
          </div>

          {/* Sources */}
          {explanation.sources && explanation.sources.length > 0 && (
            <div>
              <h3 className="font-semibold text-emerald-400 mb-2">Sources</h3>
              <div className="space-y-2">
                {explanation.sources.map((src: any, idx: number) => (
                  <a
                    key={idx}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-400 text-sm underline"
                  >
                    {src.title}
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
