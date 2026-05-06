import { BookOpen, Building2, Users } from 'lucide-react';
import { Link } from 'react-router';
import { useBooks } from '@/hooks/useBooks';
import { useInstitutions } from '@/hooks/useInstitutions';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@/api/users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LEVEL_LABELS } from '@/types/api';

function StatCard({
  title,
  value,
  icon: Icon,
  loading,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-3xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { data: books, isLoading: loadingBooks } = useBooks();
  const { data: institutions, isLoading: loadingInstitutions } = useInstitutions();
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const recentBooks = books?.slice(0, 5) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Resumen del sistema</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total de Libros"
          value={books?.length ?? 0}
          icon={BookOpen}
          loading={loadingBooks}
        />
        <StatCard
          title="Instituciones"
          value={institutions?.length ?? 0}
          icon={Building2}
          loading={loadingInstitutions}
        />
        <StatCard
          title="Usuarios"
          value={users?.length ?? 0}
          icon={Users}
          loading={loadingUsers}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos libros agregados</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingBooks ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentBooks.length === 0 ? (
            <p className="text-muted-foreground text-sm">No hay libros aún.</p>
          ) : (
            <div className="space-y-3">
              {recentBooks.map((book) => (
                <div key={book.id} className="flex items-center gap-4">
                  {book.coverImage ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}${book.coverImage}`}
                      alt={book.title}
                      className="h-12 w-9 rounded object-cover"
                    />
                  ) : (
                    <div className="h-12 w-9 rounded bg-muted flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/books/${book.id}/edit`}
                      className="font-medium text-sm hover:underline truncate block"
                    >
                      {book.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{LEVEL_LABELS[book.level]}</p>
                  </div>
                  <Badge variant={book.status === 'active' ? 'success' : 'secondary'}>
                    {book.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
