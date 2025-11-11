import React, { useState, useEffect } from 'react';
import { Camera, AlertTriangle, Video, TrendingUp, MapPin, Clock } from 'lucide-react';
import config from '../config';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalViolations: 0,
        activeCameras: 0,
        incidentsReported: 0
    });

    const [recentViolations, setRecentViolations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getAuthHeaders } = useAuth();

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Fetch stats and violations in parallel
                const [statsResponse, violationsResponse, camerasResponse] = await Promise.all([
                    fetch(`${config.API_BASE_URL}/api/violations/stats`, {
                        headers: getAuthHeaders()
                    }),
                    fetch(`${config.API_BASE_URL}/api/violations?limit=5`, {
                        headers: getAuthHeaders()
                    }),
                    fetch(`${config.API_BASE_URL}/api/cameras`, {
                        headers: getAuthHeaders()
                    })
                ]);

                // Handle stats
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    if (statsData.success && statsData.stats) {
                        setStats({
                            totalViolations: statsData.stats.total_violations || 0,
                            activeCameras: 0, // Will be set from cameras response
                            incidentsReported: statsData.stats.recent_count || 0
                        });
                    }
                }

                // Handle cameras
                if (camerasResponse.ok) {
                    const camerasData = await camerasResponse.json();
                    if (camerasData.success) {
                        const activeCameras = camerasData.cameras?.filter(c => c.status === 'active').length || 0;
                        setStats(prev => ({ ...prev, activeCameras }));
                    }
                }

                // Handle violations
                if (violationsResponse.ok) {
                    const violationsData = await violationsResponse.json();
                    if (violationsData.success && violationsData.violations) {
                        // Format violations for display
                        const formatted = violationsData.violations.slice(0, 5).map(v => ({
                            id: v._id || v.id,
                            time: v.created_at ? new Date(v.created_at).toLocaleTimeString() : 'N/A',
                            location: v.location || 'Unknown',
                            violationType: v.type || 'Unknown',
                            vehicle: 'Vehicle', // Not available in current schema
                            license: 'N/A', // Not available in current schema
                            status: v.status === 'pending' ? 'Open' : 'Closed'
                        }));
                        setRecentViolations(formatted);
                    }
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [getAuthHeaders]);

    const getStatusColor = (status) => {
        return status === 'Open' ? 'bg-red-500 text-white' : 'bg-green-500 text-white';
    };

    const quickActions = [
        {
            id: 'live-feed',
            name: 'Live Detection',
            description: 'Real-time camera feed analysis',
            icon: Camera,
            color: 'bg-blue-600'
        },
        {
            id: 'video-analysis',
            name: 'Video Analysis',
            description: 'Upload and process videos',
            icon: Video,
            color: 'bg-green-600'
        },
        {
            id: 'violations',
            name: 'View Violations',
            description: 'Check violation records',
            icon: AlertTriangle,
            color: 'bg-purple-600'
        },
        {
            id: 'reports',
            name: 'Reports',
            description: 'Generate and export reports',
            icon: TrendingUp,
            color: 'bg-orange-600'
        }
    ];

    if (loading) {
        return (
            <div className="h-full p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full p-6 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-white text-lg">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full p-6 overflow-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-gray-400">Traffic monitoring overview and quick actions</p>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-400">Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                {/* Left Sidebar - Quick Actions */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 h-full">
                        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            {quickActions.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <button
                                        key={action.id}
                                        className="w-full text-left p-4 rounded-lg border border-gray-600 hover:border-gray-500 hover:bg-gray-700 transition-colors bg-gray-800"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-lg ${action.color}`}>
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-white">{action.name}</h4>
                                                <p className="text-sm text-gray-400">{action.description}</p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 h-full overflow-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-semibold">Overview</h3>
                                <p className="text-gray-400">Real-time traffic monitoring statistics</p>
                            </div>
                        </div>

                        {/* Summary Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="bg-gray-700 rounded-lg p-4">
                                <h4 className="text-gray-400 text-sm font-medium">Total Violations</h4>
                                <p className="text-2xl font-bold text-white">{stats.totalViolations.toLocaleString()}</p>
                            </div>
                            <div className="bg-gray-700 rounded-lg p-4">
                                <h4 className="text-gray-400 text-sm font-medium">Active Cameras</h4>
                                <p className="text-2xl font-bold text-white">{stats.activeCameras}</p>
                            </div>
                            <div className="bg-gray-700 rounded-lg p-4">
                                <h4 className="text-gray-400 text-sm font-medium">Incidents Reported</h4>
                                <p className="text-2xl font-bold text-white">{stats.incidentsReported.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Recent Violations */}
                        <div className="bg-gray-700 rounded-lg p-6">
                            <h4 className="text-lg font-medium text-white mb-4">Recent Violations</h4>
                            <div className="space-y-3">
                                {recentViolations.length === 0 ? (
                                    <p className="text-gray-400 text-center py-4">No recent violations</p>
                                ) : (
                                    recentViolations.map((violation) => (
                                    <div key={violation.id} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex items-center space-x-2">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-300">{violation.time}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-300 truncate">{violation.location}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-sm text-gray-300">{violation.violationType}</span>
                                                <button className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(violation.status)}`}>
                                                    {violation.status}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-400">
                                            {violation.vehicle} • {violation.license}
                                        </div>
                                    </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 