import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import api from '../utils/api';
import { FileText, Upload, X, CheckCircle } from 'lucide-react';
import NavigationHero from '../components/NavigationHero';

const CreateComplaint: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [complaintCode, setComplaintCode] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'general', // general, application, payout, other
    application_id: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // File upload handling
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_EXTS = ['png', 'jpg', 'jpeg', 'docx', 'pdf'];
  const ALLOWED_MIME = [
    'image/png',
    'image/jpeg',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf',
  ];

  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const files = Array.from(e.target.files || []);
    const ok: File[] = [];
    const bad: string[] = [];

    files.forEach((f) => {
      const ext = (f.name.split('.').pop() || '').toLowerCase();
      const typeOk = ALLOWED_EXTS.includes(ext) || ALLOWED_MIME.includes(f.type);
      const sizeOk = f.size <= MAX_FILE_SIZE;
      if (typeOk && sizeOk) ok.push(f);
      else {
        bad.push(`${f.name}${!typeOk ? ' (định dạng không hợp lệ)' : ''}${!sizeOk ? ' (vượt 10MB)' : ''}`.trim());
      }
    });

    if (bad.length) {
      setUploadError(`Một số tệp không hợp lệ: ${bad.join(', ')}`);
    }
    
    const dedup = new Map<string, File>();
    [...attachments, ...ok].forEach((f) => dedup.set(`${f.name}-${f.size}`, f));
    setAttachments(Array.from(dedup.values()));
    e.target.value = '';
  };

  const removeAttachment = (key: string) => {
    setAttachments(prev => prev.filter(f => `${f.name}-${f.size}` !== key));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('⚠️ Vui lòng nhập tiêu đề khiếu nại!');
      return;
    }

    if (!formData.description.trim()) {
      alert('⚠️ Vui lòng nhập nội dung khiếu nại!');
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('type', formData.type);
      if (formData.application_id) {
        fd.append('application_id', formData.application_id);
      }
      
      attachments.forEach((file) => fd.append('attachments', file, file.name));

      const response = await api.postForm('/api/complaints/submit', fd);
      
      if (response.success) {
        setComplaintCode(response.code);
        setSubmitSuccess(true);
      } else {
        alert(response.error || 'Có lỗi xảy ra khi gửi đơn khiếu nại');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Có lỗi xảy ra khi gửi đơn khiếu nại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || user?.role !== UserRole.CITIZEN) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-xl font-semibold mb-2">Không có quyền truy cập</h2>
          <p className="text-gray-600 mb-4">Chỉ người dân mới có thể gửi đơn khiếu nại.</p>
          <a href="#/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Về trang chủ
          </a>
        </div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform animate-scaleIn">
          <div className="text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 animate-bounce">
              <CheckCircle className="h-10 w-10 text-green-600" strokeWidth={3} />
            </div>
            
            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Gửi đơn thành công!
            </h3>
            
            {/* Complaint Code Badge */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Mã đơn khiếu nại của bạn:</p>
              <p className="text-2xl font-bold text-blue-600">{complaintCode}</p>
            </div>
            
            {/* Message */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              Đơn đăng ký của bạn đã được gửi thành công. Hệ thống sẽ thông báo kết quả xử lý trong vòng 15 ngày làm việc.
            </p>
            
            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <a
                href="#/my-applications"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Xem hồ sơ
              </a>
              <a 
                href="#/" 
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Quay về trang chủ
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHero />
      <div className="py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gửi đơn khiếu nại</h1>
            <p className="text-gray-600 mt-2">
              Vui lòng mô tả rõ ràng nội dung khiếu nại và đính kèm minh chứng (nếu có)
            </p>
          </div>
          <a
            href="#/my-complaints"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg whitespace-nowrap text-sm sm:text-base"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Xem tất cả đơn</span>
            <span className="sm:hidden">Đơn của tôi</span>
          </a>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Loại khiếu nại */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại khiếu nại <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="general">Khiếu nại chung</option>
                <option value="application">Liên quan đến hồ sơ đăng ký</option>
                <option value="payout">Liên quan đến chi trả</option>
                <option value="officer">Liên quan đến cán bộ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            {/* Mã hồ sơ (nếu liên quan) */}
            {formData.type === 'application' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã hồ sơ (nếu liên quan)
                </label>
                <input
                  type="text"
                  name="application_id"
                  value={formData.application_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ví dụ: APP001"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nhập mã hồ sơ nếu khiếu nại liên quan đến hồ sơ đăng ký cụ thể
                </p>
              </div>
            )}

            {/* Tiêu đề */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tóm tắt nội dung khiếu nại"
                required
              />
            </div>

            {/* Nội dung chi tiết */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nội dung khiếu nại <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mô tả chi tiết nội dung khiếu nại của bạn..."
                required
              />
            </div>

            {/* File đính kèm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload className="inline w-4 h-4 mr-1" />
                Tài liệu minh chứng đính kèm
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <p className="text-sm text-gray-600 mb-2">
                  Cho phép: <strong>.png, .jpg, .jpeg, .docx, .pdf</strong> (tối đa 10MB/tệp)
                </p>
                <input
                  type="file"
                  multiple
                  accept=".png,.jpg,.jpeg,.docx,.pdf"
                  onChange={onFilesSelected}
                  className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {uploadError && (
                  <p className="text-red-600 text-sm mt-2">{uploadError}</p>
                )}

                {/* Preview list */}
                {attachments.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {attachments.map((f) => {
                      const key = `${f.name}-${f.size}`;
                      const isImage = f.type.startsWith('image/');
                      return (
                        <li
                          key={key}
                          className="flex items-center justify-between bg-gray-50 rounded-md p-2 border border-gray-200"
                        >
                          <div className="flex items-center space-x-3 overflow-hidden">
                            {isImage ? (
                              <img
                                src={URL.createObjectURL(f)}
                                alt={f.name}
                                className="h-10 w-10 object-cover rounded border"
                              />
                            ) : (
                              <span className="text-2xl">
                                {f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf') ? '📕' : 
                                 f.name.toLowerCase().endsWith('.docx') || f.type.includes('wordprocessingml') ? '📘' : '📄'}
                              </span>
                            )}
                            <div className="truncate">
                              <p className="text-sm font-medium truncate">{f.name}</p>
                              <p className="text-xs text-gray-500">{Math.round(f.size / 1024)} KB</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(key)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {/* Lưu ý */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Lưu ý:</strong>
              </p>
              <ul className="text-sm text-yellow-800 mt-2 space-y-1 list-disc list-inside">
                <li>Vui lòng cung cấp thông tin chính xác và đầy đủ</li>
                <li>Đính kèm minh chứng để hỗ trợ quá trình xử lý</li>
                <li>Cán bộ sẽ liên hệ qua số điện thoại/email đã đăng ký</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex justify-between pt-4">
              <a
                href="#/"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </a>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Gửi đơn khiếu nại
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
};

export default CreateComplaint;
