import React, { useEffect, useState } from 'react';
import { FileText, Clock, CheckCircle, DollarSign, AlertTriangle, Eye } from 'lucide-react';
import OfficerLayout from '../components/OfficerLayout';
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
      pending: { label: 'Chờ xử lý', className: 'bg-yellow-100 text-yellow-700' },
      approved: { label: 'Đã duyệt', className: 'bg-green-100 text-green-700' },
      rejected: { label: 'Từ chối', className: 'bg-red-100 text-red-700' },
      under_review: { label: 'Đang xem xét', className: 'bg-blue-100 text-blue-700' }
    };
    return badges[status as keyof typeof badges] || { label: status, className: 'bg-gray-100 text-gray-700' };
  };

  if (loading) {
    return (
      <OfficerLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600">Đang tải...</div>
        </div>
      </OfficerLayout>
    );
  }

  const kpiCards = [
    {
      title: 'Tổng hồ sơ',
      value: stats?.totalApplications || 0,
      subtitle: '+2 từ tuần trước',
      icon: FileText,
      iconColor: 'text-gray-600'
    },
    {
      title: 'Chờ xử lý',
      value: stats?.pendingApplications || 0,
      subtitle: 'Cần xem xét',
      icon: Clock,
      iconColor: 'text-orange-600'
    },
    {
      title: 'Đã duyệt',
      value: stats?.approvedApplications || 0,
      subtitle: `Tỷ lệ ${stats?.totalApplications ? Math.round((stats.approvedApplications / stats.totalApplications) * 100) : 0}%`,
      icon: CheckCircle,
      iconColor: 'text-green-600'
    },
    {
      title: 'Đã chi trả',
      value: stats?.paidApplications || 0,
      subtitle: 'Hoàn thành',
      icon: DollarSign,
      iconColor: 'text-blue-600'
    },
    {
      title: 'Tổng chi trả',
      value: stats?.totalAmount ? `${(stats.totalAmount / 1000000).toFixed(1)}M` : '0',
      subtitle: 'VNĐ',
      icon: DollarSign,
      iconColor: 'text-purple-600'
    },
    {
      title: 'Khiếu nại',
      value: stats?.totalComplaints || 0,
      subtitle: 'Chờ xử lý',
      icon: AlertTriangle,
      iconColor: 'text-red-600'
    }
  ];

  return (
    <OfficerLayout>
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
                  <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-2">{card.title}</p>
                        <p className="text-3xl font-bold text-gray-900 mb-1">
                          {card.value}
                        </p>
                        <p className="text-xs text-gray-500">{card.subtitle}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <Icon className={`w-6 h-6 ${card.iconColor}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Phân bố theo trạng thái</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Chờ xử lý</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{stats?.pendingApplications || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Đã duyệt</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{stats?.approvedApplications || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Từ chối</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{stats?.rejectedApplications || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hồ sơ gần đây</h2>
            {recentApps.length === 0 ? (
              <div className="text-gray-500 text-sm">Chưa có hồ sơ nào</div>
            ) : (
              <div className="space-y-3">
                {recentApps.map((app) => {
                  const badge = getStatusBadge(app.status);
                  return (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{app.full_name}</p>
                        <p className="text-sm text-gray-600 truncate">{app.program_name}</p>
                        <p className="text-xs text-gray-500">{app.code}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.className}`}>
                          {badge.label}
                        </span>
                        <button 
                          onClick={() => window.location.hash = `/officer/applications/${app.id}`}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
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
    </OfficerLayout>
  );
};

export default OfficerDashboard;
