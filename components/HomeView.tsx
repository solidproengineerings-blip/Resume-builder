import React, { useState, useEffect } from 'react';
import { ResumeData } from '../types';
import { ResumePreview } from './ResumePreview';
import { Plus, Download, Grid, List, Trash2, Copy, Edit, FileText, Share2, Cloud, FileDown, Database, ExternalLink, X } from 'lucide-react';
import { fetchCloudResumes } from '../services/cloudService';
import { supabase } from '../services/supabaseClient';
import { SupabaseStatusBanner } from './SupabaseStatusBanner';

interface HomeViewProps {
    resumes: ResumeData[];
    onCreate: () => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onImport: (file: File) => void;
    onDataImport: (data: Partial<ResumeData>) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
    resumes,
    onCreate,
    onEdit,
    onDelete,
    onDuplicate,
    onImport,
    onDataImport
}) => {
    const [activeTab, setActiveTab] = useState<'workspace' | 'pdfs'>('workspace');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [copiedLink, setCopiedLink] = useState(false);

    // Cloud State
    const [cloudResumes, setCloudResumes] = useState<ResumeData[]>([]);
    const [loadingCloud, setLoadingCloud] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    const formatTimeAgo = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImport(e.target.files[0]);
        }
    };

    const handleShareForm = () => {
        const url = window.location.origin + window.location.pathname + '?mode=form';
        navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const loadCloudData = async () => {
        setLoadingCloud(true);
        const data = await fetchCloudResumes();
        setCloudResumes(data);
        setLoadingCloud(false);
    };

    // Load cloud data when entering PDF tab or opening import modal
    useEffect(() => {
        if (activeTab === 'pdfs' || showImportModal) {
            loadCloudData();
        }
    }, [activeTab, showImportModal]);

    const handleCloudImport = (data: ResumeData) => {
        onDataImport(data);
        setShowImportModal(false);
    };

    return (
        <div className="h-screen overflow-y-auto custom-scrollbar bg-gradient-to-b from-gray-900 via-gray-900 to-solidpro-dark text-white font-sans p-6 md:p-12 relative">
            {/* Supabase Connection Status Banner */}
            <SupabaseStatusBanner />

            <div className="max-w-7xl mx-auto pb-12">

                {/* Header */}
                <header className="flex flex-col gap-6 mb-10 sticky top-0 bg-gradient-to-r from-gray-900/95 to-solidpro-dark/95 backdrop-blur z-30 py-4 -mt-4 border-b-2 border-solidpro-blue">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-solidpro-red to-solidpro-blue bg-clip-text text-transparent">SolidPro Resume Builder</h1>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleShareForm}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-solidpro-red to-solidpro-blue text-white rounded-lg transition-all text-sm font-medium shadow-lg hover:shadow-xl hover:opacity-90"
                                title="Copy a link to send to candidates for data entry"
                            >
                                <Share2 size={16} />
                                {copiedLink ? 'Link Copied!' : 'Share Form Link'}
                            </button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-6 text-sm font-medium border-b border-gray-800">
                        <button
                            onClick={() => setActiveTab('workspace')}
                            className={`pb-3 px-1 transition-all ${activeTab === 'workspace' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                            Workspace
                        </button>
                        <button
                            onClick={() => setActiveTab('pdfs')}
                            className={`pb-3 px-1 transition-all ${activeTab === 'pdfs' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                            Cloud PDFs
                        </button>

                        <div className="flex-1"></div>

                        {activeTab === 'workspace' && (
                            <div className="flex bg-gray-800 rounded-lg p-1 mb-2">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <Grid size={16} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <List size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* --- WORKSPACE TAB --- */}
                {activeTab === 'workspace' && (
                    <>
                        {viewMode === 'grid' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                                {/* Create New Card */}
                                <button
                                    onClick={onCreate}
                                    className="group relative flex flex-col items-center justify-center h-[400px] rounded-xl border-2 border-dashed border-gray-700 hover:border-blue-500 hover:bg-gray-800/50 transition-all cursor-pointer"
                                >
                                    <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors shadow-lg">
                                        <Plus size={32} className="text-gray-400 group-hover:text-white" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-300 group-hover:text-white">Create New</h3>
                                    <p className="text-sm text-gray-500 mt-2">Start from scratch</p>
                                </button>

                                {/* Import from Cloud Database Card */}
                                <button
                                    onClick={() => setShowImportModal(true)}
                                    className="group relative flex flex-col items-center justify-center h-[400px] rounded-xl border-2 border-dashed border-gray-700 hover:border-purple-500 hover:bg-gray-800/50 transition-all cursor-pointer"
                                >
                                    <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors shadow-lg">
                                        <Database size={28} className="text-gray-400 group-hover:text-white" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-300 group-hover:text-white">Import from DB</h3>
                                    <p className="text-sm text-gray-500 mt-2">Browse candidate submissions</p>
                                </button>

                                {/* Resume Cards */}
                                {resumes.map(resume => (
                                    <div key={resume.id} className="group relative bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:ring-2 hover:ring-blue-500 transition-all flex flex-col h-[400px]">

                                        {/* Preview Thumbnail Area */}
                                        <div
                                            className="relative flex-1 bg-white overflow-hidden cursor-pointer"
                                            onClick={() => onEdit(resume.id)}
                                        >
                                            <div className="absolute inset-0 bg-transparent z-10 hover:bg-black/5 transition-colors"></div>
                                            {/* Scaled Preview */}
                                            <div className="w-[210mm] h-[297mm] transform scale-[0.25] origin-top-left absolute top-0 left-0 pointer-events-none select-none">
                                                <ResumePreview data={resume} />
                                            </div>
                                        </div>

                                        {/* Footer Meta */}
                                        <div className="p-4 bg-gradient-to-t from-gray-900 via-gray-900 to-gray-800 border-t border-gray-700 z-20">
                                            <div className="flex justify-between items-start">
                                                <div onClick={() => onEdit(resume.id)} className="cursor-pointer">
                                                    <h3 className="font-bold text-lg text-white truncate max-w-[180px]">{resume.title || "Untitled Resume"}</h3>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Last updated {formatTimeAgo(resume.lastUpdated)}
                                                    </p>
                                                </div>

                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onDuplicate(resume.id); }}
                                                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
                                                        title="Duplicate"
                                                    >
                                                        <Copy size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onDelete(resume.id); }}
                                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-full transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {viewMode === 'list' && (
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <button
                                        onClick={onCreate}
                                        className="flex-1 p-4 border-2 border-dashed border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-blue-500 hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus size={20} /> Create New
                                    </button>
                                    <button
                                        onClick={() => setShowImportModal(true)}
                                        className="flex-1 p-4 border-2 border-dashed border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-purple-500 hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Database size={20} /> Import from DB
                                    </button>
                                </div>

                                {resumes.map(resume => (
                                    <div key={resume.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 border border-gray-700 transition-colors">
                                        <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => onEdit(resume.id)}>
                                            <div className="w-10 h-10 bg-blue-900/50 rounded-lg flex items-center justify-center text-blue-400">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white">{resume.title || "Untitled Resume"}</h3>
                                                <p className="text-sm text-gray-400">Last updated {formatTimeAgo(resume.lastUpdated)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onEdit(resume.id)}
                                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => onDuplicate(resume.id)}
                                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                                            >
                                                <Copy size={18} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(resume.id)}
                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* --- CLOUD PDFs TAB --- */}
                {activeTab === 'pdfs' && (
                    <div className="animate-fadeIn">
                        {!supabase ? (
                            <div className="text-center py-20 bg-gray-800/50 rounded-xl border border-gray-700 border-dashed">
                                <Cloud size={48} className="mx-auto text-gray-600 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-400">Cloud Storage Not Configured</h3>
                                <p className="text-gray-500 mt-2">Connect Supabase to view generated PDFs.</p>
                            </div>
                        ) : loadingCloud ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin text-blue-500"><Cloud size={32} /></div>
                            </div>
                        ) : cloudResumes.length === 0 ? (
                            <div className="text-center py-20 bg-gray-800/50 rounded-xl border border-gray-700 border-dashed">
                                <FileDown size={48} className="mx-auto text-gray-600 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-400">No PDFs Found</h3>
                                <p className="text-gray-500 mt-2">Save a resume to the cloud to generate a PDF.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {cloudResumes.filter(r => r.pdfUrl).map(resume => (
                                    <div key={resume.id} className="group relative bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 transition-all hover:border-blue-500">
                                        {/* Preview / Thumbnail Placeholder */}
                                        <div className="aspect-[210/297] bg-gray-700 w-full relative overflow-hidden">
                                            {/* Use iframe as thumbnail if possible, or just a placeholder */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-600">
                                                <FileText size={48} />
                                            </div>
                                            {/* Overlay Link */}
                                            <a
                                                href={resume.pdfUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100"
                                            >
                                                <div className="bg-white text-gray-900 px-4 py-2 rounded-full font-bold flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                                    <ExternalLink size={16} /> View PDF
                                                </div>
                                            </a>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-white truncate">{resume.title || resume.personalInfo.fullName || "Untitled"}</h3>
                                            <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(resume.lastUpdated)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* --- IMPORT MODAL --- */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-700">
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-white">Import from Database</h2>
                                <p className="text-sm text-gray-400 mt-1">Select a candidate submission to import into your workspace.</p>
                            </div>
                            <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                            {loadingCloud ? (
                                <div className="flex justify-center py-10">
                                    <span className="animate-spin text-blue-500"><Cloud size={32} /></span>
                                </div>
                            ) : cloudResumes.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    No resumes found in the database.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {cloudResumes.map(resume => (
                                        <button
                                            key={resume.id}
                                            onClick={() => handleCloudImport(resume)}
                                            className="text-left p-4 rounded-lg bg-gray-900 border border-gray-700 hover:border-blue-500 hover:bg-gray-750 transition-all flex flex-col gap-2 group"
                                        >
                                            <div className="flex justify-between items-start w-full">
                                                <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">
                                                    {resume.personalInfo.fullName || "Untitled Candidate"}
                                                </h3>
                                                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                                                    {formatTimeAgo(resume.lastUpdated)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400">{resume.personalInfo.jobTitle || "No Title"}</p>
                                            <p className="text-xs text-gray-500 truncate w-full">{resume.personalInfo.email}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};