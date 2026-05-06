import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, BookOpen, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  useInstitution,
  useInstitutionBooks,
  useAssignBook,
  useRemoveBook,
} from '@/hooks/useInstitutions';
import { useBooks } from '@/hooks/useBooks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LEVEL_LABELS } from '@/types/api';

export function InstitutionBooksPage() {
  const { id } = useParams();
  const institutionId = Number(id);
  const navigate = useNavigate();

  const { data: institution } = useInstitution(institutionId);
  const { data: assignedBooks, isLoading: loadingAssigned } = useInstitutionBooks(institutionId);
  const { data: allBooks, isLoading: loadingAll } = useBooks();
  const assignBook = useAssignBook();
  const removeBook = useRemoveBook();

  const assignedIds = new Set(assignedBooks?.map((b) => b.id) ?? []);
  const unassignedBooks = allBooks?.filter((b) => !assignedIds.has(b.id)) ?? [];

  async function handleAssign(bookId: number) {
    try {
      await assignBook.mutateAsync({ institutionId, bookId });
      toast.success('Libro asignado');
    } catch {
      toast.error('Error al asignar el libro');
    }
  }

  async function handleRemove(bookId: number) {
    try {
      await removeBook.mutateAsync({ institutionId, bookId });
      toast.success('Libro desasignado');
    } catch {
      toast.error('Error al desasignar el libro');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/institutions')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Libros de {institution?.name ?? '...'}
          </h2>
          <p className="text-muted-foreground">Asigna o desasigna libros a esta institución</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Libros asignados</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAssigned ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : assignedBooks?.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin libros asignados.</p>
            ) : (
              <div className="space-y-2">
                {assignedBooks?.map((book) => (
                  <div
                    key={book.id}
                    className="flex items-center gap-3 rounded-md border p-3"
                  >
                    {book.coverImage ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}${book.coverImage}`}
                        alt={book.title}
                        className="h-10 w-8 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{book.title}</p>
                      <p className="text-xs text-muted-foreground">{LEVEL_LABELS[book.level]}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(book.id)}
                      disabled={removeBook.isPending}
                      className="text-destructive hover:text-destructive flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Libros disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAll ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : unassignedBooks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Todos los libros están asignados.
              </p>
            ) : (
              <div className="space-y-2">
                {unassignedBooks.map((book) => (
                  <div
                    key={book.id}
                    className="flex items-center gap-3 rounded-md border p-3"
                  >
                    {book.coverImage ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}${book.coverImage}`}
                        alt={book.title}
                        className="h-10 w-8 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{book.title}</p>
                      <p className="text-xs text-muted-foreground">{LEVEL_LABELS[book.level]}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {book.status === 'active' ? 'Activo' : 'Inactivo'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAssign(book.id)}
                      disabled={assignBook.isPending}
                      className="flex-shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
