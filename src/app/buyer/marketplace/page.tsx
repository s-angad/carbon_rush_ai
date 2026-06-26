"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Leaf, MapPin, Waves, Trees, Droplets, Wind, Search, Filter, Calendar, FileText, Loader2, CheckCircle2, ArrowRight, ShieldCheck, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

const getEcosystemIcon = (type: string, className = "w-5 h-5") => {
  switch (type.toLowerCase()) {
    case 'mangrove': return <Leaf className={className} />;
    case 'wetland': return <Waves className={className} />;
    case 'forest': return <Trees className={className} />;
    case 'seagrass': return <Wind className={className} />;
    case 'saltmarsh': return <Droplets className={className} />;
    default: return <Leaf className={className} />;
  }
};

export default function BuyerMarketplacePage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [ngos, setNgos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState("All");
  const [minArea, setMinArea] = useState("");
  const [maxArea, setMaxArea] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Booking Modal
  const [buyModal, setBuyModal] = useState<string | null>(null);
  const [selectedNgo, setSelectedNgo] = useState("");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  const fetchMarketplaceData = async () => {
    setLoading(true);
    try {
      // Fetch listings that are 'listed', join with profiles for farmer name
      const { data: listingsData, error: lError } = await supabase
        .from('land_listings')
        .select(`
          *,
          profiles!grower_id (full_name)
        `)
        .eq('status', 'listed');

      if (lError) throw lError;
      setListings(listingsData || []);

      // Fetch NGOs for the booking modal dropdown
      const { data: ngoData, error: nError } = await supabase
        .from('ngo_profiles')
        .select('*')
        .eq('is_platform_approved', true);
      
      if (nError) throw nError;
      setNgos(ngoData || []);
    } catch (err: any) {
      console.error("Failed to load marketplace:", err?.message || err?.details || err);
    } finally {
      setLoading(false);
    }
  };

  const ecosystemTypes = ["mangrove", "wetland", "seagrass", "forest", "grassland", "saltmarsh"];
  const uniqueStates = ["All", ...Array.from(new Set(listings.map(l => l.state)))];

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) setSelectedTypes(selectedTypes.filter(t => t !== type));
    else setSelectedTypes([...selectedTypes, type]);
  };

  // Filtering
  const filteredListings = listings.filter(l => {
    const matchSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        l.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchState = selectedState === "All" || l.state === selectedState;
    const matchType = selectedTypes.length === 0 || selectedTypes.includes(l.ecosystem_type.toLowerCase());
    const matchMinArea = minArea === "" || parseFloat(l.area_hectares) >= parseFloat(minArea);
    const matchMaxArea = maxArea === "" || parseFloat(l.area_hectares) <= parseFloat(maxArea);
    
    return matchSearch && matchState && matchType && matchMinArea && matchMaxArea;
  }).sort((a, b) => {
    if (sortBy === "largest") return parseFloat(b.area_hectares) - parseFloat(a.area_hectares);
    if (sortBy === "carbon") return (b.estimated_carbon_tons || 0) - (a.estimated_carbon_tons || 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // newest
  });

  const selectedListing = buyModal ? listings.find((l) => l.id === buyModal) : null;

  const handleBookProject = async () => {
    if (!user || !selectedListing || !selectedNgo || !deadline) return;
    setBooking(true);
    try {
      // Update listing status
      const { error: updateError } = await supabase
        .from('land_listings')
        .update({ status: 'booked' })
        .eq('id', selectedListing.id);
      
      if (updateError) throw updateError;

      // Insert assignment
      const { error: insertError } = await supabase
        .from('verification_assignments')
        .insert({
          listing_id: selectedListing.id,
          company_id: user.id,
          ngo_id: selectedNgo,
          deadline_date: deadline,
          company_notes: notes
        });

      if (insertError) throw insertError;

      setBooked(true);
      setTimeout(() => {
        setBooked(false);
        setBuyModal(null);
        setSelectedNgo("");
        setDeadline("");
        setNotes("");
        fetchMarketplaceData(); // refresh list
      }, 2000);

    } catch (err) {
      console.error("Booking failed", err);
      alert("Failed to book project. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="p-6 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Carbon Project Marketplace</h1>
        <p className="text-sm text-gray-500 mt-1">Browse active land listings, book projects, and assign verification NGOs.</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 flex-1">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search title, district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none flex-1"
            />
          </div>
          <select value={selectedState} onChange={e => setSelectedState(e.target.value)} className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm outline-none">
            {uniqueStates.map(s => <option key={s} value={s}>{s === "All" ? "All States" : s}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <input type="number" placeholder="Min Ha" value={minArea} onChange={e => setMinArea(e.target.value)} className="w-24 px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none" />
            <span className="text-gray-400">-</span>
            <input type="number" placeholder="Max Ha" value={maxArea} onChange={e => setMaxArea(e.target.value)} className="w-24 px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none" />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm outline-none">
            <option value="newest">Sort: Newest</option>
            <option value="largest">Sort: Largest Area</option>
            <option value="carbon">Sort: Highest Carbon</option>
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 mr-2" />
          {ecosystemTypes.map((t) => (
            <button
              key={t}
              onClick={() => toggleType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                selectedTypes.includes(t) ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : filteredListings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Leaf className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-semibold text-gray-900">No active land listings found</p>
          <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => {
            const farmerName = listing.profiles?.full_name?.split(' ')[0] || "Farmer";
            const estCarbon = listing.estimated_carbon_tons;
            const carbonRange = estCarbon ? `${Math.floor(estCarbon * 0.9)}–${Math.ceil(estCarbon * 1.1)} tons` : "TBD";
            
            return (
              <motion.div
                key={listing.id}
                variants={item}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all flex flex-col"
              >
                {/* Image Thumbnails */}
                <div className="h-40 bg-gray-100 relative flex">
                  {listing.evidence_photo_urls && listing.evidence_photo_urls.length > 0 ? (
                    <>
                      <img src={listing.evidence_photo_urls[0]} alt="Land" className="w-full h-full object-cover" />
                      {listing.evidence_photo_urls.length > 1 && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
                          +{listing.evidence_photo_urls.length - 1} more
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full flex items-center justify-center text-gray-400">No Photos</div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-between">
                     <span className="px-2.5 py-1 rounded-lg bg-blue-500 text-white text-xs font-semibold capitalize flex items-center gap-1.5 shadow-sm">
                      {getEcosystemIcon(listing.ecosystem_type, "w-3 h-3")} {listing.ecosystem_type}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{listing.title}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {listing.district}, {listing.state}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-0.5">Area</p>
                      <p className="text-sm font-semibold text-gray-900">{listing.area_hectares} Ha</p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <p className="text-xs text-blue-600 mb-0.5">Est. Carbon</p>
                      <p className="text-sm font-semibold text-blue-900">{carbonRange}</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">By {farmerName}</span>
                    <button
                      onClick={() => setBuyModal(listing.id)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                    >
                      Book Project <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Booking Modal */}
      {buyModal && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !booking && setBuyModal(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <button onClick={() => setBuyModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1">
              <X className="w-5 h-5" />
            </button>

            {booked ? (
              <div className="text-center py-12">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                  <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Project Booked!</h3>
                <p className="text-gray-500">The assigned NGO has been notified to begin verification.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Confirm Booking</h3>
                  <p className="text-sm text-gray-500 mt-1">Assign an NGO to verify this land and mint credits.</p>
                </div>

                {/* Project Summary */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 flex-shrink-0">
                    {getEcosystemIcon(selectedListing.ecosystem_type, "w-6 h-6")}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedListing.title}</h4>
                    <p className="text-sm text-gray-500 mt-0.5">{selectedListing.area_hectares} Ha • {selectedListing.district}, {selectedListing.state}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> Select Verifier NGO
                    </label>
                    <select 
                      required 
                      value={selectedNgo} 
                      onChange={e => setSelectedNgo(e.target.value)} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="">-- Choose an approved NGO --</option>
                      {ngos.map(ngo => (
                        <option key={ngo.id} value={ngo.id}>{ngo.org_name} ({ngo.state})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" /> Deadline Date
                    </label>
                    <input 
                      type="date" 
                      required 
                      value={deadline} 
                      onChange={e => setDeadline(e.target.value)} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-600" /> Instructions for NGO (Optional)
                    </label>
                    <textarea 
                      rows={3} 
                      value={notes} 
                      onChange={e => setNotes(e.target.value)} 
                      placeholder="e.g. Please pay special attention to the mangrove density on the northern border."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={handleBookProject} 
                    disabled={booking || !selectedNgo || !deadline}
                    className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {booking ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Booking"}
                  </button>
                  <p className="text-xs text-center text-gray-400 mt-3">You won't be charged until the verification is successful.</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
