import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, updateUser, deleteUser } from '@/api/users';
import { useInstitutions } from '@/hooks/useInstitutions';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import type { User } from '@/types/api';

const createSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  role: z.enum(['admin', 'content']),
  institutionId: z.string().optional(),
});

const editSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional().or(z.literal('')),
  role: z.enum(['admin', 'content']),
  institutionId: z.string().optional(),
});

type CreateFormData = z.infer<typeof createSchema>;
type EditFormData = z.infer<typeof editSchema>;

export function UsersPage() {
  const qc = useQueryClient();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const { data: users, isLoading } = useQuery({ queryKey: ['users'], queryFn: getUsers });
  const { data: institutions } = useInstitutions();
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: CreateFormData) =>
      createUser({
        email: data.email,
        password: data.password,
        role: data.role,
        institutionId: data.institutionId ? Number(data.institutionId) : null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario creado');
      setCreateOpen(false);
      createForm.reset();
    },
    onError: () => toast.error('Error al crear usuario'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: EditFormData & { id: number }) =>
      updateUser(data.id, {
        email: data.email,
        ...(data.password ? { password: data.password } : {}),
        ...(isAdmin
          ? { role: data.role, institutionId: data.institutionId ? Number(data.institutionId) : null }
          : {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario actualizado');
      setEditUser(null);
    },
    onError: () => toast.error('Error al actualizar usuario'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario eliminado');
      setDeleteId(null);
    },
    onError: () => toast.error('Error al eliminar usuario'),
  });

  const createForm = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: { role: 'content' },
  });

  const editForm = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
  });

  useEffect(() => {
    if (editUser) {
      editForm.reset({
        email: editUser.email,
        password: '',
        role: editUser.role,
        institutionId: editUser.institutionId ? String(editUser.institutionId) : undefined,
      });
    }
  }, [editUser, editForm]);

  const createRoleValue = createForm.watch('role');
  const createInstitutionValue = createForm.watch('institutionId');
  const editRoleValue = editForm.watch('role');
  const editInstitutionValue = editForm.watch('institutionId');

  async function onCreateSubmit(data: CreateFormData) {
    await createMutation.mutateAsync(data);
  }

  async function onEditSubmit(data: EditFormData) {
    if (!editUser) return;
    await updateMutation.mutateAsync({ ...data, id: editUser.id });
  }

  function canManage(target: User) {
    if (isAdmin) return true;
    return target.id !== currentUser?.id && target.role === 'content';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Usuarios</h2>
          <p className="text-muted-foreground">Gestiona los usuarios del sistema</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo usuario
        </Button>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="p-4 text-left font-medium">Email</th>
              <th className="p-4 text-left font-medium">Rol</th>
              <th className="p-4 text-left font-medium">Institución</th>
              <th className="p-4 text-left font-medium">Creado</th>
              <th className="p-4 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-4">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-6 w-16" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="p-4" />
                  </tr>
                ))
              : users?.map((user) => {
                  const institution = institutions?.find((i) => i.id === user.institutionId);
                  return (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-4 font-medium">{user.email}</td>
                      <td className="p-4">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {institution?.name ?? '—'}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString('es-CL')}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          {canManage(user) && (
                            <Button variant="ghost" size="icon" onClick={() => setEditUser(user)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {canManage(user) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(user.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            {!isLoading && users?.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No hay usuarios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear usuario</DialogTitle>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4 min-w-0">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...createForm.register('email')} />
              {createForm.formState.errors.email && (
                <p className="text-xs text-destructive">{createForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" {...createForm.register('password')} />
              {createForm.formState.errors.password && (
                <p className="text-xs text-destructive">{createForm.formState.errors.password.message}</p>
              )}
            </div>
            {isAdmin && (
              <>
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Select
                    value={createRoleValue}
                    onValueChange={(v) => createForm.setValue('role', v as 'admin' | 'content')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Institución (opcional)</Label>
                  <Select
                    value={createInstitutionValue ?? ''}
                    onValueChange={(v) => createForm.setValue('institutionId', v || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sin institución" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutions?.map((inst) => (
                        <SelectItem key={inst.id} value={String(inst.id)}>
                          {inst.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {!isAdmin && (
              <p className="text-sm text-muted-foreground">
                El usuario quedará creado con rol Content en tu institución.
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createForm.formState.isSubmitting || createMutation.isPending}>
                {createMutation.isPending ? 'Creando...' : 'Crear usuario'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 min-w-0">
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" {...editForm.register('email')} />
              {editForm.formState.errors.email && (
                <p className="text-xs text-destructive">{editForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Nueva contraseña</Label>
              <Input id="edit-password" type="password" {...editForm.register('password')} />
              <p className="text-xs text-muted-foreground">Dejar vacío para mantener la actual</p>
              {editForm.formState.errors.password && (
                <p className="text-xs text-destructive">{editForm.formState.errors.password.message}</p>
              )}
            </div>
            {isAdmin && (
              <>
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Select
                    value={editRoleValue}
                    onValueChange={(v) => editForm.setValue('role', v as 'admin' | 'content')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Institución (opcional)</Label>
                  <Select
                    value={editInstitutionValue ?? ''}
                    onValueChange={(v) => editForm.setValue('institutionId', v || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sin institución" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutions?.map((inst) => (
                        <SelectItem key={inst.id} value={String(inst.id)}>
                          {inst.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditUser(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={editForm.formState.isSubmitting || updateMutation.isPending}>
                {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Eliminar usuario"
        description="Esta acción no se puede deshacer. El usuario será eliminado permanentemente."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
