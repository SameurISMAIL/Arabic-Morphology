import React, { useState } from 'react';
import './index.css';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import RootsManager from './components/RootsManager';
import PatternsManager from './components/PatternsManager';
import AVLTreeVisualizer from './components/AVLTreeVisualizer';
import HashTableVisualizer from './components/HashTableVisualizer';
import MorphologicalGenerator from './components/MorphologicalGenerator';
import MorphologicalValidator from './components/MorphologicalValidator';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'roots':
        return <RootsManager />;
      case 'patterns':
        return <PatternsManager />;
      case 'tree':
        return <AVLTreeVisualizer />;
      case 'hashtable':
        return <HashTableVisualizer />;
      case 'generator':
        return <MorphologicalGenerator />;
      case 'validator':
        return <MorphologicalValidator />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 rtl" dir="rtl">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
