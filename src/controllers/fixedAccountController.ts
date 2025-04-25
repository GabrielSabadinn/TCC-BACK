import { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { FixedAccountService } from "../services/fixedAccountService";

export class FixedAccountController {
  static async getAllFixedAccounts(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const fixedAccounts = await FixedAccountService.getAllFixedAccounts(
        userId
      );
      return res.status(200).json(fixedAccounts);
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }

  static async getFixedAccountById(req: Request, res: Response) {
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
      const fixedAccount = await FixedAccountService.getFixedAccountById(
        userId,
        id
      );
      if (!fixedAccount) {
        return res.status(404).json({ message: "Fixed Account not found" });
      }
      return res.status(200).json(fixedAccount);
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }

  static async createFixedAccount(req: Request, res: Response) {
    await Promise.all([
      body("categoryId").isInt().run(req),
      body("description").optional().isString().run(req),
      body("amount").isFloat().run(req),
      body("dueDate").isDate().run(req),
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
      const fixedAccount = await FixedAccountService.createFixedAccount(
        userId,
        data
      );
      return res.status(201).json(fixedAccount);
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }

  static async updateFixedAccount(req: Request, res: Response) {
    await Promise.all([
      param("id").isInt().run(req),
      body("categoryId").optional().isInt().run(req),
      body("description").optional().isString().run(req),
      body("amount").optional().isFloat().run(req),
      body("dueDate").optional().isDate().run(req),
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
      const fixedAccount = await FixedAccountService.updateFixedAccount(
        userId,
        id,
        req.body
      );
      if (!fixedAccount) {
        return res.status(404).json({ message: "Fixed Account not found" });
      }
      return res.status(200).json(fixedAccount);
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }

  static async deleteFixedAccount(req: Request, res: Response) {
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
      const deleted = await FixedAccountService.deleteFixedAccount(userId, id);
      if (!deleted) {
        return res.status(404).json({ message: "Fixed Account not found" });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }
}
