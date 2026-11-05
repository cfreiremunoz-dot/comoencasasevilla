import { queryOptions } from '@tanstack/react-query';
import { getPublicNews } from './news.functions';

export const newsQueryOptions = queryOptions({ queryKey: ['news', 'public'], queryFn: () => getPublicNews(), staleTime: 30000 });
export const newsDate = (date: string | null) => date ? new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '';