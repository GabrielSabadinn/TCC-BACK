import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { BankStatementController } from "../controllers/bankStatementController";

const router = Router();

router.post("/", authMiddleware, BankStatementController.create);
router.get("/balance", authMiddleware, BankStatementController.getBalance);
router.get("/", authMiddleware, BankStatementController.list);
router.delete("/", authMiddleware, BankStatementController.delete);

export default router;
