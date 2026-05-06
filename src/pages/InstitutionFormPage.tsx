import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import {
  useInstitution,
  useCreateInstitution,
  useUpdateInstitution,
} from '@/hooks/useInstitutions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const schema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  status: z.enum(['active', 'inactive']),
});

type FormData = z.infer<typeof schema>;

export function InstitutionFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const institutionId = isEdit ? Number(id) : 0;
  const navigate = useNavigate();

  const { data: existing } = useInstitution(institutionId);
  const createInstitution = useCreateInstitution();
  const updateInstitution = useUpdateInstitution();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active' },
  });

  useEffect(() => {
    if (existing) {
      reset({ name: existing.name, status: existing.status });
    }
  }, [existing, reset]);

  async function onSubmit(data: FormData) {
    try {
      if (isEdit) {
        await updateInstitution.mutateAsync({ id: institutionId, payload: data });
        toast.success('Institución actualizada');
      } else {
        await createInstitution.mutateAsync(data);
        toast.success('Institución creada');
      }
      navigate('/institutions');
    } catch {
      toast.error('Error al guardar la institución');
    }
  }

  const statusValue = watch('status');

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/institutions')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          {isEdit ? 'Editar institución' : 'Nueva institución'}
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la institución</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={statusValue}
                onValueChange={(v) => setValue('status', v as 'active' | 'inactive')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activa</SelectItem>
                  <SelectItem value="inactive">Inactiva</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/institutions')}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear institución'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
