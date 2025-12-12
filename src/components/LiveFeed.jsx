import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, AlertTriangle, Activity, Clock, Video, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import config from '../config';
import { useAuth } from '../contexts/AuthContext';

export default function LiveFeed() {
    const [isRunning, setIsRunning] = useState(false);
    const [videoSource, setVideoSource] = useState('');
    const [violations, setViolations] = useState([]);
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);
    const [streamUrl, setStreamUrl] = useState(null);
    const [newViolationCount, setNewViolationCount] = useState(0);
    const violationsPollInterval = useRef(null);
    const statusPollInterval = useRef(null);
    const violationsEndRef = useRef(null);
    const { getAuthHeaders, token } = useAuth();

    // Poll for violations
    useEffect(() => {
        if (isRunning) {
            fetchViolations();
            violationsPollInterval.current = setInterval(fetchViolations, 2000); // Poll every 2 seconds
        } else {
            if (violationsPollInterval.current) {
                clearInterval(violationsPollInterval.current);
            }
        }

        return () => {
            if (violationsPollInterval.current) {
                clearInterval(violationsPollInterval.current);
            }
        };
    }, [isRunning]);

    // Poll for status
    useEffect(() => {
        if (isRunning) {
            fetchStatus();
            statusPollInterval.current = setInterval(fetchStatus, 1000); // Poll every second
        } else {
            if (statusPollInterval.current) {
                clearInterval(statusPollInterval.current);
            }
        }

        return () => {
            if (statusPollInterval.current) {
                clearInterval(statusPollInterval.current);
            }
        };
    }, [isRunning]);

    const fetchViolations = async () => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/api/live/violations?limit=20`, {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Violations API response:', data); // Debug log
                if (data.success) {
                    const newViolations = data.violations || [];
                    console.log('Parsed violations:', newViolations.length, newViolations); // Debug log
                    // Check for new violations
                    if (violations.length > 0 && newViolations.length > violations.length) {
                        setNewViolationCount(newViolations.length - violations.length);
                        // Reset counter after 3 seconds
                        setTimeout(() => setNewViolationCount(0), 3000);
                    }
                    setViolations(newViolations);
                } else {
                    console.warn('API returned success=false:', data);
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('API error response:', response.status, errorData);
            }
        } catch (err) {
            console.error('Error fetching violations:', err);
        }
    };

    const fetchStatus = async () => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/api/live/status`, {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setStatus(data.status);
                }
            }
        } catch (err) {
            console.error('Error fetching status:', err);
        }
    };

    const startDetection = async () => {
        // Validate RTSP URL
        const validation = validateRTSPUrl(videoSource);
        if (!validation.valid) {
            setError(validation.error);
            return;
        }

        setError(null);
        setIsRunning(true);

        try {
            const response = await fetch(`${config.API_BASE_URL}/api/live/start`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    video_source: videoSource.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                // Improve error messages for RTSP connection failures
                let errorMessage = data.error || 'Failed to start detection';
                if (errorMessage.toLowerCase().includes('calibration') || 
                    errorMessage.toLowerCase().includes('initialize') ||
                    errorMessage.toLowerCase().includes('connection')) {
                    errorMessage = `RTSP Connection Error: ${errorMessage}. Please verify the RTSP URL is correct and the stream is accessible.`;
                }
                throw new Error(errorMessage);
            }

            if (data.success) {
                // Append token as query parameter for image src (can't send headers)
                const streamUrlWithAuth = token 
                    ? `${config.API_BASE_URL}/api/live/stream?token=${encodeURIComponent(token)}`
                    : `${config.API_BASE_URL}/api/live/stream`;
                setStreamUrl(streamUrlWithAuth);
                setStatus(data.status);
            }
        } catch (err) {
            console.error('Error starting detection:', err);
            setError(err.message);
            setIsRunning(false);
        }
    };

    const stopDetection = async () => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/api/live/stop`, {
                method: 'POST',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (data.success) {
                setIsRunning(false);
                setStreamUrl(null);
                setStatus(null);
                // Keep violations visible even after stopping detection
                // setViolations([]);
            }
        } catch (err) {
            console.error('Error stopping detection:', err);
            setError(err.message);
        }
    };

    const getViolationTypeLabel = (type) => {
        const labels = {
            'speed': 'Speed Violation',
            'direction': 'Direction Violation',
            'red_light': 'Red Light Violation',
            'helmet': 'No Helmet',
            'triple_riding': 'Triple Riding'
        };
        return labels[type] || type;
    };

    const getViolationTypeColor = (type) => {
        const colors = {
            'speed': 'bg-blue-500',
            'direction': 'bg-yellow-500',
            'red_light': 'bg-red-500',
            'helmet': 'bg-orange-500',
            'triple_riding': 'bg-purple-500'
        };
        return colors[type] || 'bg-gray-500';
    };

    const formatTimestamp = (timestamp) => {
        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString();
        } catch {
            return timestamp;
        }
    };

    // Video source URL validation (supports RTSP, RTMP, and file paths)
    const validateRTSPUrl = (url) => {
        if (!url || !url.trim()) {
            return { valid: false, error: 'Please enter a video source URL' };
        }

        const trimmedUrl = url.trim();
        
        // Check for RTSP URL format: rtsp://host:port/path
        const rtspPattern = /^rtsp:\/\/[^\s/$.?#].[^\s]*$/i;
        const isRTSP = rtspPattern.test(trimmedUrl);
        
        // Check for RTMP URL format: rtmp://host:port/path
        const rtmpPattern = /^rtmp:\/\/[^\s/$.?#].[^\s]*$/i;
        const isRTMP = rtmpPattern.test(trimmedUrl);
        
        // Also allow file paths (for local testing)
        const isFilePath = trimmedUrl.startsWith('/') || 
                          /^[A-Za-z]:\\/.test(trimmedUrl) || 
                          trimmedUrl.endsWith('.mp4') || 
                          trimmedUrl.endsWith('.avi') || 
                          trimmedUrl.endsWith('.mov');
        
        if (!isRTSP && !isRTMP && !isFilePath) {
            return {
                valid: false,
                error: 'Invalid video source format. Expected RTSP (rtsp://...), RTMP (rtmp://...), or local file path'
            };
        }

        return { valid: true, error: null };
    };

    return (
        <div className="h-full p-6 overflow-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="min-w-0 flex-1">
                    <h1 className="text-3xl font-bold truncate">Live Detection</h1>
                    <p className="text-gray-400 truncate">Real-time traffic violation detection</p>
                </div>
                <div className="flex items-center space-x-4 flex-shrink-0">
                    {status && (
                        <div className="flex items-center space-x-2">
                            {status.connected ? (
                                <Wifi className="w-5 h-5 text-green-400" />
                            ) : (
                                <WifiOff className="w-5 h-5 text-red-400" />
                            )}
                            <span className="text-sm text-gray-400 whitespace-nowrap">
                                {status.connected ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Violations Alert Banner */}
            {isRunning && violations.length > 0 && (
                <div className="mb-4 bg-red-900 border border-red-700 rounded-lg p-4 flex items-center justify-between animate-pulse">
                    <div className="flex items-center space-x-3">
                        <AlertCircle className="w-6 h-6 text-red-400" />
                        <div>
                            <span className="text-red-200 font-semibold">
                                {violations.length} Violation{violations.length !== 1 ? 's' : ''} Detected
                            </span>
                            {newViolationCount > 0 && (
                                <span className="ml-2 text-red-300 text-sm">
                                    ({newViolationCount} new)
                                </span>
                            )}
                        </div>
                    </div>
                    <a
                        href="#violations-panel"
                        className="text-red-200 hover:text-white text-sm underline"
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('violations-panel')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                    >
                        View All →
                    </a>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Sidebar - Controls */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                        <h3 className="text-lg font-semibold mb-4">Controls</h3>

                        {/* Video Source Input */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Video Source (RTSP/RTMP)
                            </label>
                            <input
                                type="text"
                                value={videoSource}
                                onChange={(e) => {
                                    setVideoSource(e.target.value);
                                    // Clear error when user types
                                    if (error) setError(null);
                                }}
                                disabled={isRunning}
                                placeholder="rtmp://localhost:1935/stream/test or rtsp://example.com:554/stream"
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            />
                            <p className="mt-1 text-xs text-gray-400">
                                Enter RTMP (e.g., rtmp://localhost:1935/stream/test) or RTSP URL, or local file path
                            </p>
                            <p className="mt-1 text-xs text-blue-400">
                                RTMP: rtmp://host:port/path/key | RTSP: rtsp://[user:pass@]host[:port]/path
                            </p>
                        </div>

                        {/* Start/Stop Buttons */}
                        <div className="space-y-3 mb-6">
                            <button
                                onClick={startDetection}
                                disabled={isRunning}
                                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
                            >
                                <Play className="w-4 h-4" />
                                <span>Start Detection</span>
                            </button>

                            <button
                                onClick={stopDetection}
                                disabled={!isRunning}
                                className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
                            >
                                <Square className="w-4 h-4" />
                                <span>Stop Detection</span>
                            </button>
                        </div>

                        {/* Status Info */}
                        {status && (
                            <div className="space-y-3 mb-6">
                                <div className="bg-gray-700 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-300">Status</span>
                                        <span className={`text-sm font-medium ${status.running ? 'text-green-400' : 'text-gray-400'}`}>
                                            {status.running ? 'Running' : 'Stopped'}
                                        </span>
                                    </div>
                                </div>

                                {status.frame_count !== undefined && (
                                    <div className="bg-gray-700 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-300">Frames Processed</span>
                                            <span className="text-sm font-medium text-white">
                                                {status.frame_count.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {status.violation_count !== undefined && (
                                    <div className="bg-gray-700 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-300">Violations Detected</span>
                                            <span className="text-sm font-medium text-red-400">
                                                {status.violation_count}
                                            </span>
                                        </div>
                                    </div>
                                )}
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

                {/* Main Content - Video Stream */}
                <div className="lg:col-span-2">
                    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-700">
                            <h3 className="text-lg font-semibold">Live Video Feed</h3>
                        </div>

                        <div className="p-6">
                            {streamUrl ? (
                                <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                                    <img
                                        src={streamUrl}
                                        alt="Live Stream"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            console.error('Stream error');
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                    {!status?.connected && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
                                            <div className="text-center">
                                                <WifiOff className="w-12 h-12 text-red-400 mx-auto mb-2" />
                                                <p className="text-white">Connecting to stream...</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="relative bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center" style={{ aspectRatio: '16/9', minHeight: '400px' }}>
                                    <div className="text-center">
                                        <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-400">No stream available</p>
                                        <p className="text-sm text-gray-500 mt-2">Start detection to view live feed</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Violations Panel */}
            <div id="violations-panel" className="mt-6">
                <div className="bg-gray-800 rounded-lg border border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                <h3 className="text-lg font-semibold">Recent Violations</h3>
                                {violations.length > 0 && (
                                    <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                                        {violations.length}
                                    </span>
                                )}
                            </div>
                            {isRunning && (
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-gray-400">Live</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6">
                        {violations.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {violations.map((violation, index) => (
                                    <div
                                        key={violation.id}
                                        className={`bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-all hover:shadow-lg hover:shadow-red-500/20 border border-gray-600 hover:border-red-500/50 ${
                                            index < newViolationCount ? 'animate-pulse' : ''
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center space-x-2 flex-1">
                                                <div className={`w-3 h-3 rounded-full ${getViolationTypeColor(violation.type)} animate-pulse`}></div>
                                                <span className="font-semibold text-white text-sm">
                                                    {getViolationTypeLabel(violation.type)}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1 text-xs text-gray-400">
                                                <Clock className="w-3 h-3" />
                                                <span>{formatTimestamp(violation.timestamp)}</span>
                                            </div>
                                        </div>

                                        {violation.snapshot_url && (
                                            <div className="mb-3 rounded-lg overflow-hidden border-2 border-gray-600">
                                                <img
                                                    src={violation.snapshot_url}
                                                    alt="Violation"
                                                    className="w-full h-32 object-cover"
                                                />
                                            </div>
                                        )}

                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center justify-between bg-gray-800/50 rounded px-2 py-1">
                                                <span className="text-gray-400 text-xs">Vehicle ID:</span>
                                                <span className="text-white font-medium text-xs">
                                                    {violation.vehicle_id || 'N/A'}
                                                </span>
                                            </div>
                                            {violation.metadata?.speed && (
                                                <div className="flex items-center justify-between bg-gray-800/50 rounded px-2 py-1">
                                                    <span className="text-gray-400 text-xs">Speed:</span>
                                                    <span className="text-red-400 font-bold text-xs">
                                                        {violation.metadata.speed.toFixed(1)} km/h
                                                    </span>
                                                </div>
                                            )}
                                            {violation.bbox && (
                                                <div className="flex items-center justify-between bg-gray-800/50 rounded px-2 py-1">
                                                    <span className="text-gray-400 text-xs">Location:</span>
                                                    <span className="text-white font-medium text-xs">
                                                        [{violation.bbox[0]}, {violation.bbox[1]}]
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400">No violations detected yet</p>
                                {!isRunning && (
                                    <p className="text-sm text-gray-500 mt-2">Start detection to monitor violations</p>
                                )}
                                {isRunning && (
                                    <div className="mt-4 flex items-center justify-center space-x-2">
                                        <Activity className="w-4 h-4 text-gray-500 animate-pulse" />
                                        <p className="text-sm text-gray-500">Monitoring for violations...</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
