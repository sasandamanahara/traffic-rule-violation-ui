import React from 'react';
import { Home, Camera, AlertTriangle, MapPin, FileText, Settings, Bell, User, Video, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Layout({ children, activeTab, setActiveTab }) {
    const { admin, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-4 flex-shrink-0 w-full">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Home className="w-5 h-5" />
                        </div>
                        <h1 className="text-lg sm:text-xl font-bold truncate">Citywide Traffic Monitoring</h1>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                        <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2" style={{ color: '#ffffff', WebkitFontSmoothing: 'antialiased' }}>
                            <Bell className="w-5 h-5" />
                        </button>
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-sm font-medium text-white">{admin?.username || 'Admin'}</span>
                                <span className="text-xs text-gray-400">{admin?.role || 'admin'}</span>
                            </div>
                            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5" />
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-48 md:w-56 lg:w-64 bg-gray-800 border-r border-gray-700 flex-shrink-0 flex flex-col">
                    <nav className="flex-1 p-4 space-y-2">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard'
                                ? 'bg-blue-600 text-white'
                                : 'text-white hover:bg-gray-700 '
                                }`}
                        >
                            <Home className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate">Dashboard</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('live-feed')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'live-feed'
                                ? 'bg-blue-600 text-white'
                                : 'text-white hover:bg-gray-700 '
                                }`}
                        >
                            <Camera className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate">Live Cameras</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('video-detection')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'video-detection'
                                ? 'bg-blue-600 text-white'
                                : 'text-white hover:bg-gray-700 '
                                }`}
                        >
                            <Video className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate">Video Detection</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('violations')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'violations'
                                ? 'bg-blue-600 text-white'
                                : 'text-white hover:bg-gray-700 '
                                }`}
                        >
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate">Violations Log</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('map')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'map'
                                ? 'bg-blue-600 text-white'
                                : 'text-white hover:bg-gray-700 '
                                }`}
                        >
                            <MapPin className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate">Camera Map</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('reports')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'reports'
                                ? 'bg-blue-600 text-white'
                                : 'text-white hover:bg-gray-700 '
                                }`}
                        >
                            <FileText className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate">Reports & Export</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('camera-setup')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'camera-setup'
                                ? 'bg-blue-600 text-white'
                                : 'text-white hover:bg-gray-700 '
                                }`}
                        >
                            <FileText className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate">Camera Setup</span>
                        </button>
                    </nav>

                    <div className="p-4 border-t border-gray-700">
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'settings'
                                ? 'bg-blue-600 text-white'
                                : 'text-white hover:bg-gray-700 '
                                }`}
                        >
                            <Settings className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate">Settings</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
} 