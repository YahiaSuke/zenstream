import type { Metadata } from 'next';
import '../replica/design/tokens.css';
import '../public/styles.css';

export const metadata: Metadata = {
  title: 'ZenStream - Cinema Without the Noise',
  description: 'Serene, noise-free streaming with full respect for the film.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg text-text font-sans antialiased">
        <div id="app" className="app-container">
          {children}
        </div>
      </body>
    </html>
  );
}
