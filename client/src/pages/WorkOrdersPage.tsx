import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '../components/DataTable';
import { ColumnDef } from '@tanstack/react-table';

export default function WorkOrdersPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['work-orders'],
    queryFn: () => fetch('/api/work-orders').then(res => res.json())
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => fetch(`/api/work-orders/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).then(res => res.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['work-orders'] })
  });

  const workOrders = data?.data || [];

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'code', header: 'WO Number', cell: ({ row }) => <span className="font-mono font-medium text-blue-700">{row.getValue('code')}</span> },
    { accessorKey: 'title', header: 'Title' },
    { accessorKey: 'type', header: 'Type' },
    { accessorKey: 'priority', header: 'Priority', cell: ({ row }) => {
        const priority = row.getValue('priority') as string;
        const color = priority === 'HIGH' ? 'bg-red-100 text-red-800' : priority === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800';
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{priority}</span>;
    }},
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }},
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const wo = row.original;
        if (wo.status === 'COMPLETED' || wo.status === 'VERIFIED' || wo.status === 'CLOSED') {
          return <span className="text-gray-400 text-sm">Done</span>;
        }
        
        return (
          <div className="flex gap-2">
            {(wo.status === 'PENDING' || wo.status === 'ASSIGNED') ? (
              <button onClick={() => updateStatus.mutate({ id: wo._id, status: 'IN_PROGRESS' })} className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm font-medium shadow-sm transition">
                Start
              </button>
            ) : (
              <button onClick={() => updateStatus.mutate({ id: wo._id, status: 'COMPLETED' })} className="text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded text-sm font-medium shadow-sm transition">
                Complete
              </button>
            )}
          </div>
        );
      }
    }
  ];

  if (isLoading) return <div className="p-8 text-gray-500">Loading Work Orders...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Work Orders</h2>
      </div>
      <DataTable columns={columns} data={workOrders} />
    </div>
  );
}
