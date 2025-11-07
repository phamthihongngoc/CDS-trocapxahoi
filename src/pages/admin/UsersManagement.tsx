import { useState, useEffect, useRef } from 'react';
import { Users, UserPlus, Edit2, Trash2, Search, Shield, UserCircle, Upload, Download } from 'lucide-react';
import api from '../../utils/api';
import OfficerLayout from '../../components/OfficerLayout';
import { useToast, useConfirm } from '../../hooks/useNotification';

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

interface UserStats {
  total: number;
  citizens: number;
  officers: number;
  admins: number;
}

export default function UsersManagement() {
  const { showSuccess, showError, showWarning, ToastComponent } = useToast();
  const { showConfirm, ConfirmComponent } = useConfirm();
  
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({ total: 0, citizens: 0, officers: 0, admins: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'CITIZEN'
  });
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [currentPage, searchTerm, roleFilter]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/admin/users/stats');
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/admin/users?page=${currentPage}&limit=10&search=${searchTerm}&role=${roleFilter}`);
      if (response.success) {
        setUsers(response.users);
        setTotalPages(Math.ceil(response.total / response.limit));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setModalMode('add');
    setFormData({ full_name: '', email: '', password: '', role: 'CITIZEN' });
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user: User) => {
    setModalMode('edit');
    setFormData({
      full_name: user.full_name,
      email: user.email,
      password: '',
      role: user.role
    });
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDeleteUser = async (userId: number) => {
    showConfirm(
      'Xác nhận xóa người dùng',
      'Bạn có chắc muốn xóa người dùng này? Hành động này không thể hoàn tác.',
      async () => {
        try {
          const response = await api.delete(`/api/admin/users/${userId}`);

          if (response.success) {
            showSuccess('Xóa người dùng thành công!');
            fetchUsers();
            fetchStats();
          } else {
            showError(response.error || 'Lỗi xóa người dùng');
          }
        } catch (error: any) {
          showError(error.message || 'Lỗi xóa người dùng');
        }
      },
      { type: 'danger', confirmText: 'Xóa', cancelText: 'Hủy' }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let response;
      if (modalMode === 'add') {
        response = await api.post('/api/admin/users', formData);
      } else {
        response = await api.put(`/api/admin/users/${selectedUser?.id}`, formData);
      }

      if (response.success) {
        showSuccess(response.message || (modalMode === 'add' ? 'Thêm người dùng thành công!' : 'Cập nhật người dùng thành công!'));
        setShowModal(false);
        fetchUsers();
        fetchStats();
      } else {
        showError(response.error || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      showError(error.message || 'Có lỗi xảy ra');
    }
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      ADMIN: 'bg-red-100 text-red-800',
      OFFICER: 'bg-blue-100 text-blue-800',
      CITIZEN: 'bg-green-100 text-green-800'
    };
    return badges[role as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getRoleText = (role: string) => {
    const roles = {
      ADMIN: 'Quản trị viên',
      OFFICER: 'Cán bộ',
      CITIZEN: 'Công dân'
    };
    return roles[role as keyof typeof roles] || role;
  };

  // CSV Import functions
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        showWarning('Vui lòng chọn file CSV hợp lệ');
        return;
      }
      setImportFile(file);
      parseCSV(file);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      // Skip header row
      const dataLines = lines.slice(1);
      
      const parsed = dataLines.map((line, index) => {
        const cols = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''));
        return {
          index: index + 1,
          full_name: cols[0] || '',
          citizen_id: cols[1] || '',
          email: cols[2] || '',
          phone: cols[3] || '',
          address: cols[4] || '',
          role: cols[5]?.toUpperCase() || 'CITIZEN',
          password: cols[6] || '123456'
        };
      }).filter(item => item.full_name && item.citizen_id); // Only valid rows

      setImportPreview(parsed);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (importPreview.length === 0) {
      showWarning('Không có dữ liệu để import. Vui lòng chọn file CSV hợp lệ.');
      return;
    }

    showConfirm(
      'Xác nhận import người dùng',
      `Bạn có chắc muốn import ${importPreview.length} người dùng vào hệ thống?`,
      async () => {
        try {
          setImporting(true);
          const response = await api.post('/api/admin/users/import', {
            users: importPreview
          });

          if (response.success) {
            showSuccess(`🎉 Import thành công ${response.imported}/${importPreview.length} người dùng!`);
            setShowImportModal(false);
            setImportFile(null);
            setImportPreview([]);
            fetchUsers();
            fetchStats();
          } else {
            showError(response.error || 'Có lỗi xảy ra khi import');
          }
        } catch (error: any) {
          showError(error.message || 'Có lỗi xảy ra khi import');
        } finally {
          setImporting(false);
        }
      },
      { 
        type: 'info', 
        confirmText: `Import ${importPreview.length} người dùng`,
        cancelText: 'Hủy'
      }
    );
  };

  const downloadSampleCSV = () => {
    const sample = `full_name,citizen_id,email,phone,address,role,password
Nguyễn Văn A,001098123456,nguyenvana@example.com,0987654321,Hà Nội,CITIZEN,123456
Trần Thị B,025088234567,tranthib@langson.gov.vn,0912345678,Lạng Sơn,OFFICER,123456
Lê Văn C,035099345678,levanc@langson.gov.vn,0923456789,Lạng Sơn,ADMIN,123456`;

    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sample_users.csv';
    link.click();
  };

  return (
    <OfficerLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý người dùng</h1>
        <p className="text-gray-600">Quản lý tài khoản và phân quyền người dùng</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng người dùng</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Công dân</p>
              <p className="text-2xl font-bold text-green-600">{stats.citizens}</p>
            </div>
            <UserCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cán bộ</p>
              <p className="text-2xl font-bold text-blue-600">{stats.officers}</p>
            </div>
            <Shield className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quản trị viên</p>
              <p className="text-2xl font-bold text-red-600">{stats.admins}</p>
            </div>
            <Shield className="w-12 h-12 text-red-500" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Tất cả vai trò</option>
            <option value="CITIZEN">Công dân</option>
            <option value="OFFICER">Cán bộ</option>
            <option value="ADMIN">Quản trị viên</option>
          </select>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Upload className="w-5 h-5" />
            Import CSV
          </button>

          <button
            onClick={handleAddUser}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <UserPlus className="w-5 h-5" />
            Thêm người dùng
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Đang tải...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{user.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.full_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                      {getRoleText(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Trang {currentPage} / {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {modalMode === 'add' ? 'Thêm người dùng mới' : 'Chỉnh sửa người dùng'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu {modalMode === 'edit' && '(để trống nếu không đổi)'}
                  {modalMode === 'add' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  required={modalMode === 'add'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vai trò <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="CITIZEN">Công dân</option>
                  <option value="OFFICER">Cán bộ</option>
                  <option value="ADMIN">Quản trị viên</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {modalMode === 'add' ? 'Thêm' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Import Người dùng từ CSV</h2>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setImportPreview([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {/* File upload section */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Upload className="w-5 h-5" />
                    Chọn file CSV
                  </button>
                  
                  <button
                    onClick={downloadSampleCSV}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Download className="w-5 h-5" />
                    Tải file mẫu
                  </button>

                  {importFile && (
                    <span className="text-sm text-gray-600">
                      Đã chọn: <strong>{importFile.name}</strong>
                    </span>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <strong>Hướng dẫn:</strong>
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>File CSV phải có 7 cột: <code className="bg-blue-100 px-1 rounded">full_name, citizen_id, email, phone, address, role, password</code></li>
                    <li>Vai trò (role) có thể là: CITIZEN, OFFICER, ADMIN</li>
                    <li>Mật khẩu mặc định: 123456</li>
                    <li>Tải file mẫu để xem định dạng chính xác</li>
                  </ul>
                </div>
              </div>

              {/* Preview table */}
              {importPreview.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">
                    Xem trước ({importPreview.length} người dùng)
                  </h3>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Họ tên</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">CCCD</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">SĐT</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Địa chỉ</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Vai trò</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {importPreview.map((user, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">{user.full_name}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{user.citizen_id}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{user.email}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{user.phone}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{user.address}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                                user.role === 'OFFICER' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {user.role === 'ADMIN' ? 'Quản trị viên' :
                                 user.role === 'OFFICER' ? 'Cán bộ' : 'Công dân'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportPreview([]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                
                {importPreview.length > 0 && (
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {importing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Đang import...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Import {importPreview.length} người dùng
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast and Confirm Components */}
      {ToastComponent}
      {ConfirmComponent}
    </OfficerLayout>
  );
}
