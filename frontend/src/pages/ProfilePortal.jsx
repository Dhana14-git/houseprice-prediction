import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ProfilePortal = ({ theme, toggleTheme }) => {
    const navigate = useNavigate();
    const reportRef = useRef(null); // Reference for PDF capture
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    
    // States for Report and View Management
    const [selectedReport, setSelectedReport] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'report'

    // States for Deletion and Messaging
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
    const [message, setMessage] = useState({ text: '', type: '' });
    
    const [profile, setProfile] = useState({
        fullName: '', email: '', avatar: "", bio: "", phoneNumber: "",
        currentPassword: '', newPassword: ''
    });

    useEffect(() => {
        const fetchUserData = async () => {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');
            
            if (!userId || userId === "undefined" || !token) {
                navigate('/auth');
                return;
            }

            try {
                const config = { headers: { 'Authorization': `Bearer ${token}` } };
                
                // Fetch Profile and History simultaneously
                const userRes = await axios.get(`https://houseprice-prediction-1-0dif.onrender.com/api/users/${userId}`, config);
                const historyRes = await axios.get(`https://houseprice-prediction-1-0dif.onrender.com/api/predictions/history/${userId}`, config);

                if (userRes.data) {
                    setProfile({
                        fullName: userRes.data.fullName || 'User',
                        email: userRes.data.email || '',
                        bio: userRes.data.bio || "",
                        phoneNumber: userRes.data.phoneNumber || "",
                        avatar: userRes.data.avatar || `https://ui-avatars.com/api/?name=${userRes.data.fullName || 'User'}&background=137fec&color=fff`,
                        currentPassword: '',
                        newPassword: ''
                    });
                }
                // Sync History (Filtered to Saved items for this specific portal)
                setPredictions(historyRes.data.filter(p => p.isSaved) || []);
                setLoading(false);
            } catch (err) {
                console.error("Identity Sync Error:", err);
                setLoading(false);
            }
        };
        fetchUserData();
    }, [navigate]);

    // PDF GENERATION LOGIC
    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;
        const element = reportRef.current;
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`EstatePredict_Valuation_${selectedReport._id.substring(0, 8)}.pdf`);
    };

    const handleLogout = async () => {
        const userId = localStorage.getItem('userId');
        try {
            await axios.delete(`https://houseprice-prediction-1-0dif.onrender.com/api/predictions/cleanup/${userId}`);
        } catch (err) {
            console.error("Cleanup failed:", err);
        }
        localStorage.clear();
        navigate('/auth');
    };

    const handleUpdateProfile = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };

            const updateData = {
                fullName: profile.fullName,
                avatar: profile.avatar,
                bio: profile.bio || "",
                phoneNumber: profile.phoneNumber || ""
            };

            await axios.put(`https://houseprice-prediction-1-0dif.onrender.com/api/users/update/${userId}`, updateData, config);
            setIsEditing(false);
            setMessage({ text: 'Identity updated successfully!', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (err) {
            setMessage({ text: 'Update failed', type: 'error' });
        }
    };

    const handlePasswordReset = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };

            await axios.put(`https://houseprice-prediction-1-0dif.onrender.com/api/users/update/${userId}`, {
                currentPassword: profile.currentPassword,
                newPassword: profile.newPassword
            }, config);
            setShowResetModal(false);
            setProfile(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
            setMessage({ text: 'Security credentials updated!', type: 'success' });
        } catch (err) {
            setMessage({ text: 'Verification failed', type: 'error' });
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setProfile({ ...profile, avatar: reader.result });
        reader.readAsDataURL(file);
    };

    const confirmDelete = (id) => {
        setDeleteModal({ show: true, id });
    };

    const executeDelete = async () => {
        try {
            await axios.delete(`https://houseprice-prediction-1-0dif.onrender.com/api/predictions/${deleteModal.id}`);
            setPredictions(predictions.filter(p => p._id !== deleteModal.id));
            setDeleteModal({ show: false, id: null });
            setMessage({ text: 'Valuation removed from archive', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (err) {
            console.error("Delete failed", err);
            setMessage({ text: 'Action failed: Route not found (404)', type: 'error' });
        }
    };

    const filteredPredictions = predictions.filter(p => 
        p.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalValue = predictions.reduce((acc, curr) => acc + (curr.predictedValue || 0), 0);
    const avgValue = predictions.length > 0 ? totalValue / predictions.length : 0;

    if (loading) return (
        <div className="min-h-screen bg-[#101922] flex items-center justify-center text-white font-['Manrope']">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Syncing identity...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922] text-slate-900 dark:text-white font-['Manrope'] transition-colors duration-500 overflow-x-hidden">
            
            <header className="flex items-center justify-between border-b border-slate-200 dark:border-[#233648] px-6 md:px-10 py-3 bg-white/80 dark:bg-[#101922]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="size-6 text-[#137fec]">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z" fill="currentColor" /></svg>
                    </div>
                    <h2 className="text-slate-900 dark:text-white text-lg font-black tracking-tight leading-tight">EstatePredict</h2>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-100 dark:bg-[#233648] border border-slate-200 dark:border-transparent transition-all">
                        <span className="material-symbols-outlined text-[20px] text-slate-600 dark:text-slate-300">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all">
                        <span className="material-symbols-outlined text-lg">logout</span> Logout
                    </button>
                    <div className="size-9 rounded-full border-2 border-[#137fec]/20 bg-cover bg-center" style={{ backgroundImage: `url(${profile.avatar})` }} />
                </div>
            </header>

            <main className="max-w-[1200px] mx-auto px-6 py-12 flex flex-col gap-10">
                {message.text && (
                    <div className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {message.text}
                    </div>
                )}
                
                {viewMode === 'grid' ? (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                            <div className="flex flex-col gap-2">
                                <h1 className="text-slate-900 dark:text-white text-4xl font-black tracking-tight leading-none font-['Manrope']">Saved Predictions History</h1>
                                <p className="text-slate-500 dark:text-[#92adc9] text-lg font-medium opacity-80 font-['Manrope']">Manage and review your previous real estate price estimates.</p>
                            </div>
                            <button onClick={() => navigate('/dashboard')} className="bg-[#137fec] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 font-['Manrope']">
                                New Prediction <span className="material-symbols-outlined text-sm">add</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard title="Total Predictions" value={predictions.length} icon="analytics" color="text-[#137fec]" />
                            <StatCard title="Avg. Estimated Value" value={`¥${Math.round(avgValue).toLocaleString()}`} icon="payments" color="text-[#137fec]" />
                            <StatCard title="Market Upswing" value="+12.4%" icon="trending_up" color="text-green-500" />
                            <StatCard title="Favorites" value={predictions.length} icon="bookmark" color="text-orange-400" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-1 space-y-4">
                                <section className="bg-white dark:bg-[#1a2632] rounded-2xl border border-slate-200 dark:border-[#324d67] p-6 shadow-sm">
                                    <div className="flex flex-col items-center gap-6 mb-8 text-center">
                                        <div className="relative group">
                                            <div className="size-28 rounded-full border-4 border-[#137fec]/10 bg-cover bg-center shadow-lg transition-transform group-hover:scale-105" style={{ backgroundImage: `url(${profile.avatar})` }} />
                                            <label className="absolute bottom-1 right-1 bg-[#137fec] text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-[#1a2632] cursor-pointer hover:scale-110 transition-all">
                                                <span className="material-symbols-outlined text-sm">photo_camera</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                            </label>
                                        </div>
                                        <div>
                                            <h3 className="text-slate-900 dark:text-white font-black text-xl font-['Manrope'] tracking-tight leading-none">{profile.fullName}</h3>
                                            <p className="text-[#92adc9] text-[9px] uppercase font-black tracking-[0.2em] mt-2">Verified Analyst</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button onClick={() => setIsEditing(true)} className="w-full py-4 bg-[#137fec] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Edit Details</button>
                                        <button onClick={() => setShowResetModal(true)} className="w-full py-4 text-[10px] font-black uppercase text-slate-400 dark:text-[#92adc9] border border-slate-200 dark:border-[#324d67] rounded-xl hover:bg-slate-50 dark:hover:bg-[#233648] transition-colors">Reset Security</button>
                                    </div>
                                </section>
                            </div>

                            <div className="lg:col-span-3 space-y-6">
                                {!isEditing ? (
                                    <div className="bg-white dark:bg-[#1a2632] rounded-[2rem] border border-slate-200 dark:border-[#324d67] p-10 shadow-sm animate-in fade-in duration-500 font-['Manrope']">
                                        <h2 className="text-[10px] font-black text-[#137fec] uppercase tracking-[0.3em] mb-8">Account Credentials</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <DetailItem label="Legal Full Name" value={profile.fullName} />
                                            <DetailItem label="Primary Email" value={profile.email} />
                                            <DetailItem label="Contact Phone" value={profile.phoneNumber || "---"} />
                                            <DetailItem label="Professional Bio" value={profile.bio || "No summary provided."} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white dark:bg-[#1a2632] rounded-[2rem] border-2 border-[#137fec] p-10 shadow-2xl animate-in slide-in-from-right-4 font-['Manrope']">
                                        <h2 className="text-[10px] font-black text-[#137fec] uppercase tracking-[0.3em] mb-8">Modifying Identity</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <EditField label="Full Name" value={profile.fullName} onChange={(val)=>setProfile({...profile, fullName: val})} />
                                            <EditField label="Phone Number" value={profile.phoneNumber} onChange={(val)=>setProfile({...profile, phoneNumber: val})} placeholder="+91..." />
                                            <div className="md:col-span-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bio (Optional)</label>
                                                <textarea className="w-full bg-slate-50 dark:bg-[#233648] border-none rounded-xl p-4 text-sm font-bold h-24 mt-2 font-['Manrope'] focus:ring-1 focus:ring-[#137fec] outline-none" value={profile.bio} onChange={(e)=>setProfile({...profile, bio: e.target.value})} />
                                            </div>
                                        </div>
                                        <div className="mt-8 flex justify-end gap-3">
                                            <button onClick={()=>setIsEditing(false)} className="px-6 py-3 text-[10px] font-black uppercase text-slate-400">Cancel</button>
                                            <button onClick={handleUpdateProfile} className="px-10 py-3 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Save Profile</button>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-100 dark:bg-[#1a2632] p-4 rounded-xl border border-slate-200 dark:border-[#324d67] font-['Manrope']">
                                        <div className="relative flex-1 min-w-[300px]">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#92adc9] text-lg">search</span>
                                            <input type="text" placeholder="Filter by address or zip code..." className="w-full bg-white dark:bg-[#233648] border-none rounded-lg py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#137fec]/50 outline-none placeholder:text-slate-400 dark:placeholder:text-[#92adc9]" onChange={(e) => setSearchTerm(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {filteredPredictions.length > 0 ? (
                                            filteredPredictions.map(pred => (
                                                <PredictionCard 
                                                    key={pred._id} 
                                                    data={pred} 
                                                    onDelete={() => confirmDelete(pred._id)} 
                                                    onReport={() => {
                                                        setSelectedReport(pred);
                                                        setViewMode('report');
                                                    }}
                                                />
                                            ))
                                        ) : (
                                            <div className="md:col-span-2 py-20 text-center opacity-40">
                                                <span className="material-symbols-outlined text-6xl mb-4">bookmark_border</span>
                                                <p className="text-lg font-bold">No saved predictions found.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    // SHOW REPORT VIEW
                    <div ref={reportRef}>
                        <ValuationReport 
                            data={selectedReport} 
                            theme={theme}
                            onBack={() => setViewMode('grid')} 
                            onDownload={handleDownloadPDF}
                        />
                    </div>
                )}
            </main>

            {/* SECURITY RESET MODAL */}
            {showResetModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#101922]/90 backdrop-blur-md p-6 font-['Manrope']">
                    <div className="w-full max-w-md bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-[#324d67] rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-black tracking-tight">Security</h2>
                            <button onClick={() => setShowResetModal(false)} className="text-slate-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="space-y-4">
                            <input type="password" placeholder="Current Password" className="w-full bg-slate-50 dark:bg-[#101922] border border-slate-200 dark:border-[#324d67] rounded-xl p-4 text-sm font-bold outline-none focus:ring-1 focus:ring-[#137fec]" value={profile.currentPassword} onChange={(e)=>setProfile({...profile, currentPassword: e.target.value})} />
                            <input type="password" placeholder="New Password" className="w-full bg-slate-50 dark:bg-[#101922] border border-slate-200 dark:border-[#324d67] rounded-xl p-4 text-sm font-bold outline-none focus:ring-1 focus:ring-[#137fec]" value={profile.newPassword} onChange={(e)=>setProfile({...profile, newPassword: e.target.value})} />
                            <button onClick={handlePasswordReset} className="w-full py-4 bg-[#137fec] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl mt-4">Confirm Reset</button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {deleteModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#101922]/90 backdrop-blur-md p-6 font-['Manrope']">
                    <div className="w-full max-w-sm bg-white dark:bg-[#1a2632] border border-red-500/20 rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 text-center">
                        <div className="size-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-3xl">warning</span>
                        </div>
                        <h2 className="text-xl font-black mb-2 tracking-tight">Confirm Deletion</h2>
                        <p className="text-slate-500 dark:text-[#92adc9] text-sm mb-8 leading-relaxed">Are you sure you want to permanently remove this valuation? This action cannot be undone.</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setDeleteModal({ show: false, id: null })} className="py-3 text-[10px] font-black uppercase text-slate-400 bg-slate-100 dark:bg-[#233648] rounded-xl">Cancel</button>
                            <button onClick={executeDelete} className="py-3 text-[10px] font-black uppercase text-white bg-red-500 rounded-xl shadow-lg shadow-red-500/20">Delete Forever</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* --- Visual Helpers & Sub-Components --- */

const ValuationReport = ({ data, theme, onBack, onDownload }) => {
    if (!data) return null;

    // RENDERING FIX: Use smart fallback for nested inputs vs flattened data
    // This solves the 0 / N/A issue
    const inputs = data.inputs || data.inputData || data;
    const coordinates = data.inputs?.location?.coordinates;

    return (
        <div className="bg-white dark:bg-[#1a2632] rounded-[2rem] border border-slate-200 dark:border-[#324d67] p-10 shadow-2xl font-['Manrope'] transition-all duration-500">

            {/* ================= HEADER ================= */}
            <div className="flex justify-between items-start mb-12 pb-8 border-b border-slate-200 dark:border-[#233648]">
                <div>
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-[#137fec] font-black text-[10px] uppercase tracking-widest mb-6"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to History
                    </button>

                    <h2 className="text-4xl font-black tracking-tight mb-2">
                        {data.address?.split(',')[0] || "Property Report"}
                    </h2>

                    <p className="text-slate-500 text-sm">
                        Valuation ID: {data._id}
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        Final Valuation
                    </p>
                    <p className="text-[#137fec] text-5xl font-black tracking-tight">
                        ¥{data.predictedValue?.toLocaleString() || "--"}
                    </p>
                </div>
            </div>

            {/* ================= BODY ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* ================= LEFT SIDE ================= */}
                <div className="lg:col-span-2 space-y-10">

                    {/* ===== PREMIUM MAP ===== */}
                    <div className="relative h-80 w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-[#324d67]">

                        {coordinates ? (
                            <>
                                <iframe
                                    title="Property Location"
                                    className="w-full h-full"
                                    loading="lazy"
                                    style={{
                                        border: 0,
                                        filter: theme === 'dark'
                                            ? 'invert(90%) hue-rotate(180deg)'
                                            : 'none'
                                    }}
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                                        coordinates[0] - 0.01
                                    }%2C${
                                        coordinates[1] - 0.01
                                    }%2C${
                                        coordinates[0] + 0.01
                                    }%2C${
                                        coordinates[1] + 0.01
                                    }&layer=mapnik&marker=${
                                        coordinates[1]
                                    }%2C${
                                        coordinates[0]
                                    }`}
                                />
                                <div className="absolute bottom-6 left-6 bg-white/95 dark:bg-[#1a2632]/95 backdrop-blur-xl px-6 py-3 rounded-2xl shadow-xl border border-slate-200 dark:border-[#324d67] flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[#137fec]">location_on</span>
                                    <span className="text-sm font-semibold truncate max-w-[280px]">{data.address}</span>
                                </div>
                            </>
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-slate-200 dark:bg-[#233648]">
                                <span className="material-symbols-outlined text-6xl opacity-20">map</span>
                            </div>
                        )}
                    </div>

                    {/* ===== INPUT PARAMETERS - ML SERVICE COLUMNS ===== */}
                    <div>
                        <h3 className="text-[10px] font-black text-[#137fec] uppercase tracking-[0.4em] mb-10">
                            ML Analysis Features
                        </h3>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-14 gap-x-12">
                            <DetailItem label="Total Rooms" value={inputs?.RmNum ?? "--"} />
                            <DetailItem label="Hall Number" value={inputs?.HllNum ?? "--"} />
                            <DetailItem label="Kitchen Number" value={inputs?.KchNum ?? "--"} />
                            <DetailItem label="Bathroom Number" value={inputs?.BthNum ?? "--"} />
                            <DetailItem label="Floor Level" value={inputs?.Floor ?? "--"} />
                            <DetailItem label="Build Year" value={inputs?.Year ?? "N/A"} />
                            <DetailItem label="Subway Distance" value={`${inputs?.SubwayDst ?? "--"} m`} />
                            <DetailItem label="Total Area" value={`${inputs?.Area ?? "--"} sqft`} />
                        </div>
                    </div>

                </div>

                {/* ================= RIGHT SIDE ================= */}
                <div>
                    <div className="bg-gradient-to-br from-[#137fec]/10 to-transparent dark:from-[#137fec]/20 p-12 rounded-3xl border border-slate-200 dark:border-[#324d67] text-center shadow-xl">

                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">
                            Analysis Summary
                        </h3>

                        <div className="mb-10">
                            <p className="text-6xl font-black text-green-500 tracking-tight">
                                90.5%
                            </p>
                            <p className="text-xs font-bold text-slate-400 uppercase mt-3">Accuracy Reliability</p>
                        </div>

                        <button
                            onClick={onDownload}
                            className="w-full py-5 bg-[#137fec] hover:bg-[#137fec]/90 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl transition-all duration-200 hover:scale-[1.03]"
                        >
                            Download PDF Report
                        </button>

                    </div>
                </div>

            </div>
        </div>
    );
};


const DetailItem = ({ label, value }) => (
    <div className="space-y-2">
        <p className="text-[10px] font-black text-[#137fec] uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
    </div>
);


const EditField = ({ label, value, onChange, placeholder }) => (
    <div className="space-y-2 font-['Manrope']">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <input className="w-full bg-slate-50 dark:bg-[#233648] border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#137fec] outline-none" value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder} />
    </div>
);

const StatCard = ({ title, value, icon, color }) => (
    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-[#324d67] shadow-sm font-['Manrope'] transition-all hover:border-primary/20">
        <div className={`flex items-center gap-2 ${color}`}>
            <span className="material-symbols-outlined text-xl">{icon}</span>
            <p className="text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest">{title}</p>
        </div>
        <p className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">{value}</p>
    </div>
);

const PredictionCard = ({ data, onDelete, onReport }) => (
    <div className="group bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-[#324d67] rounded-2xl overflow-hidden hover:border-[#137fec]/40 transition-all shadow-sm font-['Manrope']">
        <div className="h-40 w-full relative bg-slate-200 dark:bg-[#233648] overflow-hidden flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl opacity-20">map</span>
            <div className="absolute top-3 right-3">
                <span className="bg-[#137fec] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Saved</span>
            </div>
        </div>
        <div className="p-5 space-y-4">
            <div>
                <h3 className="text-slate-900 dark:text-white font-bold text-lg truncate tracking-tight group-hover:text-[#137fec] transition-colors">{data.address?.split(',')[0]}</h3>
                <p className="text-slate-500 dark:text-[#92adc9] text-[11px] font-bold truncate mt-0.5">📍 {data.address}</p>
            </div>
            
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-slate-400 dark:text-[#92adc9] text-[9px] font-black uppercase tracking-widest">Market Value</span>
                    <span className="text-[#137fec] text-xl font-black tracking-tighter">¥{data.predictedValue?.toLocaleString()}</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                        <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                    <button onClick={onReport} className="px-4 py-2 bg-[#137fec]/10 text-[#137fec] hover:bg-[#137fec] hover:text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all">Report</button>
                </div>
            </div>
        </div>
    </div>
);

export default ProfilePortal;