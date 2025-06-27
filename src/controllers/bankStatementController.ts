import { Request, Response } from "express";
import { body, validationResult, query } from "express-validator";
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
            return res.status(500).json({ message: (error as Error).message });
        }
    }

    static async list(req: Request, res: Response) {
        try {
            const entryId = Number(req.query.entryId);
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({ message: "Usuário não autenticado" });
            }

            if (entryId) {
                const statements = await BankStatementService.listByEntryAndUser(entryId, userId);
                return res.status(200).json(statements);
            } else {
                const statements = await BankStatementService.listByUser(entryId, userId);
                return res.status(200).json(statements);
            }
        } catch (error) {
            return res.status(500).json({ message: (error as Error).message });
        }
    }


    static async delete(req: Request, res: Response) {
        await Promise.all([
            query("entryId").isInt().withMessage("entryId must be an integer").run(req),
            query("date")
                .isISO8601()
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

            const entryId = parseInt(req.query.entryId as string, 10);
            const date = new Date(req.query.date as string);

            const deleted = await BankStatementService.deleteStatement(userId, entryId, date);

            if (deleted) {
                return res.status(200).json({ message: "Registro deletado com sucesso" });
            } else {
                return res.status(404).json({ message: "Registro não encontrado" });
            }
        } catch (error) {
            return res.status(500).json({ message: (error as Error).message });
        }
    }

}
