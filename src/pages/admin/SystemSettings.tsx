import { useState, useEffect } from 'react';
import { Settings, Database, Shield, Clock, Plus, Download, Trash2 } from 'lucide-react';
import OfficerLayout from '../../components/OfficerLayout';
import api from '../../utils/api';

interface Setting {
  id: number;
  setting_key: string;
  setting_value: string;
  category: string;
  description: string;
  data_type: string;
}

interface Backup {
  id: number;
  backup_name: string;
  backup_type: string;
  file_size: number;
  status: string;
  created_at: string;
}

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'backup' | 'automation'>('general');
  const [settings, setSettings] = useState<Setting[]>([]);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock settings data
  const mockSettings: Setting[] = [
    {
      id: 1,
      setting_key: 'system_name',
      setting_value: 'Hệ thống Trợ cấp Xã hội Lạng Sơn',
      category: 'general',
      description: 'Tên hiển thị của hệ thống',
      data_type: 'string'
    },
    {
      id: 2,
      setting_key: 'contact_email',
      setting_value: 'support@langson.gov.vn',
      category: 'general',
      description: 'Email hỗ trợ',
      data_type: 'string'
    },
    {
      id: 3,
      setting_key: 'timezone',
      setting_value: 'Asia/Ho_Chi_Minh',
      category: 'general',
      description: 'Múi giờ hệ thống',
      data_type: 'string'
    },
    {
      id: 4,
      setting_key: 'max_login_attempts',
      setting_value: '5',
      category: 'security',
      description: 'Số lần đăng nhập sai tối đa',
      data_type: 'number'
    },
    {
      id: 5,
      setting_key: 'session_timeout',
      setting_value: '3600',
      category: 'security',
      description: 'Thời gian timeout phiên (giây)',
      data_type: 'number'
    },
    {
      id: 6,
      setting_key: 'require_2fa',
      setting_value: 'false',
      category: 'security',
      description: 'Bắt buộc xác thực 2 yếu tố',
      data_type: 'boolean'
    },
    {
      id: 7,
      setting_key: 'auto_backup_enabled',
      setting_value: 'true',
      category: 'automation',
      description: 'Tự động sao lưu dữ liệu',
      data_type: 'boolean'
    },
    {
      id: 8,
      setting_key: 'backup_schedule',
      setting_value: '0 2 * * *',
      category: 'automation',
      description: 'Lịch sao lưu (cron format)',
      data_type: 'string'
    },
    {
      id: 9,
      setting_key: 'auto_approve_threshold',
      setting_value: '1000000',
      category: 'automation',
      description: 'Ngưỡng tự động phê duyệt (VNĐ)',
      data_type: 'number'
    },
    {
      id: 10,
      setting_key: 'notification_enabled',
      setting_value: 'true',
      category: 'general',
      description: 'Bật thông báo hệ thống',
      data_type: 'boolean'
    }
  ];

  // Mock backups data
  const mockBackups: Backup[] = [
    {
      id: 1,
      backup_name: 'backup_2025_01_04_02_00',
      backup_type: 'automatic',
      file_size: 15728640,
      status: 'completed',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      backup_name: 'backup_2025_01_03_02_00',
      backup_type: 'automatic',
      file_size: 15234560,
      status: 'completed',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      backup_name: 'backup_manual_2025_01_02',
      backup_type: 'manual',
      file_size: 14987264,
      status: 'completed',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 4,
      backup_name: 'backup_2025_01_01_02_00',
      backup_type: 'automatic',
      file_size: 14456832,
      status: 'completed',
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 5,
      backup_name: 'backup_2024_12_31_02_00',
      backup_type: 'automatic',
      file_size: 14123520,
      status: 'completed',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  useEffect(() => {
    // Use mock data
    setSettings(mockSettings);
    if (activeTab === 'backup') {
      setBackups(mockBackups);
    }
  }, [activeTab]);

  // Unused but kept for potential future API integration
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchSettings = async () => {
    try {
      const data = await api.get('/api/admin/system-settings');
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchBackups = async () => {
    try {
      const data = await api.get('/api/admin/backups');
      if (data.success) {
        setBackups(data.backups);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
    }
  };

  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      // Update mock data locally
      setSettings(prev => prev.map(s => 
        s.setting_key === key ? { ...s, setting_value: value } : s
      ));
      alert('Cập nhật thành công!');
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra');
    }
  };

  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      // Create mock backup
      const newBackup: Backup = {
        id: backups.length + 1,
        backup_name: `backup_manual_${new Date().toISOString().split('T')[0]}`,
        backup_type: 'manual',
        file_size: Math.floor(Math.random() * 5000000) + 10000000,
        status: 'completed',
        created_at: new Date().toISOString()
      };
      setBackups(prev => [newBackup, ...prev]);
      alert('Tạo backup thành công!');
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async (_id: number) => {
    if (!confirm('Bạn có chắc muốn khôi phục backup này? Hành động này không thể hoàn tác!')) {
      return;
    }
    try {
      setLoading(true);
      // Simulate restore
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Khôi phục thành công!');
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBackup = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa backup này?')) {
      return;
    }
    try {
      setBackups(prev => prev.filter(b => b.id !== id));
      alert('Xóa backup thành công!');
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <OfficerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="w-8 h-8" />
            Cài đặt hệ thống
          </h1>
          <p className="text-gray-600 mt-1">Quản lý cấu hình, bảo mật và sao lưu hệ thống</p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-4 gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'general'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Settings className="w-5 h-5 inline mr-2" />
            Chung
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'security'
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Shield className="w-5 h-5 inline mr-2" />
            Bảo mật
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'backup'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Database className="w-5 h-5 inline mr-2" />
            Sao lưu
          </button>
          <button
            onClick={() => setActiveTab('automation')}
            className={`px-4 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'automation'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Clock className="w-5 h-5 inline mr-2" />
            Tự động hóa
          </button>
        </div>

        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Cài đặt chung</h2>
            <div className="grid gap-4">
              {settings.filter(s => s.category === 'general').map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-gray-900">{setting.setting_key}</p>
                    <p className="text-sm text-gray-500">{setting.description}</p>
                  </div>
                  {setting.data_type === 'boolean' ? (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={setting.setting_value === 'true'}
                        onChange={(e) => handleUpdateSetting(setting.setting_key, e.target.checked.toString())}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  ) : (
                    <input
                      type="text"
                      value={setting.setting_value}
                      onChange={(e) => handleUpdateSetting(setting.setting_key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Cài đặt bảo mật</h2>
            <div className="grid gap-4">
              {settings.filter(s => s.category === 'security').map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
                  <div>
                    <p className="font-semibold text-gray-900">{setting.setting_key}</p>
                    <p className="text-sm text-gray-500">{setting.description}</p>
                  </div>
                  {setting.data_type === 'boolean' ? (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={setting.setting_value === 'true'}
                        onChange={(e) => handleUpdateSetting(setting.setting_key, e.target.checked.toString())}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  ) : (
                    <input
                      type="text"
                      value={setting.setting_value}
                      onChange={(e) => handleUpdateSetting(setting.setting_key, e.target.value)}
                      className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 w-64"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Backup Tab */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Sao lưu & Khôi phục</h2>
                <button
                  onClick={handleCreateBackup}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                  {loading ? 'Đang tạo...' : 'Tạo Backup Mới'}
                </button>
              </div>

              <div className="grid gap-4">
                {backups.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                    <div>
                      <p className="font-semibold text-gray-900">{backup.backup_name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(backup.created_at).toLocaleString('vi-VN')} • {formatFileSize(backup.file_size)} • {backup.backup_type}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRestoreBackup(backup.id)}
                        disabled={loading || backup.status !== 'completed'}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <Download className="w-4 h-4" />
                        Khôi phục
                      </button>
                      <button
                        onClick={() => handleDeleteBackup(backup.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Automation Tab */}
        {activeTab === 'automation' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Cài đặt tự động hóa</h2>
            <div className="grid gap-4">
              {settings.filter(s => s.category === 'automation').map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div>
                    <p className="font-semibold text-gray-900">{setting.setting_key}</p>
                    <p className="text-sm text-gray-500">{setting.description}</p>
                  </div>
                  {setting.data_type === 'boolean' ? (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={setting.setting_value === 'true'}
                        onChange={(e) => handleUpdateSetting(setting.setting_key, e.target.checked.toString())}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  ) : (
                    <input
                      type="text"
                      value={setting.setting_value}
                      onChange={(e) => handleUpdateSetting(setting.setting_key, e.target.value)}
                      className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 w-64"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </OfficerLayout>
  );
}