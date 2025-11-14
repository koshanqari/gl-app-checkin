'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@atlaskit/button';
import TextField from '@atlaskit/textfield';
import Select from '@atlaskit/select';
import { Field } from '@atlaskit/form';
import RefreshIcon from '@atlaskit/icon/glyph/refresh';
import DownloadIcon from '@atlaskit/icon/glyph/download';
import SettingsIcon from '@atlaskit/icon/glyph/settings';
import { CustomTable } from './components/CustomTable';
import { CustomModal } from './components/CustomModal';

interface CheckIn {
  id: string;
  empId: string;
  empName: string;
  empMobileNo: string;
  department: string;
  location: string;
  maritalStatus: string;
  kidsBelow3Feet: number;
  membersAbove3Feet: number;
  additionalMembers: number;
  clientName: string | null;
  projectName: string | null;
  activityName: string | null;
  present: boolean;
  createdAt: string;
  updatedAt: string;
}

// Column configuration - all database columns
const allColumns = [
    { key: 'id', label: 'ID', isSortable: true },
    { key: 'present', label: 'Present', isSortable: false },
    { key: 'empId', label: 'Emp ID', isSortable: true },
    { key: 'empName', label: 'Name', isSortable: true },
    { key: 'empMobileNo', label: 'Mobile', isSortable: true },
    { key: 'department', label: 'Department', isSortable: true },
    { key: 'location', label: 'Location', isSortable: true },
    { key: 'maritalStatus', label: 'Marital Status', isSortable: true },
    { key: 'kidsBelow3Feet', label: 'Kids < 3ft', isSortable: true },
    { key: 'membersAbove3Feet', label: 'Members > 3ft', isSortable: true },
    { key: 'additionalMembers', label: 'Family Members', isSortable: true },
    { key: 'clientName', label: 'Client', isSortable: true },
    { key: 'projectName', label: 'Project', isSortable: true },
    { key: 'activityName', label: 'Activity', isSortable: true },
    { key: 'createdAt', label: 'Created At', isSortable: true },
    { key: 'updatedAt', label: 'Updated At', isSortable: true },
    { key: 'actions', label: 'Actions', isSortable: false },
];

export default function IntellsysPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [filteredCheckIns, setFilteredCheckIns] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Initialize with defaults - will be loaded from server
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  
  const [sortField, setSortField] = useState<keyof CheckIn>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentCheckIn, setCurrentCheckIn] = useState<Partial<CheckIn>>({});

  // Initialize with defaults - will be loaded from server
  const [visibleColumns, setVisibleColumns] = useState<string[]>(allColumns.map(col => col.key));
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);

  // Load user preferences from server
  const loadUserPreferences = async () => {
    try {
      const username = localStorage.getItem('intellsys_username');
      if (!username) {
        setPreferencesLoaded(true);
        return;
      }

      const response = await fetch(`/api/user-preferences?username=${username}`);
      if (response.ok) {
        const prefs = await response.json();
        console.log('Loaded preferences from server:', prefs);
        
        // Set visibleColumns - use all columns if empty array or undefined
        if (prefs.visibleColumns !== undefined && Array.isArray(prefs.visibleColumns) && prefs.visibleColumns.length > 0) {
          setVisibleColumns(prefs.visibleColumns);
        } else {
          // If no preferences saved yet, use all columns as default
          setVisibleColumns(allColumns.map(col => col.key));
        }
        
        // Set filter values (including null to clear them)
        setSelectedClient(prefs.selectedClient || null);
        setSelectedProject(prefs.selectedProject || null);
        setSelectedActivity(prefs.selectedActivity || null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to load preferences:', response.status, response.statusText, errorData);
        // Continue with defaults if loading fails
      }
      setPreferencesLoaded(true);
    } catch (error) {
      console.error('Error loading user preferences:', error);
      setPreferencesLoaded(true);
    }
  };

  // Save user preferences to server
  const saveUserPreferences = useCallback(async () => {
    try {
      const username = localStorage.getItem('intellsys_username');
      if (!username) {
        console.warn('No username found, cannot save preferences');
        return;
      }

      const preferencesToSave = {
        username,
        visibleColumns,
        selectedClient,
        selectedProject,
        selectedActivity,
      };
      
      console.log('Saving preferences to server:', preferencesToSave);
      
      const response = await fetch('/api/user-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferencesToSave),
      });

      if (!response.ok) {
        console.error('Failed to save preferences:', response.status, response.statusText);
      } else {
        console.log('Preferences saved successfully');
      }
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  }, [visibleColumns, selectedClient, selectedProject, selectedActivity]);

  // Handle column visibility toggle
  const handleColumnToggle = (columnKey: string) => {
    const newVisibleColumns = visibleColumns.includes(columnKey)
      ? visibleColumns.filter(key => key !== columnKey)
      : [...visibleColumns, columnKey];
    setVisibleColumns(newVisibleColumns);
    // Save will be called via useEffect
  };

  // Reset to show all columns and clear filters
  const handleResetColumns = () => {
    const allKeys = allColumns.map(col => col.key);
    setVisibleColumns(allKeys);
    setSelectedClient(null);
    setSelectedProject(null);
    setSelectedActivity(null);
    // Save will be called via useEffect
  };

  // Handle filter changes
  const handleClientChange = (value: string | null) => {
    setSelectedClient(value);
    // Save will be called via useEffect
  };

  const handleProjectChange = (value: string | null) => {
    setSelectedProject(value);
    // Save will be called via useEffect
  };

  const handleActivityChange = (value: string | null) => {
    setSelectedActivity(value);
    // Save will be called via useEffect
  };

  // Check authentication on mount
  useEffect(() => {
    const authToken = localStorage.getItem('intellsys_auth');
    if (authToken === 'authenticated') {
      setIsAuthenticated(true);
    } else {
      router.push('/intellsys/login');
    }
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCheckIns();
      loadUserPreferences();
    }
  }, [isAuthenticated]);

  // Save preferences to server when they change (only after initial load)
  useEffect(() => {
    if (isAuthenticated && preferencesLoaded) {
      const timeoutId = setTimeout(() => {
        saveUserPreferences();
      }, 500); // Debounce saves by 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, preferencesLoaded, saveUserPreferences]);

  useEffect(() => {
    filterAndSortCheckIns();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkIns, searchTerm, selectedClient, selectedProject, selectedActivity, sortField, sortOrder]);

  const fetchCheckIns = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/checkins');
      if (!response.ok) {
        console.error('Failed to fetch check-ins:', response.status, response.statusText);
        setCheckIns([]);
        setIsLoading(false);
        return;
      }
      const data = await response.json();
      // Ensure data is always an array
      if (Array.isArray(data)) {
        setCheckIns(data);
      } else {
        console.error('Invalid data format received:', data);
        setCheckIns([]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching check-ins:', error);
      setCheckIns([]);
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchCheckIns();
  };

  const filterAndSortCheckIns = () => {
    // Ensure checkIns is always an array
    if (!Array.isArray(checkIns)) {
      setFilteredCheckIns([]);
      return;
    }
    let filtered = checkIns;

    if (searchTerm) {
      filtered = filtered.filter(
        (checkIn) =>
          checkIn.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          checkIn.empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          checkIn.empMobileNo.includes(searchTerm) ||
          checkIn.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
          checkIn.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          checkIn.maritalStatus.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedClient) {
      filtered = filtered.filter(
        (checkIn) => checkIn.clientName === selectedClient
      );
    }

    if (selectedProject) {
      filtered = filtered.filter(
        (checkIn) => checkIn.projectName === selectedProject
      );
    }

    if (selectedActivity) {
      filtered = filtered.filter(
        (checkIn) => checkIn.activityName === selectedActivity
      );
    }

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    setFilteredCheckIns(filtered);
  };

  const handleSort = (field: keyof CheckIn) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setCurrentCheckIn({
      empId: '',
      empName: '',
      empMobileNo: '',
      department: '',
      location: '',
      maritalStatus: 'single',
      kidsBelow3Feet: 0,
      membersAbove3Feet: 0,
      additionalMembers: 0,
      present: false,
      clientName: '',
      projectName: '',
      activityName: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (checkIn: CheckIn) => {
    setModalMode('edit');
    setCurrentCheckIn(checkIn);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      // Validate mobile number
      if (currentCheckIn.empMobileNo && currentCheckIn.empMobileNo.length !== 10) {
        alert('Mobile Number must be exactly 10 digits');
        return;
      }

      if (modalMode === 'add') {
        await fetch('/api/checkins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentCheckIn),
        });
      } else {
        await fetch(`/api/checkins/${currentCheckIn.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentCheckIn),
        });
      }
      setIsModalOpen(false);
      fetchCheckIns();
    } catch (error) {
      console.error('Error saving check-in:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this check-in?')) {
      try {
        await fetch(`/api/checkins/${id}`, { method: 'DELETE' });
        fetchCheckIns();
      } catch (error) {
        console.error('Error deleting check-in:', error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('intellsys_auth');
    router.push('/intellsys/login');
  };

  const handleTogglePresent = async (id: string, currentPresent: boolean) => {
    try {
      await fetch(`/api/checkins/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ present: !currentPresent }),
      });
      fetchCheckIns();
    } catch (error) {
      console.error('Error updating present status:', error);
    }
  };

  const downloadCSV = () => {
    // Get CSV value for a column
    const getCSVValue = (columnKey: string, checkIn: CheckIn): string => {
      switch (columnKey) {
        case 'id':
          return checkIn.id;
        case 'empId':
          return `"${checkIn.empId}"`;
        case 'empName':
          return `"${checkIn.empName}"`;
        case 'empMobileNo':
          return `"${checkIn.empMobileNo}"`;
        case 'department':
          return `"${checkIn.department}"`;
        case 'location':
          return `"${checkIn.location}"`;
        case 'maritalStatus':
          return `"${checkIn.maritalStatus}"`;
        case 'kidsBelow3Feet':
          return String(checkIn.kidsBelow3Feet);
        case 'membersAbove3Feet':
          return String(checkIn.membersAbove3Feet);
        case 'additionalMembers':
          return String(checkIn.additionalMembers);
        case 'clientName':
          return `"${checkIn.clientName || ''}"`;
        case 'projectName':
          return `"${checkIn.projectName || ''}"`;
        case 'activityName':
          return `"${checkIn.activityName || ''}"`;
        case 'present':
          return checkIn.present ? 'Yes' : 'No';
        case 'createdAt':
          return `"${new Date(checkIn.createdAt).toLocaleString()}"`;
        case 'updatedAt':
          return `"${new Date(checkIn.updatedAt).toLocaleString()}"`;
        default:
          return '';
      }
    };

    // Filter columns to include only visible ones (excluding 'actions')
    const columnsToExport = allColumns.filter(col => 
      col.key !== 'actions' && visibleColumns.includes(col.key)
    );

    // Define CSV headers based on visible columns
    const headers = columnsToExport.map(col => col.label);

    // Convert data to CSV rows
    const csvRows = [
      headers.join(','), // Header row
      ...filteredCheckIns.map((checkIn) =>
        columnsToExport.map(col => getCSVValue(col.key, checkIn)).join(',')
      ),
    ];

    // Create CSV content
    const csvContent = csvRows.join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `checkins_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter columns based on visibleColumns
  const head = {
    cells: allColumns
      .filter(col => visibleColumns.includes(col.key))
      .map(col => ({
        key: col.key,
        content: col.label,
        isSortable: col.isSortable,
      })),
  };

  // Create cell content mapping
  const getCellContent = (columnKey: string, checkIn: CheckIn) => {
    switch (columnKey) {
      case 'id':
        return checkIn.id;
      case 'present':
        return (
          <input
            type="checkbox"
            checked={checkIn.present || false}
            onChange={() => handleTogglePresent(checkIn.id, checkIn.present || false)}
            className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
          />
        );
      case 'empId':
        return checkIn.empId;
      case 'empName':
        return checkIn.empName;
      case 'empMobileNo':
        return checkIn.empMobileNo;
      case 'department':
        return checkIn.department;
      case 'location':
        return checkIn.location;
      case 'maritalStatus':
        return checkIn.maritalStatus;
      case 'kidsBelow3Feet':
        return checkIn.kidsBelow3Feet;
      case 'membersAbove3Feet':
        return checkIn.membersAbove3Feet;
      case 'additionalMembers':
        return checkIn.additionalMembers;
      case 'clientName':
        return checkIn.clientName || '-';
      case 'projectName':
        return checkIn.projectName || '-';
      case 'activityName':
        return checkIn.activityName || '-';
      case 'createdAt':
        return new Date(checkIn.createdAt).toLocaleString();
      case 'updatedAt':
        return new Date(checkIn.updatedAt).toLocaleString();
      case 'actions':
        return (
          <div className="flex space-x-2">
            <Button
              appearance="primary"
              onClick={() => openEditModal(checkIn)}
            >
              Edit
            </Button>
            <Button
              appearance="danger"
              onClick={() => handleDelete(checkIn.id)}
            >
              Delete
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const rows = filteredCheckIns.map((checkIn) => ({
    key: `row-${checkIn.id}`,
    cells: allColumns
      .filter(col => visibleColumns.includes(col.key))
      .map(col => ({
        key: `${col.key}-${checkIn.id}`,
        content: getCellContent(col.key, checkIn),
      })),
  }));

  // Get unique values for dropdowns - ensure checkIns is an array
  const safeCheckIns = Array.isArray(checkIns) ? checkIns : [];
  const uniqueClients = Array.from(
    new Set(safeCheckIns.map((c) => c.clientName).filter((name): name is string => name !== null && name !== ''))
  ).sort();

  const uniqueProjects = Array.from(
    new Set(safeCheckIns.map((c) => c.projectName).filter((name): name is string => name !== null && name !== ''))
  ).sort();

  const uniqueActivities = Array.from(
    new Set(safeCheckIns.map((c) => c.activityName).filter((name): name is string => name !== null && name !== ''))
  ).sort();

  // Calculate dashboard statistics based on filtered data
  const totalEntries = filteredCheckIns.length;
  const entriesPresent = filteredCheckIns.filter(checkIn => checkIn.present).length;
  const totalMembers = filteredCheckIns.reduce((sum, checkIn) => sum + 1 + (checkIn.additionalMembers || 0), 0);
  const totalMembersPresent = filteredCheckIns
    .filter(checkIn => checkIn.present)
    .reduce((sum, checkIn) => sum + 1 + (checkIn.additionalMembers || 0), 0);

  // Don't render until authentication is checked
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="border-l-4 border-amber-500 pl-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Intellsys Panel
            </h1>
            <p className="text-amber-600 font-medium">Check-Ins Management</p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-amber-500 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Entries</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{totalEntries}</p>
                </div>
                <div className="bg-amber-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Entries Present</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{entriesPresent}</p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Members</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{totalMembers}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Members Present</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{totalMembersPresent}</p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                <div className="flex-1 w-full lg:w-auto">
                  <TextField
                    placeholder="Search by Employee ID, Name, Mobile, Department, or Location"
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="font-medium">Client:</span>
                  <span className="text-gray-900">{selectedClient || 'All Clients'}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="font-medium">Project:</span>
                  <span className="text-gray-900">{selectedProject || 'All Projects'}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="font-medium">Activity:</span>
                  <span className="text-gray-900">{selectedActivity || 'All Activities'}</span>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button 
                  appearance="default" 
                  onClick={handleRefresh}
                  iconBefore={<RefreshIcon label="refresh" />}
                >
                  Refresh
                </Button>
                <Button appearance="primary" onClick={openAddModal}>
                  Add New Check-In
                </Button>
                <Button 
                  appearance="default" 
                  onClick={downloadCSV}
                  iconBefore={<DownloadIcon label="download" />}
                >
                  Download CSV
                </Button>
                <Button 
                  appearance="default" 
                  onClick={() => setIsColumnSelectorOpen(true)}
                  iconBefore={<SettingsIcon label="settings" />}
                >
                  Columns
                </Button>
                <Button appearance="danger" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>

          <CustomTable
            head={head}
            rows={rows}
            isLoading={isLoading}
            emptyView={<div className="text-center py-8">No check-ins found</div>}
            onSort={(key) => handleSort(key as keyof CheckIn)}
          />
        </div>
      </div>

      <CustomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Add New Check-In' : 'Edit Check-In'}
        footer={
          <>
            <Button appearance="subtle" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button appearance="primary" onClick={handleSave}>
              {modalMode === 'add' ? 'Add' : 'Update'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {(() => {
            // Fields that should always be visible in edit mode (read-only info)
            const alwaysVisibleInEdit = ['id', 'createdAt', 'updatedAt'];
            
            // Get columns to display - filter based on visibleColumns, exclude 'actions'
            const columnsToShow = allColumns.filter(col => {
              if (col.key === 'actions') return false;
              if (modalMode === 'edit' && alwaysVisibleInEdit.includes(col.key)) return true;
              return visibleColumns.includes(col.key);
            });

            return columnsToShow.map((col) => {
              const key = col.key;
              
              // Read-only fields for edit mode
              if (modalMode === 'edit' && (key === 'id' || key === 'createdAt' || key === 'updatedAt')) {
                return (
                  <Field key={key} name={key} label={col.label}>
                  {({ fieldProps }) => (
                    <TextField
                      {...fieldProps}
                        value={
                          key === 'createdAt' || key === 'updatedAt'
                            ? currentCheckIn[key] ? new Date(currentCheckIn[key] as string).toLocaleString() : ''
                            : String(currentCheckIn[key as keyof CheckIn] || '')
                        }
                        isDisabled
                        readOnly
                    />
                  )}
                </Field>
                );
              }

              // Present checkbox
              if (key === 'present') {
                return (
                  <Field key={key} name={key} label={col.label}>
                  {({ fieldProps }) => (
                      <div className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          checked={currentCheckIn.present || false}
                          onChange={(e) =>
                        setCurrentCheckIn({
                          ...currentCheckIn,
                              present: e.target.checked,
                        })
                      }
                          className="mr-2 h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                        <span className="text-sm text-gray-700">Mark as present</span>
                      </div>
                  )}
                </Field>
                );
              }

              // Marital Status radio buttons
              if (key === 'maritalStatus') {
                return (
                  <Field key={key} name={key} label={col.label} isRequired>
                  {({ fieldProps }) => (
                      <div className="flex gap-6 mt-2">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="maritalStatus"
                            value="single"
                            checked={currentCheckIn.maritalStatus === 'single'}
                            onChange={(e) =>
                        setCurrentCheckIn({
                          ...currentCheckIn,
                                maritalStatus: e.target.value,
                              })
                            }
                            className="mr-2 h-4 w-4 text-amber-600 focus:ring-amber-500"
                          />
                          <span className="text-gray-700">Single</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="maritalStatus"
                            value="married"
                            checked={currentCheckIn.maritalStatus === 'married'}
                            onChange={(e) =>
                        setCurrentCheckIn({
                          ...currentCheckIn,
                                maritalStatus: e.target.value,
                        })
                      }
                            className="mr-2 h-4 w-4 text-amber-600 focus:ring-amber-500"
                    />
                          <span className="text-gray-700">Married</span>
                        </label>
                      </div>
                  )}
                </Field>
                );
              }

              // Number fields
              if (key === 'kidsBelow3Feet' || key === 'membersAbove3Feet' || key === 'additionalMembers') {
                return (
                  <Field key={key} name={key} label={col.label}>
                  {({ fieldProps }) => (
                    <TextField
                      {...fieldProps}
                      type="number"
                        value={String(currentCheckIn[key as keyof CheckIn] || 0)}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCurrentCheckIn({
                          ...currentCheckIn,
                            [key]: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  )}
                </Field>
                );
              }

              // Mobile number field (special handling)
              if (key === 'empMobileNo') {
                return (
                  <Field key={key} name={key} label={col.label} isRequired>
                  {({ fieldProps }) => (
                    <TextField
                      {...fieldProps}
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      value={currentCheckIn.empMobileNo || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = e.target.value;
                        // Only allow numbers and limit to 10 digits
                        const numericValue = value.replace(/\D/g, '').slice(0, 10);
                        setCurrentCheckIn({
                          ...currentCheckIn,
                          empMobileNo: numericValue,
                        });
                      }}
                      placeholder="Enter 10-digit Mobile Number"
                    />
                  )}
                </Field>
                );
              }

              // Required text fields
              if (key === 'empId' || key === 'empName' || key === 'department' || key === 'location') {
                return (
                  <Field key={key} name={key} label={col.label} isRequired>
                  {({ fieldProps }) => (
                    <TextField
                      {...fieldProps}
                        value={String(currentCheckIn[key as keyof CheckIn] || '')}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCurrentCheckIn({
                          ...currentCheckIn,
                            [key]: e.target.value,
                        })
                      }
                    />
                  )}
                </Field>
                );
              }

              // Optional text fields
              if (key === 'clientName' || key === 'projectName' || key === 'activityName') {
                return (
                  <Field key={key} name={key} label={col.label}>
                  {({ fieldProps }) => (
                    <TextField
                      {...fieldProps}
                        value={String(currentCheckIn[key as keyof CheckIn] || '')}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCurrentCheckIn({
                          ...currentCheckIn,
                            [key]: e.target.value,
                        })
                      }
                    />
                  )}
                </Field>
                );
              }

              return null;
            });
          })()}
        </div>
      </CustomModal>

      {/* Column Selector Modal */}
      <CustomModal
        isOpen={isColumnSelectorOpen}
        onClose={() => setIsColumnSelectorOpen(false)}
        title="Column & Filter Settings"
        footer={
          <>
            <Button appearance="subtle" onClick={handleResetColumns}>
              Reset All
            </Button>
            <Button appearance="primary" onClick={() => setIsColumnSelectorOpen(false)}>
              Save & Apply
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Column Selection */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Columns to Display</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {allColumns.map((column) => (
                <label
                  key={column.key}
                  className="flex items-center p-3 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(column.key)}
                    onChange={() => handleColumnToggle(column.key)}
                    className="mr-3 h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{column.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {visibleColumns.length} of {allColumns.length} columns selected
            </p>
          </div>

          {/* Filter Selection */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Default Filters</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Client Filter
                </label>
                <Select
                  placeholder="Select default client (optional)"
                  options={[
                    { label: 'None (Show All)', value: null },
                    ...uniqueClients.map((client) => ({ label: client, value: client })),
                  ]}
                  value={selectedClient ? { label: selectedClient, value: selectedClient } : { label: 'None (Show All)', value: null }}
                  onChange={(option) => handleClientChange(option?.value || null)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Project Filter
                </label>
                <Select
                  placeholder="Select default project (optional)"
                  options={[
                    { label: 'None (Show All)', value: null },
                    ...uniqueProjects.map((project) => ({ label: project, value: project })),
                  ]}
                  value={selectedProject ? { label: selectedProject, value: selectedProject } : { label: 'None (Show All)', value: null }}
                  onChange={(option) => handleProjectChange(option?.value || null)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Activity Filter
                </label>
                <Select
                  placeholder="Select default activity (optional)"
                  options={[
                    { label: 'None (Show All)', value: null },
                    ...uniqueActivities.map((activity) => ({ label: activity, value: activity })),
                  ]}
                  value={selectedActivity ? { label: selectedActivity, value: selectedActivity } : { label: 'None (Show All)', value: null }}
                  onChange={(option) => handleActivityChange(option?.value || null)}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              These filters will be applied automatically when you open the panel. Your preferences will be saved.
            </p>
          </div>
              </div>
      </CustomModal>
    </div>
  );
}

