import './globals.css';

export const metadata = {
  title: 'AFDA Management',
  description: 'Association membership and workshop management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}