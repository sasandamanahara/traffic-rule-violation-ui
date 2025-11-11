import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Edit, Trash2, AlertCircle } from 'lucide-react';
import config from '../config';
import { useAuth } from '../contexts/AuthContext';

export default function ViolationList() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [violations, setViolations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedViolation, setSelectedViolation] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const { getAuthHeaders } = useAuth();

    // Fetch violations
    useEffect(() => {
        fetchViolations();
    }, [filterStatus]);

    const fetchViolations = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const params = new URLSearchParams({
                limit: '100',
                ...(filterStatus !== 'all' && { status: filterStatus.toLowerCase() })
            });
            
            const response = await fetch(`${config.API_BASE_URL}/api/violations?${params}`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch violations');
            }

            const data = await response.json();
            if (data.success && data.violations) {
                // Format violations for display
                const formatted = data.violations.map(v => ({
                    id: v._id || v.id,
                    timestamp: v.created_at ? new Date(v.created_at).toLocaleString() : 'N/A',
                    location: v.location || 'Unknown',
                    violationType: v.type || 'Unknown',
                    vehicle: 'Vehicle', // Not in current schema
                    licensePlate: 'N/A', // Not in current schema
                    speed: 'N/A',
                    limit: 'N/A',
                    fine: 0, // Not in current schema
                    status: v.status ? v.status.charAt(0).toUpperCase() + v.status.slice(1) : 'Pending',
                    camera: 'N/A', // Not in current schema
                    snapshot_url: v.snapshot_url,
                    confidence: v.confidence,
                    rawData: v // Keep raw data for operations
                }));
                setViolations(formatted);
            }
        } catch (err) {
            console.error('Error fetching violations:', err);
            setError('Failed to load violations');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (violationId) => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/api/violations/${violationId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to delete violation');
            }

            // Remove from list
            setViolations(violations.filter(v => v.id !== violationId));
            setShowDeleteConfirm(null);
        } catch (err) {
            console.error('Error deleting violation:', err);
            alert('Failed to delete violation');
        }
    };

    const handleUpdateStatus = async (violationId, newStatus) => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/api/violations/${violationId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status: newStatus.toLowerCase() })
            });

            if (!response.ok) {
                throw new Error('Failed to update violation');
            }

            // Update in list
            setViolations(violations.map(v => 
                v.id === violationId ? { ...v, status: newStatus } : v
            ));
        } catch (err) {
            console.error('Error updating violation:', err);
            alert('Failed to update violation');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-500 text-white';
            case 'Paid':
                return 'bg-green-500 text-white';
            case 'Disputed':
                return 'bg-red-500 text-white';
            case 'Resolved':
                return 'bg-green-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const filteredViolations = violations.filter(violation => {
        const matchesSearch = searchTerm === '' || 
                            violation.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            violation.violationType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            violation.id.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesSearch;
    });

    if (loading) {
        return (
            <div className="h-full p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading violations...</p>
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
                        onClick={fetchViolations} 
                        className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

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
                                        <option value="pending">Pending</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="disputed">Disputed</option>
                                    </select>
                                </div>
                                
                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 text-sm" style={{ color: '#ffffff', WebkitFontSmoothing: 'antialiased' }}>
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
                                                        <button 
                                                            onClick={() => setSelectedViolation(violation)}
                                                            className="text-blue-400 hover:text-blue-300"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                const newStatus = violation.status === 'Pending' ? 'Resolved' : 'Pending';
                                                                handleUpdateStatus(violation.id, newStatus);
                                                            }}
                                                            className="text-green-400 hover:text-green-300"
                                                            title="Update Status"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => setShowDeleteConfirm(violation.id)}
                                                            className="text-red-400 hover:text-red-300"
                                                            title="Delete"
                                                        >
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

            {/* Violation Detail Modal */}
            {selectedViolation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold">Violation Details</h3>
                            <button
                                onClick={() => setSelectedViolation(null)}
                                className="text-gray-400 hover:text-white"
                            >
                                <Trash2 className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm">ID</p>
                                    <p className="font-medium text-white">{selectedViolation.id}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Status</p>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedViolation.status)}`}>
                                        {selectedViolation.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Type</p>
                                    <p className="font-medium text-white">{selectedViolation.violationType}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Location</p>
                                    <p className="font-medium text-white">{selectedViolation.location}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Timestamp</p>
                                    <p className="font-medium text-white">{selectedViolation.timestamp}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Confidence</p>
                                    <p className="font-medium text-white">
                                        {selectedViolation.confidence ? (selectedViolation.confidence * 100).toFixed(1) + '%' : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            
                            {selectedViolation.snapshot_url && (
                                <div>
                                    <p className="text-gray-400 text-sm mb-2">Snapshot</p>
                                    <img 
                                        src={selectedViolation.snapshot_url} 
                                        alt="Violation snapshot" 
                                        className="w-full rounded-lg border border-gray-600"
                                    />
                                </div>
                            )}
                            
                            <div className="pt-4 border-t border-gray-700 flex space-x-2">
                                <button 
                                    onClick={() => {
                                        const newStatus = selectedViolation.status === 'Pending' ? 'Resolved' : 'Pending';
                                        handleUpdateStatus(selectedViolation.id, newStatus);
                                        setSelectedViolation({ ...selectedViolation, status: newStatus });
                                    }}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                                >
                                    {selectedViolation.status === 'Pending' ? 'Mark as Resolved' : 'Mark as Pending'}
                                </button>
                                <button 
                                    onClick={() => {
                                        handleDelete(selectedViolation.id);
                                        setSelectedViolation(null);
                                    }}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
                        <p className="text-gray-300 mb-6">Are you sure you want to delete this violation? This action cannot be undone.</p>
                        <div className="flex space-x-2">
                            <button 
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    handleDelete(showDeleteConfirm);
                                }}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
