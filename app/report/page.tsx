"use client";

export default function ReportPage() {

  const sampleReport = {
    repo: "...",
    score: 82,
    riskLevel: "Medium",
    generatedAt: new Date().toLocaleString(),
    findings: [
      "Dependency vulnerability found",
      "Outdated package version",
    ],
    recommendations: [
      "Update dependencies",
      "Review security policies",
    ],
  };

  function exportReport() {
    const report = {
      repo: sampleReport.repo,
      score: sampleReport.score,
      riskLevel: sampleReport.riskLevel,
      findings: sampleReport.findings,
      recommendations: sampleReport.recommendations,
      generatedAt: sampleReport.generatedAt,
    };

    const blob = new Blob(
      [JSON.stringify(report, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "orbitops-report.json";
    a.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">
      <h1 className="text-4xl font-bold mb-8">OrbitOps AI Reports</h1>

      <button
        onClick={exportReport}
        className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-semibold"
      >
        Export JSON
      </button>
    </main>
  );
}