import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, CheckCircle, ArrowRight } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'input' | 'confirm' | 'method' | 'success'>('input');
  const [emailOrCccd, setEmailOrCccd] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [resetMethod, setResetMethod] = useState<'email' | 'phone' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [maskedInfo, setMaskedInfo] = useState<{ phone?: string; email?: string }>({});
  const [countdown, setCountdown] = useState(3);

  const handleCheckAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrCccd })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setUserId(data.userId);
      setMaskedInfo({ phone: data.maskedPhone, email: data.maskedEmail });
      setStep('confirm');
    } catch (err: any) {
      setError(err.message || 'Không tìm thấy tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPassword = async () => {
    if (!resetMethod) return setError('Vui lòng chọn phương thức nhận mật khẩu');
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/send-new-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, method: resetMethod })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setStep('success');
      setCountdown(3);
    } catch (err: any) {
      setError(err.message || 'Lỗi gửi mật khẩu mới');
    } finally {
      setLoading(false);
    }
  };

  // Đếm ngược và tự động chuyển về trang đăng nhập
  useEffect(() => {
    if (step === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (step === 'success' && countdown === 0) {
      navigate('/login');
    }
  }, [step, countdown, navigate]);

  const renderSuccess = () => (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 text-center">
      <div className="mb-6">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">Đặt lại mật khẩu thành công!</h3>
      <p className="text-gray-600 mb-4">
        Mật khẩu mới đã được gửi đến {resetMethod === 'email' ? 'email' : 'số điện thoại'} của bạn.
      </p>
      <p className="text-sm text-gray-500 mb-6">
        Tự động chuyển về trang đăng nhập sau <span className="font-bold text-green-600">{countdown}</span> giây...
      </p>
      <Link to="/login" className="inline-flex items-center justify-center w-full py-3 px-6 rounded-xl text-white bg-green-600 hover:bg-green-700">
        Đăng nhập ngay
      </Link>
    </div>
  );

  const renderInput = () => (
    <form onSubmit={handleCheckAccount} className="space-y-5">
      <p className="text-center text-sm text-gray-600">Nhập CCCD hoặc Email để tìm tài khoản</p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">CCCD/Email</label>
        <input
          type="text"
          required
          value={emailOrCccd}
          onChange={(e) => setEmailOrCccd(e.target.value)}
          className="block w-full px-4 py-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-green-500"
          placeholder="Nhập CCCD hoặc Email"
        />
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}
      <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
        {loading ? 'Đang kiểm tra...' : 'Tìm tài khoản'}
      </button>
      <Link to="/login" className="block text-center text-sm text-gray-600 hover:text-gray-900"> Quay lại đăng nhập</Link>
    </form>
  );

  const renderConfirm = () => (
    <div className="space-y-5">
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <CheckCircle className="inline h-5 w-5 text-green-600 mr-2" />
        <span className="font-medium text-green-900">Đã tìm thấy tài khoản!</span>
        <p className="text-sm text-green-700 mt-2">Hệ thống sẽ cấp mật khẩu mới và gửi đến cho bạn.</p>
      </div>
      {maskedInfo.email && <div className="text-sm"> Email: <span className="font-medium">{maskedInfo.email}</span></div>}
      {maskedInfo.phone && <div className="text-sm"> SĐT: <span className="font-medium">{maskedInfo.phone}</span></div>}
      <button onClick={() => setStep('method')} className="w-full py-3 rounded-xl text-white bg-green-600 hover:bg-green-700">
        Tiếp tục <ArrowRight className="inline ml-2 h-5 w-5" />
      </button>
    </div>
  );

  const renderMethod = () => (
    <div className="space-y-5">
      <p className="text-center text-sm text-gray-600">Chọn phương thức nhận mật khẩu mới</p>
      <div className="space-y-3">
        {maskedInfo.email && (
          <button onClick={() => setResetMethod('email')} className={'w-full p-4 rounded-xl border-2 ' + (resetMethod === 'email' ? 'border-green-500 bg-green-50' : 'border-gray-200')}>
            <div className="flex items-center">
              <div className={'w-5 h-5 rounded-full border-2 mr-3 ' + (resetMethod === 'email' ? 'border-green-500 bg-green-500' : 'border-gray-300')}></div>
              <Mail className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Gửi qua Email</div>
                <div className="text-sm text-gray-500">{maskedInfo.email}</div>
              </div>
            </div>
          </button>
        )}
        {maskedInfo.phone && (
          <button onClick={() => setResetMethod('phone')} className={'w-full p-4 rounded-xl border-2 ' + (resetMethod === 'phone' ? 'border-green-500 bg-green-50' : 'border-gray-200')}>
            <div className="flex items-center">
              <div className={'w-5 h-5 rounded-full border-2 mr-3 ' + (resetMethod === 'phone' ? 'border-green-500 bg-green-500' : 'border-gray-300')}></div>
              <Phone className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Gửi qua SMS</div>
                <div className="text-sm text-gray-500">{maskedInfo.phone}</div>
              </div>
            </div>
          </button>
        )}
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}
      <button onClick={handleSendPassword} disabled={loading || !resetMethod} className="w-full py-3 rounded-xl text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
        {loading ? 'Đang gửi...' : 'Gửi mật khẩu mới'}
      </button>
    </div>
  );

  const bgStyle = { backgroundImage: 'url(/imgs/bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={bgStyle}>
      <div className="w-full max-w-md">
        {step === 'success' ? renderSuccess() : (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Quên mật khẩu</h2>
            {step === 'input' && renderInput()}
            {step === 'confirm' && renderConfirm()}
            {step === 'method' && renderMethod()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
