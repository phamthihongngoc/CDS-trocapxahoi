import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, ChevronDown, Eye, EyeOff, Check } from 'lucide-react';
import { UserRole } from '../types';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'citizen' | 'officer' | 'admin' | ''>('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        // Save credentials if remember me is checked
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
          localStorage.setItem('rememberedPassword', password);
          localStorage.setItem('rememberedRole', selectedRole);
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberedPassword');
          localStorage.removeItem('rememberedRole');
        }

        // Redirect based on user role
        const userRole = localStorage.getItem('userRole');
        if (userRole === UserRole.OFFICER || userRole === UserRole.ADMIN) {
          window.location.hash = '/officer/dashboard';
        } else {
          window.location.hash = '/';
        }
      } else {
        setError('Email/CCCD hoặc mật khẩu không chính xác');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load remembered credentials on component mount - only if remember me was checked
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedPassword = localStorage.getItem('rememberedPassword');
    const rememberedRole = localStorage.getItem('rememberedRole') as 'citizen' | 'officer' | 'admin' | null;
    
    // Only load if all three exist (user had checked remember me)
    if (rememberedEmail && rememberedPassword && rememberedRole) {
      setEmail(rememberedEmail);
      setPassword(rememberedPassword);
      setSelectedRole(rememberedRole);
      setRememberMe(true);
    }
  }, []);

  // Get placeholder text based on selected role
  const getPlaceholder = () => {
    if (selectedRole === 'citizen') {
      return 'Số CCCD (12 chữ số)';
    } else if (selectedRole === 'officer' || selectedRole === 'admin') {
      return 'Email hoặc CCCD';
    }
    return 'Chọn vai trò trước';
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(/img/bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >      
      <div className="w-full max-w-md">
        {/* Form Login - Glass morphism với backdrop blur */}
        <div 
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20"
          style={{
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
              }}
            >
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Welcome to Login
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Selector Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vai trò
                </label>
                <div className="relative">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as 'citizen' | 'officer' | 'admin' | '')}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer"
                    required
                  >
                    <option value="" disabled>Chọn vai trò</option>
                    <option value="citizen">👥 Người dân</option>
                    <option value="officer">👨‍💼 Cán bộ</option>
                    <option value="admin">🔑 Quản trị viên</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CCCD/Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={getPlaceholder()}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Mật khẩu"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-green-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-green-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-green-600" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Remember Me Checkbox */}
              <div className="flex items-center">
                <div className="relative">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                  />
                  <label 
                    htmlFor="remember-me" 
                    className="w-5 h-5 border-2 border-gray-300 rounded flex items-center justify-center cursor-pointer peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all hover:border-blue-400"
                  >
                    {rememberMe && (
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    )}
                  </label>
                </div>
                <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-700 cursor-pointer select-none">
                  Nhớ tài khoản này
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center space-y-3">
              <a
                href="#/forgot-password"
                className="block text-gray-700 hover:text-gray-900 text-sm transition-colors font-medium"
              >
                Quên mật khẩu
              </a>
              <a
                href="#/register"
                className="block text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                Tạo tài khoản →
              </a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
