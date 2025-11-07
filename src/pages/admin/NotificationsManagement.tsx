import React, { useState, useEffect } from 'react';
import OfficerLayout from '../../components/OfficerLayout';
import { Bell, Send, Plus, Edit2, Trash2, X } from 'lucide-react';
import api from '../../utils/api';

interface Template {
  id: number;
  name: string;
  code: string;
  template_type: string;
  subject: string;
  content: string;
  variables: string;
}

const NotificationsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'broadcast' | 'templates'>('broadcast');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock templates data
  const mockTemplates: Template[] = [
    {
      id: 1,
      name: 'Thông báo phê duyệt hồ sơ',
      code: 'APPLICATION_APPROVED',
      template_type: 'email',
      subject: 'Hồ sơ {{application_code}} đã được phê duyệt',
      content: 'Kính gửi {{user_name}},\n\nHồ sơ {{application_code}} của bạn đã được phê duyệt. Số tiền hỗ trợ: {{amount}} VNĐ.\n\nTrân trọng.',
      variables: 'user_name, application_code, amount'
    },
    {
      id: 2,
      name: 'Thông báo từ chối hồ sơ',
      code: 'APPLICATION_REJECTED',
      template_type: 'email',
      subject: 'Hồ sơ {{application_code}} không được chấp thuận',
      content: 'Kính gửi {{user_name}},\n\nRất tiếc, hồ sơ {{application_code}} của bạn không đủ điều kiện. Lý do: {{reason}}.\n\nTrân trọng.',
      variables: 'user_name, application_code, reason'
    },
    {
      id: 3,
      name: 'Nhắc nhở bổ sung giấy tờ',
      code: 'DOCUMENTS_REQUIRED',
      template_type: 'sms',
      subject: 'Yêu cầu bổ sung giấy tờ',
      content: 'Hồ sơ {{application_code}} cần bổ sung: {{documents}}. Hạn: {{deadline}}.',
      variables: 'application_code, documents, deadline'
    },
    {
      id: 4,
      name: 'Thông báo chi trả thành công',
      code: 'PAYMENT_SUCCESS',
      template_type: 'push',
      subject: 'Đã chi trả {{amount}} VNĐ',
      content: 'Chúng tôi đã chi trả {{amount}} VNĐ cho hồ sơ {{application_code}}. Vui lòng kiểm tra tài khoản.',
      variables: 'amount, application_code'
    },
    {
      id: 5,
      name: 'Chào mừng người dùng mới',
      code: 'WELCOME_USER',
      template_type: 'email',
      subject: 'Chào mừng đến với Hệ thống Trợ cấp Xã hội',
      content: 'Xin chào {{user_name}},\n\nCảm ơn bạn đã đăng ký. Tài khoản của bạn: {{username}}.\n\nTrân trọng.',
      variables: 'user_name, username'
    }
  ];

  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    type: 'info',
    category: 'general',
    target: 'all',
    role: ''
  });

  const [templateForm, setTemplateForm] = useState({
    name: '',
    code: '',
    template_type: 'email',
    subject: '',
    content: '',
    variables: ''
  });

  useEffect(() => {
    if (activeTab === 'templates') {
      // Use mock data instead of API
      setTemplates(mockTemplates);
      setLoading(false);
    }
  }, [activeTab]);

  // Unused but kept for potential future API integration
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/admin/notification-templates');
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async () => {
    try {
      setLoading(true);
      // Simulate sending notification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const targetText = broadcastForm.target === 'all' 
        ? 'tất cả người dùng' 
        : `người dùng vai trò ${broadcastForm.role}`;
      
      alert(`Đã gửi thông báo "${broadcastForm.title}" tới ${targetText}!`);
      setShowBroadcastModal(false);
      setBroadcastForm({
        title: '',
        message: '',
        type: 'info',
        category: 'general',
        target: 'all',
        role: ''
      });
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      setLoading(true);
      if (editingTemplate) {
        // Update existing template
        setTemplates(prev => prev.map(t => 
          t.id === editingTemplate.id ? { ...t, ...templateForm } : t
        ));
        alert('Cập nhật template thành công!');
      } else {
        // Create new template
        const newTemplate: Template = {
          id: templates.length + 1,
          ...templateForm
        };
        setTemplates(prev => [...prev, newTemplate]);
        alert('Tạo template thành công!');
      }
      setShowTemplateModal(false);
      setEditingTemplate(null);
      setTemplateForm({
        name: '',
        code: '',
        template_type: 'email',
        subject: '',
        content: '',
        variables: ''
      });
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      code: template.code,
      template_type: template.template_type,
      subject: template.subject,
      content: template.content,
      variables: template.variables
    });
    setShowTemplateModal(true);
  };

  const handleDeleteTemplate = (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa template này?')) {
      return;
    }
    setTemplates(prev => prev.filter(t => t.id !== id));
    alert('Xóa template thành công!');
  };

  return (
    <OfficerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Thông báo</h1>
          <p className="text-gray-600 mt-1">Gửi thông báo và quản lý mẫu thông báo</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'broadcast'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Bell className="w-5 h-5 inline mr-2" />
            Gửi Thông báo
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'templates'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Mẫu Thông báo
          </button>
        </div>

        {/* Broadcast Tab */}
        {activeTab === 'broadcast' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Gửi Thông báo Mới
            </button>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <button
              onClick={() => { setEditingTemplate(null); setShowTemplateModal(true); }}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Tạo Template Mới
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div key={template.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-500">Code: {template.code}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600"><span className="font-semibold">Loại:</span> {template.template_type}</p>
                    <p className="text-gray-600"><span className="font-semibold">Tiêu đề:</span> {template.subject}</p>
                    <p className="text-gray-600 line-clamp-2"><span className="font-semibold">Nội dung:</span> {template.content}</p>
                    {template.variables && (
                      <p className="text-gray-500 text-xs">Biến: {template.variables}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Broadcast Modal */}
        {showBroadcastModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Gửi Thông báo</h2>
                <button onClick={() => setShowBroadcastModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề *</label>
                  <input
                    type="text"
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung *</label>
                  <textarea
                    value={broadcastForm.message}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Loại</label>
                    <select
                      value={broadcastForm.type}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="info">Thông tin</option>
                      <option value="warning">Cảnh báo</option>
                      <option value="success">Thành công</option>
                      <option value="error">Lỗi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Danh mục</label>
                    <select
                      value={broadcastForm.category}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, category: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="general">Chung</option>
                      <option value="system">Hệ thống</option>
                      <option value="application">Hồ sơ</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gửi tới</label>
                  <select
                    value={broadcastForm.target}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, target: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tất cả người dùng</option>
                    <option value="role">Theo vai trò</option>
                  </select>
                </div>

                {broadcastForm.target === 'role' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Vai trò</label>
                    <select
                      value={broadcastForm.role}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, role: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn vai trò</option>
                      <option value="citizen">Công dân</option>
                      <option value="officer">Cán bộ</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleBroadcast}
                    disabled={loading || !broadcastForm.title || !broadcastForm.message}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? 'Đang gửi...' : 'Gửi Thông báo'}
                  </button>
                  <button
                    onClick={() => setShowBroadcastModal(false)}
                    className="px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Template Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingTemplate ? 'Chỉnh sửa Template' : 'Tạo Template Mới'}
                </h2>
                <button onClick={() => { setShowTemplateModal(false); setEditingTemplate(null); }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tên template *</label>
                    <input
                      type="text"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Code *</label>
                    <input
                      type="text"
                      value={templateForm.code}
                      onChange={(e) => setTemplateForm({ ...templateForm, code: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Loại template</label>
                  <select
                    value={templateForm.template_type}
                    onChange={(e) => setTemplateForm({ ...templateForm, template_type: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="push">Push Notification</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề *</label>
                  <input
                    type="text"
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung *</label>
                  <textarea
                    value={templateForm.content}
                    onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                    placeholder="Sử dụng {{variable_name}} cho biến động..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Biến (phân cách bởi dấu phẩy)</label>
                  <input
                    type="text"
                    value={templateForm.variables}
                    onChange={(e) => setTemplateForm({ ...templateForm, variables: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                    placeholder="user_name, application_id, amount..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSaveTemplate}
                    disabled={loading || !templateForm.name || !templateForm.code}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? 'Đang lưu...' : editingTemplate ? 'Cập nhật' : 'Tạo Template'}
                  </button>
                  <button
                    onClick={() => { setShowTemplateModal(false); setEditingTemplate(null); }}
                    className="px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </OfficerLayout>
  );
};

export default NotificationsManagement;
