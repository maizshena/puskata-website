import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcrypt";

export async function GET(request, context) {
  try {
    const params = await context.params;
    const userId = params.id;
    
    console.log('Fetching user with ID:', userId); // Debug
    
    const users = await query(
      'SELECT id, name, email, profile_image, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: users[0] }, { status: 200 });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch user: " + error.message 
    }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const params = await context.params;
    const userId = params.id;
    
    const body = await request.json();
    console.log('Updating user ID:', userId, 'with data:', body); // Debug

    const { name, email, password, role, profile_image } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if email exists for other users
    const existingUsers = await query(
      'SELECT * FROM users WHERE email = ? AND id != ?',
      [email, userId]
    );
    
    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // Update user
    if (password && password.trim() !== '') {
      // Update with new password
      const hashedPassword = await bcrypt.hash(password, 10);
      await query(
        'UPDATE users SET name = ?, email = ?, password = ?, role = ?, profile_image = ? WHERE id = ?',
        [name.trim(), email.trim(), hashedPassword, role || 'user', profile_image || null, userId]
      );
      console.log('User updated with new password'); // Debug
    } else {
      // Update without password change
      await query(
        'UPDATE users SET name = ?, email = ?, role = ?, profile_image = ? WHERE id = ?',
        [name.trim(), email.trim(), role || 'user', profile_image || null, userId]
      );
      console.log('User updated without password change'); // Debug
    }

    return NextResponse.json({ message: "User updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ 
      error: "Failed to update user: " + error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const userId = params.id;
    
    console.log('Deleting user ID:', userId); // Debug

    // Check if user has active loans
    const activeLoans = await query(
      'SELECT COUNT(*) as count FROM loans WHERE user_id = ? AND status IN ("pending", "approved")',
      [userId]
    );

    if (activeLoans[0].count > 0) {
      return NextResponse.json(
        { error: "Cannot delete user with active loans" },
        { status: 400 }
      );
    }

    // Delete user
    await query('DELETE FROM users WHERE id = ?', [userId]);
    
    console.log('User deleted successfully'); // Debug

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ 
      error: "Failed to delete user: " + error.message 
    }, { status: 500 });
  }
}