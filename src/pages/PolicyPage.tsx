import { Shield, Lock, Eye, FileText, UserCheck, Bell, AlertCircle } from 'lucide-react';
import NavigationHero from '../components/NavigationHero';

export default function PolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <NavigationHero />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 justify-center">
            <Shield className="w-10 h-10" />
            <div className="text-center">
              <h1 className="text-3xl font-bold">Chính Sách & Điều Khoản</h1>
              <p className="text-blue-100">Hệ thống Hỗ Trợ Xã Hội Tỉnh Lạng Sơn</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Quick Navigation */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Nội dung chính</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a href="#privacy" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200">
              <Lock className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-700">1. Chính sách bảo mật</span>
            </a>
            <a href="#data-collection" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200">
              <Eye className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-700">2. Thu thập thông tin</span>
            </a>
            <a href="#data-usage" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-700">3. Sử dụng dữ liệu</span>
            </a>
            <a href="#user-rights" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-700">4. Quyền của người dùng</span>
            </a>
            <a href="#security" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-700">5. Bảo mật thông tin</span>
            </a>
            <a href="#contact" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200">
              <Bell className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-700">6. Liên hệ</span>
            </a>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Section 1: Privacy Policy */}
          <section id="privacy" className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">1. Chính Sách Bảo Mật</h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Hệ thống Hỗ Trợ Xã Hội Tỉnh Lạng Sơn cam kết bảo vệ quyền riêng tư và thông tin cá nhân của 
                người dân. Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="font-semibold text-blue-900">Cam kết của chúng tôi:</p>
                <ul className="mt-2 space-y-2 list-disc list-inside text-blue-800">
                  <li>Bảo vệ thông tin cá nhân của bạn một cách an toàn</li>
                  <li>Chỉ sử dụng thông tin cho mục đích hỗ trợ xã hội</li>
                  <li>Không chia sẻ thông tin với bên thứ ba không được phép</li>
                  <li>Tuân thủ đầy đủ luật pháp về bảo vệ dữ liệu cá nhân</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2: Data Collection */}
          <section id="data-collection" className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 p-3 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">2. Thu Thập Thông Tin</h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>Chúng tôi thu thập các loại thông tin sau:</p>
              
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">2.1. Thông tin cá nhân bắt buộc:</h3>
                  <ul className="space-y-1 list-disc list-inside text-gray-700">
                    <li>Họ và tên đầy đủ</li>
                    <li>Số CMND/CCCD</li>
                    <li>Ngày tháng năm sinh</li>
                    <li>Giới tính</li>
                    <li>Số điện thoại</li>
                    <li>Địa chỉ email (nếu có)</li>
                    <li>Địa chỉ thường trú (xã/phường, huyện/thị xã)</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">2.2. Thông tin hộ gia đình:</h3>
                  <ul className="space-y-1 list-disc list-inside text-gray-700">
                    <li>Số thành viên trong hộ</li>
                    <li>Thu nhập hàng tháng</li>
                    <li>Điều kiện nhà ở</li>
                    <li>Thông tin thành viên gia đình (nếu cần)</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">2.3. Tài liệu đính kèm:</h3>
                  <ul className="space-y-1 list-disc list-inside text-gray-700">
                    <li>Ảnh CMND/CCCD</li>
                    <li>Sổ hộ khẩu</li>
                    <li>Giấy tờ chứng minh hoàn cảnh khó khăn</li>
                    <li>Các tài liệu liên quan khác</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">2.4. Thông tin tự động:</h3>
                  <ul className="space-y-1 list-disc list-inside text-gray-700">
                    <li>Địa chỉ IP</li>
                    <li>Thời gian truy cập hệ thống</li>
                    <li>Lịch sử thao tác trên hệ thống</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Data Usage */}
          <section id="data-usage" className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">3. Sử Dụng Dữ Liệu</h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>Thông tin của bạn được sử dụng cho các mục đích sau:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">✓ Xét duyệt đơn hỗ trợ</h3>
                  <p className="text-sm text-purple-800">
                    Đánh giá điều kiện và quyền lợi để cấp hỗ trợ xã hội
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">✓ Xác minh thông tin</h3>
                  <p className="text-sm text-purple-800">
                    Kiểm tra tính chính xác và hợp lệ của hồ sơ
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">✓ Thông báo kết quả</h3>
                  <p className="text-sm text-purple-800">
                    Gửi thông báo về trạng thái đơn qua SMS, email hoặc hệ thống
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">✓ Giải quyết khiếu nại</h3>
                  <p className="text-sm text-purple-800">
                    Xử lý và phản hồi các khiếu nại, thắc mắc từ người dân
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">✓ Thống kê báo cáo</h3>
                  <p className="text-sm text-purple-800">
                    Tạo báo cáo tổng hợp cho cơ quan quản lý (đã ẩn danh)
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">✓ Cải thiện dịch vụ</h3>
                  <p className="text-sm text-purple-800">
                    Nâng cao chất lượng hệ thống và trải nghiệm người dùng
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mt-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-900">Lưu ý quan trọng:</p>
                    <p className="text-sm text-yellow-800 mt-1">
                      Chúng tôi KHÔNG sử dụng thông tin của bạn cho mục đích thương mại, quảng cáo 
                      hoặc bán cho bên thứ ba.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: User Rights */}
          <section id="user-rights" className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-orange-100 p-3 rounded-lg">
                <UserCheck className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">4. Quyền Của Người Dùng</h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>Bạn có các quyền sau đối với thông tin cá nhân của mình:</p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <span className="font-bold text-orange-600 text-lg">1</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Quyền truy cập</h3>
                    <p className="text-sm text-gray-700 mt-1">
                      Xem và tải xuống toàn bộ thông tin cá nhân mà chúng tôi lưu trữ về bạn
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <span className="font-bold text-orange-600 text-lg">2</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Quyền chỉnh sửa</h3>
                    <p className="text-sm text-gray-700 mt-1">
                      Yêu cầu sửa đổi thông tin cá nhân nếu có sai sót hoặc không chính xác
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <span className="font-bold text-orange-600 text-lg">3</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Quyền xóa dữ liệu</h3>
                    <p className="text-sm text-gray-700 mt-1">
                      Yêu cầu xóa thông tin cá nhân (trừ các thông tin bắt buộc theo quy định pháp luật)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <span className="font-bold text-orange-600 text-lg">4</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Quyền rút lại đồng ý</h3>
                    <p className="text-sm text-gray-700 mt-1">
                      Rút lại sự đồng ý xử lý dữ liệu cá nhân bất kỳ lúc nào
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <span className="font-bold text-orange-600 text-lg">5</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Quyền khiếu nại</h3>
                    <p className="text-sm text-gray-700 mt-1">
                      Gửi khiếu nại về cách thức xử lý dữ liệu của chúng tôi
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <span className="font-bold text-orange-600 text-lg">6</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Quyền hạn chế xử lý</h3>
                    <p className="text-sm text-gray-700 mt-1">
                      Yêu cầu hạn chế việc xử lý dữ liệu cá nhân trong một số trường hợp
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
                <p className="font-semibold text-blue-900 mb-2">Cách thực hiện quyền của bạn:</p>
                <p className="text-sm text-blue-800">
                  Để thực hiện các quyền trên, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại 
                  trong mục "Liên hệ" bên dưới. Chúng tôi sẽ phản hồi trong vòng 15 ngày làm việc.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Security */}
          <section id="security" className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-100 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">5. Bảo Mật Thông Tin</h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Chúng tôi áp dụng các biện pháp bảo mật nghiêm ngặt để bảo vệ thông tin của bạn:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h3 className="font-semibold text-red-900 mb-2">🔒 Mã hóa dữ liệu</h3>
                  <p className="text-sm text-red-800">
                    Tất cả dữ liệu được mã hóa khi truyền tải và lưu trữ bằng công nghệ tiên tiến
                  </p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h3 className="font-semibold text-red-900 mb-2">👤 Kiểm soát truy cập</h3>
                  <p className="text-sm text-red-800">
                    Chỉ cán bộ được ủy quyền mới có quyền truy cập thông tin của bạn
                  </p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h3 className="font-semibold text-red-900 mb-2">🛡️ Tường lửa bảo vệ</h3>
                  <p className="text-sm text-red-800">
                    Hệ thống được bảo vệ bởi tường lửa và các công cụ bảo mật hiện đại
                  </p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h3 className="font-semibold text-red-900 mb-2">📋 Nhật ký hoạt động</h3>
                  <p className="text-sm text-red-800">
                    Ghi lại toàn bộ hoạt động truy cập và thao tác với dữ liệu
                  </p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h3 className="font-semibold text-red-900 mb-2">🔄 Sao lưu định kỳ</h3>
                  <p className="text-sm text-red-800">
                    Dữ liệu được sao lưu thường xuyên để đảm bảo an toàn
                  </p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h3 className="font-semibold text-red-900 mb-2">🎓 Đào tạo nhân viên</h3>
                  <p className="text-sm text-red-800">
                    Cán bộ được đào tạo thường xuyên về bảo mật thông tin
                  </p>
                </div>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg mt-4">
                <p className="font-semibold text-gray-900 mb-2">Trách nhiệm của bạn:</p>
                <ul className="space-y-1 list-disc list-inside text-gray-700 text-sm">
                  <li>Giữ bí mật thông tin đăng nhập (tên đăng nhập, mật khẩu)</li>
                  <li>Không chia sẻ tài khoản với người khác</li>
                  <li>Đăng xuất sau khi sử dụng hệ thống trên máy tính chung</li>
                  <li>Thông báo ngay nếu phát hiện truy cập trái phép</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 6: Contact */}
          <section id="contact" className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl shadow-md p-8 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">6. Thông Tin Liên Hệ</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Nếu bạn có bất kỳ câu hỏi nào về chính sách này hoặc cách chúng tôi xử lý thông tin của bạn, 
                vui lòng liên hệ:
              </p>

              <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Sở Lao động - Thương binh và Xã hội tỉnh Lạng Sơn</h3>
                    <p className="text-gray-700 text-sm mt-1">Đơn vị quản lý Hệ thống Hỗ Trợ Xã Hội</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Địa chỉ:</h3>
                    <p className="text-gray-700 text-sm mt-1">Số 28 Đường Trần Đăng Ninh, Thành phố Lạng Sơn, Tỉnh Lạng Sơn</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Điện thoại:</h3>
                    <p className="text-gray-700 text-sm mt-1">
                      <a href="tel:02053872222" className="text-blue-600 hover:underline">025 3872 222</a>
                      {' '} / {' '}
                      <a href="tel:02053872333" className="text-blue-600 hover:underline">025 3872 333</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 p-2 rounded">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email:</h3>
                    <p className="text-gray-700 text-sm mt-1">
                      <a href="mailto:hotro@langson.gov.vn" className="text-blue-600 hover:underline">
                        hotro@langson.gov.vn
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-red-100 p-2 rounded">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Giờ làm việc:</h3>
                    <p className="text-gray-700 text-sm mt-1">
                      Thứ 2 - Thứ 6: 7h30 - 11h30 và 13h30 - 17h00<br />
                      Thứ 7 & Chủ nhật: Nghỉ
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-600 text-white p-4 rounded-lg">
                <p className="font-semibold mb-1">Hotline hỗ trợ 24/7:</p>
                <p className="text-2xl font-bold">
                  <a href="tel:1900xxxx" className="hover:text-blue-100">1900 xxxx</a>
                </p>
                <p className="text-sm text-blue-100 mt-1">
                  (Đường dây nóng hỗ trợ khẩn cấp, hoạt động cả ngày lễ, Tết)
                </p>
              </div>
            </div>
          </section>

          {/* Footer Note */}
          <div className="bg-white rounded-xl shadow-md p-6 text-center border-t-4 border-blue-600">
            <p className="text-gray-700 text-sm leading-relaxed">
              <span className="font-semibold">Lưu ý:</span> Chính sách này có thể được cập nhật định kỳ. 
              Phiên bản mới nhất sẽ luôn được công bố trên trang web này.
              <br />
              <span className="text-gray-500">Cập nhật lần cuối: Tháng 11 năm 2025</span>
            </p>
          </div>

          {/* Back to Top */}
          <div className="text-center">
            <a 
              href="#"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              Lên đầu trang
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
