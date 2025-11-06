import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET a single check-in by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const checkIn = await prisma.checkIn.findUnique({
      where: { id: parseInt(id) },
    });

    if (!checkIn) {
      return NextResponse.json(
        { error: 'Check-in not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(checkIn);
  } catch (error) {
    console.error('Error fetching check-in:', error);
    return NextResponse.json(
      { error: 'Failed to fetch check-in' },
      { status: 500 }
    );
  }
}

// PUT (update) a check-in by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const checkIn = await prisma.checkIn.update({
      where: { id: parseInt(id) },
      data: {
        empId: body.empId,
        empName: body.empName,
        empMobileNo: body.empMobileNo,
        department: body.department,
        location: body.location,
        kidsBelow3Feet: body.kidsBelow3Feet,
        membersAbove3Feet: body.membersAbove3Feet,
        clientName: body.clientName,
        projectName: body.projectName,
        activityName: body.activityName,
      },
    });

    return NextResponse.json(checkIn);
  } catch (error) {
    console.error('Error updating check-in:', error);
    return NextResponse.json(
      { error: 'Failed to update check-in' },
      { status: 500 }
    );
  }
}

// DELETE a check-in by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.checkIn.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Check-in deleted successfully' });
  } catch (error) {
    console.error('Error deleting check-in:', error);
    return NextResponse.json(
      { error: 'Failed to delete check-in' },
      { status: 500 }
    );
  }
}

