const JINA_API_KEY = process.env.JINA_API_KEY;

export async function generateEmbedding(text: string): Promise<number[]> {
  const embeddings = await generateEmbeddings([text]);
  return embeddings[0];
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (!JINA_API_KEY) throw new Error("JINA_API_KEY is not set");

  const response = await fetch("https://api.jina.ai/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${JINA_API_KEY}`,
    },
    body: JSON.stringify({
      model: "jina-embeddings-v3", // SOTA model
      // 'retrieval.passage' optimizes vectors for storage/indexing
      task: "retrieval.passage", 
      dimensions: 1024,
      late_chunking: false,
      input: texts,
    }),
  });

  if (!response.ok) {
    throw new Error(`Jina API Error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data.map((d: any) => d.embedding);
}