import { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { InvestmentService } from "../services/investmentService";

export class InvestmentController {
  static async getAllInvestments(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const investments = await InvestmentService.getAllInvestments(userId);
      return res.status(200).json(investments);
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }

  static async getInvestmentById(req: Request, res: Response) {
    await param("id").isInt().run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = req.user?.userId;
      const id = parseInt(req.params.id, 10);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const investment = await InvestmentService.getInvestmentById(userId, id);
      if (!investment) {
        return res.status(404).json({ message: "Investment not found" });
      }
      return res.status(200).json(investment);
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }

  static async createInvestment(req: Request, res: Response) {
    await Promise.all([
      body("categoryId").isInt().run(req),
      body("date").isDate().run(req),
      body("description").optional().isString().run(req),
      body("amount").isFloat().run(req),
      body("returnPercentage").optional().isFloat().run(req),
    ]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const data = { ...req.body, userId };
      const investment = await InvestmentService.createInvestment(userId, data);
      return res.status(201).json(investment);
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }

  static async updateInvestment(req: Request, res: Response) {
    await Promise.all([
      param("id").isInt().run(req),
      body("categoryId").optional().isInt().run(req),
      body("date").optional().isDate().run(req),
      body("description").optional().isString().run(req),
      body("amount").optional().isFloat().run(req),
      body("returnPercentage").optional().isFloat().run(req),
    ]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = req.user?.userId;
      const id = parseInt(req.params.id, 10);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const investment = await InvestmentService.updateInvestment(
        userId,
        id,
        req.body
      );
      if (!investment) {
        return res.status(404).json({ message: "Investment not found" });
      }
      return res.status(200).json(investment);
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }

  static async deleteInvestment(req: Request, res: Response) {
    await param("id").isInt().run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = req.user?.userId;
      const id = parseInt(req.params.id, 10);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const deleted = await InvestmentService.deleteInvestment(userId, id);
      if (!deleted) {
        return res.status(404).json({ message: "Investment not found" });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }
}
