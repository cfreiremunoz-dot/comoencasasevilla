import { z } from 'zod';

export const newsGenres = { noticia: 'Noticia', cronica: 'Crónica', reportaje: 'Reportaje' } as const;
export const newsSchema = z.object({
  title: z.string().trim().min(2, 'Escribe un título').max(200),
  genre: z.enum(['noticia', 'cronica', 'reportaje']),
  neighborhood: z.string().trim().min(2, 'Indica el barrio').max(120),
  summary: z.string().trim().max(500),
  body: z.string().trim().min(10, 'Escribe el artículo').max(50000),
  author_name: z.string().trim().min(2, 'Indica la firma').max(120),
  image_path: z.string().nullable(),
  image_caption: z.string().trim().max(300),
  sources: z.string().trim().max(5000),
});
export type NewsInput = z.infer<typeof newsSchema>;