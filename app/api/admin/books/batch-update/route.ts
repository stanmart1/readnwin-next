import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/utils/database';

export async function PUT(request: NextRequest) {
  try {
    const { book_ids, status, category_id, price_adjustment } = await request.json();

    if (!book_ids || !Array.isArray(book_ids) || book_ids.length === 0) {
      return NextResponse.json({ error: 'Book IDs are required' }, { status: 400 });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (status) {
      updates.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    if (category_id) {
      updates.push(`category_id = $${paramIndex}`);
      values.push(category_id);
      paramIndex++;
    }

    if (price_adjustment && price_adjustment.value) {
      if (price_adjustment.type === 'percentage') {
        updates.push(`price = price * (1 + $${paramIndex} / 100)`);
      } else {
        updates.push(`price = price + $${paramIndex}`);
      }
      values.push(price_adjustment.value);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates specified' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);

    const placeholders = book_ids.map((_, index) => `$${paramIndex + index}`).join(',');
    values.push(...book_ids);

    const updateQuery = `
      UPDATE books 
      SET ${updates.join(', ')} 
      WHERE id IN (${placeholders})
    `;

    const result = await query(updateQuery, values);

    return NextResponse.json({
      success: true,
      updated_count: result.rowCount,
      message: `Successfully updated ${result.rowCount} books`
    });

  } catch (error) {
    console.error('Batch update error:', error);
    return NextResponse.json(
      { error: 'Failed to update books' },
      { status: 500 }
    );
  }
}