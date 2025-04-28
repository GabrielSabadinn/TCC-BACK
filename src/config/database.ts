import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const dbConfig: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || "",
  port: +(process.env.DB_PORT || 0),
  database: process.env.DB_NAME,
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
