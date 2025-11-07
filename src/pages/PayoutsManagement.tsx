import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import NavigationHero from '../components/NavigationHero';
import Footer from '../components/Footer';
import { Download, Upload, Plus, Check } from 'lucide-react';
import api from '../utils/api';
import { useToast, useConfirm } from '../hooks/useNotification';

interface PayoutBatch {
  id: number;
  batch_code: string;
  period: string;
  location: string;
  total_recipients: number;
  total_amount: number;
  status: string;
  created_at: string;
}

interface PayoutDetail {
  id: number;
  batch_id: number;
  application_id: number;
  citizen_name: string;
  citizen_id: string;
  amount: number;
  status: string;
  payment_date: string;
}

const PayoutsManagement: React.FC = () => {
  const { showSuccess, showError, showWarning, ToastComponent } = useToast();
  const { showConfirm, ConfirmComponent } = useConfirm();
  
  const [activeTab, setActiveTab] = useState<'batches' | 'details' | 'create'>('batches');
  const [batches, setBatches] = useState<PayoutBatch[]>([]);
  const [details, setDetails] = useState<PayoutDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // KPI Stats
  const [stats, setStats] = useState({
    pending: 0,
    paid: 0,
    processing: 0,
    total_amount: 0
  });

  // Create batch form
  const [period, setPeriod] = useState('');
  const [location, setLocation] = useState('');
  const [programId, setProgramId] = useState('');
  const [programs, setPrograms] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchBatches();
    fetchPrograms();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api.get('/api/payouts/stats');
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch payout stats:', error);
    }
  };

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/payouts/batches');
      if (data.success) {
        setBatches(data.batches);
      }
    } catch (error) {
      setError('Không thể tải danh sách đợt chi trả');
      console.error('Failed to fetch batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetails = async (batchId?: number) => {
    try {
      setLoading(true);
      const url = batchId ? `/api/payouts/details?batch_id=${batchId}` : '/api/payouts/details';
      const data = await api.get(url);
      if (data.success) {
        setDetails(data.details);
      }
    } catch (error) {
      setError('Không thể tải chi tiết thanh toán');
      console.error('Failed to fetch details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const data = await api.get('/api/programs');
      if (data.success) {
        setPrograms(data.programs);
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    }
  };

  const handleCreateBatch = async () => {
    try {
      // Validation
      if (!period || period.trim() === '') {
        showWarning('Vui lòng nhập kỳ chi trả (ví dụ: 01/2024, Q1/2024)');
        return;
      }

      if (!location || location.trim() === '') {
        showWarning('Vui lòng nhập địa bàn (ví dụ: Xã Tân Phú, Huyện Văn Lãng)');
        return;
      }

      // Show confirm modal
      showConfirm(
        'Xác nhận tạo đợt chi trả',
        `Bạn có chắc muốn tạo đợt chi trả cho kỳ "${period}" tại "${location}"?`,
        async () => {
          const data = await api.post('/api/payouts/batches', {
            period: period.trim(),
            location: location.trim(),
            program_id: programId ? parseInt(programId) : null
          });

          if (data.success) {
            const message = data.message || 'Tạo đợt chi trả thành công!';
            showSuccess(message);
            setPeriod('');
            setLocation('');
            setProgramId('');
            setActiveTab('batches');
            fetchBatches();
            fetchStats();
          } else {
            const errorMsg = data.error || 'Không thể tạo đợt chi trả';
            showError(errorMsg);
          }
        },
        { type: 'info', confirmText: 'Tạo đợt', cancelText: 'Hủy' }
      );
    } catch (error: any) {
      console.error('Create batch error:', error);
      const errorMsg = error?.response?.data?.error || error?.message || 'Đã xảy ra lỗi khi tạo đợt chi trả';
      showError(errorMsg);
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Mã đợt', 'Kỳ chi trả', 'Địa bàn', 'Số người', 'Tổng tiền', 'Trạng thái'],
      ...batches.map(b => [
        b.batch_code,
        b.period,
        b.location,
        b.total_recipients,
        b.total_amount,
        getStatusText(b.status)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `danh_sach_chi_tra_${new Date().getTime()}.csv`;
    link.click();
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').slice(1);
      
      const updates: any[] = [];
      rows.forEach(row => {
        const cols = row.split(',');
        if (cols.length >= 2) {
          updates.push({
            batch_code: cols[0]?.trim(),
            status: cols[1]?.trim() === 'Hoàn thành' ? 'completed' : 'pending'
          });
        }
      });

      try {
        const data = await api.post('/api/payouts/import', { updates });
        if (data.success) {
          showSuccess(`🎉 Import thành công ${updates.length} đợt chi trả!`);
          fetchBatches();
          fetchStats();
        }
      } catch (error) {
        showError('Lỗi khi import file CSV');
      }
    };
    reader.readAsText(file);
  };

  const updateBatchStatus = async (batchId: number, status: string) => {
    showConfirm(
      'Xác nhận cập nhật',
      'Bạn có chắc muốn cập nhật trạng thái đợt chi trả này?',
      async () => {
        try {
          const data = await api.put(`/api/payouts/batches/${batchId}/status`, { status });
          if (data.success) {
            showSuccess('Cập nhật trạng thái thành công!');
            fetchBatches();
            fetchStats();
          }
        } catch (error) {
          showError('Lỗi khi cập nhật trạng thái');
        }
      },
      { type: 'warning' }
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const text = {
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };
    return text[status as keyof typeof text] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <NavigationHero />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="text-4xl">💰</span>
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Quản lý Chi trả
                </span>
              </h1>
              <p className="text-gray-600 mt-2 text-sm">Quản lý các đợt chi trả trợ cấp xã hội</p>
            </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="group relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="relative">
              <div className="text-4xl font-bold mb-2">{stats.pending}</div>
              <div className="text-sm font-semibold text-blue-100 uppercase tracking-wide">Chờ chi trả</div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-30"></div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="relative">
              <div className="text-4xl font-bold mb-2">{stats.paid}</div>
              <div className="text-sm font-semibold text-green-100 uppercase tracking-wide">Đã chi trả</div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-30"></div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="relative">
              <div className="text-4xl font-bold mb-2">{stats.processing}</div>
              <div className="text-sm font-semibold text-yellow-100 uppercase tracking-wide">Đang xử lý</div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-30"></div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="relative">
              <div className="text-4xl font-bold mb-2">
                {(stats.total_amount / 1000000).toFixed(1)}M
              </div>
              <div className="text-sm font-semibold text-purple-100 uppercase tracking-wide">Tổng chi trả (VNĐ)</div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-30"></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('batches')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'batches'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              📦 Đợt chi trả
            </button>
            <button
              onClick={() => {
                setActiveTab('details');
                fetchDetails();
              }}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'details'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              📋 Chi tiết thanh toán
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'create'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              ➕ Tạo đợt mới
            </button>
          </div>
        </div>

        {/* Batches Tab */}
        {activeTab === 'batches' && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
              >
                <Download className="w-4 h-4" />
                Xuất danh sách
              </button>
              <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                Nhập kết quả
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="hidden"
                />
              </label>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đợt</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kỳ chi trả</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa bàn</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số người</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {batches.map((batch) => (
                      <tr key={batch.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {batch.batch_code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {batch.period}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {batch.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {batch.total_recipients}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {batch.total_amount?.toLocaleString()} VNĐ
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(batch.status)}`}>
                            {getStatusText(batch.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setActiveTab('details');
                                fetchDetails(batch.id);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Chi tiết
                            </button>
                            {batch.status === 'pending' && (
                              <button
                                onClick={() => updateBatchStatus(batch.id, 'completed')}
                                className="text-green-600 hover:text-green-800 flex items-center gap-1"
                              >
                                <Check className="w-4 h-4" />
                                Hoàn thành
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
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CCCD</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày chi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {details.map((detail) => (
                    <tr key={detail.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {detail.citizen_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {detail.citizen_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {detail.amount?.toLocaleString()} VNĐ
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {detail.payment_date ? new Date(detail.payment_date).toLocaleDateString('vi-VN') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(detail.status)}`}>
                          {getStatusText(detail.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden max-w-3xl mx-auto">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6">
              <div className="flex items-center gap-4">
                <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Tạo đợt chi trả mới</h2>
                  <p className="text-blue-100 text-sm mt-1">Thiết lập thông tin cho đợt chi trả</p>
                </div>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              {/* Period Input */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-5 rounded-xl border-2 border-purple-200">
                <label className="flex items-center gap-2 text-sm font-bold text-purple-700 mb-3">
                  <span className="text-xl">📅</span>
                  Kỳ chi trả <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="Ví dụ: 01/2024, Q1/2024, Quý 1/2024"
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all font-medium placeholder:text-gray-400"
                />
                <p className="text-xs text-purple-600 mt-2">💡 Nhập kỳ chi trả theo tháng hoặc quý</p>
              </div>

              {/* Location Input */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200">
                <label className="flex items-center gap-2 text-sm font-bold text-green-700 mb-3">
                  <span className="text-xl">📍</span>
                  Địa bàn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ví dụ: Xã Tân Phú, Huyện Văn Lãng, Tỉnh Lạng Sơn"
                  className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all font-medium placeholder:text-gray-400"
                />
                <p className="text-xs text-green-600 mt-2">💡 Nhập tên xã, huyện hoặc khu vực chi trả</p>
              </div>

              {/* Program Select */}
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-5 rounded-xl border-2 border-orange-200">
                <label className="flex items-center gap-2 text-sm font-bold text-orange-700 mb-3">
                  <span className="text-xl">🎯</span>
                  Chương trình hỗ trợ
                </label>
                <select
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all font-medium"
                >
                  <option value="">✨ Tất cả chương trình</option>
                  {programs.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-orange-600 mt-2">💡 Có thể để trống để áp dụng cho tất cả chương trình</p>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleCreateBatch}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-bold text-lg shadow-lg transform hover:scale-[1.02] active:scale-95"
              >
                <Plus className="w-6 h-6" />
                Tạo đợt chi trả
              </button>
            </div>
          </div>
        )}

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
        </div>
      </main>
      <Footer />
      
      {/* Toast and Confirm Components */}
      {ToastComponent}
      {ConfirmComponent}
    </div>
  );
};

export default PayoutsManagement;
