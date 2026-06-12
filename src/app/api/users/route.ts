import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users - Get all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: { id: true, username: true, fullName: true }
        }
      }
    });

    // Don't return passwords
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });

    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, role, email, fullName, createdBy } = body;

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password, // In production, hash this password
        role: role || 'CONSULTANT',
        email,
        fullName,
        createdBy
      },
      include: {
        creator: {
          select: { id: true, username: true, fullName: true }
        }
      }
    });

    // Don't return password
    const { password: _, ...safeUser } = user;
    return NextResponse.json(safeUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
