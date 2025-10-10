# Database Setup Guide

## Overview
Database schema cho Hệ thống Quản lý Trợ cấp Xã hội Tỉnh Lạng Sơn.

## Quick Start

```bash
npm run db:setup
```

Script này sẽ tự động:
1. Tạo tất cả các bảng (14 bảng)
2. Seed dữ liệu mẫu (users, programs, applications)
3. Cấu hình hệ thống mặc định

## Default Users

| Email | Role | Password |
|-------|------|----------|
| citizen@example.com | CITIZEN | 123456 |
| officer@langson.gov.vn | OFFICER | 123456 |
| admin@langson.gov.vn | ADMIN | 123456 |

## Database Schema

### Core Tables

1. **users** - Người dùng hệ thống
   - Fields: id, full_name, email, phone, address, password_hash, role, status
   - Roles: CITIZEN, OFFICER, ADMIN

2. **support_programs** - Chương trình hỗ trợ
   - Fields: code, name, description, type, amount, start_date, end_date, status

3. **applications** - Hồ sơ xin trợ cấp
   - Fields: code, user_id, program_id, citizen_id, full_name, status, etc.
   - Statuses: pending, approved, rejected

4. **households** & **household_members** - Quản lý hộ gia đình

5. **payouts** & **payout_items** - Quản lý chi trả

6. **complaints** & **complaint_actions** - Quản lý khiếu nại

7. **notifications** - Thông báo cho người dùng

8. **application_documents** - Tài liệu đính kèm hồ sơ

9. **application_history** - Lịch sử xử lý hồ sơ

10. **activity_logs** - Nhật ký hoạt động hệ thống

11. **system_settings** - Cấu hình hệ thống

### Relationships

```
users (1) -> (n) applications
support_programs (1) -> (n) applications
applications (1) -> (n) application_documents
applications (1) -> (n) application_history
users (1) -> (n) households
households (1) -> (n) household_members
support_programs (1) -> (n) payouts
payouts (1) -> (n) payout_items
users (1) -> (n) complaints
applications (1) -> (n) complaints
complaints (1) -> (n) complaint_actions
users (1) -> (n) notifications
```

## Manual Setup (Optional)

Nếu muốn chạy manual:

```bash
# 1. Run schema
psql $DATABASE_URL -f db/schema.sql

# 2. Run seeds
psql $DATABASE_URL -f db/seeds.sql
```

## Files

- `schema.sql` - Database schema (CREATE TABLE statements)
- `seeds.sql` - Initial seed data
- `setup.js` - Automated setup script
- `README.md` - This file
