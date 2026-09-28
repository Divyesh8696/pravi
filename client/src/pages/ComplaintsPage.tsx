import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '../components/DataTable';

import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function ComplaintsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['complaints'],
    queryFn: () => fetch('/api/complaints').then(res => res.json())
  });

  const resolveComplaint = useMutation({
    mutationFn: (id: string) => fetch(`/api/complaints/${id}/resolve`, { method: 'POST' }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      setSelectedComplaint(null);
    }
  });

  const columns = [
    { accessorKey: 'code', header: 'Complaint ID', cell: ({ row }: any) => <span className="font-mono font-medium">{row.getValue('code')}</span> },
    { accessorKey: 'category', header: 'Issue Type', cell: ({ row }: any) => row.getValue('category').replace(/_/g, ' ') },
    { accessorKey: 'description', header: 'Description', cell: ({ row }: any) => <span className="truncate block max-w-xs">{row.getValue('description')}</span> },
    { accessorKey: 'citizenName', header: 'Reported By' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }: any) => {
        const s = row.getValue('status');
        return <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${s === 'RESOLVED' || s === 'CLOSED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{s}</span>;
    }},
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const c = row.original;
        return (
          <button 
            onClick={() => setSelectedComplaint(c)}
            className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded text-sm font-medium shadow-sm transition"
          >
            View Details
          </button>
        );
      }
    }
  ];

  if (isLoading) return <div className="p-8">Loading complaints...</div>;

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{user?.role === 'CITIZEN' ? 'My Complaints' : 'Public Complaints & Issues'}</h2>
        {user?.role === 'CITIZEN' && (
          <Link to="/dashboard/report-issue" className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-sm font-medium hover:bg-green-700 transition">
            + Report Issue
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-1">
        <DataTable data={data?.data || []} columns={columns} />
      </div>

      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h3 className="text-xl font-bold">Complaint Details: {selectedComplaint.code}</h3>
              <button onClick={() => setSelectedComplaint(null)} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">&times;</button>
            </div>
            
            <div className="p-6 space-y-6">
              {selectedComplaint.imageUrl && (
                <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200">
                  <img src={selectedComplaint.imageUrl} alt="Complaint" className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium text-gray-900">{selectedComplaint.category.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${selectedComplaint.status === 'RESOLVED' || selectedComplaint.status === 'CLOSED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                      {selectedComplaint.status}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reported By</p>
                  <p className="font-medium text-gray-900">{selectedComplaint.citizenName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reported On</p>
                  <p className="font-medium text-gray-900">{new Date(selectedComplaint.reportedAt).toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium text-gray-900 mt-1 p-3 bg-gray-50 rounded border">{selectedComplaint.description}</p>
                </div>
              </div>

              {user?.role !== 'CITIZEN' && selectedComplaint.status !== 'RESOLVED' && selectedComplaint.status !== 'CLOSED' && (
                <div className="pt-4 border-t flex justify-end">
                  <button 
                    onClick={() => resolveComplaint.mutate(selectedComplaint._id)}
                    className="text-white bg-emerald-600 hover:bg-emerald-700 px-6 py-2 rounded-lg font-medium shadow-sm"
                  >
                    Mark as Resolved
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
