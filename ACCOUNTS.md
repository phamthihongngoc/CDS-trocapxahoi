# DANH SÁCH TÀI KHOẢN HỆ THỐNG

## 🔐 Hướng dẫn đăng nhập

Hệ thống hỗ trợ đăng nhập bằng:
- **Số CCCD (Căn cước công dân)** - 12 chữ số
- **Email** - Áp dụng cho cán bộ và admin

**Mật khẩu mặc định cho tất cả tài khoản**: `123456`

---

## 👥 TÀI KHOẢN NGƯỜI DÂN (20 tài khoản)

Người dân chỉ có thể đăng nhập bằng **số CCCD**:

| STT | Họ và tên | Số CCCD | Email | Vai trò |
|-----|-----------|---------|-------|---------|
| 1 | Nguyễn Văn An | `001098123456` | nguyenvanan@example.com | CITIZEN |
| 2 | Trần Thị Bình | `001098234567` | tranthbinh@example.com | CITIZEN |
| 3 | Lê Văn Cường | `001098345678` | levancuong@example.com | CITIZEN |
| 4 | Phạm Thị Dung | `001098456789` | phamthidung@example.com | CITIZEN |
| 5 | Hoàng Văn Em | `001098567890` | hoangvanem@example.com | CITIZEN |
| 6 | Đỗ Thị Phượng | `001098678901` | dothiphuong@example.com | CITIZEN |
| 7 | Vũ Văn Giang | `001098789012` | vuvangiang@example.com | CITIZEN |
| 8 | Bùi Thị Hoa | `001098890123` | buithihoa@example.com | CITIZEN |
| 9 | Đinh Văn Inh | `001098901234` | dinhvaninh@example.com | CITIZEN |
| 10 | Ngô Thị Kim | `001099012345` | ngothikim@example.com | CITIZEN |
| 11 | Phan Văn Long | `001099123456` | phanvanlong@example.com | CITIZEN |
| 12 | Dương Thị Mai | `001099234567` | duongthimai@example.com | CITIZEN |
| 13 | Lý Văn Nam | `001099345678` | lyvannam@example.com | CITIZEN |
| 14 | Võ Thị Oanh | `001099456789` | vothioanh@example.com | CITIZEN |
| 15 | Mai Văn Phong | `001099567890` | maivanphong@example.com | CITIZEN |
| 16 | Chu Thị Quỳnh | `001099678901` | chuthiquynh@example.com | CITIZEN |
| 17 | Tô Văn Sơn | `
` | tovanson@example.com | CITIZEN |
| 18 | Hà Thị Tuyết | `001099890123` | hathituyet@example.com | CITIZEN |
| 19 | Trương Văn Uy | `001099901234` | truongvanuy@example.com | CITIZEN |
| 20 | Lưu Thị Vân | `001100012345` | luuthivan@example.com | CITIZEN |

### 📝 Ví dụ đăng nhập người dân:
- **Username**: `001098123456` (Số CCCD)
- **Password**: `123456`

---

## 👨‍💼 TÀI KHOẢN CÁN BỘ (3 tài khoản)

Cán bộ có thể đăng nhập bằng **CCCD hoặc Email**:

| STT | Họ và tên | Số CCCD | Email | Vai trò |
|-----|-----------|---------|-------|---------|
| 1 | Trần Văn Xuân | `025088123456` | officer1@langson.gov.vn | OFFICER |
| 2 | Nguyễn Thị Yến | `025088234567` | officer2@langson.gov.vn | OFFICER |
| 3 | Phạm Văn Zung | `025088345678` | officer3@langson.gov.vn | OFFICER |

### 📝 Ví dụ đăng nhập cán bộ:
**Cách 1 - Dùng CCCD:**
- **Username**: `025088123456`
- **Password**: `123456`

**Cách 2 - Dùng Email:**
- **Username**: `officer1@langson.gov.vn`
- **Password**: `123456`

---

## 🔑 TÀI KHOẢN ADMIN (1 tài khoản)

Admin có thể đăng nhập bằng **CCCD hoặc Email**:

| Họ và tên | Số CCCD | Email | Vai trò |
|-----------|---------|-------|---------|
| Hoàng Văn Tài | `035099123456` | admin@langson.gov.vn | ADMIN |

### 📝 Ví dụ đăng nhập admin:
**Cách 1 - Dùng CCCD:**
- **Username**: `035099123456`
- **Password**: `123456`

**Cách 2 - Dùng Email:**
- **Username**: `admin@langson.gov.vn`
- **Password**: `123456`

---

## 🆕 CHỨC NĂNG MỚI

### 1. Đăng ký tài khoản mới
- Truy cập: `/register`
- Cần cung cấp: Họ tên, CCCD, Email, SĐT, Địa chỉ, Mật khẩu
- Chỉ dành cho **người dân** (role: CITIZEN)

### 2. Quên mật khẩu
- Truy cập: `/forgot-password`
- Bước 1: Nhập Email hoặc CCCD
- Bước 2: Xác minh số CCCD
- Bước 3: Đặt mật khẩu mới

### 3. Gửi đơn khiếu nại
- Đăng nhập với tài khoản người dân
- Vào trang chủ → Chọn "Gửi đơn khiếu nại"
- Hoặc truy cập: `/create-complaint`
- Hỗ trợ đính kèm file: .png, .jpg, .jpeg, .docx, .pdf (tối đa 10MB/file)

### 4. Xem đơn khiếu nại của tôi
- Truy cập: `/my-complaints`
- Xem lịch sử các đơn khiếu nại đã gửi
- Theo dõi trạng thái: Chờ xử lý / Đang xử lý / Đã giải quyết / Từ chối

---

## 🔧 Thông tin kỹ thuật

- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:5001
- **Database**: SQLite (database.sqlite)
- **Mã hóa mật khẩu**: bcrypt (salt rounds: 10)
- **Định dạng CCCD**: 12 chữ số

## 📞 Liên hệ hỗ trợ

Nếu gặp vấn đề, vui lòng liên hệ quản trị viên hệ thống.
