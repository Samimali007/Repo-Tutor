import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, repoUrl, readme, repoInfo, action } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userMessages = messages || [];

    if (action === "analyze") {
      systemPrompt = `You are a senior software engineer and mentor.

Analyze the following GitHub repository:
${repoUrl}

Repository Info:
- Name: ${repoInfo?.name || "Unknown"}
- Description: ${repoInfo?.description || "No description"}
- Language: ${repoInfo?.language || "Unknown"}
- Stars: ${repoInfo?.stargazers_count || 0}
- Forks: ${repoInfo?.forks_count || 0}
- Topics: ${repoInfo?.topics?.join(", ") || "None"}

README Content:
${readme || "No README available"}

Explain in simple and structured format using markdown with these exact section headers:

## 📌 Project Overview
What problem it solves and what the project does.

## 🧰 Tech Stack
Languages, frameworks, tools used.

## 📁 Folder Structure
Explain the likely folder structure.

## 📄 Important Files
Key files and their roles.

## 🔄 Backend Flow
Step-by-step backend flow.

## 🎨 Frontend Flow
Frontend flow if it exists.

## 🗄️ Database Usage
Database usage if any.

## 🛤️ API Routes
API routes if applicable.

## ⚙️ How to Run
Step-by-step instructions to run the project.

## 🎓 Beginner Explanation
Simple beginner-friendly explanation.

Make it easy to understand, structured, and beginner-friendly.`;
      userMessages = [{ role: "user", content: "Please analyze this repository now." }];
    } else if (action === "resume") {
      systemPrompt = `You are a career coach. Based on this GitHub repository (${repoUrl}), generate 5 resume-ready bullet points that highlight technical skills demonstrated. Format as a markdown list. README: ${readme || "N/A"}`;
      userMessages = [{ role: "user", content: "Generate resume points." }];
    } else if (action === "viva") {
      systemPrompt = `You are a technical interviewer. Based on this GitHub repository (${repoUrl}), generate 7 interview/viva questions with brief answers. Format with markdown. README: ${readme || "N/A"}`;
      userMessages = [{ role: "user", content: "Generate viva questions." }];
    } else if (action === "beginner") {
      systemPrompt = `You are a patient teacher explaining to a complete beginner. Explain this GitHub repository (${repoUrl}) as if the reader has never coded before. Use simple analogies and avoid jargon. README: ${readme || "N/A"}`;
      userMessages = [{ role: "user", content: "Explain like I'm a beginner." }];
    } else if (action === "readme") {
      systemPrompt = `You are a technical writer. Generate a professional README.md for this GitHub repository (${repoUrl}). Include badges, installation, usage, contributing guidelines. Current README: ${readme || "N/A"}`;
      userMessages = [{ role: "user", content: "Generate a README." }];
    } else if (action === "chat") {
      systemPrompt = `You are a helpful AI mentor with deep knowledge of this GitHub repository:
URL: ${repoUrl}
README: ${readme || "N/A"}

Answer questions about this repository in a clear, helpful way. Use markdown formatting.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...userMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});