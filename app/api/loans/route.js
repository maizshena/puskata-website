import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userEmail = searchParams.get('userEmail');
    const status = searchParams.get('status');
    const isAdmin = searchParams.get('isAdmin') === 'true';

    let sql = `
      SELECT 
        loans.*, 
        books.title, 
        books.author, 
        books.cover_image, 
        users.name as user_name, 
        users.email as user_email
      FROM loans
      JOIN books ON loans.book_id = books.id
      JOIN users ON loans.user_id = users.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by user if not admin
    if (!isAdmin && userEmail) {
      sql += ' AND users.email = ?';
      params.push(userEmail);
    } else if (userId) {
      sql += ' AND loans.user_id = ?';
      params.push(userId);
    }

    if (status) {
      sql += ' AND loans.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY loans.created_at DESC';

    const loans = await query(sql, params);

    return NextResponse.json({ loans }, { status: 200 });
  } catch (error) {
    console.error("Get loans error:", error);
    return NextResponse.json({ error: "Failed to fetch loans" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { user_email, book_id, loan_date, due_date } = body;

    if (!user_email || !book_id) {
      return NextResponse.json({ error: "User email and book ID required" }, { status: 400 });
    }

    // Get user ID from email
    const users = await query('SELECT id FROM users WHERE email = ?', [user_email]);
    
    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = users[0].id;

    // Check book availability
    const books = await query('SELECT available FROM books WHERE id = ?', [book_id]);
    
    if (books.length === 0) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (books[0].available <= 0) {
      return NextResponse.json({ error: "Book not available" }, { status: 400 });
    }

    // Create loan
    const result = await query(
      'INSERT INTO loans (user_id, book_id, loan_date, due_date, status) VALUES (?, ?, ?, ?, ?)',
      [userId, book_id, loan_date, due_date, 'pending']
    );

    return NextResponse.json(
      { message: "Loan request submitted successfully", loanId: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create loan error:", error);
    return NextResponse.json({ error: "Failed to create loan" }, { status: 500 });
  }
}