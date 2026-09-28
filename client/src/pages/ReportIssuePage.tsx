import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, Upload, MapPin } from 'lucide-react';

export default function ReportIssuePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: 'Missed Collection',
    description: '',
    location: ''
  });

  const submitComplaint = useMutation({
    mutationFn: (data: any) => fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    onSuccess: () => {
      alert("Issue reported successfully!");
      navigate('/dashboard/complaints');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitComplaint.mutate(formData);
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Report an Issue</h2>
          <p className="text-gray-600 mt-1">Help us keep the city clean by reporting waste management issues.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
            <select 
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            >
              <option value="Missed Collection">Missed Collection</option>
              <option value="Overflowing Collection Point">Overflowing Collection Point</option>
              <option value="Damaged Bin">Damaged Bin</option>
              <option value="Illegal Dumping">Illegal Dumping</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location / Collection Point</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                required
                placeholder="e.g. Near Sector 21 Market or CP-104"
                className="pl-10 w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Provide the nearest landmark or the Bin ID if you know it.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              required
              rows={4}
              placeholder="Please provide details about the issue..."
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Evidence (Photo)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-green-400 transition cursor-pointer">
              <Upload className="h-8 w-8 mb-2 text-gray-400" />
              <p className="text-sm font-medium">Click to upload or drag and drop</p>
              <p className="text-xs">PNG, JPG up to 5MB</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button 
              type="submit"
              disabled={submitComplaint.isPending}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {submitComplaint.isPending ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
