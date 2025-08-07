import React from 'react';
import { Home, Camera, AlertTriangle, MapPin, FileText, Settings, Bell, User, Video } from 'lucide-react';

export default function Layout({ children, activeTab, setActiveTab }) {
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
                        <button className="p-2 hover:bg-gray-700 rounded-lg">
                            <Bell className="w-5 h-5" />
                        </button>
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5" />
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
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                activeTab === 'dashboard'
                                    ? 'bg-gray-700 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            <Home className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate">Dashboard</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('live-feed')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                activeTab === 'live-feed'
                                    ? 'bg-gray-700 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            <Camera className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate">Live Cameras</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('video-detection')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                activeTab === 'video-detection'
                                    ? 'bg-gray-700 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            <Video className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate">Video Detection</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('violations')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                activeTab === 'violations'
                                    ? 'bg-gray-700 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate">Violations Log</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('map')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                activeTab === 'map'
                                    ? 'bg-gray-700 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            <MapPin className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate">Camera Map</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('reports')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                activeTab === 'reports'
                                    ? 'bg-gray-700 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            <FileText className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate">Reports & Export</span>
                        </button>
                    </nav>
                    
                    <div className="p-4 border-t border-gray-700">
                        <button 
                            onClick={() => setActiveTab('settings')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                activeTab === 'settings'
                                    ? 'bg-gray-700 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
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