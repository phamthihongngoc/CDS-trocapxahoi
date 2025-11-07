import React, { useState, useEffect } from 'react';
import OfficerLayout from '../../components/OfficerLayout';
import { Search, User, FileText } from 'lucide-react';
import api from '../../utils/api';

interface AuditLog {
  id: number;
  user_name: string;
  user_email: string;
  action_type: string;
  entity_type: string;
  entity_id: number;
  status: string;
  created_at: string;
  message: string;
}

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Mock data for better demo
  const mockLogs: AuditLog[] = [
    {
      id: 1,
      user_name: 'Nguyễn Văn An',
      user_email: 'admin@langson.gov.vn',
      action_type: 'CREATE',
      entity_type: 'PROGRAM',
      entity_id: 5,
      status: 'success',
      created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      message: 'Tạo chương trình trợ cấp mới'
    },
    {
      id: 2,
      user_name: 'Trần Thị Bình',
      user_email: 'officer@langson.gov.vn',
      action_type: 'APPROVE',
      entity_type: 'APPLICATION',
      entity_id: 123,
      status: 'success',
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      message: 'Phê duyệt hồ sơ trợ cấp'
    },
    {
      id: 3,
      user_name: 'Lê Văn Cường',
      user_email: 'officer2@langson.gov.vn',
      action_type: 'UPDATE',
      entity_type: 'APPLICATION',
      entity_id: 124,
      status: 'success',
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      message: 'Cập nhật thông tin hồ sơ'
    },
    {
      id: 4,
      user_name: 'Nguyễn Văn An',
      user_email: 'admin@langson.gov.vn',
      action_type: 'DELETE',
      entity_type: 'USER',
      entity_id: 45,
      status: 'success',
      created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      message: 'Xóa tài khoản người dùng'
    },
    {
      id: 5,
      user_name: 'Phạm Thị Dung',
      user_email: 'officer3@langson.gov.vn',
      action_type: 'REJECT',
      entity_type: 'APPLICATION',
      entity_id: 125,
      status: 'success',
      created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      message: 'Từ chối hồ sơ do thiếu giấy tờ'
    },
    {
      id: 6,
      user_name: 'Nguyễn Văn An',
      user_email: 'admin@langson.gov.vn',
      action_type: 'LOGIN',
      entity_type: 'USER',
      entity_id: 1,
      status: 'success',
      created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      message: 'Đăng nhập hệ thống'
    },
    {
      id: 7,
      user_name: 'Hoàng Văn Em',
      user_email: 'user@test.com',
      action_type: 'LOGIN',
      entity_type: 'USER',
      entity_id: 67,
      status: 'failed',
      created_at: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
      message: 'Đăng nhập thất bại - Sai mật khẩu'
    },
    {
      id: 8,
      user_name: 'Trần Thị Bình',
      user_email: 'officer@langson.gov.vn',
      action_type: 'CREATE',
      entity_type: 'PAYOUT',
      entity_id: 89,
      status: 'success',
      created_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
      message: 'Tạo lệnh chi trả'
    }
  ];

  useEffect(() => {
    // Use mock data instead of API
    setLogs(mockLogs);
    setTotalPages(2);
    setLoading(false);
  }, [page, filterAction, filterEntity]);

  // Unused but kept for potential future API integration
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(filterAction && { action_type: filterAction }),
        ...(filterEntity && { entity_type: filterEntity })
      });

      const data = await api.get(`/api/admin/logs?${params}`);
      if (data.success) {
        setLogs(data.logs);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-700';
      case 'UPDATE': return 'bg-blue-100 text-blue-700';
      case 'DELETE': return 'bg-red-100 text-red-700';
      case 'LOGIN': return 'bg-purple-100 text-purple-700';
      case 'LOGOUT': return 'bg-gray-100 text-gray-700';
      case 'APPROVE': return 'bg-emerald-100 text-emerald-700';
      case 'REJECT': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredLogs = logs.filter(log =>
    log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <OfficerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nhật ký hệ thống</h1>
          <p className="text-gray-600 mt-1">Theo dõi mọi hoạt động trong hệ thống</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={filterAction}
              onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả hành động</option>
              <option value="CREATE">Tạo mới</option>
              <option value="UPDATE">Cập nhật</option>
              <option value="DELETE">Xóa</option>
              <option value="APPROVE">Phê duyệt</option>
              <option value="REJECT">Từ chối</option>
              <option value="LOGIN">Đăng nhập</option>
              <option value="LOGOUT">Đăng xuất</option>
            </select>

            <select
              value={filterEntity}
              onChange={(e) => { setFilterEntity(e.target.value); setPage(1); }}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả đối tượng</option>
              <option value="APPLICATION">Hồ sơ</option>
              <option value="COMPLAINT">Khiếu nại</option>
              <option value="PROGRAM">Chương trình</option>
              <option value="USER">Người dùng</option>
              <option value="PAYOUT">Chi trả</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Thời gian</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Người dùng</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Hành động</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Đối tượng</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(log.created_at).toLocaleString('vi-VN')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="font-semibold text-gray-900">{log.user_name || 'N/A'}</p>
                              <p className="text-sm text-gray-500">{log.user_email || ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getActionColor(log.action_type)}`}>
                            {log.action_type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {log.entity_type} #{log.entity_id || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Trang {page} / {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </OfficerLayout>
  );
};

export default AuditLogs;
