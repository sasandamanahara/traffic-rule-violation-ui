import React, { useState } from 'react';
import { Search, Filter, Download, Eye, Edit, Trash2 } from 'lucide-react';

export default function ViolationList() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const violations = [
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
            camera: 'Main Street Camera'
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
            camera: 'Oak Street Camera'
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
            camera: 'Maple Drive Camera'
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
            camera: 'Willow Street Camera'
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
            camera: 'Cherry Lane Camera'
        }
    ];

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

    const filteredViolations = violations.filter(violation => {
        const matchesSearch = violation.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            violation.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            violation.violationType.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = filterStatus === 'all' || violation.status === filterStatus;
        
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="h-full p-6 overflow-auto">
            <div className="h-full">
                <h2 className="text-2xl font-bold mb-6">Violations Log</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                    {/* Left Column - Filters */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 h-full">
                            <h3 className="text-lg font-semibold mb-4">Filters</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search violations..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white text-sm"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Status Filter</label>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Disputed">Disputed</option>
                                    </select>
                                </div>
                                
                                <button className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center justify-center space-x-2 text-sm">
                                    <Download className="w-4 h-4" />
                                    <span>Export Results</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Violations Table */}
                    <div className="lg:col-span-3">
                        <div className="bg-gray-800 rounded-lg border border-gray-700 h-full overflow-auto">
                            <div className="px-6 py-4 border-b border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">All Violations</h3>
                                    <span className="text-sm text-gray-400">{filteredViolations.length} violations found</span>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Location</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Vehicle</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">License</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fine</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {filteredViolations.map((violation) => (
                                            <tr key={violation.id} className="hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {violation.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {violation.timestamp}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    <span className="truncate block max-w-xs">{violation.location}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    <span className="truncate block">{violation.violationType}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    <span className="truncate block">{violation.vehicle}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {violation.licensePlate}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    ${violation.fine}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(violation.status)}`}>
                                                        {violation.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    <div className="flex items-center space-x-2">
                                                        <button className="text-blue-400 hover:text-blue-300">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button className="text-green-400 hover:text-green-300">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button className="text-red-400 hover:text-red-300">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
