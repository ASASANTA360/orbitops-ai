"use client";

import { useState } from "react";

type AnalysisResult = {
  repo: string;
  score: number;
  riskLevel: string;
  findings: string[];
  recommendations: string[];
};

export default function AnalyzePage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  async function analyzeRepo() {
    setLoading(true);

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ repoUrl }),
    });

    const data = await res.json();

    setResult(data);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold">Analyze Repository</h1>

        <p className="text-slate-400 mt-3">
          Enter a GitLab repository URL. OrbitOps AI will use GitLab Orbit-style
          context to generate DevOps and security insights.
        </p>

        <div className="bg-slate-900 rounded-2xl p-6 mt-8">
          <input
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://gitlab.com/group/project"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 outline-none"
          />

          <button
            onClick={analyzeRepo}
            disabled={loading || !repoUrl}
            className="mt-5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 px-6 py-3 rounded-xl font-semibold"
          >
            {loading ? "Analyzing..." : "Run Analysis"}
          </button>
        </div>

        {result && (
          <div className="bg-slate-900 rounded-2xl p-6 mt-8">
            <h2 className="text-2xl font-bold mb-4">Analysis Report</h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-slate-800 p-5 rounded-xl">
                <p className="text-slate-400">Repository</p>
                <p className="font-semibold break-all">{result.repo}</p>
              </div>

              <div className="bg-slate-800 p-5 rounded-xl">
                <p className="text-slate-400">Quality Score</p>
                <p className="text-3xl font-bold">{result.score}/100</p>
              </div>

              <div className="bg-slate-800 p-5 rounded-xl">
                <p className="text-slate-400">Risk Level</p>
                <p className="text-3xl font-bold">{result.riskLevel}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div>
                <h3 className="font-bold mb-3">Findings</h3>
                <ul className="space-y-2 text-slate-300">
                  {result.findings.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold mb-3">Recommendations</h3>
                <ul className="space-y-2 text-slate-300">
                  {result.recommendations.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}