import React from 'react';
import { Button } from './ui';
import { XCircleIcon } from './icons';

interface ErrorScreenProps {
  message: string;
  onRetry: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ message, onRetry }) => (
  <div className="h-screen flex flex-col items-center justify-center bg-rose-50 text-center p-8">
    <XCircleIcon className="w-16 h-16 text-rose-400 mb-4" />
    <h2 className="text-2xl font-bold text-rose-800 mb-2">Ocurrió un Error</h2>
    <p className="text-rose-600 mb-6 max-w-md">{message}</p>
    <Button onClick={onRetry} variant="secondary">
      Volver a intentar
    </Button>
  </div>
);

export default ErrorScreen;
