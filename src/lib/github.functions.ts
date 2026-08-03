import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const githubUrlSchema = z.object({
  url: z.string().min(1).max(500).regex(/github\.com\/[^/]+\/[^/]+/i, "Invalid GitHub URL"),
});

export const fetchRepoData = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => githubUrlSchema.parse(data))
  .handler(async ({ data }) => {
    const match = data.url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) throw new Error("Invalid GitHub URL");

    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, "").split("/")[0].split("?")[0].split("#")[0];

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "RepoTutor-AI",
    };

    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`, { headers });
    if (!repoRes.ok) throw new Error(`Repository not found (${repoRes.status})`);
    const repoInfo = await repoRes.json();

    let readme = "";
    try {
      const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/readme`, { headers });
      if (readmeRes.ok) {
        const readmeData = await readmeRes.json();
        const decoded = atob(readmeData.content);
        readme = decoded.length > 15000 ? decoded.substring(0, 15000) + "\n...(truncated)" : decoded;
      }
    } catch {
      readme = "README not available";
    }

    return { repoInfo, readme };
  });
