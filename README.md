# WEB_APPFOOD

Dự án nền tảng đặt đồ ăn trực tuyến (hiện đang dùng React.js và Node.js + MongoDB).

## 1. Backend (Node.js & MongoDB)

Thư mục `backend/` chứa mã nguồn Server API:

- Chạy hệ quản trị cơ sở dữ liệu MongoDB ở local (Cổng 27017 thường được mặc định cài đặt). Bạn cũng có thể tạo file `.env` ở trong `backend/` và thêm `MONGODB_URI=...` để trỏ database đi xa hơn.
- Cài đặt thư viện: `npm install`
- Chạy Server (chế độ phát triển): `npm run dev` (sử dụng nodemon để tự reload khi sửa code).
- Server sẽ chạy mặc định ở cổng **5000**.

## 2. Frontend (React.js + Vite)

Thư mục `frontend/` chứa mã nguồn giao diện người dùng:

- Cài đặt thư viện: `npm install`
- Chạy ứng dụng (chế độ phát triển): `npm run dev`
- Truy cập qua trình duyệt: `http://localhost:5173`

## 3. Lưu ý quan trọng

- Tuyệt đối không đẩy các thông tin nhạy cảm (như mật khẩu Database, API key) lên GitHub. Hãy sử dụng file `.env` và liệt kê nó trong `.gitignore`.
- Đảm bảo bạn đã cài đặt Node.js phiên bản mới (v16 trở lên là tốt nhất).

## Các đóng góp & Quy trình:

- Tạo nhánh mới khi làm tính năng (`git checkout -b feature/ten-tinh-nang`).
- Trước khi push, hãy `git pull origin main` để tránh xung đột.
- Luôn kiểm tra lỗi (ESLint) trước khi commit.

---
*Chúc các bạn làm bài tốt!*
