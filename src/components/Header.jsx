import React from 'react';

export default function Header() {
    return (
        <div className="flex space-x-5 items-center justify-between mb-6 px-4 py-2 bg-gray-800 rounded-lg shadow">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
                Traffic Rules Violation Detection
            </h1>

            <div className="flex items-center space-x-3">
                <select className="bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Khulna</option>
                </select>

                <select className="bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>cam_01</option>
                </select>

                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                    Map
                </button>
            </div>
        </div>
    );
}
