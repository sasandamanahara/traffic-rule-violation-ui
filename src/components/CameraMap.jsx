import React, { useState, useEffect } from 'react';
import { MapPin, Camera, AlertTriangle, CheckCircle, XCircle, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import config from '../config';
import { useAuth } from '../contexts/AuthContext';

export default function CameraMap() {
    const [selectedCamera, setSelectedCamera] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [cameras, setCameras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getAuthHeaders } = useAuth();

    // Fetch cameras
    useEffect(() => {
        fetchCameras();
    }, []);

    const fetchCameras = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`${config.API_BASE_URL}/api/cameras`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch cameras');
            }

            const data = await response.json();
            if (data.success && data.cameras) {
                // Format cameras for display
                const formatted = data.cameras.map(c => ({
                    id: c._id || c.id,
                    name: c.name || c.location || 'Unnamed Camera',
                    location: {
                        lat: c.latitude || 0,
                        lng: c.longitude || 0
                    },
                    status: c.status || 'offline',
                    violations: 0, // Will need to fetch separately
                    lastActivity: c.updated_at ? formatTimeAgo(new Date(c.updated_at)) : 'Unknown',
                    type: c.type || 'Traffic Camera',
                    resolution: c.resolution || '1080p',
                    rawData: c
                }));
                setCameras(formatted);
            }
        } catch (err) {
            console.error('Error fetching cameras:', err);
            setError('Failed to load cameras');
        } finally {
            setLoading(false);
        }
    };

    const formatTimeAgo = (date) => {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'maintenance':
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'offline':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <WifiOff className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-500 text-white';
            case 'maintenance':
                return 'bg-yellow-500 text-white';
            case 'offline':
                return 'bg-red-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const filteredCameras = cameras.filter(camera => {
        if (filterStatus === 'all') return true;
        return camera.status === filterStatus;
    });

    if (loading) {
        return (
            <div className="h-full p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading cameras...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full p-6 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-white text-lg">{error}</p>
                    <button 
                        onClick={fetchCameras} 
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
                    <h1 className="text-3xl font-bold">Camera Map</h1>
                    <p className="text-gray-400">Monitor all traffic cameras across the city</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">Filter:</span>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                        >
                            <option value="all">All Cameras</option>
                            <option value="active">Active</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="offline">Offline</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Map Placeholder */}
                <div className="lg:col-span-2">
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 h-full">
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Interactive Map</h3>
                                <p className="text-gray-400">Map integration coming soon...</p>
                                <p className="text-sm text-gray-500 mt-2">
                                    {filteredCameras.length} camera{filteredCameras.length !== 1 ? 's' : ''} shown
                                </p>
                                {filteredCameras.length > 0 && (
                                    <div className="mt-4 text-left">
                                        <p className="text-sm text-gray-400 mb-2">Camera Locations:</p>
                                        <div className="space-y-1 text-xs text-gray-500">
                                            {filteredCameras.slice(0, 5).map(cam => (
                                                <div key={cam.id}>
                                                    {cam.name}: {cam.location.lat !== 0 ? `${cam.location.lat.toFixed(4)}, ${cam.location.lng.toFixed(4)}` : 'No coordinates'}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Camera List */}
                <div className="space-y-4 overflow-y-auto">
                    <h3 className="text-lg font-semibold">Camera Status</h3>
                    {filteredCameras.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">No cameras found</p>
                    ) : (
                        filteredCameras.map((camera) => (
                        <div
                            key={camera.id}
                            onClick={() => setSelectedCamera(camera)}
                            className={`bg-gray-800 rounded-lg border border-gray-700 p-4 cursor-pointer hover:bg-gray-700 transition-colors ${
                                selectedCamera?.id === camera.id ? 'ring-2 ring-blue-500' : ''
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    {getStatusIcon(camera.status)}
                                    <div className="flex-1">
                                        <h4 className="font-medium text-white">{camera.name}</h4>
                                        <p className="text-sm text-gray-400">{camera.type}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(camera.status)}`}>
                                        {camera.status}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-400">Violations Today</p>
                                    <p className="font-medium text-white">{camera.violations}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Last Activity</p>
                                    <p className="font-medium text-white">{camera.lastActivity}</p>
                                </div>
                            </div>
                            
                            <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                                <span>{camera.resolution}</span>
                                <span className="flex items-center">
                                    <Wifi className="w-3 h-3 mr-1" />
                                    {camera.status === 'active' ? 'Connected' : 'Disconnected'}
                                </span>
                            </div>
                        </div>
                        ))
                    )}
                </div>
            </div>

            {/* Camera Details Modal */}
            {selectedCamera && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold">Camera Details</h3>
                            <button
                                onClick={() => setSelectedCamera(null)}
                                className="text-gray-400 hover:text-white"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium text-white">{selectedCamera.name}</h4>
                                <p className="text-sm text-gray-400">{selectedCamera.type}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm">Status</p>
                                    <p className="font-medium text-white capitalize">{selectedCamera.status}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Resolution</p>
                                    <p className="font-medium text-white">{selectedCamera.resolution}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Violations Today</p>
                                    <p className="font-medium text-white">{selectedCamera.violations}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Last Activity</p>
                                    <p className="font-medium text-white">{selectedCamera.lastActivity}</p>
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-gray-700">
                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
                                    View Live Feed
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 