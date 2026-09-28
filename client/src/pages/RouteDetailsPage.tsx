import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Map from '../components/Map';

export default function RouteDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeOperationId, setActiveOperationId] = useState<string | null>(null);

  const { data: routeData, isLoading: isRouteLoading } = useQuery({
    queryKey: ['route', id],
    queryFn: () => fetch(`/api/routes/${id}`).then(res => res.json())
  });

  const { data: activeOpsData } = useQuery({
    queryKey: ['active-operations', id],
    queryFn: () => fetch(`/api/operations?status=IN_PROGRESS,PAUSED`).then(res => res.json()),
    refetchInterval: 10000, // Refresh occasionally
  });

  const activeOp = activeOpsData?.data?.find((op: any) => op.routeId?._id === id || op.routeId === id);

  const createOperation = useMutation({
    mutationFn: () => fetch(`/api/operations`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routeId: id })
    }).then(res => res.json()),
    onSuccess: (res) => {
        if(res.data) setActiveOperationId(res.data._id);
        queryClient.invalidateQueries({ queryKey: ['active-operations', id] });
    }
  });

  const changeOpStatus = useMutation({
    mutationFn: ({ opId, action }: { opId: string, action: 'start' | 'pause' | 'resume' | 'complete' }) => 
        fetch(`/api/operations/${opId}/${action}`, { method: 'POST' }).then(res => res.json()),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['active-operations', id] });
        if (activeOp && activeOp.status === 'COMPLETED') setActiveOperationId(null);
    }
  });

  const recordStop = useMutation({
    mutationFn: ({ pointId, status }: { pointId: string, status: string }) => 
        fetch(`/api/operations/${activeOperationId}/stops`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ collectionPointId: pointId, status, notes: '' })
        }).then(res => res.json()),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['route', id] });
        queryClient.invalidateQueries({ queryKey: ['active-operations', id] });
    }
  });

  if (isRouteLoading) return <div className="p-8 flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>;

  const route = routeData?.data?.route;
  const stops = routeData?.data?.stops || [];
  
  if (!route) return <div className="p-8 text-red-500">Route not found. Make sure you have permission to view this route.</div>;

  const points = stops.map((s: any) => s.collectionPointId).filter(Boolean);
  const center: [number, number] = points.length > 0 ? [points[0].lat, points[0].lng] : [23.2156, 72.6369];
  
  const currentOpId = activeOp?._id || activeOperationId;
  const isPaused = activeOp?.status === 'PAUSED';

  // Calculate which stop is the active one to place the truck icon dynamically based on completed stops
  const completedStops = activeOp ? (activeOp.collectedCount + activeOp.missedCount) : 0;
  const truckIndex = currentOpId ? Math.min(completedStops, points.length - 1) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-start">
        <div>
          <button onClick={() => navigate('/dashboard/routes')} className="text-emerald-600 text-sm mb-2 hover:underline">&larr; Back to Routes</button>
          <h2 className="text-3xl font-bold text-gray-900">{route.name} <span className="text-gray-500 text-xl font-mono">({route.code})</span></h2>
          <p className="text-gray-600 mt-1">Zone: {route.zoneId?.name} | Time: {route.plannedStartTime} - {route.plannedEndTime}</p>
        </div>
        {!currentOpId ? (
          <button 
            onClick={() => createOperation.mutate()} 
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg shadow font-medium hover:bg-emerald-700 transition"
          >
            Start Route Operation
          </button>
        ) : (
          <div className="flex items-center gap-3">
            {isPaused ? (
              <button onClick={() => changeOpStatus.mutate({ opId: currentOpId, action: 'resume' })} className="bg-emerald-600 text-white px-4 py-2 rounded-lg shadow font-medium">Resume</button>
            ) : (
              <button onClick={() => changeOpStatus.mutate({ opId: currentOpId, action: 'pause' })} className="bg-amber-500 text-white px-4 py-2 rounded-lg shadow font-medium">Pause</button>
            )}
            <button onClick={() => changeOpStatus.mutate({ opId: currentOpId, action: 'complete' })} className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow font-medium">Complete Route</button>
            <div className={`px-4 py-2 rounded-lg font-bold border ${isPaused ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-blue-100 text-blue-800 border-blue-200'}`}>
              🚚 {isPaused ? 'Operation Paused' : 'Operation In Progress'}
            </div>
          </div>
        )}
      </div>
      
      {/* Information Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">Assigned Vehicle</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-bold text-gray-900">{activeOp?.vehicleId?.registrationNo || 'Unassigned'}</p>
              <p className="text-sm text-gray-600">{activeOp?.vehicleId?.code || 'No vehicle attached to current operation'}</p>
            </div>
            <div className={`${activeOp?.vehicleId ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 bg-gray-50'} p-2 rounded-full`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">Waste Destination</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-bold text-gray-900">{route.destinationId?.name || 'Unassigned Facility'}</p>
              <p className="text-sm text-gray-600">
                {route.destinationId?.code} | Status: <span className="text-amber-700 font-medium">{route.destinationId?.status}</span>
              </p>
            </div>
            <div className="text-amber-600 bg-amber-50 p-2 rounded-full cursor-pointer hover:bg-amber-100 transition" title="View Destination">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">Contractor Details</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-bold text-gray-900">{route.contractorId?.name || 'ABC Waste Services'}</p>
              <p className="text-sm text-gray-600">Contact: +91 98765 43210</p>
            </div>
            <div className="text-blue-600 bg-blue-50 p-2 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stops List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-1 max-h-[600px] flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center sticky top-0 z-10">
            <h3 className="text-lg font-semibold text-gray-800">Collection Path ({stops.length})</h3>
          </div>
          <ul className="divide-y divide-gray-100 overflow-y-auto flex-1">
            {stops.map((stop: any, index: number) => (
              <li key={stop._id} className="px-4 py-4 hover:bg-gray-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${index === truckIndex && currentOpId ? 'bg-blue-600' : 'bg-gray-400'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm leading-tight">{stop.collectionPointId?.name}</p>
                    <p className="text-xs text-gray-500">{stop.collectionPointId?.code}</p>
                  </div>
                </div>
                
                {currentOpId && !isPaused && (
                  <div className="flex gap-2 ml-9">
                    <button 
                      onClick={() => recordStop.mutate({ pointId: stop.collectionPointId._id, status: 'COLLECTED' })}
                      className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-200 text-xs font-medium w-full"
                    >
                      ✓ Collected
                    </button>
                    <button 
                      onClick={() => recordStop.mutate({ pointId: stop.collectionPointId._id, status: 'MISSED' })}
                      className="bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 text-xs font-medium w-full"
                    >
                      ✗ Missed
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Right Column: Map */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-2 h-[600px]">
          <Map 
            center={center} 
            points={points} 
            showRoute={true} 
            truckIndex={activeOperationId ? truckIndex : undefined} 
            destination={route.destinationId}
          />
        </div>
      </div>
    </div>
  );
}
