import React, { useState, useEffect, useRef } from 'react';
import { Camera, Settings, AlertTriangle, CheckCircle, Clock, Activity, Play, Square, Radio, Monitor, Video } from 'lucide-react';
import config from '../config';
import { useAuth } from '../contexts/AuthContext';

export default function LiveFeed() {
    const [cameraSource, setCameraSource] = useState('rtsp'); // 'rtsp' or 'usb'
    const [rtspUrl, setRtspUrl] = useState('');
    const [usbDeviceIndex, setUsbDeviceIndex] = useState('0');
    const [selectedCameraId, setSelectedCameraId] = useState('');
    const [cameras, setCameras] = useState([]);
    const [streamId, setStreamId] = useState(null);
    const [streamStatus, setStreamStatus] = useState('inactive'); // 'inactive', 'starting', 'active', 'stopping', 'error'
    const [violations, setViolations] = useState([]);
    const [streamStats, setStreamStats] = useState(null);
    const [error, setError] = useState(null);
    const [snapshotInterval, setSnapshotInterval] = useState(5);
    const [loading, setLoading] = useState(false);
    const [streamImageError, setStreamImageError] = useState(false);
    const { getAuthHeaders } = useAuth();
    const streamImageRef = useRef(null);
    const violationsPollIntervalRef = useRef(null);
    const statusPollIntervalRef = useRef(null);

    // Fetch cameras on mount
    useEffect(() => {
        fetchCameras();
    }, []);

    // Poll for violations when stream is active
    useEffect(() => {
        if (streamId && streamStatus === 'active') {
            // Poll violations every 2-3 seconds
            violationsPollIntervalRef.current = setInterval(() => {
                fetchViolations();
            }, 2500);

            // Poll status every 5 seconds
            statusPollIntervalRef.current = setInterval(() => {
                fetchStreamStatus();
            }, 5000);

            return () => {
                if (violationsPollIntervalRef.current) {
                    clearInterval(violationsPollIntervalRef.current);
                }
                if (statusPollIntervalRef.current) {
                    clearInterval(statusPollIntervalRef.current);
                }
            };
        } else {
            if (violationsPollIntervalRef.current) {
                clearInterval(violationsPollIntervalRef.current);
            }
            if (statusPollIntervalRef.current) {
                clearInterval(statusPollIntervalRef.current);
            }
        }
    }, [streamId, streamStatus]);

    // Set stream image URL when stream starts (MJPEG needs stable URL)
    useEffect(() => {
        if (streamId && streamStatus === 'active' && streamImageRef.current) {
            // MJPEG streams need a stable URL - don't add timestamp
            const streamUrl = `${config.API_BASE_URL}/api/live/stream/${streamId}`;
            streamImageRef.current.src = streamUrl;
            setStreamImageError(false);
            console.log('Setting MJPEG stream URL:', streamUrl);
        } else if (streamImageRef.current && (streamStatus === 'inactive' || streamStatus === 'error' || streamStatus === 'stopping')) {
            // Clear the image when stream stops
            streamImageRef.current.src = '';
            setStreamImageError(false);
        }
    }, [streamId, streamStatus]);

    const fetchCameras = async () => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/api/cameras`, {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.cameras) {
                    setCameras(data.cameras);
                    if (data.cameras.length > 0 && !selectedCameraId) {
                        setSelectedCameraId(data.cameras[0]._id);
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching cameras:', err);
        }
    };

    const fetchStreamStatus = async () => {
        if (!streamId) return;

        try {
            const response = await fetch(`${config.API_BASE_URL}/api/live/status/${streamId}`, {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.status) {
                    setStreamStatus(data.status.status);
                    setStreamStats(data.status);
                    // Update error message if status is error
                    if (data.status.status === 'error' && data.status.error) {
                        setError(data.status.error);
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching stream status:', err);
        }
    };

    const fetchViolations = async () => {
        if (!streamId) return;

        try {
            const response = await fetch(`${config.API_BASE_URL}/api/live/violations/${streamId}?limit=20`, {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.violations) {
                    setViolations(data.violations);
                }
            }
        } catch (err) {
            console.error('Error fetching violations:', err);
        }
    };

    const startStream = async () => {
        setLoading(true);
        setError(null);
        setStreamStatus('starting');

        try {
            const source = cameraSource === 'rtsp' ? rtspUrl : usbDeviceIndex;

            if (!source) {
                throw new Error(`Please provide a ${cameraSource === 'rtsp' ? 'RTSP URL' : 'USB device index'}`);
            }

            const response = await fetch(`${config.API_BASE_URL}/api/live/start`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    camera_id: selectedCameraId || null,
                    source_type: cameraSource,
                    source: source,
                    snapshot_interval: snapshotInterval
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to start stream');
            }

            const data = await response.json();
            if (data.success) {
                setStreamId(data.stream_id);
                setStreamStatus('active'); // Optimistically mark active so UI shows feed immediately
                setStreamImageError(false);

                // Fetch initial status after a short delay to sync stats/errors
                setTimeout(() => {
                    fetchStreamStatus();
                    fetchViolations();
                }, 2000);
            } else {
                throw new Error(data.error || 'Failed to start stream');
            }
        } catch (err) {
            console.error('Error starting stream:', err);
            setError(err.message);
            setStreamStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const stopStream = async () => {
        if (!streamId) return;

        setLoading(true);
        setStreamStatus('stopping');

        try {
            const response = await fetch(`${config.API_BASE_URL}/api/live/stop/${streamId}`, {
                method: 'POST',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setStreamId(null);
                    setStreamStatus('inactive');
                    setViolations([]);
                    setStreamStats(null);
                    setStreamImageError(false);
                }
            }
        } catch (err) {
            console.error('Error stopping stream:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-500';
            case 'starting':
            case 'stopping':
                return 'bg-yellow-500';
            case 'error':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const formatUptime = (seconds) => {
        if (!seconds) return '0s';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    };

    return (
        <div className="h-full p-6 overflow-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="min-w-0 flex-1">
                    <h1 className="text-3xl font-bold truncate">Live Camera Feed</h1>
                    <p className="text-gray-400 truncate">Real-time traffic violation detection</p>
                </div>
                <div className="flex items-center space-x-4 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(streamStatus)}`}></div>
                        <span className="text-sm text-gray-400 whitespace-nowrap">
                            Status: {streamStatus.charAt(0).toUpperCase() + streamStatus.slice(1)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                {/* Left Sidebar - Camera Configuration */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 h-full overflow-auto">
                        <h3 className="text-lg font-semibold mb-4">Camera Configuration</h3>

                        {/* Camera Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Camera (Optional)</label>
                            <select
                                value={selectedCameraId}
                                onChange={(e) => setSelectedCameraId(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                            >
                                <option value="">None</option>
                                {cameras.map((camera) => (
                                    <option key={camera._id} value={camera._id}>
                                        {camera.name || camera.location || camera._id}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Source Type Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Camera Source</label>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setCameraSource('rtsp')}
                                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                                        cameraSource === 'rtsp'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    <Radio className="w-4 h-4 inline mr-1" />
                                    RTSP
                                </button>
                                <button
                                    onClick={() => setCameraSource('usb')}
                                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                                        cameraSource === 'usb'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    <Monitor className="w-4 h-4 inline mr-1" />
                                    USB
                                </button>
                            </div>
                        </div>

                        {/* RTSP URL Input */}
                        {cameraSource === 'rtsp' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">RTSP URL</label>
                                <input
                                    type="text"
                                    value={rtspUrl}
                                    onChange={(e) => setRtspUrl(e.target.value)}
                                    placeholder="rtsp://user:pass@ip:port/stream"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                                />
                            </div>
                        )}

                        {/* USB Device Index Input */}
                        {cameraSource === 'usb' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">USB Device Index</label>
                                <input
                                    type="number"
                                    value={usbDeviceIndex}
                                    onChange={(e) => setUsbDeviceIndex(e.target.value)}
                                    placeholder="0"
                                    min="0"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                                />
                            </div>
                        )}

                        {/* Snapshot Interval */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Detection Interval (seconds)
                            </label>
                            <input
                                type="number"
                                value={snapshotInterval}
                                onChange={(e) => setSnapshotInterval(Math.max(1, Math.min(60, parseInt(e.target.value) || 5)))}
                                min="1"
                                max="60"
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                            />
                        </div>

                        {/* Stream Controls */}
                        <div className="space-y-2 mb-4">
                            {streamStatus === 'inactive' || streamStatus === 'error' ? (
                                <button
                                    onClick={startStream}
                                    disabled={loading}
                                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white flex-shrink-0"></div>
                                            <span>Starting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-4 h-4 flex-shrink-0" />
                                            <span>Start Stream</span>
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={stopStream}
                                    disabled={loading}
                                    className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white flex-shrink-0"></div>
                                            <span>Stopping...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Square className="w-4 h-4 flex-shrink-0" />
                                            <span>Stop Stream</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Stream Statistics */}
                        {streamStats && streamStatus === 'active' && (
                            <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                                <h4 className="text-sm font-medium text-white mb-2">Stream Statistics</h4>
                                <div className="text-xs text-gray-300 space-y-1">
                                    <div className="flex justify-between">
                                        <span>Uptime:</span>
                                        <span>{formatUptime(streamStats.uptime)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>FPS:</span>
                                        <span>{streamStats.fps || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Frames:</span>
                                        <span>{streamStats.frame_count || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Violations:</span>
                                        <span className="text-red-400">{streamStats.violation_count || 0}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error Display */}
                        {error && (
                            <div className="mt-4 p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm"><strong>Error:</strong> {error}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content - Video Stream & Results */}
                <div className="lg:col-span-3">
                    <div className="bg-gray-800 rounded-lg border border-gray-700 h-full overflow-auto">
                        <div className="px-6 py-4 border-b border-gray-700">
                            <h3 className="text-lg font-semibold">Live Detection</h3>
                        </div>

                        <div className="p-6 h-full">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
                                {/* Video Stream */}
                                <div className="xl:col-span-1">
                                    <div className="bg-gray-700 rounded-lg p-4 h-full">
                                        <h4 className="text-md font-medium text-white mb-4">Camera Feed</h4>
                                        <div className="relative h-full bg-black rounded-lg overflow-hidden flex items-center justify-center">
                                            {streamStatus === 'active' && streamId ? (
                                                <>
                                                    <img
                                                        ref={streamImageRef}
                                                        src={`${config.API_BASE_URL}/api/live/stream/${streamId}`}
                                                        alt="Live Stream"
                                                        className={`w-full h-full object-contain transition-opacity ${streamImageError ? 'opacity-0' : 'opacity-100'}`}
                                                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                                                        onLoad={() => {
                                                            setStreamImageError(false);
                                                            console.log('MJPEG stream loaded successfully');
                                                        }}
                                                        onError={(e) => {
                                                            console.error('MJPEG stream error:', e);
                                                            setStreamImageError(true);
                                                            // Don't set error state immediately - MJPEG might be starting
                                                        }}
                                                    />
                                                    {streamImageError && (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 text-gray-300">
                                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-3"></div>
                                                            <p>Connecting to stream...</p>
                                                            <p className="text-xs mt-2">This may take a few seconds</p>
                                                        </div>
                                                    )}
                                                </>
                                            ) : streamStatus === 'starting' ? (
                                                <div className="text-gray-400 text-center">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                                                    <p>Starting stream...</p>
                                                    <p className="text-sm mt-2">Please wait</p>
                                                </div>
                                            ) : (
                                                <div className="text-gray-400 text-center">
                                                    <Video className="w-16 h-16 mx-auto mb-2 opacity-50" />
                                                    <p>No active stream</p>
                                                    <p className="text-sm mt-2">Start a stream to view live feed</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Detection Results */}
                                <div className="xl:col-span-1">
                                    <div className="bg-gray-700 rounded-lg p-4 h-full overflow-auto">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-md font-medium text-white">Recent Violations</h4>
                                            {violations.length > 0 && (
                                                <span className="text-xs text-gray-400">{violations.length} detected</span>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            {violations.length === 0 ? (
                                                <div className="text-gray-400 text-center py-8">
                                                    <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                    <p>No violations detected yet</p>
                                                    {streamStatus === 'active' && (
                                                        <p className="text-sm mt-2">Violations will appear here when detected</p>
                                                    )}
                                                </div>
                                            ) : (
                                                violations.map((violation, index) => (
                                                    <div key={violation._id || index} className="bg-gray-800 rounded-lg p-3 border border-gray-600">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center space-x-2">
                                                                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                                                <span className="font-medium text-white">{violation.type || 'Violation'}</span>
                                                            </div>
                                                            <span className="text-xs text-gray-400">
                                                                {(violation.confidence * 100).toFixed(1)}% confidence
                                                            </span>
                                                        </div>
                                                        {violation.snapshot_url && (
                                                            <img
                                                                src={violation.snapshot_url}
                                                                alt="Violation snapshot"
                                                                className="w-full rounded-lg border border-gray-600 mt-2"
                                                            />
                                                        )}
                                                        <div className="mt-2 text-xs text-gray-400">
                                                            {violation.timestamp && (
                                                                <span>{new Date(violation.timestamp * 1000).toLocaleTimeString()}</span>
                                                            )}
                                                            {violation.location && (
                                                                <span className="ml-2">• {violation.location}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
