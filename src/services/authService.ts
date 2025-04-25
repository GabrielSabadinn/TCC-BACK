import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sql from "mssql";
import { getDbConnection } from "../config/database";
import { User, TokenPayload } from "../types";

export class AuthService {
  static async register(
    name: string,
    email: string,
    password: string
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtSecret || !jwtRefreshSecret) {
      throw new Error("JWT_SECRET or JWT_REFRESH_SECRET is not defined");
    }

    const pool = await getDbConnection();

    const existingUser = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT Id FROM [F66IN].[dbo].[Users] WHERE Email = @email");
    if (existingUser.recordset.length > 0) {
      console.error("Register error: Email already exists", { email });
      throw new Error("Email already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Register: Generated hash for password:", {
      email,
      hashedPassword,
      salt,
    });

    const result = await pool
      .request()
      .input("name", sql.NVarChar, name)
      .input("email", sql.NVarChar, email)
      .input("pwd", sql.NVarChar, hashedPassword)
      .input("salt", sql.NVarChar, salt).query(`
        INSERT INTO [F66IN].[dbo].[Users] ([Name], [Email], [Pwd], [Salt], [CreatedAt], [UpdatedAt])
        OUTPUT INSERTED.*
        VALUES (@name, @email, @pwd, @salt, GETDATE(), GETDATE())
      `);

    const rawUser = result.recordset[0];
    const user: User = {
      id: rawUser.Id,
      name: rawUser.Name,
      email: rawUser.Email,
      Pwd: rawUser.Pwd,
      salt: rawUser.Salt,
      pathImageBanner: rawUser.PathImageBanner,
      pathImageIcon: rawUser.PathImageIcon,
      createdAt: rawUser.CreatedAt,
      updatedAt: rawUser.UpdatedAt,
    };
    console.log("Register: User created:", {
      userId: user.id,
      email: user.email,
      hasPwd: !!user.Pwd,
    });

    const payload: TokenPayload = { userId: user.id, email: user.email };
    console.log("Register: Generating token with payload:", payload);
    const accessToken = jwt.sign(payload, jwtSecret, {
      expiresIn: "2d",
    } as jwt.SignOptions);
    const refreshToken = jwt.sign(payload, jwtRefreshSecret, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    } as jwt.SignOptions);

    return { user, accessToken, refreshToken };
  }

  static async login(
    email: string,
    password: string
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtSecret || !jwtRefreshSecret) {
      throw new Error("JWT_SECRET or JWT_REFRESH_SECRET is not defined");
    }

    if (!email || !password) {
      console.error("Login error: Email or password is missing", {
        email,
        password,
      });
      throw new Error("Email and password are required");
    }

    const pool = await getDbConnection();
    const result = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query(
        "SELECT Id, Name, Email, Pwd, Salt, CreatedAt, UpdatedAt, PathImageBanner, PathImageIcon FROM [F66IN].[dbo].[Users] WHERE Email = @email"
      );

    console.log("Login: Raw query result:", result.recordset);

    const rawUser = result.recordset[0];
    if (!rawUser) {
      console.error("Login error: User not found for email", { email });
      throw new Error("User not found");
    }

    const user: User = {
      id: rawUser.Id,
      name: rawUser.Name,
      email: rawUser.Email,
      Pwd: rawUser.Pwd,
      salt: rawUser.Salt,
      pathImageBanner: rawUser.PathImageBanner,
      pathImageIcon: rawUser.PathImageIcon,
      createdAt: rawUser.CreatedAt,
      updatedAt: rawUser.UpdatedAt,
    };

    if (!user.Pwd) {
      console.error("Login error: Stored password is missing for user", {
        userId: user.id,
        email,
        user,
      });
      throw new Error("Stored password is missing");
    }

    console.log("Comparing passwords:", {
      email,
      providedPassword: password,
      storedHash: user.Pwd,
    });
    const isMatch = await bcrypt.compare(password, user.Pwd);
    if (!isMatch) {
      console.error("Login error: Password mismatch", { email });
      throw new Error("Invalid password");
    }

    const payload: TokenPayload = { userId: user.id, email: user.email };
    console.log("Login: Generating token with payload:", payload);
    const accessToken = jwt.sign(payload, jwtSecret, {
      expiresIn: "2d",
    } as jwt.SignOptions);
    const refreshToken = jwt.sign(payload, jwtRefreshSecret, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    } as jwt.SignOptions);

    return { user, accessToken, refreshToken };
  }

  static async refreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string }> {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtSecret || !jwtRefreshSecret) {
      throw new Error("JWT_SECRET or JWT_REFRESH_SECRET is not defined");
    }

    try {
      const decoded = jwt.verify(
        refreshToken,
        jwtRefreshSecret
      ) as TokenPayload;
      if (!decoded.userId || !decoded.email) {
        console.error("Refresh token: Invalid payload", { decoded });
        throw new Error("Invalid refresh token payload");
      }
      const payload: TokenPayload = {
        userId: decoded.userId,
        email: decoded.email,
      };
      console.log("Refresh token: Generating new token with payload:", payload);
      const accessToken = jwt.sign(payload, jwtSecret, {
        expiresIn: "2d",
      } as jwt.SignOptions);
      return { accessToken };
    } catch (error) {
      console.error("Refresh token error:", error);
      throw new Error("Invalid refresh token");
    }
  }
}
