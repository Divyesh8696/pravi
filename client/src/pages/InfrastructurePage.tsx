import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '../components/DataTable';
import Map from '../components/Map';

export default function InfrastructurePage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBin, setNewBin] = useState({ binId: '', name: '', type: 'COMMUNITY_BIN', wasteType: 'MIXED', capacityLitres: 1100, fillLevel: 0, status: 'ACTIVE' });

  const { data: binsData, isLoading: isLoadingBins } = useQuery({
    queryKey: ['bins'],
    queryFn: () => fetch('/api/bins').then(res => res.json())
  });

  const createBin = useMutation({
    mutationFn: (bData: any) => fetch('/api/bins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bData)
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bins'] });
      setShowAddModal(false);
      setNewBin({ binId: '', name: '', type: 'COMMUNITY_BIN', wasteType: 'MIXED', capacityLitres: 1100, fillLevel: 0, status: 'ACTIVE' });
    }
  });

  const deleteBin = useMutation({
    mutationFn: (id: string) => fetch(`/api/bins/${id}`, { method: 'DELETE' }).then(res => res.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bins'] })
  });

  const bins = binsData?.data || [];

  const columns = [
    { accessorKey: 'binId', header: 'Bin ID' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'type', header: 'Type' },
    { accessorKey: 'wasteType', header: 'Waste Type' },
    { accessorKey: 'capacityLitres', header: 'Capacity (L)' },
    { 
      accessorKey: 'fillLevel', 
      header: 'Fill Level',
      cell: ({ row }: any) => {
        const level = row.getValue('fillLevel');
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${level > 80 ? 'bg-red-500' : level > 50 ? 'bg-amber-500' : 'bg-green-500'}`} 
                style={{ width: `${level}%` }}
              ></div>
            </div>
            <span className="text-xs">{level}%</span>
          </div>
        );
      }
    },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: ({ row }: any) => {
        const s = row.getValue('status');
        return <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${s === 'OVERFLOWING' ? 'bg-red-100 text-red-800' : s === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{s}</span>;
      }
    },
    {
      id: 'actions',
      cell: ({ row }: any) => {
        const b = row.original;
        return (
          <button 
            onClick={() => { if(window.confirm('Delete bin?')) deleteBin.mutate(b._id); }}
            className="text-red-600 hover:text-red-900 font-medium text-sm bg-red-50 px-3 py-1 rounded-md transition"
          >
            Delete
          </button>
        );
      }
    }
  ];

  if (isLoadingBins) return <div className="p-8">Loading infrastructure data...</div>;

  const mapPoints = bins.map((b: any) => ({
    _id: b._id,
    code: b.binId,
    name: b.name,
    type: b.type,
    lat: b.lat || 23.2156,
    lng: b.lng || 72.6369,
    status: b.status,
    condition: `${b.fillLevel}% FULL`
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Collection Infrastructure</h2>
        <button onClick={() => setShowAddModal(true)} className="bg-emerald-600 text-white px-4 py-2 rounded shadow font-medium hover:bg-emerald-700">+ Add Bin</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4">Infrastructure Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">Total Bins/Containers</span>
              <span className="font-bold text-xl">{bins.length}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">Overflowing</span>
              <span className="font-bold text-xl text-red-600">{bins.filter((b: any) => b.status === 'OVERFLOWING').length}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">Maintenance Needed</span>
              <span className="font-bold text-xl text-amber-600">{bins.filter((b: any) => b.status === 'MAINTENANCE').length}</span>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2 bg-white rounded-lg shadow border border-gray-200 h-[300px] overflow-hidden">
          <Map center={[23.2156, 72.6369]} points={mapPoints} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-1">
        <DataTable data={bins} columns={columns} />
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Add New Bin</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Bin ID</label>
                <input type="text" value={newBin.binId} onChange={e => setNewBin({...newBin, binId: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" placeholder="e.g. BIN-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name/Location</label>
                <input type="text" value={newBin.name} onChange={e => setNewBin({...newBin, name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" placeholder="e.g. MG Road Corner" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select value={newBin.type} onChange={e => setNewBin({...newBin, type: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                    <option value="COMMUNITY_BIN">Community Bin</option>
                    <option value="UNDERGROUND_BIN">Underground Bin</option>
                    <option value="SMART_BIN">Smart Bin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Waste Type</label>
                  <select value={newBin.wasteType} onChange={e => setNewBin({...newBin, wasteType: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                    <option value="MIXED">Mixed</option>
                    <option value="DRY">Dry</option>
                    <option value="WET">Wet</option>
                    <option value="HAZARDOUS">Hazardous</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">Cancel</button>
              <button onClick={() => createBin.mutate(newBin)} className="px-4 py-2 bg-emerald-600 text-white rounded font-medium shadow hover:bg-emerald-700">Save Bin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
