import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request) {
  try {
    console.log('Testing database connection...');
    
    // Test simple query
    const result = await query('SELECT COUNT(*) as count FROM users');
    
    console.log('Query result:', result);
    
    return NextResponse.json({ 
      success: true,
      count: result[0].count,
      message: 'Database connection successful'
    }, { status: 200 });
    
  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json({ 
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}