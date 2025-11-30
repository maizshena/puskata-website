import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';

    let sql = 'SELECT * FROM books WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (title LIKE ? OR author LIKE ? OR publisher LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    const books = await query(sql, params);

    return NextResponse.json({ books }, { status: 200 });
  } catch (error) {
    console.error("Get books error:", error);
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log('Received create data:', body);
    
    const { 
      title, author, isbn, publisher, published_year, category, 
      pages, language, description, cover_image, quantity, available, status 
    } = body;

    // Validate required fields
    if (!title || !author) {
      return NextResponse.json(
        { error: "Title and author are required" },
        { status: 400 }
      );
    }

    // Convert values properly
    const cleanData = {
      title: title || null,
      author: author || null,
      isbn: isbn && isbn.trim() !== '' ? isbn : null,
      publisher: publisher && publisher.trim() !== '' ? publisher : null,
      published_year: published_year && published_year !== '' ? parseInt(published_year) : null,
      category: category && category.trim() !== '' ? category : null,
      pages: pages && pages !== '' ? parseInt(pages) : null,
      language: language && language.trim() !== '' ? language : 'Indonesian',
      description: description && description.trim() !== '' ? description : null,
      cover_image: cover_image && cover_image.trim() !== '' ? cover_image : null,
      quantity: quantity && quantity !== '' ? parseInt(quantity) : 1,
      available: available && available !== '' ? parseInt(available) : 1,
      status: status && status.trim() !== '' ? status : 'active'
    };

    console.log('Cleaned data:', cleanData);

    const result = await query(
      `INSERT INTO books 
      (title, author, isbn, publisher, published_year, category, pages, language, description, cover_image, quantity, available, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanData.title,
        cleanData.author,
        cleanData.isbn,
        cleanData.publisher,
        cleanData.published_year,
        cleanData.category,
        cleanData.pages,
        cleanData.language,
        cleanData.description,
        cleanData.cover_image,
        cleanData.quantity,
        cleanData.available,
        cleanData.status
      ]
    );

    return NextResponse.json(
      { message: "Book added successfully", bookId: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add book error:", error);
    return NextResponse.json(
      { error: "Failed to add book: " + error.message },
      { status: 500 }
    );
  }
}