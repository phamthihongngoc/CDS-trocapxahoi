import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import NotificationBell from './NotificationBell';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.hash = '/';
  };

  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case UserRole.CITIZEN:
        return 'Người dân';
      case UserRole.OFFICER:
        return 'Cán bộ';
      case UserRole.ADMIN:
        return 'Quản trị viên';
      default:
        return 'Người dùng';
    }
  };

  return (
    <header 
      className="relative text-white shadow-lg overflow-hidden"
      style={{
        backgroundImage: 'url(/img/bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay mờ màu xanh */}
      <div className="absolute inset-0 bg-blue-600/85 backdrop-blur-sm"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo và tên hệ thống */}
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold">
              🏛️
            </div>
            <div>
              <h1 className="text-xl font-bold">HỆ THỐNG TRỢ CẤP XÃ HỘI</h1>
              <p className="text-sm text-blue-100">Tỉnh Lạng Sơn</p>
            </div>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && <NotificationBell />}
            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <div className="font-medium">{user?.fullName}</div>
                  <div className="text-blue-200">{getRoleDisplayName(user!.role)}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button className="text-white p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
