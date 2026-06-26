"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { TreePine, MapPin, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

interface LandListing {
  id: string;
  title: string;
  district: string;
  state: string;
  ecosystem_type: string;
  area_hectares: number;
  trees_planted: number | null;
  status: string;
  estimated_carbon_tons: number | null;
  created_at: string;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  listed: { bg: "bg-gray-100", text: "text-gray-700", label: "Available" },
  booked: { bg: "bg-blue-50", text: "text-blue-700", label: "Booked" },
  ngo_assigned: { bg: "bg-purple-50", text: "text-purple-700", label: "NGO Assigned" },
  under_review: { bg: "bg-amber-50", text: "text-amber-700", label: "NGO Review" },
  verified: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Verified" },
  rejected: { bg: "bg-red-50", text: "text-red-700", label: "Rejected" },
  more_evidence: { bg: "bg-orange-50", text: "text-orange-700", label: "Needs Info" },
};

export default function GrowerProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<LandListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("land_listings")
          .select("*")
          .eq("grower_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setProjects(data || []);
      } catch (err) {
        console.error("Error fetching grower projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
          <p className="text-sm text-gray-500">Track and manage your registered restoration projects</p>
        </div>
        <Link 
          href="/grower/listings"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          Manage Listings & Add New
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <TreePine className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects registered yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">Create a land listing in the Listings section to register your first restoration project.</p>
          <Link href="/grower/listings" className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors inline-block">
            Go to Listings
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => {
            const statusInfo = statusColors[project.status] || { bg: "bg-gray-50", text: "text-gray-500", label: project.status };
            return (
              <div 
                key={project.id}
                className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <TreePine className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.title}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {project.district}, {project.state}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="capitalize">{project.ecosystem_type}</span>
                        <span>•</span>
                        <span>{project.area_hectares} ha</span>
                        {project.trees_planted !== null && project.trees_planted > 0 && (
                          <>
                            <span>•</span>
                            <span>{project.trees_planted.toLocaleString()} trees</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text} flex items-center gap-1`}>
                    {project.status === "verified" && <CheckCircle2 className="w-3 h-3" />}
                    {["listed", "booked", "ngo_assigned", "under_review"].includes(project.status) && <Clock className="w-3 h-3" />}
                    {project.status === "rejected" && <AlertCircle className="w-3 h-3" />}
                    {statusInfo.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
