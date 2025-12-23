import { Layout } from '@/components/layout/Layout';
import './globals.css';
import { NavigationProvider } from '@/components/navigation';

export const metadata = {
  title: 'AFDA',
  description: 'Association membership and workshop management system',
};

export default function App({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <NavigationProvider>
          <Layout title={metadata.title}>{children}</Layout>
        </NavigationProvider>
      </body>
    </html>    
  );

}