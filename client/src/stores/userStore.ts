import { create } from 'zustand';

interface User {
    id: string;
    username: string;
    email: string;
}

interface UserStore {
    user: User | null;
    token: string | null;
    setUser: (user: User) => void;
    setToken: (token: string) => void;
    logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
    user: null,
    token: null,
    setUser: (user) => set({ user }),
    setToken: (token) => set({ token }),
    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
    },
}));