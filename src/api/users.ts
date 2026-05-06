import client from './client';
import type { User } from '@/types/api';

export async function getUsers(): Promise<User[]> {
  const { data } = await client.get<User[]>('/api/users');
  return data;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  role: string;
  institutionId?: number | null;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const { data } = await client.post<User>('/api/users', payload);
  return data;
}

export async function deleteUser(id: number): Promise<void> {
  await client.delete(`/api/users/${id}`);
}
