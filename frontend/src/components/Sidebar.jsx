import React from 'react';
import { 
  Home, 
  BookOpen, 
  Grid3X3, 
  Wand2, 
  Search,
  Menu,
  X,
  Zap
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }) {
  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: Home },
    { id: 'roots', label: 'إدارة الجذور', icon: BookOpen },
    { id: 'patterns', label: 'إدارة الأنماط', icon: Grid3X3 },
    { id: 'generator', label: 'مولد الكلمات', icon: Wand2 },
    { id: 'validator', label: 'محقق الكلمات', icon: Search },
  ];

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 gradient-primary shadow-lg">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white">
                  Arabic Morphology
                </h1>
                <p className="text-xs text-blue-100">محرك الصرف العربي</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isOpen && (
          <div className="md:hidden bg-blue-700 border-t border-blue-600 animate-slide-in">
            <div className="px-4 py-2 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
