'use client';
import { ChartData, ChartOptions } from 'chart.js';
import { Chart } from 'primereact/chart';
import React, { useContext, useEffect, useState } from 'react';
import { LayoutContext } from '../layout/context/layoutcontext';
import axios from 'axios';

// Interfaces
interface Game {
  _id: string;
  title: string;
  status: "Backlog" | "Playing" | "Completed" | "On Hold" | "Dropped";
  platform: string;
  estimatedPlayTime: number;
  actualPlayTime: number;
  priority: number;
  notes?: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

interface ChartOptionsState {
  chartOptions?: ChartOptions;
  pieOptions?: ChartOptions;
}

interface ChartDataState {
  statusData?: ChartData;
  platformData?: ChartData;
  priorityData?: ChartData;
  playtimeData?: ChartData;
  trendsData?: ChartData;
  backlogPlatformData?: ChartData;
}

const GameStatistics = () => {
    const [options, setOptions] = useState<ChartOptionsState>({});
    const [data, setChartData] = useState<ChartDataState>({});
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { layoutConfig } = useContext(LayoutContext);
    
    // Fetch games data
    useEffect(() => {
        const fetchGames = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await axios.get<Game[]>('http://localhost:3000/api/games/getGames', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setGames(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching games:', error);
                setLoading(false);
            }
        };
        
        fetchGames();
    }, []);
    
    // Process chart data whenever games data changes
    useEffect(() => {
        if (loading) return;
        
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color') || '#495057';
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dfe7ef';
        
        //Process data charts data
        const statusCounts: Record<string, number> = games.reduce((acc: Record<string, number>, game) => {
            acc[game.status] = (acc[game.status] || 0) + 1;
            return acc;
        }, {});
        
        const statusLabels = Object.keys(statusCounts);
        const statusValues = Object.values(statusCounts);
        
        const statusData: ChartData = {
            labels: statusLabels,
            datasets: [
                {
                    data: statusValues,
                    backgroundColor: [
                        documentStyle.getPropertyValue('--indigo-500') || '#6366f1', 
                        documentStyle.getPropertyValue('--purple-500') || '#a855f7', 
                        documentStyle.getPropertyValue('--teal-500') || '#14b8a6',
                        documentStyle.getPropertyValue('--orange-500') || '#f97316',
                        documentStyle.getPropertyValue('--red-500') || '#ef4444'
                    ],
                    hoverBackgroundColor: [
                        documentStyle.getPropertyValue('--indigo-400') || '#8183f4', 
                        documentStyle.getPropertyValue('--purple-400') || '#b975f9', 
                        documentStyle.getPropertyValue('--teal-400') || '#41c5b7',
                        documentStyle.getPropertyValue('--orange-400') || '#fb923c',
                        documentStyle.getPropertyValue('--red-400') || '#f87171'
                    ]
                }
            ]
        };
        
        const platformCounts: Record<string, number> = games.reduce((acc: Record<string, number>, game) => {
            acc[game.platform] = (acc[game.platform] || 0) + 1;
            return acc;
        }, {});
        
        const platformLabels = Object.keys(platformCounts);
        const platformValues = Object.values(platformCounts);
        
        const platformData: ChartData = {
            labels: platformLabels,
            datasets: [
                {
                    label: 'Games per Platform',
                    backgroundColor: documentStyle.getPropertyValue('--primary-500') || '#6366f1',
                    borderColor: documentStyle.getPropertyValue('--primary-500') || '#6366f1',
                    data: platformValues
                }
            ]
        };
        
        const priorityCounts: Record<string, number> = games.reduce((acc: Record<string, number>, game) => {
            acc[game.priority.toString()] = (acc[game.priority.toString()] || 0) + 1;
            return acc;
        }, {});
        
        for (let i = 1; i <= 5; i++) {
            if (!priorityCounts[i.toString()]) priorityCounts[i.toString()] = 0;
        }
        
        const priorityLabels = Object.keys(priorityCounts).sort((a, b) => Number(a) - Number(b));
        const priorityValues = priorityLabels.map(key => priorityCounts[key]);
        
        const priorityData: ChartData = {
            labels: priorityLabels.map(priority => `Priority ${priority}`),
            datasets: [
                {
                    label: 'Games by Priority',
                    backgroundColor: documentStyle.getPropertyValue('--primary-200') || '#bcbdf9',
                    borderColor: documentStyle.getPropertyValue('--primary-200') || '#bcbdf9',
                    data: priorityValues
                }
            ]
        };
        
        const gamesWithPlaytime = games
            .filter(game => game.estimatedPlayTime > 0 || game.actualPlayTime > 0)
            .sort((a, b) => b.actualPlayTime - a.actualPlayTime)
            .slice(0, 7);
            
        const playtimeData: ChartData = {
            labels: gamesWithPlaytime.map(game => game.title),
            datasets: [
                {
                    label: 'Estimated Play Time (hours)',
                    backgroundColor: documentStyle.getPropertyValue('--blue-500') || '#3b82f6',
                    borderColor: documentStyle.getPropertyValue('--blue-500') || '#3b82f6',
                    data: gamesWithPlaytime.map(game => game.estimatedPlayTime)
                },
                {
                    label: 'Actual Play Time (hours)',
                    backgroundColor: documentStyle.getPropertyValue('--green-500') || '#22c55e',
                    borderColor: documentStyle.getPropertyValue('--green-500') || '#22c55e',
                    data: gamesWithPlaytime.map(game => game.actualPlayTime)
                }
            ]
        };
        
        const gamesByMonth: Record<string, number> = games.reduce((acc: Record<string, number>, game) => {
            const date = new Date(game.createdAt);
            const month = date.toLocaleString('default', { month: 'short' });
            const year = date.getFullYear();
            const key = `${month} ${year}`;
            
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        
        const monthsOrder: Record<string, number> = {
            'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
            'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
        };
        
        const sortedMonths = Object.keys(gamesByMonth).sort((a, b) => {
            const [monthA, yearA] = a.split(' ');
            const [monthB, yearB] = b.split(' ');
            
            if (yearA !== yearB) return Number(yearA) - Number(yearB);
            return monthsOrder[monthA] - monthsOrder[monthB];
        });
        
        const lastSixMonths = sortedMonths.slice(-6);
        const monthlyGameCounts = lastSixMonths.map(month => gamesByMonth[month]);
        
        const trendsData: ChartData = {
            labels: lastSixMonths,
            datasets: [
                {
                    label: 'Games Added',
                    data: monthlyGameCounts,
                    fill: false,
                    backgroundColor: documentStyle.getPropertyValue('--primary-500') || '#6366f1',
                    borderColor: documentStyle.getPropertyValue('--primary-500') || '#6366f1',
                    tension: 0.4
                }
            ]
        };
        
        const backlogByPlatform: Record<string, number> = {};
        
        games.forEach(game => {
            if (game.status === "Backlog") {
                backlogByPlatform[game.platform] = (backlogByPlatform[game.platform] || 0) + 1;
            }
        });
        
        const backlogPlatformLabels = Object.keys(backlogByPlatform);
        const backlogPlatformValues = Object.values(backlogByPlatform);
        
        const backlogPlatformData: ChartData = {
            labels: backlogPlatformLabels,
            datasets: [
                {
                    data: backlogPlatformValues,
                    backgroundColor: [
                        documentStyle.getPropertyValue('--blue-500') || '#3b82f6',
                        documentStyle.getPropertyValue('--green-500') || '#22c55e', 
                        documentStyle.getPropertyValue('--yellow-500') || '#eab308',
                        documentStyle.getPropertyValue('--cyan-500') || '#06b6d4',
                        documentStyle.getPropertyValue('--pink-500') || '#ec4899',
                        documentStyle.getPropertyValue('--indigo-500') || '#6366f1'
                    ]
                }
            ]
        };
        
        const chartOptions: ChartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            weight: 500
                        }
                    },
                    grid: {
                        display: false
                    },
                    border: {
                        display: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder
                    },
                    border: {
                        display: false
                    },
                    // Fix: Set beginAtZero to true for y-axis
                    beginAtZero: true
                }
            }
        };
        
        const pieOptions: ChartOptions = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: textColor
                    }
                }
            }
        };
        
        setOptions({
            chartOptions,
            pieOptions
        });
        
        setChartData({
            statusData,
            platformData,
            priorityData,
            playtimeData,
            trendsData,
            backlogPlatformData
        });
        
    }, [games, loading, layoutConfig]);

    // Calculate statistics
    const getCompletionRate = (): string => {
        if (!games.length) return "0";
        // Fix: Changed filter criteria - we need to count games marked as "Completed"
        const completed = games.filter(game => game.status === "Completed").length;
        return ((completed / games.length) * 100).toFixed(1);
    };
    
    const getAveragePlayTime = (): string => {
        const gamesWithPlaytime = games.filter(game => game.actualPlayTime > 0);
        if (!gamesWithPlaytime.length) return "0";
        
        const totalPlayTime = gamesWithPlaytime.reduce((sum, game) => sum + game.actualPlayTime, 0);
        return (totalPlayTime / gamesWithPlaytime.length).toFixed(1);
    };
    
    const getTotalBacklogTime = (): number => {
        const backlogGames = games.filter(game => game.status === "Backlog");
        return backlogGames.reduce((sum, game) => sum + (game.estimatedPlayTime || 0), 0);
    };
    
    // Total play time left
    const getTotalTimeLeft = (): number => {
        let totalTimeLeft = 0;
        
        games.forEach(game => {
            if (game.status === "Backlog") {
                totalTimeLeft += game.estimatedPlayTime || 0;
            } else if (game.status === "Playing") {
                // Calculate remaining time
                const remainingTime = Math.max(0, (game.estimatedPlayTime || 0) - (game.actualPlayTime || 0));
                totalTimeLeft += remainingTime;
            }
        });
        
        return totalTimeLeft;
    };

    if (loading) {
        return <div className="card">Loading game statistics...</div>;
    }

    // PrimeReact charts
    return (
        <div className="grid p-fluid">
            <div className="col-12">
                <div className="card">
                    <h5>Your Game Backlog Statistics</h5>
                    <div className="grid">
                        <div className="col-12 md:col-2">
                            <div className="p-3 text-center border-round bg-primary">
                                <span className="block text-lg font-bold mb-2">Total Games</span>
                                <span className="text-xl">{games.length}</span>
                            </div>
                        </div>
                        <div className="col-12 md:col-2">
                            <div className="p-3 text-center border-round bg-primary">
                                <span className="block text-lg font-bold mb-2">Completion Rate</span>
                                <span className="text-xl">{getCompletionRate()}%</span>
                            </div>
                        </div>
                        <div className="col-12 md:col-2">
                            <div className="p-3 text-center border-round bg-primary">
                                <span className="block text-lg font-bold mb-2">Avg. Play Time</span>
                                <span className="text-xl">{getAveragePlayTime()} hrs</span>
                            </div>
                        </div>
                        <div className="col-12 md:col-2">
                            <div className="p-3 text-center border-round bg-primary">
                                <span className="block text-lg font-bold mb-2">Backlog Time</span>
                                <span className="text-xl">{getTotalBacklogTime()} hrs</span>
                            </div>
                        </div>
                        <div className="col-12 md:col-2">
                            <div className="p-3 text-center border-round bg-primary">
                                <span className="block text-lg font-bold mb-2">Total Time Left</span>
                                <span className="text-xl">{getTotalTimeLeft()} hours</span>
                                <span className="block text-sm mt-1">({(getTotalTimeLeft() / 24).toFixed(1)} days)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="col-12 xl:col-6">
                <div className="card flex flex-column align-items-center">
                    <h5 className="text-left w-full">Games by Status</h5>
                    {data.statusData && <Chart type="pie" data={data.statusData} options={options.pieOptions}></Chart>}
                </div>
            </div>
            
            <div className="col-12 xl:col-6">
                <div className="card flex flex-column align-items-center">
                    <h5 className="text-left w-full">Backlog by Platform</h5>
                    {data.backlogPlatformData && <Chart type="doughnut" data={data.backlogPlatformData} options={options.pieOptions}></Chart>}
                </div>
            </div>
            
            <div className="col-12 xl:col-6">
                <div className="card">
                    <h5>Games Added Over Time</h5>
                    {data.trendsData && <Chart type="line" data={data.trendsData} options={options.chartOptions}></Chart>}
                </div>
            </div>
            
            <div className="col-12 xl:col-6">
                <div className="card">
                    <h5>Games by Priority</h5>
                    {data.priorityData && <Chart type="bar" data={data.priorityData} options={options.chartOptions}></Chart>}
                </div>
            </div>
            
            <div className="col-12">
                <div className="card">
                    <h5>Estimated vs. Actual Play Time</h5>
                    {data.playtimeData && <Chart type="bar" data={data.playtimeData} options={options.chartOptions}></Chart>}
                </div>
            </div>
            
            <div className="col-12">
                <div className="card">
                    <h5>Games by Platform</h5>
                    {data.platformData && <Chart type="bar" data={data.platformData} options={options.chartOptions}></Chart>}
                </div>
            </div>
        </div>
    );
};

export default GameStatistics;