import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ReduxProvider from '@/store/Provider';

// --- CRITICAL: This import makes the map visible ---
import 'maplibre-gl/dist/maplibre-gl.css'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'InfraMap India',
  description: 'Unified Underground Infrastructure Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}