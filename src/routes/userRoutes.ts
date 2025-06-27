import { Router } from "express";
import { UserController } from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, UserController.getAllUsers);
router.get("/:id", authMiddleware, UserController.getUserById);
router.put("/:id", authMiddleware, UserController.updateUser);
router.put("/:id/meta", authMiddleware, UserController.updateUserMeta);
router.delete("/:id", authMiddleware, UserController.deleteUser);

export default router;
