import React from 'react';
import { ThemeProvider } from 'next-themes';
import Layout from '@/components/layout/Layout';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Figma-to-Code</title>
        <meta name="description" content="Convert Figma designs to production-ready code" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Layout>
            {children}
          </Layout>
        </ThemeProvider>
      </body>
    </html>
  );
}
