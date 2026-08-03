export function LoadingAnalysis() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <div className="absolute inset-0 w-20 h-20 rounded-full animate-pulse-glow bg-primary/10" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-foreground">Analyzing Repository...</p>
        <p className="text-sm text-muted-foreground">Fetching data and generating insights</p>
      </div>
    </div>
  );
}