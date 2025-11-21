export function chunk(text: string, size = 1200) {
    const words = text.split(" ");
    const chunks = [];
    for (let i = 0; i < words.length; i += size) {
      chunks.push(words.slice(i, i + size).join(" "));
    }
    return chunks;
  }
  
  export function chunkText(text: string, size = 1200): string[] {
    const words = text.split(/\s+/);
    const result: string[] = [];
  
    for (let i = 0; i < words.length; i += size) {
      result.push(words.slice(i, i + size).join(" "));
    }
  
    return result;
  }