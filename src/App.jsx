import React, { useState } from 'react';
import './App.css';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import LiveFeed from './components/LiveFeed';
import VideoDetection from './components/VideoDetection';
import ViolationList from './components/ViolationList';
import CameraMap from './components/CameraMap';
import Reports from './components/Reports';
import Settings from './components/Settings';
import CameraSetup from './components/DrawingLanes';
import { useAuth } from './contexts/AuthContext';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'live-feed':
        return <LiveFeed />;
      case 'video-detection':
        return <VideoDetection setActiveTab={setActiveTab} setSelectedVideo={setSelectedVideo}/>;
      case 'violations':
        return <ViolationList />;
      case 'map':
        return <CameraMap />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      case 'camera-setup':
        return <CameraSetup selectedVideo={selectedVideo}/>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;
