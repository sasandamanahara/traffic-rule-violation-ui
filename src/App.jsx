import React from 'react';
import './app.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LiveFeed from './components/LiveFeed';

function App() {
  return (
    <div className="w-full flex flex-col border">
      <Header />
      <div className="main-content border-2 ">
        <Sidebar />
        <LiveFeed />
      </div>
    </div>
  );
}

export default App;
