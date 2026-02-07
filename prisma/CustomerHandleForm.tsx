'use client';

import { useState } from 'react';
import { CustomerData } from '@/app/actions/customer-actions';

interface CustomerHandleFormProps {
  userEmail: string;
  userName: string;
  onSubmit: (data: CustomerData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function CustomerHandleForm({ userEmail, userName, onSubmit, onCancel, isLoading }: CustomerHandleFormProps) {
  const [formData, setFormData] = useState<Partial<CustomerData>>({
    email: userEmail,
    name: {
      firstName: userName.split(' ')[0] || '',
      lastName: userName.split(' ').slice(1).join(' ') || '',
    },
    address: {},
    phone: {},
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [section, field] = name.split('.');

    if (field) {
      setFormData(prev => ({
        ...prev,
        [section]: { ...(prev as any)[section], [field]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as CustomerData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 w-full max-w-md text-white">
        <h2 className="text-xl font-bold mb-4">Complete Your Contact Information</h2>
        <p className="text-sm text-slate-400 mb-6">To register a domain, ICANN requires valid contact information. This is only required once.</p>
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <input name="name.firstName" value={formData.name?.firstName} onChange={handleChange} placeholder="First Name" required className="input-style" />
            <input name="name.lastName" value={formData.name?.lastName} onChange={handleChange} placeholder="Last Name" required className="input-style" />
          </div>
          <input name="address.street" onChange={handleChange} placeholder="Street" required className="input-style" />
          <div className="grid grid-cols-3 gap-4">
            <input name="address.number" onChange={handleChange} placeholder="Number" required className="input-style" />
            <input name="address.zipcode" onChange={handleChange} placeholder="Zip Code" required className="input-style col-span-2" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input name="address.city" onChange={handleChange} placeholder="City" required className="input-style" />
            <input name="address.country" onChange={handleChange} placeholder="Country (2-letter code)" required maxLength={2} className="input-style" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <input name="phone.countryCode" onChange={handleChange} placeholder="Country Code (+1)" required className="input-style" />
            <input name="phone.areaCode" onChange={handleChange} placeholder="Area Code" required className="input-style" />
            <input name="phone.subscriberNumber" onChange={handleChange} placeholder="Number" required className="input-style" />
          </div>
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required className="input-style" />
          
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-slate-300 hover:bg-slate-700">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-500">
              {isLoading ? 'Saving...' : 'Save and Continue'}
            </button>
          </div>
        </form>
      </div>
      <style jsx>{`
        .input-style {
          background-color: #1e293b; /* slate-800 */
          border: 1px solid #334155; /* slate-700 */
          padding: 0.5rem 0.75rem;
          border-radius: 0.375rem;
          width: 100%;
        }
        .input-style:focus {
          outline: none;
          border-color: #3b82f6; /* blue-500 */
          box-shadow: 0 0 0 2px #3b82f6;
        }
      `}</style>
    </div>
  );
}