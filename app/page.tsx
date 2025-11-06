'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Button from '@atlaskit/button';
import TextField from '@atlaskit/textfield';
import { Field } from '@atlaskit/form';

function HomeContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  
  const [formData, setFormData] = useState({
    empId: '',
    empName: '',
    empMobileNo: '',
    department: '',
    location: '',
    kidsBelow3Feet: 0,
    membersAbove3Feet: 0,
    clientName: searchParams.get('client') || '',
    projectName: searchParams.get('project') || '',
    activityName: searchParams.get('activity') || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    const numericValue = value.replace(/\D/g, '');
    handleInputChange('empMobileNo', numericValue);
  };

  const incrementCounter = (field: 'kidsBelow3Feet' | 'membersAbove3Feet') => {
    setFormData((prev) => ({ ...prev, [field]: prev[field] + 1 }));
  };

  const decrementCounter = (field: 'kidsBelow3Feet' | 'membersAbove3Feet') => {
    setFormData((prev) => ({
      ...prev,
      [field]: Math.max(0, prev[field] - 1),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/checkins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitMessage('Check-in submitted successfully!');
        // Reset form
        setFormData({
          empId: '',
          empName: '',
          empMobileNo: '',
          department: '',
          location: '',
          kidsBelow3Feet: 0,
          membersAbove3Feet: 0,
          clientName: searchParams.get('client') || '',
          projectName: searchParams.get('project') || '',
          activityName: searchParams.get('activity') || '',
        });
      } else {
        setSubmitMessage('Failed to submit check-in. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting check-in:', error);
      setSubmitMessage('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Golden Lotus
            </h1>
            <h2 className="text-2xl font-semibold text-amber-600">
              Employee Check-In
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field name="empId" label="Employee ID" isRequired>
                {({ fieldProps }) => (
                  <TextField
                    {...fieldProps}
                    value={formData.empId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('empId', e.target.value)}
                    placeholder="Enter Employee ID"
                  />
                )}
              </Field>

              <Field name="empName" label="Employee Name" isRequired>
                {({ fieldProps }) => (
                  <TextField
                    {...fieldProps}
                    value={formData.empName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('empName', e.target.value)}
                    placeholder="Enter Full Name"
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
                    value={formData.empMobileNo}
                    onChange={handleMobileChange}
                    placeholder="Enter Mobile Number"
                  />
                )}
              </Field>

              <Field name="department" label="Department" isRequired>
                {({ fieldProps }) => (
                  <TextField
                    {...fieldProps}
                    value={formData.department}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange('department', e.target.value)
                    }
                    placeholder="Enter Department"
                  />
                )}
              </Field>

              <Field name="location" label="Location" isRequired>
                {({ fieldProps }) => (
                  <TextField
                    {...fieldProps}
                    value={formData.location}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('location', e.target.value)}
                    placeholder="Enter Location"
                  />
                )}
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  No. of Kids Below 3 Feet Height
                </label>
                <div className="flex items-center justify-center md:justify-start space-x-4">
                  <Button
                    appearance="default"
                    onClick={() => decrementCounter('kidsBelow3Feet')}
                    type="button"
                  >
                    -
                  </Button>
                  <span className="text-2xl font-semibold w-16 text-center text-gray-900">
                    {formData.kidsBelow3Feet}
                  </span>
                  <Button
                    appearance="default"
                    onClick={() => incrementCounter('kidsBelow3Feet')}
                    type="button"
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  No. of Members Above 3 Feet Height
                </label>
                <div className="flex items-center justify-center md:justify-start space-x-4">
                  <Button
                    appearance="default"
                    onClick={() => decrementCounter('membersAbove3Feet')}
                    type="button"
                  >
                    -
                  </Button>
                  <span className="text-2xl font-semibold w-16 text-center text-gray-900">
                    {formData.membersAbove3Feet}
                  </span>
                  <Button
                    appearance="default"
                    onClick={() => incrementCounter('membersAbove3Feet')}
                    type="button"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-center">
              <Button
                appearance="primary"
                type="submit"
                isDisabled={isSubmitting}
                className="w-full md:w-auto md:px-12"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Check-In'}
              </Button>
            </div>

            {submitMessage && (
              <div
                className={`mt-4 p-4 rounded-md ${
                  submitMessage.includes('success')
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {submitMessage}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
