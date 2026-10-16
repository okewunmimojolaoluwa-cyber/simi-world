import type { Metadata } from 'next';
import { WORLD } from '@/data/world';
import './globals.css';
import { Playfair_Display, Poppins, Dancing_Script } from 'next/font/google';

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const poppins = Poppins({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

const dancing = Dancing_Script({ 
  subsets: ['latin'],
  variable: '--font-dancing',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Simi's World",
  description: 'A personal digital world created with love for Simi',
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: "Simi's World",
    description: 'A personal digital world created with love for Simi',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable} ${dancing.variable}`}>
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
