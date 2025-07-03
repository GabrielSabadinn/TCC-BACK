import { Router } from "express";
import { NoteController } from "../controllers/noteController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, NoteController.getAllNotes);
router.post("/", authMiddleware, NoteController.createNote);
router.put("/:id", authMiddleware, NoteController.updateNote);
router.delete("/:id", authMiddleware, NoteController.deleteNote);

export default router;
