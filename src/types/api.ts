export type Level =
  | 'prekinder'
  | 'kinder'
  | 'primero_basico'
  | 'segundo_basico'
  | 'tercero_basico'
  | 'cuarto_basico'
  | 'quinto_basico'
  | 'sexto_basico'
  | 'septimo_basico'
  | 'octavo_basico'
  | 'primero_medio'
  | 'segundo_medio'
  | 'tercero_medio'
  | 'cuarto_medio';

export type Role = 'admin' | 'content';
export type Status = 'active' | 'inactive';
export type FileType = 'epub' | 'pdf';

export interface Book {
  id: number;
  title: string;
  description: string | null;
  level: Level;
  coverImage: string | null;
  fileUrl: string;
  fileType: FileType;
  status: Status;
  createdAt: string;
}

export interface Institution {
  id: number;
  name: string;
  status: Status;
  createdAt: string;
}

export interface User {
  id: number;
  email: string;
  role: Role;
  institutionId: number | null;
  createdAt: string;
}

export interface AuthUser {
  id: number;
  email: string;
  role: Role;
  institutionId: number | null;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export const LEVEL_LABELS: Record<Level, string> = {
  prekinder: 'Pre-Kinder',
  kinder: 'Kinder',
  primero_basico: '1° Básico',
  segundo_basico: '2° Básico',
  tercero_basico: '3° Básico',
  cuarto_basico: '4° Básico',
  quinto_basico: '5° Básico',
  sexto_basico: '6° Básico',
  septimo_basico: '7° Básico',
  octavo_basico: '8° Básico',
  primero_medio: '1° Medio',
  segundo_medio: '2° Medio',
  tercero_medio: '3° Medio',
  cuarto_medio: '4° Medio',
};
