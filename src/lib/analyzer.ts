import { ai } from "./gemini";

type GitLabFile = {
  file_path: string;
  content: string;
};

type OrbitContext = {
  repoUrl: string;
  projectName: string;
  defaultBranch: string;
  visibility: string;
  stars: number;
  forks: number;
  source: string;
  filesAnalyzed: string[];
  files: GitLabFile[];
};

export async function analyzeRepository(
  repoUrl: string,
  orbitContext: OrbitContext
) {
  let score = 100;
  const findings: string[] = [];
  const recommendations: string[] = [];

  const hasReadme =
    orbitContext.filesAnalyzed.includes("README.md") ||
    orbitContext.filesAnalyzed.includes("README.adoc") ||
    orbitContext.filesAnalyzed.includes("readme.md");

  const hasPackageJson = orbitContext.filesAnalyzed.includes("package.json");
  const hasGitlabCi = orbitContext.filesAnalyzed.includes(".gitlab-ci.yml");
  const hasTsConfig = orbitContext.filesAnalyzed.includes("tsconfig.json");
  const hasGoMod = orbitContext.filesAnalyzed.includes("go.mod");
  const hasDockerfile = orbitContext.filesAnalyzed.includes("Dockerfile");

  const projectType = hasGoMod
    ? "Go"
    : hasPackageJson
    ? "Node.js"
    : "Unknown";

  if (!hasReadme) {
    score -= 15;
    findings.push("README file was not found.");
    recommendations.push(
      "Add a README with setup, usage, architecture, and contribution instructions."
    );
  }

  if (!hasGitlabCi) {
    score -= 20;
    findings.push(".gitlab-ci.yml was not found.");
    recommendations.push(
      "Add GitLab CI pipeline with test, build, and security scanning stages."
    );
  }

  if (hasPackageJson) {
    const packageFile = orbitContext.files.find(
      (f) => f.file_path === "package.json"
    );

    if (packageFile) {
      try {
        const pkg = JSON.parse(packageFile.content);
        const scripts = pkg.scripts || {};

        if (!scripts.test) {
          score -= 10;
          findings.push("No test script found in package.json.");
          recommendations.push("Add an automated test script and run it in CI.");
        }

        if (!scripts.build) {
          score -= 10;
          findings.push("No build script found in package.json.");
          recommendations.push(
            "Add a build script to validate production readiness."
          );
        }

        if (!pkg.license) {
          score -= 5;
          findings.push("No license field found in package.json.");
          recommendations.push("Add an OSI-approved license field, such as MIT.");
        }
      } catch {
        score -= 10;
        findings.push("package.json could not be parsed.");
        recommendations.push("Fix package.json formatting.");
      }
    }

    if (!hasTsConfig) {
      score -= 5;
      findings.push("tsconfig.json was not found.");
      recommendations.push(
        "Use TypeScript configuration for safer developer workflows."
      );
    }
  }

  if (hasGoMod) {
    recommendations.push(
      "Use Go security scanning such as govulncheck in the CI pipeline."
    );
    recommendations.push(
      "Track test coverage and linting for Go packages in GitLab CI."
    );
  }

  if (!hasPackageJson && !hasGoMod) {
    score -= 10;
    findings.push("No recognized dependency manifest was found.");
    recommendations.push(
      "Add a recognized dependency manifest such as package.json or go.mod."
    );
  }

  if (!hasDockerfile) {
    score -= 5;
    findings.push("Dockerfile was not found.");
    recommendations.push(
      "Add a Dockerfile if the project needs portable deployment or containerized testing."
    );
  }

  const ciFile = orbitContext.files.find(
    (f) => f.file_path === ".gitlab-ci.yml"
  );

  if (ciFile) {
    const ci = ciFile.content.toLowerCase();

    if (!ci.includes("test")) {
      score -= 10;
      findings.push("GitLab CI file does not appear to include a test stage.");
      recommendations.push("Add a test stage to GitLab CI.");
    }

    if (!ci.includes("security") && !ci.includes("sast") && !ci.includes("scan")) {
      score -= 10;
      findings.push("GitLab CI file does not include visible security scanning.");
      recommendations.push("Enable SAST or dependency scanning in GitLab CI.");
    }
  }

  score = Math.max(0, Math.min(100, score));

  const riskLevel = score >= 80 ? "Low" : score >= 60 ? "Medium" : "High";

  if (findings.length === 0) {
    findings.push("No major issues detected from available repository context.");
    recommendations.push(
      "Continue improving CI/CD, security scanning, documentation, and release readiness."
    );
  }

  const baseSummary = `OrbitOps AI analyzed ${orbitContext.filesAnalyzed.length} real repository files from GitLab and generated a ${riskLevel} risk report for a ${projectType} project.`;

  const prompt = `
You are OrbitOps AI, a DevOps and security review assistant.

Repository: ${repoUrl}
Project name: ${orbitContext.projectName}
Project type: ${projectType}
Default branch: ${orbitContext.defaultBranch}
Visibility: ${orbitContext.visibility}
Stars: ${orbitContext.stars}
Forks: ${orbitContext.forks}
Files analyzed: ${orbitContext.filesAnalyzed.join(", ")}
Score: ${score}/100
Risk level: ${riskLevel}

Findings:
${findings.join("\n")}

Recommendations:
${recommendations.join("\n")}

Write a concise developer-facing report with:
1. Executive summary
2. Security concerns
3. DevOps improvements
4. Next actions

Keep it practical and under 180 words.
`;

  let aiSummary = "";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    aiSummary = response.text || baseSummary;
  } catch (error) {
    console.error("Gemini summary failed:", error);
    aiSummary = baseSummary;
  }

  return {
    repo: repoUrl,
    projectName: orbitContext.projectName,
    projectType,
    score,
    riskLevel,
    orbitContext: {
      source: orbitContext.source,
      defaultBranch: orbitContext.defaultBranch,
      visibility: orbitContext.visibility,
      stars: orbitContext.stars,
      forks: orbitContext.forks,
      filesAnalyzed: orbitContext.filesAnalyzed,
    },
    findings,
    recommendations,
    summary: baseSummary,
    aiSummary,
  };
}