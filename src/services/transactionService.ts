import sql from "mssql";
import { getDbConnection } from "../config/database";
import { Transaction } from "../types";

export class TransactionService {
  static async getAllTransactions(userId: number): Promise<Transaction[]> {
    const pool = await getDbConnection();
    const result = await pool.request().input("userId", sql.Int, userId).query(`
        SELECT t.*, tc.Name AS CategoryName
        FROM [F66IN].[dbo].[Transactions] t
        JOIN [F66IN].[dbo].[TransactionCategories] tc ON t.CategoryId = tc.Id
        WHERE t.UserId = @userId
      `);
    return result.recordset;
  }

  static async getTransactionById(
    userId: number,
    id: number
  ): Promise<Transaction | null> {
    const pool = await getDbConnection();
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("id", sql.Int, id).query(`
        SELECT t.*, tc.Name AS CategoryName
        FROM [F66IN].[dbo].[Transactions] t
        JOIN [F66IN].[dbo].[TransactionCategories] tc ON t.CategoryId = tc.Id
        WHERE t.Id = @id AND t.UserId = @userId
      `);
    return result.recordset[0] || null;
  }

  static async createTransaction(
    userId: number,
    data: Partial<Transaction>
  ): Promise<Transaction> {
    const pool = await getDbConnection();
    const { categoryId, date, description, amount } = data;
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("categoryId", sql.Int, categoryId)
      .input("date", sql.Date, date)
      .input("description", sql.NVarChar, description)
      .input("amount", sql.Decimal(18, 2), amount).query(`
        INSERT INTO [F66IN].[dbo].[Transactions] ([UserId], [CategoryId], [Date], [Description], [Amount], [CreatedAt], [UpdatedAt])
        OUTPUT INSERTED.*
        VALUES (@userId, @categoryId, @date, @description, @amount, GETDATE(), GETDATE())
      `);
    return result.recordset[0];
  }

  static async updateTransaction(
    userId: number,
    id: number,
    data: Partial<Transaction>
  ): Promise<Transaction | null> {
    const pool = await getDbConnection();
    const { categoryId, date, description, amount } = data;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("userId", sql.Int, userId)
      .input("categoryId", sql.Int, categoryId)
      .input("date", sql.Date, date)
      .input("description", sql.NVarChar, description)
      .input("amount", sql.Decimal(18, 2), amount).query(`
        UPDATE [F66IN].[dbo].[Transactions]
        SET CategoryId = @categoryId, Date = @date, Description = @description, Amount = @amount, UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE Id = @id AND UserId = @userId
      `);
    return result.recordset[0] || null;
  }

  static async deleteTransaction(userId: number, id: number): Promise<boolean> {
    const pool = await getDbConnection();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("userId", sql.Int, userId)
      .query(
        "DELETE FROM [F66IN].[dbo].[Transactions] WHERE Id = @id AND UserId = @userId"
      );
    return result.rowsAffected[0] > 0;
  }
}
