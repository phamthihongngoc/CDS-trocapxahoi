import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import api from '../utils/api';
import NavigationHero from '../components/NavigationHero';

interface Program {
  id: number;
  code: string;
  name: string;
  description: string;
  type: string;
  amount: number; // backend returns REAL -> number
}

const ApplicationForm: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [canSubmit, setCanSubmit] = useState(false); // Ngăn auto-submit ngay sau chuyển bước

  const [formData, setFormData] = useState({
    // Bước 1: Thông tin cá nhân
    citizen_id: '',
    full_name: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    email: '',
    
    // Bước 2: Địa chỉ
    address: '',
    district: '',
    commune: '',
    village: '',
    
    // Bước 3: Hộ gia đình
    household_size: 1,
    monthly_income: '',
    housing_condition: '',
    
    // Bước 4: Chương trình hỗ trợ
    program_id: '',
    application_type: '',
    support_amount: '',
    payment_schedule: '', // Kỳ lĩnh: một lần/hàng tháng/hàng quý
    payment_method: '', // Phương thức: tiền mặt/chuyển khoản
    bank_account_holder: '', // Chủ tài khoản (nếu chuyển khoản)
    bank_account_number: '', // Số tài khoản
    bank_name: '', // Tên ngân hàng
    
    // Bước 5: Tài liệu
    notes: ''
  });

  const [householdMembers, setHouseholdMembers] = useState([
    { name: '', relationship: 'Chủ hộ', age: '', occupation: '' }
  ]);

  useEffect(() => {
    fetchPrograms();
  }, []);

  // Auto-fill user information from logged in account
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        citizen_id: user.citizenId || '',
        full_name: user.fullName || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const fetchPrograms = async () => {
    try {
      const response = await api.get('/api/programs');
      if (response.success) {
        setPrograms(response.programs);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== UserRole.CITIZEN) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-xl font-semibold mb-2">Không có quyền truy cập</h2>
          <p className="text-gray-600 mb-4">Chỉ người dân mới có thể truy cập trang này.</p>
          <a href="#/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Về trang chủ
          </a>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ngăn Enter key submit form khi chưa ở bước 5
    if (e.key === 'Enter' && currentStep !== 5) {
      e.preventDefault();
      console.log('Enter key blocked - not at step 5');
    }
  };

  const handleProgramSelect = (program: Program) => {
    setFormData(prev => ({
      ...prev,
      program_id: program.id.toString(),
      application_type: program.type,
      // store as string for input; convert number -> string
      support_amount: program.amount != null ? String(program.amount) : ''
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.date_of_birth && formData.gender);
      case 2:
        return !!(formData.district);
      case 3:
        return !!(formData.household_size && formData.housing_condition && householdMembers.length > 0);
      case 4:
        console.log('Validating Step 4:', {
          program_id: formData.program_id,
          payment_schedule: formData.payment_schedule,
          payment_method: formData.payment_method,
          bank_account_holder: formData.bank_account_holder,
          bank_account_number: formData.bank_account_number,
          bank_name: formData.bank_name
        });
        // Bắt buộc: chọn chương trình, kỳ lĩnh, phương thức
        if (!formData.program_id || !formData.payment_schedule || !formData.payment_method) {
          console.log('❌ Missing required fields:', {
            program_id: !formData.program_id,
            payment_schedule: !formData.payment_schedule,
            payment_method: !formData.payment_method
          });
          return false;
        }
        // Nếu chọn chuyển khoản thì bắt buộc thông tin ngân hàng
        if (formData.payment_method === 'chuyen-khoan') {
          const isValid = !!(formData.bank_account_holder && formData.bank_account_number && formData.bank_name);
          if (!isValid) {
            console.log('❌ Missing bank info');
          }
          return isValid;
        }
        console.log('✅ Step 4 valid');
        return true;
      case 5:
        return true; // Bước 5 không bắt buộc
      default:
        return false;
    }
  };

  const nextStep = () => {
    console.log('🔵 nextStep called. Current step:', currentStep);
    
    if (currentStep === 4) {
      // Validation chi tiết cho bước 4
      console.log('🔍 Validating Step 4...');
      if (!formData.program_id) {
        alert('⚠️ Vui lòng chọn chương trình trợ cấp!');
        return;
      }
      if (!formData.payment_schedule) {
        alert('⚠️ Vui lòng chọn kỳ lĩnh!');
        return;
      }
      if (!formData.payment_method) {
        alert('⚠️ Vui lòng chọn phương thức nhận!');
        return;
      }
      if (formData.payment_method === 'chuyen-khoan') {
        if (!formData.bank_account_holder) {
          alert('⚠️ Vui lòng nhập tên chủ tài khoản ngân hàng!');
          return;
        }
        if (!formData.bank_account_number) {
          alert('⚠️ Vui lòng nhập số tài khoản ngân hàng!');
          return;
        }
        if (!formData.bank_name) {
          alert('⚠️ Vui lòng nhập tên ngân hàng!');
          return;
        }
      }
      console.log('✅ Step 4 validation passed');
    }
    
    if (validateStep(currentStep)) {
      console.log('✅ Moving to next step:', currentStep + 1);
      if (currentStep === 4) {
        // Reset canSubmit khi chuyển sang bước 5
        setCanSubmit(false);
      }
      setCurrentStep(prev => {
        const next = Math.min(prev + 1, 5);
        console.log('🟢 New step set to:', next);
        return next;
      });
    } else {
      console.log('❌ Validation failed');
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔴 handleSubmit called. Current step:', currentStep, 'canSubmit:', canSubmit);
    
    // Chỉ cho phép submit ở bước 5 VÀ sau khi user đã click nút submit
    if (currentStep !== 5) {
      console.log('❌ Cannot submit - not at step 5. Current step:', currentStep);
      alert('⚠️ Vui lòng hoàn thành tất cả các bước trước khi gửi đơn!');
      return;
    }

    if (!canSubmit) {
      console.log('❌ Submit blocked - user has not clicked submit button yet');
      return;
    }
    
    if (!validateStep(currentStep)) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    console.log('📤 Submitting application...');
    setIsSubmitting(true);
    try {
      // Build FormData to support file uploads (even when no files)
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, String(v ?? '')));
      fd.append('household_members_data', JSON.stringify(householdMembers));
      attachments.forEach((file) => fd.append('attachments', file, file.name));

      const response = await api.postForm('/api/applications/submit', fd);
      
      if (response.success) {
        setSubmitSuccess(true);
      } else {
        alert(response.error || 'Có lỗi xảy ra khi gửi đơn đăng ký');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Có lỗi xảy ra khi gửi đơn đăng ký. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== Files (Step 5) =====
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
    // Append to existing list (avoid duplicates by name/size)
    const dedup = new Map<string, File>();
    [...attachments, ...ok].forEach((f) => dedup.set(`${f.name}-${f.size}`, f));
    setAttachments(Array.from(dedup.values()));
    // reset input value so onChange triggers with same file again if needed
    e.target.value = '';
  };

  const removeAttachment = (key: string) => {
    setAttachments(prev => prev.filter(f => `${f.name}-${f.size}` !== key));
  };

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform animate-scaleIn">
          <div className="text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 animate-bounce">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Gửi đơn thành công!
            </h3>
            
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

  const selectedProgram = programs.find(p => p.id.toString() === formData.program_id);

  const stepTitles = [
    { num: 1, title: 'Cá nhân', icon: '👤' },
    { num: 2, title: 'Địa chỉ', icon: '📍' },
    { num: 3, title: 'Hộ gia đình', icon: '🏠' },
    { num: 4, title: 'Trợ cấp', icon: '💰' },
    { num: 5, title: 'Tài liệu', icon: '📄' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHero />
      <div className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {stepTitles.map((step, index) => (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-colors ${
                      currentStep >= step.num
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <p className={`text-xs mt-2 text-center ${
                    currentStep >= step.num ? 'text-blue-600 font-medium' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < stepTitles.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 transition-colors ${
                    currentStep > step.num ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Bước {currentStep}: {stepTitles[currentStep - 1].title}
            </h1>
          </div>

          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-blue-800">
                    <strong>Lưu ý:</strong> Số CCCD, Họ tên và Email được tự động điền từ tài khoản đăng nhập của bạn.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CMND/CCCD
                    </label>
                    <input
                      type="text"
                      name="citizen_id"
                      value={formData.citizen_id}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                      placeholder="Số CMND/CCCD"
                      title="Tự động điền từ tài khoản đăng nhập"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                      placeholder="Nhập họ và tên"
                      title="Tự động điền từ tài khoản đăng nhập"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày sinh <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giới tính <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Số điện thoại"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                      placeholder="Email"
                      title="Tự động điền từ tài khoản đăng nhập"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ chi tiết
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Số nhà, tên đường..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Huyện/Thành phố <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Chọn huyện/thành phố</option>
                      <option value="Dinh Lập">Huyện Dinh Lập</option>
                      <option value="Lộc Bình">Huyện Lộc Bình</option>
                      <option value="Cao Lộc">Huyện Cao Lộc</option>
                      <option value="Văn Quan">Huyện Văn Quan</option>
                      <option value="Bắc Sơn">Huyện Bắc Sơn</option>
                      <option value="Hữu Lũng">Huyện Hữu Lũng</option>
                      <option value="Chi Lăng">Huyện Chi Lăng</option>
                      <option value="Văn Lãng">Huyện Văn Lãng</option>
                      <option value="Bình Gia">Huyện Bình Gia</option>
                      <option value="Đông Đăng">Thành phố Đông Đăng</option>
                      <option value="Lạng Sơn">Thành phố Lạng Sơn</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Xã/Phường
                    </label>
                    <input
                      type="text"
                      name="commune"
                      value={formData.commune}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập tên xã/phường"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thôn/Khu phố
                    </label>
                    <input
                      type="text"
                      name="village"
                      value={formData.village}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập tên thôn/khu phố"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Household Info */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số thành viên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="household_size"
                      min="1"
                      value={formData.household_size}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thu nhập hàng tháng (VNĐ)</label>
                    <input
                      type="number"
                      name="monthly_income"
                      value={formData.monthly_income}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tình trạng nhà ở <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="housing_condition"
                      value={formData.housing_condition}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Chọn</option>
                      <option value="Nhà riêng kiên cố">Nhà riêng kiên cố</option>
                      <option value="Nhà riêng tạm">Nhà riêng tạm</option>
                      <option value="Thuê nhà">Thuê nhà</option>
                      <option value="Ở nhờ">Ở nhờ</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-md font-medium text-gray-800">Thành viên hộ gia đình</h3>
                    <button
                      type="button"
                      onClick={() => setHouseholdMembers([...householdMembers, { name: '', relationship: '', age: '', occupation: '' }])}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      + Thêm
                    </button>
                  </div>
                  
                  {householdMembers.map((member, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Thành viên {index + 1}</h4>
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => setHouseholdMembers(householdMembers.filter((_, i) => i !== index))}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <input
                          type="text"
                          placeholder="Họ tên *"
                          value={member.name}
                          onChange={(e) => {
                            const updated = [...householdMembers];
                            updated[index].name = e.target.value;
                            setHouseholdMembers(updated);
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          required
                        />
                        <select
                          value={member.relationship}
                          onChange={(e) => {
                            const updated = [...householdMembers];
                            updated[index].relationship = e.target.value;
                            setHouseholdMembers(updated);
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          required
                        >
                          <option value="">Quan hệ *</option>
                          <option value="Chủ hộ">Chủ hộ</option>
                          <option value="Vợ/Chồng">Vợ/Chồng</option>
                          <option value="Con">Con</option>
                          <option value="Cha/Mẹ">Cha/Mẹ</option>
                          <option value="Khác">Khác</option>
                        </select>
                        <input
                          type="number"
                          placeholder="Tuổi *"
                          min="0"
                          max="120"
                          value={member.age}
                          onChange={(e) => {
                            const updated = [...householdMembers];
                            updated[index].age = e.target.value;
                            setHouseholdMembers(updated);
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Nghề nghiệp"
                          value={member.occupation}
                          onChange={(e) => {
                            const updated = [...householdMembers];
                            updated[index].occupation = e.target.value;
                            setHouseholdMembers(updated);
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Support Program (Trợ cấp) */}
            {currentStep === 4 && (
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải chương trình...</p>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-600 mb-4">Chọn chương trình hỗ trợ phù hợp với hoàn cảnh của bạn:</p>
                    <div className="grid grid-cols-1 gap-4">
                      {programs.map((program) => (
                        <div
                          key={program.id}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            formData.program_id === program.id.toString()
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                          onClick={() => handleProgramSelect(program)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <input
                                  type="radio"
                                  name="program_id"
                                  value={program.id}
                                  checked={formData.program_id === program.id.toString()}
                                  onChange={() => handleProgramSelect(program)}
                                  className="mr-3"
                                />
                                <h3 className="text-lg font-semibold text-gray-900">{program.name}</h3>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{program.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Mã: {program.code}</span>
                                <span className="text-lg font-bold text-green-600">
                                  {Number(program.amount).toLocaleString('vi-VN')} đ
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {programs.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        Hiện chưa có chương trình hỗ trợ nào
                      </div>
                    )}

                    {/* Cho phép nhập chỉnh mức trợ cấp nếu khác mức mặc định */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mức trợ cấp đề nghị (VNĐ)
                      </label>
                      <input
                        type="number"
                        name="support_amount"
                        value={formData.support_amount}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập số tiền (tuỳ chọn)"
                      />
                      <p className="mt-1 text-xs text-gray-500">Có thể để trống để dùng theo chương trình đã chọn.</p>
                    </div>

                    {/* Kỳ lĩnh */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kỳ lĩnh <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="payment_schedule"
                        value={formData.payment_schedule}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        required
                      >
                        <option value="">-- Chọn kỳ lĩnh --</option>
                        <option value="mot-lan">Một lần</option>
                        <option value="hang-thang">Hàng tháng</option>
                        <option value="hang-quy">Hàng quý</option>
                        <option value="hang-nam">Hàng năm</option>
                      </select>
                    </div>

                    {/* Phương thức nhận */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phương thức nhận <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="payment_method"
                        value={formData.payment_method}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        required
                      >
                        <option value="">-- Chọn phương thức --</option>
                        <option value="tien-mat">Tiền mặt</option>
                        <option value="chuyen-khoan">Chuyển khoản ngân hàng</option>
                      </select>
                    </div>

                    {/* Thông tin ngân hàng (nếu chọn chuyển khoản) */}
                    {formData.payment_method === 'chuyen-khoan' && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                        <h4 className="text-sm font-semibold text-blue-900">Thông tin tài khoản ngân hàng</h4>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Chủ tài khoản <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="bank_account_holder"
                            value={formData.bank_account_holder}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Họ tên chủ tài khoản"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số tài khoản <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="bank_account_number"
                            value={formData.bank_account_number}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Số tài khoản ngân hàng"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ngân hàng <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="bank_name"
                            value={formData.bank_name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Tên ngân hàng và chi nhánh"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Step 5: Documents & Confirmation */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-3">📎 Tài liệu đính kèm</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">
                      Cho phép tải lên: <strong>.png, .jpg, .jpeg, .docx, .pdf</strong> (tối đa 10MB/tệp)
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
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Xoá
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">📋 Thông tin đăng ký của bạn:</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Họ tên:</strong> {formData.full_name}</p>
                    <p><strong>CMND/CCCD:</strong> {formData.citizen_id}</p>
                    <p><strong>Ngày sinh:</strong> {formData.date_of_birth}</p>
                    <p><strong>Giới tính:</strong> {formData.gender}</p>
                    <p><strong>Điện thoại:</strong> {formData.phone}</p>
                    <p><strong>Địa chỉ:</strong> {formData.address}, {formData.village}, {formData.commune}, {formData.district}</p>
                    <p><strong>Hộ gia đình:</strong> {formData.household_size} người - {formData.housing_condition}</p>
                    {selectedProgram && (
                      <>
                        <p><strong>Chương trình:</strong> {selectedProgram.name}</p>
                        <p><strong>Mức hỗ trợ:</strong> {Number(selectedProgram.amount).toLocaleString('vi-VN')} đ</p>
                      </>
                    )}
                    {formData.payment_schedule && (
                      <p><strong>Kỳ lĩnh:</strong> {
                        formData.payment_schedule === 'mot-lan' ? 'Một lần' :
                        formData.payment_schedule === 'hang-thang' ? 'Hàng tháng' :
                        formData.payment_schedule === 'hang-quy' ? 'Hàng quý' :
                        formData.payment_schedule === 'hang-nam' ? 'Hàng năm' : formData.payment_schedule
                      }</p>
                    )}
                    {formData.payment_method && (
                      <p><strong>Phương thức:</strong> {formData.payment_method === 'tien-mat' ? 'Tiền mặt' : 'Chuyển khoản'}</p>
                    )}
                    {formData.payment_method === 'chuyen-khoan' && formData.bank_account_number && (
                      <p><strong>Tài khoản NH:</strong> {formData.bank_account_number} - {formData.bank_account_holder} ({formData.bank_name})</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú/Lý do xin trợ cấp</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mô tả hoàn cảnh, lý do cần hỗ trợ (ví dụ: mất việc làm, tai nạn, bệnh hiểm nghèo, thiên tai...)&#10;&#10;Ghi chú này sẽ giúp cán bộ xét duyệt nhanh hơn."
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Vui lòng kiểm tra kỹ thông tin trước khi gửi. Sau khi gửi đơn, bạn sẽ nhận được mã hồ sơ để tra cứu tình trạng xử lý.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                disabled={currentStep === 1}
              >
                ← Quay lại
              </button>

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tiếp theo →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    console.log('🟢 Submit button clicked');
                    setCanSubmit(true);
                    // Trigger form submit sau khi set canSubmit
                    setTimeout(() => {
                      const form = document.querySelector('form');
                      if (form) {
                        form.requestSubmit();
                      }
                    }, 0);
                  }}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi đơn đăng ký ✓'}
                </button>
              )}
            </div>
          </form>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
