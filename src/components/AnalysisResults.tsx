import ReactMarkdown from "react-markdown";
import { GlassCard } from "./GlassCard";

interface Props {
  content: string;
}

const sectionMap: Record<string, { icon: string; title: string }> = {
  "project overview": { icon: "📌", title: "Project Overview" },
  "tech stack": { icon: "🧰", title: "Tech Stack" },
  "folder structure": { icon: "📁", title: "Folder Structure" },
  "important files": { icon: "📄", title: "Important Files" },
  "backend flow": { icon: "🔄", title: "Backend Flow" },
  "frontend flow": { icon: "🎨", title: "Frontend Flow" },
  "database usage": { icon: "🗄️", title: "Database Usage" },
  "api routes": { icon: "🛤️", title: "API Routes" },
  "how to run": { icon: "⚙️", title: "How to Run" },
  "beginner explanation": { icon: "🎓", title: "Beginner Explanation" },
};

function parseSections(content: string) {
  const sections: { icon: string; title: string; content: string }[] = [];
  const lines = content.split("\n");
  let current: { icon: string; title: string; content: string } | null = null;

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)/);
    if (h2Match) {
      if (current) sections.push(current);
      const raw = h2Match[1].replace(/[^\w\s]/g, "").trim().toLowerCase();
      const mapped = Object.entries(sectionMap).find(([k]) => raw.includes(k));
      current = {
        icon: mapped?.[1].icon || "📋",
        title: mapped?.[1].title || h2Match[1].replace(/^[^\w]*/, "").trim(),
        content: "",
      };
    } else if (current) {
      current.content += line + "\n";
    }
  }
  if (current) sections.push(current);
  return sections;
}

export function AnalysisResults({ content }: Props) {
  const sections = parseSections(content);

  if (sections.length === 0) {
    return (
      <GlassCard icon="📋" title="Analysis">
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sections.map((s, i) => (
        <GlassCard
          key={i}
          icon={s.icon}
          title={s.title}
          className={`animate-fade-in-up`}
        >
          <div className="prose prose-invert prose-sm max-w-none overflow-x-auto break-words [&_pre]:overflow-x-auto [&_code]:break-all [&_pre]:max-w-full">
            <ReactMarkdown>{s.content.trim()}</ReactMarkdown>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}