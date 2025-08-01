import React from "react";
import LiveVideoFeed from "../components/LiveVideoFeed";
import DetectionCard from "../components/DetectionCard";

export default function Dashboard() {
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">🚦 Traffic Violation Dashboard</h1>

            <LiveVideoFeed />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetectionCard type="Vehicle Type" status={true} />
                <DetectionCard type="Number Plate" status={true} />
                <DetectionCard type="Triple Riding" status={false} />
                <DetectionCard type="Helmet" status={false} />
            </div>
        </div>
    );
}
