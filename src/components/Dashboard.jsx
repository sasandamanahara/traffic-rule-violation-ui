import React, { useState, useEffect } from 'react';
import { Camera, AlertTriangle, Video, TrendingUp, MapPin, Clock } from 'lucide-react';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalViolations: 1234,
        activeCameras: 56,
        incidentsReported: 789
    });

    const [recentViolations, setRecentViolations] = useState([
        {
            id: 1,
            time: '10:30 AM',
            location: 'Main Street & Elm Avenue',
            violationType: 'Speeding',
            vehicle: 'Car',
            license: 'ABC-123',
            status: 'Open'
        },
        {
            id: 2,
            time: '11:15 AM',
            location: 'Oak Street & Pine Road',
            violationType: 'Running Red Light',
            vehicle: 'Truck',
            license: 'XYZ-456',
            status: 'Closed'
        },
        {
            id: 3,
            time: '12:00 PM',
            location: 'Maple Drive & Cedar Lane',
            violationType: 'Illegal Turn',
            vehicle: 'Motorcycle',
            license: 'DEF-789',
            status: 'Open'
        },
        {
            id: 4,
            time: '12:45 PM',
            location: 'Willow Street & Birch Avenue',
            violationType: 'Parking Violation',
            vehicle: 'Van',
            license: 'GHI-012',
            status: 'Open'
        },
        {
            id: 5,
            time: '13:30 PM',
            location: 'Cherry Lane & Oak Avenue',
            violationType: 'Distracted Driving',
            vehicle: 'SUV',
            license: 'JKL-345',
            status: 'Closed'
        }
    ]);

    const getStatusColor = (status) => {
        return status === 'Open' ? 'bg-red-500' : 'bg-green-500';
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
                                        className="w-full text-left p-4 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
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
                                {recentViolations.map((violation) => (
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
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 