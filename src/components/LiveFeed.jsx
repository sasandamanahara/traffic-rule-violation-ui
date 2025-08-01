import React from 'react';
import Webcam from 'react-webcam';

export default function LiveFeed() {
    return (
        <div className="live-feed">
            <Webcam width="100%" height="100%" />

        </div>
    );
}
