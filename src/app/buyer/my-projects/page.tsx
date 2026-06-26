"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { FolderOpen, MapPin, Building2, Calendar, FileText, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, ShieldAlert, Star, X, UploadCloud, Leaf, Link as LinkIcon, Loader2, ArrowRight, Clock } from "lucide-react";

export default function MyBookedProjectsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Review Modal State
  const [reviewModal, setReviewModal] = useState<string | null>(null); // assignment id
  const [rating, setRating] = useState(5);
  const [accuracy, setAccuracy] = useState(5);
  const [timeliness, setTimeliness] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  const fetchAssignments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('verification_assignments')
        .select(`
          *,
          land_listings (*),
          ngo_profiles (*),
          verification_reports (*)
        `)
        .eq('company_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAssignments(data || []);
      if (data && data.length > 0) {
        setExpandedId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch booked projects", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'report_submitted': return 'bg-amber-100 text-amber-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'disputed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleAction = async (assignmentId: string, action: 'completed' | 'disputed') => {
    try {
      if (action === 'completed') {
        const assignment = assignments.find(a => a.id === assignmentId);
        if (!assignment) return;    
        
        const listing = assignment.land_listings;
        const ngo = assignment.ngo_profiles;
        const report = assignment.verification_reports?.[0];
      
        if (!listing || !ngo) {
          alert("Error: Listing or NGO profile details are missing.");
          return;
        }

        const credits = report?.carbon_estimate_tons || listing?.estimated_carbon_tons || 100;
        const pricePerCredit = 50000; // ₹250 per ton
        const verificationFee = 25000; // ₹25,000 flat NGO fee

        // Call the database function (RPC)
        const { error: rpcError } = await supabase.rpc("complete_verification_payout", {
          p_assignment_id: assignment.id,
          p_buyer_id: user!.id,
          p_grower_id: listing.grower_id,
          p_ngo_id: ngo.user_id, // NGO's auth user_id
          p_credits: parseFloat(credits),
          p_price_per_credit: pricePerCredit,
          p_verification_fee: verificationFee
        });

        if (rpcError) throw rpcError;
        alert("Report Accepted! Carbon Credits have been transferred transactionally, NGO fee paid, and Grower credited.");
      } else {
        const { error } = await supabase
          .from('verification_assignments')
          .update({ status: action })
          .eq('id', assignmentId);
        
        if (error) throw error;
        alert("Report Disputed. The platform administrators will review the case.");
      }
      
      fetchAssignments();
    } catch (err: any) {
      console.error("Action failed", err);
      alert(err.message || "Failed to process action.");
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !reviewModal) return;
    const assignment = assignments.find(a => a.id === reviewModal);
    if (!assignment) return;

    setSubmittingReview(true);
    try {
      const { error } = await supabase
        .from('ngo_reviews')
        .insert({
          assignment_id: assignment.id,
          company_id: user.id,
          ngo_profile_id: assignment.ngo_id,
          rating,
          accuracy_score: accuracy,
          timeliness_score: timeliness,
          review_text: reviewText
        });

      if (error) throw error;
      alert("Review submitted successfully!");
      setReviewModal(null);
    } catch (err) {
      console.error("Review failed", err);
      alert("Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Booked Projects</h1>
        <p className="text-sm text-gray-500 mt-1">Track the verification progress of the land you've committed to fund.</p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-semibold text-gray-900">No booked projects yet</p>
          <p className="text-sm text-gray-500 mt-1">Head over to the Marketplace to book a restoration project.</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-5xl">
          {assignments.map(assignment => {
            const isExpanded = expandedId === assignment.id;
            const listing = assignment.land_listings;
            const ngo = assignment.ngo_profiles;
            const report = assignment.verification_reports?.[0];

            return (
              <div key={assignment.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : assignment.id)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FolderOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{listing.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {listing.district}, {listing.state}</span>
                        <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {ngo.org_name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${getStatusColor(assignment.status)}`}>
                      {assignment.status.replace('_', ' ')}
                    </span>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/30">
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Left Col: Basics */}
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Assignment Details</h4>
                          <div className="space-y-3 p-4 bg-white rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-gray-400" /> 
                              <span className="text-gray-500 w-20">Booked:</span>
                              <span className="font-medium text-gray-900">{new Date(assignment.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <AlertCircle className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-500 w-20">Deadline:</span>
                              <span className="font-medium text-gray-900">{new Date(assignment.deadline_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Leaf className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-500 w-20">Area:</span>
                              <span className="font-medium text-gray-900">{listing.area_hectares} Ha ({listing.ecosystem_type})</span>
                            </div>
                          </div>
                        </div>

                        {assignment.company_notes && (
                          <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Instructions</h4>
                            <p className="text-sm text-gray-600 bg-amber-50 p-3 rounded-lg border border-amber-100 italic">
                              "{assignment.company_notes}"
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right Col: Report Details */}
                      <div className="md:col-span-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" /> NGO Verification Report
                        </h4>
                        
                        {!report ? (
                          <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl text-center flex flex-col items-center justify-center bg-white h-48">
                            <Clock className="w-8 h-8 text-gray-300 mb-2" />
                            <p className="text-sm font-medium text-gray-900">Waiting for Report</p>
                            <p className="text-xs text-gray-500 mt-1 max-w-xs">The assigned NGO has not submitted the verification report yet. It is due by {new Date(assignment.deadline_date).toLocaleDateString()}.</p>
                          </div>
                        ) : (
                          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                                  report.ngo_verdict === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                  report.ngo_verdict === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                  Verdict: {report.ngo_verdict}
                                </span>
                                <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> Visit: {new Date(report.field_visit_date).toLocaleDateString()}</span>
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {report.gps_lat_recorded?.toFixed(4)}, {report.gps_lng_recorded?.toFixed(4)}
                              </div>
                            </div>

                            <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-gray-100">
                              <div>
                                <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Carbon Est.</p>
                                <p className="text-lg font-black text-blue-600">{report.carbon_estimate_tons} t</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Area Confirmed</p>
                                <p className="text-lg font-black text-gray-900">{report.area_confirmed_hectares} Ha</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Ecosystem</p>
                                <p className="text-sm font-bold text-emerald-600 capitalize">{report.ecosystem_condition}</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">AI Fraud Score</p>
                                <div className="flex items-center gap-1">
                                  <ShieldAlert className={`w-4 h-4 ${report.ai_fraud_score < 20 ? 'text-emerald-500' : report.ai_fraud_score < 50 ? 'text-amber-500' : 'text-red-500'}`} />
                                  <span className={`text-sm font-bold ${report.ai_fraud_score < 20 ? 'text-emerald-600' : report.ai_fraud_score < 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                    {report.ai_fraud_score}/100
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* NDVI */}
                            <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-6">
                              <div className="text-sm font-medium text-gray-700 w-24">NDVI Satellite Check</div>
                              <div className="flex items-center gap-4 flex-1">
                                <div className="bg-white px-3 py-1.5 rounded border border-gray-200 text-xs">Before: <span className="font-bold">{report.ndvi_before}</span></div>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                                <div className="bg-white px-3 py-1.5 rounded border border-gray-200 text-xs">After: <span className="font-bold text-emerald-600">{report.ndvi_after}</span></div>
                                {report.ndvi_after > report.ndvi_before && <span className="text-xs text-emerald-600 font-bold ml-2">↑ Improved</span>}
                              </div>
                            </div>

                            <div className="p-5">
                              <p className="text-sm text-gray-700 italic">"{report.ngo_comments}"</p>
                            </div>

                            {/* Gallery */}
                            {(report.field_photo_urls?.length > 0 || report.drone_photo_urls?.length > 0) && (
                              <div className="p-4 pt-0">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Evidence Photos</p>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                  {report.field_photo_urls?.map((url: string, i: number) => (
                                    <div key={`field-${i}`} className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                      <img src={url} alt="Field" className="w-full h-full object-cover" />
                                    </div>
                                  ))}
                                  {report.drone_photo_urls?.map((url: string, i: number) => (
                                    <div key={`drone-${i}`} className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-gray-200 relative">
                                      <span className="absolute top-1 right-1 bg-black/60 text-white text-[8px] px-1 rounded">DRONE</span>
                                      <img src={url} alt="Drone" className="w-full h-full object-cover" />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Actions */}
                        {report && assignment.status === 'report_submitted' && (
                          <div className="mt-4 flex flex-wrap gap-3">
                            <button 
                              onClick={() => handleAction(assignment.id, 'completed')}
                              className="px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 flex items-center gap-2 shadow-sm"
                            >
                              <CheckCircle2 className="w-5 h-5" /> Accept & Issue Credits
                            </button>
                            <button 
                              onClick={() => handleAction(assignment.id, 'disputed')}
                              className="px-5 py-2.5 bg-white border border-gray-300 text-red-600 font-medium rounded-xl hover:bg-red-50 flex items-center gap-2"
                            >
                              <ShieldAlert className="w-5 h-5" /> Dispute Report
                            </button>
                          </div>
                        )}

                        {assignment.status === 'completed' && (
                          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                            <p className="text-sm text-emerald-800 font-medium flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Credits Issued Successfully</p>
                            <button 
                              onClick={() => setReviewModal(assignment.id)}
                              className="text-sm bg-white text-emerald-700 px-4 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 font-semibold transition-colors"
                            >
                              Leave NGO Review
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !submittingReview && setReviewModal(null)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <button onClick={() => setReviewModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Review NGO</h3>
            <p className="text-sm text-gray-500 mb-6">Rate your experience with this verification partner.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Overall Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setRating(star)}>
                      <Star className={`w-8 h-8 ${star <= rating ? 'text-amber-400 fill-current' : 'text-gray-200'}`} />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Accuracy</label>
                  <select value={accuracy} onChange={e => setAccuracy(parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Timeliness</label>
                  <select value={timeliness} onChange={e => setTimeliness(parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Comments</label>
                <textarea 
                  rows={4} 
                  value={reviewText} 
                  onChange={e => setReviewText(e.target.value)} 
                  placeholder="Share details about their reporting quality, communication..." 
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                />
              </div>

              <button 
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {submittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
