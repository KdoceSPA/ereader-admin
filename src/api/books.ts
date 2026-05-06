import client from './client';
import type { Book } from '@/types/api';

export async function getBooks(): Promise<Book[]> {
  const { data } = await client.get<Book[]>('/api/books');
  return data;
}

export async function getBook(id: number): Promise<Book> {
  const { data } = await client.get<Book>(`/api/books/${id}`);
  return data;
}

export interface CreateBookPayload {
  title: string;
  description?: string;
  level: string;
  coverImage?: string;
  fileUrl: string;
  status?: string;
}

export async function createBook(payload: CreateBookPayload): Promise<Book> {
  const { data } = await client.post<Book>('/api/books', payload);
  return data;
}

export async function updateBook(id: number, payload: Partial<CreateBookPayload>): Promise<Book> {
  const { data } = await client.put<Book>(`/api/books/${id}`, payload);
  return data;
}

export async function deleteBook(id: number): Promise<void> {
  await client.delete(`/api/books/${id}`);
}
