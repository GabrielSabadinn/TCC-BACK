import sql from "mssql";
import { getDbConnection } from "../config/database";
import { Transaction } from "../types";

export class TransactionService {
  static async getAllTransactions(userId: number): Promise<Transaction[]> {
    const pool = await getDbConnection();
    const result = await pool.request().input("userId", sql.Int, userId).query(`
        SELECT 
          t.Id,
          t.UserId,
          t.CategoryId,
          t.Date,
          t.Description,
          t.Amount,
          t.Type,
          t.CreatedAt,
          t.UpdatedAt,
          tc.Name AS CategoryName
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
        SELECT 
          t.Id,
          t.UserId,
          t.CategoryId,
          t.Date,
          t.Description,
          t.Amount,
          t.Type,
          t.CreatedAt,
          t.UpdatedAt,
          tc.Name AS CategoryName
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
    const { categoryId, date, description, amount, type } = data;
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("categoryId", sql.Int, categoryId)
      .input("date", sql.Date, date)
      .input("description", sql.NVarChar, description)
      .input("amount", sql.Decimal(18, 2), amount)
      .input("type", sql.NVarChar(50), type || "income").query(`
        INSERT INTO [F66IN].[dbo].[Transactions] ([UserId], [CategoryId], [Date], [Description], [Amount], [Type], [CreatedAt], [UpdatedAt])
        OUTPUT INSERTED.Id, INSERTED.UserId, INSERTED.CategoryId, INSERTED.Date, INSERTED.Description, INSERTED.Amount, INSERTED.Type, INSERTED.CreatedAt, INSERTED.UpdatedAt
        VALUES (@userId, @categoryId, @date, @description, @amount, @type, GETDATE(), GETDATE())
      `);
    return result.recordset[0];
  }

  static async updateTransaction(
    userId: number,
    id: number,
    data: Partial<Transaction>
  ): Promise<Transaction | null> {
    const pool = await getDbConnection();
    const { categoryId, date, description, amount, type } = data;
    const request = pool
      .request()
      .input("id", sql.Int, id)
      .input("userId", sql.Int, userId);

    const updates = [];
    if (categoryId !== undefined) {
      updates.push("CategoryId = @categoryId");
      request.input("categoryId", sql.Int, categoryId);
    }
    if (date !== undefined) {
      updates.push("Date = @date");
      request.input("date", sql.Date, date);
    }
    if (description !== undefined) {
      updates.push("Description = @description");
      request.input("description", sql.NVarChar, description);
    }
    if (amount !== undefined) {
      updates.push("Amount = @amount");
      request.input("amount", sql.Decimal(18, 2), amount);
    }
    if (type !== undefined) {
      updates.push("Type = @type");
      request.input("type", sql.NVarChar(50), type);
    }

    if (updates.length === 0) {
      return null;
    }

    const query = `
      UPDATE [F66IN].[dbo].[Transactions]
      SET ${updates.join(", ")}, UpdatedAt = GETDATE()
      OUTPUT INSERTED.Id, INSERTED.UserId, INSERTED.CategoryId, INSERTED.Date, INSERTED.Description, INSERTED.Amount, INSERTED.Type, INSERTED.CreatedAt, INSERTED.UpdatedAt
      WHERE Id = @id AND UserId = @userId
    `;
    const result = await request.query(query);
    return result.recordset[0] || null;
  }

  static async deleteTransaction(userId: number, id: number): Promise<boolean> {
    const pool = await getDbConnection();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("userId", sql.Int, userId).query(`
        DELETE FROM [F66IN].[dbo].[Transactions]
        OUTPUT DELETED.Id
        WHERE Id = @id AND UserId = @userId
      `);
    return result.recordset.length > 0;
  }
}
