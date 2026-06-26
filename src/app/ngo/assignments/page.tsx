"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ClipboardList, MapPin, Building2, Calendar, FileText, CheckCircle2, XCircle, ArrowRight, Clock, Star, Loader2 } from "lucide-react";

export default function NgoAssignmentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ngoProfileId, setNgoProfileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'in_progress' | 'completed'>('pending');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  const fetchAssignments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Get NGO Profile ID
      const { data: profileData, error: profileError } = await supabase
        .from('ngo_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // No profile yet
          setLoading(false);
          return;
        }
        throw profileError;
      }
      
      setNgoProfileId(profileData.id);

      // 2. Fetch Assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('verification_assignments')
        .select(`
          *,
          land_listings (*),
          profiles!company_id (organization_name),
          ngo_reviews (rating)
        `)
        .eq('ngo_id', profileData.id)
        .order('created_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;
      setAssignments(assignmentsData || []);

    } catch (err: any) {
      console.error("Failed to load assignments:", err?.message || err?.details || err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJob = async (assignment: any) => {
    setProcessing(assignment.id);
    try {
      // Update Assignment
      const { error: updateAssign } = await supabase
        .from('verification_assignments')
        .update({ 
          ngo_accepted: true,
          ngo_accepted_at: new Date().toISOString(),
          status: 'in_progress'
        })
        .eq('id', assignment.id);
      
      if (updateAssign) throw updateAssign;

      // Update Listing
      const { error: updateList } = await supabase
        .from('land_listings')
        .update({ status: 'ngo_assigned' })
        .eq('id', assignment.listing_id);
      
      if (updateList) throw updateList;

      fetchAssignments();
    } catch (err) {
      console.error("Failed to accept job", err);
      alert("Failed to accept job");
    } finally {
      setProcessing(null);
    }
  };

  const handleDeclineJob = async (assignmentId: string) => {
    const confirm = window.confirm("Are you sure you want to decline this verification job? The company will be notified.");
    if (!confirm) return;

    setProcessing(assignmentId);
    try {
      // For decline, we might set status back to 'declined' or just delete the assignment.
      // Assuming we just delete it so company can reassign. Or set status to 'declined' if schema supports. Schema has no 'declined'.
      // We will delete it and set land_listing back to 'listed'.
      
      const { error: deleteAssign } = await supabase
        .from('verification_assignments')
        .delete()
        .eq('id', assignmentId);
      
      if (deleteAssign) throw deleteAssign;

      const { error: updateList } = await supabase
        .from('land_listings')
        .update({ status: 'listed' })
        .eq('id', assignments.find(a => a.id === assignmentId).listing_id);
      
      if (updateList) throw updateList;

      fetchAssignments();
    } catch (err) {
      console.error("Failed to decline", err);
      alert("Failed to decline job");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;

  if (!ngoProfileId) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center bg-white p-8 rounded-3xl border border-gray-200 shadow-sm max-w-md">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Required</h2>
          <p className="text-gray-500 mb-6 text-sm">You need to set up your NGO profile before you can receive verification jobs.</p>
          <button onClick={() => router.push('/ngo/profile')} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold">Go to Profile Setup</button>
        </div>
      </div>
    );
  }

  const pending = assignments.filter(a => !a.ngo_accepted);
  const inProgress = assignments.filter(a => a.ngo_accepted && (a.status === 'in_progress' || a.status === 'report_submitted' || a.status === 'company_reviewed'));
  const completed = assignments.filter(a => a.status === 'completed');

  const getFilteredList = () => {
    if (activeTab === 'pending') return pending;
    if (activeTab === 'in_progress') return inProgress;
    return completed;
  };

  const filteredList = getFilteredList();

  return (
    <div className="p-6 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Verification Jobs</h1>
        <p className="text-sm text-gray-500 mt-1">Manage project assignments from corporate buyers.</p>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'pending' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Pending Acceptance ({pending.length})
        </button>
        <button 
          onClick={() => setActiveTab('in_progress')}
          className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'in_progress' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          In Progress ({inProgress.length})
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'completed' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Completed ({completed.length})
        </button>
      </div>

      {filteredList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-semibold text-gray-900">No {activeTab.replace('_', ' ')} jobs</p>
          <p className="text-sm text-gray-500 mt-1">Check back later for new assignments.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredList.map(job => {
            const listing = job.land_listings;
            const companyName = job.profiles?.organization_name || "Corporate Buyer";
            
            const daysRemaining = Math.ceil((new Date(job.deadline_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
            const isLate = daysRemaining < 0;

            return (
              <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden hover:border-purple-200 transition-colors">
                
                <div className="p-5 border-b border-gray-100 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1.5">
                      <Building2 className="w-3 h-3" /> {companyName}
                    </span>
                    {activeTab !== 'completed' && (
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${isLate ? 'bg-red-100 text-red-700' : daysRemaining <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        <Clock className="w-3 h-3" /> {isLate ? 'OVERDUE' : `${daysRemaining} days left`}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">{listing.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" /> <span className="truncate">{listing.district}, {listing.state}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <p className="text-[10px] uppercase font-bold text-gray-500 mb-0.5">Area</p>
                      <p className="text-sm font-semibold text-gray-900">{listing.area_hectares} Ha</p>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <p className="text-[10px] uppercase font-bold text-gray-500 mb-0.5">Ecosystem</p>
                      <p className="text-sm font-semibold text-gray-900 capitalize">{listing.ecosystem_type}</p>
                    </div>
                  </div>

                  {job.company_notes && (
                    <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl mb-2">
                      <p className="text-[10px] font-bold uppercase text-blue-600 mb-1 flex items-center gap-1.5"><FileText className="w-3 h-3" /> Note from {companyName}</p>
                      <p className="text-sm text-blue-800 italic line-clamp-2">"{job.company_notes}"</p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-50/50 flex flex-col gap-2">
                  {activeTab === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleAcceptJob(job)} 
                        disabled={processing === job.id}
                        className="w-full py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {processing === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Accept Job
                      </button>
                      <button 
                        onClick={() => handleDeclineJob(job.id)} 
                        disabled={processing === job.id}
                        className="w-full py-2.5 bg-white border border-gray-300 text-red-600 text-sm font-bold rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" /> Decline
                      </button>
                    </>
                  )}

                  {activeTab === 'in_progress' && job.status === 'in_progress' && (
                    <button 
                      onClick={() => router.push(`/ngo/verify/${job.id}`)}
                      className="w-full py-3 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                    >
                      Submit Verification Report <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  
                  {activeTab === 'in_progress' && job.status === 'report_submitted' && (
                    <div className="w-full py-3 bg-amber-100 text-amber-700 text-sm font-bold rounded-xl text-center border border-amber-200">
                      Report under Company Review
                    </div>
                  )}

                  {activeTab === 'completed' && (
                    <div className="flex items-center justify-between px-2">
                      <span className="text-sm text-emerald-600 font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Completed</span>
                      {job.ngo_reviews && job.ngo_reviews.length > 0 && (
                        <span className="flex items-center gap-1 text-sm font-bold text-amber-500">
                          <Star className="w-4 h-4 fill-current" /> {job.ngo_reviews[0].rating}/5
                        </span>
                      )}
                    </div>
                  )}
                </div>

              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
