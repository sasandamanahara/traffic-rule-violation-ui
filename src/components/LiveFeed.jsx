import React, { useRef, useState } from 'react';
import Webcam from "react-webcam";

const LiveVideoFeed = () => {
    const webcamRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [detectionImageUrl, setDetectionImageUrl] = useState(null);
    const [detections, setDetections] = useState([]);

    const captureAndSend = async () => {
        if (!webcamRef.current) return;

        const imageSrc = webcamRef.current.getScreenshot();

        const blob = await fetch(imageSrc).then(res => res.blob());
        const formData = new FormData();
        formData.append("image", blob, "capture.jpg");

        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/predict", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            setDetectionImageUrl(data.image_url);
            setDetections(data.detections);
        } catch (error) {
            console.error("Prediction failed:", error);
        }
        setLoading(false);
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-2">Live Detection</h2>
            <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="rounded shadow" />
            <button
                onClick={captureAndSend}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                disabled={loading}
            >
                {loading ? "Processing..." : "Capture & Predict"}
            </button>

            {detectionImageUrl && (
                <div className="mt-4">
                    <h3 className="font-medium mb-1">Detected Output</h3>
                    <img src={detectionImageUrl} alt="Detected" className="rounded shadow" />
                    <ul className="mt-2 list-disc pl-5">
                        {detections.map((det, index) => (
                            <li key={index}>
                                Class ID: {det.class_id}, Confidence: {(det.confidence * 100).toFixed(2)}%
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default LiveVideoFeed;
