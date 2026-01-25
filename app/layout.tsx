import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/ui/AuthContext';
import { ToastProvider } from '@/components/ui/ToastContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Appointment & Queue Manager',
  description: 'Smart appointment and queue management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}