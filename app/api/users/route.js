import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcrypt";

export async function GET(request) {
  try {
    console.log('=== GET /api/users called ===');
    
    // Simple query first
    const sql = 'SELECT id, name, email, profile_image, role, created_at FROM users ORDER BY created_at DESC';
    
    console.log('Executing SQL:', sql);
    
    const users = await query(sql);
    
    console.log('Users fetched:', users.length);
    console.log('First user:', users[0]);

    return NextResponse.json({ 
      success: true,
      users: users 
    }, { status: 200 });
    
  } catch (error) {
    console.error("=== GET /api/users ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return NextResponse.json({ 
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    console.log('=== POST /api/users called ===');
    
    const body = await request.json();
    console.log('Request body:', body);

    const { name, email, password, role, profile_image } = body;

    // Validate required fields
    if (!name || !email || !password) {
      console.log('Validation failed: missing required fields');
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    console.log('Checking if email exists:', email);
    
    // Check if email already exists
    const existingUsers = await query('SELECT id FROM users WHERE email = ?', [email]);
    
    console.log('Existing users found:', existingUsers.length);
    
    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    console.log('Hashing password...');
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Inserting user into database...');
    
    // Insert user
    const result = await query(
      'INSERT INTO users (name, email, password, role, profile_image) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim(), hashedPassword, role || 'user', profile_image || null]
    );

    console.log('User created with ID:', result.insertId);

    return NextResponse.json(
      { 
        success: true,
        message: "User created successfully", 
        userId: result.insertId 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error("=== POST /api/users ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return NextResponse.json({ 
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}