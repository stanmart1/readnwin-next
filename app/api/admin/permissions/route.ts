import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rbacService } from "@/utils/rbac-service";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get permissions
    const permissions = await rbacService.getPermissions();

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      "permissions.list",
      "permissions",
      undefined,
      undefined,
      request.headers.get("x-forwarded-for") || request.ip || undefined,
      request.headers.get("user-agent") || undefined,
    );

    return NextResponse.json({
      success: true,
      permissions,
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get request body
    const body = await request.json();
    const { name, display_name, description, resource, action, scope } = body;

    // Validate required fields
    if (!name || !display_name || !resource || !action) {
      return NextResponse.json(
        { error: "Name, display name, resource, and action are required" },
        { status: 400 },
      );
    }

    // Create permission
    const permission = await rbacService.createPermission({
      name,
      display_name,
      description,
      resource,
      action,
      scope: scope || "global",
    });

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      "permissions.create",
      "permissions",
      permission.id,
      { name, display_name, resource, action, scope },
      request.headers.get("x-forwarded-for") || request.ip || undefined,
      request.headers.get("user-agent") || undefined,
    );

    return NextResponse.json({
      success: true,
      permission,
      message: "Permission created successfully",
    });
  } catch (error) {
    console.error("Error creating permission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
