import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useCreateBook, useUpdateBook, useBook } from '@/hooks/useBooks';
import { uploadFiles } from '@/api/upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileDropzone } from '@/components/shared/FileDropzone';
import { LevelMultiSelect } from '@/components/shared/LevelMultiSelect';
import type { Level } from '@/types/api';

const schema = z.object({
  title: z.string().min(1, 'Título requerido'),
  description: z.string().optional(),
  levels: z.array(z.string()).min(1, 'Selecciona al menos un nivel'),
  status: z.enum(['active', 'inactive']),
});

type FormData = z.infer<typeof schema>;

interface BookFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId?: number;
  defaultLevel?: Level;
}

export function BookFormModal({ open, onOpenChange, bookId, defaultLevel }: BookFormModalProps) {
  const isEdit = !!bookId;
  const { data: existing } = useBook(bookId ?? 0);
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
    defaultValues: { status: 'active', levels: defaultLevel ? [defaultLevel] : [] },
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit && existing) {
      reset({
        title: existing.title,
        description: existing.description ?? '',
        levels: existing.levels,
        status: existing.status,
      });
    } else {
      reset({ status: 'active', levels: defaultLevel ? [defaultLevel] : [], title: '', description: '' });
      setEpubFile(null);
      setCoverFile(null);
    }
  }, [open, existing, isEdit, defaultLevel, reset]);

  async function onSubmit(data: FormData) {
    if (epubFile && !epubFile.name.endsWith('.epub') && !epubFile.name.endsWith('.pdf')) {
      toast.error('El archivo debe tener extensión .epub o .pdf');
      return;
    }

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
        await updateBook.mutateAsync({ id: bookId!, payload: { ...data, fileUrl, fileType, coverImage } });
        toast.success('Libro actualizado');
      } else {
        await createBook.mutateAsync({ ...data, fileUrl, fileType, coverImage });
        toast.success('Libro creado');
      }
      onOpenChange(false);
    } catch {
      toast.error('Error al guardar el libro');
    } finally {
      setSubmitting(false);
    }
  }

  const statusValue = watch('status');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar libro' : 'Nuevo libro'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 min-w-0">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input id="description" {...register('description')} />
          </div>

          <LevelMultiSelect
            value={(watch('levels') ?? []) as Level[]}
            onChange={(levels) => setValue('levels', levels)}
            error={errors.levels?.message as string | undefined}
          />

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

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear libro'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
