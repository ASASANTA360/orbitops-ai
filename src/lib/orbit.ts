export async function getOrbitContext(repoUrl: string) {
  return {
    repoUrl,
    source: "GitLab Orbit",
    contextType: "repository-knowledge-graph",
    filesAnalyzed: [
      "package.json",
      ".gitlab-ci.yml",
      "src/",
      "app/",
      "README.md",
    ],
  };
}