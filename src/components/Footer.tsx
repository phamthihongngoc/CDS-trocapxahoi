import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Thông tin liên hệ */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <div className="space-y-2 text-gray-300">
              <p>📍 UBND Tỉnh Lạng Sơn</p>
              <p>📍 Số 01, Đường Lê Duẩn, TP. Lạng Sơn</p>
              <p>📞 Hotline: 1900-1234</p>
              <p>📧 baotro@langson.gov.vn</p>
            </div>
          </div>

          {/* Dịch vụ */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Dịch vụ</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="/programs-info" className="hover:text-white">
                  Chính sách hỗ trợ
                </a>
              </li>
              <li>
                <a href="/apply" className="hover:text-white">
                  Đăng ký trực tuyến
                </a>
              </li>
              <li>
                <a href="/applications" className="hover:text-white">
                  Tra cứu hồ sơ
                </a>
              </li>
              <li>
                <a href="/guide" className="hover:text-white">
                  Hướng dẫn sử dụng
                </a>
              </li>
            </ul>
          </div>

          {/* Đơn vị chủ quản */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Đơn vị chủ quản</h3>
            <ul className="space-y-2 text-gray-300">
              <li>UBND Tỉnh Lạng Sơn</li>
              <li>Sở Lao động - Thương binh và Xã hội</li>
              <li>Các UBND Huyện/Thành phố</li>
              <li>Các UBND Xã/Phường/Thị trấn</li>
            </ul>
          </div>

          {/* Thời gian làm việc */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Thời gian làm việc</h3>
            <div className="space-y-2 text-gray-300">
              <p>
                <strong>Thứ 2 - Thứ 6:</strong>
              </p>
              <p>Sáng: 7h30 - 11h30</p>
              <p>Chiều: 13h30 - 17h00</p>
              <p>
                <strong>Thứ 7:</strong> 7h30 - 11h00
              </p>
              <p>
                <strong>Chủ nhật:</strong> Nghỉ
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 text-sm">
              © 2025 Hệ thống Bảo trợ Xã hội - Tỉnh Lạng Sơn. Tất cả quyền được
              bảo lưu.
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a
                href="/privacy"
                className="text-gray-300 hover:text-white text-sm"
              >
                Chính sách bảo mật
              </a>
              <a
                href="/terms"
                className="text-gray-300 hover:text-white text-sm"
              >
                Điều khoản sử dụng
              </a>
              <a
                href="/accessibility"
                className="text-gray-300 hover:text-white text-sm"
              >
                Hỗ trợ tiếp cận
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
