import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useBook, useCreateBook, useUpdateBook } from '@/hooks/useBooks';
import { uploadFiles } from '@/api/upload';
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
import { FileDropzone } from '@/components/shared/FileDropzone';
import { LEVEL_LABELS, type Level } from '@/types/api';

const schema = z.object({
  title: z.string().min(1, 'Título requerido'),
  description: z.string().optional(),
  level: z.string().min(1, 'Nivel requerido'),
  status: z.enum(['active', 'inactive']),
});

type FormData = z.infer<typeof schema>;

export function BookFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const bookId = isEdit ? Number(id) : 0;
  const navigate = useNavigate();

  const { data: existing } = useBook(bookId);
  const createBook = useCreateBook();
  const updateBook = useUpdateBook();

  const [epubFile, setEpubFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active' },
  });

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        description: existing.description ?? '',
        level: existing.level,
        status: existing.status,
      });
    }
  }, [existing, reset]);

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    try {
      let fileUrl = existing?.fileUrl ?? '';
      let fileType = existing?.fileType ?? 'epub';
      let coverImage = existing?.coverImage ?? undefined;

      if (epubFile || coverFile) {
        const uploaded = await uploadFiles({
          epub: epubFile ?? undefined,
          cover: coverFile ?? undefined,
        });
        if (uploaded.fileUrl) fileUrl = uploaded.fileUrl;
        if (uploaded.fileType) fileType = uploaded.fileType;
        if (uploaded.coverImage) coverImage = uploaded.coverImage;
      }

      if (!fileUrl && !isEdit) {
        toast.error('El archivo (EPUB o PDF) es requerido');
        return;
      }

      if (isEdit) {
        await updateBook.mutateAsync({
          id: bookId,
          payload: { ...data, fileUrl, fileType, coverImage },
        });
        toast.success('Libro actualizado');
      } else {
        await createBook.mutateAsync({ ...data, fileUrl, fileType, coverImage });
        toast.success('Libro creado');
      }
      navigate('/books');
    } catch {
      toast.error('Error al guardar el libro');
    } finally {
      setSubmitting(false);
    }
  }

  const levelValue = watch('level');
  const statusValue = watch('status');

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/books')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {isEdit ? 'Editar libro' : 'Nuevo libro'}
          </h2>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del libro</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input id="description" {...register('description')} />
            </div>

            <div className="space-y-2">
              <Label>Nivel</Label>
              <Select value={levelValue} onValueChange={(v) => setValue('level', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un nivel" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(LEVEL_LABELS) as Level[]).map((level) => (
                    <SelectItem key={level} value={level}>
                      {LEVEL_LABELS[level]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.level && <p className="text-xs text-destructive">{errors.level.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={statusValue} onValueChange={(v) => setValue('status', v as 'active' | 'inactive')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <FileDropzone
              label="Archivo del libro (EPUB o PDF)"
              accept=".epub,.pdf"
              file={epubFile}
              onChange={setEpubFile}
              hint={isEdit ? 'Dejar vacío para mantener el archivo actual' : 'Requerido (.epub o .pdf)'}
            />

            <FileDropzone
              label="Portada"
              accept="image/*"
              file={coverFile}
              onChange={setCoverFile}
              hint={isEdit ? 'Dejar vacío para mantener la portada actual' : 'Opcional (JPG, PNG)'}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate('/books')}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear libro'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
