import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request) {
  try {
    const categories = await query(`
      SELECT DISTINCT category
      FROM books
      WHERE category IS NOT NULL AND category != ''
      ORDER BY category ASC
    `);

    const categoryList = categories.map(c => c.category);

    return NextResponse.json({ categories: categoryList }, { status: 200 });
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json({ error: "Gagal mengambil kategori" }, { status: 500 });
  }
}