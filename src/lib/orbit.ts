type GitLabFile = {
  file_path: string;
  content: string;
};

function parseGitLabProjectPath(repoUrl: string) {
  const url = new URL(repoUrl);
  return url.pathname.replace(/^\/|\/$/g, "");
}

function headers(): Record<string, string> {
  const token = process.env.GITLAB_TOKEN;
  return token ? { "PRIVATE-TOKEN": token } : {};
}

async function gitlabFetch(path: string) {
  const res = await fetch(`https://gitlab.com/api/v4${path}`, {
    headers: headers(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitLab API failed: ${res.status} ${text}`);
  }

  return res.json();
}

async function fetchRawFile(
  encodedProject: string,
  filePath: string,
  branch: string
) {
  const encodedFile = encodeURIComponent(filePath);

  const res = await fetch(
    `https://gitlab.com/api/v4/projects/${encodedProject}/repository/files/${encodedFile}/raw?ref=${encodeURIComponent(
      branch
    )}`,
    { headers: headers() }
  );

  if (!res.ok) return null;

  return res.text();
}

export async function getOrbitContext(repoUrl: string) {
  const projectPath = parseGitLabProjectPath(repoUrl);
  const encodedProject = encodeURIComponent(projectPath);

  const project = await gitlabFetch(`/projects/${encodedProject}`);

  console.log("Project:", project.path_with_namespace);
  console.log("Default branch:", project.default_branch);

  const branch = project.default_branch || "main";

  const candidateFiles = [
    "README.md",
    "README.adoc",
    "readme.md",
    ".gitlab-ci.yml",
    "go.mod",
    "package.json",
    "tsconfig.json",
    "next.config.ts",
    "next.config.js",
    "Dockerfile",
  ];

  const files: GitLabFile[] = [];

  for (const filePath of candidateFiles) {
    const content = await fetchRawFile(encodedProject, filePath, branch);

    if (content) {
      files.push({
        file_path: filePath,
        content,
      });
    }
  }

  console.log(
    "Files analyzed:",
    files.map((f) => f.file_path)
  );

  return {
    repoUrl,
    projectName: project.name,
    defaultBranch: branch,
    visibility: project.visibility,
    stars: project.star_count,
    forks: project.forks_count,
    source: "GitLab Orbit-style repository context",
    filesAnalyzed: files.map((f) => f.file_path),
    files,
  };
}