import '@styles/globals.scss';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Memory Game',
  description: 'Ein modernes Memory-Spiel mit Next.js 15 und React',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Rubik+Mono+One&display=swap" rel="stylesheet" />
      </head>
      <body data-colorset="0">
        <svg xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }}>
          <symbol id="triforce" viewBox="0 0 100 100">
            <path d="M36.042,50.593L49.912,26.59l13.868,24.003H36.042z M54.412,51.965l13.867,24.002H40.543L54.412,51.965z M45.412,51.965l13.868,24.002H31.542L45.412,51.965z" />
          </symbol>
        </svg>
        {children}
      </body>
    </html>
  );
} 