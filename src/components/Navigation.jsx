import React from 'react';
import { Home, Camera, FileText, Settings, BarChart3 } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab }) {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'live-feed', label: 'Live Feed', icon: Camera },
        { id: 'violations', label: 'Violations', icon: FileText },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">Traffic Violation System</h1>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                            activeTab === item.id
                                                ? 'border-blue-500 text-gray-900'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4 mr-2" />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-sm text-gray-600">System Online</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
} 