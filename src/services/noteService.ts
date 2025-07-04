import sql from "mssql";
import { getDbConnection } from "../config/database";

export class NoteService {
    static async getAllNotes(userId: number) {
        const pool = await getDbConnection();
        const result = await pool.request()
            .input("userId", sql.Int, userId)
            .query(`
        SELECT * FROM [dbo].[Note]
        WHERE UserId = @userId
        ORDER BY dueDate ASC
      `);

        return result.recordset;
    }

    static async countNotes(userId: number) {
        const pool = await getDbConnection();
        const result = await pool.request()
            .input("userId", sql.Int, userId)
            .query(`
        SELECT COUNT(*) AS total FROM [dbo].[Note]
        WHERE UserId = @userId
      `);

        return result.recordset[0].total;
    }

    static async createNote(data: { note: string, dueDate: string, userId: number }) {
        const pool = await getDbConnection();
        const result = await pool.request()
            .input("note", sql.VarChar(sql.MAX), data.note)
            .input("dueDate", sql.Date, data.dueDate)
            .input("userId", sql.Int, data.userId)
            .query(`
        INSERT INTO [dbo].[Note] ([note], [dueDate], [UserId])
        OUTPUT INSERTED.*
        VALUES (@note, @dueDate, @userId)
      `);

        return result.recordset[0];
    }

    static async updateNote(userId: number, noteId: number, data: Partial<{ note: string, dueDate: string }>) {
        const pool = await getDbConnection();

        const fields: string[] = [];
        if (data.note !== undefined) fields.push("[note] = @note");
        if (data.dueDate !== undefined) fields.push("[dueDate] = @dueDate");

        if (fields.length === 0) return null;

        const query = `
      UPDATE [dbo].[Note]
      SET ${fields.join(", ")}
      OUTPUT INSERTED.*
      WHERE [Id] = @id AND [UserId] = @userId
    `;

        const request = pool.request()
            .input("id", sql.Int, noteId)
            .input("userId", sql.Int, userId);

        if (data.note !== undefined) request.input("note", sql.VarChar(sql.MAX), data.note);
        if (data.dueDate !== undefined) request.input("dueDate", sql.Date, data.dueDate);

        const result = await request.query(query);
        return result.recordset[0];
    }

    static async deleteNote(userId: number, noteId: number) {
        const pool = await getDbConnection();
        const result = await pool.request()
            .input("id", sql.Int, noteId)
            .input("userId", sql.Int, userId)
            .query(`
        DELETE FROM [dbo].[Note]
        WHERE [Id] = @id AND [UserId] = @userId
      `);

        return result.rowsAffected[0] > 0;
    }
}
