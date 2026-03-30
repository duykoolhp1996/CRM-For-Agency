import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, signIn, logout } from './firebase';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Leads from './components/Leads';
import Clients from './components/Clients';
import AIAssistant from './components/AIAssistant';
import Services from './components/Services';
import Revenue from './components/Revenue';
import Projects from './components/Projects';
import Auth from './components/Auth';
import { Loader2, Menu, X } from 'lucide-react';
import { Toaster } from 'sonner';
import { cn } from './lib/utils';

const MOCK_USER = {
  uid: 'mock-user-id',
  email: 'duykoolhp1996@gmail.com',
  displayName: 'Duy Kool',
  photoURL: 'https://picsum.photos/seed/user/200/200',
} as User;

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Use real user if available, otherwise mock user for "skip login"
  const currentUser = user || MOCK_USER;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-dark">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-accent-yellow animate-spin mx-auto mb-4" />
          <p className="text-text-muted font-medium">Loading AgencyFlow...</p>
        </div>
      </div>
    );
  }

  // Removed auth check to bypass login
  // if (!user) {
  //   return <Auth onLogin={signIn} />;
  // }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'leads':
        return <Leads userId={currentUser.uid} />;
      case 'ai':
        return <AIAssistant />;
      case 'services':
        return <Services userId={currentUser.uid} />;
      case 'clients':
        return <Clients userId={currentUser.uid} />;
      case 'projects':
        return <Projects userId={currentUser.uid} />;
      case 'revenue':
        return <Revenue userId={currentUser.uid} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-bg-dark border-b border-white/5 p-4 flex items-center justify-between sticky top-0 z-40">
        <h1 className="text-xl font-black text-white flex items-center gap-2 font-display">
          <div className="w-8 h-8 bg-accent-yellow rounded-lg flex items-center justify-center text-black">
            <Menu size={20} />
          </div>
          AgencyFlow
        </h1>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }} 
        user={currentUser} 
        onLogout={logout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-45 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className={cn(
        "flex-1 p-4 md:p-8 min-h-screen transition-all duration-300 bg-bg-dark",
        "md:ml-64"
      )}>
        <div className="max-w-[1600px] mx-auto">
          {renderContent()}
        </div>
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
