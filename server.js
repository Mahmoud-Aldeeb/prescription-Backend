import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";

connectCloudinary();

// app config
const app = express();
const port = process.env.PORT || 4000;

const allowedOrigins = [
  "https://prescription-user.vercel.app",
  "https://prescription-admin.vercel.app",
  "https://prescription-doctor.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    //   if (allowedOrigins.indexOf(origin) !== -1) {
    //     callback(null, true);
    //   } else {
    //     console.log(`❌ CORS Blocked: ${origin}`);
    //     callback(new Error("Not allowed by CORS"));
    //   }
    // },
    const isAllowed = allowedOrigins.some(
      (allowedOrigin) =>
        origin === allowedOrigin ||
        origin.startsWith(allowedOrigin.replace("https://", "http://")),
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`🚫 CORS Blocked: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "token",
    "aToken",
    "dToken",
    "x-auth-token",
    "x-access-token",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 86400,
  optionsSuccessStatus: 200,
};

// middlewares
app.use(cors(corsOptions));
// app.options("/*", cors(corsOptions));
connectDB();
connectCloudinary();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// api routes (endpoints)
// /api/admin/add-doctor
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.status(200).send("Hello from Prescripto Backend");
});

// listen
app.listen(port, () => {
  console.log(`Prescripto Backend is running on port: ${port}`);
});
