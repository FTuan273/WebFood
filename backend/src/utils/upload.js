const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Tạo thư mục uploads nếu chưa có
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const ext      = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const ok = allowed.test(path.extname(file.originalname).toLowerCase())
           && allowed.test(file.mimetype);
  ok ? cb(null, true) : cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, webp, gif)'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // max 5MB

module.exports = upload;
