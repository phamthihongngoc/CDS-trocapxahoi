import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Calendar, User, MapPin, Home, DollarSign, CheckCircle, XCircle, Clock, AlertCircle, Phone, Mail } from 'lucide-react';
import api from '../utils/api';
import NavigationHero from '../components/NavigationHero';

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
  program_name: string;
  program_type: string;
  application_type: string;
  support_amount: string;
  household_size: number;
  monthly_income: string;
  housing_condition: string;
  status: string;
  submitted_at: string;
  reviewed_at: string;
  approved_at: string;
  rejected_at: string;
  rejection_reason: string;
  notes: string;
  household_members_data: string;
}

interface HistoryItem {
  id: number;
  action: string;
  old_status: string;
  new_status: string;
  comment: string;
  performed_by_name: string;
  performed_by_role: string;
  created_at: string;
}

const STATUS_CONFIG = {
  pending: { 
    label: 'Chờ xử lý', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
    desc: 'Hồ sơ đang chờ được xem xét'
  },
  under_review: { 
    label: 'Đang xem xét', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: AlertCircle,
    desc: 'Cán bộ đang xem xét hồ sơ của bạn'
  },
  approved: { 
    label: 'Đã duyệt', 
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    desc: 'Hồ sơ đã được phê duyệt'
  },
  rejected: { 
    label: 'Từ chối', 
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    desc: 'Hồ sơ không được chấp thuận'
  }
};

const CitizenApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicationDetail();
  }, [id]);

  const fetchApplicationDetail = async () => {
    try {
      const response = await api.get(`/api/applications/${id}`);
      if (response.success) {
        setApplication(response.application);
        setHistory(response.history || []);
      }
    } catch (error: any) {
      console.error('Error fetching application:', error);
      alert(error.message || 'Không thể tải thông tin hồ sơ');
      navigate('/my-applications');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy hồ sơ</p>
        </div>
      </div>
    );
  }

  const StatusIcon = STATUS_CONFIG[application.status as keyof typeof STATUS_CONFIG]?.icon || Clock;
  const statusConfig = STATUS_CONFIG[application.status as keyof typeof STATUS_CONFIG];

  let householdMembers: any[] = [];
  try {
    if (application.household_members_data) {
      householdMembers = JSON.parse(application.household_members_data);
    }
  } catch (e) {
    console.error('Error parsing household members:', e);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHero />
      <div className="py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">{application.code}</h1>
              </div>
              <p className="text-gray-600">{application.program_name}</p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <span className={`px-4 py-2 inline-flex items-center gap-2 text-sm font-semibold rounded-lg border ${statusConfig?.color || 'bg-gray-100 text-gray-800'}`}>
                <StatusIcon className="w-5 h-5" />
                {statusConfig?.label || application.status}
              </span>
              <p className="text-sm text-gray-500">{statusConfig?.desc}</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Họ và tên</label>
                  <p className="font-medium text-gray-900">{application.full_name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">CMND/CCCD</label>
                  <p className="font-medium text-gray-900">{application.citizen_id}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Ngày sinh</label>
                  <p className="font-medium text-gray-900">
                    {new Date(application.date_of_birth).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Giới tính</label>
                  <p className="font-medium text-gray-900">{application.gender}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Số điện thoại</label>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {application.phone}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {application.email || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Địa chỉ</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Địa chỉ cụ thể</label>
                  <p className="font-medium text-gray-900">{application.address}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Quận/Huyện</label>
                  <p className="font-medium text-gray-900">{application.district}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Xã/Phường</label>
                  <p className="font-medium text-gray-900">{application.commune}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Thôn/Bản</label>
                  <p className="font-medium text-gray-900">{application.village}</p>
                </div>
              </div>
            </div>

            {/* Household Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Home className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Thông tin hộ gia đình</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm text-gray-600">Số nhân khẩu</label>
                  <p className="font-medium text-gray-900">{application.household_size} người</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Thu nhập hàng tháng</label>
                  <p className="font-medium text-gray-900">
                    {application.monthly_income ? `${parseInt(application.monthly_income).toLocaleString('vi-VN')} VNĐ` : 'Chưa cập nhật'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Điều kiện nhà ở</label>
                  <p className="font-medium text-gray-900">{application.housing_condition}</p>
                </div>
              </div>

              {householdMembers.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Thành viên hộ gia đình</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Họ tên</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quan hệ</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Tuổi</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Nghề nghiệp</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {householdMembers.map((member: any, index: number) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">{member.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{member.relationship}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{member.age}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{member.occupation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Support Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Thông tin hỗ trợ</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Loại hỗ trợ</label>
                  <p className="font-medium text-gray-900">{application.application_type || application.program_type}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Số tiền hỗ trợ</label>
                  <p className="font-medium text-green-600 text-lg">
                    {application.support_amount ? `${parseInt(application.support_amount).toLocaleString('vi-VN')} VNĐ` : 'Chưa xác định'}
                  </p>
                </div>
              </div>
              {application.notes && (
                <div className="mt-4">
                  <label className="text-sm text-gray-600">Ghi chú</label>
                  <p className="font-medium text-gray-900 mt-1">{application.notes}</p>
                </div>
              )}
            </div>

            {/* Rejection Reason if rejected */}
            {application.status === 'rejected' && application.rejection_reason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-2">Lý do từ chối</h3>
                    <p className="text-red-800">{application.rejection_reason}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Timeline & Status */}
          <div className="lg:col-span-1 space-y-6">
            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Lịch sử xử lý</h2>
              </div>
              
              <div className="space-y-4">
                {history.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Chưa có lịch sử xử lý</p>
                ) : (
                  history.map((item, index) => (
                    <div key={item.id} className="relative">
                      {index !== history.length - 1 && (
                        <div className="absolute left-2.5 top-8 bottom-0 w-0.5 bg-gray-200"></div>
                      )}
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 border-2 border-blue-600 mt-0.5"></div>
                        <div className="flex-1 pb-4">
                          <p className="text-sm font-medium text-gray-900">{item.action}</p>
                          {item.comment && (
                            <p className="text-sm text-gray-600 mt-1">{item.comment}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <span>{item.performed_by_name}</span>
                            <span>•</span>
                            <span>{new Date(item.created_at).toLocaleString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Important Dates */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Thông tin thời gian</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Ngày nộp hồ sơ</label>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(application.submitted_at).toLocaleString('vi-VN')}
                  </p>
                </div>
                {application.reviewed_at && (
                  <div>
                    <label className="text-xs text-gray-500">Ngày xem xét</label>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(application.reviewed_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                )}
                {application.approved_at && (
                  <div>
                    <label className="text-xs text-gray-500">Ngày phê duyệt</label>
                    <p className="text-sm font-medium text-green-600">
                      {new Date(application.approved_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                )}
                {application.rejected_at && (
                  <div>
                    <label className="text-xs text-gray-500">Ngày từ chối</label>
                    <p className="text-sm font-medium text-red-600">
                      {new Date(application.rejected_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default CitizenApplicationDetail;
