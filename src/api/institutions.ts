import client from './client';
import type { Institution, Book } from '@/types/api';

export async function getInstitutions(): Promise<Institution[]> {
  const { data } = await client.get<Institution[]>('/api/institutions');
  return data;
}

export async function getInstitution(id: number): Promise<Institution> {
  const { data } = await client.get<Institution>(`/api/institutions/${id}`);
  return data;
}

export interface CreateInstitutionPayload {
  name: string;
  status?: string;
}

export async function createInstitution(payload: CreateInstitutionPayload): Promise<Institution> {
  const { data } = await client.post<Institution>('/api/institutions', payload);
  return data;
}

export async function updateInstitution(
  id: number,
  payload: Partial<CreateInstitutionPayload>
): Promise<Institution> {
  const { data } = await client.put<Institution>(`/api/institutions/${id}`, payload);
  return data;
}

export async function deleteInstitution(id: number): Promise<void> {
  await client.delete(`/api/institutions/${id}`);
}

export async function getInstitutionBooks(id: number): Promise<Book[]> {
  const { data } = await client.get<Book[]>(`/api/institutions/${id}/books`);
  return data;
}

export async function assignBookToInstitution(
  institutionId: number,
  bookId: number
): Promise<void> {
  await client.post(`/api/institutions/${institutionId}/books`, { bookId });
}

export async function removeBookFromInstitution(
  institutionId: number,
  bookId: number
): Promise<void> {
  await client.delete(`/api/institutions/${institutionId}/books/${bookId}`);
}
