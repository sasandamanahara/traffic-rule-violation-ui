import React, { useState, useRef, useEffect } from 'react';
import { Upload, Play, Pause, Square, Download, AlertTriangle, CheckCircle, FileText, Clock } from 'lucide-react';

export default function VideoDetection() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [detectionStats, setDetectionStats] = useState({
        totalFrames: 0,
        processedFrames: 0,
        violationsDetected: 0,
        processingTime: 0
    });
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [currentFrame, setCurrentFrame] = useState(0);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('video/')) {
            setSelectedFile(file);
            setError(null);
            setResults(null);
            setDetectionStats({
                totalFrames: 0,
                processedFrames: 0,
                violationsDetected: 0,
                processingTime: 0
            });
        } else {
            setError('Please select a valid video file');
        }
    };

    const processVideo = async () => {
        if (!selectedFile) {
            setError('Please select a video file first');
            return;
        }

        setIsProcessing(true);
        setError(null);
        setProcessingProgress(0);

        const formData = new FormData();
        formData.append('video', selectedFile);

        try {
            console.log('Starting video processing...');
            
            // Simulate processing progress
            const progressInterval = setInterval(() => {
                setProcessingProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 10;
                });
            }, 500);

                               const response = await fetch('http://localhost:5000/process-video', {
                method: 'POST',
                body: formData
            });

            clearInterval(progressInterval);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Video processing results:', data);

            setResults(data);
            setDetectionStats({
                totalFrames: data.totalFrames || 0,
                processedFrames: data.processedFrames || 0,
                violationsDetected: data.violationsDetected || 0,
                processingTime: data.processingTime || 0
            });
            setProcessingProgress(100);

        } catch (error) {
            console.error('Video processing failed:', error);
            setError(`Error: ${error.message}`);
            setProcessingProgress(0);
        } finally {
            setIsProcessing(false);
        }
    };

    const resetProcessing = () => {
        setSelectedFile(null);
        setResults(null);
        setError(null);
        setProcessingProgress(0);
        setDetectionStats({
            totalFrames: 0,
            processedFrames: 0,
            violationsDetected: 0,
            processingTime: 0
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const processingSettings = [
        {
            id: 'quality',
            name: 'Processing Quality',
            value: 'High',
            icon: FileText
        },
        {
            id: 'speed',
            name: 'Processing Speed',
            value: 'Standard',
            icon: Clock
        },
        {
            id: 'format',
            name: 'Output Format',
            value: 'MP4',
            icon: Upload
        }
    ];

    // Draw bounding boxes on the canvas for the current frame
    useEffect(() => {
        if (!results || !results.violations || !videoRef.current || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        const video = videoRef.current;
        // Find violations for the current frame
        const frameViolations = results.violations.filter(v => v.frame === currentFrame);
        frameViolations.forEach(v => {
            const [x1, y1, x2, y2] = v.bbox;
            ctx.strokeStyle = v.type === 'Helmet' ? 'yellow' : v.type === 'Triple Riding' ? 'red' : 'blue';
            ctx.lineWidth = 3;
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
            ctx.font = '16px Arial';
            ctx.fillStyle = ctx.strokeStyle;
            ctx.fillText(`${v.type} (${(v.confidence * 100).toFixed(1)}%)`, x1, y1 - 5);
        });
    }, [results, currentFrame]);

    // Update current frame as video plays
    const handleTimeUpdate = () => {
        if (!videoRef.current || !results) return;
        const video = videoRef.current;
        const fps = results.totalFrames / (video.duration || 1);
        setCurrentFrame(Math.floor(video.currentTime * fps));
    };

    return (
        <div className="h-full p-6 overflow-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Video Detection</h1>
                    <p className="text-gray-400">Upload and analyze traffic violation videos</p>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-400">Processing Status: Ready</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full">
                {/* Left Sidebar - Upload & Settings */}
                <div className="md:col-span-1">
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 h-full">
                        <h3 className="text-lg font-semibold mb-4">Video Upload</h3>
                        
                        {/* File Upload Section */}
                        <div className="mb-6">
                            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                <div className="text-white mb-4">
                                    <p className="text-lg font-medium">Upload Traffic Video</p>
                                    <p className="text-gray-400 text-sm">Support for MP4, AVI, MOV files</p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="video/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="video-upload"
                                />
                                <label
                                    htmlFor="video-upload"
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 cursor-pointer inline-block"
                                >
                                    Choose Video File
                                </label>
                            </div>
                            
                            {selectedFile && (
                                <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                            <div>
                                                <p className="text-white font-medium">{selectedFile.name}</p>
                                                <p className="text-gray-400 text-sm">
                                                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={resetProcessing}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Processing Settings */}
                        <div className="mb-6">
                            <h4 className="text-md font-medium text-white mb-3">Processing Settings</h4>
                            <div className="space-y-3">
                                {processingSettings.map((setting) => {
                                    const Icon = setting.icon;
                                    return (
                                        <div key={setting.id} className="bg-gray-700 rounded-lg p-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 rounded-lg bg-blue-600">
                                                    <Icon className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <h5 className="font-medium text-white">{setting.name}</h5>
                                                    <p className="text-sm text-gray-400">{setting.value}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Processing Controls */}
                        <div className="mb-6">
                            <button
                                onClick={processVideo}
                                disabled={!selectedFile || isProcessing}
                                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Processing Video...</span>
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4" />
                                        <span>Start Detection</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Progress Bar */}
                        {isProcessing && (
                            <div className="mb-6">
                                <div className="flex justify-between text-sm text-gray-400 mb-2">
                                    <span>Processing Video</span>
                                    <span>{processingProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${processingProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Error Display */}
                        {error && (
                            <div className="p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    <span><strong>Error:</strong> {error}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content - Results */}
                <div className="md:col-span-3">
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 h-full overflow-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-semibold">Detection Results</h3>
                                <p className="text-gray-400">Video analysis and violation detection</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center space-x-2">
                                    <Download className="w-4 h-4" />
                                    <span>Download Report</span>
                                </button>
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                            {results ? (
                                <>
                                    {/* Detection Statistics */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                        <div className="bg-gray-700 rounded-lg p-4">
                                            <h4 className="text-gray-400 text-sm font-medium">Total Frames</h4>
                                            <p className="text-2xl font-bold text-white">{detectionStats.totalFrames}</p>
                                        </div>
                                        <div className="bg-gray-700 rounded-lg p-4">
                                            <h4 className="text-gray-400 text-sm font-medium">Processed Frames</h4>
                                            <p className="text-2xl font-bold text-white">{detectionStats.processedFrames}</p>
                                        </div>
                                        <div className="bg-gray-700 rounded-lg p-4">
                                            <h4 className="text-gray-400 text-sm font-medium">Violations Detected</h4>
                                            <p className="text-2xl font-bold text-red-400">{detectionStats.violationsDetected}</p>
                                        </div>
                                    </div>

                                    {/* Additional Stats */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="bg-gray-700 rounded-lg p-4">
                                            <h4 className="text-gray-400 text-sm font-medium">Processing Time</h4>
                                            <p className="text-2xl font-bold text-white">{detectionStats.processingTime}s</p>
                                        </div>
                                        <div className="bg-gray-700 rounded-lg p-4">
                                            <h4 className="text-gray-400 text-sm font-medium">Detection Rate</h4>
                                            <p className="text-2xl font-bold text-blue-400">
                                                {detectionStats.totalFrames > 0 
                                                    ? ((detectionStats.processedFrames / detectionStats.totalFrames) * 100).toFixed(1)
                                                    : 0}%
                                            </p>
                                        </div>
                                    </div>

                                    {/* Detection Results */}
                                    <div className="bg-gray-700 rounded-lg p-6">
                                        <h4 className="text-lg font-semibold mb-4">Violation Details</h4>
                                        {results.violations && results.violations.length > 0 ? (
                                            <div className="space-y-4">
                                                {results.violations.map((violation, index) => (
                                                    <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                                                                    {index + 1}
                                                                </div>
                                                                <div>
                                                                    <p className="text-white font-medium">
                                                                        {violation.type} Violation
                                                                    </p>
                                                                    <p className="text-gray-400 text-sm">
                                                                        Frame: {violation.frame}, Time: {violation.timestamp}s
                                                                    </p>
                                                                    <p className="text-gray-400 text-sm">
                                                                        Confidence: {(violation.confidence * 100).toFixed(2)}%
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-600 text-red-100">
                                                                    {violation.type}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-400">No violations detected in this video.</p>
                                        )}
                                    </div>
                                    {/* Video Player with Canvas Overlay */}
                                    <div className="relative w-full max-w-2xl mx-auto mb-6">
                                        {selectedFile && (
                                            <>
                                                <video
                                                    ref={videoRef}
                                                    src={URL.createObjectURL(selectedFile)}
                                                    width="640"
                                                    height="360"
                                                    controls
                                                    onTimeUpdate={handleTimeUpdate}
                                                    style={{ display: 'block' }}
                                                />
                                                <canvas
                                                    ref={canvasRef}
                                                    width={640}
                                                    height={360}
                                                    style={{
                                                        position: 'absolute',
                                                        left: 0,
                                                        top: 0,
                                                        pointerEvents: 'none',
                                                    }}
                                                />
                                            </>
                                        )}
                                    </div>
                                    {/* Snapshot Cards Grid */}
                                    {results && results.violations && results.violations.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                                            {results.violations.map((violation, idx) => (
                                                <div key={idx} className="bg-gray-900 rounded-lg shadow border border-gray-700 p-4 flex flex-col items-center">
                                                    <img
                                                        src={violation.snapshot_url}
                                                        alt={`Snapshot frame ${violation.frame}`}
                                                        className="w-full h-40 object-cover rounded mb-3 border border-gray-600"
                                                        style={{ maxWidth: 320 }}
                                                    />
                                                    <div className="w-full">
                                                        <p className="text-white font-semibold mb-1">
                                                            {violation.type} Violation
                                                            {violation.type === 'Number Plate' && (
                                                                <span className="ml-2 inline-block px-2 py-0.5 text-xs bg-green-700 text-white rounded">Number Plate</span>
                                                            )}
                                                        </p>
                                                        <p className="text-gray-400 text-sm mb-1">Frame: {violation.frame}, Time: {violation.timestamp}s</p>
                                                        <p className="text-gray-400 text-sm mb-1">Confidence: {(violation.confidence * 100).toFixed(2)}%</p>
                                                        {violation.type === 'Number Plate' && (
                                                            <p className="text-blue-400 text-sm mb-1">Plate: {violation.plate_text || <span className='italic text-gray-500'>[not extracted]</span>}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-gray-400 text-center py-8">
                                    <p>Upload a video and start detection to see results</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 