import { useState } from 'react';
import { Link } from 'react-router';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { useInstitutions, useDeleteInstitution } from '@/hooks/useInstitutions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

export function InstitutionsPage() {
  const { data: institutions, isLoading } = useInstitutions();
  const deleteInstitution = useDeleteInstitution();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteInstitution.mutateAsync(deleteId);
      toast.success('Institución eliminada');
    } catch {
      toast.error('Error al eliminar la institución');
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Instituciones</h2>
          <p className="text-muted-foreground">Gestiona las instituciones educativas</p>
        </div>
        <Button asChild>
          <Link to="/institutions/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva institución
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="p-4 text-left font-medium">Nombre</th>
              <th className="p-4 text-left font-medium">Estado</th>
              <th className="p-4 text-left font-medium">Creada</th>
              <th className="p-4 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-4">
                      <Skeleton className="h-4 w-48" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-6 w-16" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="p-4" />
                  </tr>
                ))
              : institutions?.map((inst) => (
                  <tr key={inst.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-4 font-medium">{inst.name}</td>
                    <td className="p-4">
                      <Badge variant={inst.status === 'active' ? 'success' : 'secondary'}>
                        {inst.status === 'active' ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(inst.createdAt).toLocaleDateString('es-CL')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild title="Asignar libros">
                          <Link to={`/institutions/${inst.id}/books`}>
                            <BookOpen className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild title="Editar">
                          <Link to={`/institutions/${inst.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(inst.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            {!isLoading && institutions?.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  No hay instituciones. Crea la primera.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Eliminar institución"
        description="Esta acción no se puede deshacer. La institución y sus asignaciones serán eliminadas."
        onConfirm={handleDelete}
        loading={deleteInstitution.isPending}
      />
    </div>
  );
}
