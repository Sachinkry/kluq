// Use unpdf - platform-agnostic PDF.js for serverless environments
// Inspired by: https://github.com/RihanArfan/chat-with-pdf
import { getDocumentProxy, extractText } from 'unpdf'

// export async function extractPdfText(buffer: Buffer): Promise<string> {
//   try {
//     // Convert Buffer to Uint8Array for unpdf
//     const uint8Array = new Uint8Array(buffer);
    
//     // Get document proxy
//     const pdf = await getDocumentProxy(uint8Array);
    
//     // Extract text with mergePages option to combine all pages
//     const result = await extractText(pdf, { mergePages: true });
    
//     // Handle both array and string results
//     return Array.isArray(result.text) ? result.text.join(' ') : result.text || "";
//   } catch (error: any) {
//     console.error("Error extracting PDF text:", error);
//     throw new Error(`Failed to extract text from PDF: ${error.message}`);
//   }
// }

// src/lib/extract-pdf.ts

// src/lib/extract-pdf.ts
export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    // FIX: Convert Node Buffer to standard Uint8Array to satisfy Blob type
    const blob = new Blob([new Uint8Array(buffer)], { type: 'application/pdf' });
    
    const formData = new FormData();
    formData.append("file", blob, "paper.pdf");

    // Call your local Python Docling service
    const response = await fetch("http://127.0.0.1:8000/parse", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
        throw new Error(`Docling service error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.text; // Returns high-quality Markdown
  } catch (error) {
    console.error("Docling parsing failed:", error);
    throw error; 
  }
}