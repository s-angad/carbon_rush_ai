"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { UploadCloud, FileImage, FileText, MapPin, CheckCircle2, X, Image } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import exifr from "exifr";

interface UploadedFile {
  id?: string;
  name: string;
  type: string;
  size?: string;
  gpsLat?: number;
  gpsLng?: number;
  file_url?: string;
}

export default function GrowerUploadPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Load Grower's Projects (Land Listings)
  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const { data, error } = await supabase
          .from("land_listings")
          .select("id, title, state, district")
          .eq("grower_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setProjects(data || []);
        if (data && data.length > 0) {
          setSelectedProjectId(data[0].id);
        }
      } catch (err: any) {
        console.error("Error fetching projects:", err);
        setErrorMessage("Failed to load your projects.");
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [user]);

  // Load Existing Uploads for Selected Project
  const fetchUploadedFiles = async (projectId: string) => {
    if (!projectId) return;
    setLoadingFiles(true);
    try {
      const { data, error } = await supabase
        .from("evidence_uploads")
        .select("*")
        .eq("project_id", projectId)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;

      const formatted: UploadedFile[] = (data || []).map((file: any) => ({
        id: file.id,
        name: file.file_name || "evidence_file",
        type: file.file_type || "image/jpeg",
        gpsLat: file.gps_lat,
        gpsLng: file.gps_lng,
        file_url: file.file_url,
      }));

      setUploadedFiles(formatted);
    } catch (err: any) {
      console.error("Error fetching evidence files:", err);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchUploadedFiles(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handleFileUpload = async (file: File) => {
    if (!user || !selectedProjectId) {
      setErrorMessage("Please select a project first.");
      return;
    }

    setUploading(true);
    setStatusMessage("Extracting metadata & geotags...");
    setErrorMessage("");

    let gpsLat: number | undefined;
    let gpsLng: number | undefined;

    // Extract EXIF data from JPEG/PNG
    if (file.type.startsWith("image/")) {
      try {
        const gps = await exifr.gps(file);
        if (gps && gps.latitude && gps.longitude) {
          gpsLat = gps.latitude;
          gpsLng = gps.longitude;
        }
      } catch (exifErr) {
        console.warn("Could not read EXIF data:", exifErr);
      }
    }

    try {
      setStatusMessage("Uploading file to secure storage...");
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `evidence/${user.id}/${selectedProjectId}/${fileName}`;

      // Upload file to Supabase Storage bucket 'evidence'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("evidence")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from("evidence")
        .getPublicUrl(filePath);

      setStatusMessage("Saving file metadata to database...");
      
      // Save metadata in evidence_uploads table
      const { error: dbError } = await supabase
        .from("evidence_uploads")
        .insert({
          project_id: selectedProjectId,
          grower_id: user.id,
          file_url: publicUrl,
          file_type: file.type,
          file_name: file.name,
          gps_lat: gpsLat || null,
          gps_lng: gpsLng || null,
        });

      if (dbError) throw dbError;

      setStatusMessage("Upload successful!");
      // Refresh list
      await fetchUploadedFiles(selectedProjectId);
    } catch (err: any) {
      console.error("Upload failed:", err);
      setErrorMessage(err.message || "Failed to upload file.");
    } finally {
      setUploading(false);
      setStatusMessage("");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const removeFile = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this evidence?")) return;

    try {
      const { error } = await supabase
        .from("evidence_uploads")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setUploadedFiles(prev => prev.filter(f => f.id !== id));
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert("Failed to delete file from database.");
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <FileImage className="w-5 h-5 text-sky-500" />;
    return <FileText className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Evidence</h1>
        <p className="text-sm text-gray-500">Add geo-tagged photos, drone footage, and field surveys for your projects</p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm animate-pulse">
          {statusMessage}
        </div>
      )}

      {/* Project Selector */}
      <div className="p-4 rounded-2xl bg-white border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
        {loadingProjects ? (
          <div className="text-sm text-gray-500">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-sm text-gray-500">No projects found. Please register a project first.</div>
        ) : (
          <select 
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white max-w-md"
          >
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.title} ({proj.district}, {proj.state})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Drop Zone */}
      <div className="relative">
        <input 
          type="file" 
          id="evidence-file-input"
          className="hidden" 
          onChange={handleFileInput}
          disabled={uploading || !selectedProjectId}
        />
        <label htmlFor="evidence-file-input">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`p-12 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer ${
              dragOver ? "border-emerald-400 bg-emerald-50" : "border-gray-300 bg-white hover:border-emerald-300 hover:bg-gray-50"
            } ${uploading || !selectedProjectId ? "opacity-50 pointer-events-none" : ""}`}
          >
            <UploadCloud className={`w-12 h-12 mx-auto mb-4 ${dragOver ? "text-emerald-500" : "text-gray-300"}`} />
            <p className="text-lg font-medium text-gray-700 mb-1">
              {uploading ? "Processing upload..." : dragOver ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="text-sm text-gray-400 mb-3">or click to browse</p>
            <div className="flex items-center justify-center gap-3">
              <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-medium">JPEG</span>
              <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-medium">PNG</span>
              <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">PDF</span>
            </div>
          </motion.div>
        </label>
      </div>

      {/* Uploaded Files */}
      {selectedProjectId && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Files ({uploadedFiles.length})</h3>
          
          {loadingFiles ? (
            <div className="py-4 text-center text-sm text-gray-500">Loading files...</div>
          ) : uploadedFiles.length === 0 ? (
            <div className="py-4 text-center text-sm text-gray-500">No evidence uploaded yet for this project.</div>
          ) : (
            <div className="space-y-3">
              {uploadedFiles.map((file, i) => (
                <motion.div key={file.id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="hover:opacity-85">
                    {getFileIcon(file.type)}
                  </a>
                  <div className="flex-1 min-w-0">
                    <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-900 truncate hover:underline block">
                      {file.name}
                    </a>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{file.type}</span>
                      {file.gpsLat && file.gpsLng && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-emerald-600">
                            <MapPin className="w-3 h-3" />
                            {file.gpsLat.toFixed(4)}, {file.gpsLng.toFixed(4)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <button onClick={() => removeFile(file.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Mini Map */}
      {selectedProjectId && uploadedFiles.some(f => f.gpsLat) && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">GPS Coordinates from Uploads</h3>
          <div className="w-full h-48 rounded-xl bg-gradient-to-br from-emerald-50 to-sky-50 border border-gray-200 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute w-full h-full" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #10B981 1px, transparent 0)", backgroundSize: "24px 24px" }} />
            </div>
            {uploadedFiles.filter(f => f.gpsLat).map((f, i) => (
              <div key={i} className="absolute" style={{ left: `${30 + (i * 12) % 60}%`, top: `${30 + (i * 17) % 50}%` }}>
                <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse" />
              </div>
            ))}
            <div className="text-center z-10">
              <Image className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">{uploadedFiles.filter(f => f.gpsLat).length} coordinates plotted</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
