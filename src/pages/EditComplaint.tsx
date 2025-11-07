import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { FileText, Upload, X, CheckCircle, Save, Loader } from 'lucide-react';
import NavigationHero from '../components/NavigationHero';
import { useAuth } from '../contexts/AuthContext';

const EditComplaint: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<any[]>([]);
  const [documentsToDelete, setDocumentsToDelete] = useState<number[]>([]);
  const [complaintCode, setComplaintCode] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'general',
    application_id: ''
  });

  useEffect(() => {
    fetchComplaintData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchComplaintData = async () => {
    try {
      console.log('Fetching complaint with id:', id);
      const response = await api.get(`/api/complaints/${id}`);
      console.log('Response:', response);
      if (response.success && response.complaint) {
        const complaint = response.complaint;
        console.log('Complaint loaded:', complaint);
        
        // Save complaint code
        setComplaintCode(complaint.code || '');
        
        // Check if complaint can be edited
        // Citizens can only edit pending complaints
        // Officers and Admins can edit any status
        const userRole = user?.role;
        if (userRole === 'CITIZEN' && complaint.status !== 'pending') {
          alert('Chỉ có thể sửa đơn khiếu nại đang ở trạng thái "Chờ xử lý"');
          navigate(-1);
          return;
        }

        setFormData({
          title: complaint.title || complaint.subject || '',
          description: complaint.description || complaint.content || '',
          type: complaint.type || 'general',
          application_id: complaint.application_id || ''
        });

        // Load existing documents
        if (response.documents && response.documents.length > 0) {
          setExistingDocuments(response.documents);
        }
      } else {
        console.log('No complaint found, redirecting...');
        navigate('/my-complaints');
      }
    } catch (error) {
      console.error('Error fetching complaint:', error);
      alert('Lỗi khi tải dữ liệu đơn khiếu nại: ' + (error as Error).message);
      navigate('/my-complaints');
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const removeExistingDocument = (docId: number) => {
    setDocumentsToDelete(prev => [...prev, docId]);
    setExistingDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

    if (bad.length > 0) {
      setUploadError(`Không thể tải lên: ${bad.join(', ')}`);
    }
    setAttachments(prev => [...prev, ...ok]);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('type', formData.type);
      if (formData.application_id) {
        formDataToSend.append('application_id', formData.application_id);
      }

      // Send documents to delete
      if (documentsToDelete.length > 0) {
        formDataToSend.append('documentsToDelete', JSON.stringify(documentsToDelete));
      }

      attachments.forEach((file) => {
        formDataToSend.append('documents', file);
      });

      const response = await api.putForm(`/api/complaints/${id}`, formDataToSend);

      if (response.success) {
        setSubmitSuccess(true);
        // Auto close modal and redirect after 2.5 seconds
        setTimeout(() => {
          // If officer/admin, go back to complaints management
          if (user?.role === 'OFFICER' || user?.role === 'ADMIN') {
            navigate('/officer/complaints');
          } else {
            // For citizens, go to complaint detail
            navigate(`/complaint/${id}`);
          }
        }, 2500);
      }
    } catch (error: any) {
      console.error('Update complaint error:', error);
      const errorMessage = error.message || 'Có lỗi xảy ra khi cập nhật đơn khiếu nại';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <NavigationHero />
        <div className="py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Loading Skeleton with Animation */}
            <div className="animate-fadeIn">
              {/* Header Skeleton */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="bg-white bg-opacity-20 p-4 rounded-xl w-16 h-16"></div>
                  <div className="flex-1">
                    <div className="h-8 bg-white bg-opacity-20 rounded-lg w-3/4 mb-2"></div>
                    <div className="h-4 bg-white bg-opacity-20 rounded-lg w-1/2"></div>
                  </div>
                </div>
              </div>
              
              {/* Form Skeleton */}
              <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="flex justify-center items-center py-8">
                  <Loader className="w-12 h-12 animate-spin text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
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
              <CheckCircle className="h-12 w-12 text-white" strokeWidth={3} />
            </div>
            
            {/* Success Title with Gradient */}
            <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
              Cập nhật thành công! ✨
            </h3>
            
            {/* Description */}
            <p className="text-gray-600 mb-2 leading-relaxed text-lg">
              Đơn khiếu nại đã được cập nhật
            </p>
            
            <p className="text-sm text-gray-500 mb-6">
              {user?.role === 'OFFICER' || user?.role === 'ADMIN' 
                ? 'Đang quay về trang quản lý khiếu nại...' 
                : 'Đang chuyển đến chi tiết đơn khiếu nại...'}
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
              <span className="text-sm font-medium">Đã lưu thay đổi</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavigationHero />
      
      {/* Modal Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fadeIn overflow-y-auto py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Modal Card */}
          <div className="bg-white rounded-2xl shadow-2xl transform animate-scaleIn max-h-[90vh] overflow-y-auto">
            {/* Header Card */}
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl shadow-xl p-6 text-white overflow-hidden sticky top-0 z-10">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <circle cx="20" cy="20" r="1" fill="white" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Content */}
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="bg-white bg-opacity-20 backdrop-blur-sm p-2 rounded-lg hover:bg-opacity-30 transition-all"
                    title="Đóng"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold mb-1">Sửa đơn khiếu nại</h1>
                    <p className="text-blue-100 text-sm">
                      Cập nhật thông tin đơn khiếu nại của bạn
                    </p>
                  </div>
                </div>
                {complaintCode && (
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-xl">
                    <span className="text-sm font-semibold">Mã: {complaintCode}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Form */}
            <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Section - Card Style */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-200 group hover:shadow-md transition-all">
                <label className="flex items-center gap-3 text-sm font-bold text-gray-800 mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg group-focus-within:bg-blue-200 transition-colors">
                    <span className="text-xl">📝</span>
                  </div>
                  <span className="group-focus-within:text-blue-600 transition-colors">
                    Tiêu đề khiếu nại <span className="text-red-500">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-400 hover:shadow-md"
                  placeholder="Nhập tiêu đề ngắn gọn"
                />
              </div>

              {/* Type Section - Card Style */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-200 group hover:shadow-md transition-all">
                <label className="flex items-center gap-3 text-sm font-bold text-gray-800 mb-3">
                  <div className="bg-purple-100 p-2 rounded-lg group-focus-within:bg-purple-200 transition-colors">
                    <span className="text-xl">🏷️</span>
                  </div>
                  <span className="group-focus-within:text-purple-600 transition-colors">
                    Loại khiếu nại <span className="text-red-500">*</span>
                  </span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all cursor-pointer hover:border-purple-400 hover:shadow-md"
                >
                  <option value="general">Khiếu nại chung</option>
                  <option value="application">Về hồ sơ trợ cấp</option>
                  <option value="payout">Về thanh toán</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              {/* Application ID (optional) - Card Style */}
              {formData.type === 'application' && (
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-5 rounded-xl border border-cyan-200 animate-fadeIn hover:shadow-md transition-all">
                  <label className="flex items-center gap-3 text-sm font-bold text-cyan-800 mb-3">
                    <div className="bg-cyan-100 p-2 rounded-lg">
                      <span className="text-xl">📋</span>
                    </div>
                    <span>Mã hồ sơ liên quan (nếu có)</span>
                  </label>
                  <input
                    type="text"
                    name="application_id"
                    value={formData.application_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border-2 border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all hover:border-cyan-400 hover:shadow-md"
                    placeholder="Ví dụ: HS-2024-001"
                  />
                </div>
              )}

              {/* Description Section - Card Style */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200 group hover:shadow-md transition-all">
                <label className="flex items-center gap-3 text-sm font-bold text-gray-800 mb-3">
                  <div className="bg-green-100 p-2 rounded-lg group-focus-within:bg-green-200 transition-colors">
                    <span className="text-xl">✍️</span>
                  </div>
                  <span className="group-focus-within:text-green-600 transition-colors">
                    Nội dung chi tiết <span className="text-red-500">*</span>
                  </span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={8}
                  className="w-full px-4 py-3 bg-white border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-all hover:border-green-400 hover:shadow-md"
                  placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                />
              </div>

              {/* File Upload Section - Card Style */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-5 rounded-xl border border-orange-200 hover:shadow-md transition-all">
                <label className="flex items-center gap-3 text-sm font-bold text-gray-800 mb-4">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <span className="text-xl">📎</span>
                  </div>
                  <span>Tài liệu đính kèm (nếu có)</span>
                </label>

                {/* Existing documents */}
                {existingDocuments.length > 0 && (
                  <div className="mb-4 animate-fadeIn">
                    <p className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                      <span className="text-lg">📁</span>
                      Tài liệu hiện có:
                    </p>
                    <div className="space-y-2">
                      {existingDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl hover:shadow-lg hover:scale-[1.01] transition-all duration-200 group">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-800">{doc.file_name}</span>
                              <p className="text-xs text-blue-600">Đã tải lên trước đó</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExistingDocument(doc.id)}
                            className="text-red-600 hover:text-white hover:bg-red-500 p-2 rounded-lg transition-all duration-200 transform hover:scale-110"
                            title="Xóa file này"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload new files */}
                <div className="relative border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 cursor-pointer group overflow-hidden">
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                  
                  <div className="relative">
                    <Upload className="w-12 h-12 text-blue-500 mx-auto mb-3 transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300" />
                    <label className="cursor-pointer block">
                      <span className="text-blue-600 hover:text-blue-700 font-bold text-lg group-hover:text-purple-600 transition-colors">
                        ➕ Chọn file mới để tải lên
                      </span>
                      <input
                        type="file"
                        multiple
                        onChange={onFilesSelected}
                        className="hidden"
                        accept=".png,.jpg,.jpeg,.pdf,.docx"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Định dạng: PNG, JPG, JPEG, PDF, DOCX (tối đa 10MB/file)
                    </p>
                  </div>
                </div>

                {uploadError && (
                  <div className="mt-3 p-3 bg-red-50 border-2 border-red-200 rounded-xl animate-fadeIn">
                    <p className="text-sm text-red-600 font-medium flex items-center gap-2">
                      <span className="text-lg">⚠️</span>
                      {uploadError}
                    </p>
                  </div>
                )}

                {/* New files to upload */}
                {attachments.length > 0 && (
                  <div className="mt-4 animate-fadeIn">
                    <p className="text-sm font-semibold text-green-600 mb-3 flex items-center gap-2">
                      <span className="text-lg">✅</span>
                      File mới sẽ được thêm:
                    </p>
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl hover:shadow-lg hover:scale-[1.01] transition-all duration-200 group animate-scaleIn">
                          <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition-colors">
                              <FileText className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-800">{file.name}</span>
                              <span className="text-xs text-green-600 block">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-white hover:bg-red-500 p-2 rounded-lg transition-all duration-200 transform hover:scale-110"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Info box - Card Style */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-5 hover:shadow-md transition-all duration-300 animate-fadeIn">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <span className="text-xl">💡</span>
                  </div>
                  <p className="text-sm font-bold text-blue-800 mt-1">
                    Lưu ý quan trọng:
                  </p>
                </div>
                <ul className="text-sm text-blue-700 space-y-2 list-none ml-0">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">✓</span>
                    <span>Chỉ có thể sửa đơn khi đơn ở trạng thái "Chờ xử lý"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">✓</span>
                    <span>File đính kèm mới sẽ được thêm vào đơn khiếu nại</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">✓</span>
                    <span>Thông tin cập nhật sẽ được ghi nhận và gửi đến cán bộ xử lý</span>
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 font-bold transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2 group"
                >
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Hủy</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg hover:shadow-2xl transform hover:scale-[1.02] flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></span>
                  <span className="relative flex items-center gap-2">
                    {isSubmitting ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Đang cập nhật...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                        Cập nhật đơn khiếu nại
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditComplaint;
