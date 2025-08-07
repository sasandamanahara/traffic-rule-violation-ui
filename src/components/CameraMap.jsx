import React, { useState } from 'react';
import { MapPin, Camera, AlertTriangle, CheckCircle, XCircle, Wifi, WifiOff } from 'lucide-react';

export default function CameraMap() {
    const [selectedCamera, setSelectedCamera] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    const cameras = [
        {
            id: 1,
            name: 'Main Street & Elm Avenue',
            location: { lat: 40.7128, lng: -74.0060 },
            status: 'active',
            violations: 45,
            lastActivity: '2 minutes ago',
            type: 'Traffic Light',
            resolution: '1080p'
        },
        {
            id: 2,
            name: 'Oak Street & Pine Road',
            location: { lat: 40.7589, lng: -73.9851 },
            status: 'active',
            violations: 32,
            lastActivity: '5 minutes ago',
            type: 'Speed Camera',
            resolution: '4K'
        },
        {
            id: 3,
            name: 'Maple Drive & Cedar Lane',
            location: { lat: 40.7505, lng: -73.9934 },
            status: 'maintenance',
            violations: 0,
            lastActivity: '1 hour ago',
            type: 'Red Light',
            resolution: '1080p'
        },
        {
            id: 4,
            name: 'Willow Street & Birch Avenue',
            location: { lat: 40.7614, lng: -73.9776 },
            status: 'offline',
            violations: 0,
            lastActivity: '3 hours ago',
            type: 'Speed Camera',
            resolution: '4K'
        },
        {
            id: 5,
            name: 'Cherry Lane & Oak Avenue',
            location: { lat: 40.7484, lng: -73.9857 },
            status: 'active',
            violations: 28,
            lastActivity: '1 minute ago',
            type: 'Traffic Light',
            resolution: '1080p'
        },
        {
            id: 6,
            name: 'Pine Street & Maple Road',
            location: { lat: 40.7569, lng: -73.9865 },
            status: 'active',
            violations: 67,
            lastActivity: '30 seconds ago',
            type: 'Speed Camera',
            resolution: '4K'
        }
    ];

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
                return 'bg-green-500';
            case 'maintenance':
                return 'bg-yellow-500';
            case 'offline':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const filteredCameras = cameras.filter(camera => {
        if (filterStatus === 'all') return true;
        return camera.status === filterStatus;
    });

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
                                    {filteredCameras.length} cameras shown
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Camera List */}
                <div className="space-y-4 overflow-y-auto">
                    <h3 className="text-lg font-semibold">Camera Status</h3>
                    {filteredCameras.map((camera) => (
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
                    ))}
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