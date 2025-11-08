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
        maritalStatus: body.maritalStatus || 'single',
        kidsBelow3Feet: body.kidsBelow3Feet || 0,
        membersAbove3Feet: body.membersAbove3Feet || 0,
        clientName: body.clientName,
        projectName: body.projectName,
        activityName: body.activityName,
        present: body.present || false,
      },
    });

    return NextResponse.json(checkIn, { status: 201 });
  } catch (error: any) {
    console.error('Error creating check-in:', error);
    
    // Return more specific error messages
    let errorMessage = 'Failed to create check-in. Please try again.';
    let statusCode = 500;
    
    if (error.code === 'P2002') {
      errorMessage = 'A check-in with this serial number already exists.';
      statusCode = 409;
    } else if (error.meta?.target) {
      errorMessage = `Validation error: ${error.meta.target.join(', ')} already exists.`;
      statusCode = 400;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

