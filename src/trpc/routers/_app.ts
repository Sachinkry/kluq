import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { transcriptionRouter } from './transcription';

export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
  transcription: transcriptionRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;