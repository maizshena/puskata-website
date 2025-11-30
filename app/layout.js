import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Footer from '@/components/Footer'; // Add this

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Library Management System',
  description: 'Sistem Manajemen Perpustakaan',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Providers>
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}