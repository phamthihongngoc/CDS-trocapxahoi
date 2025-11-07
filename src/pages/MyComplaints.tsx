import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import api from '../utils/api';
import { FileText, Clock, CheckCircle, XCircle, MessageSquare, Edit } from 'lucide-react';
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
}

const MyComplaints: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/api/complaints/my');
      if (response.success) {
        setComplaints(response.complaints);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; className: string; icon: React.ReactNode }> = {
      pending: {
        text: 'Đang chờ xử lý',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <Clock className="w-4 h-4" />
      },
      in_progress: {
        text: 'Đang xử lý',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <MessageSquare className="w-4 h-4" />
      },
      resolved: {
        text: 'Đã giải quyết',
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="w-4 h-4" />
      },
      rejected: {
        text: 'Đã từ chối',
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: <XCircle className="w-4 h-4" />
      }
    };

    const badge = badges[status] || badges.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${badge.className}`}>
        {badge.icon}
        {badge.text}
      </span>
    );
  };

  const getTypeName = (type: string) => {
    const types: Record<string, string> = {
      general: 'Khiếu nại chung',
      application: 'Liên quan hồ sơ',
      payout: 'Liên quan chi trả',
      officer: 'Liên quan cán bộ',
      other: 'Khác'
    };
    return types[type] || type;
  };

  if (!isAuthenticated || user?.role !== UserRole.CITIZEN) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-xl font-semibold mb-2">Không có quyền truy cập</h2>
          <p className="text-gray-600 mb-4">Chỉ người dân mới có thể xem đơn khiếu nại của mình.</p>
          <a href="#/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Về trang chủ
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHero />
      <div className="py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Đơn khiếu nại của tôi</h1>
          <p className="text-gray-600 mt-2">
            Theo dõi tình trạng xử lý các đơn khiếu nại
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có đơn khiếu nại</h3>
            <p className="text-gray-600 mb-6">
              Bạn chưa gửi đơn khiếu nại nào. Nếu có vấn đề cần giải quyết, hãy gửi đơn khiếu nại.
            </p>
            <a
              href="#/create-complaint"
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              Gửi đơn khiếu nại mới
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div
                key={complaint.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {complaint.title}
                        </h3>
                        {getStatusBadge(complaint.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          {complaint.code}
                        </span>
                        <span>{getTypeName(complaint.type)}</span>
                        <span>
                          Ngày gửi: {new Date(complaint.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {complaint.description}
                  </p>

                  {complaint.status === 'resolved' && complaint.resolution && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-sm font-semibold text-green-900 mb-2">
                        <CheckCircle className="inline w-4 h-4 mr-1" />
                        Kết quả xử lý:
                      </p>
                      <p className="text-sm text-green-800">{complaint.resolution}</p>
                      {complaint.resolved_at && (
                        <p className="text-xs text-green-600 mt-2">
                          Giải quyết lúc: {new Date(complaint.resolved_at).toLocaleString('vi-VN')}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end gap-3">
                    {complaint.status === 'pending' && (
                      <a
                        href={`#/edit-complaint/${complaint.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium shadow-sm"
                      >
                        <Edit className="w-4 h-4" />
                        Sửa đơn
                      </a>
                    )}
                    <a
                      href={`#/complaint/${complaint.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
                    >
                      Xem chi tiết
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default MyComplaints;
