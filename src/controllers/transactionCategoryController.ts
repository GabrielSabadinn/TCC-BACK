import { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { TransactionCategoryService } from "../services/transactionCategoryService";

export class TransactionCategoryController {
  static async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await TransactionCategoryService.getAllCategories();
      return res.status(200).json(categories);
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }

  static async getCategoryById(req: Request, res: Response) {
    await param("id").isInt().run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const id = parseInt(req.params.id, 10);
      const category = await TransactionCategoryService.getCategoryById(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      return res.status(200).json(category);
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }

  static async createCategory(req: Request, res: Response) {
    await Promise.all([
      body("name").notEmpty().withMessage("Name is required").run(req),
      body("type")
        .isIn(["Income", "Expense"])
        .withMessage("Type must be 'Income' or 'Expense'")
        .run(req),
    ]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const category = await TransactionCategoryService.createCategory(
        req.body
      );
      return res.status(201).json(category);
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }

  static async updateCategory(req: Request, res: Response) {
    await Promise.all([
      param("id").isInt().run(req),
      body("name")
        .optional()
        .notEmpty()
        .withMessage("Name cannot be empty")
        .run(req),
      body("type")
        .optional()
        .isIn(["Income", "Expense"])
        .withMessage("Type must be 'Income' or 'Expense'")
        .run(req),
    ]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const id = parseInt(req.params.id, 10);
      const category = await TransactionCategoryService.updateCategory(
        id,
        req.body
      );
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      return res.status(200).json(category);
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }

  static async deleteCategory(req: Request, res: Response) {
    await param("id").isInt().run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const id = parseInt(req.params.id, 10);
      const deleted = await TransactionCategoryService.deleteCategory(id);
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }
}
