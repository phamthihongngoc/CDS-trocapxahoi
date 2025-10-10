import React, { useState, useEffect } from 'react';
import OfficerLayout from '../components/OfficerLayout';
import { Search, Eye, CheckCircle, XCircle, FileEdit } from 'lucide-react';
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
  
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAdditionalInfoModal, setShowAdditionalInfoModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [additionalInfoNotes, setAdditionalInfoNotes] = useState('');
  const [approvedAmount, setApprovedAmount] = useState('');

  useEffect(() => {
    fetchApplications();
    fetchStats();
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
    <OfficerLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-3xl">📋</span> Quản lý Hồ sơ Trợ cấp
          </h1>
          <p className="text-gray-600 mt-1">Danh sách và quản lý hồ sơ trợ cấp xã hội</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, CCCD, mã hồ sơ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">Tất cả loại trợ cấp</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-800 mt-1">Tổng hồ sơ</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-yellow-800 mt-1">Chờ xử lý</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-green-800 mt-1">Đã duyệt</div>
          </div>
          <div className="bg-teal-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-teal-600">{stats.paid}</div>
            <div className="text-sm text-teal-800 mt-1">Đã chi trả</div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã hồ sơ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CCCD</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại trợ cấp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Không có hồ sơ nào
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => {
                    const badge = getStatusBadge(app.status);
                    return (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {app.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {app.full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {app.citizen_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {app.program_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.className}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => window.location.hash = `/officer/applications/${app.id}`}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-5 h-5 text-gray-600" />
                            </button>
                            {app.status === 'under_review' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedApp(app);
                                    setShowApproveModal(true);
                                  }}
                                  className="p-1 hover:bg-green-100 rounded"
                                  title="Phê duyệt"
                                >
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedApp(app);
                                    setShowRejectModal(true);
                                  }}
                                  className="p-1 hover:bg-red-100 rounded"
                                  title="Từ chối"
                                >
                                  <XCircle className="w-5 h-5 text-red-600" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedApp(app);
                                    setShowAdditionalInfoModal(true);
                                  }}
                                  className="p-1 hover:bg-orange-100 rounded"
                                  title="Yêu cầu bổ sung"
                                >
                                  <FileEdit className="w-5 h-5 text-orange-600" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
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
      </div>
    </OfficerLayout>
  );
};

export default ApplicationsManagement;
