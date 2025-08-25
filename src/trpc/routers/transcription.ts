import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { TranscriptionService } from '@/lib/assemblyai';

export const transcriptionRouter = createTRPCRouter({
  // Start transcription for YouTube URL
  transcribeYouTube: baseProcedure
    .input(z.object({
      url: z.string().url(),
    }))
    .mutation(async ({ input }) => {
      try {
        const result = await TranscriptionService.transcribeYouTube(input.url);
        return result;
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Transcription failed');
      }
    }),

  // Start transcription for uploaded file
  transcribeFile: baseProcedure
    .input(z.object({
      filePath: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        const result = await TranscriptionService.transcribeFile(input.filePath);
        return result;
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Transcription failed');
      }
    }),

  // Get transcription status and result
  getTranscription: baseProcedure
    .input(z.object({
      transcriptId: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const result = await TranscriptionService.getTranscription(input.transcriptId);
        return result;
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to get transcription');
      }
    }),

  // Poll for transcription completion
  pollTranscription: baseProcedure
    .input(z.object({
      transcriptId: z.string(),
      maxAttempts: z.number().optional().default(60),
    }))
    .mutation(async ({ input }) => {
      try {
        const result = await TranscriptionService.pollTranscription(
          input.transcriptId, 
          input.maxAttempts
        );
        return result;
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Transcription polling failed');
      }
    }),
}); 