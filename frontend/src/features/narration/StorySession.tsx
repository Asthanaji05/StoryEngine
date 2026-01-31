import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetStoryByIdQuery } from '../../services/stories';
import { useGetNarrationsQuery, useAddNarrationMutation } from '../../services/narrations';
import { Send, ArrowLeft, MoreVertical, Sparkles, MessageSquare, Share2, User } from 'lucide-react';
import { StoryInterview } from './StoryInterview';
import { EntityList } from '../entities/EntityList';
import { Timeline } from '../timeline/Timeline';
import { NarrativeGraph } from '../visualization/NarrativeGraph';
import { EntityDossier } from '../entities/EntityDossier';
import { SuggestionsOverlay } from '../suggestions/SuggestionsOverlay';

export const StorySession: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: story } = useGetStoryByIdQuery(id!);
    const { data: narrations, isLoading: isNarrationsLoading } = useGetNarrationsQuery(id!);
    const [addNarration, { isLoading: isProcessing }] = useAddNarrationMutation();

    const [input, setInput] = useState('');
    const [activeTab, setActiveTab] = useState<'narration' | 'graph' | 'dossier'>('narration');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new narration
    useEffect(() => {
        if (scrollRef.current && activeTab === 'narration') {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [narrations, activeTab]);

    const handleInterviewComplete = async (answers: string[]) => {
        for (const answer of answers) {
            await addNarration({ storyId: id!, content: answer }).unwrap();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isProcessing) return;

        try {
            const content = input;
            setInput('');
            await addNarration({ storyId: id!, content }).unwrap();
        } catch (err) {
            console.error('Failed to add narration:', err);
        }
    };

    if (isNarrationsLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Cold Start Interview Phase
    if (narrations?.length === 0) {
        return <StoryInterview onComplete={handleInterviewComplete} />;
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar - Narrative Intelligence */}
            <div className="hidden lg:flex w-80 bg-white border-r border-slate-200 flex-col">
                <div className="p-6 border-b border-slate-200">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-bold uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Dashboard
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <EntityList />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm shadow-slate-100/50">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="lg:hidden p-2 -ml-2 text-slate-500"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex flex-col">
                            <h2 className="text-base font-bold text-slate-900 truncate tracking-tight">
                                {story?.title || 'Loading Narrative...'}
                            </h2>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Engine Active</span>
                            </div>
                        </div>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </header>

                {/* Tab Switcher */}
                <div className="flex bg-white px-6 border-b border-slate-100 h-12 shrink-0">
                    <button
                        onClick={() => setActiveTab('narration')}
                        className={`flex items-center gap-2 px-4 border-b-2 transition-all text-xs font-bold uppercase tracking-widest ${activeTab === 'narration'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        Narration
                    </button>
                    <button
                        onClick={() => setActiveTab('graph')}
                        className={`flex items-center gap-2 px-4 border-b-2 transition-all text-xs font-bold uppercase tracking-widest ${activeTab === 'graph'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <Share2 className="w-4 h-4" />
                        Narrative Graph
                    </button>
                    <button
                        onClick={() => setActiveTab('dossier')}
                        className={`flex items-center gap-2 px-4 border-b-2 transition-all text-xs font-bold uppercase tracking-widest ${activeTab === 'dossier'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <User className="w-4 h-4" />
                        Dossier
                    </button>
                </div>

                {activeTab === 'narration' ? (
                    <>
                        {/* Dynamic Timeline Bar */}
                        <div className="bg-white border-b border-slate-100 shrink-0">
                            <Timeline />
                        </div>

                        {/* Narrative Feed */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 scroll-smooth"
                        >
                            <div className="max-w-3xl mx-auto space-y-12 pb-12">
                                {narrations?.map((n: any) => (
                                    <div key={n.id} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        {/* User Input */}
                                        <div className="group">
                                            <div className="flex items-start gap-4 mb-2">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                                                    Narration #{n.sequence_number + 1}
                                                </div>
                                            </div>
                                            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm group-hover:shadow-md transition-all">
                                                <p className="text-lg text-slate-800 leading-relaxed font-serif">
                                                    {n.content}
                                                </p>
                                            </div>
                                        </div>

                                        {/* AI Listener Response */}
                                        {n.listener_response && (
                                            <div className="flex gap-4 pl-4 md:pl-8 animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 shadow-sm">
                                                    <Sparkles className="w-4 h-4 text-indigo-500" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-indigo-800 text-sm italic leading-relaxed">
                                                        "{n.listener_response}"
                                                    </p>
                                                    {/* Extraction Indicators */}
                                                    <div className="flex flex-wrap gap-2 pt-1">
                                                        {n.extracted?.characters?.map((c: any) => (
                                                            <span key={c.name} className="px-2 py-0.5 bg-indigo-100/50 text-[10px] font-bold text-indigo-600 rounded-md border border-indigo-200 uppercase tracking-tighter">
                                                                Character: {c.name}
                                                            </span>
                                                        ))}
                                                        {n.extracted?.events?.map((e: any) => (
                                                            <span key={e.title} className="px-2 py-0.5 bg-emerald-100/50 text-[10px] font-bold text-emerald-600 rounded-md border border-emerald-200 uppercase tracking-tighter">
                                                                Event: {e.title}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isProcessing && (
                                    <div className="flex items-center gap-3 text-indigo-600 font-medium animate-pulse pl-4">
                                        <Sparkles className="w-5 h-5" />
                                        Understanding narration...
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.02)] z-10">
                            <form
                                onSubmit={handleSubmit}
                                className="max-w-3xl mx-auto relative"
                            >
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Narrate your story naturally..."
                                    rows={3}
                                    className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-slate-800 placeholder:text-slate-400 narration-input"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isProcessing}
                                    className="absolute right-3 bottom-3 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 disabled:bg-slate-300 transition-all shadow-sm"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                            <div className="max-w-3xl mx-auto mt-3 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest font-bold px-1">
                                <span>Press Enter to narate</span>
                                <span>Shift + Enter for new line</span>
                            </div>
                        </div>
                    </>
                ) : activeTab === 'graph' ? (
                    <div className="flex-1 bg-slate-50 p-6 overflow-hidden flex flex-col">
                        <NarrativeGraph />
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden p-6 bg-slate-50 flex flex-col">
                        <EntityDossier />
                    </div>
                )}
            </div>

            {/* AI Confirmation Loop - Trust Layer */}
            <SuggestionsOverlay />
        </div>
    );
};
