import { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { AuthService } from "../services/authService";

export class AuthController {
  static async register(req: Request, res: Response) {
    await Promise.all([
      body("name").notEmpty().withMessage("Name is required").run(req),
      body("email").isEmail().withMessage("Valid email is required").run(req),
      body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
        .run(req),
    ]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Register validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      console.log("Register request body:", req.body);
      const { name, email, password } = req.body;
      const { user, accessToken, refreshToken } = await AuthService.register(
        name,
        email,
        password
      );
      return res.status(201).json({ user, accessToken, refreshToken });
    } catch (error) {
      console.error("Register error:", error);
      return res.status(500).json({ message: (error as Error).message });
    }
  }

  static async login(req: Request, res: Response) {
    await Promise.all([
      body("email").isEmail().withMessage("Valid email is required").run(req),
      body("password").notEmpty().withMessage("Password is required").run(req),
    ]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Login validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      console.log("Login request body:", req.body);
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await AuthService.login(
        email,
        password
      );
      return res.status(200).json({ user, accessToken, refreshToken });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(401).json({ message: (error as Error).message });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    await body("refreshToken")
      .notEmpty()
      .withMessage("Refresh token is required")
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Refresh token validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      console.log("Refresh token request body:", req.body);
      const { refreshToken } = req.body;
      const { accessToken } = await AuthService.refreshToken(refreshToken);
      return res.status(200).json({ accessToken });
    } catch (error) {
      console.error("Refresh token error:", error);
      return res.status(401).json({ message: (error as Error).message });
    }
  }
}
