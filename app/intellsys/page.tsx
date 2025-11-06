'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@atlaskit/button';
import TextField from '@atlaskit/textfield';
import Select from '@atlaskit/select';
import { Field } from '@atlaskit/form';
import RefreshIcon from '@atlaskit/icon/glyph/refresh';
import DownloadIcon from '@atlaskit/icon/glyph/download';
import { CustomTable } from './components/CustomTable';
import { CustomModal } from './components/CustomModal';

interface CheckIn {
  id: number;
  srNo: number;
  empId: string;
  empName: string;
  empMobileNo: string;
  department: string;
  location: string;
  kidsBelow3Feet: number;
  membersAbove3Feet: number;
  clientName: string | null;
  projectName: string | null;
  activityName: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function IntellsysPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [filteredCheckIns, setFilteredCheckIns] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof CheckIn>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentCheckIn, setCurrentCheckIn] = useState<Partial<CheckIn>>({});

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
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterAndSortCheckIns();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkIns, searchTerm, selectedClient, selectedProject, selectedActivity, sortField, sortOrder]);

  const fetchCheckIns = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/checkins');
      const data = await response.json();
      setCheckIns(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching check-ins:', error);
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchCheckIns();
  };

  const filterAndSortCheckIns = () => {
    let filtered = checkIns;

    if (searchTerm) {
      filtered = filtered.filter(
        (checkIn) =>
          checkIn.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          checkIn.empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          checkIn.empMobileNo.includes(searchTerm) ||
          checkIn.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
          checkIn.location.toLowerCase().includes(searchTerm.toLowerCase())
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
      kidsBelow3Feet: 0,
      membersAbove3Feet: 0,
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

  const handleDelete = async (id: number) => {
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

  const downloadCSV = () => {
    // Define CSV headers
    const headers = [
      'Sr. No',
      'Emp ID',
      'Emp Name',
      'Emp Mobile No',
      'Department',
      'Location',
      'Kids Below 3 Feet',
      'Members Above 3 Feet',
      'Client Name',
      'Project Name',
      'Activity Name',
      'Created At',
    ];

    // Convert data to CSV rows
    const csvRows = [
      headers.join(','), // Header row
      ...filteredCheckIns.map((checkIn) =>
        [
          checkIn.srNo,
          `"${checkIn.empId}"`,
          `"${checkIn.empName}"`,
          `"${checkIn.empMobileNo}"`,
          `"${checkIn.department}"`,
          `"${checkIn.location}"`,
          checkIn.kidsBelow3Feet,
          checkIn.membersAbove3Feet,
          `"${checkIn.clientName || ''}"`,
          `"${checkIn.projectName || ''}"`,
          `"${checkIn.activityName || ''}"`,
          `"${new Date(checkIn.createdAt).toLocaleString()}"`,
        ].join(',')
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

  const head = {
    cells: [
      { key: 'srNo', content: 'Sr. No', isSortable: true },
      { key: 'empId', content: 'Emp ID', isSortable: true },
      { key: 'empName', content: 'Name', isSortable: true },
      { key: 'empMobileNo', content: 'Mobile', isSortable: true },
      { key: 'department', content: 'Department', isSortable: true },
      { key: 'location', content: 'Location', isSortable: true },
      { key: 'kidsBelow3Feet', content: 'Kids < 3ft', isSortable: true },
      { key: 'membersAbove3Feet', content: 'Members > 3ft', isSortable: true },
      { key: 'clientName', content: 'Client', isSortable: true },
      { key: 'projectName', content: 'Project', isSortable: true },
      { key: 'activityName', content: 'Activity', isSortable: true },
      { key: 'actions', content: 'Actions', isSortable: false },
    ],
  };

  const rows = filteredCheckIns.map((checkIn) => ({
    key: `row-${checkIn.id}`,
    cells: [
      { key: `srNo-${checkIn.id}`, content: checkIn.srNo },
      { key: `empId-${checkIn.id}`, content: checkIn.empId },
      { key: `empName-${checkIn.id}`, content: checkIn.empName },
      { key: `empMobileNo-${checkIn.id}`, content: checkIn.empMobileNo },
      { key: `department-${checkIn.id}`, content: checkIn.department },
      { key: `location-${checkIn.id}`, content: checkIn.location },
      { key: `kidsBelow3Feet-${checkIn.id}`, content: checkIn.kidsBelow3Feet },
      { key: `membersAbove3Feet-${checkIn.id}`, content: checkIn.membersAbove3Feet },
      { key: `client-${checkIn.id}`, content: checkIn.clientName || '-' },
      { key: `project-${checkIn.id}`, content: checkIn.projectName || '-' },
      { key: `activity-${checkIn.id}`, content: checkIn.activityName || '-' },
      {
        key: `actions-${checkIn.id}`,
        content: (
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
        ),
      },
    ],
  }));

  // Get unique values for dropdowns
  const uniqueClients = Array.from(
    new Set(checkIns.map((c) => c.clientName).filter((name): name is string => name !== null && name !== ''))
  ).sort();

  const uniqueProjects = Array.from(
    new Set(checkIns.map((c) => c.projectName).filter((name): name is string => name !== null && name !== ''))
  ).sort();

  const uniqueActivities = Array.from(
    new Set(checkIns.map((c) => c.activityName).filter((name): name is string => name !== null && name !== ''))
  ).sort();

  // Calculate dashboard statistics based on filtered data
  const totalEntries = filteredCheckIns.length;
  const totalMembersAbove3Feet = filteredCheckIns.reduce((sum, checkIn) => sum + checkIn.membersAbove3Feet, 0);
  const totalKidsBelow3Feet = filteredCheckIns.reduce((sum, checkIn) => sum + checkIn.kidsBelow3Feet, 0);

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-amber-500 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Entries</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{totalEntries}</p>
                </div>
                <div className="bg-amber-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Members Above 3ft</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{totalMembersAbove3Feet}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Kids Below 3ft</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{totalKidsBelow3Feet}</p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
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
                
                <div className="w-full lg:w-48">
                  <Select
                    placeholder="Filter by Client"
                    options={[
                      { label: 'All Clients', value: null },
                      ...uniqueClients.map((client) => ({ label: client, value: client })),
                    ]}
                    value={selectedClient ? { label: selectedClient, value: selectedClient } : { label: 'All Clients', value: null }}
                    onChange={(option) => setSelectedClient(option?.value || null)}
                  />
                </div>

                <div className="w-full lg:w-48">
                  <Select
                    placeholder="Filter by Project"
                    options={[
                      { label: 'All Projects', value: null },
                      ...uniqueProjects.map((project) => ({ label: project, value: project })),
                    ]}
                    value={selectedProject ? { label: selectedProject, value: selectedProject } : { label: 'All Projects', value: null }}
                    onChange={(option) => setSelectedProject(option?.value || null)}
                  />
                </div>

                <div className="w-full lg:w-48">
                  <Select
                    placeholder="Filter by Activity"
                    options={[
                      { label: 'All Activities', value: null },
                      ...uniqueActivities.map((activity) => ({ label: activity, value: activity })),
                    ]}
                    value={selectedActivity ? { label: selectedActivity, value: selectedActivity } : { label: 'All Activities', value: null }}
                    onChange={(option) => setSelectedActivity(option?.value || null)}
                  />
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
                <Field name="empId" label="Employee ID" isRequired>
                  {({ fieldProps }) => (
                    <TextField
                      {...fieldProps}
                      value={currentCheckIn.empId || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCurrentCheckIn({
                          ...currentCheckIn,
                          empId: e.target.value,
                        })
                      }
                    />
                  )}
                </Field>

                <Field name="empName" label="Employee Name" isRequired>
                  {({ fieldProps }) => (
                    <TextField
                      {...fieldProps}
                      value={currentCheckIn.empName || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCurrentCheckIn({
                          ...currentCheckIn,
                          empName: e.target.value,
                        })
                      }
                    />
                  )}
                </Field>

                <Field name="empMobileNo" label="Mobile Number" isRequired>
                  {({ fieldProps }) => (
                    <TextField
                      {...fieldProps}
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={currentCheckIn.empMobileNo || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = e.target.value;
                        // Only allow numbers
                        const numericValue = value.replace(/\D/g, '');
                        setCurrentCheckIn({
                          ...currentCheckIn,
                          empMobileNo: numericValue,
                        });
                      }}
                    />
                  )}
                </Field>

                <Field name="department" label="Department" isRequired>
                  {({ fieldProps }) => (
                    <TextField
                      {...fieldProps}
                      value={currentCheckIn.department || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCurrentCheckIn({
                          ...currentCheckIn,
                          department: e.target.value,
                        })
                      }
                    />
                  )}
                </Field>

                <Field name="location" label="Location" isRequired>
                  {({ fieldProps }) => (
                    <TextField
                      {...fieldProps}
                      value={currentCheckIn.location || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCurrentCheckIn({
                          ...currentCheckIn,
                          location: e.target.value,
                        })
                      }
                    />
                  )}
                </Field>

                <Field name="kidsBelow3Feet" label="Kids Below 3 Feet">
                  {({ fieldProps }) => (
                    <TextField
                      {...fieldProps}
                      type="number"
                      value={String(currentCheckIn.kidsBelow3Feet || 0)}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCurrentCheckIn({
                          ...currentCheckIn,
                          kidsBelow3Feet: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  )}
                </Field>

                <Field name="membersAbove3Feet" label="Members Above 3 Feet">
                  {({ fieldProps }) => (
                    <TextField
                      {...fieldProps}
                      type="number"
                      value={String(currentCheckIn.membersAbove3Feet || 0)}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCurrentCheckIn({
                          ...currentCheckIn,
                          membersAbove3Feet: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  )}
                </Field>

                <Field name="clientName" label="Client Name">
                  {({ fieldProps }) => (
                    <TextField
                      {...fieldProps}
                      value={currentCheckIn.clientName || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCurrentCheckIn({
                          ...currentCheckIn,
                          clientName: e.target.value,
                        })
                      }
                    />
                  )}
                </Field>

                <Field name="projectName" label="Project Name">
                  {({ fieldProps }) => (
                    <TextField
                      {...fieldProps}
                      value={currentCheckIn.projectName || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCurrentCheckIn({
                          ...currentCheckIn,
                          projectName: e.target.value,
                        })
                      }
                    />
                  )}
                </Field>

                <Field name="activityName" label="Activity Name">
                  {({ fieldProps }) => (
                    <TextField
                      {...fieldProps}
                      value={currentCheckIn.activityName || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCurrentCheckIn({
                          ...currentCheckIn,
                          activityName: e.target.value,
                        })
                      }
                    />
                  )}
                </Field>
              </div>
      </CustomModal>
    </div>
  );
}

