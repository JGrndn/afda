'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'Erreur de configuration du serveur.';
      case 'AccessDenied':
        return 'Accès refusé.';
      case 'Verification':
        return 'Le lien de vérification a expiré ou a déjà été utilisé.';
      case 'CredentialsSignin':
        return 'Email ou mot de passe incorrect.';
      default:
        return 'Une erreur est survenue lors de la connexion.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 p-3">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Erreur d'authentification
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {getErrorMessage(error)}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Link
            href="/auth/signin"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Retour à la connexion
          </Link>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Besoin d'aide ?{' '}
              <a href="mailto:support@afda.com" className="font-medium text-blue-600 hover:text-blue-500">
                Contactez le support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}