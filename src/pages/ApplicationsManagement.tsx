import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import NavigationHero from '../components/NavigationHero';
import Footer from '../components/Footer';
import { Search, Eye, CheckCircle, XCircle, FileEdit, FileText, Clock, Edit, Trash2 } from 'lucide-react';
import api from '../utils/api';

interface Application {
  id: number;
  code: string;
  full_name: string;
  citizen_id: string;
  program_name: string;
  status: string;
  created_at: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  paid: number;
}

const ApplicationsManagement: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, paid: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAdditionalInfoModal, setShowAdditionalInfoModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [additionalInfoNotes, setAdditionalInfoNotes] = useState('');
  const [approvedAmount, setApprovedAmount] = useState('');

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [statusFilter, programFilter, searchTerm]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, programFilter, searchTerm]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (programFilter) params.append('program', programFilter);
      if (searchTerm) params.append('search', searchTerm);

      const data = await api.get(`/api/officer/applications?${params.toString()}`);
      
      if (data.success) {
        setApplications(data.applications);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await api.get('/api/officer/applications/stats');
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    
    try {
      const data = await api.put(`/api/applications/${selectedApp.id}/status`, {
        status: 'approved',
        notes: `Phê duyệt với số tiền: ${approvedAmount || 'Chưa xác định'}`
      });
      
      if (data.success) {
        alert('Phê duyệt hồ sơ thành công!');
        setShowApproveModal(false);
        setSelectedApp(null);
        setApprovedAmount('');
        fetchApplications();
        fetchStats();
      }
    } catch (error) {
      alert('Lỗi khi phê duyệt hồ sơ');
      console.error(error);
    }
  };

  const handleReject = async () => {
    if (!selectedApp || !rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }
    
    try {
      const data = await api.put(`/api/applications/${selectedApp.id}/status`, {
        status: 'rejected',
        rejection_reason: rejectionReason,
        notes: rejectionReason
      });
      
      if (data.success) {
        alert('Từ chối hồ sơ thành công!');
        setShowRejectModal(false);
        setSelectedApp(null);
        setRejectionReason('');
        fetchApplications();
        fetchStats();
      }
    } catch (error) {
      alert('Lỗi khi từ chối hồ sơ');
      console.error(error);
    }
  };

  const handleRequestAdditionalInfo = async () => {
    if (!selectedApp || !additionalInfoNotes.trim()) {
      alert('Vui lòng nhập nội dung yêu cầu bổ sung');
      return;
    }
    
    try {
      const data = await api.put(`/api/applications/${selectedApp.id}/status`, {
        status: 'additional_info_required',
        notes: additionalInfoNotes
      });
      
      if (data.success) {
        alert('Yêu cầu bổ sung hồ sơ thành công!');
        setShowAdditionalInfoModal(false);
        setSelectedApp(null);
        setAdditionalInfoNotes('');
        fetchApplications();
        fetchStats();
      }
    } catch (error) {
      alert('Lỗi khi yêu cầu bổ sung hồ sơ');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!selectedApp) return;
    
    try {
      const data = await api.delete(`/api/officer/applications/${selectedApp.id}`);
      
      if (data.success) {
        alert('Xóa hồ sơ thành công!');
        setShowDeleteModal(false);
        setSelectedApp(null);
        fetchApplications();
        fetchStats();
      }
    } catch (error) {
      alert('Lỗi khi xóa hồ sơ');
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      'draft': { label: 'Bản nhập', className: 'bg-gray-100 text-gray-800' },
      'pending': { label: 'Đã nộp', className: 'bg-blue-100 text-blue-800' },
      'under_review': { label: 'Đang xét duyệt', className: 'bg-yellow-100 text-yellow-800' },
      'approved': { label: 'Đã duyệt', className: 'bg-green-100 text-green-800' },
      'rejected': { label: 'Từ chối', className: 'bg-red-100 text-red-800' },
      'pending_payment': { label: 'Chờ chi trả', className: 'bg-purple-100 text-purple-800' },
      'paid': { label: 'Đã chi trả', className: 'bg-teal-100 text-teal-800' },
      'closed': { label: 'Đã đóng', className: 'bg-gray-100 text-gray-800' },
      'additional_info_required': { label: 'Yêu cầu bổ sung', className: 'bg-orange-100 text-orange-800' }
    };
    return statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <NavigationHero />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="text-4xl">📋</span> 
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Quản lý Hồ sơ Trợ cấp
              </span>
            </h1>
            <p className="text-gray-600 mt-2 text-sm">Danh sách và quản lý hồ sơ trợ cấp xã hội</p>
          </div>
          <a 
            href="#/officer/create-application"
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
            title="Thêm hồ sơ mới"
          >
            <span className="text-2xl font-bold">+</span>
            <span>Thêm hồ sơ</span>
          </a>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, CCCD, mã hồ sơ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium hover:shadow-md transition-all duration-300 cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="draft">Bản nhập</option>
            <option value="pending">Đã nộp</option>
            <option value="under_review">Đang xét duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
            <option value="pending_payment">Chờ chi trả</option>
            <option value="paid">Đã chi trả</option>
            <option value="closed">Đã đóng</option>
            <option value="additional_info_required">Yêu cầu bổ sung</option>
          </select>

          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium hover:shadow-md transition-all duration-300 cursor-pointer"
          >
            <option value="">🏷️ Tất cả loại trợ cấp</option>
            <option value="Khuyết tật">♿ Người khuyết tật</option>
            <option value="Hộ nghèo">🏠 Hộ nghèo</option>
            <option value="Trẻ em">👶 Trẻ em mồ côi</option>
            <option value="Thiên tai">⚠️ Thiên tai</option>
            <option value="Người cao tuổi">👴 Người cao tuổi</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="group relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <FileText className="w-32 h-32" />
            </div>
            <div className="relative">
              <div className="text-4xl font-bold mb-2">{stats.total}</div>
              <div className="text-sm font-semibold text-blue-100 uppercase tracking-wide">Tổng hồ sơ</div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-30"></div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <Clock className="w-32 h-32" />
            </div>
            <div className="relative">
              <div className="text-4xl font-bold mb-2">{stats.pending}</div>
              <div className="text-sm font-semibold text-yellow-100 uppercase tracking-wide">Chờ xử lý</div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-30"></div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <CheckCircle className="w-32 h-32" />
            </div>
            <div className="relative">
              <div className="text-4xl font-bold mb-2">{stats.approved}</div>
              <div className="text-sm font-semibold text-green-100 uppercase tracking-wide">Đã duyệt</div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-30"></div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <CheckCircle className="w-32 h-32" />
            </div>
            <div className="relative">
              <div className="text-4xl font-bold mb-2">{stats.paid}</div>
              <div className="text-sm font-semibold text-teal-100 uppercase tracking-wide">Đã chi trả</div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-30"></div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Mã hồ sơ</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Họ tên</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">CCCD</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Loại trợ cấp</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
                      </div>
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">Không có hồ sơ nào</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  (() => {
                    // Pagination logic
                    const indexOfLastItem = currentPage * itemsPerPage;
                    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                    const currentItems = applications.slice(indexOfFirstItem, indexOfLastItem);
                    
                    return currentItems.map((app) => {
                    const badge = getStatusBadge(app.status);
                    return (
                      <tr key={app.id} className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-900 font-mono">{app.code}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{app.full_name}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600 font-mono">{app.citizen_id}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-700">{app.program_name}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg ${badge.className} shadow-sm`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => window.location.hash = `/officer/applications/${app.id}`}
                              className="p-2 hover:bg-blue-100 rounded-lg transition-all duration-200 group-hover:scale-110"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-5 h-5 text-blue-600" />
                            </button>
                            <button
                              onClick={() => window.location.hash = `/officer/applications/${app.id}/edit`}
                              className="p-2 hover:bg-purple-100 rounded-lg transition-all duration-200 group-hover:scale-110"
                              title="Sửa hồ sơ"
                            >
                              <Edit className="w-5 h-5 text-purple-600" />
                            </button>
                            {app.status === 'under_review' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedApp(app);
                                    setShowApproveModal(true);
                                  }}
                                  className="p-2 hover:bg-green-100 rounded-lg transition-all duration-200 group-hover:scale-110"
                                  title="Phê duyệt"
                                >
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedApp(app);
                                    setShowRejectModal(true);
                                  }}
                                  className="p-2 hover:bg-red-100 rounded-lg transition-all duration-200 group-hover:scale-110"
                                  title="Từ chối"
                                >
                                  <XCircle className="w-5 h-5 text-red-600" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedApp(app);
                                    setShowAdditionalInfoModal(true);
                                  }}
                                  className="p-2 hover:bg-orange-100 rounded-lg transition-all duration-200 group-hover:scale-110"
                                  title="Yêu cầu bổ sung"
                                >
                                  <FileEdit className="w-5 h-5 text-orange-600" />
                                </button>
                              </>
                            )}
                            {(app.status === 'draft' || app.status === 'rejected') && (
                              <button
                                onClick={() => {
                                  setSelectedApp(app);
                                  setShowDeleteModal(true);
                                }}
                                className="p-2 hover:bg-red-100 rounded-lg transition-all duration-200 group-hover:scale-110"
                                title="Xóa hồ sơ"
                              >
                                <Trash2 className="w-5 h-5 text-red-600" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  });
                  })()
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && applications.length > 0 && (
            <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between rounded-b-xl">
              {/* Items per page selector */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 font-medium">Hiển thị:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value={5}>5 hồ sơ</option>
                  <option value={10}>10 hồ sơ</option>
                  <option value={20}>20 hồ sơ</option>
                  <option value={50}>50 hồ sơ</option>
                  <option value={100}>100 hồ sơ</option>
                </select>
                <span className="text-sm text-gray-600">
                  Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, applications.length)} - {Math.min(currentPage * itemsPerPage, applications.length)} của {applications.length} hồ sơ
                </span>
              </div>

              {/* Page numbers */}
              <div className="flex items-center gap-2">
                {(() => {
                  const totalPages = Math.ceil(applications.length / itemsPerPage);
                  const pages = [];
                  
                  // Previous button
                  pages.push(
                    <button
                      key="prev"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300'
                      }`}
                    >
                      « Trước
                    </button>
                  );

                  // Page numbers logic
                  const maxVisiblePages = 5;
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                  
                  if (endPage - startPage < maxVisiblePages - 1) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }

                  // First page
                  if (startPage > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => setCurrentPage(1)}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300 transition-all"
                      >
                        1
                      </button>
                    );
                    if (startPage > 2) {
                      pages.push(<span key="ellipsis1" className="px-2 text-gray-500">...</span>);
                    }
                  }

                  // Page numbers
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          currentPage === i
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-110'
                            : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300'
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }

                  // Last page
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(<span key="ellipsis2" className="px-2 text-gray-500">...</span>);
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => setCurrentPage(totalPages)}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300 transition-all"
                      >
                        {totalPages}
                      </button>
                    );
                  }

                  // Next button
                  pages.push(
                    <button
                      key="next"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300'
                      }`}
                    >
                      Sau »
                    </button>
                  );

                  return pages;
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Approve Modal */}
        {showApproveModal && selectedApp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Phê duyệt Hồ sơ</h3>
              <p className="text-gray-600 mb-4">
                Bạn có chắc chắn muốn phê duyệt hồ sơ <strong>{selectedApp.code}</strong> của <strong>{selectedApp.full_name}</strong>?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền phê duyệt (VNĐ)
                </label>
                <input
                  type="number"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                  placeholder="Nhập số tiền phê duyệt"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setSelectedApp(null);
                    setApprovedAmount('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Xác nhận Phê duyệt
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedApp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Từ chối Hồ sơ</h3>
              <p className="text-gray-600 mb-4">
                Từ chối hồ sơ <strong>{selectedApp.code}</strong> của <strong>{selectedApp.full_name}</strong>
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do từ chối <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Nhập lý do từ chối..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedApp(null);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Xác nhận Từ chối
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info Modal */}
        {showAdditionalInfoModal && selectedApp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Yêu cầu Bổ sung</h3>
              <p className="text-gray-600 mb-4">
                Yêu cầu bổ sung thông tin cho hồ sơ <strong>{selectedApp.code}</strong> của <strong>{selectedApp.full_name}</strong>
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung yêu cầu <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={additionalInfoNotes}
                  onChange={(e) => setAdditionalInfoNotes(e.target.value)}
                  placeholder="Nhập nội dung yêu cầu bổ sung..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAdditionalInfoModal(false);
                    setSelectedApp(null);
                    setAdditionalInfoNotes('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  onClick={handleRequestAdditionalInfo}
                  className="px-4 py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700"
                >
                  Gửi Yêu cầu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedApp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4 text-red-600 flex items-center gap-2">
                <Trash2 className="w-6 h-6" />
                Xóa Hồ sơ
              </h3>
              <p className="text-gray-600 mb-4">
                Bạn có chắc chắn muốn xóa hồ sơ <strong>{selectedApp.code}</strong> của <strong>{selectedApp.full_name}</strong>?
              </p>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-sm text-red-700">
                  ⚠️ <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác. Tất cả thông tin liên quan đến hồ sơ này sẽ bị xóa vĩnh viễn.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedApp(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Xác nhận Xóa
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ApplicationsManagement;
