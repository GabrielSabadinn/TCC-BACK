import { Router } from "express";
import { FixedAccountController } from "../controllers/fixedAccountController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, FixedAccountController.getAllFixedAccounts);
router.get("/:id", authMiddleware, FixedAccountController.getFixedAccountById);
router.post("/", authMiddleware, FixedAccountController.createFixedAccount);
router.put("/:id", authMiddleware, FixedAccountController.updateFixedAccount);
router.delete(
  "/:id",
  authMiddleware,
  FixedAccountController.deleteFixedAccount
);

export default router;
