import React, { useState, useEffect } from 'react';
import OfficerLayout from '../components/OfficerLayout';
import { Eye, UserPlus, X } from 'lucide-react';
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

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
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
        alert('Phân công xử lý thành công!');
        setShowAssignModal(false);
        setSelectedComplaint(null);
        setSelectedOfficer('');
        fetchComplaints();
        fetchStats();
      }
    } catch (error) {
      alert('Lỗi khi phân công xử lý');
    }
  };

  const handleRespond = async () => {
    if (!selectedComplaint || !response.trim()) {
      alert('Vui lòng nhập nội dung phản hồi');
      return;
    }

    try {
      const data = await api.post(`/api/complaints/${selectedComplaint.id}/respond`, {
        response: response
      });

      if (data.success) {
        alert('Phản hồi khiếu nại thành công!');
        setShowDetailModal(false);
        setSelectedComplaint(null);
        setResponse('');
        fetchComplaints();
        fetchStats();
      }
    } catch (error) {
      alert('Lỗi khi phản hồi khiếu nại');
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
    
    return matchesSearch;
  });

  return (
    <OfficerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-3xl">⚠️</span> Quản lý Khiếu nại
          </h1>
          <p className="text-gray-600 mt-1">Tiếp nhận và xử lý khiếu nại, góp ý từ công dân</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-600 mt-1">Tổng khiếu nại</div>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-yellow-600 mt-1">Đang xử lý</div>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{stats.resolved}</div>
            <div className="text-sm text-green-600 mt-1">Đã xử lý</div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên công dân, chủ đề..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="in_progress">Đang xử lý</option>
            <option value="resolved">Đã xử lý</option>
            <option value="rejected">Đã từ chối</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                {filteredComplaints.map((complaint) => (
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
                          className="text-blue-600 hover:text-blue-800"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {!complaint.assigned_officer_id && (
                          <button
                            onClick={() => {
                              setSelectedComplaint(complaint);
                              setShowAssignModal(true);
                            }}
                            className="text-green-600 hover:text-green-800"
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

      {/* Assign Modal */}
      {showAssignModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Phân công xử lý</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Khiếu nại: <span className="font-medium">{selectedComplaint.subject}</span></p>
              <p className="text-sm text-gray-600">Công dân: <span className="font-medium">{selectedComplaint.citizen_name}</span></p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Chọn cán bộ xử lý</label>
              <select
                value={selectedOfficer}
                onChange={(e) => setSelectedOfficer(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">-- Chọn cán bộ --</option>
                {officers.map(officer => (
                  <option key={officer.id} value={officer.id}>
                    {officer.full_name} ({officer.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedOfficer}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  selectedOfficer
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Phân công
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail & Response Modal */}
      {showDetailModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chi tiết khiếu nại</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Mã khiếu nại</label>
                <p className="text-gray-900">{selectedComplaint.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Công dân</label>
                <p className="text-gray-900">{selectedComplaint.citizen_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Chủ đề</label>
                <p className="text-gray-900">{selectedComplaint.subject}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Nội dung</label>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedComplaint.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Trạng thái</label>
                <p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(selectedComplaint.status)}`}>
                    {getStatusText(selectedComplaint.status)}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Người xử lý</label>
                <p className="text-gray-900">{selectedComplaint.assigned_officer_name || 'Chưa phân công'}</p>
              </div>
            </div>

            {selectedComplaint.status !== 'resolved' && selectedComplaint.status !== 'rejected' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phản hồi xử lý</label>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={4}
                    placeholder="Nhập nội dung phản hồi..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={handleRespond}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Gửi phản hồi
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </OfficerLayout>
  );
};

export default ComplaintsManagement;
