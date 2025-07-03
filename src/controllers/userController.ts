import { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { UserService } from "../services/userService";

export class UserController {
  static async getAllUsers(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const users = await UserService.getAllUsers(userId);
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }

  static async getUserById(req: Request, res: Response) {
    await param("id").isInt().run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const id = parseInt(req.params.id, 10);
      const user = await UserService.getUserById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }

  static async updateUser(req: Request, res: Response) {
    console.log("Update user request body:", JSON.stringify(req.body, null, 2));
    console.log("Type of name:", typeof req.body.name);
    console.log("Value of name:", req.body.name);

    await Promise.all([
      param("id").isInt().run(req),
      body("name")
        .isString()
        .withMessage("Name must be a string")
        .trim()
        .notEmpty()
        .withMessage("Name is required and cannot be empty")
        .run(req),
      body("email")
        .optional()
        .isEmail()
        .withMessage("Email must be a valid email address")
        .run(req),
      body("pathImageBanner")
        .optional()
        .isString()
        .withMessage("PathImageBanner must be a string")
        .run(req),
      body("pathImageIcon")
        .optional()
        .isString()
        .withMessage("PathImageIcon must be a string")
        .run(req),
    ]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const id = parseInt(req.params.id, 10);
      const data = req.body;
      if (!data.name) {
        return res.status(400).json({ message: "Name is required" });
      }
      // Validate Base64 strings if provided
      if (data.pathImageIcon && !data.pathImageIcon.startsWith("data:image/")) {
        return res
          .status(400)
          .json({ message: "Invalid Base64 format for pathImageIcon" });
      }
      if (
        data.pathImageBanner &&
        !data.pathImageBanner.startsWith("data:image/")
      ) {
        return res
          .status(400)
          .json({ message: "Invalid Base64 format for pathImageBanner" });
      }
      const user = await UserService.updateUser(id, data);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }

  static async updateUserMeta(req: Request, res: Response) {
    await param("id").isInt().run(req);
    await body("meta")
      .optional({ nullable: true })
      .isDecimal({ decimal_digits: "0,4" })
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const id = parseInt(req.params.id, 10);

      const metaInput = req.body.meta;
      const meta = metaInput !== undefined ? parseFloat(metaInput) : null;

      const updated = await UserService.updateUserMeta(id, meta);
      if (!updated) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      return res.status(200).json({ message: "Meta atualizada" });
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    await param("id").isInt().run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const id = parseInt(req.params.id, 10);
      const deleted = await UserService.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }
}
