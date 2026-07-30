import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  // const token = req.headers.authorization?.split(" ")[1];
  const token = req.cookies.JWT_Token
  if (!token) {
    return res.status(401).json({
      success: false,
      msg: "token not found",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, err: "invalid token" });
  }
};

export default verifyToken;
