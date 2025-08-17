import React, { useState } from 'react';
import './App.css';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import LiveFeed from './components/LiveFeed';
import VideoDetection from './components/VideoDetection';
import ViolationList from './components/ViolationList';
import CameraMap from './components/CameraMap';
import Reports from './components/Reports';
import Settings from './components/Settings';
import CameraSetup from './components/DrawingLanes';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedVideo, setSelectedVideo] = useState(null);

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
