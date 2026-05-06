import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  type CreateBookPayload,
} from '@/api/books';

export function useBooks() {
  return useQuery({ queryKey: ['books'], queryFn: getBooks });
}

export function useBook(id: number) {
  return useQuery({ queryKey: ['books', id], queryFn: () => getBook(id), enabled: id > 0 });
}

export function useCreateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBookPayload) => createBook(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['books'] }),
  });
}

export function useUpdateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CreateBookPayload> }) =>
      updateBook(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['books'] });
      qc.invalidateQueries({ queryKey: ['books', id] });
    },
  });
}

export function useDeleteBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteBook(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['books'] }),
  });
}
