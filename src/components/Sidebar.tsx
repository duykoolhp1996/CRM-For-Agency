import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CheckSquare, 
  MessageSquare, 
  LogOut,
  TrendingUp,
  UserCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onLogout, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'leads', label: 'Khách hàng tiềm năng', icon: TrendingUp },
    { id: 'services', label: 'Dịch vụ', icon: Briefcase },
    { id: 'clients', label: 'Khách hàng', icon: Users },
    { id: 'projects', label: 'Dự án', icon: CheckSquare },
    { id: 'revenue', label: 'Doanh thu', icon: TrendingUp },
    { id: 'ai', label: 'Trợ lý AI', icon: MessageSquare },
  ];

  return (
    <div className={cn(
      "w-64 bg-bg-dark border-r border-white/5 h-screen flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 md:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-8">
        <h1 className="text-2xl font-black text-white flex items-center gap-3 font-display">
          <div className="w-10 h-10 bg-accent-yellow rounded-xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(239,255,51,0.2)]">
            <TrendingUp size={24} />
          </div>
          Agency
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 text-sm font-bold",
              activeTab === item.id 
                ? "bg-accent-yellow text-black shadow-[0_0_15px_rgba(239,255,51,0.1)]" 
                : "text-text-muted hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon size={20} className={cn(activeTab === item.id ? "text-black" : "text-text-muted")} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5">
        <div className="flex items-center gap-4 px-4 py-4 mb-4 bg-white/5 rounded-3xl">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full border-2 border-white/10" referrerPolicy="no-referrer" />
          ) : (
            <UserCircle className="text-text-muted" size={40} />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-white truncate">{user?.displayName}</p>
            <p className="text-[10px] text-text-muted truncate uppercase tracking-widest font-bold">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-red-400 hover:bg-red-400/10 transition-all duration-300"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
