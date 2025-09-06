import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import '../utils/console-suppressions';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ReadnWin - Digital Bookstore',
  description: 'Discover, read, and enjoy books in digital and physical formats',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Providers>
          <div className="flex-1">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}