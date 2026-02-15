import { NavigationProvider } from '@/components/navigation';
import { Layout } from '@/components/layout/Layout';

export const metadata = {
  title: 'AFDA - Gestion',
  description: 'Système de gestion d\'association',
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NavigationProvider>
      <Layout title="AFDA">
        {children}
      </Layout>
    </NavigationProvider>
  );
}