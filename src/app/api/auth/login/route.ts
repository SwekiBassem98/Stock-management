import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find user in database (exact match for SQLite)
    const user = await prisma.user.findUnique({
      where: { 
        username: username.trim()
      },
      select: {
        id: true,
        username: true,
        password: true,
        role: true,
        email: true,
        fullName: true,
        isActive: true,
      }
    });

    console.log('Login attempt:', { username: username.trim(), foundUser: !!user, isActive: user?.isActive });

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 401 }
      );
    }

    // Check password
    if (user.password !== password) {
      console.log('Password mismatch:', { provided: password, stored: user.password });
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Return user data without password
    const { password: _, ...safeUser } = user;
    
    return NextResponse.json({
      success: true,
      user: {
        ...safeUser,
        role: safeUser.role.toLowerCase() // Convert to lowercase for compatibility
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
