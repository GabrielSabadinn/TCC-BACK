import { Router } from "express";
import { InvestmentController } from "../controllers/investmentController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, InvestmentController.getAllInvestments);
router.get("/:id", authMiddleware, InvestmentController.getInvestmentById);
router.post("/", authMiddleware, InvestmentController.createInvestment);
router.put("/:id", authMiddleware, InvestmentController.updateInvestment);
router.delete("/:id", authMiddleware, InvestmentController.deleteInvestment);

export default router;
