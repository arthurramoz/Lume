import Providers from '@/components/Providers/Providers';
import type { Metadata } from 'next';
import { Baloo_2, Nunito } from 'next/font/google';

const baloo2 = Baloo_2({
  subsets: ['latin'],
  variable: '--font-baloo',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lume - Livros Infantis',
  description: 'Lume - Livros Infantis',
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="pt">
      <body className={`${nunito.className} ${baloo2.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
