import React from 'react';
import Sidebar from './Sidebar';
import './Home.css';
import Workspace from './Workspace';

const Home: React.FC = () => {
  return (
    <div className="home-layout">
      <Sidebar activeTab="workspace" onTabClick={() => {}} />
      <main className="main-content">
        <h1 className="atlas-title">Research Atlas</h1>
        <Workspace />
      </main>
    </div>
  );
};

export default Home;
