import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";

export async function GET(request) {
  try {
    const session = await getServerSession();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Most borrowed books
    const topBooks = await query(`
      SELECT books.id, books.title, books.author, COUNT(loans.id) as borrow_count
      FROM books
      LEFT JOIN loans ON books.id = loans.book_id
      WHERE loans.status IN ('approved', 'returned')
      GROUP BY books.id
      ORDER BY borrow_count DESC
      LIMIT 10
    `);

    // Most active users
    const topUsers = await query(`
      SELECT users.id, users.name, users.email, COUNT(loans.id) as loan_count
      FROM users
      LEFT JOIN loans ON users.id = loans.user_id
      WHERE users.role = 'user'
      GROUP BY users.id
      ORDER BY loan_count DESC
      LIMIT 10
    `);

    // Monthly statistics
    const monthlyStats = await query(`
      SELECT 
        DATE_FORMAT(loan_date, '%Y-%m') as month,
        COUNT(*) as total_loans,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) as returned,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM loans
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `);

    // Total fines collected
    const finesTotal = await query(`
      SELECT SUM(fine) as total_fines
      FROM loans
      WHERE fine > 0
    `);

    // Overdue loans
    const overdueLoans = await query(`
      SELECT COUNT(*) as overdue_count
      FROM loans
      WHERE status = 'approved' AND due_date < CURDATE()
    `);

    return NextResponse.json({
      topBooks,
      topUsers,
      monthlyStats,
      totalFines: finesTotal[0].total_fines || 0,
      overdueCount: overdueLoans[0].overdue_count || 0,
    }, { status: 200 });
  } catch (error) {
    console.error("Get reports error:", error);
    return NextResponse.json({ error: "Gagal mengambil laporan" }, { status: 500 });
  }
}