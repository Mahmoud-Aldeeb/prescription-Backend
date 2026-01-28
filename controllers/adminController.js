import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import fs from "fs";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";

// API for adding doctor
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        message: "Doctor image is required",
      });
    }
    // if (!imageFile.path) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Image file path is missing. Check multer configuration.",
    //   });
    // }

    // check for all data to add doctor
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      // if (imageFile.path && fs.existsSync(imageFile.path)) {
      //   fs.unlinkSync(imageFile.path);
      // }
      return res.json({ success: false, message: "Missing Details" });
    }
    // validating email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid Email" });
    }
    // validating strong password
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "invalid password",
      });
    }

    // hashing doctor password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // upload image to Cloudinary
    let imageUrl;
    try {
      console.log("Uploading image to Cloudinary...");
      const imageString = imageFile.buffer.toString("base64");
      // const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      //   folder: "doctors",
      //   resource_type: "image",
      // });
      const imageUpload = await cloudinary.uploader.upload(
        `data:${imageFile.mimetype};base64,${imageString}`,
        {
          folder: "doctors",
          resource_type: "image",
        },
      );

      imageUrl = imageUpload.secure_url;
      // if (fs.existsSync(imageFile.path)) {
      //   fs.unlinkSync(imageFile.path);
      //   console.log("Temporary file deleted");
      // }
      console.log("✅ Image uploaded to Cloudinary:", imageUrl);
    } catch (error) {
      console.log("Cloudinary upload error:", error);
      // if (imageFile.path && fs.existsSync(imageFile.path)) {
      //   fs.unlinkSync(imageFile.path);
      // }
      return res.status(500).json({
        success: false,
        message: "Error uploading image to Cloudinary",
      });
    }

    let parsedAddress;
    try {
      parsedAddress =
        typeof address === "string" ? JSON.parse(address) : address;
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: "Invalid address format. Must be valid JSON.",
      });
    }

    const doctorData = {
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      experience: String(experience),
      about,
      fees: Number(fees),
      address: parsedAddress,
      data: Date.now(),
    };
    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();
    res.json({ success: true, message: "Doctor Added Successfully" });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return res.json({
        success: false,
        message: "Email already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// API For Admin Login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, message: "Login Successful", token });
    } else {
      return res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password");
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Api to get appointment list
const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({});
    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api for appointment cancellation
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // releasing doctor slot
    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId);

    let slots_booked = doctorData.slots_booked;
    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (time) => time !== slotTime,
    );

    await doctorModel.findByIdAndUpdate(docId, {
      slots_booked,
    });

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({});
    const dashData = {
      doctors: doctors.length,
      appointments: appointments.length,
      patients: users.length,
      latestAppointments: appointments.toReversed().slice(0, 5),
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  addDoctor,
  loginAdmin,
  allDoctors,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
};
