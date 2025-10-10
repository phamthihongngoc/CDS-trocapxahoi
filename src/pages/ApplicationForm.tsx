import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import api from '../utils/api';

interface Program {
  id: number;
  code: string;
  name: string;
  description: string;
  type: string;
  amount: string;
}

const ApplicationForm: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Bước 1: Thông tin cá nhân
    citizen_id: '',
    full_name: user?.fullName || '',
    date_of_birth: '',
    gender: '',
    phone: user?.phone || '',
    email: user?.email || '',
    
    // Bước 2: Địa chỉ
    address: user?.address || '',
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
    
    // Bước 5: Tài liệu
    notes: ''
  });

  const [householdMembers, setHouseholdMembers] = useState([
    { name: user?.fullName || '', relationship: 'Chủ hộ', age: '', occupation: '' }
  ]);

  useEffect(() => {
    fetchPrograms();
  }, []);

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

  const handleProgramSelect = (program: Program) => {
    setFormData(prev => ({
      ...prev,
      program_id: program.id.toString(),
      application_type: program.type,
      support_amount: program.amount.replace(/[^0-9.]/g, '')
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.citizen_id && formData.full_name && formData.date_of_birth && 
                  formData.gender && formData.phone);
      case 2:
        return !!(formData.address && formData.district && formData.commune && formData.village);
      case 3:
        return !!(formData.household_size && formData.housing_condition && householdMembers.length > 0);
      case 4:
        return !!(formData.program_id);
      case 5:
        return true; // Bước 5 không bắt buộc
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    } else {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        household_members_data: JSON.stringify(householdMembers)
      };
      
      const response = await api.post('/api/applications', submitData);
      
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

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-semibold mb-4 text-green-600">Gửi đơn thành công!</h2>
          <p className="text-gray-600 mb-6">
            Đơn đăng ký của bạn đã được gửi thành công. Hệ thống sẽ thông báo kết quả xử lý trong vòng 15 ngày làm việc.
          </p>
          <div className="space-y-3">
            <a
              href="#/applications"
              className="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tra cứu hồ sơ
            </a>
            <a href="#/" className="block text-gray-600 hover:text-gray-800">Về trang chủ</a>
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
    <div className="min-h-screen bg-gray-50 py-8">
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
          <div className="flex items-center mb-6">
            <a
              href="#/"
              className="mr-4 text-gray-600 hover:text-gray-800 transition-colors"
              title="Về trang chủ"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </a>
            <h1 className="text-2xl font-bold text-gray-800">
              Bước {currentStep}: {stepTitles[currentStep - 1].title}
            </h1>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CMND/CCCD <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="citizen_id"
                      value={formData.citizen_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Số CMND/CCCD"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
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
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    Địa chỉ chi tiết <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Số nhà, tên đường..."
                    required
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
                      Xã/Phường <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="commune"
                      value={formData.commune}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập tên xã/phường"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thôn/Khu phố <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="village"
                      value={formData.village}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập tên thôn/khu phố"
                      required
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

            {/* Step 4: Support Program */}
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
                                  {parseFloat(program.amount).toLocaleString('vi-VN')} đ
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
                  </>
                )}
              </div>
            )}

            {/* Step 5: Documents & Confirmation */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-3">📎 Tài liệu đính kèm</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <div className="text-4xl mb-2">📄</div>
                    <p className="text-sm text-gray-600 mb-3">
                      Tải lên các giấy tờ cần thiết (CMND, hộ khẩu, giấy xác nhận...)
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 text-left">
                      <p className="text-xs text-gray-500 mb-2">📌 <strong>Lưu ý:</strong></p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Chức năng upload tài liệu đang được phát triển</li>
                        <li>• Hiện tại bạn có thể mang giấy tờ gốc đến UBND để nộp trực tiếp</li>
                        <li>• Hoặc gửi qua email: baotro@langson.gov.vn kèm mã hồ sơ</li>
                      </ul>
                    </div>
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
                        <p><strong>Mức hỗ trợ:</strong> {parseFloat(selectedProgram.amount).toLocaleString('vi-VN')} đ</p>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (nếu có)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Thông tin bổ sung..."
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
                  type="submit"
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
  );
};

export default ApplicationForm;
