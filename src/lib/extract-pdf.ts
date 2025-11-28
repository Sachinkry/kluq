import { getDocumentProxy, extractText } from 'unpdf';

export async function extractPdfText(buffer: Buffer): Promise<string> {
  // 1. Try High-Quality Parsing (Docling Service)
  try {
    const serviceUrl = process.env.PYTHON_SERVICE_URL;
    
    // Only attempt if configured (skip for simple Vercel demos)
    if (serviceUrl) {
      console.log("Attempting Docling parsing...");
      const blob = new Blob([new Uint8Array(buffer)], { type: 'application/pdf' });
      const formData = new FormData();
      formData.append("file", blob, "paper.pdf");

      // Set a short timeout so we don't hang if the service is sleeping/down
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(`${serviceUrl}/parse`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.text) return data.text; // Return Markdown from Docling
      }
    }
  } catch (error) {
    console.warn("Docling service unavailable/failed, falling back to local parser.", error);
  }

  // 2. Fallback: Local Parsing (unpdf)
  // Fast, free, runs everywhere, but loses layout structure.
  console.log("Using local PDF fallback...");
  try {
    const uint8Array = new Uint8Array(buffer);
    const pdf = await getDocumentProxy(uint8Array);
    const result = await extractText(pdf, { mergePages: true });
    return Array.isArray(result.text) ? result.text.join(' ') : result.text || "";
  } catch (error: any) {
    console.error("Local parsing failed:", error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}