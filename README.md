# WEB_APPFOOD

Dự án nền tảng đặt đồ ăn trực tuyến (hiện đang dùng React.js và Node.js + MongoDB).

## 1. Backend (Node.js & MongoDB)
Thư mục `backend/` chứa mã nguồn Server API:
- Chạy hệ quản trị cơ sở dữ liệu MongoDB ở local (Cổng 27017 thường được mặc định cài đặt). Bạn cũng có thể tạo file `.env` ở trong `backend/` và thêm `MONGO_URI=mongodb://...` để trỏ database đi xa hơn.
- Cài đặt thư viện: `cd backend && npm install`
- Chạy server: `npm run dev`

## 2. Frontend (React/Vite)
Thư mục `frontend/` chứa giao diện web SPA khởi tạo mới bằng Vite.
- Cài đặt thư viện: `cd frontend && npm install`
- Chạy giao diện web: `npm run dev`
- App React sẽ tự động mở trên `http://localhost:5173/`. Bạn có thể thay đổi để React gọi tới cổng `5000` của Server.

## Môi trường làm việc chung (Collab)
- Mọi thành viên sau khi Pull code về phải chạy `npm install` ở cả hai thư mục (frontend và backend) và nên xem xét việc sử dụng ESLint / Prettier.
- Không gửi `node_modules` hay `.env` lên repo.
