import sql from "mssql";
import { getDbConnection } from "../config/database";
import { FixedAccount } from "../types";

export class FixedAccountService {
  static async getAllFixedAccounts(userId: number): Promise<FixedAccount[]> {
    const pool = await getDbConnection();
    const result = await pool.request().input("userId", sql.Int, userId).query(`
        SELECT fa.*, fac.Name AS CategoryName
        FROM [F66IN].[dbo].[FixedAccounts] fa
        JOIN [F66IN].[dbo].[FixedAccountCategories] fac ON fa.CategoryId = fac.Id
        WHERE fa.UserId = @userId
      `);
    return result.recordset;
  }

  static async getFixedAccountById(
    userId: number,
    id: number
  ): Promise<FixedAccount | null> {
    const pool = await getDbConnection();
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("id", sql.Int, id).query(`
        SELECT fa.*, fac.Name AS CategoryName
        FROM [F66IN].[dbo].[FixedAccounts] fa
        JOIN [F66IN].[dbo].[FixedAccountCategories] fac ON fa.CategoryId = fac.Id
        WHERE fa.Id = @id AND fa.UserId = @userId
      `);
    return result.recordset[0] || null;
  }

  static async createFixedAccount(
    userId: number,
    data: Partial<FixedAccount>
  ): Promise<FixedAccount> {
    const pool = await getDbConnection();
    const { categoryId, description, amount, dueDate } = data;
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("categoryId", sql.Int, categoryId)
      .input("description", sql.NVarChar, description)
      .input("amount", sql.Decimal(18, 2), amount)
      .input("dueDate", sql.Date, dueDate).query(`
        INSERT INTO [F66IN].[dbo].[FixedAccounts] ([UserId], [CategoryId], [Description], [Amount], [DueDate], [CreatedAt], [UpdatedAt])
        OUTPUT INSERTED.*
        VALUES (@userId, @categoryId, @description, @amount, @dueDate, GETDATE(), GETDATE())
      `);
    return result.recordset[0];
  }

  static async updateFixedAccount(
    userId: number,
    id: number,
    data: Partial<FixedAccount>
  ): Promise<FixedAccount | null> {
    const pool = await getDbConnection();
    const { categoryId, description, amount, dueDate } = data;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("userId", sql.Int, userId)
      .input("categoryId", sql.Int, categoryId)
      .input("description", sql.NVarChar, description)
      .input("amount", sql.Decimal(18, 2), amount)
      .input("dueDate", sql.Date, dueDate).query(`
        UPDATE [F66IN].[dbo].[FixedAccounts]
        SET CategoryId = @categoryId, Description = @description, Amount = @amount, DueDate = @dueDate, UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE Id = @id AND UserId = @userId
      `);
    return result.recordset[0] || null;
  }

  static async deleteFixedAccount(
    userId: number,
    id: number
  ): Promise<boolean> {
    const pool = await getDbConnection();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("userId", sql.Int, userId)
      .query(
        "DELETE FROM [F66IN].[dbo].[FixedAccounts] WHERE Id = @id AND UserId = @userId"
      );
    return result.rowsAffected[0] > 0;
  }
}
