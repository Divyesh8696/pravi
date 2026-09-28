import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function VehicleDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => fetch(`/api/vehicles/${id}`).then(res => res.json())
  });

  const updateStatus = useMutation({
    mutationFn: (status: string) => fetch(`/api/vehicles/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).then(res => res.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicle', id] })
  });

  if (isLoading) return <div className="p-8">Loading Vehicle Details...</div>;

  const vehicle = data?.data;
  if (!vehicle) return <div className="p-8 text-red-500">Vehicle not found.</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'BREAKDOWN': return 'bg-red-100 text-red-800';
      case 'ON_ROUTE': return 'bg-blue-100 text-blue-800';
      case 'UNDER_MAINTENANCE': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpired = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const getVehicleImage = (type: string) => {
    if (type === 'COMPACTOR') return 'https://images.unsplash.com/photo-1605810731666-8343110292c3?auto=format&fit=crop&w=800&q=80';
    if (type === 'AUTO_TIPPER') return 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=800&q=80';
    if (type === 'MINI_TRUCK') return 'https://images.unsplash.com/photo-1583422409516-2895a77ef2b0?auto=format&fit=crop&w=800&q=80';
    return 'https://images.unsplash.com/photo-1598971031300-34d6736279f5?auto=format&fit=crop&w=800&q=80';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-start">
        <div>
          <button onClick={() => navigate('/dashboard/vehicles')} className="text-emerald-600 text-sm mb-2 hover:underline">&larr; Back to Fleet</button>
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold text-gray-900">{vehicle.registrationNo}</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${getStatusColor(vehicle.status)}`}>
              {vehicle.status}
            </span>
          </div>
          <p className="text-gray-600 mt-1 font-mono">{vehicle.code} | {vehicle.vehicleType.replace('_', ' ')}</p>
        </div>
        <div className="flex gap-2">
          {(vehicle.status === 'AVAILABLE' || vehicle.status === 'ON_ROUTE') && (
            <button onClick={() => updateStatus.mutate('BREAKDOWN')} className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-sm font-medium hover:bg-red-700 transition">
              Report Breakdown
            </button>
          )}
          {(vehicle.status === 'BREAKDOWN' || vehicle.status === 'UNDER_MAINTENANCE') && (
            <button onClick={() => updateStatus.mutate('AVAILABLE')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-sm font-medium hover:bg-emerald-700 transition">
              Fix & Release
            </button>
          )}
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm font-medium hover:bg-gray-50 transition">
            Edit Details
          </button>
        </div>
      </div>
      
      {/* Large Image Header */}
      <div className="w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden shadow-sm border border-gray-200">
        <img 
          src={getVehicleImage(vehicle.vehicleType)} 
          alt="Vehicle" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1.1 Basic Information */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Basic Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Fleet ID:</span> <span className="font-medium">{vehicle.code}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Registration:</span> <span className="font-medium">{vehicle.registrationNo}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Type:</span> <span className="font-medium">{vehicle.vehicleType.replace('_', ' ')}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Capacity:</span> <span className="font-medium">{vehicle.capacityTonnes} Tonnes</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Fuel Type:</span> <span className="font-medium">{vehicle.fuelType}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Ownership:</span> <span className="font-medium">{vehicle.ownership}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Contractor:</span> <span className="font-medium">{vehicle.contractorId?.name || 'N/A'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Zone:</span> <span className="font-medium">{vehicle.zoneId?.name || 'Unassigned'}</span></div>
          </div>
        </div>

        {/* 1.8 Vehicle Documents */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Compliance Documents</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-900 font-medium block">Insurance Policy</span>
                <span className="text-gray-500 text-xs">Valid until: {vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString() : 'Unknown'}</span>
              </div>
              {isExpired(vehicle.insuranceExpiry) ? (
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-bold uppercase">Expired</span>
              ) : (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold uppercase">Valid</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-900 font-medium block">Fitness Certificate</span>
                <span className="text-gray-500 text-xs">Valid until: {vehicle.fitnessExpiry ? new Date(vehicle.fitnessExpiry).toLocaleDateString() : 'Unknown'}</span>
              </div>
              {isExpired(vehicle.fitnessExpiry) ? (
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-bold uppercase">Expired</span>
              ) : (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold uppercase">Valid</span>
              )}
            </div>
          </div>
          <button className="mt-4 w-full border border-dashed border-gray-300 text-emerald-600 py-2 rounded hover:bg-gray-50 transition text-sm font-medium">
            + Upload New Document
          </button>
        </div>

        {/* 1.2 / 1.3 Assignment Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Current Assignment</h3>
          <div className="flex flex-col items-center justify-center h-40 text-gray-500">
             <svg className="w-12 h-12 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
             <p>No active assignment.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
