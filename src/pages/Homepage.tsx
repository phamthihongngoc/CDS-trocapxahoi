import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import type { UserRole as UserRoleType } from '../types';

type QuickAction = {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  roles: UserRoleType[];
};

const Homepage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const quickActions: QuickAction[] = [
    {
      title: 'Đăng ký hỗ trợ',
      description: 'Gửi hồ sơ đăng ký các chương trình hỗ trợ xã hội',
      icon: '📝',
      href: '/apply',
      color: 'bg-blue-500 hover:bg-blue-600',
      roles: [UserRole.CITIZEN]
    },
    {
      title: 'Tra cứu hồ sơ',
      description: 'Kiểm tra tình trạng hồ sơ đã nộp',
      icon: '🔍',
      href: '/my-applications',
      color: 'bg-green-500 hover:bg-green-600',
      roles: [UserRole.CITIZEN]
    },
    {
      title: 'Gửi đơn khiếu nại',
      description: 'Gửi khiếu nại, phản ánh về dịch vụ hỗ trợ',
      icon: '📢',
      href: '/create-complaint',
      color: 'bg-yellow-500 hover:bg-yellow-600',
      roles: [UserRole.CITIZEN]
    },
    {
      title: 'Quản lý hồ sơ',
      description: 'Xử lý và phê duyệt hồ sơ',
      icon: '📋',
      href: '/manage',
      color: 'bg-purple-500 hover:bg-purple-600',
      roles: [UserRole.OFFICER, UserRole.ADMIN]
    },
    {
      title: 'Thống kê báo cáo',
      description: 'Xem báo cáo thống kê hệ thống',
      icon: '📊',
      href: '/statistics',
      color: 'bg-orange-500 hover:bg-orange-600',
      roles: [UserRole.OFFICER, UserRole.ADMIN]
    },
    {
      title: 'Quản lý chương trình',
      description: 'Tạo và quản lý các chương trình hỗ trợ',
      icon: '🎯',
      href: '/programs',
      color: 'bg-red-500 hover:bg-red-600',
      roles: [UserRole.OFFICER, UserRole.ADMIN]
    },
    {
      title: 'Quản trị hệ thống',
      description: 'Quản lý người dùng và cấu hình hệ thống',
      icon: '⚙️',
      href: '/admin',
      color: 'bg-gray-500 hover:bg-gray-600',
      roles: [UserRole.ADMIN]
    }
  ];

  const filteredActions = quickActions.filter(action => 
    !isAuthenticated || action.roles.includes(user!.role)
  );

  const news = [
    {
      id: 1,
      title: 'Thông báo về chính sách hỗ trợ người khuyết tật năm 2024',
      summary: 'UBND tỉnh Lạng Sơn ban hành quy định mới về mức hỗ trợ cho người khuyết tật từ ngày 1/10/2024...',
      date: '15/09/2024',
      category: 'Chính sách',
      isNew: true
    },
    {
      id: 2,
      title: 'Hướng dẫn nộp hồ sơ trợ cấp xã hội trực tuyến',
      summary: 'Để thuận tiện cho người dân, hệ thống đã được cập nhật với giao diện mới, dễ sử dụng hơn...',
      date: '10/09/2024',
      category: 'Hướng dẫn',
      isNew: true
    },
    {
      id: 3,
      title: 'Kết quả thực hiện chương trình giảm nghèo quý III/2024',
      summary: 'Tỉnh Lạng Sơn đã hỗ trợ thành công 1,250 hộ gia đình thoát nghèo trong quý III năm 2024...',
      date: '05/09/2024',
      category: 'Thông báo',
      isNew: false
    }
  ];

  const programs = [
    {
      name: 'Trợ cấp người khuyết tật',
      description: 'Hỗ trợ sinh hoạt phí cho người khuyết tật đặc biệt nặng',
      amount: '1,000,000 VNĐ/tháng',
      icon: '♿'
    },
    {
      name: 'Hỗ trợ hộ nghèo',
      description: 'Hỗ trợ các hộ gia đình thuộc diện nghèo, cận nghèo',
      amount: '500,000 VNĐ/tháng',
      icon: '🏠'
    },
    {
      name: 'Trợ cấp trẻ mồ côi',
      description: 'Chăm sóc và nuôi dưỡng trẻ em mất cha mẹ',
      amount: '800,000 VNĐ/tháng',
      icon: '👶'
    },
    {
      name: 'Chăm sóc người cao tuổi',
      description: 'Hỗ trợ chăm sóc người cao tuổi không có người thân',
      amount: '700,000 VNĐ/tháng',
      icon: '👴'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section 
        className={`relative text-white overflow-hidden ${isAuthenticated ? 'py-4' : 'py-8'}`}
        style={{
          backgroundImage: 'url(/img/bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay màu xanh gradient với độ trong suốt thấp hơn */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 to-blue-800/50 backdrop-blur-[1px]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {!isAuthenticated && (
              <>
                <h1 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-lg">
                  Hệ thống trợ cấp xã hội tỉnh Lạng Sơn
                </h1>
                <p className="text-lg md:text-xl mb-6 text-blue-50 drop-shadow-md">
                  Kết nối - Hỗ trợ - Phát triển cộng đồng
                </p>
              </>
            )}

            {isAuthenticated && (
              <div className="py-2"></div>
            )}

            {!isAuthenticated && (
              <div className="max-w-xl mx-auto bg-white/20 backdrop-blur-md rounded-lg p-4 mb-5 shadow-2xl border border-white/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold drop-shadow-lg">2,450</div>
                    <div className="text-sm text-blue-50 drop-shadow-md">Hộ gia đình được hỗ trợ</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold drop-shadow-lg">15</div>
                    <div className="text-sm text-blue-50 drop-shadow-md">Chương trình hỗ trợ</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold drop-shadow-lg">98%</div>
                    <div className="text-sm text-blue-50 drop-shadow-md">Hài lòng dịch vụ</div>
                  </div>
                </div>
              </div>
            )}

            {/* Menu Navigation Buttons */}
            <div className={`flex flex-wrap justify-center gap-2 ${isAuthenticated ? 'mb-2' : 'mb-4'}`}>
              {!isAuthenticated && (
                <a 
                  href="#/login" 
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 border border-white/30 hover:border-white/50 hover:scale-105 hover:shadow-lg"
                >
                  🔐 Đăng nhập
                </a>
              )}
              
              {isAuthenticated && user?.role === UserRole.CITIZEN && (
                <>
                  <a 
                    href="#/apply" 
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 border border-white/30 hover:border-white/50 hover:scale-105 hover:shadow-lg"
                  >
                    📝 Đăng ký hỗ trợ
                  </a>
                  <a 
                    href="#/my-applications" 
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 border border-white/30 hover:border-white/50 hover:scale-105 hover:shadow-lg"
                  >
                    🔍 Hồ sơ của tôi
                  </a>
                  <a 
                    href="#/create-complaint" 
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 border border-white/30 hover:border-white/50 hover:scale-105 hover:shadow-lg"
                  >
                    📢 Gửi đơn khiếu nại
                  </a>
                </>
              )}
              
              {isAuthenticated && (user?.role === UserRole.OFFICER || user?.role === UserRole.ADMIN) && (
                <>
                  <a 
                    href="#/manage" 
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 border border-white/30 hover:border-white/50 hover:scale-105 hover:shadow-lg"
                  >
                    📋 Quản lý hồ sơ
                  </a>
                  <a 
                    href="#/statistics" 
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 border border-white/30 hover:border-white/50 hover:scale-105 hover:shadow-lg"
                  >
                    📊 Thống kê
                  </a>
                  <a 
                    href="#/programs" 
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 border border-white/30 hover:border-white/50 hover:scale-105 hover:shadow-lg"
                  >
                    🎯 Chương trình
                  </a>
                </>
              )}
              
              {isAuthenticated && user?.role === UserRole.ADMIN && (
                <a 
                  href="#/admin" 
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 border border-white/30 hover:border-white/50 hover:scale-105 hover:shadow-lg"
                >
                  ⚙️ Quản trị
                </a>
              )}
              
              <a 
                href="#/programs-info" 
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 border border-white/30 hover:border-white/50 hover:scale-105 hover:shadow-lg"
              >
                📚 Chính sách
              </a>
              <a 
                href="#/contact" 
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 border border-white/30 hover:border-white/50 hover:scale-105 hover:shadow-lg"
              >
                📞 Liên hệ
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      {isAuthenticated && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
              Thao tác nhanh
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {filteredActions.map((action, index) => (
                <a
                  key={index}
                  href={`#${action.href}`}
                  className={`${action.color} text-white p-6 rounded-lg shadow-lg transition-transform hover:scale-105`}
                >
                  <div className="text-4xl mb-4">{action.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{action.title}</h3>
                  <p className="text-sm opacity-90">{action.description}</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Programs Overview */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Các chương trình hỗ trợ chính
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {programs.map((program, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4 text-center">{program.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">{program.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{program.description}</p>
                <div className="text-blue-600 font-semibold">{program.amount}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a
              href="#/programs-info"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Xem tất cả chương trình
            </a>
          </div>
        </div>
      </section>

      {/* News & Updates */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Tin tức & Thông báo
          </h2>
          <div className="max-w-4xl mx-auto space-y-6">
            {news.map((item) => (
              <div key={item.id} className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        {item.category}
                      </span>
                      {item.isNew && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                          Mới
                        </span>
                      )}
                      <span className="text-gray-500 text-sm">{item.date}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">{item.title}</h3>
                    <p className="text-gray-600">{item.summary}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a
              href="#/news"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Xem tất cả tin tức →
            </a>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-12 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-gray-800">
              Cần hỗ trợ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-4">📞</div>
                <h3 className="text-lg font-semibold mb-2">Hotline</h3>
                <p className="text-gray-600">1900-1234</p>
                <p className="text-sm text-gray-500">24/7 hỗ trợ</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-4">📧</div>
                <h3 className="text-lg font-semibold mb-2">Email</h3>
                <p className="text-gray-600">baotro@langson.gov.vn</p>
                <p className="text-sm text-gray-500">Phản hồi trong 24h</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-4">📍</div>
                <h3 className="text-lg font-semibold mb-2">Địa chỉ</h3>
                <p className="text-gray-600">UBND Tỉnh Lạng Sơn</p>
                <p className="text-sm text-gray-500">Giờ hành chính</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;