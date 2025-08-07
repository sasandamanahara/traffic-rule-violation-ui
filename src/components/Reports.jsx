import React, { useState } from 'react';
import { FileText, Download, Calendar, BarChart3, TrendingUp, AlertTriangle, Filter, Search, Download as DownloadIcon } from 'lucide-react';

export default function Reports() {
    const [selectedReport, setSelectedReport] = useState('daily');
    const [dateRange, setDateRange] = useState('today');
    const [exportFormat, setExportFormat] = useState('pdf');

    const reportTypes = [
        {
            id: 'daily',
            name: 'Daily Summary',
            description: 'Overview of violations and incidents for the day',
            icon: Calendar,
            color: 'bg-blue-600'
        },
        {
            id: 'weekly',
            name: 'Weekly Report',
            description: 'Weekly trends and violation patterns',
            icon: BarChart3,
            color: 'bg-green-600'
        },
        {
            id: 'monthly',
            name: 'Monthly Analysis',
            description: 'Comprehensive monthly violation statistics',
            icon: TrendingUp,
            color: 'bg-purple-600'
        },
        {
            id: 'violations',
            name: 'Violation Details',
            description: 'Detailed list of all violations with evidence',
            icon: AlertTriangle,
            color: 'bg-red-600'
        }
    ];

    const mockData = {
        daily: {
            totalViolations: 156,
            activeCameras: 42,
            revenue: 23450,
            topViolations: [
                { type: 'Speeding', count: 67, percentage: 43 },
                { type: 'Red Light', count: 45, percentage: 29 },
                { type: 'Illegal Parking', count: 28, percentage: 18 },
                { type: 'Distracted Driving', count: 16, percentage: 10 }
            ]
        },
        weekly: {
            totalViolations: 892,
            activeCameras: 45,
            revenue: 134200,
            trend: '+12%',
            topLocations: [
                { location: 'Main Street & Elm', violations: 89 },
                { location: 'Oak Street & Pine', violations: 67 },
                { location: 'Maple Drive & Cedar', violations: 54 }
            ]
        },
        monthly: {
            totalViolations: 3421,
            activeCameras: 48,
            revenue: 512300,
            trend: '+8%',
            cameraPerformance: [
                { camera: 'Main Street Camera', violations: 234, uptime: 98 },
                { camera: 'Oak Street Camera', violations: 189, uptime: 95 },
                { camera: 'Maple Drive Camera', violations: 156, uptime: 92 }
            ]
        },
        violations: {
            totalViolations: 3421,
            activeCameras: 48,
            revenue: 512300,
            detailedViolations: [
                {
                    id: 'V001',
                    timestamp: '2024-08-07 10:30:15',
                    location: 'Main Street & Elm Avenue',
                    violationType: 'Speeding',
                    vehicle: 'Toyota Camry',
                    licensePlate: 'ABC-123',
                    speed: '75 mph',
                    limit: '45 mph',
                    fine: 250,
                    status: 'Pending',
                    camera: 'Main Street Camera',
                    imageUrl: '/violation-images/v001.jpg'
                },
                {
                    id: 'V002',
                    timestamp: '2024-08-07 11:15:22',
                    location: 'Oak Street & Pine Road',
                    violationType: 'Red Light',
                    vehicle: 'Honda Civic',
                    licensePlate: 'XYZ-456',
                    speed: 'N/A',
                    limit: 'N/A',
                    fine: 150,
                    status: 'Paid',
                    camera: 'Oak Street Camera',
                    imageUrl: '/violation-images/v002.jpg'
                },
                {
                    id: 'V003',
                    timestamp: '2024-08-07 12:00:45',
                    location: 'Maple Drive & Cedar Lane',
                    violationType: 'Illegal Turn',
                    vehicle: 'Ford F-150',
                    licensePlate: 'DEF-789',
                    speed: 'N/A',
                    limit: 'N/A',
                    fine: 100,
                    status: 'Pending',
                    camera: 'Maple Drive Camera',
                    imageUrl: '/violation-images/v003.jpg'
                },
                {
                    id: 'V004',
                    timestamp: '2024-08-07 12:45:18',
                    location: 'Willow Street & Birch Avenue',
                    violationType: 'Distracted Driving',
                    vehicle: 'BMW X5',
                    licensePlate: 'GHI-012',
                    speed: 'N/A',
                    limit: 'N/A',
                    fine: 200,
                    status: 'Pending',
                    camera: 'Willow Street Camera',
                    imageUrl: '/violation-images/v004.jpg'
                },
                {
                    id: 'V005',
                    timestamp: '2024-08-07 13:30:33',
                    location: 'Cherry Lane & Oak Avenue',
                    violationType: 'Speeding',
                    vehicle: 'Mercedes C-Class',
                    licensePlate: 'JKL-345',
                    speed: '68 mph',
                    limit: '40 mph',
                    fine: 300,
                    status: 'Paid',
                    camera: 'Cherry Lane Camera',
                    imageUrl: '/violation-images/v005.jpg'
                }
            ]
        }
    };

    const currentData = mockData[selectedReport];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-500';
            case 'Paid':
                return 'bg-green-500';
            case 'Disputed':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div className="h-full p-6 overflow-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Reports & Export</h1>
                    <p className="text-gray-400">Generate and export traffic violation reports</p>
                </div>
                <div className="flex items-center space-x-4">
                    <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center space-x-2">
                        <DownloadIcon className="w-4 h-4" />
                        <span>Export All</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                {/* Report Types */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 h-full">
                        <h3 className="text-lg font-semibold mb-4">Report Types</h3>
                        <div className="space-y-3">
                            {reportTypes.map((report) => {
                                const Icon = report.icon;
                                return (
                                    <button
                                        key={report.id}
                                        onClick={() => setSelectedReport(report.id)}
                                        className={`w-full text-left p-4 rounded-lg border transition-colors ${
                                            selectedReport === report.id
                                                ? 'border-blue-500 bg-blue-600 bg-opacity-20'
                                                : 'border-gray-600 hover:border-gray-500'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-lg ${report.color}`}>
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-white">{report.name}</h4>
                                                <p className="text-sm text-gray-400">{report.description}</p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Report Content */}
                <div className="lg:col-span-3">
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 h-full overflow-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-semibold">
                                    {reportTypes.find(r => r.id === selectedReport)?.name}
                                </h3>
                                <p className="text-gray-400">Generated on {new Date().toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                >
                                    <option value="today">Today</option>
                                    <option value="yesterday">Yesterday</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                </select>
                                <select
                                    value={exportFormat}
                                    onChange={(e) => setExportFormat(e.target.value)}
                                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                >
                                    <option value="pdf">PDF</option>
                                    <option value="excel">Excel</option>
                                    <option value="csv">CSV</option>
                                </select>
                                <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center space-x-2">
                                    <Download className="w-4 h-4" />
                                    <span>Export</span>
                                </button>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="bg-gray-700 rounded-lg p-4">
                                <h4 className="text-gray-400 text-sm font-medium">Total Violations</h4>
                                <p className="text-2xl font-bold text-white">{currentData.totalViolations.toLocaleString()}</p>
                            </div>
                            <div className="bg-gray-700 rounded-lg p-4">
                                <h4 className="text-gray-400 text-sm font-medium">Active Cameras</h4>
                                <p className="text-2xl font-bold text-white">{currentData.activeCameras}</p>
                            </div>
                            <div className="bg-gray-700 rounded-lg p-4">
                                <h4 className="text-gray-400 text-sm font-medium">Revenue</h4>
                                <p className="text-2xl font-bold text-white">${currentData.revenue.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Detailed Content */}
                        <div className="space-y-6">
                            {selectedReport === 'daily' && (
                                <div>
                                    <h4 className="text-lg font-semibold mb-4">Top Violations</h4>
                                    <div className="space-y-3">
                                        {currentData.topViolations.map((violation, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                                                        {index + 1}
                                                    </div>
                                                    <span className="font-medium">{violation.type}</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">{violation.count}</p>
                                                    <p className="text-sm text-gray-400">{violation.percentage}%</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedReport === 'weekly' && (
                                <div>
                                    <h4 className="text-lg font-semibold mb-4">Top Locations</h4>
                                    <div className="space-y-3">
                                        {currentData.topLocations.map((location, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                                        {index + 1}
                                                    </div>
                                                    <span className="font-medium">{location.location}</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">{location.violations} violations</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedReport === 'monthly' && (
                                <div>
                                    <h4 className="text-lg font-semibold mb-4">Camera Performance</h4>
                                    <div className="space-y-3">
                                        {currentData.cameraPerformance.map((camera, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                        {index + 1}
                                                    </div>
                                                    <span className="font-medium">{camera.camera}</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">{camera.violations} violations</p>
                                                    <p className="text-sm text-gray-400">{camera.uptime}% uptime</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedReport === 'violations' && (
                                <div>
                                    <h4 className="text-lg font-semibold mb-4">Detailed Violations</h4>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-700">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Location</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Vehicle</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">License</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fine</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-700">
                                                {currentData.detailedViolations.map((violation) => (
                                                    <tr key={violation.id} className="hover:bg-gray-700">
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                            {violation.id}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                            {violation.timestamp}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                            {violation.location}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                            {violation.violationType}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                            {violation.vehicle}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                            {violation.licensePlate}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                            ${violation.fine}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(violation.status)}`}>
                                                                {violation.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                            <button className="text-blue-400 hover:text-blue-300 mr-2">View</button>
                                                            <button className="text-green-400 hover:text-green-300 mr-2">Edit</button>
                                                            <button className="text-red-400 hover:text-red-300">Delete</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
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