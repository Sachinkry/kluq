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

const createPaper = (
  id: string,
  title: string,
  authors: string,
  year: string,
  category: string,
  descriptionContext: string
): Paper => ({
  id,
  title,
  authors,
  published: year,
  categories: [category, "cs.AI"],
  pdfUrl: `https://arxiv.org/pdf/${id}.pdf`,
  abstract: `${descriptionContext} This work significantly impacted the evolution of ${category}, pushing forward both theoretical and practical capabilities in the field. It introduced methodological innovations that reshaped how models are built, trained, or evaluated. The ideas here continue to influence contemporary research directions and benchmark standards.`
});

export const CURATED_PAPERS: Record<CuratedCategory, Paper[]> = {

  // ---------------------------------------------------------
  //  TRANSFORMERS (10 seminal papers)
  // ---------------------------------------------------------
  Transformers: [
    createPaper("1706.03762", "Attention Is All You Need", "Vaswani et al.", "2017", "cs.CL",
      "Introduced the Transformer architecture that removed recurrence entirely and replaced it with multi-head self-attention. This innovation drastically improved parallelizability and scaling behavior. It redefined sequence modeling and became the backbone of modern LLMs. Its design proved that bigger, simpler models outperform complex handcrafted architectures."),

    createPaper("1810.04805", "BERT: Pre-training of Deep Bidirectional Transformers", "Devlin et al.", "2018", "cs.CL",
      "Introduced bidirectional masked-language-modeling as a pretraining strategy for deep Transformer encoders. BERT shifted NLP from task-specific architectures toward general-purpose pretrained backbones. It achieved SOTA on numerous benchmarks instantly upon release. Its training paradigm reshaped the entire industry’s approach to language understanding."),

    createPaper("2005.14165", "Language Models are Few-Shot Learners (GPT-3)", "Brown et al.", "2020", "cs.CL",
      "Showed that scaling laws dominate performance and few-shot learning emerges in large LMs. GPT-3 demonstrated meta-learning behaviors without gradient updates. It validated the 'scale is all you need' hypothesis later formalized by DeepMind. It set the stage for instruction-tuned models."),

    createPaper("1906.08237", "XLNet: Generalized Autoregressive Pretraining", "Yang et al.", "2019", "cs.CL",
      "Proposed permutation-based autoregressive pretraining to overcome BERT’s limitations. XLNet preserved bidirectional context without corrupting data with masks. It delivered strong improvements in reasoning-heavy tasks. This work influenced later hybrid objectives used in modern LLMs."),

    createPaper("1910.10683", "T5: Exploring the Limits of Transfer Learning", "Raffel et al.", "2020", "cs.CL",
      "Unified all NLP tasks into a single text-to-text format with a massive pretraining effort. T5 showcased that consistent problem framing matters as much as architectural choice. It scaled training datasets aggressively, foreshadowing today’s LLM pipeline standards. Its design influenced PaLM, GPT-J, and many successors."),

    createPaper("1901.02860", "Transformer-XL: Attentive Language Models", "Dai et al.", "2019", "cs.CL",
      "Introduced recurrence into Transformers via segment-level memory. It solved the fixed-length context limitation and enabled reasoning over longer sequences. This became foundational for long-context models. The approach influenced later architectures like RWKV and linear-attention models."),

    createPaper("2001.04451", "Reformer: The Efficient Transformer", "Kitaev et al.", "2020", "cs.LG",
      "Reduced Transformer memory cost using locality-sensitive hashing attention. Reformer made large models more accessible on modest hardware. It proved that attention approximations can preserve performance while cutting resources. This inspired a wave of efficient Transformer variants."),

    createPaper("2204.02311", "PaLM: Scaling Language Modeling with Pathways", "Chowdhery et al.", "2022", "cs.CL",
      "Scaled Transformers to 540B parameters and revealed new emergent abilities. PaLM raised the bar for multilingual reasoning. The paper reinforced the importance of data quality and thoughtful scaling. It influenced the architectures behind Gemini and GPT-4 style models."),

    createPaper("2203.15556", "Training Compute-Optimal Large Language Models (Chinchilla)", "Hoffmann et al.", "2022", "cs.LG",
      "Introduced compute-optimal scaling laws showing most large models were undertrained. Chinchilla’s results fundamentally shifted the industry's understanding of parameter-to-token ratios. It revived focus on dataset size rather than parameter inflation. This became doctrine for post-2022 training runs."),

    createPaper("1909.11942", "ALBERT: A Lite BERT", "Lan et al.", "2020", "cs.CL",
      "Proposed parameter sharing and factorized embeddings to significantly reduce model size. ALBERT achieved competitive results while being far more efficient than BERT. It demonstrated that clever parameterization can match brute-force scaling. Many compact models today borrow ALBERT’s strategies."),
  ],

  // ---------------------------------------------------------
  //  DIFFUSION (10)
  // ---------------------------------------------------------
  Diffusion: [
    createPaper("2006.11239", "Denoising Diffusion Probabilistic Models (DDPM)", "Ho et al.", "2020", "cs.CV",
      "Revived diffusion models as viable generative models rivaling GANs in quality. The paper introduced a denoising-based forward and reverse process with stable likelihood training. Its clean objective catalyzed the generative renaissance. This work still underpins modern diffusion architectures."),

    createPaper("2105.05233", "Diffusion Models Beat GANs on Image Synthesis", "Dhariwal & Nichol", "2021", "cs.CV",
      "Extended DDPM with improved noise schedules and learned variances. These refinements dramatically boosted sample quality. It demonstrated the sensitivity of diffusion models to training heuristics. The paper set new state-of-the-art results in image generation."),

    createPaper("2112.10752", "High-Resolution Image Synthesis with Latent Diffusion Models", "Rombach et al.", "2022", "cs.CV",
      "Introduced diffusion in compressed latent spaces, enabling fast generation on consumer GPUs. The model separated perceptual compression from denoising. This architecture inspired a massive open ecosystem. Stable Diffusion became the most widely used foundation model outside LLMs."),

    createPaper("2011.13456", "Score-Based Generative Modeling through Stochastic Differential Equations", "Song et al.", "2021", "cs.LG",
      "Unified score matching with diffusion processes via SDEs. This formulation provided elegant theoretical grounding for generative diffusion. It outperformed GANs on several benchmarks. Nearly all modern diffusion models borrow from Score SDE theory."),

    createPaper("2207.12598", "Classifier-Free Guidance", "Ho & Salimans", "2022", "cs.LG",
      "Eliminated dependence on external classifiers for conditional diffusion. CFG became the backbone of controllable image synthesis. The technique balances fidelity and diversity using a simple interpolation trick. Virtually all conditional diffusion models now adopt CFG."),

    createPaper("2205.11487", "Photorealistic Text-to-Image Diffusion Models with Deep Language Understanding (Imagen)", "Saharia et al.", "2022", "cs.CV",
      "Showcased extremely high-fidelity text-to-image synthesis using large language models for embeddings. Imagen demonstrated that text encoders greatly influence image realism. It highlighted the importance of scaling both components symmetrically. Many successor models follow Imagen’s multi-stage strategy."),

    createPaper("2303.01469", "Consistency Models", "Song et al.", "2023", "cs.LG",
      "Proposed non-iterative generative models that match diffusion quality using far fewer steps. This challenged the assumption that diffusion must be slow. Consistency distillation became a performance accelerator for many frameworks. It laid groundwork for real-time generative pipelines."),

    createPaper("2307.01952", "SDXL: Improving Latent Diffusion Models for High-Resolution Image Synthesis", "Podell et al.", "2023", "cs.CV",
      "Extended Stable Diffusion with dual-base architectures and improved conditioning. SDXL achieved a new balance of detail and coherence. It proved that diffusion models could scale in both resolution and semantic control. The model quickly became an industry standard."),

    createPaper("2206.00927", "DPM-Solver: A Fast ODE Solver for Diffusion Probabilistic Models", "Lu et al.", "2022", "cs.LG",
      "Introduced high-order solvers for diffusion ODEs to drastically reduce inference steps. These solvers improved speed without sacrificing quality. Many real-time diffusion variants rely on its mathematics. It remains one of the most important works on diffusion efficiency."),

    createPaper("2208.12242", "DreamBooth: Fine Tuning Text-to-Image Diffusion Models", "Ruiz et al.", "2023", "cs.CV",
      "Enabled single-concept personalization of diffusion models. DreamBooth became the canonical method for custom subjects. It highlighted the surprisingly strong memorization behavior of diffusion. The technique accelerated the creator and fine-tuning ecosystem."),
  ],

  // ---------------------------------------------------------
  //  VISION (10)
  // ---------------------------------------------------------
  Vision: [
    createPaper("2010.11929", "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale (ViT)", "Dosovitskiy et al.", "2020", "cs.CV",
      "Applied pure Transformer architectures to image patches. ViT eliminated convolutional inductive biases yet achieved superior performance at scale. It marked the convergence of NLP and vision architectures. Today’s multimodal models largely descend from ViT principles."),

    createPaper("1512.03385", "Deep Residual Learning for Image Recognition (ResNet)", "He et al.", "2015", "cs.CV",
      "Introduced skip connections that enabled training neural networks far deeper than previously possible. ResNet shattered ImageNet records and became ubiquitous. Its core idea—residual learning—shows up in nearly every modern architecture. This paper remains one of the most cited in all of AI."),

    createPaper("1409.1556", "Very Deep Convolutional Networks for Large-Scale Image Recognition (VGG)", "Simonyan & Zisserman", "2014", "cs.CV",
      "Demonstrated that deep networks with uniform small kernels outperform more complex designs. VGG became a workhorse architecture for feature extraction. Its clean structure enabled extensive research on representations. It set important precedents before the rise of ResNet."),

    createPaper("1409.4842", "Going Deeper with Convolutions (Inception)", "Szegedy et al.", "2014", "cs.CV",
      "Introduced the Inception module to efficiently combine convolutions. It achieved top ImageNet performance with fewer parameters. This architecture balanced efficiency and expressiveness before the era of Transformers. Its modular design influenced many hybrid models."),

    createPaper("1506.01497", "Faster R-CNN: Towards Real-Time Object Detection with Region Proposal Networks", "Ren et al.", "2015", "cs.CV",
      "Brought region proposal networks into end-to-end training. Faster R-CNN massively accelerated object detection workflows. It set the foundation for modern real-time detectors. Many popular systems still build on its skeleton."),

    createPaper("1506.02640", "You Only Look Once: Unified, Real-Time Object Detection (YOLO)", "Redmon et al.", "2016", "cs.CV",
      "Unified object detection into a single forward pass. YOLO marked a shift toward real-time detection becoming the norm. It enabled a generation of practical robotics and vision applications. Its influence spans dozens of YOLO variants."),

    createPaper("1505.04597", "U-Net: Convolutional Networks for Biomedical Image Segmentation", "Ronneberger et al.", "2015", "cs.CV",
      "Proposed an encoder–decoder architecture with skip connections for segmentation. U-Net became dominant in medical imaging and high-precision vision tasks. Its structure is still the basis for diffusion models’ U-Nets. A surprisingly enduring architecture despite its simplicity."),

    createPaper("1703.06870", "Mask R-CNN", "He et al.", "2017", "cs.CV",
      "Extended Faster R-CNN to instance segmentation with a simple mask head. Mask R-CNN became a default tool in segmentation tasks. Its modularity strengthened the detect-segment pipeline. The design remains widely used today."),

    createPaper("2103.14030", "Swin Transformer: Hierarchical Vision Transformer using Shifted Windows", "Liu et al.", "2021", "cs.CV",
      "Introduced hierarchical vision Transformers using shifted windows. Swin matched or exceeded CNNs on many tasks. It proved Transformers could handle dense vision workloads efficiently. Many modern vision backbones now adopt similar hierarchies."),

    createPaper("2201.03545", "A ConvNet for the 2020s (ConvNeXt)", "Liu et al.", "2022", "cs.CV",
      "Modernized CNNs to compete with Transformers. ConvNeXt showed that careful engineering still lets CNNs shine. It revived interest in convolutional architectures. The work reinforced that old paradigms can evolve effectively."),
  ],

  // ---------------------------------------------------------
  //  TTS (10)
  // ---------------------------------------------------------
  TTS: [
    createPaper("2301.02111", "Neural Codec Language Models are Zero-Shot Text to Speech Synthesizers (VALL-E)", "Wang et al.", "2023", "cs.SD",
      "Modeled TTS as a language-modeling task over discrete audio tokens. VALL-E introduced strong zero-shot speaker generalization. It redefined what TTS systems could accomplish with codec-based representations. The model paved the way for LM-driven audio generation."),

    createPaper("1710.07654", "Deep Voice 3: Scaling Text-to-Speech with Convolutional Sequence Learning", "Ping et al.", "2017", "cs.CL",
      "Scaled fully-convolutional TTS architectures. Deep Voice 3 improved speed and quality dramatically. It introduced multi-speaker training with global conditioning. Its ideas influenced the later wave of non-autoregressive models."),

    createPaper("1712.05884", "Natural TTS Synthesis by Conditioning WaveNet on Mel Spectrograms (Tacotron 2)", "Shen et al.", "2017", "cs.CL",
      "Combined sequence-to-sequence phoneme modeling with WaveNet vocoders. Tacotron 2 achieved human-like naturalness for the first time. It set the gold standard for end-to-end TTS. Many foundational systems still derive from Tacotron's structure."),

    createPaper("1609.03499", "WaveNet: A Generative Model for Raw Audio", "van den Oord et al.", "2016", "cs.SD",
      "Introduced autoregressive raw-audio modeling using dilated convolutions. WaveNet produced unprecedented audio quality. It sparked the deep-learning revolution in speech synthesis. Nearly all modern vocoders trace back to it."),

    createPaper("2006.04558", "FastSpeech 2: Fast and High-Quality End-to-End Text to Speech", "Ren et al.", "2020", "cs.CL",
      "Enabled fully non-autoregressive TTS with variance predictors. FastSpeech 2 significantly accelerated inference. It improved controllability in pitch and duration. The architecture influenced commercial-quality pipelines."),

    createPaper("1910.11480", "Parallel WaveGAN: A Fast Waveform Generation Model Based on Generative Adversarial Networks", "Yamamoto et al.", "2019", "cs.SD",
      "Introduced GAN-based vocoding for realtime inference. Parallel WaveGAN produced high-fidelity audio with minimal compute. It challenged autoregressive vocoders’ dominance. This model became widely adopted in resource-constrained environments."),

    createPaper("2005.11129", "Glow-TTS: A Generative Flow for Text-to-Speech", "Kim et al.", "2020", "cs.CL",
      "Proposed a flow-based TTS model with exact likelihood. Glow-TTS enabled fast, stable, high-quality synthesis. It removed the need for teacher models. Many diffusion and flow models borrow Glow-TTS components."),

    createPaper("2209.06326", "NaturSpeech: End-to-End Text-to-Speech Synthesis with Human-Level Quality", "Tan et al.", "2022", "cs.SD",
      "Introduced multi-scale modeling for enhancing expressiveness. It improved prosody and emotional realism substantially. The architecture made speech synthesis more dynamic and human-like. Its design inspired later expressive TTS frameworks."),

    createPaper("2209.03143", "AudioLM: a Language Modeling Approach to Audio Generation", "Borsos et al.", "2022", "cs.SD",
      "Proposed multi-level token modeling of long-form audio. AudioLM demonstrated shockingly coherent long-range continuation. It blurred the boundary between speech generation and language modeling. Many follow-up models build on its hierarchical tokenization."),

    createPaper("2306.15687", "Voicebox: Text-Guided Multilingual Universal Speech Generation at Scale", "Le et al.", "2023", "cs.CL",
      "Meta introduced a generative speech model capable of style transfer and edit-in-place audio infilling. Voicebox demonstrated strong generalization from limited examples. It showed that LM-like paradigms extend naturally to speech. This work continues to influence multi-modal audio LLMs."),
  ],

  // ---------------------------------------------------------
  //  FINE-TUNING (10)
  // ---------------------------------------------------------
  "Fine-Tuning": [
    createPaper("2106.09685", "LoRA: Low-Rank Adaptation of Large Language Models", "Hu et al.", "2021", "cs.CL",
      "Introduced low-rank adaptation that freezes base weights while injecting small trainable matrices. LoRA delivered huge efficiency gains without sacrificing performance. It made fine-tuning billion-parameter models accessible to everyone. LoRA is now foundational in open-source ecosystems."),

    createPaper("2305.14314", "QLoRA: Efficient Finetuning of Quantized LLMs", "Dettmers et al.", "2023", "cs.LG",
      "Enabled fine-tuning of 33B+ models on a single GPU through 4-bit quantization. QLoRA became the gold standard for cheap LLM fine-tuning. It democratized serious experimentation. Its innovations now underpin most practical fine-tuning stacks."),

    createPaper("2203.02155", "Training language models to follow instructions with human feedback (InstructGPT)", "Ouyang et al.", "2022", "cs.CL",
      "Demonstrated instruction tuning + RLHF leads to massive preference improvements. InstructGPT repositioned LLMs from raw text predictors to aligned assistants. Its pipeline became the industry template. It remains one of the most important alignment papers to date."),

    createPaper("2303.15647", "PEFT: State-of-the-art Parameter-Efficient Fine-Tuning methods", "Mangrulkar et al.", "2023", "cs.LG",
      "Provided a comprehensive overview of parameter-efficient fine-tuning techniques. The paper unified dozens of approaches under a single taxonomy. It helped teams reason about trade-offs between methods. The survey still functions as an anchor for the PEFT ecosystem."),

    createPaper("2101.00190", "Prefix-Tuning: Optimizing Continuous Prompts for Generation", "Li & Liang", "2021", "cs.CL",
      "Introduced tuning prompts while freezing the entire model. Prefix-tuning showed that small continuous prompts can steer outputs effectively. It inspired the explosion of prompt-based tuning. Many follow-up works combine it with LoRA-style techniques."),

    createPaper("2104.08691", "The Power of Scale for Parameter-Efficient Prompt Tuning", "Lester et al.", "2021", "cs.CL",
      "Found that tuning tiny prompt vectors can rival full fine-tuning in large models. This work challenged the assumption that weight updates are required. It massively reduced compute cost for customization. Many modern lightweight tuning approaches descend from it."),

    createPaper("2005.00247", "AdapterFusion: Non-Destructive Task Composition for Transfer Learning", "Pfeiffer et al.", "2020", "cs.CL",
      "Proposed modular adapters inserted between layers. Adapters enabled multitask learning with small overhead. AdapterFusion allowed combining multiple task adapters efficiently. This work created an early blueprint for PEFT."),

    createPaper("2106.10199", "BitFit: Simple Parameter-efficient Fine-tuning for Transformer-based Masked Language-models", "Ben Zaken et al.", "2021", "cs.CL",
      "Showed that tuning only bias terms can achieve surprising performance. BitFit questioned assumptions around full-parameter updates. It remains one of the simplest PEFT techniques. Many applied teams still use bias-only fine-tuning in production."),

    createPaper("2106.04647", "Compacter: Efficient Low-Rank Hypercomplex Adapter Layers", "Mahabadi et al.", "2021", "cs.CL",
      "Introduced hypercomplex adapters to reduce parameter count dramatically. Compacter delivered improved efficiency over standard adapters. It demonstrated that parameter factorization can go much deeper. The technique informed later adapter optimizations."),

    createPaper("2212.10560", "Self-Instruct: Aligning Language Models with Self-Generated Instructions", "Wang et al.", "2022", "cs.CL",
      "Proposed generating new instruction data using the model itself. Self-Instruct accelerated the creation of high-quality synthetic datasets. It enabled rapid bootstrapping of instruction-tuned models. Many open-source models adopted its pipeline."),
  ],

  // ---------------------------------------------------------
  //  EVALUATIONS (10)
  // ---------------------------------------------------------
  Evaluations: [
    createPaper("2009.03300", "Measuring Massive Multitask Language Understanding (MMLU)", "Hendrycks et al.", "2020", "cs.CY",
      "Introduced a broad benchmark of academic and professional subjects. MMLU became the de facto measure of general knowledge in LLMs. Its diversity exposed weaknesses in reasoning-heavy tasks. Nearly every major LLM is evaluated on it."),

    createPaper("2206.04615", "Beyond the Imitation Game: Quantifying and extrapolating the capabilities of language models (BIG-bench)", "Srivastava et al.", "2022", "cs.CL",
      "Compiled over 200 tasks to measure LLM generalization. BIG-bench highlighted emergent abilities in large models. It helped diagnose reasoning capabilities before GPT-4 class models. Many tasks became standard stress tests."),

    createPaper("2005.14165", "Language Models are Few-Shot Learners", "Brown et al.", "2020", "cs.CL",
      "Provided the first systematic evaluation of few-shot prompting. The work showed surprising meta-learning capabilities. It shifted evaluation practices toward multi-shot settings. Many modern prompt-evaluation methods stem from this."),

    createPaper("2211.09110", "Holistic Evaluation of Language Models (HELM)", "Liang et al.", "2022", "cs.LG",
      "Advocated for holistic LLM evaluation beyond accuracy. HELM measured safety, robustness, fairness, and calibration. It expanded the community’s perspective on responsible model assessment. This framework influenced major research labs."),

    createPaper("2109.07958", "TruthfulQA: Measuring How Models Mimic Human Falsehoods", "Lin et al.", "2021", "cs.CL",
      "Evaluated whether LLMs reproduce human misconceptions. TruthfulQA exposed hallucination tendencies sharply. It became a core benchmark for factual reliability. Many alignment interventions are judged against it."),

    createPaper("2204.07705", "Natural Instructions: Benchmarking Generalization to New Tasks from Natural Language Instructions", "Mishra et al.", "2022", "cs.CL",
      "Created a dataset of real-world tasks from natural language instructions. It shifted evaluation toward instruction-following. The benchmark influenced the rise of instruction tuning. Many datasets today adopt its structure."),

    createPaper("1804.07461", "GLUE: A Multi-Task Benchmark and Analysis Platform for Natural Language Understanding", "Wang et al.", "2018", "cs.CL",
      "Provided a unified benchmark for language understanding tasks. GLUE shaped the BERT-era competitive landscape. It helped teams measure generalization across tasks. It remains historically important despite being surpassed."),

    createPaper("1905.00537", "SuperGLUE: A Stickier Benchmark for General-Purpose Language Understanding Systems", "Wang et al.", "2019", "cs.CL",
      "Extended GLUE with harder reasoning tasks. SuperGLUE became the next major milestone for NLP models. Transformer-based models competed heavily on it. Many reasoning-focused architectures were validated here."),

    createPaper("2110.14168", "Training Verifiers to Solve Math Word Problems (GSM8K)", "Cobbe et al.", "2021", "cs.LG",
      "Designed a benchmark for grade-school math reasoning. GSM8K became the go-to measurement for chain-of-thought competence. It exposed major weaknesses in earlier LLMs. Many CoT techniques are motivated by improving this score."),

    createPaper("2304.06364", "AGIEval: A Human-Centric Benchmark for Evaluating Foundation Models", "Zhong et al.", "2023", "cs.CL",
      "Evaluated LLMs on standardized human exams. AGIEval reflected real-world decision-making skills. It provided a new metric for human-level capability. Many high-end models now report AGIEval results."),
  ],

  // ---------------------------------------------------------
  //  RL (10)
  // ---------------------------------------------------------
  RL: [
    createPaper("1707.06347", "Proximal Policy Optimization Algorithms (PPO)", "Schulman et al.", "2017", "cs.LG",
      "Introduced clipped objective functions for stable policy optimization. PPO became the default RL algorithm due to simplicity and robustness. It balanced performance with practical reliability. Nearly every RLHF pipeline still uses PPO variants."),

    createPaper("1602.01783", "Asynchronous Methods for Deep Reinforcement Learning (A3C)", "Mnih et al.", "2016", "cs.LG",
      "Proposed asynchronous reinforcement learning using parallel workers. A3C drastically accelerated RL research. It proved that stability could be achieved without replay buffers. It paved the path to many actor-critic methods."),

    createPaper("1312.5602", "Playing Atari with Deep Reinforcement Learning (DQN)", "Mnih et al.", "2013", "cs.LG",
      "Showed deep neural networks can learn control policies directly from pixels. DQN kicked off the modern deep RL era. It achieved human-level performance on Atari. The combination of replay buffers and target networks became fundamental."),

    createPaper("1502.05477", "Trust Region Policy Optimization (TRPO)", "Schulman et al.", "2015", "cs.LG",
      "Introduced trust-region constraints for stable policy optimization. TRPO improved reliability over vanilla policy gradients. It was influential despite being computationally heavy. PPO later emerged as its practical counterpart."),

    createPaper("1611.05397", "Reinforcement Learning with Unsupervised Auxiliary Tasks (UNREAL)", "Jaderberg et al.", "2016", "cs.LG",
      "Extended A3C with auxiliary tasks to accelerate learning. UNREAL improved data efficiency dramatically. It highlighted the importance of multitask signals. Many RL architectures still adopt similar auxiliary strategies."),

    createPaper("1802.01561", "IMPALA: Scalable Distributed Deep-RL with Importance Weighted Actor-Learner Architectures", "Espeholt et al.", "2018", "cs.LG",
      "Introduced V-trace for off-policy correction in large-scale RL. IMPALA enabled training across thousands of machines. It represented a leap in scalable RL infrastructure. Many modern RL systems borrow its architecture."),

    createPaper("1911.08265", "Mastering Atari, Go, Chess and Shogi by Planning with a Learned Model (MuZero)", "Schrittwieser et al.", "2020", "cs.LG",
      "Unified planning and learning without access to environment rules. MuZero learned its own dynamical model and dominated Atari and Go. It showed RL can succeed without explicit simulators. This work reshaped model-based RL."),

    createPaper("1710.02298", "Rainbow: Combining Improvements in Deep Reinforcement Learning", "Hessel et al.", "2017", "cs.LG",
      "Combined multiple extensions to DQN into a single strong agent. Rainbow demonstrated the additive value of enhancements like distributional RL and prioritized replay. It set new Atari benchmarks. It remains a standard comparison baseline."),

    createPaper("1707.06887", "A Distributional Perspective on Reinforcement Learning (C51)", "Bellemare et al.", "2017", "cs.LG",
      "Modeled reward distributions instead of expectations. C51 significantly improved learning performance. It introduced a new probabilistic perspective for RL. Many modern algorithms integrate distributional techniques."),

    createPaper("1801.01290", "Soft Actor-Critic: Off-Policy Maximum Entropy Deep Reinforcement Learning with a Stochastic Actor", "Haarnoja et al.", "2018", "cs.LG",
      "Developed an entropy-regularized RL algorithm with excellent stability. SAC performed well on continuous control tasks. Its stochastic objective encouraged exploration. Today, SAC is a leading method in robotics RL."),
  ],

  // ---------------------------------------------------------
  //  RLHF (10)
  // ---------------------------------------------------------
  RLHF: [
    createPaper("2203.02155", "Training language models to follow instructions with human feedback (InstructGPT)", "Ouyang et al.", "2022", "cs.CL",
      "Demonstrated RLHF at scale to align LLM outputs with human intent. InstructGPT introduced the now-standard three-stage pipeline. Its results transformed LLM usability. This paper essentially defined ChatGPT’s foundation."),

    createPaper("1706.03741", "Deep Reinforcement Learning from Human Preferences", "Christiano et al.", "2017", "cs.LG",
      "Introduced preference modeling as a training signal for RL agents. This became the philosophical and technical precursor to RLHF. It replaced explicit reward engineering with human judgment. Nearly every RLHF pipeline traces its ancestry here."),

    createPaper("2305.00965", "Open Problems and Fundamental Limitations of Reinforcement Learning from Human Feedback", "Casper et al.", "2023", "cs.LG",
      "Provided the first systematic overview of RLHF pipelines. It identified structural weaknesses in reward modeling. The survey sharpened research focus across alignment communities. Many labs rely on its taxonomy."),

    createPaper("2212.08073", "Constitutional AI: Harmlessness from AI Feedback", "Bai et al.", "2022", "cs.CL",
      "Replaced human preference data with model-written principles. Constitutional AI reduced human labor while improving safety. It introduced self-supervised preference refinement. This work heavily influenced LLM alignment approaches."),

    createPaper("1909.08593", "Fine-Tuning Language Models from Human Preferences", "Ziegler et al.", "2019", "cs.CL",
      "One of the early explorations of PPO-based alignment. It formalized reward models for text generation. Many implementation details used today come from this era. The paper remains foundational despite being older."),

    createPaper("2009.01325", "Learning to Summarize with Human Feedback", "Stiennon et al.", "2020", "cs.CL",
      "Used human comparisons to train reward models for summarization. The approach demonstrated massive improvements in quality. It validated the multi-stage RLHF paradigm. Several alignment datasets follow its structure."),

    createPaper("2401.10020", "Self-Rewarding Language Models", "Yuan et al.", "2024", "cs.CL",
      "Proposed models that generate their own preference data. This approach reduces human training cost. It demonstrated that LLMs can bootstrap reward alignment. This paper opened new directions in self-alignment."),

    createPaper("2305.18290", "Direct Preference Optimization: Your Language Model is Secretly a Reward Model", "Rafailov et al.", "2023", "cs.LG",
      "Introduced a simpler alternative to PPO-based RLHF. DPO removes the need for reinforcement learning entirely. It became widely adopted due to its simplicity and stability. Many modern open models use DPO instead of PPO."),

    createPaper("2310.13828", "KTO: Model Alignment as Prospect Theoretic Optimization", "Ethayarajh et al.", "2023", "cs.LG",
      "Proposed a divergence-based training objective for alignment. KTO addressed stability issues in preference training. It offered a math-clean alternative to DPO. Many codebases explore KTO as a replacement."),

    createPaper("2309.00267", "RLAIF: Scaling Reinforcement Learning from Human Feedback with AI Feedback", "Lee et al.", "2023", "cs.CL",
      "Replaced human feedback with AI-generated preference labels. RLAIF demonstrated huge cost savings with minimal performance drop. It foreshadowed self-alignment techniques adopted in many labs. This work remains key to scalable RLHF."),
  ],
};