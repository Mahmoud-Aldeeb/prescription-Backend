// import multer from "multer";
// const uploadsDir = "uploads";
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadsDir);
//   },
//   filename: (req, file, cb) => {
//     if (file) {
//       cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
//     } else {
//       cb(null, false);
//     }
//   },
// });
// const storage = multer.memoryStorage();

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = /jpeg|jpg|png|gif/;
//     const mimetype = allowedTypes.test(file.mimetype);
//     const extname = allowedTypes.test(
//       file.originalname.toLowerCase().split(".").pop(),
//     );

//     if (mimetype && extname) {
//       return cb(null, true);
//     }
//     cb(new Error("Only images are allowed"));
//   },
// });

// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = /jpeg|jpg|png|gif|webp/;
//     const mimetype = allowedTypes.test(file.mimetype);
//     const extname = allowedTypes.test(
//       file.originalname.toLowerCase().split(".").pop(),
//     );

//     if (mimetype && extname) {
//       return cb(null, true);
//     }
//     cb(new Error("Only images are allowed"));
//   },
// });

// export default upload;

import multer from "multer";
import path from "path";

// تخزين الملفات مؤقتًا في memory
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // يجب إنشاء مجلد uploads
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

// تصفية أنواع الملفات
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export default upload;
