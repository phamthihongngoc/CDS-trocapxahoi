# 📋 HƯỚNG DẪN TẠO ĐỢT CHI TRẢ

## ✅ Điều kiện để tạo đợt chi trả thành công:

1. **Phải có ít nhất 1 hồ sơ đã được duyệt**
   - Hồ sơ có trạng thái: `approved` (Đã duyệt)
   - Hồ sơ chưa được chi trả

2. **Điền đầy đủ thông tin**
   - Kỳ chi trả: VD `01/2025`, `Q1/2025`, `Tháng 1/2025`
   - Địa bàn: VD `Lạng Sơn`, `Xã Hoàng Đồng`, `Huyện Văn Lãng`

## 📝 Các bước tạo đợt chi trả:

### Bước 1: Đăng nhập với tài khoản cán bộ
- CCCD: `025088123456`  
- Mật khẩu: `123456`

### Bước 2: Duyệt hồ sơ (nếu chưa có hồ sơ approved)
1. Vào **Quản lý hồ sơ**
2. Tìm hồ sơ có trạng thái "Đang xét duyệt"
3. Click icon ✅ **Phê duyệt**
4. Nhập số tiền phê duyệt
5. Click **Xác nhận Phê duyệt**

### Bước 3: Tạo đợt chi trả
1. Vào **Chi trả** → Tab **➕ Tạo mới**
2. Điền thông tin:
   - **Kỳ chi trả**: `01/2025` (bắt buộc)
   - **Địa bàn**: `Lạng Sơn` (lấy tất cả hồ sơ) hoặc địa bàn cụ thể
   - **Chương trình**: Chọn hoặc để trống (lấy tất cả)
3. Click **Tạo đợt chi trả**

## 💡 Mẹo:

### Để lấy tất cả hồ sơ đã duyệt:
- **Địa bàn**: Nhập `Lạng Sơn` hoặc để trống
- **Chương trình**: Để "Tất cả chương trình"

### Để lọc theo địa bàn cụ thể:
- **Địa bàn**: Nhập tên xã/huyện (VD: `Hoàng Đồng`, `Tân Phú`)

### Để lọc theo chương trình:
- **Chương trình**: Chọn chương trình cụ thể
- VD: "Trợ cấp người khuyết tật", "Trợ cấp hộ nghèo"

## ⚠️ Khắc phục lỗi thường gặp:

### Lỗi: "Không tìm thấy hồ sơ nào..."

**Nguyên nhân:**
- Không có hồ sơ nào đã được duyệt
- Hồ sơ không khớp với địa bàn/chương trình đã chọn
- Tất cả hồ sơ đã được chi trả rồi

**Giải pháp:**
1. Kiểm tra có hồ sơ đã duyệt chưa:
   - Vào **Quản lý hồ sơ**
   - Filter "Đã duyệt"
   
2. Nếu không có hồ sơ approved:
   - Duyệt một số hồ sơ trước
   - Hoặc chạy: `node approve-applications.js` (cho dev)

3. Thử thay đổi địa bàn:
   - Nhập `Lạng Sơn` để lấy tất cả
   - Hoặc để trống

## 📊 Kiểm tra dữ liệu hiện có:

Chạy script kiểm tra:
\`\`\`bash
node approve-applications.js
\`\`\`

Script này sẽ:
- ✅ Cập nhật các hồ sơ thành "approved"
- 📊 Hiển thị số lượng hồ sơ đã duyệt
- 📋 Liệt kê danh sách hồ sơ sẵn sàng chi trả

## 🎯 Ví dụ thực tế:

### Ví dụ 1: Tạo đợt chi trả cho tất cả
```
Kỳ chi trả: 01/2025
Địa bàn: Lạng Sơn
Chương trình: Tất cả chương trình
```
→ Kết quả: Lấy tất cả hồ sơ đã duyệt trong hệ thống

### Ví dụ 2: Tạo đợt chi trả cho xã cụ thể
```
Kỳ chi trả: Q1/2025
Địa bàn: Xã Hoàng Đồng
Chương trình: Tất cả chương trình
```
→ Kết quả: Chỉ lấy hồ sơ của Xã Hoàng Đồng

### Ví dụ 3: Tạo đợt chi trả cho chương trình cụ thể
```
Kỳ chi trả: Tháng 1/2025
Địa bàn: Lạng Sơn
Chương trình: Trợ cấp người khuyết tật
```
→ Kết quả: Chỉ lấy hồ sơ loại "Người khuyết tật"

## 📞 Liên hệ hỗ trợ:

Nếu vẫn gặp vấn đề, vui lòng liên hệ quản trị viên hệ thống.
