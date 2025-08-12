import React, { useState } from 'react';
import { UsuarioConfig } from '../types';
import { Button } from './ui';

interface LoginScreenProps {
  users: UsuarioConfig[];
  onLogin: (user: UsuarioConfig) => void;
  isLoading: boolean;
}

// Fondo animado de gradiente
const AnimatedGradientBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute top-0 -left-4 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
    <div className="absolute top-0 -right-4 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
  </div>
);

const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin, isLoading }) => {
  const [selectedUser, setSelectedUser] = useState<UsuarioConfig | null>(users.length > 0 ? users[0] : null);

  const handleLoginClick = () => {
    if (selectedUser) {
      onLogin(selectedUser);
    }
  };

  const getAvatarColors = (userId: string) => {
    const colors = [
      { bg: 'bg-amber-500', ring: 'ring-amber-300' },
      { bg: 'bg-sky-500', ring: 'ring-sky-300' },
      { bg: 'bg-rose-500', ring: 'ring-rose-300' },
      { bg: 'bg-teal-500', ring: 'ring-teal-300' },
      { bg: 'bg-violet-500', ring: 'ring-violet-300' }
    ];
    const index = parseInt(userId.replace('USR', ''), 10) - 1;
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 overflow-hidden relative">
      <AnimatedGradientBackground />
      
      <div className="w-full max-w-sm glass-pane rounded-3xl shadow-2xl shadow-slate-900/10 p-8 animate-fade-in-up">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600">
            Bienvenido
          </h1>
          <p className="text-slate-500 mt-2">
            Selecciona tu perfil para ingresar al sistema
          </p>
        </div>
  
        <div className="mt-10 space-y-4 text-center">
          <div className="flex justify-center items-center gap-4 h-20">
            {users.map((user, index) => (
              <button 
                key={user.id_usuario}
                onClick={() => setSelectedUser(user)}
                className={`rounded-full transition-all duration-300 ease-in-out focus:outline-none 
                  ${selectedUser?.id_usuario === user.id_usuario 
                    ? `w-20 h-20 shadow-lg ring-4 ${getAvatarColors(user.id_usuario).ring}` 
                    : 'w-12 h-12 opacity-50 hover:opacity-100 hover:scale-110'
                  }`}
                title={user.nombre_usuario}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold text-2xl ${getAvatarColors(user.id_usuario).bg}`}>
                  {user.nombre_usuario.charAt(0)}
                </div>
              </button>
            ))}
          </div>
          
          {selectedUser && (
            <div className="h-14 pt-2">
              <p className="font-bold text-slate-800 text-xl">{selectedUser.nombre_usuario}</p>
              <p className="text-slate-500 text-sm -mt-1">{selectedUser.nombre_servicio_asignado}</p>
            </div>
          )}
        </div>

        <div className="mt-8">
          <Button
            variant="premium"
            className="w-full text-base py-3"
            onClick={handleLoginClick}
            disabled={!selectedUser || isLoading}
          >
            {isLoading ? 'Ingresando...' : 'Entrar al Sistema'}
          </Button>
        </div>
      </div>

      <style>{`
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;