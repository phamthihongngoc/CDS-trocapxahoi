import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import NavigationHero from '../components/NavigationHero';
import Footer from '../components/Footer';
import { Eye, UserPlus, X, Edit, Trash2, Check } from 'lucide-react';
import api from '../utils/api';

interface Complaint {
  id: number;
  code: string;
  citizen_name: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
  assigned_officer_id: number | null;
  assigned_officer_name: string | null;
}

interface Officer {
  id: number;
  full_name: string;
  email: string;
}

const ComplaintsManagement: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // KPI Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [response, setResponse] = useState('');

  useEffect(() => {
    fetchStats();
    fetchComplaints();
    fetchOfficers();
  }, [statusFilter]);

  const fetchStats = async () => {
    try {
      const data = await api.get('/api/complaints/stats');
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch complaint stats:', error);
    }
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      
      let url = '/api/complaints';
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const data = await api.get(url);
      
      if (data.success) {
        setComplaints(data.complaints);
      }
    } catch (error) {
      setError('Không thể tải danh sách khiếu nại');
      console.error('Failed to fetch complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const data = await api.get('/api/users/officers');
      if (data.success) {
        setOfficers(data.officers);
      }
    } catch (error) {
      console.error('Failed to fetch officers:', error);
    }
  };

  const handleAssign = async () => {
    if (!selectedComplaint || !selectedOfficer) return;

    try {
      const data = await api.put(`/api/complaints/${selectedComplaint.id}/assign`, {
        officer_id: parseInt(selectedOfficer)
      });

      if (data.success) {
        setShowAssignModal(false);
        setSelectedComplaint(null);
        setSelectedOfficer('');
        
        // Show success modal
        setSuccessMessage('Đã phân công xử lý khiếu nại thành công!');
        setShowSuccessModal(true);
        
        // Auto close after 2 seconds
        setTimeout(() => {
          setShowSuccessModal(false);
          fetchComplaints();
          fetchStats();
        }, 2000);
      }
    } catch (error) {
      setShowAssignModal(false);
      setWarningMessage('❌ Lỗi khi phân công xử lý. Vui lòng thử lại.');
      setShowWarningModal(true);
      setTimeout(() => {
        setShowWarningModal(false);
      }, 2500);
    }
  };

  const handleRespond = async () => {
    if (!selectedComplaint || !response.trim()) {
      setWarningMessage('Vui lòng nhập nội dung phản hồi trước khi gửi');
      setShowWarningModal(true);
      setTimeout(() => {
        setShowWarningModal(false);
      }, 2500);
      return;
    }

    try {
      const data = await api.post(`/api/complaints/${selectedComplaint.id}/respond`, {
        response: response
      });

      if (data.success) {
        setShowDetailModal(false);
        setResponse('');
        
        // Show success modal
        setSuccessMessage('Đã gửi phản hồi khiếu nại thành công!');
        setShowSuccessModal(true);
        
        // Auto close after 2 seconds
        setTimeout(() => {
          setShowSuccessModal(false);
          setSelectedComplaint(null);
          fetchComplaints();
          fetchStats();
        }, 2000);
      }
    } catch (error) {
      setShowDetailModal(false);
      setWarningMessage('❌ Lỗi khi gửi phản hồi. Vui lòng thử lại.');
      setShowWarningModal(true);
      setTimeout(() => {
        setShowWarningModal(false);
      }, 2500);
    }
  };

  const handleEdit = (complaint: Complaint) => {
    // Navigate to edit page
    window.location.href = `#/complaints/${complaint.id}/edit`;
  };

  const handleDelete = async (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedComplaint) return;

    try {
      const data = await api.delete(`/api/complaints/${selectedComplaint.id}`);

      if (data.success) {
        setShowConfirmModal(false);
        setSuccessMessage('Xóa khiếu nại thành công!');
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          setSelectedComplaint(null);
          fetchComplaints();
          fetchStats();
        }, 2000);
      }
    } catch (error) {
      setShowConfirmModal(false);
      setWarningMessage('❌ Lỗi khi xóa khiếu nại. Vui lòng thử lại.');
      setShowWarningModal(true);
      setTimeout(() => {
        setShowWarningModal(false);
      }, 2500);
      console.error('Delete error:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const text = {
      pending: 'Chờ xử lý',
      in_progress: 'Đang xử lý',
      resolved: 'Đã xử lý',
      rejected: 'Đã từ chối'
    };
    return text[status as keyof typeof text] || status;
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = searchTerm === '' || 
      complaint.citizen_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || complaint.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedComplaints = filteredComplaints.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <NavigationHero />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="text-4xl">📢</span>
                <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Quản lý Khiếu nại
                </span>
              </h1>
              <p className="text-gray-600 mt-2 text-sm">Tiếp nhận và xử lý khiếu nại, góp ý từ công dân</p>
            </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="relative">
              <div className="text-4xl font-bold mb-2">{stats.total}</div>
              <div className="text-sm font-semibold text-blue-100 uppercase tracking-wide">Tổng khiếu nại</div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-30"></div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="relative">
              <div className="text-4xl font-bold mb-2">{stats.pending}</div>
              <div className="text-sm font-semibold text-yellow-100 uppercase tracking-wide">Đang xử lý</div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-30"></div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="relative">
              <div className="text-4xl font-bold mb-2">{stats.resolved}</div>
              <div className="text-sm font-semibold text-green-100 uppercase tracking-wide">Đã xử lý</div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-30"></div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative group">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên công dân, chủ đề..."
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
            <option value="pending">Chờ xử lý</option>
            <option value="in_progress">Đang xử lý</option>
            <option value="resolved">Đã xử lý</option>
            <option value="rejected">Đã từ chối</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã khiếu nại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Công dân</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chủ đề</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người xử lý</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedComplaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {complaint.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {complaint.citizen_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {complaint.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(complaint.status)}`}>
                        {getStatusText(complaint.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(complaint.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {complaint.assigned_officer_name || 'Chưa phân công'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1.5 rounded transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={() => handleEdit(complaint)}
                          className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 p-1.5 rounded transition-colors"
                          title="Sửa khiếu nại"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(complaint)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1.5 rounded transition-colors"
                          title="Xóa khiếu nại"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        
                        {!complaint.assigned_officer_id && (
                          <button
                            onClick={() => {
                              setSelectedComplaint(complaint);
                              setShowAssignModal(true);
                            }}
                            className="text-green-600 hover:text-green-800 hover:bg-green-50 p-1.5 rounded transition-colors"
                            title="Phân công"
                          >
                            <UserPlus className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredComplaints.length > 0 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                {/* Results info */}
                <div className="flex items-center gap-4">
                  <p className="text-sm text-gray-700">
                    Hiển thị <span className="font-medium">{startIndex + 1}</span> đến{' '}
                    <span className="font-medium">{Math.min(endIndex, filteredComplaints.length)}</span> trong tổng số{' '}
                    <span className="font-medium">{filteredComplaints.length}</span> khiếu nại
                  </p>
                  
                  {/* Items per page selector */}
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>5 / trang</option>
                    <option value={10}>10 / trang</option>
                    <option value={20}>20 / trang</option>
                    <option value={50}>50 / trang</option>
                  </select>
                </div>

                {/* Page buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Trước
                  </button>
                  
                  {/* Page numbers */}
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 border rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Assign Modal - IMPROVED */}
      {showAssignModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform animate-scaleIn overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    <UserPlus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Phân công xử lý</h3>
                    <p className="text-green-100 text-sm">Giao nhiệm vụ cho cán bộ</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAssignModal(false)} 
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Complaint Info Cards */}
              <div className="space-y-3">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl border-2 border-blue-200">
                  <label className="text-xs font-semibold text-blue-600 uppercase tracking-wider block mb-1">Chủ đề khiếu nại</label>
                  <p className="text-gray-900 font-bold">{selectedComplaint.subject}</p>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-xl border-2 border-orange-200">
                  <label className="text-xs font-semibold text-orange-600 uppercase tracking-wider block mb-1">Công dân</label>
                  <p className="text-gray-900 font-bold">{selectedComplaint.citizen_name}</p>
                </div>
              </div>

              {/* Officer Selection */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200">
                <label className="flex items-center gap-2 text-sm font-bold text-green-700 mb-3">
                  <span className="text-xl">👤</span>
                  Chọn cán bộ xử lý
                </label>
                <select
                  value={selectedOfficer}
                  onChange={(e) => setSelectedOfficer(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all font-medium"
                >
                  <option value="">-- Chọn cán bộ --</option>
                  {officers.map(officer => (
                    <option key={officer.id} value={officer.id}>
                      {officer.full_name} • {officer.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold transform hover:scale-[1.02]"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAssign}
                  disabled={!selectedOfficer}
                  className={`flex-1 px-6 py-3 rounded-xl transition-all font-bold shadow-lg transform hover:scale-[1.02] ${
                    selectedOfficer
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-xl'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  ✅ Phân công ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail & Response Modal - IMPROVED */}
      {showDetailModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden transform animate-scaleIn">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Chi tiết Khiếu nại</h3>
                  <p className="text-blue-100 text-sm">Mã: {selectedComplaint.code}</p>
                </div>
                <button 
                  onClick={() => setShowDetailModal(false)} 
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
                  <label className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Công dân</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">{selectedComplaint.citizen_name}</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                  <label className="text-xs font-semibold text-green-600 uppercase tracking-wider">Trạng thái</label>
                  <div className="mt-2">
                    <span className={`inline-block px-3 py-1.5 text-sm font-bold rounded-full ${getStatusBadge(selectedComplaint.status)}`}>
                      {getStatusText(selectedComplaint.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <span className="text-xl">📋</span>
                    Chủ đề
                  </label>
                  <p className="text-gray-900 font-medium">{selectedComplaint.subject}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <span className="text-xl">📝</span>
                    Nội dung chi tiết
                  </label>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedComplaint.description}</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-100">
                  <label className="flex items-center gap-2 text-sm font-bold text-orange-700 mb-2">
                    <span className="text-xl">👤</span>
                    Người xử lý
                  </label>
                  <p className="text-gray-900 font-medium">
                    {selectedComplaint.assigned_officer_name || (
                      <span className="text-orange-600">⚠️ Chưa phân công</span>
                    )}
                  </p>
                </div>

                <div className="text-xs text-gray-500 text-center pt-2 border-t">
                  Ngày tạo: {new Date(selectedComplaint.created_at).toLocaleString('vi-VN')}
                </div>
              </div>

              {/* Response Section */}
              {selectedComplaint.status !== 'resolved' && selectedComplaint.status !== 'rejected' && (
                <div className="mt-6 p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                  <label className="flex items-center gap-2 text-sm font-bold text-green-700 mb-3">
                    <span className="text-xl">💬</span>
                    Phản hồi xử lý
                  </label>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={4}
                    placeholder="Nhập nội dung phản hồi cho người dân..."
                    className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white placeholder-gray-400"
                  />
                </div>
              )}

              {/* Action Buttons at Bottom */}
              <div className="mt-6 pt-4 border-t flex gap-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold transition-all transform hover:scale-[1.02]"
                >
                  Đóng
                </button>
                {selectedComplaint.status !== 'resolved' && selectedComplaint.status !== 'rejected' && (
                  <button
                    onClick={handleRespond}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                  >
                    💬 Gửi phản hồi
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal - IMPROVED */}
      {showConfirmModal && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform animate-scaleIn overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <Trash2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Xác nhận xóa</h3>
                  <p className="text-red-100 text-sm">Hành động này không thể hoàn tác</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p className="text-red-800 font-bold text-center mb-2">
                  ⚠️ Bạn có chắc chắn muốn xóa khiếu nại này?
                </p>
                <div className="bg-white rounded-lg p-3 mt-3 border border-red-100">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">Mã khiếu nại:</span> {selectedComplaint.code}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold text-gray-900">Chủ đề:</span> {selectedComplaint.subject}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-800 flex items-start gap-2">
                  <span className="text-lg">💡</span>
                  <span>
                    Tất cả dữ liệu liên quan bao gồm tài liệu đính kèm và lịch sử xử lý sẽ bị xóa vĩnh viễn.
                  </span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedComplaint(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold transform hover:scale-[1.02]"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  🗑️ Xóa ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal - IMPROVED */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform animate-scaleIn">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100 mb-6 animate-bounce">
                <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Cảnh báo!
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {warningMessage}
              </p>
              
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-1.5 rounded-full animate-progress"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform animate-scaleIn">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 animate-bounce">
                <Check className="h-10 w-10 text-green-600" strokeWidth={3} />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Thành công!
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {successMessage}
              </p>
              
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full animate-progress"></div>
              </div>
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

export default ComplaintsManagement;
