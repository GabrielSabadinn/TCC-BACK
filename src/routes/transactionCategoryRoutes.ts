import { Router } from "express";
import { TransactionCategoryController } from "../controllers/transactionCategoryController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, TransactionCategoryController.getAllCategories);
router.get(
  "/:id",
  authMiddleware,
  TransactionCategoryController.getCategoryById
);
router.post("/", authMiddleware, TransactionCategoryController.createCategory);
router.put(
  "/:id",
  authMiddleware,
  TransactionCategoryController.updateCategory
);
router.delete(
  "/:id",
  authMiddleware,
  TransactionCategoryController.deleteCategory
);

export default router;
