import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import transactionCategoryRoutes from "./routes/transactionCategoryRoutes";
import investmentRoutes from "./routes/investmentRoutes";
import fixedAccountRoutes from "./routes/fixedAccountRoutes";
import bankStatementRoutes from "./routes/bankStatementRoutes";
import { getDbConnection } from "./config/database";

dotenv.config();

const app = express();
const port = process.env.API_PORT || 3000;
app.use(express.json({ limit: "100mb" }));

app.use(cors());

app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] Incoming Request: ${req.method} ${
      req.originalUrl
    }`
  );
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Raw Headers:", req.rawHeaders);
  console.log("Body before parsing:", req.body);
  next();
});

app.use(express.json());

app.use((req, res, next) => {
  console.log("Body after parsing:", JSON.stringify(req.body, null, 2));
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/transaction-categories", transactionCategoryRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/fixed-accounts", fixedAccountRoutes);
app.use("/api/bank-statements", bankStatementRoutes);

app.get("/test", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  try {
    const pool = await getDbConnection();
    console.log(
      "Database connection successful:",
      await pool.request().query("SELECT DB_NAME() AS database_name")
    );
  } catch (error) {
    console.error("Database connection failed:", error);
  }
});
