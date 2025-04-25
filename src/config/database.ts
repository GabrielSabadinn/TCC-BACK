import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const dbConfig: sql.config = {
  user: process.env.DB_USER || "dev",
  password: process.env.DB_PASSWORD || "1q2w3e4r@#$",
  server: "127.0.0.1",
  port: 1433,
  database: "F66IN",
  options: {
    trustServerCertificate: true,
  },
};

let pool: sql.ConnectionPool | null = null;

export const getDbConnection = async (): Promise<sql.ConnectionPool> => {
  if (pool) return pool;
  try {
    pool = await sql.connect(dbConfig);
    console.log("Connected to SQL Server");
    return pool;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};
