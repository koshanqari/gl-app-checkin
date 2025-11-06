import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all check-ins with optional search, filter, and sort
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const checkIns = await prisma.checkIn.findMany({
      where: search
        ? {
            OR: [
              { empId: { contains: search, mode: 'insensitive' } },
              { empName: { contains: search, mode: 'insensitive' } },
              { empMobileNo: { contains: search, mode: 'insensitive' } },
              { department: { contains: search, mode: 'insensitive' } },
              { location: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      orderBy: {
        [sortField]: sortOrder,
      },
    });

    return NextResponse.json(checkIns);
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch check-ins' },
      { status: 500 }
    );
  }
}

// POST a new check-in
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const checkIn = await prisma.checkIn.create({
      data: {
        empId: body.empId,
        empName: body.empName,
        empMobileNo: body.empMobileNo,
        department: body.department,
        location: body.location,
        kidsBelow3Feet: body.kidsBelow3Feet || 0,
        membersAbove3Feet: body.membersAbove3Feet || 0,
        clientName: body.clientName,
        projectName: body.projectName,
        activityName: body.activityName,
      },
    });

    return NextResponse.json(checkIn, { status: 201 });
  } catch (error) {
    console.error('Error creating check-in:', error);
    return NextResponse.json(
      { error: 'Failed to create check-in' },
      { status: 500 }
    );
  }
}

