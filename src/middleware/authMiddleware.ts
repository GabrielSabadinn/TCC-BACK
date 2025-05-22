import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { TokenPayload } from "../types";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(
    `[${new Date().toISOString()}] authMiddleware: Processing ${req.method} ${req.originalUrl
    }`
  );
  console.log("authMiddleware: Headers:", JSON.stringify(req.headers, null, 2));
  console.log("authMiddleware: Raw Headers:", req.rawHeaders);

  const authHeader = req.headers.authorization || req.headers.Authorization;
  console.log("authMiddleware: Authorization header:", authHeader);

  if (!authHeader) {
    console.error("authMiddleware: Authorization header missing", {
      headers: req.headers,
      rawHeaders: req.rawHeaders,
    });
    return res.status(401).json({ message: "No token provided" });
  }

  const authHeaderString = Array.isArray(authHeader)
    ? authHeader[0]
    : authHeader;
  if (!authHeaderString.startsWith("Bearer ")) {
    console.error("authMiddleware: Invalid Authorization header format", {
      authHeader,
      headers: req.headers,
      rawHeaders: req.rawHeaders,
    });
    return res.status(401).json({ message: "Invalid token format" });
  }

  const token = authHeaderString.slice(7);
  if (!token) {
    console.error("authMiddleware: Token missing after Bearer", {
      authHeader,
      headers: req.headers,
      rawHeaders: req.rawHeaders,
    });
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    console.log("authMiddleware: Attempting to verify token:", token);
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as jwt.JwtPayload;

    if (!decoded.userId || !decoded.email) {
      console.error("authMiddleware: Invalid token payload", { decoded });
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const tokenPayload: TokenPayload = {
      userId: decoded.userId,
      email: decoded.email,
    };
    console.log("authMiddleware: Token decoded successfully:", tokenPayload);
    req.user = tokenPayload;
    next();
  } catch (error) {
    console.error("authMiddleware: Token verification failed", {
      error,
      token,
    });
    return res.status(401).json({ message: "Invalid token" });
  }
};

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
