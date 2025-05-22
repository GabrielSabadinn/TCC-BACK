import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { BankStatementController } from "../controllers/bankStatementController";

const router = Router();

router.post("/", authMiddleware, BankStatementController.create);
router.get("/balance", authMiddleware, BankStatementController.getBalance);

export default router;
