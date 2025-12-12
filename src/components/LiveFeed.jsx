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
        <div className="h-full w-full flex flex-col overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" style={{ height: '100%', overflow: 'hidden' }}>
            {/* Top Control Bar */}
            <div className="bg-gray-800/80 backdrop-blur-lg border-b border-gray-700/50 shadow-xl px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between gap-4">
                    {/* Left: Title and Status */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                Live Detection
                            </h1>
                            <p className="text-xs text-gray-400 mt-0.5">Real-time traffic violation monitoring</p>
                        </div>
                        {status && (
                            <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-700/50 rounded-lg border border-gray-600/50">
                                {status.connected ? (
                                    <Wifi className="w-4 h-4 text-green-400" />
                                ) : (
                                    <WifiOff className="w-4 h-4 text-red-400" />
                                )}
                                <span className="text-xs text-gray-300 whitespace-nowrap">
                                    {status.connected ? 'Connected' : 'Disconnected'}
                                </span>
                                {status.frame_count !== undefined && (
                                    <>
                                        <div className="w-px h-4 bg-gray-600"></div>
                                        <span className="text-xs text-gray-400">
                                            {status.frame_count.toLocaleString()} frames
                                        </span>
                                    </>
                                )}
                                {status.violation_count !== undefined && status.violation_count > 0 && (
                                    <>
                                        <div className="w-px h-4 bg-gray-600"></div>
                                        <span className="text-xs text-red-400 font-semibold">
                                            {status.violation_count} violations
                                        </span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Center: Video Source Input */}
                    <div className="flex-1 max-w-2xl">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={videoSource}
                                onChange={(e) => {
                                    setVideoSource(e.target.value);
                                    if (error) setError(null);
                                }}
                                disabled={isRunning}
                                placeholder="rtmp://localhost:1935/stream/test"
                                className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-50 transition-all"
                            />
                            <button
                                onClick={startDetection}
                                disabled={isRunning}
                                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 shadow-lg shadow-green-600/20 hover:shadow-green-600/30 transition-all"
                            >
                                <Play className="w-4 h-4" />
                                <span className="hidden sm:inline">Start</span>
                            </button>
                            <button
                                onClick={stopDetection}
                                disabled={!isRunning}
                                className="px-6 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 shadow-lg shadow-red-600/20 hover:shadow-red-600/30 transition-all"
                            >
                                <Square className="w-4 h-4" />
                                <span className="hidden sm:inline">Stop</span>
                            </button>
                        </div>
                    </div>

                    {/* Right: Violations Badge */}
                    {isRunning && violations.length > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-lg backdrop-blur-sm">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            <div className="text-right">
                                <div className="text-sm font-bold text-red-300">
                                    {violations.length} {violations.length === 1 ? 'Violation' : 'Violations'}
                                </div>
                                {newViolationCount > 0 && (
                                    <div className="text-xs text-red-400 animate-pulse">
                                        +{newViolationCount} new
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mt-3 p-3 bg-red-900/30 border border-red-700/50 text-red-200 rounded-lg backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content Area - Large Video Feed */}
            <div className="flex-1 flex gap-4 p-4 overflow-hidden" style={{ overflow: 'hidden', height: 'calc(100vh - 120px)', display: 'flex' }}>
                {/* Video Feed - Takes most of the space */}
                <div className="flex-1 flex flex-col min-w-0" style={{ height: '100%', overflow: 'hidden' }}>
                    <div className="h-full bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-2xl overflow-hidden flex flex-col" style={{ height: '100%', overflow: 'hidden' }}>
                        <div className="px-6 py-3 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-transparent flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Video className="w-5 h-5 text-blue-400" />
                                    Live Video Feed
                                </h3>
                                {isRunning && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                        <span className="text-xs text-gray-400">Live</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 p-4 flex items-center justify-center" style={{ height: '100%', overflow: 'hidden', flex: '1 1 auto' }}>
                            {streamUrl ? (
                                <div className="relative w-full h-full bg-black rounded-lg overflow-hidden shadow-inner" style={{ height: '100%', width: '100%' }}>
                                    <img
                                        src={streamUrl}
                                        alt="Live Stream"
                                        className="w-full h-full object-contain"
                                        style={{ height: '100%', width: '100%', objectFit: 'contain' }}
                                        onError={(e) => {
                                            console.error('Stream error');
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                    {!status?.connected && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 backdrop-blur-sm">
                                            <div className="text-center">
                                                <WifiOff className="w-16 h-16 text-red-400 mx-auto mb-3 animate-pulse" />
                                                <p className="text-white font-medium">Connecting to stream...</p>
                                                <p className="text-sm text-gray-400 mt-1">Please wait</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700" style={{ height: '100%', width: '100%' }}>
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                                            <Video className="w-10 h-10 text-gray-600" />
                                        </div>
                                        <p className="text-gray-400 font-medium text-lg">No stream available</p>
                                        <p className="text-sm text-gray-500 mt-2">Enter a video source and start detection</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Violations Sidebar - Right Side Scrollable Column */}
                <div className="w-[32rem] flex-shrink-0 flex flex-col" style={{ height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
                    <div className="h-full bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-2xl overflow-hidden flex flex-col" style={{ height: '100%', overflow: 'hidden' }}>
                        <div className="px-4 py-3 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-transparent flex-shrink-0" style={{ flexShrink: 0 }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                    <h3 className="text-lg font-semibold text-white">Violations</h3>
                                    {violations.length > 0 && (
                                        <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">
                                            {violations.length}
                                        </span>
                                    )}
                                </div>
                                {isRunning && (
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4" style={{ overflowY: 'auto', overflowX: 'hidden', height: 0, flex: '1 1 auto' }}>
                            {violations.length > 0 ? (
                                <div className="space-y-3">
                                    {[...violations].reverse().map((violation, index) => (
                                        <div
                                            key={violation.id || index}
                                            className={`group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-4 hover:from-gray-700/80 hover:to-gray-800/80 transition-all duration-300 border border-gray-700/50 hover:border-red-500/50 hover:shadow-xl hover:shadow-red-500/20 backdrop-blur-sm ${
                                                index < newViolationCount ? 'animate-pulse border-red-500/70 shadow-lg shadow-red-500/30' : ''
                                            }`}
                                        >
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className={`w-3 h-3 rounded-full ${getViolationTypeColor(violation.type)} flex-shrink-0 shadow-lg ${getViolationTypeColor(violation.type)}/50 animate-pulse`}></div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-white text-sm truncate">
                                                            {getViolationTypeLabel(violation.type)}
                                                        </h4>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <Clock className="w-3 h-3 text-gray-400" />
                                                            <span className="text-xs text-gray-400">{formatTimestamp(violation.timestamp || violation.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {index < newViolationCount && (
                                                    <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
                                                        NEW
                                                    </span>
                                                )}
                                            </div>

                                            {/* Snapshot Image */}
                                            {violation.snapshot_url && (
                                                <div className="mb-3 rounded-lg overflow-hidden border-2 border-gray-700/50 group-hover:border-red-500/50 transition-colors shadow-lg">
                                                    <img
                                                        src={violation.snapshot_url}
                                                        alt="Violation snapshot"
                                                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-2 gap-2">
                                                {violation.metadata?.speed && (
                                                    <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-lg px-3 py-2 border border-red-700/30">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs text-gray-400 font-medium">Speed</span>
                                                            <span className="text-red-400 font-bold text-sm">
                                                                {violation.metadata.speed.toFixed(1)} <span className="text-xs">km/h</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                                {violation.vehicle_id && (
                                                    <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-lg px-3 py-2 border border-blue-700/30">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs text-gray-400 font-medium">Vehicle ID</span>
                                                            <span className="text-blue-300 font-bold text-sm">
                                                                #{violation.vehicle_id}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Confidence Badge */}
                                            {violation.confidence && (
                                                <div className="mt-2 flex items-center justify-end">
                                                    <span className="text-xs text-gray-500">
                                                        Confidence: <span className="text-green-400 font-semibold">{(violation.confidence * 100).toFixed(0)}%</span>
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-800/50 rounded-full flex items-center justify-center border-2 border-dashed border-gray-700">
                                        <AlertTriangle className="w-10 h-10 text-gray-600" />
                                    </div>
                                    <p className="text-gray-400 font-medium text-base mb-1">No violations detected</p>
                                    {!isRunning && (
                                        <p className="text-sm text-gray-500 mt-2">Start detection to monitor violations</p>
                                    )}
                                    {isRunning && (
                                        <div className="mt-4 flex items-center justify-center gap-2">
                                            <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
                                            <p className="text-sm text-gray-400">Monitoring for violations...</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
