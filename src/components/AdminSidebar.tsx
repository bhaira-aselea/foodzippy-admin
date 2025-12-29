import { LayoutDashboard, Users, ClipboardList, LogOut, UserCog, ClipboardCheck, FileEdit, Briefcase } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Vendor Requests', url: '/vendor-requests', icon: ClipboardList },
  { title: 'All Vendors', url: '/vendors', icon: Users },
  { title: 'Agents', url: '/agents', icon: UserCog },
  { title: 'Agent Attendance', url: '/agent-attendance', icon: ClipboardCheck },
  { title: 'Employee Attendance', url: '/employee-attendance', icon: Briefcase },
  { title: 'Edit Requests', url: '/edit-requests', icon: FileEdit },
];

export function AdminSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar flex flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">F</span>
          </div>
          <div>
            <h1 className="text-sidebar-foreground font-semibold text-lg">Foodzippy</h1>
            <p className="text-sidebar-foreground/60 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.title}>
              <NavLink
                to={item.url}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                {item.title}
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
