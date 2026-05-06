import { useState } from 'react';
import { Plus, Pencil, Trash2, BookOpen, FolderOpen, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useBooks, useDeleteBook } from '@/hooks/useBooks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { BookFormModal } from '@/components/shared/BookFormModal';
import { LEVEL_LABELS, type Level } from '@/types/api';

const LEVEL_ORDER: Level[] = [
  'prekinder',
  'kinder',
  'primero_basico',
  'segundo_basico',
  'tercero_basico',
  'cuarto_basico',
  'quinto_basico',
  'sexto_basico',
  'septimo_basico',
  'octavo_basico',
  'primero_medio',
  'segundo_medio',
  'tercero_medio',
  'cuarto_medio',
];

export function BooksPage() {
  const { data: books, isLoading } = useBooks();
  const deleteBook = useDeleteBook();

  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editBookId, setEditBookId] = useState<number | undefined>(undefined);

  function openCreate() {
    setEditBookId(undefined);
    setModalOpen(true);
  }

  function openEdit(bookId: number) {
    setEditBookId(bookId);
    setModalOpen(true);
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteBook.mutateAsync(deleteId);
      toast.success('Libro eliminado');
    } catch {
      toast.error('Error al eliminar el libro');
    } finally {
      setDeleteId(null);
    }
  }

  const availableLevels = LEVEL_ORDER.filter((level) =>
    books?.some((b) => b.level === level)
  );

  const levelBooks = selectedLevel ? books?.filter((b) => b.level === selectedLevel) : [];

  if (selectedLevel) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelectedLevel(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{LEVEL_LABELS[selectedLevel]}</h2>
              <p className="text-muted-foreground">
                {levelBooks?.length ?? 0} {levelBooks?.length === 1 ? 'libro' : 'libros'}
              </p>
            </div>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo libro
          </Button>
        </div>

        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="p-4 text-left font-medium">Portada</th>
                <th className="p-4 text-left font-medium">Título</th>
                <th className="p-4 text-left font-medium">Estado</th>
                <th className="p-4 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {levelBooks?.map((book) => (
                <tr key={book.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-4">
                    {book.coverImage ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}${book.coverImage}`}
                        alt={book.title}
                        className="h-14 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="h-14 w-10 rounded bg-muted flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-medium">{book.title}</td>
                  <td className="p-4">
                    <Badge variant={book.status === 'active' ? 'success' : 'secondary'}>
                      {book.status === 'active' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(book.id)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(book.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {levelBooks?.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    No hay libros en este nivel.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <BookFormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          bookId={editBookId}
          defaultLevel={selectedLevel}
        />

        <ConfirmDialog
          open={deleteId !== null}
          onOpenChange={(open) => !open && setDeleteId(null)}
          title="Eliminar libro"
          description="Esta acción no se puede deshacer. El libro será eliminado permanentemente."
          onConfirm={handleDelete}
          loading={deleteBook.isPending}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Libros</h2>
          <p className="text-muted-foreground">Gestiona el catálogo de libros por nivel</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo libro
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : availableLevels.length === 0 ? (
        <div className="rounded-md border p-12 text-center text-muted-foreground">
          No hay libros. Crea el primero.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {availableLevels.map((level) => {
            const count = books?.filter((b) => b.level === level).length ?? 0;
            return (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border bg-card p-6 text-center shadow-sm transition-colors hover:bg-muted/50 cursor-pointer"
              >
                <FolderOpen className="h-10 w-10 text-primary" />
                <span className="font-semibold text-sm leading-tight">{LEVEL_LABELS[level]}</span>
                <span className="text-xs text-muted-foreground">
                  {count} {count === 1 ? 'libro' : 'libros'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <BookFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        bookId={editBookId}
      />
    </div>
  );
}
