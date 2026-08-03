import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "./GlassCard";
import ReactMarkdown from "react-markdown";
import { streamAI } from "@/lib/streaming";
import { FileText, HelpCircle, BookOpen, FileCode, Copy, Check } from "lucide-react";

interface Props {
  repoUrl: string;
  readme: string;
}

const actions = [
  { id: "resume", label: "Resume Points", icon: FileText },
  { id: "viva", label: "Viva Questions", icon: HelpCircle },
  { id: "beginner", label: "Explain Like Beginner", icon: BookOpen },
  { id: "readme", label: "Generate README", icon: FileCode },
] as const;

export function ActionButtons({ repoUrl, readme }: Props) {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const run = async (action: string) => {
    setResult("");
    setLoading(action);
    setActiveAction(action);
    let full = "";
    await streamAI({
      repoUrl,
      readme,
      action,
      onDelta: (chunk) => {
        full += chunk;
        setResult(full);
      },
      onDone: () => setLoading(null),
      onError: (msg) => {
        setResult(`Error: ${msg}`);
        setLoading(null);
      },
    });
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <GlassCard icon="🎯" title="Quick Actions">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((a) => (
            <Button
              key={a.id}
              variant="glass"
              className="justify-start gap-2 h-auto py-3"
              onClick={() => run(a.id)}
              disabled={loading !== null}
            >
              <a.icon className="h-4 w-4 text-primary" />
              <span className="text-sm">{a.label}</span>
              {loading === a.id && (
                <div className="ml-auto w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              )}
            </Button>
          ))}
        </div>
      </GlassCard>

      {result && (
        <GlassCard
          icon={actions.find((a) => a.id === activeAction)?.label ? "✨" : "📋"}
          title={actions.find((a) => a.id === activeAction)?.label || "Result"}
        >
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-0 right-0"
              onClick={copyResult}
            >
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </Button>
            <div className="prose prose-invert prose-sm max-w-none pr-10">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}