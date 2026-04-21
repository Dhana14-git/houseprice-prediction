import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';
import { calculatePrediction } from '../services/api';

// --- LEAFLET ICON FIX ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ChangeView = ({ center }) => {
  const map = useMap();
  useEffect(() => { 
    if (center && center[0] !== undefined && center[1] !== undefined && !isNaN(center[0])) {
      map.setView(center, 15); 
    }
  }, [center, map]);
  return null;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [predictionData, setPredictionData] = useState(null);
  const [view, setView] = useState('map');
  const [history, setHistory] = useState([]); 
  const [showHistory, setShowHistory] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const userId = localStorage.getItem('userId');

  const [formData, setFormData] = useState({
    Year: 2010, RmNum: 3, HllNum: 1, KchNum: 1, BthNum: 2,
    Floor: 5, SubwayDst: 500,
    EdcNum: 3, EdcDst: 1000, HthNum: 2, HthDst: 2000,
    RtlNum: 10, RtlDst: 800, RstNum: 5, RstDst: 1000,
    Lat: 39.9042, Lng: 116.4074, address: ''
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const fetchHistory = useCallback(async () => {
  if (!userId) return;

  try {
    const res = await axios.get(
      `https://houseprice-prediction-1-0dif.onrender.com/api/predictions/history/${userId}`
    );
    setHistory(res.data);
  } catch (err) {
    console.error("History fetch failed");
  }
}, [userId]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handlePredict = async () => {
  try {
    const token = localStorage.getItem('token');

    const payload = {
      ...formData,
      userId,
      address: formData.address || "Unknown Location"
    };

    // ✅ ONLY ONE CALL (to backend)
    const res = await axios.post(
      'https://houseprice-prediction-1-0dif.onrender.com/api/predictions/calculate',
      payload,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log("✅ Final response:", res.data);

    // backend already returns saved prediction
    setPredictionData({
      _id: res.data._id,
      predictedValue: res.data.result?.predictedValue,
      accuracyScore: res.data.result?.accuracyScore,
      isSaved: res.data.isSaved
    });

    setView('analysis');

    if (!userId) {
      localStorage.setItem('guest_prediction_count', '1');
    } else {
      fetchHistory();
    }

  } catch (err) {
    console.error("❌ Prediction failed:", err);

    if (err.response?.status === 401) {
      alert("Session expired. Please log in again.");
      navigate('/auth');
    } else {
      alert("Prediction failed. Check console.");
    }
  }
};

const toggleSave = async (id) => {
  if (!userId) {
    navigate('/auth');
    return;
  }

  try {
    const res = await axios.patch(
      `https://houseprice-prediction-1-0dif.onrender.com/api/predictions/save/${id}`
    );

    console.log("SAVE RESPONSE:", res.data);

    // update UI instantly
    setPredictionData(prev =>
      prev && prev._id === id
        ? { ...prev, isSaved: res.data.isSaved }
        : prev
    );

    fetchHistory();

  } catch (err) {
    console.error("❌ Save toggle failed:", err);
  }
};
  const handleAddressSearch = async (e) => {
    if (e.key === 'Enter' && formData.address) {
      setIsSearching(true);
      try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}&limit=1&accept-language=en`);
        if (res.data.length > 0) {
          const { lat, lon, display_name } = res.data[0];
          setFormData(prev => ({ 
            ...prev, Lat: parseFloat(lat), Lng: parseFloat(lon), address: display_name 
          }));
        } else { alert("Location not found."); }
      } catch (err) { console.error("Search error", err); }
      finally { setIsSearching(false); }
    }
  };

  const ClickHandler = () => {
    useMapEvents({
      async click(e) {
        const { lat, lng } = e.latlng;
        setFormData(prev => ({ ...prev, Lat: lat, Lng: lng }));
        try {
          const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=en`);
          setFormData(prev => ({ ...prev, address: res.data.display_name || '' }));
        } catch (err) { console.error(err); }
      },
    });
    return <Marker position={[formData.Lat, formData.Lng]} />;
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-[#101922] text-[#1e293b] dark:text-white font-['Manrope'] overflow-hidden transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside className="w-[420px] border-r border-slate-200 dark:border-[#233648] flex flex-col h-full bg-white dark:bg-[#101922] z-20 print:hidden transition-colors duration-300">
        <header className="flex items-center justify-between p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#137fec]/10 rounded-xl">
              <span className="material-symbols-outlined text-[#137fec] text-2xl font-bold block">analytics</span>
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">EstatePredict AI</h2>
              <span className="text-[10px] font-bold text-slate-400 dark:text-[#5c7a99] uppercase tracking-wider">Intelligence Dashboard</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button onClick={() => navigate('/profile')} className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#233648] text-slate-600 dark:text-[#92adc9] hover:text-[#137fec] transition-all group" title="Profile Portal">
              <span className="material-symbols-outlined text-[22px] block group-hover:scale-110">account_circle</span>
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#233648] text-slate-600 dark:text-[#92adc9] hover:text-[#137fec] transition-all">
              <span className="material-symbols-outlined text-[22px] block">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar">
          {showHistory ? (
            <section className="animate-in slide-in-from-left duration-300">
              <h2 className="text-[11px] font-black text-[#137fec] uppercase mb-4 tracking-[0.2em]">Active Session History ({history.length})</h2>
              <div className="space-y-3">
                {history.map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border transition-all ${
                    item.isSaved 
                      ? 'bg-yellow-50/50 dark:bg-yellow-500/5 border-yellow-200 dark:border-yellow-500/20 shadow-sm' 
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10'
                  }`}>
                    <div className="flex justify-between items-start">
                      <p className="font-bold truncate text-xs w-4/5 text-slate-900 dark:text-white">{item.address || 'Location'}</p>
                      {item.isSaved && (
                        <span className="material-symbols-outlined text-yellow-500 text-sm">stars</span>
                      )}
                    </div>
                    <p className="text-[#10b981] font-black mt-1">¥ {item.predictedValue?.toLocaleString()}</p>
                    {!item.isSaved && (
                      <p className="text-[9px] text-slate-400 dark:text-[#5c7a99] mt-2 italic">Temporary: Will be cleared on logout</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <>
              <section>
                <h2 className="text-[11px] font-black text-[#137fec] uppercase mb-4 tracking-[0.2em]">📍 Location Context</h2>
                <div className="space-y-4 p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-[#233648]">
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Lat" name="Lat" value={formData.Lat} onChange={setFormData} icon="explore" />
                        <InputField label="Lng" name="Lng" value={formData.Lng} onChange={setFormData} icon="explore" />
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-xs text-[#137fec]">{isSearching ? 'sync' : 'search'}</span>
                      <input 
                        type="text" 
                        placeholder="Search address + Enter..." 
                        className="w-full bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-[#233648] rounded-xl p-3 pl-9 text-sm font-bold text-slate-900 dark:text-white outline-none" 
                        value={formData.address} 
                        onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
                        onKeyDown={handleAddressSearch}
                      />
                    </div>
                </div>
              </section>
              
              <section>
                <h2 className="text-[11px] font-black text-[#137fec] uppercase mb-4 tracking-[0.2em]">🏠 Core Property</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <InputField label="Year" name="Year" value={formData.Year} onChange={setFormData} icon="calendar_month" />
                  <InputField label="Beds" name="RmNum" value={formData.RmNum} onChange={setFormData} icon="bed" />
                  <InputField label="Halls" name="HllNum" value={formData.HllNum} onChange={setFormData} icon="chair" />
                  <InputField label="Kitchens" name="KchNum" value={formData.KchNum} onChange={setFormData} icon="kitchen" />
                  <InputField label="Baths" name="BthNum" value={formData.BthNum} onChange={setFormData} icon="bathtub" />
                </div>
              </section>

              <section>
                <h2 className="text-[11px] font-black text-[#137fec] uppercase mb-4 tracking-[0.2em]">⭐ Amenities</h2>
                <div className="space-y-4 pb-6">
                  <AmenityGroup label="Education" countName="EdcNum" distName="EdcDst" data={formData} onChange={setFormData} icon="school" />
                  <AmenityGroup label="Healthcare" countName="HthNum" distName="HthDst" data={formData} onChange={setFormData} icon="medical_services" />
                  <AmenityGroup label="Retail" countName="RtlNum" distName="RtlDst" data={formData} onChange={setFormData} icon="shopping_bag" />
                  <AmenityGroup label="Dining" countName="RstNum" distName="RstDst" data={formData} onChange={setFormData} icon="restaurant" />
                </div>
              </section>
            </>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-[#233648] bg-white dark:bg-[#101922] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          <button onClick={handlePredict} className="w-full bg-[#137fec] hover:bg-blue-600 py-4 rounded-xl font-bold shadow-lg shadow-[#137fec]/20 transition-all active:scale-95 uppercase tracking-widest text-xs text-white">Generate Prediction</button>
          <button onClick={() => setShowHistory(!showHistory)} className="w-full mt-4 py-2 text-[10px] text-slate-500 dark:text-[#92adc9] uppercase font-bold hover:text-[#137fec] flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">history</span> {showHistory ? 'Back to Editor' : 'View History'}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative bg-[#f8fafc] dark:bg-[#101922] overflow-y-auto transition-colors duration-300">
        {view === 'map' ? (
          <div className="h-full w-full flex flex-col">
            <div className="flex-1 relative">
              <MapContainer center={[formData.Lat, formData.Lng]} zoom={12} style={{height: '100%', width: '100%'}}>
                <TileLayer url={isDarkMode ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
                <ClickHandler />
                <ChangeView center={[formData.Lat, formData.Lng]} />
              </MapContainer>
            </div>
            <div className="p-4 bg-white dark:bg-[#101922] border-t border-slate-200 dark:border-[#233648] flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#137fec]">location_on</span>
                  <span className="text-sm font-bold truncate max-w-xl">{formData.address || 'Click on map to pin location'}</span>
               </div>
               <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Pinned: {formData.Lat.toFixed(4)}, {formData.Lng.toFixed(4)}
               </div>
            </div>
          </div>
        ) : (
          <div className="p-8 lg:p-12 max-w-[1400px] mx-auto animate-in fade-in zoom-in-95 duration-700">
            {(() => {
              const predicted = predictionData.predictedValue;
              const confidence = parseFloat(predictionData.accuracyScore || 90.5);
              const age = new Date().getFullYear() - (formData.Year || 2010);

              return (
                <div className="space-y-8">
                  <header className="flex flex-wrap justify-between items-end gap-6 border-b border-slate-200 dark:border-[#233648] pb-8 mb-10">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[#137fec] font-black uppercase tracking-[0.3em] text-[10px]">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#137fec] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#137fec]"></span>
                        </span>
                        Live Intelligence Report
                      </div>
                      <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Valuation Analysis</h1>
                      <p className="text-slate-500 dark:text-[#92adc9] font-bold flex items-center gap-2"><span className="material-symbols-outlined text-[#137fec]">location_on</span> {formData.address}</p>
                    </div>
                    <div className="flex gap-3 print:hidden">
                      <button onClick={() => toggleSave(predictionData._id)} className={`flex h-11 items-center px-6 rounded-xl border font-bold transition-all ${predictionData.isSaved ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' : 'border-slate-300 dark:border-[#233648] text-slate-700 dark:text-white'}`}>
                        <span className="material-symbols-outlined mr-2">{predictionData.isSaved ? 'star' : 'star_border'}</span> {predictionData.isSaved ? 'Saved' : 'Save'}
                      </button>
                      <button onClick={() => window.print()} className="flex h-11 items-center px-6 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold border border-slate-300 dark:border-[#233648] shadow-sm hover:bg-slate-50 transition-colors">PDF</button>
                      <button onClick={() => setView('map')} className="flex h-11 items-center px-6 rounded-xl bg-[#137fec] text-white font-bold hover:shadow-lg transition-shadow">New Run</button>
                    </div>
                  </header>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-8">
                      <div className="bg-white dark:bg-[#1a2632] rounded-[2.5rem] p-10 border border-slate-200 dark:border-[#233648] shadow-xl relative overflow-hidden group">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#137fec]/10 rounded-full blur-3xl"></div>
                        <h3 className="text-slate-400 dark:text-[#92adc9] text-xs font-black uppercase tracking-widest mb-4">Estimated Market Value</h3>
                        <div className="flex items-baseline gap-2 mb-10">
                          <span className="text-4xl font-light text-[#137fec]">¥</span>
                          <h1 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter">{predicted.toLocaleString()}</h1>
                        </div>
                        <MetricCard label="Confidence Score" value={`${confidence}%`} color="text-[#10b981]" isDark={isDarkMode} />
                        <div className="mt-10 h-3 w-full bg-slate-100 dark:bg-[#101922] rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-white/5">
                           <div className="h-full bg-gradient-to-r from-[#137fec] to-[#10b981] rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(19,127,236,0.3)]" style={{ width: `${confidence}%` }}></div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-[#1a2632] rounded-3xl border border-slate-200 dark:border-[#233648] p-8 shadow-xl">
                        <h3 className="text-slate-900 dark:text-white font-bold mb-8 flex items-center gap-2"><span className="material-symbols-outlined text-[#137fec]">analytics</span> Price Influencing Factors</h3>
                        <div className="space-y-8">
                          <ColoredFactorRow label="Location Strength" score={85} color="bg-[#10b981]" isDark={isDarkMode} />
                          <ColoredFactorRow label="Living Space Influence" score={72} color="bg-[#137fec]" isDark={isDarkMode} />
                          <ColoredFactorRow label="Property Age Impact" score={20} color="bg-[#ef4444]" isDark={isDarkMode} />
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                      <div className="bg-white dark:bg-[#1a2632] rounded-[2.5rem] border border-slate-200 dark:border-[#233648] overflow-hidden shadow-xl h-80 relative transition-all duration-500">
                        <MapContainer center={[formData.Lat, formData.Lng]} zoom={15} zoomControl={false} dragging={false} className="h-full w-full">
                          <TileLayer url={isDarkMode ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
                          <Marker position={[formData.Lat, formData.Lng]} />
                        </MapContainer>
                      </div>
                      <div className="bg-white dark:bg-[#1a2632] rounded-[2rem] border border-slate-200 dark:border-[#233648] p-6 shadow-xl space-y-3">
                        <SideSpec icon="history" label="Structure Age" value={`${age} Years`} isDark={isDarkMode} />
                        <SideSpec icon="train" label="Subway Distance" value={`${formData.SubwayDst}m`} isDark={isDarkMode} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </main>
    </div>
  );
};

/* --- SUPPORTING UI COMPONENTS --- */

const MetricCard = ({ label, value, color, isDark }) => (
  <div className={`border p-6 rounded-2xl shadow-inner transition-colors ${isDark ? 'bg-[#101922] border-[#233648]' : 'bg-slate-50 border-slate-200'}`}>
    <p className="text-[10px] text-slate-400 dark:text-[#92adc9] uppercase font-black mb-1 tracking-widest opacity-60">{label}</p>
    <p className={`text-2xl font-black ${color || (isDark ? 'text-white' : 'text-slate-900')}`}>{value}</p>
  </div>
);

const ColoredFactorRow = ({ label, score, color, isDark }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => { setTimeout(() => setWidth(score), 300); }, [score]);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold font-['Manrope']">
        <span className="text-slate-500 dark:text-[#92adc9]">{label}</span>
        <span className={isDark ? 'text-white' : 'text-slate-900'}>{score}%</span>
      </div>
      <div className={`h-2.5 w-full rounded-full overflow-hidden border transition-colors ${isDark ? 'bg-[#101922] border-white/5' : 'bg-slate-100 border-black/5'}`}>
        <div className={`h-full ${color} transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(19,127,236,0.3)]`} style={{ width: `${width}%` }}></div>
      </div>
    </div>
  );
};

const SideSpec = ({ icon, label, value, isDark }) => (
  <div className={`flex items-center justify-between p-4 rounded-xl border group transition-all hover:border-[#137fec]/50 ${isDark ? 'bg-[#101922]/50 border-[#233648]' : 'bg-slate-50 border-slate-200'}`}>
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-[#137fec]/10 text-[#137fec] group-hover:bg-[#137fec] group-hover:text-white transition-all"><span className="material-symbols-outlined text-xl block">{icon}</span></div>
      <span className="text-xs font-bold text-slate-500 dark:text-[#92adc9]">{label}</span>
    </div>
    <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</span>
  </div>
);

const InputField = ({ label, name, value, onChange, icon }) => (
  <div className="relative group">
    <label className="text-[10px] font-black text-slate-400 dark:text-[#92adc9] uppercase mb-1 block tracking-widest opacity-60">
      <span className="material-symbols-outlined text-[12px] align-middle mr-1">{icon}</span> {label}
    </label>
    <input type="number" step="any" className="w-full bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-[#233648] rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-[#137fec] transition-all shadow-sm" value={value} onChange={(e) => onChange(prev => ({ ...prev, [name]: parseFloat(e.target.value) || 0 }))} />
  </div>
);

const AmenityGroup = ({ label, countName, distName, data, onChange, icon }) => (
  <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-[#233648] transition-colors">
    <div className="flex items-center gap-2 mb-3">
      <span className="material-symbols-outlined text-[#137fec] text-sm">{icon}</span>
      <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-white">{label}</span>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <InputField label="Count" name={countName} value={data[countName]} onChange={onChange} icon="list" />
      <InputField label="Dist" name={distName} value={data[distName]} onChange={onChange} icon="straighten" />
    </div>
  </div>
);

export default Dashboard;