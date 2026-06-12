import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DEBUG ENDPOINT - Remove in production
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('Debug users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
