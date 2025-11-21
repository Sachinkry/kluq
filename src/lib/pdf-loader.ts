// Use unpdf - platform-agnostic PDF.js for serverless environments
import { getDocumentProxy, extractText } from 'unpdf'
 
export async function getPdfTextFromUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.statusText}`);
  
  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // Get document proxy
  const pdf = await getDocumentProxy(uint8Array);
  
  // Extract text with mergePages option to combine all pages
  const result = await extractText(pdf, { mergePages: true });
  
  // Handle both array and string results
  return Array.isArray(result.text) ? result.text.join(' ') : result.text || "";
}

export function recursiveChunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;
    
    // Try to find a sentence break to avoid cutting words/sentences awkwardly
    if (endIndex < text.length) {
      const nextSpace = text.indexOf(' ', endIndex);
      if (nextSpace !== -1 && nextSpace - endIndex < 100) {
        endIndex = nextSpace;
      }
    }

    const chunk = text.slice(startIndex, endIndex).replace(/\s+/g, " ").trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    startIndex += (chunkSize - overlap);
  }

  return chunks;
}