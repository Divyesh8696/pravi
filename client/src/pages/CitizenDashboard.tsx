import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ClipboardList, CheckCircle2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function CitizenDashboard() {
  const { user } = useAuth();
  
  const { data, isLoading } = useQuery({
    queryKey: ['citizen-complaints'],
    queryFn: () => fetch('/api/complaints').then(r => r.json())
  });

  const complaints = data?.data || [];
  const openCount = complaints.filter((c: any) => c.status !== 'CLOSED' && c.status !== 'RESOLVED').length;
  const resolvedCount = complaints.filter((c: any) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="bg-green-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Welcome, {user?.name}</h2>
          <p className="text-green-100 text-lg mb-6">How can we help you keep your neighborhood clean today?</p>
          <Link 
            to="/dashboard/report-issue" 
            className="inline-flex items-center gap-2 bg-white text-green-800 px-6 py-3 rounded-lg font-bold shadow-sm hover:bg-green-50 transition"
          >
            <AlertTriangle size={20} />
            Report an Issue
          </Link>
        </div>
        <div className="absolute right-0 top-0 opacity-20 transform translate-x-1/4 -translate-y-1/4">
          <CheckCircle2 size={300} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Active Requests</h3>
            <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">
              {openCount} Open
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">Track the status of your reported issues.</p>
          <Link to="/dashboard/complaints" className="text-green-600 font-medium hover:underline text-sm flex items-center gap-1">
            <Search size={16} /> View My Complaints
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Resolved</h3>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
              {resolvedCount} Closed
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">Issues that have been successfully resolved.</p>
          <Link to="/dashboard/complaints" className="text-green-600 font-medium hover:underline text-sm flex items-center gap-1">
            <ClipboardList size={16} /> View History
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Recent Activity</h3>
        </div>
        <div className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : complaints.length === 0 ? (
            <div className="p-8 text-center text-gray-500">You haven't reported any issues yet.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {complaints.slice(0, 5).map((c: any) => (
                <li key={c._id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-gray-900">{c.category.replace(/_/g, ' ')}</span>
                    <span className="text-xs font-mono text-gray-500">{c.code}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 truncate">{c.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{new Date(c.reportedAt).toLocaleDateString()}</span>
                    <span className={`px-2 py-1 rounded font-bold ${c.status === 'RESOLVED' || c.status === 'CLOSED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                      {c.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
