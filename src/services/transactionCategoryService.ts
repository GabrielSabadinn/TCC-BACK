import sql from "mssql";
import { getDbConnection } from "../config/database";

export interface TransactionCategory {
  id: number;
  name: string;
  type: "Income" | "Expense";
  createdAt: Date;
  updatedAt: Date;
}

export class TransactionCategoryService {
  static async getAllCategories(): Promise<TransactionCategory[]> {
    const pool = await getDbConnection();
    const result = await pool
      .request()
      .query("SELECT * FROM [F66IN].[dbo].[TransactionCategories]");
    return result.recordset;
  }

  static async getCategoryById(
    id: number
  ): Promise<TransactionCategory | null> {
    const pool = await getDbConnection();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query(
        "SELECT * FROM [F66IN].[dbo].[TransactionCategories] WHERE Id = @id"
      );
    return result.recordset[0] || null;
  }

  static async createCategory(
    data: Partial<TransactionCategory>
  ): Promise<TransactionCategory> {
    const pool = await getDbConnection();
    const { name, type } = data;
    const result = await pool
      .request()
      .input("name", sql.NVarChar, name)
      .input("type", sql.NVarChar, type).query(`
        INSERT INTO [F66IN].[dbo].[TransactionCategories] (Name, Type, CreatedAt, UpdatedAt)
        OUTPUT INSERTED.*
        VALUES (@name, @type, GETDATE(), GETDATE())
      `);
    return result.recordset[0];
  }

  static async updateCategory(
    id: number,
    data: Partial<TransactionCategory>
  ): Promise<TransactionCategory | null> {
    const pool = await getDbConnection();
    const { name, type } = data;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("name", sql.NVarChar, name)
      .input("type", sql.NVarChar, type).query(`
        UPDATE [F66IN].[dbo].[TransactionCategories]
        SET Name = @name, Type = @type, UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE Id = @id
      `);
    return result.recordset[0] || null;
  }

  static async deleteCategory(id: number): Promise<boolean> {
    const pool = await getDbConnection();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query(
        "DELETE FROM [F66IN].[dbo].[TransactionCategories] WHERE Id = @id"
      );
    return result.rowsAffected[0] > 0;
  }
}
