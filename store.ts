import { create } from 'zustand';

// Tipos para el usuario y los datos de la app
export interface User {
  id: string;
  name: string;
  // ...otros campos relevantes
}

export interface AppData {
  // Define aquí la estructura de tus datos globales
}

interface AppState {
  currentUser: User | null;
  appData: AppData | null;
  setCurrentUser: (user: User | null) => void;
  setAppData: (data: AppData | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  appData: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  setAppData: (data) => set({ appData: data }),
}));
