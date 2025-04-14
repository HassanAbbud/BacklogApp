'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Set default base URL for Axios (adjust port if needed)
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

// Helper function for row templates
const progressBodyTemplate = (rowData: Game) => {
  if (rowData.estimatedPlayTime > 0) {
    const progress = (rowData.actualPlayTime / rowData.estimatedPlayTime) * 100;
    return `${progress.toFixed(1)}%`;
  }
  return 'N/A';
};

const hoursLeftBodyTemplate = (rowData: Game) => {
  if (rowData.estimatedPlayTime > 0) {
    const left = rowData.estimatedPlayTime - rowData.actualPlayTime;
    return left > 0 ? `${left} Hours` : '0 Hours';
  }
  return 'N/A';
};

// Helper function to choose a color based on a percentage value
const getColorClass = (percentage: number): string => {
  if (percentage < 25) return 'red';
  if (percentage < 50) return 'orange';
  if (percentage < 75) return 'yellow';
  return 'green';
};

function Catalog() {
  // Toast ref for notifications.
  const toast = useRef<Toast>(null);

  // State for user profile and error handling
  const [user, setUser] = useState<User | null>(null);
  const [userError, setUserError] = useState<string | null>(null);

  // State for games (DataTable) and error/loading flag
  const [games, setGames] = useState<Game[]>([]);
  const [gamesError, setGamesError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // For managing multiple selection in DataTable
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);

  // State for create/edit dialog
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

  // Fetch user profile (with populated games) on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUserError('No token found. Please log in.');
          return;
        }
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

  // Fetch games for the DataTable
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

  // Compute overall totals
  const totalEstimated = games.reduce((sum, game) => sum + game.estimatedPlayTime, 0);
  const totalActual = games.reduce((sum, game) => sum + game.actualPlayTime, 0);
  const overallProgress = totalEstimated > 0 ? (totalActual / totalEstimated) * 100 : 0;
  const totalHoursLeft = totalEstimated - totalActual;
  const hoursLeftRatio = totalEstimated > 0 ? (totalHoursLeft / totalEstimated) * 100 : 0;

  // Open dialog for a new game
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

  // Open dialog to edit an existing game
  const openEditGameDialog = (game: Game) => {
    setSelectedGame(game);
    setGameFormData({ ...game });
    setGameDialogVisible(true);
  };

  const hideGameDialog = () => {
    setGameDialogVisible(false);
  };

  // Save game – Create if new, update if editing
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
        const updateResponse = await axios.put(
          `/api/games/updateGame/${selectedGame._id}`,
          gameFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
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

  // Confirm deletion before deleting a single game
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

  // Delete multiple selected games
  const deleteSelectedGames = async () => {
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
      confirmDialog({
        message: `Are you sure you want to delete ${selectedGames.length} selected game(s)?`,
        header: 'Confirm Bulk Deletion',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
          await Promise.all(
            selectedGames.map((game) =>
              axios.delete(`/api/games/deleteGame/${game._id}`, {
                headers: { Authorization: `Bearer ${token}` }
              })
            )
          );
          setGames((prev) =>
            prev.filter((g) => !selectedGames.some((sg) => sg._id === g._id))
          );
          setSelectedGames([]);
          toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Selected games deleted',
            life: 3000
          });
        },
        reject: () => {}
      });
    } catch (error: any) {
      console.error('Error deleting selected games:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Could not delete selected games',
        life: 3000
      });
    }
  };

  // Template for action buttons in each row
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

  // Define dialog footer so that it's available
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
                <th>Hours Left</th>
              </tr>
            </thead>
            <tbody>
              {(user?.games || []).map((game) => (
                <tr key={game._id}>
                  <td>{game.title}</td>
                  <td>{game.estimatedPlayTime} Hours</td>
                  <td>{game.actualPlayTime} Hours</td>
                  <td>
                    {game.estimatedPlayTime > 0
                      ? `${Math.max(game.estimatedPlayTime - game.actualPlayTime, 0)} Hours`
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}

      {/* Summary Section */}
      <div className="card mt-4">
        <h2>Summary</h2>
        <div className="summary">
          <p>
            Overall Progress:{' '}
            <span className={getColorClass(overallProgress)}>
              {totalEstimated > 0 ? overallProgress.toFixed(1) : 0}%
            </span>
          </p>
          <p>
            Total Hours Left:{' '}
            <span className={getColorClass(overallProgress)}>
              {totalHoursLeft > 0 ? totalHoursLeft : 0} Hours
            </span>
          </p>
        </div>
      </div>

      {/* Manage My Games Section */}
      <div className="card mt-4">
        <div className="flex justify-content-between align-items-center mb-3">
          <h2 className="m-0">Manage My Games</h2>
          <div className="flex gap-2">
            <Button label="New Game" icon="pi pi-plus" onClick={openNewGameDialog} />
            <Button
              label="Delete Selected"
              icon="pi pi-trash"
              className="p-button-danger"
              disabled={selectedGames.length === 0}
              onClick={deleteSelectedGames}
            />
          </div>
        </div>

        {gamesError && <p className="error">{gamesError}</p>}

        <DataTable
          value={Array.isArray(games) ? games : []}
          selection={selectedGames}
          onSelectionChange={(e: any) => setSelectedGames(e.value as Game[])}
          dataKey="_id"
          selectionMode="multiple"
          responsiveLayout="scroll"
          paginator
          rows={5}
          loading={loading}
          emptyMessage="No games found."
        >
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} exportable={false} />
          <Column field="title" header="Title" sortable style={{ width: '18%' }} />
          <Column field="status" header="Status" sortable style={{ width: '10%' }} />
          <Column field="platform" header="Platform" sortable style={{ width: '13%' }} />
          <Column field="estimatedPlayTime" header="Est. (Hrs)" sortable style={{ width: '10%' }} />
          <Column field="actualPlayTime" header="Actual (Hrs)" sortable style={{ width: '10%' }} />
          <Column header="Progress" body={progressBodyTemplate} sortable style={{ width: '10%' }} />
          <Column header="Hours Left" body={hoursLeftBodyTemplate} sortable style={{ width: '10%' }} />
          <Column field="priority" header="Priority" sortable style={{ width: '8%' }} />
          <Column body={actionBodyTemplate} style={{ width: '8%' }} />
        </DataTable>
      </div>

      {/* Dialog for create/edit game */}
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

export default Catalog;
