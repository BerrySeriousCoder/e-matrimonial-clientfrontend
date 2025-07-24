import './globals.css';
import type { ReactNode } from 'react';
import QueryProvider from '../components/QueryProvider';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <div className="min-h-screen flex flex-col items-center justify-start ">
            <div className="w-full py-6 px-5 ">
              {/* Header will go here */}
              {children}
            </div>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
