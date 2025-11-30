import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";

export async function GET(request) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === 'admin') {
      // Admin statistics
      const totalBooks = await query('SELECT COUNT(*) as count FROM books');
      const totalUsers = await query('SELECT COUNT(*) as count FROM users WHERE role = "user"');
      const activeLoans = await query('SELECT COUNT(*) as count FROM loans WHERE status IN ("pending", "approved")');
      const pendingLoans = await query('SELECT COUNT(*) as count FROM loans WHERE status = "pending"');

      return NextResponse.json({
        totalBooks: totalBooks[0].count,
        totalUsers: totalUsers[0].count,
        activeLoans: activeLoans[0].count,
        pendingLoans: pendingLoans[0].count,
      }, { status: 200 });
    } else {
      // User statistics
      const activeLoans = await query(
        'SELECT COUNT(*) as count FROM loans WHERE user_id = ? AND status IN ("pending", "approved")',
        [session.user.id]
      );
      const totalLoans = await query(
        'SELECT COUNT(*) as count FROM loans WHERE user_id = ?',
        [session.user.id]
      );
      const wishlistCount = await query(
        'SELECT COUNT(*) as count FROM wishlist WHERE user_id = ?',
        [session.user.id]
      );
      const totalFines = await query(
        'SELECT SUM(fine) as total FROM loans WHERE user_id = ? AND fine > 0',
        [session.user.id]
      );

      return NextResponse.json({
        activeLoans: activeLoans[0].count,
        totalLoans: totalLoans[0].count,
        wishlistCount: wishlistCount[0].count,
        totalFines: totalFines[0].total || 0,
      }, { status: 200 });
    }
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json({ error: "Gagal mengambil statistik" }, { status: 500 });
  }
}