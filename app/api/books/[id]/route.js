import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request, context) {
  try {
    const params = await context.params;
    const bookId = params.id;
    
    const books = await query('SELECT * FROM books WHERE id = ?', [bookId]);

    if (books.length === 0) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json({ book: books[0] }, { status: 200 });
  } catch (error) {
    console.error("Get book error:", error);
    return NextResponse.json({ error: "Failed to fetch book" }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const params = await context.params;
    const bookId = params.id;
    
    const body = await request.json();
    
    console.log('Received update data:', body);
    
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

    // Convert values properly - handle empty strings and null
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

    await query(
      `UPDATE books SET 
      title = ?, author = ?, isbn = ?, publisher = ?, published_year = ?, 
      category = ?, pages = ?, language = ?, description = ?, cover_image = ?, 
      quantity = ?, available = ?, status = ?
      WHERE id = ?`,
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
        cleanData.status,
        bookId
      ]
    );

    return NextResponse.json({ message: "Book updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Update book error:", error);
    return NextResponse.json({ error: "Failed to update book: " + error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const bookId = params.id;
    
    // Check if book has active loans
    const activeLoans = await query(
      'SELECT COUNT(*) as count FROM loans WHERE book_id = ? AND status IN ("pending", "approved")',
      [bookId]
    );

    if (activeLoans[0].count > 0) {
      return NextResponse.json(
        { error: "Cannot delete book with active loans" },
        { status: 400 }
      );
    }

    await query('DELETE FROM books WHERE id = ?', [bookId]);
    return NextResponse.json({ message: "Book deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete book error:", error);
    return NextResponse.json({ error: "Failed to delete book" }, { status: 500 });
  }
}