'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Set the default base URL for Axios (change port as needed)
axios.defaults.baseURL = 'http://localhost:3000';

// PrimeReact imports
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';

import "../App.css";
import "./Catalog.css";

interface Game {
  _id?: string;
  title: string;
  status: string;
  platform: string;
  estimatedPlayTime: number;
  actualPlayTime: number;
  priority: number;
  notes?: string;
  user?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  games: Game[];
}

const statusOptions = [
  { label: 'Backlog', value: 'Backlog' },
  { label: 'Playing', value: 'Playing' },
  { label: 'Completed', value: 'Completed' },
  { label: 'On Hold', value: 'On Hold' },
  { label: 'Dropped', value: 'Dropped' }
];

const priorityOptions = [
  { label: '1 (Highest)', value: 1 },
  { label: '2', value: 2 },
  { label: '3 (Default)', value: 3 },
  { label: '4', value: 4 },
  { label: '5 (Lowest)', value: 5 }
];

export default function Catalog() {
  // Ref for Toast notifications
  const toast = useRef<Toast>(null);

  // State for user and error
  const [user, setUser] = useState<User | null>(null);
  const [userError, setUserError] = useState<string | null>(null);

  // State for games (DataTable) and error/loading flag
  const [games, setGames] = useState<Game[]>([]);
  const [gamesError, setGamesError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // State for dialog (create/update game)
  const [gameDialogVisible, setGameDialogVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameFormData, setGameFormData] = useState<Game>({
    title: '',
    status: 'Backlog',
    platform: '',
    estimatedPlayTime: 0,
    actualPlayTime: 0,
    priority: 3,
    notes: ''
  });

  // Fetch user profile (with populated games) on mount.
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUserError('No token found. Please log in.');
          return;
        }
        // Note: The URL here uses /api/users/profile per your user routes.
        const response = await axios.get('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (error) {
        setUserError('Error fetching user data');
        console.error('Error fetching user:', error);
      }
    };
    fetchUserData();
  }, []);

  // Fetch games for the DataTable.
  const fetchGames = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setGamesError('No token found. Please log in.');
        setLoading(false);
        return;
      }
      const response = await axios.get('/api/games/getGames', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Ensure we always use an array.
      setGames(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      setGamesError('Error fetching games');
      setLoading(false);
      console.error('Error fetching games:', error);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  // Open dialog for a new game.
  const openNewGameDialog = () => {
    setSelectedGame(null);
    setGameFormData({
      title: '',
      status: 'Backlog',
      platform: '',
      estimatedPlayTime: 0,
      actualPlayTime: 0,
      priority: 3,
      notes: ''
    });
    setGameDialogVisible(true);
  };

  // Open dialog to edit an existing game.
  const openEditGameDialog = (game: Game) => {
    setSelectedGame(game);
    setGameFormData({ ...game });
    setGameDialogVisible(true);
  };

  const hideGameDialog = () => {
    setGameDialogVisible(false);
  };

  // Save game – Create if new, Update if editing.
  const saveGame = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'No token found. Please log in.',
          life: 3000
        });
        return;
      }
      if (!selectedGame) {
        // Using full URL because axios.defaults.baseURL is set to your backend
        const addResponse = await axios.post('/api/games/addGame', gameFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGames((prev) => [...prev, addResponse.data.game]);
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Game added successfully',
          life: 3000
        });
      } else {
        const updateResponse = await axios.put(`/api/games/updateGame/${selectedGame._id}`, gameFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const updatedGame = updateResponse.data.game;
        setGames((prev) =>
          prev.map((g) => (g._id === updatedGame._id ? updatedGame : g))
        );
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Game updated successfully',
          life: 3000
        });
      }
      setGameDialogVisible(false);
      setSelectedGame(null);
    } catch (error: any) {
      console.error('Error saving game:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Could not save game',
        life: 3000
      });
    }
  };

  // Confirm deletion before deleting a game.
  const confirmDeleteGame = (game: Game) => {
    confirmDialog({
      message: `Are you sure you want to delete "${game.title}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => deleteGameHandler(game),
      reject: () => {}
    });
  };

  const deleteGameHandler = async (game: Game) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'No token found. Please log in.',
          life: 3000
        });
        return;
      }
      await axios.delete(`/api/games/deleteGame/${game._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGames((prev) => prev.filter((g) => g._id !== game._id));
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Game deleted',
        life: 3000
      });
    } catch (error: any) {
      console.error('Error deleting game:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Could not delete game',
        life: 3000
      });
    }
  };

  // Template for action buttons in the DataTable.
  const actionBodyTemplate = (rowData: Game) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-success"
        onClick={() => openEditGameDialog(rowData)}
        tooltip="Edit"
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger"
        onClick={() => confirmDeleteGame(rowData)}
        tooltip="Delete"
      />
    </div>
  );

  // Footer for the create/edit dialog.
  const gameDialogFooter = (
    <div>
      <Button 
        label="Cancel" 
        icon="pi pi-times" 
        onClick={hideGameDialog} 
        className="p-button-text" 
      />
      <Button 
        label={selectedGame ? "Update" : "Create"} 
        icon="pi pi-check" 
        onClick={saveGame} 
      />
    </div>
  );

  return (
    <div className="container">
      <Toast ref={toast} />
      <ConfirmDialog />

      <h1 className="title">Game Backlog</h1>
      <div className="nav-buttons">
        <Button label="Games" className="p-button-rounded p-button-secondary mr-2" />
        <Button label="My Backlogs" className="p-button-rounded p-button-secondary mr-2" />
        <Button label="Account" className="p-button-rounded p-button-secondary" />
      </div>

      <div className="backlog-header mt-4 mb-4">
        <Button 
          label="My Backlog #1" 
          className="p-button-outlined p-button-info mr-2" 
        />
      </div>

      {userError && <p className="error">{userError}</p>}
      {user ? (
        <div className="card">
          <h2>{user.username}'s Backlog</h2>
          <table className="game-table">
            <thead>
              <tr>
                <th>My Games</th>
                <th>Total Playtime</th>
                <th>Current Playtime</th>
              </tr>
            </thead>
            <tbody>
              {(user?.games || []).map((game) => (
                <tr key={game._id}>
                  <td>{game.title}</td>
                  <td>{game.estimatedPlayTime} Hours</td>
                  <td>
                    {game.actualPlayTime} Hours
                    <span className="progress" style={{ color: "green" }}>
                      {game.estimatedPlayTime > 0 && (
                        <> (Progress: {((game.actualPlayTime / game.estimatedPlayTime) * 100).toFixed(1)}%)</>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}

      <div className="card mt-4">
        <div className="flex justify-content-between align-items-center mb-3">
          <h2 className="m-0">Manage My Games</h2>
          <Button 
            label="New Game" 
            icon="pi pi-plus" 
            onClick={openNewGameDialog} 
          />
        </div>

        {gamesError && <p className="error">{gamesError}</p>}

        <DataTable 
          value={Array.isArray(games) ? games : []} 
          responsiveLayout="scroll"
          paginator
          rows={5}
          loading={loading}
          emptyMessage="No games found."
        >
          <Column field="title" header="Title" sortable style={{ width: '20%' }} />
          <Column field="status" header="Status" sortable style={{ width: '12%' }} />
          <Column field="platform" header="Platform" sortable style={{ width: '15%' }} />
          <Column field="estimatedPlayTime" header="Est. (Hrs)" sortable style={{ width: '10%' }} />
          <Column field="actualPlayTime" header="Actual (Hrs)" sortable style={{ width: '10%' }} />
          <Column field="priority" header="Priority" sortable style={{ width: '10%' }} />
          <Column body={actionBodyTemplate} style={{ width: '13%' }} />
        </DataTable>
      </div>

      <Dialog
        visible={gameDialogVisible}
        style={{ width: '32rem' }}
        header={selectedGame ? 'Edit Game' : 'New Game'}
        modal
        className="p-fluid"
        footer={gameDialogFooter}
        onHide={hideGameDialog}
      >
        <div className="field">
          <label htmlFor="title">Title</label>
          <InputText
            id="title"
            value={gameFormData.title}
            onChange={(e) => setGameFormData({ ...gameFormData, title: e.target.value })}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="platform">Platform</label>
          <InputText
            id="platform"
            value={gameFormData.platform}
            onChange={(e) => setGameFormData({ ...gameFormData, platform: e.target.value })}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="status">Status</label>
          <Dropdown
            id="status"
            value={gameFormData.status}
            options={statusOptions}
            onChange={(e) => setGameFormData({ ...gameFormData, status: e.value })}
            placeholder="Select a status"
          />
        </div>

        <div className="field">
          <label htmlFor="estimatedPlayTime">Estimated Play Time (hours)</label>
          <InputNumber
            id="estimatedPlayTime"
            value={gameFormData.estimatedPlayTime}
            onChange={(e) => setGameFormData({ ...gameFormData, estimatedPlayTime: e.value ?? 0 })}
            min={0}
            showButtons
          />
        </div>

        <div className="field">
          <label htmlFor="actualPlayTime">Actual Play Time (hours)</label>
          <InputNumber
            id="actualPlayTime"
            value={gameFormData.actualPlayTime}
            onChange={(e) => setGameFormData({ ...gameFormData, actualPlayTime: e.value ?? 0 })}
            min={0}
            showButtons
          />
        </div>

        <div className="field">
          <label htmlFor="priority">Priority (1=Highest, 5=Lowest)</label>
          <Dropdown
            id="priority"
            value={gameFormData.priority}
            options={priorityOptions}
            onChange={(e) => setGameFormData({ ...gameFormData, priority: e.value })}
            placeholder="Select Priority"
          />
        </div>

        <div className="field">
          <label htmlFor="notes">Notes</label>
          <InputTextarea
            id="notes"
            value={gameFormData.notes}
            onChange={(e) => setGameFormData({ ...gameFormData, notes: e.target.value })}
            rows={3}
            autoResize
          />
        </div>
      </Dialog>
    </div>
  );
}


