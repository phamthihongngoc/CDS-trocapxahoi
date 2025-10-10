import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OfficerLayout from '../components/OfficerLayout';
import { ArrowLeft, FileText, User, Clock } from 'lucide-react';
import api from '../utils/api';

interface Application {
  id: number;
  code: string;
  full_name: string;
  citizen_id: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  commune: string;
  village: string;
  bank_account: string;
  bank_name: string;
  household_id: string;
  program_name: string;
  program_type: string;
  application_type: string;
  support_amount: number;
  approved_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  approved_at: string;
  notes: string;
}

interface HistoryItem {
  id: number;
  action: string;
  notes: string;
  performed_by_name: string;
  performed_by_role: string;
  created_at: string;
}

const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplicationDetail();
  }, [id]);

  const fetchApplicationDetail = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/api/applications/${id}`);
      
      if (data.success) {
        setApplication(data.application);
        setHistory(data.history || []);
      } else {
        setError('Không thể tải thông tin hồ sơ');
      }
    } catch (error) {
      console.error('Failed to fetch application:', error);
      setError('Không thể tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      'draft': { label: 'Bản nhập', className: 'bg-gray-100 text-gray-800' },
      'pending': { label: 'Đã nộp', className: 'bg-blue-100 text-blue-800' },
      'under_review': { label: 'Đang xét duyệt', className: 'bg-yellow-100 text-yellow-800' },
      'approved': { label: 'Đã duyệt', className: 'bg-green-500 text-white' },
      'rejected': { label: 'Từ chối', className: 'bg-red-100 text-red-800' },
    };
    return statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'created': 'Tạo hồ sơ',
      'submitted': 'Nộp hồ sơ',
      'under_review': 'Tiếp nhận xử lý',
      'approved': 'Phê duyệt',
      'rejected': 'Từ chối',
      'paid': 'Đã chi trả'
    };
    return labels[action] || action;
  };

  if (loading) {
    return (
      <OfficerLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600">Đang tải...</div>
        </div>
      </OfficerLayout>
    );
  }

  if (error || !application) {
    return (
      <OfficerLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error || 'Không tìm thấy hồ sơ'}
          </div>
        </div>
      </OfficerLayout>
    );
  }

  const statusInfo = getStatusBadge(application.status);

  return (
    <OfficerLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/officer/applications')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại danh sách
          </button>
          <span className={`px-4 py-2 rounded-lg font-medium ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Main Content - 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thông tin Hồ sơ */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <FileText className="w-5 h-5 mr-2" />
                <h2 className="text-lg font-semibold">Thông tin Hồ sơ</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Mã hồ sơ</p>
                  <p className="font-medium">{application.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Loại trợ cấp</p>
                  <p className="font-medium">{application.program_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ngày nộp</p>
                  <p className="font-medium">{formatDateTime(application.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cần phải cuối</p>
                  <p className="font-medium">{application.approved_at ? formatDateTime(application.approved_at) : 'Chưa xác định'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Số tiền phê duyệt</p>
                  <p className="font-medium text-green-600">{formatCurrency(application.approved_amount || application.support_amount)}</p>
                </div>
              </div>
            </div>

            {/* Thông tin Công dân */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <User className="w-5 h-5 mr-2" />
                <h2 className="text-lg font-semibold">Thông tin Công dân</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Họ và tên</p>
                  <p className="font-medium">{application.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">CCCD/CMND</p>
                  <p className="font-medium">{application.citizen_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ngày sinh</p>
                  <p className="font-medium">{new Date(application.date_of_birth).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Giới tính</p>
                  <p className="font-medium">{application.gender === 'male' ? 'Nam' : 'Nữ'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Số điện thoại</p>
                  <p className="font-medium">{application.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mã hộ gia đình</p>
                  <p className="font-medium">{application.household_id || 'Chưa có'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Địa chỉ</p>
                  <p className="font-medium">{application.address}, {application.commune}, {application.district}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Số tài khoản</p>
                  <p className="font-medium">{application.bank_account || 'Chưa có'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ngân hàng</p>
                  <p className="font-medium">{application.bank_name || 'Chưa có'}</p>
                </div>
              </div>
            </div>

            {/* Tài liệu đính kèm */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Tài liệu đính kèm</h2>
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Chức năng upload tài liệu đang được phát triển</p>
                <p className="text-sm mt-1">Tài liệu hiện tại được nộp trực tiếp tại văn phòng</p>
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <Clock className="w-5 h-5 mr-2" />
                <h2 className="text-lg font-semibold">Lịch sử xử lý</h2>
              </div>
              
              {history.length === 0 ? (
                <p className="text-gray-500 text-sm">Chưa có lịch sử xử lý</p>
              ) : (
                <div className="space-y-4">
                  {history.map((item, index) => (
                    <div key={item.id} className="relative pl-6">
                      {/* Timeline dot */}
                      <div className={`absolute left-0 top-1 w-3 h-3 rounded-full ${
                        item.action === 'approved' ? 'bg-green-500' :
                        item.action === 'rejected' ? 'bg-red-500' :
                        item.action === 'under_review' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}></div>
                      
                      {/* Timeline line */}
                      {index < history.length - 1 && (
                        <div className="absolute left-[5px] top-4 w-0.5 h-full bg-gray-200"></div>
                      )}
                      
                      <div>
                        <h3 className="font-medium text-sm">{getActionLabel(item.action)}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.performed_by_name || 'Hệ thống'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(item.created_at)}
                        </p>
                        {item.notes && (
                          <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </OfficerLayout>
  );
};

export default ApplicationDetail;
