import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="max-w-5xl px-8 text-center">
        <h1 className="text-6xl font-bold mb-6">
          OrbitOps AI
        </h1>

        <p className="text-xl text-slate-300 mb-10">
          AI-powered DevOps and Security Assistant built with GitLab Orbit.
          Analyze repositories, detect issues, and generate actionable reports.
        </p>

        <div className="flex gap-6 justify-center">
          <Link
            href="/analyze"
            className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-semibold"
          >
            Analyze Repository
          </Link>

          <Link
            href="/report"
            className="border border-slate-700 px-8 py-4 rounded-xl font-semibold"
          >
            View Reports
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-slate-900 p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">
              Security Analysis
            </h2>

            <p className="text-slate-400">
              Detect vulnerabilities and risky code patterns.
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">
              DevOps Insights
            </h2>

            <p className="text-slate-400">
              Improve CI/CD workflows and repository quality.
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">
              AI Reports
            </h2>

            <p className="text-slate-400">
              Generate actionable recommendations for developers.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}