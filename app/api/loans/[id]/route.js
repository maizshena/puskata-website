// app/api/loans/[id]/route.js
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PUT(request, context) {
  try {
    // Await params in Next.js 15+
    const params = await context.params;
    const loanId = params.id;
    
    const body = await request.json();
    const { status, return_date, fine, rejection_reason } = body;

    console.log('Update loan request:', { id: loanId, status, return_date, fine, rejection_reason });

    // Get current loan details
    const loans = await query('SELECT * FROM loans WHERE id = ?', [loanId]);
    
    if (loans.length === 0) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    const loan = loans[0];
    const previousStatus = loan.status;

    console.log('Current loan:', loan);

    // Build update query dynamically
    let updateQuery = 'UPDATE loans SET status = ?';
    let updateParams = [status];

    if (return_date !== undefined && return_date !== null) {
      updateQuery += ', return_date = ?';
      updateParams.push(return_date);
    }

    if (fine !== undefined && fine !== null) {
      updateQuery += ', fine = ?';
      updateParams.push(fine);
    }

    if (rejection_reason !== undefined && rejection_reason !== null) {
      updateQuery += ', rejection_reason = ?';
      updateParams.push(rejection_reason);
    }

    updateQuery += ' WHERE id = ?';
    updateParams.push(loanId);

    console.log('Executing update:', updateQuery, updateParams);

    await query(updateQuery, updateParams);

    // Update book availability
    if (status === 'approved' && previousStatus === 'pending') {
      // Check current book availability
      const books = await query('SELECT available FROM books WHERE id = ?', [loan.book_id]);
      
      if (books.length === 0 || books[0].available <= 0) {
        // Rollback
        await query('UPDATE loans SET status = ? WHERE id = ?', ['pending', loanId]);
        return NextResponse.json({ error: "Book is not available" }, { status: 400 });
      }

      // Decrease available
      await query(
        'UPDATE books SET available = available - 1 WHERE id = ?',
        [loan.book_id]
      );
      console.log('Book availability decreased for book_id:', loan.book_id);
      
    } else if ((status === 'returned' || status === 'rejected') && previousStatus === 'approved') {
      // Increase available
      await query(
        'UPDATE books SET available = available + 1 WHERE id = ?',
        [loan.book_id]
      );
      console.log('Book availability increased for book_id:', loan.book_id);
    }

    return NextResponse.json({ 
      message: "Loan status updated successfully",
      loan: {
        id: loanId,
        status: status
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Update loan error:", error);
    return NextResponse.json({ 
      error: "Failed to update loan: " + error.message 
    }, { status: 500 });
  }
}