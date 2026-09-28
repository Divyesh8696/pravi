import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import { ColumnDef } from '@tanstack/react-table';

export default function RoutesPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoute, setNewRoute] = useState({ code: '', name: '', plannedStartTime: '08:00', plannedEndTime: '16:00', isActive: true });

  const { data, isLoading } = useQuery({
    queryKey: ['routes'],
    queryFn: () => fetch('/api/routes').then(res => res.json())
  });

  const createRoute = useMutation({
    mutationFn: (rData: any) => fetch('/api/routes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rData)
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      setShowAddModal(false);
      setNewRoute({ code: '', name: '', plannedStartTime: '08:00', plannedEndTime: '16:00', isActive: true });
    }
  });

  const deleteRoute = useMutation({
    mutationFn: (id: string) => fetch(`/api/routes/${id}`, { method: 'DELETE' }).then(res => res.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routes'] })
  });

  const routes = data?.data || [];

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'code', header: 'Route Code', cell: ({ row }) => <span className="font-mono font-medium text-emerald-700">{row.getValue('code')}</span> },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'plannedStartTime', header: 'Start Time' },
    { accessorKey: 'plannedEndTime', header: 'End Time' },
    { accessorKey: 'isActive', header: 'Status', cell: ({ row }) => {
        const active = row.getValue('isActive');
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{active ? 'ACTIVE' : 'INACTIVE'}</span>;
    }},
    {
      id: 'actions',
      cell: ({ row }) => {
        const route = row.original;
        return (
          <div className="flex gap-2">
            <Link to={`/dashboard/routes/${route._id}`} className="text-emerald-600 hover:text-emerald-900 font-medium text-sm bg-emerald-50 px-3 py-1 rounded-md">
              View
            </Link>
            <button 
              onClick={() => { if(window.confirm('Delete route?')) deleteRoute.mutate(route._id); }}
              className="text-red-600 hover:text-red-900 font-medium text-sm bg-red-50 px-3 py-1 rounded-md transition"
            >
              Delete
            </button>
          </div>
        );
      }
    }
  ];

  if (isLoading) return <div className="p-8 text-gray-500">Loading routes...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Collection Routes</h2>
        <button onClick={() => setShowAddModal(true)} className="bg-emerald-600 text-white px-4 py-2 rounded shadow font-medium hover:bg-emerald-700">+ Add Route</button>
      </div>
      <DataTable columns={columns} data={routes} />

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Add New Route</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Route Code</label>
                <input type="text" value={newRoute.code} onChange={e => setNewRoute({...newRoute, code: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" placeholder="e.g. R-101" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Route Name</label>
                <input type="text" value={newRoute.name} onChange={e => setNewRoute({...newRoute, name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" placeholder="e.g. Downtown Loop" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input type="time" value={newRoute.plannedStartTime} onChange={e => setNewRoute({...newRoute, plannedStartTime: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input type="time" value={newRoute.plannedEndTime} onChange={e => setNewRoute({...newRoute, plannedEndTime: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">Cancel</button>
              <button onClick={() => createRoute.mutate(newRoute)} className="px-4 py-2 bg-emerald-600 text-white rounded font-medium shadow hover:bg-emerald-700">Save Route</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
