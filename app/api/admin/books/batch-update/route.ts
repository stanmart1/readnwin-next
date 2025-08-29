import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/utils/api-protection';
import { query } from '@/utils/database';
import { sanitizeInt, sanitizeHtml } from '@/utils/security';

interface BatchUpdateRequest {
  book_ids: number[];
  status?: string;
  category_id?: number;
  price_adjustment?: {
    value: number;
    type: 'percentage' | 'fixed';
  };
}

export const PUT = withPermission('books.update', async (request: NextRequest, context: any, session: any) => {
  try {
    const body: BatchUpdateRequest = await request.json();
    const { book_ids, status, category_id, price_adjustment } = body;

    // Validate book_ids
    if (!book_ids || !Array.isArray(book_ids) || book_ids.length === 0) {
      return NextResponse.json({ error: 'Book IDs are required' }, { status: 400 });
    }

    // Sanitize book IDs
    const sanitizedBookIds = book_ids.map(id => sanitizeInt(id)).filter(id => id > 0);
    if (sanitizedBookIds.length === 0) {
      return NextResponse.json({ error: 'No valid book IDs provided' }, { status: 400 });
    }

    const updates: string[] = [];
    const values: (string | number)[] = [];
    let paramIndex = 1;

    // Validate and add status update
    if (status) {
      const validStatuses = ['published', 'draft', 'archived'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
      }
      updates.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    // Validate and add category update
    if (category_id) {
      const categoryIdNum = sanitizeInt(category_id);
      if (categoryIdNum <= 0) {
        return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
      }
      updates.push(`category_id = $${paramIndex}`);
      values.push(categoryIdNum);
      paramIndex++;
    }

    // Validate and add price adjustment
    if (price_adjustment && price_adjustment.value !== undefined) {
      const adjustmentValue = parseFloat(String(price_adjustment.value));
      if (isNaN(adjustmentValue)) {
        return NextResponse.json({ error: 'Invalid price adjustment value' }, { status: 400 });
      }
      
      if (!['percentage', 'fixed'].includes(price_adjustment.type)) {
        return NextResponse.json({ error: 'Invalid price adjustment type' }, { status: 400 });
      }

      if (price_adjustment.type === 'percentage') {
        updates.push(`price = GREATEST(0, price * (1 + $${paramIndex} / 100))`);
      } else {
        updates.push(`price = GREATEST(0, price + $${paramIndex})`);
      }
      values.push(adjustmentValue);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates specified' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);

    const placeholders = sanitizedBookIds.map((_, index) => `$${paramIndex + index}`).join(',');
    values.push(...sanitizedBookIds);

    const updateQuery = `
      UPDATE books 
      SET ${updates.join(', ')} 
      WHERE id IN (${placeholders})
    `;

    const result = await query(updateQuery, values);

    return NextResponse.json({
      success: true,
      updated_count: result.rowCount,
      message: sanitizeHtml(`Successfully updated ${result.rowCount} books`)
    });

  } catch (error) {
    console.error('Batch update error:', error);
    return NextResponse.json(
      { error: 'Failed to update books' },
      { status: 500 }
    );
  }
});