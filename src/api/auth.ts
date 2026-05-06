import client from './client';
import type { LoginResponse } from '@/types/api';

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await client.post<LoginResponse>('/api/auth/login', { email, password });
  return data;
}
