import React, { useEffect, useState } from 'react';
import { FileText, Clock, CheckCircle, DollarSign, AlertTriangle, Eye } from 'lucide-react';
import Header from '../components/Header';
import NavigationHero from '../components/NavigationHero';
import Footer from '../components/Footer';
import api from '../utils/api';

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  paidApplications: number;
  totalAmount: number;
  totalComplaints: number;
}

interface RecentApplication {
  id: number;
  code: string;
  full_name: string;
  program_name: string;
  status: string;
  created_at: string;
}

const OfficerDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentApps, setRecentApps] = useState<RecentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      const [statsRes, appsRes] = await Promise.all([
        api.get('/api/dashboard/stats'),
        api.get('/api/applications?limit=5')
      ]);
      
      if (statsRes.success) {
        setStats(statsRes.stats);
      }
      
      if (appsRes.success) {
        setRecentApps(appsRes.applications.slice(0, 5));
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        setTimeout(() => {
          window.location.hash = '/login';
        }, 2000);
      } else {
        setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { label: 'Bản nháp', className: 'bg-gray-100 text-gray-700' },
      pending: { label: 'Chờ xử lý', className: 'bg-yellow-100 text-yellow-700' },
      under_review: { label: 'Đang xem xét', className: 'bg-blue-100 text-blue-700' },
      additional_info_required: { label: 'Yêu cầu bổ sung', className: 'bg-orange-100 text-orange-700' },
      approved: { label: 'Đã duyệt', className: 'bg-green-100 text-green-700' },
      rejected: { label: 'Từ chối', className: 'bg-red-100 text-red-700' },
      pending_payment: { label: 'Chờ chi trả', className: 'bg-purple-100 text-purple-700' },
      paid: { label: 'Đã chi trả', className: 'bg-teal-100 text-teal-700' },
      closed: { label: 'Đã đóng', className: 'bg-gray-100 text-gray-700' }
    };
    return badges[status as keyof typeof badges] || { label: status, className: 'bg-gray-100 text-gray-700' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <NavigationHero />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-600">Đang tải...</div>
        </div>
        <Footer />
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Tổng hồ sơ',
      value: stats?.totalApplications || 0,
      subtitle: '+2 từ tuần trước',
      icon: FileText,
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Chờ xử lý',
      value: stats?.pendingApplications || 0,
      subtitle: 'Cần xem xét',
      icon: Clock,
      gradient: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Đã duyệt',
      value: stats?.approvedApplications || 0,
      subtitle: `Tỷ lệ ${stats?.totalApplications ? Math.round((stats.approvedApplications / stats.totalApplications) * 100) : 0}%`,
      icon: CheckCircle,
      gradient: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Đã chi trả',
      value: stats?.paidApplications || 0,
      subtitle: 'Hoàn thành',
      icon: DollarSign,
      gradient: 'from-cyan-500 to-cyan-600',
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-600'
    },
    {
      title: 'Tổng chi trả',
      value: stats?.totalAmount ? `${(stats.totalAmount / 1000000).toFixed(1)}M` : '0',
      subtitle: 'VNĐ',
      icon: DollarSign,
      gradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Khiếu nại',
      value: stats?.totalComplaints || 0,
      subtitle: 'Chờ xử lý',
      icon: AlertTriangle,
      gradient: 'from-red-500 to-red-600',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    }
  ];
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <NavigationHero />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hệ thống Quản lý Trợ cấp Xã hội</h1>
              <p className="text-gray-600 mt-1">Chào mừng Trần Thị Bình - Xã Tân Phú</p>
            </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
            <button
              onClick={() => fetchData()}
              className="px-3 py-1 text-sm font-medium text-red-700 hover:text-red-900 hover:bg-red-100 rounded transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {!error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kpiCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <div 
                    key={index} 
                    className="group bg-white rounded-xl shadow-lg hover:shadow-2xl border border-gray-100 p-6 transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden relative"
                  >
                    {/* Gradient background overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                    
                    <div className="relative flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">{card.title}</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                          {card.value}
                        </p>
                        <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          {card.subtitle}
                        </p>
                      </div>
                      <div className={`${card.iconBg} rounded-2xl p-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-8 h-8 ${card.iconColor}`} />
                      </div>
                    </div>
                    
                    {/* Bottom accent line */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`}></div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Phân bố theo trạng thái</h2>
              <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Tổng: {stats?.totalApplications || 0}</div>
            </div>
            <div className="space-y-4">
              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full shadow-md"></div>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-yellow-600 transition-colors">Chờ xử lý</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{stats?.pendingApplications || 0}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats?.totalApplications ? (stats.pendingApplications / stats.totalApplications) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full shadow-md"></div>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-green-600 transition-colors">Đã duyệt</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{stats?.approvedApplications || 0}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats?.totalApplications ? (stats.approvedApplications / stats.totalApplications) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-red-500 rounded-full shadow-md"></div>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-red-600 transition-colors">Từ chối</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{stats?.rejectedApplications || 0}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats?.totalApplications ? (stats.rejectedApplications / stats.totalApplications) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Hồ sơ gần đây</h2>
              <a href="#/officer/applications" className="text-xs text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                Xem tất cả →
              </a>
            </div>
            {recentApps.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Chưa có hồ sơ nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApps.map((app) => {
                  const badge = getStatusBadge(app.status);
                  return (
                    <div key={app.id} className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-blue-50 hover:to-white border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{app.full_name}</p>
                        <p className="text-sm text-gray-600 truncate mt-1">{app.program_name}</p>
                        <p className="text-xs text-gray-400 mt-1 font-mono">{app.code}</p>
                      </div>
                      <div className="flex items-center space-x-3 ml-4">
                        <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${badge.className} shadow-sm`}>
                          {badge.label}
                        </span>
                        <button 
                          onClick={() => window.location.hash = `/officer/applications/${app.id}`}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors group-hover:scale-110 duration-300"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
          </>
        )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OfficerDashboard;
