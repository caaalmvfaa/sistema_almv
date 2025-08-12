import { create } from 'zustand';

// Tipos para el usuario y los datos de la app

// Usar UsuarioConfig de types.ts como User global
import type { UsuarioConfig, AppData as RealAppData } from './types';
export type User = UsuarioConfig;

export type AppData = RealAppData;

interface AppState {
  currentUser: User | null;
  appData: AppData | null;
  setCurrentUser: (user: User | null) => void;
  setAppData: (data: AppData | null | ((prev: AppData | null) => AppData | null)) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  appData: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  setAppData: (data) => {
    if (typeof data === 'function') {
      set(state => ({ appData: (data as any)(state.appData) }));
    } else {
      set({ appData: data });
    }
  },
}));
