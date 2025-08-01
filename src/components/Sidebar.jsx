import React from 'react';
import ViolationList from './ViolationList';

export default function Sidebar() {
    return (
        <div className="sidebar">
            <p><strong>Camera ID:</strong> cam_01</p>
            <p><strong>Address:</strong> Fulbarigate</p>
            <p><strong>Total Records:</strong> 0</p>

            <div className="tabs">
                <button>Violations</button>
                <button>Search Result</button>
            </div>

            <ViolationList />

            <div className="sidebar-buttons">
                <button>Search</button>
                <button>Refresh</button>
                <button>Clear</button>
            </div>
        </div>
    );
}
