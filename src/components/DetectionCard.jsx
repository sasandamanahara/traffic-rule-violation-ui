import React from "react";
import { CarFront, BadgeAlert, Users, HardHat } from "lucide-react";

export default function DetectionCard({ type, status }) {
    const iconMap = {
        "Vehicle Type": <CarFront className="w-6 h-6 text-blue-600" />,
        "Number Plate": <BadgeAlert className="w-6 h-6 text-purple-600" />,
        "Triple Riding": <Users className="w-6 h-6 text-red-600" />,
        "Helmet": <HardHat className="w-6 h-6 text-yellow-600" />,
    };

    return (
        <div className="flex items-center gap-4 p-4 border rounded bg-gray-50 shadow">
            <div>{iconMap[type]}</div>
            <div>
                <p className="font-semibold">{type}</p>
                <p className={status ? "text-green-600" : "text-red-600"}>
                    {status ? "Detected" : "Not Detected"}
                </p>
            </div>
        </div>
    );
}
