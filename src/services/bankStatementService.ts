import sql from "mssql";
import { getDbConnection } from "../config/database";
import { BankStatement } from "../types";

export class BankStatementService {
    static async createBankStatement(
        userId: number,
        data: Partial<BankStatement>
    ): Promise<BankStatement> {
        const pool = await getDbConnection();
        const { entryId, entryType, value, description, date } = data;

        const result = await pool.request()
            .input("userId", sql.Int, userId)
            .input("entryId", sql.Int, entryId)
            .input("entryType", sql.Char(1), entryType ?? null)
            .input("value", sql.Decimal(18, 10), value)
            .input("description", sql.VarChar(100), description ?? null)
            .input("date", sql.DateTime, date)
            .query(`
        INSERT INTO [dbo].[BankStatement] ([UserId], [EntryId], [EntryType], [Value], [Description], [Date])
        OUTPUT INSERTED.*
        VALUES (@userId, @entryId, @entryType, @value, @description, @date)
      `);

        return result.recordset[0];
    }

    static async getBalanceByUser(userId: number) {
        const pool = await sql.connect(); // ou sua forma de conectar ao banco

        const result = await pool.request()
            .input("userId", sql.Int, userId)
            .query(`
                SELECT 
                    SUM(CASE WHEN EntryType = 'C' THEN Value ELSE 0 END) AS TotalCredits,
                    SUM(CASE WHEN EntryType = 'D' THEN Value ELSE 0 END) AS TotalDebits,
                    SUM(CASE WHEN EntryType = 'C' THEN Value ELSE -Value END) AS Balance
                FROM BankStatement
                WHERE UserId = @userId
            `);

        const row = result.recordset[0];

        return {
            userId,
            totalCredits: parseFloat(row.TotalCredits || 0),
            totalDebits: parseFloat(row.TotalDebits || 0),
            balance: parseFloat(row.Balance || 0)
        };
    }

    static async listByEntryAndUser(entryId: number, userId: number) {
        const pool = await sql.connect();

        const result = await pool.request()
            .input("entryId", sql.Int, entryId)
            .input("userId", sql.Int, userId)
            .query(`
            SELECT *
            FROM BankStatement
            WHERE EntryId = @entryId AND UserId = @userId
            ORDER BY Date DESC
          `);

        return result.recordset;
    }

    static async listByUser(entryId: number, userId: number) {
        const pool = await sql.connect();

        const result = await pool.request()
            .input("entryId", sql.Int, entryId)
            .input("userId", sql.Int, userId)
            .query(`
            SELECT *
            FROM BankStatement
            WHERE UserId = @userId
            ORDER BY Date DESC
          `);

        return result.recordset;
    }


    static async deleteStatement(userId: number, entryId: number, date: Date) {
        const pool = await sql.connect();

        const result = await pool.request()
            .input("userId", sql.Int, userId)
            .input("entryId", sql.Int, entryId)
            .input("date", sql.DateTime, date)
            .query(`
                DELETE TOP (1) FROM [dbo].[BankStatement]
                WHERE [UserId] = @userId AND [EntryId] = @entryId AND [Date] = @date
            `);

        return result.rowsAffected[0] > 0;
    }
}
