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
    maritalStatus: 'single' as 'single' | 'married',
    kidsBelow3Feet: 0,
    membersAbove3Feet: 0,
    additionalMembers: 0,
    clientName: searchParams.get('client') || '',
    projectName: searchParams.get('project') || '',
    activityName: searchParams.get('activity') || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and limit to 10 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 10);
    handleInputChange('empMobileNo', numericValue);
  };

  const incrementCounter = (field: 'kidsBelow3Feet' | 'membersAbove3Feet' | 'additionalMembers') => {
    setFormData((prev) => ({ ...prev, [field]: prev[field] + 1 }));
  };

  const decrementCounter = (field: 'kidsBelow3Feet' | 'membersAbove3Feet' | 'additionalMembers') => {
    setFormData((prev) => ({
      ...prev,
      [field]: Math.max(0, prev[field] - 1),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.empId.trim()) {
      setSubmitMessage('Please enter Employee Code');
      return;
    }
    if (!formData.empName.trim()) {
      setSubmitMessage('Please enter Employee Name');
      return;
    }
    if (!formData.empMobileNo.trim()) {
      setSubmitMessage('Please enter Mobile Number');
      return;
    }
    if (formData.empMobileNo.length !== 10) {
      setSubmitMessage('Mobile Number must be exactly 10 digits');
      return;
    }
    
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
        setIsSubmitted(true);
        setSubmitMessage('Check-In done');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setSubmitMessage(errorData.error || 'Failed to submit check-in. Please try again.');
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
            <div className="mb-4 flex flex-col items-center gap-4">
              <img 
                src="https://iba-consulting-prod.b-cdn.net/footer/GoldenLotus%20Logos/tatatele.png" 
                alt="Tata Tele Logo" 
                className="h-16 w-auto object-contain"
              />
              <img 
                src="https://iba-consulting-prod.b-cdn.net/footer/GoldenLotus%20Logos/onetribe.png" 
                alt="Golden Lotus Logo" 
                className="h-20 w-auto object-contain"
              />
            </div>
            <h2 className="text-2xl font-semibold text-amber-600">
              Employee Check-In
            </h2>
          </div>

          {isSubmitted ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <svg
                    className="h-8 w-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-green-600 mb-2">
                  Check-In done
                </h3>
                <p className="text-gray-600">
                  Your check-in has been submitted successfully.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field name="empId" label="Employee Code" isRequired>
                {({ fieldProps }) => (
                  <TextField
                    {...fieldProps}
                    value={formData.empId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('empId', e.target.value)}
                    placeholder="Enter Employee Code"
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
                    maxLength={10}
                    value={formData.empMobileNo}
                    onChange={handleMobileChange}
                    placeholder="Enter 10-digit Mobile Number"
                  />
                )}
              </Field>

              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Additional Family Members
                </label>
                <div className="flex items-center justify-center md:justify-start space-x-4">
                  <Button
                    appearance="default"
                    onClick={() => decrementCounter('additionalMembers')}
                    type="button"
                  >
                    -
                  </Button>
                  <span className="text-2xl font-semibold w-16 text-center text-gray-900">
                    {formData.additionalMembers}
                  </span>
                  <Button
                    appearance="default"
                    onClick={() => incrementCounter('additionalMembers')}
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

            {submitMessage && !isSubmitted && (
              <div className="mt-4 p-4 rounded-md bg-red-50 text-red-800">
                {submitMessage}
              </div>
            )}
          </form>
          )}
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
