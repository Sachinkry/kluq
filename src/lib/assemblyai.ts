import { AssemblyAI } from 'assemblyai';
import ytdl from 'ytdl-core';

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!
});

export interface TranscriptionResult {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  text?: string;
  error?: string;
  confidence?: number;
  words?: Array<{
    text: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

export class TranscriptionService {
  // Transcribe from YouTube URL
  static async transcribeYouTube(url: string): Promise<TranscriptionResult> {
    try {
      // Validate YouTube URL
      if (!ytdl.validateURL(url)) {
        throw new Error('Invalid YouTube URL');
      }

      // Get video info
      const info = await ytdl.getInfo(url);
      const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
      
      if (audioFormats.length === 0) {
        throw new Error('No audio format available for this video');
      }

      // Get the best audio format
      const audioUrl = audioFormats[0].url;

      // Submit transcription request to AssemblyAI
      const transcript = await client.transcripts.create({
        audio_url: audioUrl,
        speaker_labels: true,
        auto_highlights: true,
        entity_detection: true,
        auto_chapters: true,
      });

      return {
        id: transcript.id,
        status: transcript.status as any,
        text: transcript.text || undefined,
        confidence: transcript.confidence || undefined,
        words: transcript.words?.map(word => ({
          text: word.text,
          start: word.start,
          end: word.end,
          confidence: word.confidence
        })) || undefined,
      };
    } catch (error) {
      console.error('YouTube transcription error:', error);
      throw error;
    }
  }

  // Transcribe from local file
  static async transcribeFile(filePath: string): Promise<TranscriptionResult> {
    try {
      // Upload file to AssemblyAI
      const upload = await client.files.upload(filePath);

      // Submit transcription request
      const transcript = await client.transcripts.create({
        audio_url: upload,
        speaker_labels: true,
        auto_highlights: true,
        entity_detection: true,
        auto_chapters: true,
      });

      return {
        id: transcript.id,
        status: transcript.status as any,
        text: transcript.text || undefined,
        confidence: transcript.confidence || undefined,
        words: transcript.words?.map(word => ({
          text: word.text,
          start: word.start,
          end: word.end,
          confidence: word.confidence
        })) || undefined,
      };
    } catch (error) {
      console.error('File transcription error:', error);
      throw error;
    }
  }

  // Get transcription status and result
  static async getTranscription(transcriptId: string): Promise<TranscriptionResult> {
    try {
      const transcript = await client.transcripts.get(transcriptId);
      
      return {
        id: transcript.id,
        status: transcript.status as any,
        text: transcript.text || undefined,
        confidence: transcript.confidence || undefined,
        words: transcript.words?.map(word => ({
          text: word.text,
          start: word.start,
          end: word.end,
          confidence: word.confidence
        })) || undefined,
        error: transcript.error || undefined,
      };
    } catch (error) {
      console.error('Get transcription error:', error);
      throw error;
    }
  }

  // Poll for transcription completion
  static async pollTranscription(transcriptId: string, maxAttempts = 60): Promise<TranscriptionResult> {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const result = await this.getTranscription(transcriptId);
      
      if (result.status === 'completed') {
        return result;
      }
      
      if (result.status === 'error') {
        throw new Error(result.error || 'Transcription failed');
      }
      
      // Wait 5 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }
    
    throw new Error('Transcription timeout');
  }
} 