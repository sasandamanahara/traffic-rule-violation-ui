import React from 'react';
import Sidebar from '../components/Sidebar';
import LiveFeed from '../components/LiveFeed';

export default function Dashboard() {
    return (
        <div className="flex h-screen bg-gray-900 text-white">
            <Sidebar />
            <div className="flex-1 p-4">
                <h1 className="text-3xl font-bold mb-4">Traffic Rules Violation Detection</h1>
                <LiveFeed />
            </div>
        </div>
    );
}
