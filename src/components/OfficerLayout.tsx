import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface OfficerLayoutProps {
  children: React.ReactNode;
}

const OfficerLayout: React.FC<OfficerLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.hash = '/login';
  };

  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case UserRole.OFFICER:
        return 'Cán bộ';
      case UserRole.ADMIN:
        return 'Quản trị viên';
      default:
        return 'Người dùng';
    }
  };

  const navigationTabs = [
    { path: '/officer/dashboard', label: 'Dashboard', icon: '' },
    { path: '/officer/applications', label: 'Hồ sơ', icon: '' },
    { path: '/officer/create-application', label: 'Tạo mới', icon: '' },
    { path: '/officer/payouts', label: 'Chi trả', icon: '' },
    { path: '/officer/complaints', label: 'Khiếu nại', icon: '' },
    { path: '/officer/reports', label: 'Báo cáo', icon: '' },
  ];

  const adminTabs = [
    { path: '/admin/users', label: 'Người dùng', icon: '' },
    { path: '/admin/settings', label: 'Hệ thống', icon: '' },
  ];

  const tabs = user?.role === UserRole.ADMIN 
    ? [...navigationTabs, ...adminTabs] 
    : navigationTabs;

  const isActiveTab = (path: string) => {
    // HashRouter uses hash instead of pathname
    const currentPath = window.location.hash.replace('#', '');
    return currentPath === path;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/attached_assets/lg_1760024752596.png" 
                alt="Logo" 
                className="h-10 w-10 object-contain"
              />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Hệ thống Quản lý Trợ cấp Xã hội</h1>
                <p className="text-xs text-gray-500">Tỉnh Lạng Sơn</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-right">
                <p className="font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.role && getRoleDisplayName(user.role)}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>

          <nav className="flex space-x-1 border-t border-gray-100 -mb-px">
            {tabs.map((tab) => (
              <a
                key={tab.path}
                href={`#${tab.path}`}
                className={`
                  flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                  ${isActiveTab(tab.path)
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2025 Hệ thống Quản lý Trợ cấp Xã hội - Tỉnh Lạng Sơn
          </p>
        </div>
      </footer>
    </div>
  );
};

export default OfficerLayout;
