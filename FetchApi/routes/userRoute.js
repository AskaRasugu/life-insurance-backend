import express from "express";
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
  loginUser,
} from "../controllers/userController.js";
import isAuth from "../../middleware/isAuth.js";

const router = express.Router();

router.get("/users", isAuth, getUsers);
router.get("/user/:id", isAuth, getUser);
router.post("/user", createUser);
router.put("/user/:id", isAuth, updateUser);
router.patch("/user/:id", isAuth, updateUser);
router.delete("/user/:id", isAuth, deleteUser);
router.post("/login", loginUser);

export default router;
