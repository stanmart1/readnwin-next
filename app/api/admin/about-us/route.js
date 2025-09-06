import { sanitizeInput, sanitizeQuery, validateId, sanitizeHtml } from '@/lib/security';
import { requireAdmin, requirePermission } from '@/middleware/auth';
import logger from '@/lib/logger';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { rbacService } from "@/utils/rbac-service";
import { query } from "@/utils/database";

export async function GET() {
  try {
    await requireAdmin(request);
  } catch (error) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      "content.aboutus",
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const result = await query(
      "SELECT * FROM about_us ORDER BY sort_order, id",
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    logger.error("Error fetching about us content:", error);
    return NextResponse.json(
      { error: "Failed to fetch about us content" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      "content.aboutus",
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    
  const body = await request.json();
  const sanitizedBody = {};
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === 'string') {
      sanitizedBody[key] = sanitizeInput(value);
    } else {
      sanitizedBody[key] = value;
    }
  }
    const {
      section,
      title,
      content,
      image_url,
      sort_order = 0,
      is_active = true,
    } = sanitizedBody;

    if (!section || !title || !content) {
      return NextResponse.json(
        { error: "Section, title, and content are required" },
        { status: 400 },
      );
    }

    const result = await query(
      `INSERT INTO about_us (section, title, content, image_url, sort_order, is_active, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
       RETURNING *`,
      [
        section,
        title,
        content,
        image_url,
        sort_order,
        is_active,
        session.user.id,
      ],
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    logger.error("Error creating about us content:", error);
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Section already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create about us content" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      "content.aboutus",
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    
  const body = await request.json();
  const sanitizedBody = {};
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === 'string') {
      sanitizedBody[key] = sanitizeInput(value);
    } else {
      sanitizedBody[key] = value;
    }
  }
    const { id, section, title, content, image_url, sort_order, is_active } =
      sanitizedBody;

    if (!id) {
      return NextResponse.json(
        { error: "ID is required for updates" },
        { status: 400 },
      );
    }

    const result = await query(
      `UPDATE about_us
       SET section = COALESCE($2, section),
           title = COALESCE($3, title),
           content = COALESCE($4, content),
           image_url = COALESCE($5, image_url),
           sort_order = COALESCE($6, sort_order),
           is_active = COALESCE($7, is_active),
           updated_by = $8,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        id,
        section,
        title,
        content,
        image_url,
        sort_order,
        is_active,
        session.user.id,
      ],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "About us section not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    logger.error("Error updating about us content:", error);
    return NextResponse.json(
      { error: "Failed to update about us content" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      "content.aboutus",
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const result = await query(
      "DELETE FROM about_us WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "About us section not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "About us section deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting about us content:", error);
    return NextResponse.json(
      { error: "Failed to delete about us content" },
      { status: 500 },
    );
  }
}
