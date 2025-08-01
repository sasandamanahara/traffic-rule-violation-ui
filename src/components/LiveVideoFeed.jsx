import React from "react";
import Webcam from "react-webcam";

const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "environment",
};

export default function LiveVideoFeed() {
    return (
        <div className="p-4 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-2">Live Video Feed</h2>
            <Webcam
                audio={false}
                height={480}
                width={640}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
            />
        </div>
    );
}
