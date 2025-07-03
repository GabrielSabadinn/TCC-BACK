import { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { NoteService } from "../services/noteService";

export class NoteController {
    static async getAllNotes(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const notes = await NoteService.getAllNotes(userId);
            return res.status(200).json(notes);
        } catch (error) {
            return res.status(500).json({ message: (error as Error).message });
        }
    }

    static async createNote(req: Request, res: Response) {
        await Promise.all([
            body("note").isString().notEmpty().run(req),
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

            const existingNotes = await NoteService.countNotes(userId);
            if (existingNotes >= 5) {
                return res
                    .status(400)
                    .json({ message: "Note limit reached (max 5 per user)" });
            }

            const data = { ...req.body, userId };
            const newNote = await NoteService.createNote(data);
            return res.status(201).json(newNote);
        } catch (error) {
            return res.status(500).json({ message: (error as Error).message });
        }
    }

    static async updateNote(req: Request, res: Response) {
        await Promise.all([
            param("id").isInt().run(req),
            body("note").optional().isString().run(req),
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

            const updatedNote = await NoteService.updateNote(userId, id, req.body);
            if (!updatedNote) {
                return res.status(404).json({ message: "Note not found" });
            }

            return res.status(200).json(updatedNote);
        } catch (error) {
            return res.status(500).json({ message: (error as Error).message });
        }
    }

    static async deleteNote(req: Request, res: Response) {
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

            const deleted = await NoteService.deleteNote(userId, id);
            if (!deleted) {
                return res.status(404).json({ message: "Note not found" });
            }

            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ message: (error as Error).message });
        }
    }
}
