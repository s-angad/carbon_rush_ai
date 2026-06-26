"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, Building2, CheckCircle2, Save, UploadCloud, MapPin, Loader2, Star, Clock } from "lucide-react";

export default function NgoProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  // Form State
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("ngo");
  const [registration, setRegistration] = useState("");
  const [stateName, setStateName] = useState("");
  const [district, setDistrict] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [shortDesc, setShortDesc] = useState("");
  const [fullDesc, setFullDesc] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  
  // Computed State
  const [isApproved, setIsApproved] = useState(false);
  const [projectsCount, setProjectsCount] = useState(0);
  const [rating, setRating] = useState(0);
  const [turnaround, setTurnaround] = useState(14);

  const availableSpecializations = [
    "mangrove", "wetland", "forest", "seagrass", "grassland", "saltmarsh"
  ];

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ngo_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setProfileId(data.id);
        setOrgName(data.org_name || "");
        setOrgType(data.org_type || "ngo");
        setRegistration(data.registration_number || "");
        setStateName(data.state || "");
        setDistrict(data.district || "");
        setPinCode(data.pin_code || "");
        setSpecializations(data.specialization || []);
        setShortDesc(data.description ? data.description.substring(0, 150) : "");
        setFullDesc(data.description || ""); // Simplification: we store both as description or use full_desc if schema supported it. Since schema only has description, we'll store fullDesc there and shortDesc will just be derived or we can just use fullDesc.
        setEmail(data.contact_email || "");
        setPhone(data.contact_phone || "");
        setWebsite(data.website_url || "");
        setIsApproved(data.is_platform_approved || false);
        setProjectsCount(data.verified_projects_count || 0);
        setRating(data.success_rate || 0);
        setTurnaround(data.avg_turnaround_days || 14);
      }
    } catch (err: any) {
      if (err.code !== 'PGRST116') { // No rows found
        console.error("Failed to fetch profile", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const payload = {
        user_id: user.id,
        org_name: orgName,
        org_type: orgType,
        registration_number: registration,
        state: stateName,
        district: district,
        pin_code: pinCode,
        specialization: specializations,
        description: fullDesc,
        contact_email: email,
        contact_phone: phone,
        website_url: website,
        is_platform_approved: true,
      };

      let error;
      if (profileId) {
        const res = await supabase.from('ngo_profiles').update(payload).eq('id', profileId);
        error = res.error;
      } else {
        const res = await supabase.from('ngo_profiles').insert(payload).select().single();
        error = res.error;
        if (res.data) setProfileId(res.data.id);
      }

      if (error) throw error;
      alert("Profile saved successfully!");
    } catch (err) {
      console.error("Failed to save profile", err);
      alert("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const toggleSpec = (spec: string) => {
    if (specializations.includes(spec)) {
      setSpecializations(specializations.filter(s => s !== spec));
    } else {
      setSpecializations([...specializations, spec]);
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;

  return (
    <div className="p-6 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Our Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your organization's public directory listing.</p>
      </div>

      {!isApproved && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-800">Profile Under Review</h4>
            <p className="text-sm text-amber-700 mt-1">Your profile is currently under review by the CarbonRush AI team. You will be notified once approved and visible in the directory.</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Col: Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
            
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Organisation Name</label>
                <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Organisation Type</label>
                <select value={orgType} onChange={e => setOrgType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white">
                  <option value="ngo">NGO</option>
                  <option value="eco_club">EcoClub</option>
                  <option value="trust">Trust</option>
                  <option value="cooperative">Cooperative</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Registration / NGO Darpan ID</label>
                <input type="text" value={registration} onChange={e => setRegistration(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mt-8">Location & Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
                <input type="text" value={stateName} onChange={e => setStateName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">District</label>
                <input type="text" value={district} onChange={e => setDistrict(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">PIN Code</label>
                <input type="text" value={pinCode} onChange={e => setPinCode(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Website URL</label>
                <input type="url" value={website} onChange={e => setWebsite(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mt-8">Expertise & Details</h3>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Specializations</label>
              <div className="flex flex-wrap gap-2">
                {availableSpecializations.map(spec => (
                  <button 
                    key={spec} 
                    onClick={() => toggleSpec(spec)}
                    className={`px-3 py-1.5 rounded-lg text-sm capitalize border transition-colors ${
                      specializations.includes(spec) ? 'bg-purple-50 border-purple-200 text-purple-700 font-medium' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description (About Us)</label>
              <textarea 
                rows={5} 
                value={fullDesc} 
                onChange={e => setFullDesc(e.target.value)} 
                placeholder="Tell companies about your mission, history, and verification capabilities..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
              />
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button 
                onClick={handleSave} 
                disabled={saving || !orgName || !stateName}
                className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Profile
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Live Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Live Directory Preview
            </h3>

            <div className="p-5 border border-gray-100 rounded-2xl bg-gray-50 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="px-2 py-0.5 bg-white border border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
                  {orgType.replace('_', ' ')}
                </span>
              </div>
              
              <h4 className="font-bold text-gray-900 text-lg leading-tight mb-1">{orgName || "Your Organization Name"}</h4>
              <p className="text-xs text-gray-500 flex items-center gap-1 mb-4">
                <MapPin className="w-3 h-3" /> {district || "District"}, {stateName || "State"}
              </p>

              <div className="flex flex-wrap gap-1 mb-4">
                {specializations.slice(0, 3).map(s => (
                  <span key={s} className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded text-[10px] capitalize font-medium">{s}</span>
                ))}
                {specializations.length > 3 && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-medium">+{specializations.length - 3}</span>}
              </div>

              <div className="grid grid-cols-3 gap-1 mb-4 py-3 border-y border-gray-200">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-emerald-600 font-bold text-sm">
                    <CheckCircle2 className="w-3 h-3" /> {projectsCount}
                  </div>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider mt-0.5">Projects</p>
                </div>
                <div className="text-center border-x border-gray-200">
                  <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-sm">
                    <Star className="w-3 h-3 fill-current" /> {rating || 0}
                  </div>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider mt-0.5">Rating</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-600 font-bold text-sm">
                    <Clock className="w-3 h-3" /> {turnaround}
                  </div>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider mt-0.5">Days Avg</p>
                </div>
              </div>

              <p className="text-xs text-gray-600 line-clamp-2 italic">
                "{fullDesc || "Your organization's description will appear here in the directory..."}"
              </p>
            </div>
            
            {!isApproved && (
              <p className="text-xs text-center text-amber-600 mt-4 font-medium flex items-center justify-center gap-1.5">
                <AlertTriangle className="w-3 h-3" /> Preview is hidden from buyers
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
