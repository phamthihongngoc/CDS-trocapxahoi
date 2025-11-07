import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Eye, Plus } from 'lucide-react';
import api from '../utils/api';
import NavigationHero from '../components/NavigationHero';

interface Application {
  id: number;
  code: string;
  full_name: string;
  program_name: string;
  program_type: string;
  status: string;
  submitted_at: string;
  support_amount: string;
  application_type: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const STATUS_CONFIG = {
  pending: { 
    label: 'Chờ xử lý', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
    bgColor: 'bg-yellow-50'
  },
  under_review: { 
    label: 'Đang xem xét', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: AlertCircle,
    bgColor: 'bg-blue-50'
  },
  approved: { 
    label: 'Đã duyệt', 
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    bgColor: 'bg-green-50'
  },
  rejected: { 
    label: 'Từ chối', 
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    bgColor: 'bg-red-50'
  }
};

const MyApplications: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });

  const fetchApplications = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await api.get(`/api/applications/my?${params}`);
      if (response.success) {
        setApplications(response.applications);
        setPagination(response.pagination);
        
        // Calculate stats from all applications
        const allApps = response.applications;
        setStats({
          total: response.pagination.total,
          pending: allApps.filter((a: Application) => a.status === 'pending' || a.status === 'under_review').length,
          approved: allApps.filter((a: Application) => a.status === 'approved').length,
          rejected: allApps.filter((a: Application) => a.status === 'rejected').length,
        });
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(1);
  }, [statusFilter]);

  const handleSearch = () => {
    fetchApplications(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const viewDetails = (id: number) => {
    navigate(`/applications/${id}`);
  };

  if (loading && applications.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <NavigationHero />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with gradient */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-3 shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Tra cứu hồ sơ
              </h1>
              <p className="text-gray-600 mt-1">Kiểm tra tình trạng hồ sơ đã nộp</p>
            </div>
          </div>
        </div>

        {/* Stats Cards with modern design */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:scale-105 hover:border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Tổng hồ sơ</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  {stats.total}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:scale-105 hover:border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Chờ xử lý</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  {stats.pending}
                </p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:scale-105 hover:border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Đã duyệt</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {stats.approved}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:scale-105 hover:border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Từ chối</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  {stats.rejected}
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <XCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter with modern design */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tìm theo mã hồ sơ, họ tên, chương trình..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none min-w-[180px] font-medium text-gray-700"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="under_review">Đang xem xét</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>

            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 justify-center font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Search className="w-5 h-5" />
              Tìm kiếm
            </button>

            <button
              onClick={() => navigate('/apply')}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2 justify-center font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Tạo mới
            </button>
          </div>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl w-32 h-32 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <FileText className="w-16 h-16 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Chưa có hồ sơ nào</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Hãy đăng ký chương trình hỗ trợ để bắt đầu nhận trợ cấp</p>
            <button
              onClick={() => navigate('/apply')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Đăng ký hỗ trợ ngay
            </button>
          </div>
        ) : (
          <>
            {/* Table for desktop with modern design */}
            <div className="hidden md:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Mã hồ sơ
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Chương trình
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Loại hỗ trợ
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Ngày nộp
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {applications.map((app) => {
                      const StatusIcon = STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG]?.icon || Clock;
                      return (
                        <tr key={app.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200">
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-100 rounded-lg p-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                              </div>
                              <span className="text-sm font-bold text-gray-900">{app.code}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm font-semibold text-gray-900">{app.program_name}</div>
                            <div className="text-sm text-gray-500 mt-0.5">{app.full_name}</div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-700">{app.application_type || app.program_type}</span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-600 font-medium">
                              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                              {new Date(app.submitted_at).toLocaleDateString('vi-VN')}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className={`px-3 py-2 inline-flex items-center gap-2 text-xs font-bold rounded-xl border-2 ${STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG]?.color || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                              <StatusIcon className="w-4 h-4" />
                              {STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG]?.label || app.status}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm">
                            <button
                              onClick={() => viewDetails(app.id)}
                              className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-white bg-blue-50 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 font-semibold rounded-lg transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                            >
                              <Eye className="w-4 h-4" />
                              Xem chi tiết
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cards for mobile with modern design */}
            <div className="md:hidden space-y-4">
              {applications.map((app) => {
                const StatusIcon = STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG]?.icon || Clock;
                return (
                  <div key={app.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 p-5 transition-all duration-300 hover:scale-102">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 rounded-xl p-2.5">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="font-bold text-gray-900">{app.code}</span>
                      </div>
                      <span className={`px-3 py-1.5 inline-flex items-center gap-1.5 text-xs font-bold rounded-xl border-2 ${STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG]?.color || 'bg-gray-100 text-gray-800'}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG]?.label || app.status}
                      </span>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{app.program_name}</p>
                        <p className="text-sm text-gray-500 mt-1">{app.full_name}</p>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 font-medium">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(app.submitted_at).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => viewDetails(app.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-md hover:shadow-lg"
                    >
                      <Eye className="w-4 h-4" />
                      Xem chi tiết
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Pagination with modern design */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-gray-600">
                    Hiển thị <span className="font-bold text-gray-900">{applications.length}</span> / <span className="font-bold text-gray-900">{pagination.total}</span> hồ sơ
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => fetchApplications(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-5 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 hover:text-white hover:border-blue-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-200 transition-all duration-200"
                    >
                      ← Trước
                    </button>
                    <div className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-bold shadow-lg">
                      {pagination.page} / {pagination.totalPages}
                    </div>
                    <button
                      onClick={() => fetchApplications(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-5 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 hover:text-white hover:border-blue-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-200 transition-all duration-200"
                    >
                      Sau →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  );
};

export default MyApplications;
