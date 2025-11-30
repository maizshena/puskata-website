import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');

    if (!userEmail) {
      return NextResponse.json({ error: "User email required" }, { status: 400 });
    }

    // Get user ID from email
    const users = await query('SELECT id FROM users WHERE email = ?', [userEmail]);
    
    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = users[0].id;

    const wishlist = await query(
      `SELECT wishlist.*, books.title, books.author, books.cover_image, books.available
       FROM wishlist
       JOIN books ON wishlist.book_id = books.id
       WHERE wishlist.user_id = ?
       ORDER BY wishlist.created_at DESC`,
      [userId]
    );

    return NextResponse.json({ wishlist }, { status: 200 });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { user_email, book_id } = body;

    if (!user_email || !book_id) {
      return NextResponse.json({ error: "User email and book ID required" }, { status: 400 });
    }

    // Get user ID from email
    const users = await query('SELECT id FROM users WHERE email = ?', [user_email]);
    
    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = users[0].id;

    // Check if already in wishlist
    const existing = await query(
      'SELECT * FROM wishlist WHERE user_id = ? AND book_id = ?',
      [userId, book_id]
    );

    if (existing.length > 0) {
      return NextResponse.json({ error: "Book already in wishlist" }, { status: 400 });
    }

    const result = await query(
      'INSERT INTO wishlist (user_id, book_id) VALUES (?, ?)',
      [userId, book_id]
    );

    return NextResponse.json(
      { message: "Book added to wishlist", wishlistId: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    const userEmail = searchParams.get('userEmail');

    if (!userEmail || !bookId) {
      return NextResponse.json({ error: "User email and book ID required" }, { status: 400 });
    }

    // Get user ID from email
    const users = await query('SELECT id FROM users WHERE email = ?', [userEmail]);
    
    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = users[0].id;

    await query(
      'DELETE FROM wishlist WHERE user_id = ? AND book_id = ?',
      [userId, bookId]
    );

    return NextResponse.json({ message: "Book removed from wishlist" }, { status: 200 });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 });
  }
}