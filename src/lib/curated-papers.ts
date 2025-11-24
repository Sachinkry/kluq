// src/lib/curated-papers.ts
import { Paper } from "@/modules/search/ui/components/paper-card";

export const CURATED_TOPICS = [
  "Transformers",
  "Diffusion",
  "Vision",
  "TTS",
  "Fine-Tuning",
  "Evaluations",
  "RL",
  "RLHF",
] as const;

export type CuratedCategory = typeof CURATED_TOPICS[number];

// Removed 'summary' param and field
const createPaper = (id: string, title: string, authors: string, year: string, category: string, descriptionContext: string): Paper => ({
    id,
    title,
    authors,
    published: year,
    categories: [category, "cs.AI"],
    pdfUrl: `https://arxiv.org/pdf/${id}.pdf`,
    // Using the context provided to generate a pseudo-abstract for the curated list
    abstract: `${descriptionContext} This seminal paper introduces novel techniques in ${category} that have become foundational to modern AI research.`
});

export const CURATED_PAPERS: Record<CuratedCategory, Paper[]> = {
  Transformers: [
    createPaper("1706.03762", "Attention Is All You Need", "Vaswani et al.", "2017", "cs.CL", 
        "Proposed the Transformer architecture, replacing RNNs with self-attention mechanisms."),
    createPaper("1810.04805", "BERT: Pre-training of Deep Bidirectional Transformers", "Devlin et al.", "2018", "cs.CL",
        "Introduced bidirectional training of Transformer encoders using Masked Language Modeling."),
    createPaper("2005.14165", "Language Models are Few-Shot Learners (GPT-3)", "Brown et al.", "2020", "cs.CL", 
        "Demonstrated that scaling up language models to 175B parameters dramatically improves few-shot performance."),
  ],
  Diffusion: [
    createPaper("2006.11239", "Denoising Diffusion Probabilistic Models (DDPM)", "Ho et al.", "2020", "cs.CV", 
        "Revived diffusion models by showing they could generate high-quality images matching GAN performance."),
    createPaper("2112.10752", "High-Resolution Image Synthesis with Latent Diffusion Models", "Rombach et al.", "2021", "cs.CV", 
        "Introduced Stable Diffusion by applying diffusion in a compressed latent space."),
  ],
  Vision: [
    createPaper("2010.11929", "An Image is Worth 16x16 Words (ViT)", "Dosovitskiy et al.", "2020", "cs.CV", 
        "Applied the pure Transformer architecture directly to image patches."),
    createPaper("1512.03385", "Deep Residual Learning for Image Recognition (ResNet)", "He et al.", "2015", "cs.CV", 
        "Introduced skip connections (residual blocks) to train extremely deep networks."),
  ],
  TTS: [
    createPaper("2301.02111", "Neural Codec Language Models are Zero-Shot Text to Speech Synthesizers (VALL-E)", "Wang et al.", "2023", "cs.SD",
        "Modeled TTS as a language modeling task using audio codec codes."),
  ],
  "Fine-Tuning": [
    createPaper("2106.09685", "LoRA: Low-Rank Adaptation of Large Language Models", "Hu et al.", "2021", "cs.CL", 
        "Proposed freezing pre-trained weights and injecting trainable rank decomposition matrices."),
    createPaper("2305.14314", "QLoRA: Efficient Finetuning of Quantized LLMs", "Dettmers et al.", "2023", "cs.LG", 
        "Combined 4-bit quantization with LoRA for efficient fine-tuning."),
  ],
  Evaluations: [
    createPaper("2009.03300", "Measuring Massive Multitask Language Understanding (MMLU)", "Hendrycks et al.", "2020", "cs.CY", 
        "Proposed a massive benchmark covering 57 subjects across STEM and humanities."),
  ],
  RL: [
    createPaper("1707.06347", "Proximal Policy Optimization Algorithms (PPO)", "Schulman et al.", "2017", "cs.LG", 
        "The default RL algorithm used by OpenAI, balancing implementation ease and sample complexity."),
  ],
  RLHF: [
    createPaper("2203.02155", "Training language models to follow instructions (InstructGPT)", "Ouyang et al.", "2022", "cs.CL", 
        "The paper behind ChatGPT, showing fine-tuning on human feedback aligns models better."),
  ],
};