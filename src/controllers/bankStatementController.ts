import { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { BankStatementService } from "../services/bankStatementService";

export class BankStatementController {
    static async create(req: Request, res: Response) {
        await Promise.all([
            body("entryId").isInt().withMessage("EntryId must be an integer").run(req),
            body("entryType")
                .optional()
                .isString()
                .isLength({ min: 1, max: 1 })
                .withMessage("EntryType must be a single character")
                .run(req),
            body("value")
                .isDecimal()
                .withMessage("Value must be a decimal number")
                .run(req),
            body("description")
                .optional()
                .isString()
                .isLength({ max: 100 })
                .withMessage("Description must be a string up to 100 characters")
                .run(req),
            body("date")
                .isISO8601()
                .toDate()
                .withMessage("Date must be a valid ISO date")
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

            const statement = await BankStatementService.createBankStatement(userId, req.body);
            return res.status(201).json(statement);
        } catch (error) {
            return res.status(500).json({ message: (error as Error).message });
        }
    }

    static async getBalance(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const balance = await BankStatementService.getBalanceByUser(userId);
            return res.status(200).json(balance);
        } catch (error) {
            console.error("Get balance error:", error);
            return res.status(500).json({ message: (error as Error).message });
        }
    }

}
