import { create } from 'zustand';
import axios from 'axios';

export interface Game {
  _id: string;
  title: string;
  status: string;
  platform: string;
  estimatedPlayTime: number;
  actualPlayTime: number;
  priority: number;
  notes: string;
}

interface GameStore {
  games: Game[];
  loading: boolean;
  error: string | null;
  fetchGames: () => Promise<void>;
  addGame: (game: Omit<Game, '_id'>) => Promise<Game>;
  updateGame: (id: string, game: Partial<Game>) => Promise<Game>;
  deleteGame: (id: string) => Promise<void>;
  deleteMultipleGames: (ids: string[]) => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  games: [],
  loading: false,
  error: null,

  fetchGames: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/games', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      set({ games: response.data, loading: false });
    } catch (error: any) {
      console.error('Error fetching games:', error);
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to load games', 
        loading: false 
      });
    }
  },

  addGame: async (game) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/games', game, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      set((state) => ({ 
        games: [...state.games, response.data.game],
        loading: false 
      }));
      return response.data.game;
    } catch (error: any) {
      console.error('Error adding game:', error);
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to add game', 
        loading: false 
      });
      throw error;
    }
  },

  updateGame: async (id, gameData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/games/${id}`, gameData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      set((state) => ({
        games: state.games.map(g => g._id === id ? response.data.game : g),
        loading: false
      }));
      return response.data.game;
    } catch (error: any) {
      console.error('Error updating game:', error);
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to update game', 
        loading: false 
      });
      throw error;
    }
  },

  deleteGame: async (id) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/games/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      set((state) => ({
        games: state.games.filter(g => g._id !== id),
        loading: false
      }));
    } catch (error: any) {
      console.error('Error deleting game:', error);
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to delete game', 
        loading: false 
      });
      throw error;
    }
  },

  deleteMultipleGames: async (ids) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const deletePromises = ids.map(id => 
        axios.delete(`/api/games/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      );
      await Promise.all(deletePromises);
      set((state) => ({
        games: state.games.filter(game => !ids.includes(game._id)),
        loading: false
      }));
    } catch (error: any) {
      console.error('Error deleting multiple games:', error);
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to delete games', 
        loading: false 
      });
      throw error;
    }
  }
}));