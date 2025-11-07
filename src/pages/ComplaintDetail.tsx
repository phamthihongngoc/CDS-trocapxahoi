import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Calendar, User, MessageSquare, CheckCircle, XCircle, Clock, AlertCircle, ArrowLeft, Edit } from 'lucide-react';
import api from '../utils/api';
import NavigationHero from '../components/NavigationHero';

interface Complaint {
  id: number;
  code: string;
  title: string;
  description: string;
  type: string;
  status: string;
  resolution: string | null;
  created_at: string;
  resolved_at: string | null;
  user_id: number;
  user_name: string;
  user_email: string;
  application_id: number | null;
}

const ComplaintDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaintDetail();
  }, [id]);

  const fetchComplaintDetail = async () => {
    try {
      const response = await api.get(`/api/complaints/${id}`);
      if (response.success) {
        setComplaint(response.complaint);
      } else {
        navigate('/my-complaints');
      }
    } catch (error) {
      console.error('Error fetching complaint detail:', error);
      navigate('/my-complaints');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; className: string; icon: React.ReactNode }> = {
      pending: {
        text: 'Đang chờ xử lý',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <Clock className="w-5 h-5" />
      },
      in_progress: {
        text: 'Đang xử lý',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <AlertCircle className="w-5 h-5" />
      },
      resolved: {
        text: 'Đã giải quyết',
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="w-5 h-5" />
      },
      rejected: {
        text: 'Từ chối',
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: <XCircle className="w-5 h-5" />
      }
    };
    return badges[status] || badges.pending;
  };

  const getTypeName = (type: string) => {
    const types: Record<string, string> = {
      general: 'Chung',
      application: 'Về hồ sơ',
      payout: 'Về thanh toán',
      other: 'Khác'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationHero />
        <div className="py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationHero />
        <div className="py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy đơn khiếu nại</h3>
              <button
                onClick={() => navigate('/my-complaints')}
                className="text-blue-600 hover:text-blue-700"
              >
                Quay lại danh sách
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusBadge(complaint.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHero />
      <div className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <button
            onClick={() => navigate('/my-complaints')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại danh sách đơn khiếu nại
          </button>

          {/* Header Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900">{complaint.code}</h1>
                </div>
                <h2 className="text-xl text-gray-700">{complaint.title}</h2>
              </div>
              <span className={`px-4 py-2 inline-flex items-center gap-2 text-sm font-semibold rounded-lg border ${statusConfig.className} whitespace-nowrap`}>
                {statusConfig.icon}
                {statusConfig.text}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Ngày gửi</p>
                  <p className="font-medium">{new Date(complaint.created_at).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MessageSquare className="w-4 h-4 mr-2 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Loại khiếu nại</p>
                  <p className="font-medium">{getTypeName(complaint.type)}</p>
                </div>
              </div>
              {complaint.resolved_at && (
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500">Ngày giải quyết</p>
                    <p className="font-medium">{new Date(complaint.resolved_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Edit Button - Only show for pending complaints */}
          {complaint.status === 'pending' && (
            <div className="mb-6">
              <button
                onClick={() => navigate(`/edit-complaint/${complaint.id}`)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                <Edit className="w-4 h-4" />
                Sửa đơn khiếu nại
              </button>
              <p className="text-xs text-gray-500 mt-2">
                * Bạn chỉ có thể sửa đơn khi đơn đang ở trạng thái "Chờ xử lý"
              </p>
            </div>
          )}

          {/* Content Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
              Nội dung khiếu nại
            </h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
            </div>
          </div>

          {/* Resolution Card */}
          {complaint.status === 'resolved' && complaint.resolution && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Kết quả xử lý
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{complaint.resolution}</p>
                {complaint.resolved_at && (
                  <p className="text-sm text-green-600 mt-3 pt-3 border-t border-green-200">
                    Giải quyết vào lúc: {new Date(complaint.resolved_at).toLocaleString('vi-VN')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Rejection Card */}
          {complaint.status === 'rejected' && complaint.resolution && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                <XCircle className="w-5 h-5 mr-2 text-red-600" />
                Lý do từ chối
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{complaint.resolution}</p>
                {complaint.resolved_at && (
                  <p className="text-sm text-red-600 mt-3 pt-3 border-t border-red-200">
                    Từ chối vào lúc: {new Date(complaint.resolved_at).toLocaleString('vi-VN')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* In Progress Card */}
          {complaint.status === 'in_progress' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center text-blue-800">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <p className="font-medium">Đơn khiếu nại của bạn đang được xử lý</p>
                </div>
                <p className="text-sm text-blue-600 mt-2">
                  Vui lòng kiên nhẫn chờ đợi. Chúng tôi sẽ thông báo kết quả xử lý trong thời gian sớm nhất.
                </p>
              </div>
            </div>
          )}

          {/* Pending Card */}
          {complaint.status === 'pending' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center text-yellow-800">
                  <Clock className="w-5 h-5 mr-2" />
                  <p className="font-medium">Đơn khiếu nại đang chờ xử lý</p>
                </div>
                <p className="text-sm text-yellow-600 mt-2">
                  Đơn khiếu nại của bạn đã được tiếp nhận và đang chờ cán bộ xem xét.
                </p>
              </div>
            </div>
          )}

          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Thông tin người gửi
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="text-gray-600 w-32">Họ và tên:</span>
                <span className="text-gray-900 font-medium">{complaint.user_name}</span>
              </div>
              <div className="flex">
                <span className="text-gray-600 w-32">Email:</span>
                <span className="text-gray-900">{complaint.user_email}</span>
              </div>
              {complaint.application_id && (
                <div className="flex">
                  <span className="text-gray-600 w-32">Liên quan hồ sơ:</span>
                  <a 
                    href={`#/applications/${complaint.application_id}`}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Xem hồ sơ #{complaint.application_id}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
