import React, { useState, useEffect } from 'react';
import OfficerLayout from '../components/OfficerLayout';
import { Download, Upload, Plus, Check } from 'lucide-react';
import api from '../utils/api';

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
      if (!period || !location) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
      }

      const data = await api.post('/api/payouts/batches', {
        period,
        location,
        program_id: programId ? parseInt(programId) : null
      });

      if (data.success) {
        alert('Tạo đợt chi trả thành công!');
        setPeriod('');
        setLocation('');
        setProgramId('');
        setActiveTab('batches');
        fetchBatches();
        fetchStats();
      } else {
        alert('Lỗi: ' + (data.error || 'Không thể tạo đợt chi trả'));
      }
    } catch (error) {
      console.error('Create batch error:', error);
      alert('Đã xảy ra lỗi khi tạo đợt chi trả');
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
          alert('Import thành công!');
          fetchBatches();
          fetchStats();
        }
      } catch (error) {
        alert('Lỗi khi import file');
      }
    };
    reader.readAsText(file);
  };

  const updateBatchStatus = async (batchId: number, status: string) => {
    try {
      const data = await api.put(`/api/payouts/batches/${batchId}/status`, { status });
      if (data.success) {
        alert('Cập nhật trạng thái thành công!');
        fetchBatches();
        fetchStats();
      }
    } catch (error) {
      alert('Lỗi khi cập nhật trạng thái');
    }
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
    <OfficerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-3xl">💰</span> Quản lý Chi trả
          </h1>
          <p className="text-gray-600 mt-1">Quản lý các đợt chi trả trợ cấp xã hội</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{stats.pending}</div>
            <div className="text-sm text-blue-600 mt-1">Chờ chi trả</div>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{stats.paid}</div>
            <div className="text-sm text-green-600 mt-1">Đã chi trả</div>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600">{stats.processing}</div>
            <div className="text-sm text-yellow-600 mt-1">Đang xử lý</div>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {(stats.total_amount / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-purple-600 mt-1">Tổng chi trả (VNĐ)</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('batches')}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === 'batches'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Đợt chi trả
            </button>
            <button
              onClick={() => {
                setActiveTab('details');
                fetchDetails();
              }}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === 'details'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Chi tiết thanh toán
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === 'create'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tạo đợt mới
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-2xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Tạo đợt chi trả mới</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kỳ chi trả <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="Ví dụ: 01/2024, Q1/2024"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa bàn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ví dụ: Xã Tân Phú, Huyện Văn Lãng"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chương trình (Tùy chọn)
                </label>
                <select
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Tất cả chương trình</option>
                  {programs.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleCreateBatch}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
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
    </OfficerLayout>
  );
};

export default PayoutsManagement;
