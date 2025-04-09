'use client';
import { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";

interface Game {
  _id: string;
  title: string;
  estimatedPlayTime: number;
  actualPlayTime: number;
}

interface User {
  id: string;
  username: string;
  email: string;
  games: Game[];
}

function Catalog() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (err) {
        setError("Error fetching user data");
        console.error("Error fetching user:", err);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="container">
      <h1 className="title">Game Backlog</h1>
      <div className="nav-buttons">
        <button className="btn red">Games</button>
        <button className="btn blue">My Backlogs</button>
        <button className="btn green">Account</button>
      </div>

      <div className="backlog-header">
        <button className="backlog-title">My Backlog #1</button>
      </div>

      {error && <p className="error">{error}</p>}

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
              {user.games.map((game) => (
                <tr key={game._id}>
                  <td>{game.title}</td>
                  <td>{game.estimatedPlayTime} Hours</td>
                  <td>
                    {game.actualPlayTime} Hours
                    <span className="progress" style={{ color: "green" }}>
                      (Progress: {((game.actualPlayTime / game.estimatedPlayTime) * 100).toFixed(1)}%)
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
    </div>
  );
}

export default Catalog;
