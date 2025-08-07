import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Monitor, Database, User, Key, Globe, Moon, Sun } from 'lucide-react';

export default function Settings() {
    const [activeTab, setActiveTab] = useState('general');
    const [darkMode, setDarkMode] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [autoSave, setAutoSave] = useState(true);

    const settingsTabs = [
        {
            id: 'general',
            name: 'General',
            icon: SettingsIcon,
            description: 'Basic system settings'
        },
        {
            id: 'notifications',
            name: 'Notifications',
            icon: Bell,
            description: 'Alert and notification preferences'
        },
        {
            id: 'security',
            name: 'Security',
            icon: Shield,
            description: 'Security and access control'
        },
        {
            id: 'cameras',
            name: 'Cameras',
            icon: Monitor,
            description: 'Camera configuration and settings'
        },
        {
            id: 'data',
            name: 'Data Management',
            icon: Database,
            description: 'Data retention and backup settings'
        }
    ];

    return (
        <div className="h-full p-6 overflow-auto">
            <div className="h-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Settings</h1>
                        <p className="text-gray-400">Configure your traffic monitoring system</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">
                            Reset to Default
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
                            Save Changes
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                    {/* Settings Navigation */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 h-full">
                            <h3 className="text-lg font-semibold mb-4">Settings</h3>
                            <nav className="space-y-2">
                                {settingsTabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                                                activeTab === tab.id
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Icon className="w-5 h-5" />
                                                <div>
                                                    <p className="font-medium">{tab.name}</p>
                                                    <p className="text-xs opacity-75">{tab.description}</p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Settings Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 h-full overflow-auto">
                            {activeTab === 'general' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold">General Settings</h3>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                                            <div>
                                                <h4 className="font-medium">Dark Mode</h4>
                                                <p className="text-sm text-gray-400">Use dark theme for better visibility</p>
                                            </div>
                                            <button
                                                onClick={() => setDarkMode(!darkMode)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    darkMode ? 'bg-blue-600' : 'bg-gray-600'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        darkMode ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                                            <div>
                                                <h4 className="font-medium">Auto Save</h4>
                                                <p className="text-sm text-gray-400">Automatically save changes</p>
                                            </div>
                                            <button
                                                onClick={() => setAutoSave(!autoSave)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    autoSave ? 'bg-blue-600' : 'bg-gray-600'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        autoSave ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                        </div>

                                        <div className="p-4 bg-gray-700 rounded-lg">
                                            <h4 className="font-medium mb-2">Language</h4>
                                            <select className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white">
                                                <option value="en">English</option>
                                                <option value="es">Spanish</option>
                                                <option value="fr">French</option>
                                                <option value="de">German</option>
                                            </select>
                                        </div>

                                        <div className="p-4 bg-gray-700 rounded-lg">
                                            <h4 className="font-medium mb-2">Time Zone</h4>
                                            <select className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white">
                                                <option value="utc">UTC</option>
                                                <option value="est">Eastern Time</option>
                                                <option value="pst">Pacific Time</option>
                                                <option value="gmt">GMT</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold">Notification Settings</h3>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                                            <div>
                                                <h4 className="font-medium">Email Notifications</h4>
                                                <p className="text-sm text-gray-400">Receive violation alerts via email</p>
                                            </div>
                                            <button
                                                onClick={() => setNotifications(!notifications)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    notifications ? 'bg-blue-600' : 'bg-gray-600'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        notifications ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                        </div>

                                        <div className="p-4 bg-gray-700 rounded-lg">
                                            <h4 className="font-medium mb-2">Notification Frequency</h4>
                                            <select className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white">
                                                <option value="immediate">Immediate</option>
                                                <option value="hourly">Hourly</option>
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                            </select>
                                        </div>

                                        <div className="p-4 bg-gray-700 rounded-lg">
                                            <h4 className="font-medium mb-2">Alert Types</h4>
                                            <div className="space-y-2">
                                                <label className="flex items-center space-x-2">
                                                    <input type="checkbox" defaultChecked className="rounded" />
                                                    <span>Speeding Violations</span>
                                                </label>
                                                <label className="flex items-center space-x-2">
                                                    <input type="checkbox" defaultChecked className="rounded" />
                                                    <span>Red Light Violations</span>
                                                </label>
                                                <label className="flex items-center space-x-2">
                                                    <input type="checkbox" defaultChecked className="rounded" />
                                                    <span>Camera Offline Alerts</span>
                                                </label>
                                                <label className="flex items-center space-x-2">
                                                    <input type="checkbox" className="rounded" />
                                                    <span>System Maintenance</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold">Security Settings</h3>
                                    
                                    <div className="space-y-4">
                                        <div className="p-4 bg-gray-700 rounded-lg">
                                            <h4 className="font-medium mb-2">Session Timeout</h4>
                                            <select className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white">
                                                <option value="15">15 minutes</option>
                                                <option value="30">30 minutes</option>
                                                <option value="60">1 hour</option>
                                                <option value="never">Never</option>
                                            </select>
                                        </div>

                                        <div className="p-4 bg-gray-700 rounded-lg">
                                            <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
                                            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
                                                Enable 2FA
                                            </button>
                                        </div>

                                        <div className="p-4 bg-gray-700 rounded-lg">
                                            <h4 className="font-medium mb-2">API Access</h4>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span>API Key</span>
                                                    <button className="text-blue-400 hover:text-blue-300">Regenerate</button>
                                                </div>
                                                <input
                                                    type="password"
                                                    value="sk-1234567890abcdef"
                                                    readOnly
                                                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'cameras' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold">Camera Settings</h3>
                                    
                                    <div className="space-y-4">
                                        <div className="p-4 bg-gray-700 rounded-lg">
                                            <h4 className="font-medium mb-2">Detection Sensitivity</h4>
                                            <select className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white">
                                                <option value="low">Low</option>
                                                <option value="medium" selected>Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>

                                        <div className="p-4 bg-gray-700 rounded-lg">
                                            <h4 className="font-medium mb-2">Recording Quality</h4>
                                            <select className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white">
                                                <option value="720p">720p</option>
                                                <option value="1080p" selected>1080p</option>
                                                <option value="4k">4K</option>
                                            </select>
                                        </div>

                                        <div className="p-4 bg-gray-700 rounded-lg">
                                            <h4 className="font-medium mb-2">Storage Retention</h4>
                                            <select className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white">
                                                <option value="7">7 days</option>
                                                <option value="30" selected>30 days</option>
                                                <option value="90">90 days</option>
                                                <option value="365">1 year</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'data' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold">Data Management</h3>
                                    
                                    <div className="space-y-4">
                                        <div className="p-4 bg-gray-700 rounded-lg">
                                            <h4 className="font-medium mb-2">Data Retention Policy</h4>
                                            <select className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white">
                                                <option value="30">30 days</option>
                                                <option value="90" selected>90 days</option>
                                                <option value="180">180 days</option>
                                                <option value="365">1 year</option>
                                            </select>
                                        </div>

                                        <div className="p-4 bg-gray-700 rounded-lg">
                                            <h4 className="font-medium mb-2">Backup Schedule</h4>
                                            <select className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white">
                                                <option value="daily">Daily</option>
                                                <option value="weekly" selected>Weekly</option>
                                                <option value="monthly">Monthly</option>
                                            </select>
                                        </div>

                                        <div className="p-4 bg-gray-700 rounded-lg">
                                            <h4 className="font-medium mb-2">Export Format</h4>
                                            <select className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white">
                                                <option value="json">JSON</option>
                                                <option value="csv" selected>CSV</option>
                                                <option value="xml">XML</option>
                                            </select>
                                        </div>

                                        <div className="flex space-x-4">
                                            <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg">
                                                Create Backup
                                            </button>
                                            <button className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg">
                                                Restore Data
                                            </button>
                                            <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">
                                                Clear All Data
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 