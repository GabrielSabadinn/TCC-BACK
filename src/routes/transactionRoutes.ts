import { Router } from "express";
import { TransactionController } from "../controllers/transactionController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, TransactionController.getAllTransactions);
router.get("/:id", authMiddleware, TransactionController.getTransactionById);
router.post("/", authMiddleware, TransactionController.createTransaction);
router.put("/:id", authMiddleware, TransactionController.updateTransaction);
router.delete("/:id", authMiddleware, TransactionController.deleteTransaction);

export default router;
