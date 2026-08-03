import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AnalysisResults } from "@/components/AnalysisResults";
import { ChatPanel } from "@/components/ChatPanel";
import { ActionButtons } from "@/components/ActionButtons";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { streamAI } from "@/lib/streaming";
import { ArrowLeft, ExternalLink, Star, GitFork } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

interface RepoData {
  url: string;
  repoInfo: {
    name: string;
    description: string;
    language: string;
    stargazers_count: number;
    forks_count: number;
    topics?: string[];
    html_url: string;
    owner?: { avatar_url?: string; login?: string };
  };
  readme: string;
}

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<RepoData | null>(null);
  const [analysis, setAnalysis] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [tab, setTab] = useState<"analysis" | "chat" | "actions">("analysis");

  useEffect(() => {
    const stored = sessionStorage.getItem("repotutor_data");
    if (!stored) {
      navigate({ to: "/" });
      return;
    }
    const parsed = JSON.parse(stored) as RepoData;
    setData(parsed);
    runAnalysis(parsed);
  }, []);

  const runAnalysis = async (d: RepoData) => {
    setAnalyzing(true);
    let full = "";
    await streamAI({
      repoUrl: d.url,
      readme: d.readme,
      repoInfo: d.repoInfo as unknown as Record<string, unknown>,
      action: "analyze",
      onDelta: (chunk) => {
        full += chunk;
        setAnalysis(full);
      },
      onDone: () => setAnalyzing(false),
      onError: (msg) => {
        setAnalysis(`Error: ${msg}`);
        setAnalyzing(false);
      },
    });
  };

  if (!data) return null;

  const tabs = [
    { id: "analysis" as const, label: "📊 Analysis" },
    { id: "chat" as const, label: "💬 Chat" },
    { id: "actions" as const, label: "🎯 Actions" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gradient">{data.repoInfo.name}</h1>
            <p className="text-sm text-muted-foreground line-clamp-1">{data.repoInfo.description}</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {data.repoInfo.language && (
              <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
                {data.repoInfo.language}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4" /> {data.repoInfo.stargazers_count}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="h-4 w-4" /> {data.repoInfo.forks_count}
            </span>
            <a href={data.repoInfo.html_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 hover:text-primary transition-colors" />
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-primary text-primary-foreground shadow-[0_0_15px_oklch(0.75_0.15_190/25%)]"
                  : "glass-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "analysis" && (
          <>
            {analyzing && !analysis && <LoadingAnalysis />}
            {analysis && <AnalysisResults content={analysis} />}
            {analyzing && analysis && (
              <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                Still analyzing...
              </div>
            )}
          </>
        )}

        {tab === "chat" && <ChatPanel repoUrl={data.url} readme={data.readme} />}

        {tab === "actions" && <ActionButtons repoUrl={data.url} readme={data.readme} />}
      </div>
    </div>
  );
}