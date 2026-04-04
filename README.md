# 🍜 WebFood – Nền tảng đặt đồ ăn trực tuyến

> Dự án môn học – Ứng dụng web đặt đồ ăn đa vai trò (Customer / Merchant / Admin)

---

## 📌 Tổng quan

**WebFood** là một ứng dụng web full-stack cho phép:
- **Khách hàng** duyệt nhà hàng, đặt món, thanh toán.
- **Chủ quán (Merchant)** quản lý thực đơn, đơn hàng, thông tin quán, xem thống kê.
- **Quản trị viên (Admin)** duyệt quán, quản lý người dùng, danh mục.

---

## 🛠️ Công nghệ sử dụng

| Tầng       | Công nghệ                                       |
|------------|-------------------------------------------------|
| Frontend   | React 19, Vite, React Router v7, Axios          |
| UI         | Vanilla CSS, Lucide Icons, Framer Motion        |
| Backend    | Node.js, Express.js                             |
| Database   | MongoDB + Mongoose                              |
| Auth       | JWT (JSON Web Token) + bcryptjs                 |
| Upload ảnh | Multer (lưu local `/public/uploads`)            |
| Email      | Nodemailer (quên mật khẩu)                      |
| Dev tools  | Nodemon, ESLint                                 |

---

## 📁 Cấu trúc thư mục

```
WebFood/
├── backend/
│   ├── public/
│   │   └── uploads/          # Ảnh upload từ Merchant
│   └── src/
│       ├── controllers/       # Xử lý logic nghiệp vụ
│       │   ├── auth.controller.js
│       │   └── merchant.controller.js
│       ├── middleware/
│       │   └── auth.middleware.js  # Bảo vệ route + phân quyền
│       ├── models/            # Schema MongoDB
│       │   ├── User.js
│       │   ├── Restaurant.js
│       │   ├── Product.js
│       │   ├── Order.js
│       │   ├── Category.js
│       │   └── Review.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── merchant.routes.js
│       │   ├── adminRoutes.js
│       │   └── customer.routes.js
│       ├── utils/
│       │   ├── sendEmail.js
│       │   └── upload.js     # Cấu hình Multer
│       └── index.js           # Entry point
│
└── frontend/
    └── src/
        ├── components/        # Layout, Header, Guard...
        │   ├── AdminLayout.jsx
        │   ├── MerchantLayout.jsx
        │   ├── Header.jsx
        │   ├── RoleRoute.jsx
        │   └── NoMinglingGuard.jsx
        ├── context/
        │   ├── AuthContext.jsx
        │   └── CartContext.jsx
        ├── pages/
        │   ├── Home.jsx
        │   ├── Menu.jsx
        │   ├── Login.jsx / Register.jsx
        │   ├── Profile.jsx
        │   ├── Checkout.jsx
        │   ├── Dashboard.jsx       # Admin
        │   ├── MerchantDashboard.jsx
        │   ├── MerchantOrders.jsx
        │   ├── MerchantProducts.jsx
        │   ├── MerchantStore.jsx
        │   └── MerchantStats.jsx
        └── utils/
            └── axiosInstance.js
```

---

## 🚀 Hướng dẫn chạy dự án

### Yêu cầu
- Node.js >= 18
- MongoDB đang chạy ở `localhost:27017`

### 1. Backend

```bash
cd backend
npm install
npm run dev
# Server chạy tại: http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# App chạy tại: http://localhost:5173
```

---

## 👤 Tài khoản thử nghiệm

| Vai trò   | Email                    | Mật khẩu |
|-----------|--------------------------|-----------|
| Admin     | `admin@webfood.com`      | `123456`  |
| Merchant  | `merchant@webfood.com`   | `123456`  |
| Customer  | `customer@webfood.com`   | `123456`  |

> **Tạo lại tài khoản mẫu:** `node seed_users.js` (chạy trong thư mục `backend/`)

---

## 🔑 Phân quyền & Routing

| URL                    | Vai trò      | Mô tả                        |
|------------------------|--------------|------------------------------|
| `/`                    | Public       | Trang chủ                    |
| `/menu`                | Customer     | Duyệt thực đơn               |
| `/checkout`            | Customer     | Thanh toán                   |
| `/profile`             | Đăng nhập    | Hồ sơ cá nhân                |
| `/admin`               | Admin        | Tổng quan hệ thống           |
| `/admin/users`         | Admin        | Quản lý người dùng           |
| `/admin/restaurants`   | Admin        | Duyệt quán ăn                |
| `/admin/categories`    | Admin        | Quản lý danh mục             |
| `/merchant`            | Merchant     | Tổng quan quán               |
| `/merchant/orders`     | Merchant     | Quản lý đơn hàng             |
| `/merchant/products`   | Merchant     | Quản lý thực đơn             |
| `/merchant/store`      | Merchant     | Thông tin quán               |
| `/merchant/stats`      | Merchant     | Thống kê doanh thu           |

---

## 📡 API Merchant (cần JWT Bearer token)

```
GET    /api/merchant/restaurant        Xem thông tin quán
PUT    /api/merchant/restaurant        Cập nhật thông tin quán
GET    /api/merchant/products          Danh sách món ăn
POST   /api/merchant/products          Thêm món
PUT    /api/merchant/products/:id      Sửa món
DELETE /api/merchant/products/:id      Xoá món
POST   /api/merchant/upload-image      Upload ảnh (multipart/form-data)
GET    /api/merchant/orders            Danh sách đơn hàng
PUT    /api/merchant/orders/:id/status Cập nhật trạng thái đơn
GET    /api/merchant/stats             Thống kê doanh thu
```

---

## 🔄 Luồng trạng thái đơn hàng

```
pending → confirmed → preparing → delivering → completed
                                              ↘ cancelled (có thể huỷ từ bất kỳ bước nào)
```

---

## 👨‍💻 Thành viên

| STT | Họ tên | Phụ trách |
|-----|--------|-----------|
| 1   |        | Frontend – Giao diện Khách hàng |
| 2   |        | Backend – Auth & API chung      |
| 3   | Bảo    | Merchant Admin (Frontend + API) |
| 4   |        | Frontend – Giao diện Khách hàng |

---

## 📝 Ghi chú phát triển

- Ảnh upload được lưu tại `backend/public/uploads/` và serve qua `http://localhost:5000/uploads/<filename>`
- JWT có thời hạn **30 ngày** (cấu hình trong `.env` → `JWT_EXPIRE`)
- Quán mới đăng ký có status `pending`, cần Admin duyệt mới hiển thị trên ứng dụng
- Merchant chỉ thao tác được trên dữ liệu của **chính quán mình** (ownerId check)
