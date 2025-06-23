import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Client Pilot',
  description: 'Task dashboard for clients',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
