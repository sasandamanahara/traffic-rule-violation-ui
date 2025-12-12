import React, { useState } from 'react';
import { Home, Camera, AlertTriangle, MapPin, FileText, Settings, Bell, User, Video, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Layout({ children, activeTab, setActiveTab }) {
    const { admin, logout } = useAuth();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
    };

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
            {/* Header */}
            <header className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 border-b border-slate-700/50 shadow-lg px-4 sm:px-6 py-4 flex-shrink-0 w-full backdrop-blur-sm">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                            <Home className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-lg sm:text-xl font-bold truncate bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Citywide Traffic Monitoring</h1>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                        <button className="bg-slate-700/50 hover:bg-slate-600/50 text-white px-4 py-2 rounded-lg flex items-center space-x-2 backdrop-blur-sm transition-all border border-slate-600/50" style={{ color: '#ffffff', WebkitFontSmoothing: 'antialiased' }}>
                            <Bell className="w-5 h-5" />
                        </button>
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-sm font-medium text-white">{admin?.username || 'Admin'}</span>
                                <span className="text-xs text-slate-400">{admin?.role || 'admin'}</span>
                            </div>
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-all shadow-lg shadow-red-600/20"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar */}
                <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-48 md:w-56 lg:w-64'} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 flex-shrink-0 flex flex-col shadow-xl transition-all duration-300 ease-in-out`}>
                    {/* Toggle Button */}
                    <div className="p-2 border-b border-slate-700/50 flex items-center justify-end">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-300 hover:text-white"
                            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            {isSidebarCollapsed ? (
                                <ChevronRight className="w-5 h-5" />
                            ) : (
                                <ChevronLeft className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    <nav className="flex-1 p-4 space-y-2">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg transition-all ${activeTab === 'dashboard'
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-slate-900 text-slate-500 hover:bg-slate-800 hover:text-slate-300 border border-slate-800'
                                }`}
                            title={isSidebarCollapsed ? 'Dashboard' : ''}
                        >
                            <Home className="w-5 h-5 flex-shrink-0" />
                            {!isSidebarCollapsed && <span className="truncate">Dashboard</span>}
                        </button>
                        <button
                            onClick={() => setActiveTab('live-feed')}
                            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg transition-all ${activeTab === 'live-feed'
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-slate-900 text-slate-500 hover:bg-slate-800 hover:text-slate-300 border border-slate-800'
                                }`}
                            title={isSidebarCollapsed ? 'Live Cameras' : ''}
                        >
                            <Camera className="w-5 h-5 flex-shrink-0" />
                            {!isSidebarCollapsed && <span className="truncate">Live Cameras</span>}
                        </button>
                        <button
                            onClick={() => setActiveTab('video-detection')}
                            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg transition-all ${activeTab === 'video-detection'
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-slate-900 text-slate-500 hover:bg-slate-800 hover:text-slate-300 border border-slate-800'
                                }`}
                            title={isSidebarCollapsed ? 'Video Detection' : ''}
                        >
                            <Video className="w-5 h-5 flex-shrink-0" />
                            {!isSidebarCollapsed && <span className="truncate">Video Detection</span>}
                        </button>
                        <button
                            onClick={() => setActiveTab('violations')}
                            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg transition-all ${activeTab === 'violations'
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-slate-900 text-slate-500 hover:bg-slate-800 hover:text-slate-300 border border-slate-800'
                                }`}
                            title={isSidebarCollapsed ? 'Violations Log' : ''}
                        >
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            {!isSidebarCollapsed && <span className="truncate">Violations Log</span>}
                        </button>
                        <button
                            onClick={() => setActiveTab('map')}
                            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg transition-all ${activeTab === 'map'
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-slate-900 text-slate-500 hover:bg-slate-800 hover:text-slate-300 border border-slate-800'
                                }`}
                            title={isSidebarCollapsed ? 'Camera Map' : ''}
                        >
                            <MapPin className="w-5 h-5 flex-shrink-0" />
                            {!isSidebarCollapsed && <span className="truncate">Camera Map</span>}
                        </button>
                        <button
                            onClick={() => setActiveTab('reports')}
                            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg transition-all ${activeTab === 'reports'
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-slate-900 text-slate-500 hover:bg-slate-800 hover:text-slate-300 border border-slate-800'
                                }`}
                            title={isSidebarCollapsed ? 'Reports & Export' : ''}
                        >
                            <FileText className="w-5 h-5 flex-shrink-0" />
                            {!isSidebarCollapsed && <span className="truncate">Reports & Export</span>}
                        </button>
                        <button
                            onClick={() => setActiveTab('camera-setup')}
                            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg transition-all ${activeTab === 'camera-setup'
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-slate-900 text-slate-500 hover:bg-slate-800 hover:text-slate-300 border border-slate-800'
                                }`}
                            title={isSidebarCollapsed ? 'Camera Setup' : ''}
                        >
                            <FileText className="w-5 h-5 flex-shrink-0" />
                            {!isSidebarCollapsed && <span className="truncate">Camera Setup</span>}
                        </button>
                    </nav>

                    <div className="p-4 border-t border-slate-700/50">
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg transition-all ${activeTab === 'settings'
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-slate-900 text-slate-500 hover:bg-slate-800 hover:text-slate-300 border border-slate-800'
                                }`}
                            title={isSidebarCollapsed ? 'Settings' : ''}
                        >
                            <Settings className="w-5 h-5 flex-shrink-0" />
                            {!isSidebarCollapsed && <span className="truncate">Settings</span>}
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-hidden min-w-0 h-full">
                    {children}
                </main>
            </div>
        </div>
    );
} 