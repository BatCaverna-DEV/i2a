import { z } from 'zod';

/** Corpo do POST /auth/google — o ID token devolvido pelo botão do Google. */
export const googleSchema = z.object({
  credential: z.string().min(20, 'Token do Google ausente ou malformado.')
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10)
});
