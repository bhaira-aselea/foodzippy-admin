import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, ClipboardList, LogOut, UserCog, ClipboardCheck, FileEdit, Briefcase, Settings, Store } from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Vendors Request', url: '/vendor-requests', icon: ClipboardList },
  { title: 'All Vendors', url: '/vendors', icon: Users },
  { title: 'Vendor Types', url: '/vendor-types', icon: Store },
  { title: 'Vendor Form Builder', url: '/vendor-form-builder', icon: Settings },
  { title: 'Agents', url: '/agents', icon: UserCog },
  { title: 'Agent Attendance', url: '/agent-attendance', icon: ClipboardCheck },
  { title: 'Employee Attendance', url: '/employee-attendance', icon: Briefcase },
  { title: 'Edit Requests', url: '/edit-requests', icon: FileEdit, showBadge: true },
];

export function AdminSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadEditRequestsCount, setUnreadEditRequestsCount] = useState(0);

  // Fetch unread edit requests count
  const fetchUnreadCount = async () => {
    try {
      const response = await api.getUnreadEditRequestsCount();
      if (response.success) {
        setUnreadEditRequestsCount(response.count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Mark as seen when navigating to edit requests page
  useEffect(() => {
    if (location.pathname === '/edit-requests' && unreadEditRequestsCount > 0) {
      api.markEditRequestsAsSeen().then(() => {
        setUnreadEditRequestsCount(0);
      }).catch(console.error);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-64 min-h-screen bg-[#FF263A] text-white flex flex-col border-r border-[#FF263A]">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex flex-col items-center gap-2">
          <img 
            src="/foodzippy-logo.png" 
            alt="Foodzippy Logo" 
            className="h-40 w-auto object-contain"
          />
          <p className="text-white text-sm font-medium">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.title}>
              <NavLink
                to={item.url}
                style={({ isActive }) => 
                  isActive ? { backgroundColor: '#FF263A', color: 'white' } : {}
                }
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    !isActive && 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                {item.title}
                {item.showBadge && unreadEditRequestsCount > 0 && (
                  <span className="ml-auto bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                    {unreadEditRequestsCount}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium w-full text-sidebar-foreground/80 hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
