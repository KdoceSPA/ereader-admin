import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInstitutions,
  getInstitution,
  createInstitution,
  updateInstitution,
  deleteInstitution,
  getInstitutionBooks,
  assignBookToInstitution,
  removeBookFromInstitution,
  type CreateInstitutionPayload,
} from '@/api/institutions';

export function useInstitutions() {
  return useQuery({ queryKey: ['institutions'], queryFn: getInstitutions });
}

export function useInstitution(id: number) {
  return useQuery({ queryKey: ['institutions', id], queryFn: () => getInstitution(id) });
}

export function useCreateInstitution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateInstitutionPayload) => createInstitution(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['institutions'] }),
  });
}

export function useUpdateInstitution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CreateInstitutionPayload> }) =>
      updateInstitution(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['institutions'] });
      qc.invalidateQueries({ queryKey: ['institutions', id] });
    },
  });
}

export function useDeleteInstitution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteInstitution(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['institutions'] }),
  });
}

export function useInstitutionBooks(id: number) {
  return useQuery({
    queryKey: ['institutions', id, 'books'],
    queryFn: () => getInstitutionBooks(id),
  });
}

export function useAssignBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ institutionId, bookId }: { institutionId: number; bookId: number }) =>
      assignBookToInstitution(institutionId, bookId),
    onSuccess: (_data, { institutionId }) => {
      qc.invalidateQueries({ queryKey: ['institutions', institutionId, 'books'] });
    },
  });
}

export function useRemoveBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ institutionId, bookId }: { institutionId: number; bookId: number }) =>
      removeBookFromInstitution(institutionId, bookId),
    onSuccess: (_data, { institutionId }) => {
      qc.invalidateQueries({ queryKey: ['institutions', institutionId, 'books'] });
    },
  });
}
