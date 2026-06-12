import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, username: true, fullName: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Don't return password
    const { password, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    const body = await request.json();
    const { username, password, role, email, fullName, isActive } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if username is taken by another user
    if (username && username !== existingUser.username) {
      const userWithUsername = await prisma.user.findUnique({
        where: { username }
      });

      if (userWithUsername) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (username) updateData.username = username;
    if (password) updateData.password = password; // In production, hash this
    if (role) updateData.role = role;
    if (email !== undefined) updateData.email = email;
    if (fullName !== undefined) updateData.fullName = fullName;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: { id: true, username: true, fullName: true }
        }
      }
    });

    // Don't return password
    const { password: _, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Don't allow deleting admin users (optional safety check)
    if (existingUser.role === 'ADMIN') {
      return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 400 });
    }

    // Delete user
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
