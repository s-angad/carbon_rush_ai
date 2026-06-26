"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Search, Filter, ShieldCheck, MapPin, Building2, CheckCircle2, Star, Clock, X, ExternalLink, Users } from "lucide-react";

export default function NgoDirectoryPage() {
  const [ngos, setNgos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("All");
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("rating");

  // Modal
  const [selectedNgo, setSelectedNgo] = useState<any | null>(null);
  const [ngoPastProjects, setNgoPastProjects] = useState<any[]>([]);
  const [ngoReviews, setNgoReviews] = useState<any[]>([]);
  const [loadingModalData, setLoadingModalData] = useState(false);

  useEffect(() => {
    fetchNgos();
  }, []);

  const fetchNgos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ngo_profiles')
        .select('*')
        .eq('is_platform_approved', true);
      
      if (error) throw error;
      setNgos(data || []);
    } catch (err) {
      console.error("Failed to fetch NGOs", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchModalData = async (ngoId: string) => {
    setLoadingModalData(true);
    try {
      // Fetch past projects
      const { data: assignments, error: assignmentsError } = await supabase
        .from('verification_assignments')
        .select(`
          id,
          status,
          completed_at:updated_at,
          land_listings(title, district, state, estimated_carbon_tons)
        `)
        .eq('ngo_id', ngoId)
        .eq('status', 'completed')
        .order('updated_at', { ascending: false })
        .limit(5);

      if (assignmentsError) throw assignmentsError;
      setNgoPastProjects(assignments || []);

      // Fetch reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from('ngo_reviews')
        .select(`
          id,
          rating,
          review_text,
          created_at,
          profiles!company_id(organization_name)
        `)
        .eq('ngo_profile_id', ngoId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      setNgoReviews(reviews || []);

    } catch (err: any) {
      console.error("Failed to fetch modal data:", err?.message || err?.details || err);
    } finally {
      setLoadingModalData(false);
    }
  };

  const handleOpenModal = (ngo: any) => {
    setSelectedNgo(ngo);
    fetchModalData(ngo.id);
  };

  const uniqueStates = ["All", ...Array.from(new Set(ngos.map(n => n.state)))];
  const specializations = ["mangrove", "wetland", "forest", "seagrass"];

  const toggleSpecialization = (spec: string) => {
    if (selectedSpecializations.includes(spec)) setSelectedSpecializations(selectedSpecializations.filter(s => s !== spec));
    else setSelectedSpecializations([...selectedSpecializations, spec]);
  };

  const filteredNgos = ngos.filter(ngo => {
    const matchSearch = ngo.org_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchState = selectedState === "All" || ngo.state === selectedState;
    const matchSpec = selectedSpecializations.length === 0 || 
                      (ngo.specialization && selectedSpecializations.some(s => ngo.specialization.includes(s)));
    return matchSearch && matchState && matchSpec;
  }).sort((a, b) => {
    if (sortBy === "rating") return (b.success_rate || 0) - (a.success_rate || 0); // using success rate as proxy for rating in directory view
    if (sortBy === "projects") return (b.verified_projects_count || 0) - (a.verified_projects_count || 0);
    if (sortBy === "speed") return (a.avg_turnaround_days || 999) - (b.avg_turnaround_days || 999);
    return 0;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Verified NGO Directory</h1>
        <p className="text-sm text-gray-500 mt-1">Find and partner with accredited NGOs to verify your carbon projects.</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 flex-1">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by organization name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none flex-1"
            />
          </div>
          <select value={selectedState} onChange={e => setSelectedState(e.target.value)} className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm outline-none">
            {uniqueStates.map(s => <option key={s} value={s}>{s === "All" ? "All States" : s}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm outline-none">
            <option value="rating">Sort: Highest Rating</option>
            <option value="projects">Sort: Most Projects</option>
            <option value="speed">Sort: Fastest Turnaround</option>
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 mr-2" />
          {specializations.map((s) => (
            <button
              key={s}
              onClick={() => toggleSpecialization(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                selectedSpecializations.includes(s) ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : filteredNgos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-semibold text-gray-900">No NGOs found</p>
          <p className="text-sm text-gray-500 mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNgos.map(ngo => (
            <motion.div key={ngo.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold uppercase tracking-wider rounded-lg">
                  {ngo.org_type.replace('_', ' ')}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{ngo.org_name}</h3>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1 mb-4">
                <MapPin className="w-4 h-4" /> {ngo.district}, {ngo.state}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-5">
                {ngo.specialization?.map((spec: string) => (
                  <span key={spec} className="px-2 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs rounded-md capitalize">
                    {spec}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 mb-5 py-4 border-y border-gray-50">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-emerald-600 font-semibold mb-0.5">
                    <CheckCircle2 className="w-4 h-4" /> {ngo.verified_projects_count}
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Projects</p>
                </div>
                <div className="text-center border-x border-gray-100">
                  <div className="flex items-center justify-center gap-1 text-amber-500 font-semibold mb-0.5">
                    <Star className="w-4 h-4 fill-current" /> {ngo.success_rate || 4.5}
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Rating</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-600 font-semibold mb-0.5">
                    <Clock className="w-4 h-4" /> {ngo.avg_turnaround_days}
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Days Avg</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2 flex-1 mb-5">{ngo.description}</p>

              <button onClick={() => handleOpenModal(ngo)} className="w-full py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                View Profile
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedNgo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedNgo(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-indigo-50/30">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedNgo.org_name}</h2>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                    <span className="uppercase tracking-wider font-medium text-indigo-700 text-xs bg-indigo-50 px-2 py-0.5 rounded">{selectedNgo.org_type.replace('_', ' ')}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {selectedNgo.district}, {selectedNgo.state}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedNgo(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              <section>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">About the Organization</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{selectedNgo.description}</p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="block text-xs text-gray-500 mb-1">Registration No.</span>
                    <span className="text-sm font-medium text-gray-900">{selectedNgo.registration_number || 'N/A'}</span>
                  </div>
                  {selectedNgo.website_url && (
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="block text-xs text-gray-500 mb-1">Website</span>
                        <span className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">
                          {(() => {
                            try {
                              const url = selectedNgo.website_url.startsWith("http") 
                                ? selectedNgo.website_url 
                                : `https://${selectedNgo.website_url}`;
                              return new URL(url).hostname;
                            } catch {
                              return selectedNgo.website_url;
                            }
                          })()}
                        </span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Contact Information</h3>
                <div className="flex items-center gap-6 text-sm text-gray-700">
                  <span className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">{selectedNgo.contact_email}</span>
                  <span className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">{selectedNgo.contact_phone}</span>
                </div>
              </section>

              {loadingModalData ? (
                <div className="py-10 flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div></div>
              ) : (
                <>
                  {ngoPastProjects.length > 0 && (
                    <section>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Past Verified Projects</h3>
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                            <tr>
                              <th className="py-3 px-4 font-medium">Project</th>
                              <th className="py-3 px-4 font-medium">Location</th>
                              <th className="py-3 px-4 font-medium">Carbon (Est.)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {ngoPastProjects.map(p => (
                              <tr key={p.id} className="bg-white">
                                <td className="py-3 px-4 font-medium text-gray-900">{p.land_listings?.title}</td>
                                <td className="py-3 px-4 text-gray-500">{p.land_listings?.district}, {p.land_listings?.state}</td>
                                <td className="py-3 px-4 text-emerald-600 font-medium">{p.land_listings?.estimated_carbon_tons || 'N/A'} tCO₂</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}

                  {ngoReviews.length > 0 && (
                    <section>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Company Reviews</h3>
                      <div className="space-y-4">
                        {ngoReviews.map(r => (
                          <div key={r.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900 text-sm flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" /> 
                                {r.profiles?.organization_name || "Corporate Buyer"}
                              </span>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'text-amber-400 fill-current' : 'text-gray-300'}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">{r.review_text}</p>
                            <p className="text-xs text-gray-400 mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <button onClick={() => setSelectedNgo(null)} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50">Close</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
