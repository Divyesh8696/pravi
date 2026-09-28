import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Search, MapPin, MessageSquareWarning, Calendar, BarChart2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white px-8 py-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2 text-green-700">
          <Trash2 className="h-8 w-8" />
          <div>
            <div className="font-bold text-xl leading-tight">CleanCity</div>
            <div className="text-[10px] text-gray-500 font-medium">Municipal Solid Waste Management</div>
          </div>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-semibold text-gray-700">
          <Link to="#" className="text-blue-600 border-b-2 border-blue-600 pb-1">Home</Link>
          <Link to="#" className="hover:text-blue-600 transition">Services</Link>
          <Link to="#" className="hover:text-blue-600 transition">Maps</Link>
          <Link to="#" className="hover:text-blue-600 transition">Report Issue</Link>
          <Link to="#" className="hover:text-blue-600 transition">About</Link>
        </nav>
        <Link 
          to="/login" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition"
        >
          Sign In
        </Link>
      </header>

      <main className="flex-1 relative">
        {/* Background Image Area */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1605600659908-0ef719419d41?q=80&w=2072&auto=format&fit=crop')`, // Garbage truck placeholder
          }}
        >
          <div className="absolute inset-0 bg-white/70 to-transparent"></div> {/* Gradient overlay */}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32 h-full flex flex-col justify-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Cleaner City <br/>
            <span className="text-green-600">Healthier Tomorrow</span>
          </h1>
          <p className="mt-6 text-lg text-slate-700 max-w-lg font-medium leading-relaxed">
            Together for a cleaner, greener and healthier city. 
            Report issues, find nearby collection points, and 
            stay informed about waste collection services.
          </p>
          
          <div className="mt-10 max-w-xl flex items-center bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="pl-4 text-gray-400">
              <MapPin size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search location or collection point..."
              className="flex-1 px-4 py-4 focus:outline-none text-gray-700"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 transition">
              <Search size={20} />
            </button>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                <MapPin size={20} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Find Collection Points</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Locate nearby dustbins and collection points on the map.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                <MessageSquareWarning size={20} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Report an Issue</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Help us keep the city clean. Report garbage, overflow or other issues.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 mb-4">
                <Calendar size={20} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Collection Schedule</h3>
              <p className="text-xs text-gray-500 leading-relaxed">View waste collection schedule in your area.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                <BarChart2 size={20} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Track Your Complaints</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Check status and updates of your complaints.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

