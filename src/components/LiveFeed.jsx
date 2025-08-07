import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Settings, AlertTriangle, CheckCircle, Clock, Activity } from 'lucide-react';

export default function LiveFeed() {
    const [isCapturing, setIsCapturing] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [detectionResults, setDetectionResults] = useState(null);
    const [error, setError] = useState(null);
    const webcamRef = useRef(null);

    const captureAndSend = useCallback(async () => {
        if (!webcamRef.current) return;

        setIsCapturing(true);
        setError(null);

        try {
            const imageSrc = webcamRef.current.getScreenshot();
            setCapturedImage(imageSrc);

            // Convert base64 to blob
            const response = await fetch(imageSrc);
            const blob = await response.blob();

            // Create FormData
            const formData = new FormData();
            formData.append('image', blob, 'capture.jpg');

            // Send to API
            const apiResponse = await fetch('http://localhost:5002/predict', {
                method: 'POST',
                body: formData,
            });

            if (!apiResponse.ok) {
                throw new Error(`HTTP error! status: ${apiResponse.status}`);
            }

            const data = await apiResponse.json();
            setDetectionResults(data);
            console.log('Detection results:', data);

        } catch (error) {
            console.error('Error capturing/sending image:', error);
            setError(`Error: ${error.message}`);
        } finally {
            setIsCapturing(false);
        }
    }, []);

    const cameraSettings = [
        {
            id: 'resolution',
            name: 'Resolution',
            value: '1920x1080',
            icon: Camera
        },
        {
            id: 'fps',
            name: 'Frame Rate',
            value: '30 FPS',
            icon: Clock
        },
        {
            id: 'quality',
            name: 'Quality',
            value: 'High',
            icon: Settings
        },
        {
            id: 'status',
            name: 'Status',
            value: 'Active',
            icon: Activity
        }
    ];

    return (
        <div className="h-full p-6 overflow-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="min-w-0 flex-1">
                    <h1 className="text-3xl font-bold truncate">Live Camera Feed</h1>
                    <p className="text-gray-400 truncate">Real-time traffic violation detection</p>
                </div>
                <div className="flex items-center space-x-4 flex-shrink-0">
                    <span className="text-sm text-gray-400 whitespace-nowrap">Camera Status: Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                {/* Left Sidebar - Camera Settings */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 h-full">
                        <h3 className="text-lg font-semibold mb-4">Camera Settings</h3>
                        
                        <div className="space-y-3 mb-6">
                            {cameraSettings.map((setting) => {
                                const Icon = setting.icon;
                                return (
                                    <div key={setting.id} className="bg-gray-700 rounded-lg p-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 rounded-lg bg-blue-600 flex-shrink-0">
                                                <Icon className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-medium text-white truncate">{setting.name}</h4>
                                                <p className="text-sm text-gray-400 truncate">{setting.value}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Capture Button */}
                        <button
                            onClick={captureAndSend}
                            disabled={isCapturing}
                            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
                        >
                            {isCapturing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white flex-shrink-0"></div>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <Camera className="w-4 h-4 flex-shrink-0" />
                                    <span>Capture & Detect</span>
                                </>
                            )}
                        </button>

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

                {/* Main Content - Camera Feed & Results */}
                <div className="lg:col-span-3">
                    <div className="bg-gray-800 rounded-lg border border-gray-700 h-full overflow-auto">
                        <div className="px-6 py-4 border-b border-gray-700">
                            <h3 className="text-lg font-semibold">Live Detection</h3>
                        </div>
                        
                        <div className="p-6 h-full">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
                                {/* Camera Feed */}
                                <div className="xl:col-span-1">
                                    <div className="bg-gray-700 rounded-lg p-4 h-full">
                                        <h4 className="text-md font-medium text-white mb-4">Camera Feed</h4>
                                        <div className="relative h-full">
                                            <Webcam
                                                ref={webcamRef}
                                                screenshotFormat="image/jpeg"
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Detection Results */}
                                <div className="xl:col-span-1">
                                    <div className="bg-gray-700 rounded-lg p-4 h-full overflow-auto">
                                        <h4 className="text-md font-medium text-white mb-4">Detection Results</h4>
                                        
                                        <div className="space-y-4">
                                            {capturedImage && (
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-300 mb-2">Captured Image</h5>
                                                    <img 
                                                        src={capturedImage} 
                                                        alt="Captured" 
                                                        className="w-full rounded-lg border border-gray-600"
                                                    />
                                                </div>
                                            )}

                                            {detectionResults && (
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-300 mb-2">Detections</h5>
                                                    <div className="space-y-2">
                                                        {detectionResults.detections && detectionResults.detections.length > 0 ? (
                                                            detectionResults.detections.map((detection, index) => (
                                                                <div key={index} className="bg-gray-800 rounded-lg p-3">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center space-x-2">
                                                                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                                                            <span className="font-medium">Class {detection.class_id}</span>
                                                                        </div>
                                                                        <span className="text-sm text-gray-400">
                                                                            {(detection.confidence * 100).toFixed(1)}% confidence
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-gray-400">No violations detected</p>
                                                        )}
                                                    </div>
                                                    
                                                    {detectionResults.image_url && (
                                                        <div className="mt-4">
                                                            <h5 className="text-sm font-medium text-gray-300 mb-2">Processed Image</h5>
                                                            <img 
                                                                src={detectionResults.image_url} 
                                                                alt="Processed" 
                                                                className="w-full rounded-lg border border-gray-600"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {!detectionResults && !error && (
                                                <div className="text-gray-400 text-center py-8">
                                                    <p>Click "Capture & Detect" to analyze the camera feed</p>
                                                </div>
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
