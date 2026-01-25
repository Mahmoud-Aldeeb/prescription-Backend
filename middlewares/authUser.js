import jwt from "jsonwebtoken";

// admin authentication middleware
const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.json({
        success: false,
        message: "not authorized login again",
      });
    }
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    console.log(token_decode);
    req.userId = token_decode.id;
    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "error" + error.message });
  }
};

export default authUser;
