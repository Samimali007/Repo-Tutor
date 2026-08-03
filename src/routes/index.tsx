import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchRepoData } from "@/lib/github.functions";
import { Github, Sparkles, ArrowRight, BookOpen, Code, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const analyze = async () => {
    if (!url.trim()) return;
    if (!/github\.com\/[^/]+\/[^/]+/.test(url)) {
      setError("Please enter a valid GitHub repository URL");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await fetchRepoData({ data: { url } });
      sessionStorage.setItem("repotutor_data", JSON.stringify({ url, ...data }));
      navigate({ to: "/dashboard" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch repository");
      setLoading(false);
    }
  };

  const features = [
    { icon: BookOpen, title: "Deep Analysis", desc: "Complete project breakdown with tech stack, architecture, and flow" },
    { icon: MessageSquare, title: "Chat with Repo", desc: "Ask anything about the codebase like talking to a mentor" },
    { icon: Code, title: "Smart Actions", desc: "Generate resume points, viva questions, and beginner explanations" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Glow effects */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full bg-accent/10 blur-[100px] animate-pulse-glow pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-20 pb-16">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered Repository Mentor
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
            <span className="text-gradient">RepoTutor</span>{" "}
            <span className="text-foreground">AI</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Paste any GitHub repo URL and get an instant AI-generated explanation — like having a senior developer mentor by your side.
          </p>
        </div>

        {/* Input */}
        <div className="glass-card glow-border p-2 max-w-2xl mx-auto mb-16 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 flex-1 bg-input rounded-xl px-4">
              <Github className="h-5 w-5 text-muted-foreground shrink-0" />
              <input
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && analyze()}
                placeholder="https://github.com/owner/repo"
                className="flex-1 bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                disabled={loading}
              />
            </div>
            <Button variant="glow" onClick={analyze} disabled={loading || !url.trim()} className="px-6">
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
              ) : (
                <>
                  Analyze <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
          {error && <p className="text-destructive text-sm px-4 py-2">{error}</p>}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="glass-card p-6 text-center animate-fade-in-up hover:glow-border transition-shadow duration-300"
              style={{ animationDelay: `${0.3 + i * 0.1}s` }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
