# Vivo × ZEISS Shop

Website thương mại điện tử bán điện thoại Vivo — phía khách mua sắm (SSR Pug) và hệ thống admin quản lý sản phẩm, đơn hàng, tài khoản, phân quyền (RBAC), kèm chat realtime.

---

## Demo trực tuyến

| Môi trường             | URL                                            |
| ---------------------- | ---------------------------------------------- |
| Website (Client)       | `thi-thaiprojects.vercel.app`                  |
| Trang quản trị (Admin) | `thi-thaiprojects.vercel.app/admin/auth/login` |

---

## Tài khoản demo

Dùng tài khoản dưới đây để trải nghiệm. **Không cần đăng ký mới.**

### Khách hàng (Client)

| Trường            | Giá trị           |
| ----------------- | ----------------- |
| **URL đăng nhập** | `/user/login`     |
| **Email**         | `demo1@gmail.com` |
| **Mật khẩu**      | `test`            |

**Có thể test:** xem / tìm sản phẩm, giỏ hàng → checkout (COD / **VNPay sandbox**) → đơn hàng, cập nhật hồ sơ / avatar, quên mật khẩu (OTP email), chat realtime, kết bạn, tạo phòng chat.

### Quản trị viên (Admin)

| Trường            | Giá trị             |
| ----------------- | ------------------- |
| **URL đăng nhập** | `/admin/auth/login` |
| **Email**         | `demo1@gmail.com`   |
| **Mật khẩu**      | `Admin@123456`      |

**Có thể test:** dashboard thống kê, CRUD sản phẩm / danh mục (TinyMCE + Cloudinary), tài khoản admin, role & permissions, cài đặt website, trang tài khoản cá nhân (`/admin/my-account`).

---

## Tính năng chính

### Phía khách hàng

- Trang chủ: sản phẩm nổi bật / mới nhất
- Danh sách sản phẩm, lọc theo danh mục (slug), chi tiết sản phẩm, tìm kiếm
- Giỏ hàng, checkout, lịch sử đơn hàng _(cần đăng nhập)_
- Thanh toán: **COD** hoặc **VNPay** (sandbox) — tạo đơn, redirect cổng thanh toán, Return URL cập nhật `paid` / `failed`
- Đăng ký / đăng nhập / đăng xuất
- Quên mật khẩu: gửi OTP qua email → xác thực → đặt lại mật khẩu
- Hồ sơ cá nhân, đổi avatar (upload Cloudinary)
- Social: danh sách bạn bè, gửi / nhận lời mời kết bạn
- Chat realtime (Socket.IO): phòng chat, nhắn tin, gửi ảnh, typing indicator, online/offline

### Phía quản trị

- Dashboard: thống kê sản phẩm, danh mục, tài khoản admin, user client
- CRUD sản phẩm & danh mục (đổi trạng thái đơn / hàng loạt, soft delete, TinyMCE, upload ảnh)
- Quản lý tài khoản admin, phân quyền theo role (RBAC + trang permissions)
- Cài đặt thông tin website chung (logo, tên, liên hệ…)
- Tài khoản cá nhân admin

---

## Công nghệ sử dụng

| Thành phần     | Công nghệ                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| Runtime        | Node.js (Docker image: Node 20)                                                                              |
| Backend        | Express 5                                                                                                    |
| Template (SSR) | Pug                                                                                                          |
| Database       | MongoDB + Mongoose                                                                                           |
| Auth           | **JWT** (`jsonwebtoken`) lưu cookie `token` (httpOnly, hết hạn **7 ngày**) — dùng cho **cả client và admin** |
| Mật khẩu       | bcrypt                                                                                                       |
| Session        | `express-session` — **chỉ dùng flash message** (success/error), không dùng làm auth                          |
| Cookie         | `cookie-parser`                                                                                              |
| Realtime       | Socket.IO                                                                                                    |
| Upload ảnh     | Multer (memory) → Cloudinary (`streamifier`)                                                                 |
| Email (OTP)    | Nodemailer (Gmail App Password)                                                                              |
| Thanh toán     | **VNPay** (HMAC-SHA512, sandbox) — helper `helper/vnpay.js`                                                  |
| Editor         | TinyMCE (serve từ `node_modules/tinymce`)                                                                    |
| Khác           | method-override, moment, qs, mongoose-slug-updater                                                           |
| Dev            | Nodemon                                                                                                      |
| Deploy         | Docker / Docker Compose, Vercel (`vercel.json`)                                                              |

### Auth hoạt động thế nào

1. Login/register thành công → `generateToken({ id, email })` → set cookie `token`.
2. Middleware auth đọc `req.cookies.token` → `verifyToken` → load user/account từ DB.
3. Logout → `clearCookie("token")` (client còn clear `cartId`).
4. Quên mật khẩu: sau khi OTP hợp lệ cũng cấp JWT vào cookie để vào trang reset.

### Thanh toán VNPay hoạt động thế nào

1. User chọn **VNPay** ở `/checkout` → tạo `Order` (`paymentMethod: vnpay`, `paymentStatus: unpaid`, có `totalPrice`).
2. Server gọi `createPaymentUrl` (`helper/vnpay.js`) — `vnp_TxnRef` = `order._id`, `vnp_Amount` = `totalPrice * 100`, ký HMAC-SHA512.
3. Redirect trình duyệt sang cổng sandbox VNPay.
4. Sau thanh toán, VNPay redirect về `VNP_RETURN_URL` → verify chữ ký → cập nhật `paid` / `failed` → (nếu paid) xóa giỏ → `/checkout/success/:id`.
5. Chọn **COD**: lưu đơn + xóa giỏ ngay → trang success (không qua cổng VNPay).

> Sandbox: đăng ký tại [sandbox.vnpayment.vn](https://sandbox.vnpayment.vn). IPN (`VNP_IPN_URL`) nên có trên môi trường public; local chủ yếu test qua Return URL.

---

## Cấu trúc thư mục

```
begin/
├── config/           # DB, prefix admin (/admin)
├── controller/       # Logic client & admin
├── helper/           # JWT, Cloudinary, mail, VNPay, pagination, search...
├── middleware/       # Auth JWT, cart, category, upload, validate...
├── models/           # Mongoose schemas
├── public/           # CSS, JS, ảnh tĩnh
├── routes/           # Route client & admin
├── sockets/          # Socket.IO (chat, bạn bè)
├── validate/         # Validate form
├── views/            # Giao diện Pug
├── index.js          # Entry point (HTTP + Socket.IO)
├── docker-compose.yml
├── Dockerfile
└── vercel.json
```

---

## Cài đặt & chạy local

### Yêu cầu

- Node.js >= 18 (khuyến nghị 20 như Dockerfile)
- MongoDB (local hoặc Atlas)
- Tài khoản Cloudinary (upload ảnh)
- Gmail App Password (OTP quên mật khẩu)
- Tài khoản **VNPay sandbox** (TmnCode + HashSecret) nếu test thanh toán online

### Các bước

```bash
# 1. Clone repository
git clone <https://github.com/thaivanthi2005/SHOP_CHAT>
cd begin

# 2. Cài dependencies
npm install

# 3. Tạo file .env (xem mẫu bên dưới)

# 4. Chạy server (nodemon)
npm start
```

Mở trình duyệt: `http://localhost:3000`

---

## Biến môi trường (`.env`)

Tạo file `.env` ở thư mục gốc (đã có trong `.gitignore` — **không commit**):

```env
PORT=3000
MONGO_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<database>
cloud_name=<cloudinary_cloud_name>
api_key=<cloudinary_api_key>
api_secret=<cloudinary_api_secret>
EMAIL_USER=<gmail_address>
EMAIL_PASS=<gmail_app_password>
JWT_SECRET=<your_jwt_secret>

# VNPay (sandbox)
VNP_TMN_CODE=<vnpay_tmn_code>
VNP_HASH_SECRET=<vnpay_hash_secret>
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:3000/checkout/vnpay_return
VNP_IPN_URL=http://localhost:3000/checkout/vnpay_ipn
```

| Biến                                    | Dùng cho                                            |
| --------------------------------------- | --------------------------------------------------- |
| `PORT`                                  | Port server                                         |
| `MONGO_URL`                             | Kết nối MongoDB                                     |
| `cloud_name` / `api_key` / `api_secret` | Cloudinary                                          |
| `EMAIL_USER` / `EMAIL_PASS`             | Nodemailer gửi OTP                                  |
| `JWT_SECRET`                            | Ký & verify JWT (bắt buộc cho login client & admin) |
| `VNP_TMN_CODE` / `VNP_HASH_SECRET`      | Merchant code + secret ký HMAC VNPay                |
| `VNP_URL`                               | URL cổng thanh toán (sandbox / production)          |
| `VNP_RETURN_URL`                        | Browser redirect sau thanh toán                     |
| `VNP_IPN_URL`                           | Server callback IPN (nên dùng URL public)           |

---

## Chạy bằng Docker

```bash
docker compose up -d --build
```

Ứng dụng: `http://localhost:3000` (đọc biến từ `.env`).

---

## Định tuyến chính

### Client

| Route                   | Mô tả                              |
| ----------------------- | ---------------------------------- |
| `/`                     | Trang chủ                          |
| `/products`             | Danh sách sản phẩm                 |
| `/products/:slug`       | Sản phẩm theo danh mục (slug)      |
| `/products/detail/:id`  | Chi tiết sản phẩm                  |
| `/search`               | Tìm kiếm                           |
| `/cart`                 | Giỏ hàng _(JWT)_                   |
| `/checkout`             | Thanh toán COD / VNPay _(JWT)_     |
| `/checkout/order`       | Tạo đơn (POST) _(JWT)_             |
| `/checkout/vnpay_return`| VNPay Return URL — cập nhật paid/failed |
| `/checkout/success/:id` | Đặt hàng / thanh toán thành công _(JWT)_ |
| `/orders`               | Đơn hàng _(JWT)_                   |
| `/user/login`           | Đăng nhập                          |
| `/user/register`        | Đăng ký                            |
| `/user/logout`          | Đăng xuất                          |
| `/user/info`            | Hồ sơ cá nhân _(JWT)_              |
| `/user/password/forgot` | Quên mật khẩu                      |
| `/user/password/otp`    | Nhập OTP                           |
| `/user/password/reset`  | Đặt mật khẩu mới                   |
| `/users/friends`        | Bạn bè _(JWT)_                     |
| `/users/not-friend`     | Người lạ / gợi ý kết bạn _(JWT)_   |
| `/users/requests`       | Lời mời đã gửi _(JWT)_             |
| `/users/accept`         | Lời mời nhận được _(JWT)_          |
| `/rooms-chat`           | Danh sách / tạo phòng chat _(JWT)_ |
| `/chat/:roomChatId`     | Chat trong phòng _(JWT)_           |

### Admin (`prefix`: `/admin`)

| Route                      | Mô tả                           |
| -------------------------- | ------------------------------- |
| `/admin/auth/login`        | Đăng nhập admin                 |
| `/admin/auth/logout`       | Đăng xuất                       |
| `/admin/dashboard`         | Dashboard _(JWT)_               |
| `/admin/products`          | Quản lý sản phẩm _(JWT)_        |
| `/admin/category`          | Quản lý danh mục _(JWT)_        |
| `/admin/accounts`          | Quản lý tài khoản admin _(JWT)_ |
| `/admin/roles`             | Quản lý role _(JWT)_            |
| `/admin/roles/permissions` | Phân quyền _(JWT)_              |
| `/admin/settings`          | Cài đặt website _(JWT)_         |
| `/admin/my-account`        | Tài khoản cá nhân admin _(JWT)_ |

---

## Tài liệu tham khảo

- [Express.js](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/docs/guide.html)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- [Socket.IO](https://socket.io/docs/v4/)
- [Cloudinary](https://cloudinary.com/documentation)
- [Nodemailer](https://nodemailer.com/)
- [VNPay Sandbox / Docs](https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop/)

---

## Liên hệ

|              |                                                 |
| ------------ | ----------------------------------------------- |
| **Họ tên**   | Thái Văn Thi                                    |
| **Email**    | thaivanthi2005@gmail.com                        |
| **GitHub**   | https://github.com/thaivanthi2005               |
| **LinkedIn** | https://www.linkedin.com/in/thaivanthi-dev2005/ |
