import { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { TransactionService } from "../services/transactionService";

export class TransactionController {
  static async getAllTransactions(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const transactions = await TransactionService.getAllTransactions(userId);
      return res.status(200).json(transactions);
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }

  static async getTransactionById(req: Request, res: Response) {
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
      const transaction = await TransactionService.getTransactionById(
        userId,
        id
      );
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      return res.status(200).json(transaction);
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }

  static async createTransaction(req: Request, res: Response) {
    await Promise.all([
      body("categoryId")
        .isInt()
        .withMessage("Category ID must be an integer")
        .run(req),
      body("date").isDate().withMessage("Date must be a valid date").run(req),
      body("description")
        .optional()
        .isString()
        .withMessage("Description must be a string")
        .run(req),
      body("amount").isFloat().withMessage("Amount must be a number").run(req),
      body("type")
        .isIn(["income", "expense"])
        .withMessage("Type must be 'income' or 'expense'")
        .run(req),
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
      const transaction = await TransactionService.createTransaction(
        userId,
        data
      );
      return res.status(201).json(transaction);
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }

  static async updateTransaction(req: Request, res: Response) {
    await Promise.all([
      param("id").isInt().withMessage("ID must be an integer").run(req),
      body("categoryId")
        .optional()
        .isInt()
        .withMessage("Category ID must be an integer")
        .run(req),
      body("date")
        .optional()
        .isDate()
        .withMessage("Date must be a valid date")
        .run(req),
      body("description")
        .optional()
        .isString()
        .withMessage("Description must be a string")
        .run(req),
      body("amount")
        .optional()
        .isFloat()
        .withMessage("Amount must be a number")
        .run(req),
      body("type")
        .optional()
        .isIn(["income", "expense"])
        .withMessage("Type must be 'income' or 'expense'")
        .run(req),
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
      const transaction = await TransactionService.updateTransaction(
        userId,
        id,
        req.body
      );
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      return res.status(200).json(transaction);
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }

  static async deleteTransaction(req: Request, res: Response) {
    await param("id").isInt().withMessage("ID must be an integer").run(req);
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
      const deleted = await TransactionService.deleteTransaction(userId, id);
      if (!deleted) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }
}
