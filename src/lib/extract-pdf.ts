// Use unpdf - platform-agnostic PDF.js for serverless environments
// Inspired by: https://github.com/RihanArfan/chat-with-pdf
import { getDocumentProxy, extractText } from 'unpdf'

export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    // Convert Buffer to Uint8Array for unpdf
    const uint8Array = new Uint8Array(buffer);
    
    // Get document proxy
    const pdf = await getDocumentProxy(uint8Array);
    
    // Extract text with mergePages option to combine all pages
    const result = await extractText(pdf, { mergePages: true });
    
    // Handle both array and string results
    return Array.isArray(result.text) ? result.text.join(' ') : result.text || "";
  } catch (error: any) {
    console.error("Error extracting PDF text:", error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}
