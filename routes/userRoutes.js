import express from "express";
import authorizeRole from "../middleware/authorizeRole.js";
import verifyToken from "../middleware/verifyToken.js";
import {
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  updateProfile,
  getProfile,
} from "../controllers/userController.js";

const router = express.Router();
// profile
router.put('/profile',verifyToken,updateProfile)
router.get('/profile',verifyToken,getProfile)

// superadmin,admin access
router.get("/", verifyToken, authorizeRole("superadmin", "admin"), getAllUsers);
router.get(
  "/:id",
  verifyToken,
  authorizeRole("superadmin", "admin"),
  getSingleUser,
);
router.put(
  "/:id",
  verifyToken,
  authorizeRole("superadmin", "admin"),
  updateUser,
);

// super admin access
router.delete("/:id", verifyToken, authorizeRole("superadmin"), deleteUser);


export default router;
