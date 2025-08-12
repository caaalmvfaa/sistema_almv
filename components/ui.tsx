import React, { ReactNode, useEffect, useState } from 'react';

// --- Card Rediseñada ---
export const Card: React.FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`glass-pane shadow-lg shadow-slate-600/5 rounded-2xl ${className}`}>
    {children}
  </div>
);

// --- Botón con Variantes ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'premium' | 'primary-glow';
}
export const Button: React.FC<ButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
  const baseClasses = 'px-5 py-2.5 rounded-xl font-semibold text-sm focus:outline-none focus:ring-4 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 active:translate-y-0 shadow-md hover:shadow-lg disabled:shadow-md disabled:transform-none';
  const variantClasses = {
    primary: 'bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500/50 shadow-teal-500/20 hover:shadow-teal-500/30',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 focus:ring-slate-400/50 shadow-slate-600/10 hover:shadow-slate-600/20',
    premium: 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white focus:ring-indigo-500/50 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 disabled:shadow-none',
    'primary-glow': 'bg-gradient-to-br from-teal-500 to-indigo-600 text-white focus:ring-indigo-500/50 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 disabled:shadow-none'
  };
  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// --- Spinner Moderno ---
export const Spinner: React.FC<{ message?: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-full text-slate-500">
    <div className="w-12 h-12 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"></div>
    {message && <p className="mt-4 text-lg tracking-wide animate-pulse">{message}</p>}
  </div>
);

// --- Modal con Transiciones ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const [isRendered, setIsRendered] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = 'auto';
      };
    }
  }, [isOpen]);

  useEffect(() => {
    return () => { document.body.style.overflow = 'auto' };
  }, []);

  if (!isRendered) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className={`fixed inset-0 glass-pane transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
      <div 
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative transition-all duration-300 ease-out border border-slate-200 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-5">
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};