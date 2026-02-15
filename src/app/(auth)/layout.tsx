export const metadata = {
  title: 'Authentification - AFDA',
  description: 'Connexion à l\'espace de gestion AFDA',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}