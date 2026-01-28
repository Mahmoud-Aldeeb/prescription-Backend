import multer from "multer";

const storage = multer.memoryStorage();

const FILE_SETTINGS = {
  MAX_SIZE: 4 * 1024 * 1024, // 4MB
  ALLOWED_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ],
  ALLOWED_EXTENSIONS: ["jpeg", "jpg", "png", "gif", "webp"],
};

const fileValidation = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const file = req.file;
  const errors = [];

  // التحقق من الحجم
  if (file.size > FILE_SETTINGS.MAX_SIZE) {
    errors.push(
      `File is too large. Maximum size is ${FILE_SETTINGS.MAX_SIZE / (1024 * 1024)}MB`,
    );
  }

  // التحقق من النوع
  if (!FILE_SETTINGS.ALLOWED_TYPES.includes(file.mimetype)) {
    errors.push(
      `Invalid file type. Allowed: ${FILE_SETTINGS.ALLOWED_EXTENSIONS.join(", ")}`,
    );
  }

  // التحقق من الامتداد
  const fileExtension = file.originalname.toLowerCase().split(".").pop();
  if (!FILE_SETTINGS.ALLOWED_EXTENSIONS.includes(fileExtension)) {
    errors.push(
      `Invalid file extension. Allowed: ${FILE_SETTINGS.ALLOWED_EXTENSIONS.join(", ")}`,
    );
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(" - "),
    });
  }

  next();
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: FILE_SETTINGS.MAX_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (FILE_SETTINGS.ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type. Allowed: ${FILE_SETTINGS.ALLOWED_EXTENSIONS.join(", ")}`,
        ),
      );
    }
  },
});

export const uploadWithValidation = (fieldName) => [
  upload.single(fieldName),
  fileValidation,
];

export default upload;
