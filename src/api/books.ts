import client from './client';
import type { Book } from '@/types/api';

// Normaliza la respuesta por si el backend todavía no tiene la migración a
// múltiples niveles desplegada (devuelve `level` singular en vez de `levels`).
export function normalizeBook(book: Book & { level?: string }): Book {
  if (Array.isArray(book.levels)) return book;
  const { level, ...rest } = book;
  return { ...rest, levels: level ? [level as Book['levels'][number]] : [] };
}

export async function getBooks(): Promise<Book[]> {
  const { data } = await client.get<Book[]>('/api/books');
  return data.map(normalizeBook);
}

export async function getBook(id: number): Promise<Book> {
  const { data } = await client.get<Book>(`/api/books/${id}`);
  return normalizeBook(data);
}

export interface CreateBookPayload {
  title: string;
  description?: string;
  levels: string[];
  coverImage?: string;
  fileUrl: string;
  fileType?: string;
  status?: string;
}

export async function createBook(payload: CreateBookPayload): Promise<Book> {
  const { data } = await client.post<Book>('/api/books', payload);
  return normalizeBook(data);
}

export async function updateBook(id: number, payload: Partial<CreateBookPayload>): Promise<Book> {
  const { data } = await client.put<Book>(`/api/books/${id}`, payload);
  return normalizeBook(data);
}

export async function deleteBook(id: number): Promise<void> {
  await client.delete(`/api/books/${id}`);
}

export async function removeBookLevel(id: number, level: string): Promise<void> {
  await client.delete(`/api/books/${id}/levels/${level}`);
}
