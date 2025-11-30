import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { query } from "@/lib/db";
import { registerSchema } from "@/lib/validations";

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate with Zod
    const validatedData = registerSchema.parse(body);

    // Check if email already exists
    const existingUsers = await query(
      'SELECT * FROM users WHERE email = ?',
      [validatedData.email]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Insert new user
    const result = await query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [validatedData.name, validatedData.email, hashedPassword, 'user']
    );

    return NextResponse.json(
      { message: "Registrasi berhasil!", userId: result.insertId },
      { status: 201 }
    );

  } catch (error) {
    console.error("Register error:", error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan saat registrasi" },
      { status: 500 }
    );
  }
}