// QueryAnalyzer.tsx (NEW FILE)
import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function QueryAnalyzer() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
  if (!query.trim()) return;

  setLoading(true);

  try {
    const response = await fetch('http://localhost:8000/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    
    const data = await response.json();
    setResult(data);

    console.log("API response:", data);

    // 🔥 SAVE TO FIRESTORE
    const userId = "user1"; // replace with actual auth user later

    console.log("Saving to Firestore...");

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

    console.log("Saved successfully!");
    

  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  

  return (
    <div className="p-6 text-white">
      <h2 className="text-xl font-semibold mb-4">Data Analyzer</h2>

      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter medical query..."
        className="w-full bg-white/5 p-3 rounded-lg border border-white/10 mb-3"
        rows={4}
      />

      <button
        onClick={handleSubmit}
        className="bg-emerald-500 text-black px-4 py-2 rounded-lg"
      >
        {loading ? 'Analyzing...' : 'Submit'}
      </button>

      {result && (
            <div>
                <p><strong>Tone:</strong> {result.tone}</p>
                <p><strong>Validity:</strong> {result.biobert}</p>
                <p><strong>Confidence:</strong> {result.confidence}</p>
                
            </div>
    )}
    </div>
  );
}
