
import React, { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Book, BarChart2, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/diary', icon: Book, label: 'Diary' },
    { path: '/analytics', icon: BarChart2, label: 'Analytics' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
];

const Sidebar: React.FC = () => {
    const { logout, settings } = useAppContext();
    const location = useLocation();

    return (
        <aside className="hidden md:flex flex-col w-64 bg-black/30 backdrop-blur-xl border-r border-border p-4">
            <div className="text-2xl font-bold mb-10 px-2">MyDiary</div>
            <nav className="flex flex-col space-y-2 flex-grow">
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200 ${
                                isActive ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/50 text-muted-foreground'
                            }`
                        }
                    >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
             <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-3 p-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full"></div>
                    <div>
                        <div className="font-semibold">{settings.userName}</div>
                        <div className="text-xs text-muted-foreground">Premium User</div>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-red-400 transition-all duration-200"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

const BottomNav: React.FC = () => {
    const location = useLocation();
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur-xl border-t border-border p-2 flex justify-around">
            {navItems.map(item => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                        `flex flex-col items-center p-2 rounded-md transition-all duration-200 ${
                            isActive ? 'text-primary' : 'text-muted-foreground'
                        }`
                    }
                >
                    <item.icon className="h-6 w-6" />
                </NavLink>
            ))}
        </nav>
    );
};

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { settings } = useAppContext();
    return (
        <div 
          className="flex h-screen w-screen overflow-hidden bg-background font-sans"
          style={{ backgroundImage: settings.wallpaper ? `url(${settings.wallpaper})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-black/60 z-0"></div>
            <div className="relative flex h-full w-full">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
                    {children}
                </main>
                <BottomNav />
            </div>
        </div>
    );
};

export default Layout;
