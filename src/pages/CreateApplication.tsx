import React, { useState, useEffect } from 'react';
import OfficerLayout from '../components/OfficerLayout';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import api from '../utils/api';

interface Program {
  id: number;
  name: string;
  description: string;
}

interface HouseholdMember {
  full_name: string;
  relationship: string;
  date_of_birth: string;
  occupation: string;
}

const CreateApplication: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [programs, setPrograms] = useState<Program[]>([]);
  
  // Step 1: Thông tin cá nhân
  const [citizenId, setCitizenId] = useState('');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [commune, setCommune] = useState('');
  const [village, setVillage] = useState('');
  
  // Step 2: Hộ gia đình
  const [householdSize, setHouseholdSize] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [housingCondition, setHousingCondition] = useState('');
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  
  // Step 3: Trợ cấp
  const [programId, setProgramId] = useState('');
  const [supportAmount, setSupportAmount] = useState('');
  const [notes, setNotes] = useState('');
  
  // Step 4: Tài liệu
  const [documents, setDocuments] = useState('');

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const data = await api.get('/api/programs');
      if (data.success) {
        setPrograms(data.programs);
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    }
  };

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const validateStep1 = () => {
    return citizenId && fullName && dateOfBirth && gender && phone && address;
  };

  const validateStep2 = () => {
    return householdSize && housingCondition;
  };

  const validateStep3 = () => {
    return programId;
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return validateStep1();
      case 2: return validateStep2();
      case 3: return validateStep3();
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const applicationData = {
        citizen_id: citizenId,
        full_name: fullName,
        date_of_birth: dateOfBirth,
        gender,
        phone,
        email,
        address,
        district,
        commune,
        village,
        household_size: householdSize ? parseInt(householdSize) : null,
        monthly_income: monthlyIncome ? parseFloat(monthlyIncome) : null,
        housing_condition: housingCondition,
        household_members_data: householdMembers,
        program_id: parseInt(programId),
        support_amount: supportAmount ? parseFloat(supportAmount) : null,
        notes,
        documents
      };

      const data = await api.post('/api/officer/applications', applicationData);

      if (data.success) {
        alert('Tạo hồ sơ thành công!');
        window.location.hash = '/officer/applications';
      } else {
        alert('Lỗi: ' + (data.error || 'Không thể tạo hồ sơ'));
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Đã xảy ra lỗi khi tạo hồ sơ');
    }
  };

  const addHouseholdMember = () => {
    setHouseholdMembers([...householdMembers, {
      full_name: '',
      relationship: '',
      date_of_birth: '',
      occupation: ''
    }]);
  };

  const removeHouseholdMember = (index: number) => {
    setHouseholdMembers(householdMembers.filter((_, i) => i !== index));
  };

  const updateHouseholdMember = (index: number, field: keyof HouseholdMember, value: string) => {
    const updated = [...householdMembers];
    updated[index] = { ...updated[index], [field]: value };
    setHouseholdMembers(updated);
  };

  return (
    <OfficerLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-3xl">👤</span> Tạo Hồ sơ Trợ cấp Mới
            </h1>
            <p className="text-gray-600 mt-1">Điền đầy đủ thông tin để tạo hồ sơ đề xuất trợ cấp xã hội</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Bước {currentStep} / {totalSteps}</span>
              <span className="text-sm font-medium text-gray-700">{Math.round(progress)}% hoàn thành</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step 1: Thông tin cá nhân */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số CCCD/CMND <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={citizenId}
                    onChange={(e) => setCitizenId(e.target.value)}
                    placeholder="Nhập số CCCD/CMND"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ và tên"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email (không bắt buộc)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ thường trú <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nhập địa chỉ thường trú"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Huyện/Thành phố</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Nhập huyện/thành phố"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Xã/Phường</label>
                  <input
                    type="text"
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    placeholder="Nhập xã/phường"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thôn/Xóm</label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="Nhập thôn/xóm"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Hộ gia đình */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Thông tin hộ gia đình</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số thành viên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={householdSize}
                    onChange={(e) => setHouseholdSize(e.target.value)}
                    placeholder="Nhập số thành viên"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thu nhập hàng tháng (VND)
                  </label>
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    placeholder="Nhập thu nhập"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Điều kiện nhà ở <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={housingCondition}
                    onChange={(e) => setHousingCondition(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Chọn điều kiện</option>
                    <option value="own_house">Nhà riêng</option>
                    <option value="rented">Thuê trọ</option>
                    <option value="temporary">Nhà tạm</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-gray-900">Thành viên hộ gia đình</h3>
                  <button
                    onClick={addHouseholdMember}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    + Thêm thành viên
                  </button>
                </div>

                {householdMembers.map((member, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Họ và tên"
                        value={member.full_name}
                        onChange={(e) => updateHouseholdMember(index, 'full_name', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Quan hệ (Cha, Mẹ, Con...)"
                        value={member.relationship}
                        onChange={(e) => updateHouseholdMember(index, 'relationship', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="date"
                        value={member.date_of_birth}
                        onChange={(e) => updateHouseholdMember(index, 'date_of_birth', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Nghề nghiệp"
                        value={member.occupation}
                        onChange={(e) => updateHouseholdMember(index, 'occupation', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={() => removeHouseholdMember(index)}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Xóa thành viên
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Trợ cấp */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Thông tin trợ cấp</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chương trình trợ cấp <span className="text-red-500">*</span>
                </label>
                <select
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Chọn chương trình</option>
                  {programs.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền đề xuất (VND)
                </label>
                <input
                  type="number"
                  value={supportAmount}
                  onChange={(e) => setSupportAmount(e.target.value)}
                  placeholder="Nhập số tiền đề xuất"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Nhập ghi chú về hồ sơ (nếu có)"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Step 4: Tài liệu */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Tài liệu đính kèm</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh sách tài liệu
                </label>
                <textarea
                  value={documents}
                  onChange={(e) => setDocuments(e.target.value)}
                  placeholder="Nhập danh sách tài liệu đính kèm (ví dụ: Giấy khai sinh, Sổ hộ khẩu...)"
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Summary */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Tóm tắt hồ sơ</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Họ tên:</span> {fullName}</p>
                  <p><span className="font-medium">CCCD:</span> {citizenId}</p>
                  <p><span className="font-medium">Ngày sinh:</span> {dateOfBirth}</p>
                  <p><span className="font-medium">Địa chỉ:</span> {address}</p>
                  <p><span className="font-medium">Số thành viên hộ:</span> {householdSize}</p>
                  <p><span className="font-medium">Chương trình:</span> {programs.find(p => p.id === parseInt(programId))?.name || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Quay lại
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                  canProceed()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Tiếp theo
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check className="w-5 h-5" />
                Tạo hồ sơ
              </button>
            )}
          </div>
        </div>
      </div>
    </OfficerLayout>
  );
};

export default CreateApplication;
