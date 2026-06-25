import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthNav } from '@/components/AuthNav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Memrider — Personal Memory Search',
  description: 'Ask your past self using semantic memory retrieval',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main>
          <nav>
            <Link href="/write">Write</Link>
            <Link href="/search">Search</Link>
            <Link href="/entries">Entries</Link>
            <AuthNav />
          </nav>
          {children}
        </main>
      </body>
    </html>
  );
}
