import sql from "mssql";
import { getDbConnection } from "../config/database";
import { User } from "../types";

export class UserService {
  static async getAllUsers(userId: number): Promise<User[]> {
    const pool = await getDbConnection();
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("SELECT * FROM [F66IN].[dbo].[Users] WHERE Id = @userId");
    return result.recordset;
  }

  static async getUserById(id: number): Promise<User | null> {
    const pool = await getDbConnection();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM [F66IN].[dbo].[Users] WHERE Id = @id");
    return result.recordset[0] || null;
  }

  static async updateUser(
    id: number,
    data: Partial<User>
  ): Promise<User | null> {
    const pool = await getDbConnection();
    const { name, email, pathImageBanner, pathImageIcon } = data;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("name", sql.NVarChar, name)
      .input("email", sql.NVarChar, email)
      .input("pathImageBanner", sql.NVarChar, pathImageBanner)
      .input("pathImageIcon", sql.NVarChar, pathImageIcon).query(`
        UPDATE [F66IN].[dbo].[Users]
        SET Name = @name, Email = @email, PathImageBanner = @pathImageBanner,
            PathImageIcon = @pathImageIcon, UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE Id = @id
      `);
    return result.recordset[0] || null;
  }

  static async deleteUser(id: number): Promise<boolean> {
    const pool = await getDbConnection();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM [F66IN].[dbo].[Users] WHERE Id = @id");
    return result.rowsAffected[0] > 0;
  }
}
