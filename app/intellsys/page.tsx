'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@atlaskit/button';
import TextField from '@atlaskit/textfield';
import { Field } from '@atlaskit/form';
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
  }, [checkIns, searchTerm, sortField, sortOrder]);

  const fetchCheckIns = async () => {
    try {
      const response = await fetch('/api/checkins');
      const data = await response.json();
      setCheckIns(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching check-ins:', error);
      setIsLoading(false);
    }
  };

  const filterAndSortCheckIns = () => {
    let filtered = checkIns;

    if (searchTerm) {
      filtered = checkIns.filter(
        (checkIn) =>
          checkIn.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          checkIn.empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          checkIn.empMobileNo.includes(searchTerm) ||
          checkIn.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
          checkIn.location.toLowerCase().includes(searchTerm.toLowerCase())
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
      { key: checkIn.srNo, content: checkIn.srNo },
      { key: checkIn.empId, content: checkIn.empId },
      { key: checkIn.empName, content: checkIn.empName },
      { key: checkIn.empMobileNo, content: checkIn.empMobileNo },
      { key: checkIn.department, content: checkIn.department },
      { key: checkIn.location, content: checkIn.location },
      { key: checkIn.kidsBelow3Feet, content: checkIn.kidsBelow3Feet },
      { key: checkIn.membersAbove3Feet, content: checkIn.membersAbove3Feet },
      { key: `client-${checkIn.id}`, content: checkIn.clientName || '-' },
      { key: `project-${checkIn.id}`, content: checkIn.projectName || '-' },
      { key: `activity-${checkIn.id}`, content: checkIn.activityName || '-' },
      {
        key: 'actions',
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

  // Don't render until authentication is checked
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <div className="border-l-4 border-amber-500 pl-4 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Intellsys Panel
              </h1>
              <p className="text-amber-600 font-medium">Check-Ins Management</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="w-full md:w-96">
                <TextField
                  placeholder="Search by Employee ID, Name, Mobile, Department, or Location"
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button appearance="primary" onClick={openAddModal}>
                  Add New Check-In
                </Button>
                <Button appearance="default" onClick={downloadCSV}>
                  ⬇ Download CSV
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
                      value={currentCheckIn.empMobileNo || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCurrentCheckIn({
                          ...currentCheckIn,
                          empMobileNo: e.target.value,
                        })
                      }
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

