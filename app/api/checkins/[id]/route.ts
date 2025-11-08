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

    // If only present field is being updated, do a partial update
    const updateData: any = {};
    if (body.present !== undefined) {
      updateData.present = body.present;
    }
    if (body.empId !== undefined) updateData.empId = body.empId;
    if (body.empName !== undefined) updateData.empName = body.empName;
    if (body.empMobileNo !== undefined) updateData.empMobileNo = body.empMobileNo;
    if (body.department !== undefined) updateData.department = body.department;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.maritalStatus !== undefined) updateData.maritalStatus = body.maritalStatus;
    if (body.kidsBelow3Feet !== undefined) updateData.kidsBelow3Feet = body.kidsBelow3Feet;
    if (body.membersAbove3Feet !== undefined) updateData.membersAbove3Feet = body.membersAbove3Feet;
    if (body.clientName !== undefined) updateData.clientName = body.clientName;
    if (body.projectName !== undefined) updateData.projectName = body.projectName;
    if (body.activityName !== undefined) updateData.activityName = body.activityName;

    const checkIn = await prisma.checkIn.update({
      where: { id: parseInt(id) },
      data: updateData,
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

