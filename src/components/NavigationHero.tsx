import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

const NavigationHero: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <section 
      className="sticky top-0 z-50 text-white py-10 mb-2 shadow-lg"
      style={{
        backgroundImage: 'url(/img/bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay màu xanh gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 to-blue-800/50 backdrop-blur-[1px]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Menu Navigation Buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            {isAuthenticated && user?.role === UserRole.CITIZEN && (
              <>
                <a 
                  href="#/apply" 
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 border border-white/30 hover:border-white/50 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                >
                  <span>📝</span>
                  <span>Đăng ký hỗ trợ</span>
                </a>
                <a 
                  href="#/my-applications" 
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 border border-white/30 hover:border-white/50 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                >
                  <span>🔍</span>
                  <span>Hồ sơ của tôi</span>
                </a>
                <a 
                  href="#/create-complaint" 
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 border border-white/30 hover:border-white/50 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                >
                  <span>📢</span>
                  <span>Gửi đơn khiếu nại</span>
                </a>
              </>
            )}
            
            {isAuthenticated && (user?.role === UserRole.OFFICER || user?.role === UserRole.ADMIN) && (
              <>
                <a 
                  href="#/officer/dashboard" 
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 border border-white/30 hover:border-white/50 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                >
                  <span>📊</span>
                  <span>Thống kê</span>
                </a>
                <a 
                  href="#/officer/applications" 
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 border border-white/30 hover:border-white/50 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                >
                  <span>📋</span>
                  <span>Quản lý hồ sơ</span>
                </a>
                <a 
                  href="#/officer/payouts" 
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 border border-white/30 hover:border-white/50 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                >
                  <span>💰</span>
                  <span>Chi trả</span>
                </a>
                <a 
                  href="#/officer/complaints" 
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 border border-white/30 hover:border-white/50 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                >
                  <span>📢</span>
                  <span>Khiếu nại</span>
                </a>
                <a 
                  href="#/officer/reports" 
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 border border-white/30 hover:border-white/50 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                >
                  <span>📈</span>
                  <span>Báo cáo</span>
                </a>
              </>
            )}

            {isAuthenticated && user?.role === UserRole.ADMIN && (
              <>
                <a 
                  href="#/admin/programs" 
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 border border-white/30 hover:border-white/50 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                >
                  <span>🎯</span>
                  <span>Chương trình</span>
                </a>
                <a 
                  href="#/admin/users" 
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 border border-white/30 hover:border-white/50 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                >
                  <span>👥</span>
                  <span>Người dùng</span>
                </a>
                <a 
                  href="#/admin/audit-logs" 
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 border border-white/30 hover:border-white/50 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                >
                  <span>📜</span>
                  <span>Nhật ký</span>
                </a>
                <a 
                  href="#/admin/notifications" 
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 border border-white/30 hover:border-white/50 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                >
                  <span>🔔</span>
                  <span>Thông báo</span>
                </a>
                <a 
                  href="#/admin/settings" 
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 border border-white/30 hover:border-white/50 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                >
                  <span>⚙️</span>
                  <span>Cài đặt</span>
                </a>
              </>
            )}
            
            <a 
              href="#/programs-info" 
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 border border-white/30 hover:border-white/50 hover:scale-105 hover:shadow-lg flex items-center gap-2"
            >
              <span>📚</span>
              <span>Chính sách</span>
            </a>
            <a 
              href="#/contact" 
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 border border-white/30 hover:border-white/50 hover:scale-105 hover:shadow-lg flex items-center gap-2"
            >
              <span>📞</span>
              <span>Liên hệ</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NavigationHero;
