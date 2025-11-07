import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OfficerLayout from '../components/OfficerLayout';
import { ChevronRight, ChevronLeft, Check, Upload, X, FileText, Loader } from 'lucide-react';
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

const EditApplication: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadPreview, setUploadPreview] = useState<string[]>([]);

  useEffect(() => {
    loadPrograms();
    loadApplicationData();
  }, [id]);
  const loadPrograms = async () => {
    try {
      const data = await api.get('/api/programs');
      if (data.success && Array.isArray(data.programs)) {
        setPrograms(data.programs);
      }
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  const loadApplicationData = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/api/applications/${id}`);
      
      if (data.success && data.application) {
        const app = data.application;
        
        // Step 1
        setCitizenId(app.citizen_id || '');
        setFullName(app.full_name || '');
        setDateOfBirth(app.date_of_birth || '');
        setGender(app.gender || '');
        setPhone(app.phone || '');
        setEmail(app.email || '');
        setAddress(app.address || '');
        setDistrict(app.district || '');
        setCommune(app.commune || '');
        setVillage(app.village || '');
        
        // Step 2
        setHouseholdSize(app.household_size?.toString() || '');
        setMonthlyIncome(app.monthly_income?.toString() || '');
        setHousingCondition(app.housing_condition || '');
        
        // Parse household members if exists
        if (app.household_members_data) {
          try {
            const members = typeof app.household_members_data === 'string' 
              ? JSON.parse(app.household_members_data)
              : app.household_members_data;
            setHouseholdMembers(Array.isArray(members) ? members : []);
          } catch (e) {
            console.error('Error parsing household members:', e);
            setHouseholdMembers([]);
          }
        }
        
        // Step 3
        setProgramId(app.program_id?.toString() || '');
        setSupportAmount(app.support_amount?.toString() || '');
        setNotes(app.notes || '');
        
        // Step 4
        setDocuments(app.documents || '');
      }
    } catch (error) {
      console.error('Error loading application:', error);
      alert('Không thể tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const isValidType = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);

    // Create previews for images
    validFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadPreview(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      } else {
        setUploadPreview(prev => [...prev, '']);
      }
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setUploadPreview(prev => prev.filter((_, i) => i !== index));
  };

  const addHouseholdMember = () => {
    setHouseholdMembers([...householdMembers, {
      full_name: '',
      relationship: '',
      date_of_birth: '',
      occupation: ''
    }]);
  };

  const updateHouseholdMember = (index: number, field: keyof HouseholdMember, value: string) => {
    const updated = [...householdMembers];
    updated[index] = { ...updated[index], [field]: value };
    setHouseholdMembers(updated);
  };

  const removeHouseholdMember = (index: number) => {
    setHouseholdMembers(householdMembers.filter((_, i) => i !== index));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!citizenId || !fullName || !dateOfBirth || !gender || !phone || !address) {
          alert('⚠️ Vui lòng điền đầy đủ thông tin cá nhân bắt buộc (đánh dấu *)');
          return false;
        }
        if (citizenId.length !== 12) {
          alert('⚠️ Số CCCD phải có đúng 12 chữ số');
          return false;
        }
        if (!/^[0-9]+$/.test(citizenId)) {
          alert('⚠️ Số CCCD chỉ được chứa chữ số');
          return false;
        }
        if (!/^[0-9]{10}$/.test(phone)) {
          alert('⚠️ Số điện thoại phải có 10 chữ số');
          return false;
        }
        return true;
      case 2:
        if (!householdSize || !monthlyIncome) {
          alert('⚠️ Vui lòng điền đầy đủ thông tin hộ gia đình bắt buộc (đánh dấu *)');
          return false;
        }
        if (parseInt(householdSize) < 1) {
          alert('⚠️ Số nhân khẩu phải lớn hơn 0');
          return false;
        }
        if (parseFloat(monthlyIncome) < 0) {
          alert('⚠️ Thu nhập không được âm');
          return false;
        }
        return true;
      case 3:
        if (!programId || !supportAmount) {
          alert('⚠️ Vui lòng chọn chương trình và nhập số tiền trợ cấp');
          return false;
        }
        if (parseFloat(supportAmount) <= 0) {
          alert('⚠️ Số tiền trợ cấp phải lớn hơn 0');
          return false;
        }
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    // Show confirmation modal instead of window.confirm
    setShowConfirmModal(true);
  };

  const confirmUpdate = async () => {
    setShowConfirmModal(false);
    
    try {
      setSubmitting(true);
      const formData = new FormData();
      
      // Step 1
      formData.append('citizen_id', citizenId);
      formData.append('full_name', fullName);
      formData.append('date_of_birth', dateOfBirth);
      formData.append('gender', gender);
      formData.append('phone', phone);
      formData.append('email', email);
      formData.append('address', address);
      formData.append('district', district);
      formData.append('commune', commune);
      formData.append('village', village);
      
      // Step 2
      formData.append('household_members_data', JSON.stringify(householdMembers));
      
      // Step 3
      formData.append('program_id', programId);
      formData.append('support_amount', supportAmount);
      formData.append('notes', notes);
      
      // Step 4 - attachments
      uploadedFiles.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await fetch(`http://localhost:3001/api/officer/applications/${id}`, {
        method: 'PUT',
        headers: {
          'x-user-id': localStorage.getItem('userId') || '',
          'x-user-role': localStorage.getItem('userRole') || ''
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          navigate('/officer/applications');
        }, 2500);
      } else {
        alert('❌ Lỗi: ' + (data.error || 'Không thể cập nhật hồ sơ'));
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('❌ Lỗi khi cập nhật hồ sơ. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <OfficerLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Đang tải thông tin hồ sơ...</p>
          </div>
        </div>
      </OfficerLayout>
    );
  }

  return (
    <OfficerLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">✏️ Chỉnh sửa Hồ sơ Trợ cấp</h1>
              <p className="text-blue-100">Cập nhật thông tin hồ sơ xin trợ cấp</p>
            </div>
            {fullName && (
              <div className="bg-white bg-opacity-20 rounded-lg px-6 py-3 backdrop-blur-sm">
                <p className="text-sm font-semibold text-blue-100">Người nộp đơn</p>
                <p className="text-xl font-bold">{fullName}</p>
                {citizenId && <p className="text-sm text-blue-100">CCCD: {citizenId}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: 'Thông tin cá nhân' },
              { step: 2, title: 'Hộ gia đình' },
              { step: 3, title: 'Trợ cấp' },
              { step: 4, title: 'Tài liệu' }
            ].map((item, index) => (
              <React.Fragment key={item.step}>
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    currentStep === item.step
                      ? 'bg-blue-600 text-white shadow-lg scale-110'
                      : currentStep > item.step
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > item.step ? <Check className="w-6 h-6" /> : item.step}
                  </div>
                  <span className={`mt-2 text-sm font-medium transition-colors ${
                    currentStep >= item.step ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {item.title}
                  </span>
                </div>
                {index < 3 && (
                  <div className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                    currentStep > item.step ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {/* Step 1: Thông tin cá nhân */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin cá nhân</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số CCCD <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={citizenId || ''}
                    onChange={(e) => setCitizenId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    maxLength={12}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName || ''}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth || ''}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={gender || ''}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone || ''}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email || ''}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={address || ''}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Số nhà, đường"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Huyện/Thị xã</label>
                  <input
                    type="text"
                    value={district || ''}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Xã/Phường</label>
                  <input
                    type="text"
                    value={commune || ''}
                    onChange={(e) => setCommune(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thôn/Bản</label>
                  <input
                    type="text"
                    value={village || ''}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Hộ gia đình */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin hộ gia đình</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số nhân khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={householdSize || ''}
                    onChange={(e) => setHouseholdSize(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thu nhập hàng tháng (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={monthlyIncome || ''}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tình trạng nhà ở
                </label>
                <select
                  value={housingCondition || ''}
                  onChange={(e) => setHousingCondition(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Chọn tình trạng</option>
                  <option value="Nhà kiên cố">Nhà kiên cố</option>
                  <option value="Nhà bán kiên cố">Nhà bán kiên cố</option>
                  <option value="Nhà tạm">Nhà tạm</option>
                  <option value="Không có nhà">Không có nhà</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Thành viên hộ gia đình
                  </label>
                  <button
                    type="button"
                    onClick={addHouseholdMember}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    + Thêm thành viên
                  </button>
                </div>

                {Array.isArray(householdMembers) && householdMembers.map((member, index) => (
                  <div key={index} className="border border-gray-300 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">Thành viên {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeHouseholdMember(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Họ tên</label>
                        <input
                          type="text"
                          value={member.full_name || ''}
                          onChange={(e) => updateHouseholdMember(index, 'full_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Quan hệ</label>
                        <input
                          type="text"
                          value={member.relationship || ''}
                          onChange={(e) => updateHouseholdMember(index, 'relationship', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Vợ/Chồng/Con"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Ngày sinh</label>
                        <input
                          type="date"
                          value={member.date_of_birth || ''}
                          onChange={(e) => updateHouseholdMember(index, 'date_of_birth', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Nghề nghiệp</label>
                        <input
                          type="text"
                          value={member.occupation || ''}
                          onChange={(e) => updateHouseholdMember(index, 'occupation', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Trợ cấp */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin trợ cấp</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chương trình trợ cấp <span className="text-red-500">*</span>
                </label>
                <select
                  value={programId || ''}
                  onChange={(e) => setProgramId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Chọn chương trình</option>
                  {Array.isArray(programs) && programs.length > 0 ? (
                    programs.map(program => (
                      <option key={program.id} value={program.id.toString()}>
                        {program.name} - {program.description}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Không có chương trình nào</option>
                  )}
                </select>
                {programs.length === 0 && (
                  <p className="text-sm text-amber-600 mt-2">
                    ⚠️ Chưa có chương trình trợ cấp nào trong hệ thống
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền trợ cấp (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={supportAmount || ''}
                  onChange={(e) => setSupportAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  value={notes || ''}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={4}
                  placeholder="Thông tin bổ sung về hồ sơ..."
                />
              </div>
            </div>
          )}

          {/* Step 4: Tài liệu */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tài liệu đính kèm</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả tài liệu
                </label>
                <textarea
                  value={documents || ''}
                  onChange={(e) => setDocuments(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Liệt kê các tài liệu đã nộp..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tải lên file đính kèm
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Kéo thả file hoặc click để chọn
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Hỗ trợ: PNG, JPG, PDF, DOCX (tối đa 10MB/file)
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".png,.jpg,.jpeg,.pdf,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
                  >
                    Chọn file
                  </label>
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-700">File đã chọn:</h3>
                  {Array.isArray(uploadedFiles) && uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        {uploadPreview[index] ? (
                          <img src={uploadPreview[index]} alt="" className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <FileText className="w-12 h-12 text-gray-400" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center gap-4">
          <div className="flex gap-3">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                currentStep === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700 hover:shadow-lg'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Quay lại
            </button>

            <button
              onClick={() => {
                setShowCancelModal(true);
                setTimeout(() => {
                  navigate('/officer/applications');
                }, 1500);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-all"
            >
              <X className="w-5 h-5" />
              Hủy
            </button>
          </div>

          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tiếp tục
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Cập nhật hồ sơ
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform animate-scaleIn">
            <div className="text-center">
              {/* Question Icon */}
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Xác nhận cập nhật
              </h3>
              
              {/* Message */}
              <p className="text-gray-600 mb-8 leading-relaxed">
                Bạn có chắc chắn muốn cập nhật hồ sơ này không?
                <br />
                <span className="text-sm text-gray-500 mt-2 block">Các thay đổi sẽ được lưu vào hệ thống.</span>
              </p>
              
              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    navigate('/officer/applications');
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all transform hover:scale-105"
                >
                  Không
                </button>
                <button
                  onClick={confirmUpdate}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  Có, cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform animate-scaleIn">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 animate-bounce">
                <Check className="h-10 w-10 text-green-600" strokeWidth={3} />
              </div>
              
              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Cập nhật thành công!
              </h3>
              
              {/* Message */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                Hồ sơ trợ cấp đã được cập nhật và lưu vào hệ thống.
                <br />
                <span className="text-sm text-gray-500">Đang chuyển về trang quản lý...</span>
              </p>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full animate-progress"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform animate-scaleIn">
            <div className="text-center">
              {/* Cancel Icon */}
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-orange-100 mb-6 animate-bounce">
                <X className="h-10 w-10 text-orange-600" strokeWidth={3} />
              </div>
              
              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Đã hủy!
              </h3>
              
              {/* Message */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                Các thay đổi đã không được lưu.
                <br />
                <span className="text-sm text-gray-500">Đang quay về trang trước...</span>
              </p>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 h-1.5 rounded-full animate-progress"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </OfficerLayout>
  );
};

export default EditApplication;
