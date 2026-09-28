import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import { ColumnDef } from '@tanstack/react-table';

export default function VehiclesPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ code: '', registrationNo: '', vehicleType: 'COMPACTOR', capacityTonnes: 5, status: 'AVAILABLE' });

  const { data, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => fetch('/api/vehicles').then(res => res.json())
  });

  const createVehicle = useMutation({
    mutationFn: (vData: any) => fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vData)
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setShowAddModal(false);
      setNewVehicle({ code: '', registrationNo: '', vehicleType: 'COMPACTOR', capacityTonnes: 5, status: 'AVAILABLE' });
    }
  });

  const deleteVehicle = useMutation({
    mutationFn: (id: string) => fetch(`/api/vehicles/${id}`, { method: 'DELETE' }).then(res => res.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] })
  });

  const vehicles = data?.data || [];

  const getVehicleImage = (type: string) => {
    if (type === 'COMPACTOR') return 'https://images.unsplash.com/photo-1605810731666-8343110292c3?auto=format&fit=crop&w=150&q=80';
    if (type === 'AUTO_TIPPER') return 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=150&q=80';
    if (type === 'MINI_TRUCK') return 'https://images.unsplash.com/photo-1583422409516-2895a77ef2b0?auto=format&fit=crop&w=150&q=80';
    return 'https://images.unsplash.com/photo-1598971031300-34d6736279f5?auto=format&fit=crop&w=150&q=80';
  };

  const columns: ColumnDef<any>[] = [
    {
      id: 'image',
      header: 'Photo',
      cell: ({ row }) => (
        <img 
          src={getVehicleImage(row.original.vehicleType)} 
          alt="Vehicle" 
          className="w-16 h-12 object-cover rounded shadow-sm border border-gray-200"
        />
      )
    },
    { accessorKey: 'code', header: 'Fleet ID', cell: ({ row }) => <span className="font-mono font-medium">{row.getValue('code')}</span> },
    { accessorKey: 'registrationNo', header: 'Registration' },
    { accessorKey: 'vehicleType', header: 'Type' },
    { accessorKey: 'capacityTonnes', header: 'Capacity', cell: ({ row }) => `${row.getValue('capacityTonnes')} T` },
    { accessorKey: 'zoneId.name', header: 'Zone', cell: ({ row }) => row.original.zoneId?.name || 'Unassigned' },
    { accessorKey: 'contractorId.name', header: 'Contractor', cell: ({ row }) => row.original.contractorId?.name || 'MUNICIPAL' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => {
        const status = row.getValue('status') as string;
        let color = 'bg-gray-100 text-gray-800';
        if (status === 'AVAILABLE') color = 'bg-green-100 text-green-800';
        if (status === 'BREAKDOWN') color = 'bg-red-100 text-red-800';
        if (status === 'ON_ROUTE') color = 'bg-blue-100 text-blue-800';
        if (status === 'UNDER_MAINTENANCE') color = 'bg-amber-100 text-amber-800';
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{status}</span>;
    }},
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const v = row.original;
        return (
          <div className="flex gap-2">
            <Link to={`/dashboard/vehicles/${v._id}`} className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded text-sm font-medium shadow-sm transition">
              View
            </Link>
            <button 
              onClick={() => { if(window.confirm('Delete vehicle?')) deleteVehicle.mutate(v._id); }}
              className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1 rounded text-sm font-medium shadow-sm transition"
            >
              Delete
            </button>
          </div>
        );
      }
    }
  ];

  if (isLoading) return <div className="p-8 text-gray-500">Loading Fleet...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Fleet Inventory</h2>
        <button onClick={() => setShowAddModal(true)} className="bg-emerald-600 text-white px-4 py-2 rounded shadow font-medium hover:bg-emerald-700">+ Add Vehicle</button>
      </div>
      <DataTable columns={columns} data={vehicles} />

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Add New Vehicle</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Fleet ID</label>
                <input type="text" value={newVehicle.code} onChange={e => setNewVehicle({...newVehicle, code: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" placeholder="e.g. VEH-0250" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                <input type="text" value={newVehicle.registrationNo} onChange={e => setNewVehicle({...newVehicle, registrationNo: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" placeholder="e.g. GJ-01-AB-1234" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                <select value={newVehicle.vehicleType} onChange={e => setNewVehicle({...newVehicle, vehicleType: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                  <option value="COMPACTOR">Compactor</option>
                  <option value="AUTO_TIPPER">Auto Tipper</option>
                  <option value="MINI_TRUCK">Mini Truck</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Capacity (Tonnes)</label>
                <input type="number" value={newVehicle.capacityTonnes} onChange={e => setNewVehicle({...newVehicle, capacityTonnes: Number(e.target.value)})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">Cancel</button>
              <button onClick={() => createVehicle.mutate(newVehicle)} className="px-4 py-2 bg-emerald-600 text-white rounded font-medium shadow hover:bg-emerald-700">Save Vehicle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
