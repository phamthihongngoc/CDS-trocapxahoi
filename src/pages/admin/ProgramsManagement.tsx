import React, { useState, useEffect } from 'react';
import OfficerLayout from '../../components/OfficerLayout';
import { Plus, Edit2, Trash2, Check, X, Search, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import api from '../../utils/api';

interface Program {
  id: number;
  code: string;
  name: string;
  description: string;
  type: string;
  amount: number;
  start_date: string;
  end_date: string;
  status: string;
  application_count: number;
  approved_count: number;
  total_amount: number;
  created_at: string;
}

const ProgramsManagement: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [deletingProgram, setDeletedProgram] = useState<Program | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: '',
    amount: '',
    start_date: '',
    end_date: '',
    status: 'active'
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/admin/programs');
      if (data.success) {
        setPrograms(data.programs);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProgram) {
        const data = await api.put(`/api/admin/programs/${editingProgram.id}`, formData);
        if (data.success) {
          setShowModal(false);
          resetForm();
          setSuccessMessage('Cập nhật chương trình thành công! ✨');
          setShowSuccessModal(true);
          setTimeout(async () => {
            await fetchPrograms();
            setShowSuccessModal(false);
          }, 2500);
        }
      } else {
        const data = await api.post('/api/admin/programs', formData);
        if (data.success) {
          setShowModal(false);
          resetForm();
          setSuccessMessage('Tạo chương trình mới thành công! ✨');
          setShowSuccessModal(true);
          setTimeout(async () => {
            await fetchPrograms();
            setShowSuccessModal(false);
          }, 2500);
        }
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async () => {
    if (!deletingProgram) return;

    try {
      const data = await api.delete(`/api/admin/programs/${deletingProgram.id}`);
      if (data.success) {
        await fetchPrograms();
        setShowDeleteModal(false);
        setDeletedProgram(null);
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Không thể xóa chương trình');
    }
  };

  const openEditModal = (program: Program) => {
    setEditingProgram(program);
    setFormData({
      code: program.code,
      name: program.name,
      description: program.description || '',
      type: program.type || '',
      amount: program.amount?.toString() || '',
      start_date: program.start_date || '',
      end_date: program.end_date || '',
      status: program.status
    });
    setShowModal(true);
  };

  const openDeleteModal = (program: Program) => {
    setDeletedProgram(program);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: '',
      amount: '',
      start_date: '',
      end_date: '',
      status: 'active'
    });
    setEditingProgram(null);
  };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || program.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading) {
    return (
      <OfficerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </OfficerLayout>
    );
  }

  return (
    <OfficerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Chương trình Trợ cấp</h1>
            <p className="text-gray-600 mt-1">Tạo và quản lý các chương trình trợ cấp xã hội</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold"
          >
            <Plus className="w-5 h-5" />
            Tạo chương trình mới
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Tổng chương trình</p>
                <p className="text-3xl font-bold mt-1">{programs.length}</p>
              </div>
              <TrendingUp className="w-10 h-10 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Đang hoạt động</p>
                <p className="text-3xl font-bold mt-1">
                  {programs.filter(p => p.status === 'active').length}
                </p>
              </div>
              <Check className="w-10 h-10 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Tổng hồ sơ</p>
                <p className="text-3xl font-bold mt-1">
                  {programs.reduce((sum, p) => sum + (p.application_count || 0), 0)}
                </p>
              </div>
              <Users className="w-10 h-10 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Tổng chi trả</p>
                <p className="text-2xl font-bold mt-1">
                  {(programs.reduce((sum, p) => sum + (p.total_amount || 0), 0) / 1000000000).toFixed(1)}B
                </p>
              </div>
              <DollarSign className="w-10 h-10 opacity-80" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc mã chương trình..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-6 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
        </div>

        {/* Programs Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Mã CT</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tên chương trình</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Loại</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Số tiền</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Hồ sơ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Thời gian</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPrograms.map((program) => (
                  <tr key={program.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-semibold text-blue-600">
                        {program.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{program.name}</p>
                        {program.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{program.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {program.type || 'Chưa phân loại'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(program.amount || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-semibold text-gray-900">{program.application_count || 0} hồ sơ</p>
                        <p className="text-green-600">{program.approved_count || 0} đã duyệt</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {program.status === 'active' ? (
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <Check className="w-4 h-4" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-500 font-medium">
                          <X className="w-4 h-4" />
                          Ngừng
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {program.start_date && (
                          <p className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(program.start_date).toLocaleDateString('vi-VN')}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(program)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(program)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPrograms.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Không tìm thấy chương trình nào</p>
              </div>
            )}
          </div>
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-scaleIn">
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
                <h3 className="text-2xl font-bold">
                  {editingProgram ? 'Chỉnh sửa chương trình' : 'Tạo chương trình mới'}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mã chương trình <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="VD: PKT_2025"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Loại chương trình
                    </label>
                    <input
                      type="text"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="VD: Người cao tuổi"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên chương trình <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tên đầy đủ của chương trình"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mô tả chi tiết về chương trình"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số tiền trợ cấp (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="VD: 1500000"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ngày kết thúc
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                  >
                    {editingProgram ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && deletingProgram && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 animate-scaleIn">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xóa</h3>
                <p className="text-gray-600 mb-6">
                  Bạn có chắc muốn xóa chương trình <strong>{deletingProgram.name}</strong>?
                  <br />
                  <span className="text-sm text-gray-500">Chương trình sẽ chuyển sang trạng thái không hoạt động.</span>
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletedProgram(null);
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full mx-4 transform animate-scaleIn relative overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 opacity-50"></div>
              
              {/* Confetti Effect */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-10 left-10 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                <div className="absolute top-20 right-20 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                <div className="absolute bottom-20 left-20 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
                <div className="absolute bottom-10 right-10 w-3 h-3 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
              </div>

              <div className="relative text-center">
                {/* Success Icon with Pulse Animation */}
                <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 mb-6 shadow-lg animate-bounce">
                  <Check className="h-12 w-12 text-white" strokeWidth={3} />
                </div>
                
                {/* Success Title with Gradient */}
                <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                  {successMessage}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 mb-2 leading-relaxed text-lg">
                  Thay đổi đã được lưu
                </p>
                
                <p className="text-sm text-gray-500 mb-6">
                  Đang tải lại danh sách chương trình...
                </p>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden shadow-inner">
                  <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 h-2 rounded-full animate-progress"></div>
                </div>
                
                {/* Success Checkmark */}
                <div className="mt-6 flex items-center justify-center gap-2 text-green-600">
                  <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Đã lưu thành công</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </OfficerLayout>
  );
};

export default ProgramsManagement;
