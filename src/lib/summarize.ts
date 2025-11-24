// src/lib/summarize.ts
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateStructuredSummary(fullText: string) {
  // Grab the first 50k characters (~10-12k tokens). 
  // This usually covers the Abstract, Intro, Methodology, and early Results.
  // Gemini Flash supports 1M tokens, so we can be generous here.
  const context = fullText.slice(0, 50000); 

  try {
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      system: "You are a senior academic researcher. Synthesize technical papers into structured insights.",
      prompt: `Analyze the provided research paper text and generate a structured summary in Markdown.
      
      Output strictly in this format:
      **Core Problem:** [What specific gap is this paper trying to fill?]
      **Methodology:** [Technical approach, architecture, or algorithms used]
      **Key Results:** [Specific metrics, benchmarks, or discoveries]
      **Implications:** [Why does this matter?]
      
      TEXT TO ANALYZE:
      ${context}`,
    });
    
    return text;
  } catch (error) {
    console.error("Summary generation failed:", error);
    return "Summary unavailable.";
  }
}