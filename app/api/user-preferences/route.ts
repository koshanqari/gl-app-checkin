import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET user preferences
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    let preferences = await prisma.userPreferences.findUnique({
      where: { username },
    });

    // If no preferences exist, return defaults (don't create in DB yet)
    if (!preferences) {
      return NextResponse.json({
        visibleColumns: [],
        selectedClient: null,
        selectedProject: null,
        selectedActivity: null,
      });
    }

    // Parse visibleColumns from JSON string
    let parsedColumns = [];
    try {
      parsedColumns = JSON.parse(preferences.visibleColumns);
    } catch (e) {
      console.error('Error parsing visibleColumns:', e);
      parsedColumns = [];
    }

    return NextResponse.json({
      visibleColumns: parsedColumns,
      selectedClient: preferences.selectedClient,
      selectedProject: preferences.selectedProject,
      selectedActivity: preferences.selectedActivity,
    });
  } catch (error: any) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch user preferences',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST/PUT user preferences
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, visibleColumns, selectedClient, selectedProject, selectedActivity } = body;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const preferences = await prisma.userPreferences.upsert({
      where: { username },
      update: {
        visibleColumns: JSON.stringify(visibleColumns || []),
        selectedClient: selectedClient || null,
        selectedProject: selectedProject || null,
        selectedActivity: selectedActivity || null,
      },
      create: {
        username,
        visibleColumns: JSON.stringify(visibleColumns || []),
        selectedClient: selectedClient || null,
        selectedProject: selectedProject || null,
        selectedActivity: selectedActivity || null,
      },
    });

    return NextResponse.json({
      visibleColumns: JSON.parse(preferences.visibleColumns),
      selectedClient: preferences.selectedClient,
      selectedProject: preferences.selectedProject,
      selectedActivity: preferences.selectedActivity,
    });
  } catch (error: any) {
    console.error('Error saving user preferences:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save user preferences',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

