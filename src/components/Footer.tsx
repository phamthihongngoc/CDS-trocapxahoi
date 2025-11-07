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
              <p>
                📍{" "}
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Số+01+Hùng+Vương,+P.+Hoàng+Văn+Thụ,+TP.+Lạng+Sơn,+Tỉnh+Lạng+Sơn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline"
                >
                  Số 01 Hùng Vương, P. Hoàng Văn Thụ, TP. Lạng Sơn
                </a>
              </p>
              <p>
                📞 Hotline:{" "}
                <a href="tel:1900-1234" className="hover:text-white">
                  1900-1234
                </a>
              </p>
              <p>
                📧{" "}
                <a
                  href="mailto:baotro@langson.gov.vn"
                  className="hover:text-white"
                >
                  baotro@langson.gov.vn
                </a>
              </p>
            </div>
            {/* Google Maps */}
            <div className="mt-4">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Số+01+Hùng+Vương,+P.+Hoàng+Văn+Thụ,+TP.+Lạng+Sơn,+Tỉnh+Lạng+Sơn"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3705.8!2d106.7611!3d21.8532!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDUxJzExLjUiTiAxMDbCsDQ1JzQwLjAiRQ!5e0!3m2!1svi!2s!4v1234567890"
                  width="100%"
                  height="150"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
                  title="Bản đồ vị trí UBND Tỉnh Lạng Sơn"
                ></iframe>
              </a>
            </div>
          </div>

          {/* Dịch vụ */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Dịch vụ</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#/programs-info" className="hover:text-white">
                  Chính sách hỗ trợ
                </a>
              </li>
              <li>
                <a href="#/apply" className="hover:text-white">
                  Đăng ký trực tuyến
                </a>
              </li>
              <li>
                <a href="#/my-applications" className="hover:text-white">
                  Tra cứu hồ sơ
                </a>
              </li>
              <li>
                <a href="#/programs-info" className="hover:text-white">
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
                href="#/programs-info"
                className="text-gray-300 hover:text-white text-sm"
              >
                Chính sách bảo mật
              </a>
              <a
                href="#/programs-info"
                className="text-gray-300 hover:text-white text-sm"
              >
                Điều khoản sử dụng
              </a>
              <a
                href="#/contact"
                className="text-gray-300 hover:text-white text-sm"
              >
                Liên hệ hỗ trợ
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
