import { createBrowserRouter, Navigate } from 'react-router';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { AppLayout } from '@/components/shared/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { BooksPage } from '@/pages/BooksPage';
import { BookFormPage } from '@/pages/BookFormPage';
import { InstitutionsPage } from '@/pages/InstitutionsPage';
import { InstitutionFormPage } from '@/pages/InstitutionFormPage';
import { InstitutionBooksPage } from '@/pages/InstitutionBooksPage';
import { UsersPage } from '@/pages/UsersPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'books', element: <BooksPage /> },
          { path: 'books/new', element: <BookFormPage /> },
          { path: 'books/:id/edit', element: <BookFormPage /> },
          { path: 'institutions', element: <InstitutionsPage /> },
          { path: 'institutions/new', element: <InstitutionFormPage /> },
          { path: 'institutions/:id/edit', element: <InstitutionFormPage /> },
          { path: 'institutions/:id/books', element: <InstitutionBooksPage /> },
          { path: 'users', element: <UsersPage /> },
        ],
      },
    ],
  },
]);
