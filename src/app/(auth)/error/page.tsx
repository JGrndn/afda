import { Suspense } from 'react';
import AuthErrorContent from './ErrorForm';

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}