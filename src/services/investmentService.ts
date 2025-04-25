import sql from "mssql";
import { getDbConnection } from "../config/database";
import { Investment } from "../types";

export class InvestmentService {
  static async getAllInvestments(userId: number): Promise<Investment[]> {
    const pool = await getDbConnection();
    const result = await pool.request().input("userId", sql.Int, userId).query(`
        SELECT i.*, ic.Name AS CategoryName
        FROM [F66IN].[dbo].[Investments] i
        JOIN [F66IN].[dbo].[InvestmentCategories] ic ON i.CategoryId = ic.Id
        WHERE i.UserId = @userId
      `);
    return result.recordset;
  }

  static async getInvestmentById(
    userId: number,
    id: number
  ): Promise<Investment | null> {
    const pool = await getDbConnection();
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("id", sql.Int, id).query(`
        SELECT i.*, ic.Name AS CategoryName
        FROM [F66IN].[dbo].[Investments] i
        JOIN [F66IN].[dbo].[InvestmentCategories] ic ON i.CategoryId = ic.Id
        WHERE i.Id = @id AND i.UserId = @userId
      `);
    return result.recordset[0] || null;
  }

  static async createInvestment(
    userId: number,
    data: Partial<Investment>
  ): Promise<Investment> {
    const pool = await getDbConnection();
    const { categoryId, date, description, amount, returnPercentage } = data;
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("categoryId", sql.Int, categoryId)
      .input("date", sql.Date, date)
      .input("description", sql.NVarChar, description)
      .input("amount", sql.Decimal(18, 2), amount)
      .input("returnPercentage", sql.Decimal(5, 2), returnPercentage).query(`
        INSERT INTO [F66IN].[dbo].[Investments] ([UserId], [CategoryId], [Date], [Description], [Amount], [ReturnPercentage], [CreatedAt], [UpdatedAt])
        OUTPUT INSERTED.*
        VALUES (@userId, @categoryId, @date, @description, @amount, @returnPercentage, GETDATE(), GETDATE())
      `);
    return result.recordset[0];
  }

  static async updateInvestment(
    userId: number,
    id: number,
    data: Partial<Investment>
  ): Promise<Investment | null> {
    const pool = await getDbConnection();
    const { categoryId, date, description, amount, returnPercentage } = data;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("userId", sql.Int, userId)
      .input("categoryId", sql.Int, categoryId)
      .input("date", sql.Date, date)
      .input("description", sql.NVarChar, description)
      .input("amount", sql.Decimal(18, 2), amount)
      .input("returnPercentage", sql.Decimal(5, 2), returnPercentage).query(`
        UPDATE [F66IN].[dbo].[Investments]
        SET CategoryId = @categoryId, Date = @date, Description = @description, Amount = @amount, ReturnPercentage = @returnPercentage, UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE Id = @id AND UserId = @userId
      `);
    return result.recordset[0] || null;
  }

  static async deleteInvestment(userId: number, id: number): Promise<boolean> {
    const pool = await getDbConnection();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("userId", sql.Int, userId)
      .query(
        "DELETE FROM [F66IN].[dbo].[Investments] WHERE Id = @id AND UserId = @userId"
      );
    return result.rowsAffected[0] > 0;
  }
}
