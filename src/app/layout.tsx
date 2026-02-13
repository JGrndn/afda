import { Layout } from '@/components/layout/Layout';
import '@/app/globals.css';
import { SessionProvider } from '@/components/auth/SessionProvider';


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
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>    
  );

}