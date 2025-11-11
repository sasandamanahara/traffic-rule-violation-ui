import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, BarChart3, TrendingUp, AlertTriangle, Filter, Search, Download as DownloadIcon, AlertCircle } from 'lucide-react';
import config from '../config';
import { useAuth } from '../contexts/AuthContext';

export default function Reports() {
    const [selectedReport, setSelectedReport] = useState('daily');
    const [dateRange, setDateRange] = useState('today');
    const [exportFormat, setExportFormat] = useState('pdf');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getAuthHeaders } = useAuth();

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

    // Fetch report data
    useEffect(() => {
        fetchReportData();
    }, [selectedReport, dateRange]);

    const fetchReportData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Fetch stats and violations
            const [statsResponse, violationsResponse, camerasResponse] = await Promise.all([
                fetch(`${config.API_BASE_URL}/api/violations/stats`, {
                    headers: getAuthHeaders()
                }),
                fetch(`${config.API_BASE_URL}/api/violations?limit=1000`, {
                    headers: getAuthHeaders()
                }),
                fetch(`${config.API_BASE_URL}/api/cameras`, {
                    headers: getAuthHeaders()
                })
            ]);

            if (!statsResponse.ok || !violationsResponse.ok || !camerasResponse.ok) {
                throw new Error('Failed to fetch report data');
            }

            const [statsData, violationsData, camerasData] = await Promise.all([
                statsResponse.json(),
                violationsResponse.json(),
                camerasResponse.json()
            ]);

            if (statsData.success && violationsData.success && camerasData.success) {
                const stats = statsData.stats || {};
                const violations = violationsData.violations || [];
                const cameras = camerasData.cameras || [];

                // Calculate date range filter
                const now = new Date();
                let startDate = new Date();
                if (dateRange === 'today') {
                    startDate.setHours(0, 0, 0, 0);
                } else if (dateRange === 'yesterday') {
                    startDate.setDate(startDate.getDate() - 1);
                    startDate.setHours(0, 0, 0, 0);
                } else if (dateRange === 'week') {
                    startDate.setDate(startDate.getDate() - 7);
                } else if (dateRange === 'month') {
                    startDate.setMonth(startDate.getMonth() - 1);
                }

                const filteredViolations = violations.filter(v => {
                    if (!v.created_at) return false;
                    const violationDate = new Date(v.created_at);
                    return violationDate >= startDate;
                });

                // Calculate top violations by type
                const violationCounts = {};
                filteredViolations.forEach(v => {
                    const type = v.type || 'Unknown';
                    violationCounts[type] = (violationCounts[type] || 0) + 1;
                });
                const topViolations = Object.entries(violationCounts)
                    .map(([type, count]) => ({
                        type,
                        count,
                        percentage: Math.round((count / filteredViolations.length) * 100)
                    }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);

                // Calculate top locations
                const locationCounts = {};
                filteredViolations.forEach(v => {
                    const location = v.location || 'Unknown';
                    locationCounts[location] = (locationCounts[location] || 0) + 1;
                });
                const topLocations = Object.entries(locationCounts)
                    .map(([location, violations]) => ({ location, violations }))
                    .sort((a, b) => b.violations - a.violations)
                    .slice(0, 5);

                // Format detailed violations
                const detailedViolations = filteredViolations.slice(0, 50).map(v => ({
                    id: v._id || v.id,
                    timestamp: v.created_at ? new Date(v.created_at).toLocaleString() : 'N/A',
                    location: v.location || 'Unknown',
                    violationType: v.type || 'Unknown',
                    vehicle: 'Vehicle',
                    licensePlate: 'N/A',
                    speed: 'N/A',
                    limit: 'N/A',
                    fine: 0,
                    status: v.status ? v.status.charAt(0).toUpperCase() + v.status.slice(1) : 'Pending',
                    camera: 'N/A',
                    imageUrl: v.snapshot_url
                }));

                const activeCameras = cameras.filter(c => c.status === 'active').length;

                // Build report data based on selected report type
                const data = {
                    daily: {
                        totalViolations: filteredViolations.length,
                        activeCameras: activeCameras,
                        revenue: 0, // Not in schema
                        topViolations: topViolations
                    },
                    weekly: {
                        totalViolations: filteredViolations.length,
                        activeCameras: activeCameras,
                        revenue: 0,
                        trend: '+0%', // Would need historical data
                        topLocations: topLocations
                    },
                    monthly: {
                        totalViolations: filteredViolations.length,
                        activeCameras: activeCameras,
                        revenue: 0,
                        trend: '+0%',
                        cameraPerformance: cameras.slice(0, 5).map(c => ({
                            camera: c.name || c.location || 'Unnamed',
                            violations: 0, // Would need to count per camera
                            uptime: 95 // Would need to calculate
                        }))
                    },
                    violations: {
                        totalViolations: filteredViolations.length,
                        activeCameras: activeCameras,
                        revenue: 0,
                        detailedViolations: detailedViolations
                    }
                };

                setReportData(data);
            }
        } catch (err) {
            console.error('Error fetching report data:', err);
            setError('Failed to load report data');
        } finally {
            setLoading(false);
        }
    };

    const currentData = reportData ? reportData[selectedReport] : null;

    const handleExport = async () => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/api/reports/export`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({
                    report_type: selectedReport,
                    date_range: dateRange,
                    format: exportFormat
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate report');
            }

            // Get filename from Content-Disposition header or use default
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `violation_report_${selectedReport}_${dateRange}.${exportFormat}`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            // Download the file
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export report. Please try again.');
        }
    };

    const handleExportAll = async () => {
        // Export all report types
        const formats = ['pdf', 'csv', 'excel'];
        for (const format of formats) {
            try {
                const response = await fetch(`${config.API_BASE_URL}/api/reports/export`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeaders()
                    },
                    body: JSON.stringify({
                        report_type: 'all',
                        date_range: dateRange,
                        format: format
                    })
                });

                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `violation_report_all_${dateRange}.${format}`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    // Small delay between downloads
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            } catch (error) {
                console.error(`Export error for ${format}:`, error);
            }
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

    if (loading) {
        return (
            <div className="h-full p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading report data...</p>
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
                        onClick={fetchReportData} 
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!currentData) {
        return (
            <div className="h-full p-6 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white text-lg">No data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full p-6 overflow-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Reports & Export</h1>
                    <p className="text-gray-400">Generate and export traffic violation reports</p>
                </div>
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={handleExportAll}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
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
                                <button 
                                    onClick={handleExport}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Export</span>
                                </button>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="bg-gray-700 rounded-lg p-4">
                                <h4 className="text-gray-400 text-sm font-medium">Total Violations</h4>
                                <p className="text-2xl font-bold text-white">{currentData.totalViolations?.toLocaleString() || 0}</p>
                            </div>
                            <div className="bg-gray-700 rounded-lg p-4">
                                <h4 className="text-gray-400 text-sm font-medium">Active Cameras</h4>
                                <p className="text-2xl font-bold text-white">{currentData.activeCameras || 0}</p>
                            </div>
                            <div className="bg-gray-700 rounded-lg p-4">
                                <h4 className="text-gray-400 text-sm font-medium">Revenue</h4>
                                <p className="text-2xl font-bold text-white">${(currentData.revenue || 0).toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Detailed Content */}
                        <div className="space-y-6">
                            {selectedReport === 'daily' && (
                                <div>
                                    <h4 className="text-lg font-semibold mb-4">Top Violations</h4>
                                    <div className="space-y-3">
                                        {currentData.topViolations && currentData.topViolations.length > 0 ? (
                                            currentData.topViolations.map((violation, index) => (
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
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-center py-4">No violations data available</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedReport === 'weekly' && (
                                <div>
                                    <h4 className="text-lg font-semibold mb-4">Top Locations</h4>
                                    <div className="space-y-3">
                                        {currentData.topLocations && currentData.topLocations.length > 0 ? (
                                            currentData.topLocations.map((location, index) => (
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
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-center py-4">No location data available</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedReport === 'monthly' && (
                                <div>
                                    <h4 className="text-lg font-semibold mb-4">Camera Performance</h4>
                                    <div className="space-y-3">
                                        {currentData.cameraPerformance && currentData.cameraPerformance.length > 0 ? (
                                            currentData.cameraPerformance.map((camera, index) => (
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
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-center py-4">No camera performance data available</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedReport === 'violations' && (
                                <div>
                                    <h4 className="text-lg font-semibold mb-4">Detailed Violations</h4>
                                    <div className="overflow-x-auto">
                                        {currentData.detailedViolations && currentData.detailedViolations.length > 0 ? (
                                            <table className="w-full">
                                                <thead className="bg-gray-700">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Location</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
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
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(violation.status)}`}>
                                                                {violation.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                            {violation.imageUrl && (
                                                                <a 
                                                                    href={violation.imageUrl} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-400 hover:text-blue-300"
                                                                >
                                                                    View Image
                                                                </a>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        ) : (
                                            <p className="text-gray-400 text-center py-4">No violations found for selected period</p>
                                        )}
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