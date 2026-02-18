
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  PlusCircle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavItem = ({ id, label, icon: Icon, indent = false }: any) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center px-4 py-2.5 text-sm font-medium transition-colors rounded-lg mb-1 ${
        activeTab === id 
          ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
          : 'text-slate-600 hover:bg-slate-100'
      } ${indent ? 'ml-6 w-[calc(100%-1.5rem)]' : ''}`}
    >
      <Icon className="w-4 h-4 mr-3" />
      {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar for Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center h-16 px-6 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg insta-gradient flex items-center justify-center text-white mr-2">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">InstaForge</span>
          </div>

          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <div className="mb-4 text-xs font-semibold text-slate-400 uppercase tracking-wider px-4">
              Core Operations
            </div>
            <NavItem id="dashboard" label="Creation Hub" icon={LayoutDashboard} />
            
            <div className="mt-6 mb-2">
              <button 
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-3" />
                  Account
                </div>
                {isAccountMenuOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              
              {isAccountMenuOpen && (
                <div className="mt-1 space-y-1">
                  <NavItem id="successful" label="Successful" icon={CheckCircle2} indent />
                </div>
              )}
            </div>

            <div className="mt-auto pt-10">
              <NavItem id="settings" label="Settings" icon={Settings} />
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8">
          <button 
            className="lg:hidden p-2 text-slate-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
          <div className="flex items-center ml-auto space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-medium text-slate-500">SERVER ONLINE</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
