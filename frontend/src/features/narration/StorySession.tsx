import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetStoryByIdQuery, useUpdateStoryMutation, useBrainstormOptionsMutation } from '../../services/stories';
import { useGetNarrationsQuery, useAddNarrationMutation } from '../../services/narrations';
import {
    Send, ArrowLeft, MoreVertical, Sparkles, MessageSquare,
    Share2, User, Book, Settings, Check, X, Wand2, ChevronRight, Activity,
    Zap, Clock
} from 'lucide-react';
import { StoryInterview } from './StoryInterview';
import { EntityList } from '../entities/EntityList';
import { Timeline } from '../timeline/Timeline';
import { NarrativeGraph } from '../visualization/NarrativeGraph';
import { EntityDossier } from '../entities/EntityDossier';
import { SuggestionsOverlay } from '../suggestions/SuggestionsOverlay';
import { supabase } from '../../lib/supabase';

const StoryEditModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    story: any;
    onSave: (updates: any) => void;
}> = ({ isOpen, onClose, story, onSave }) => {
    const [title, setTitle] = useState(story?.title || '');
    const [desc, setDesc] = useState(story?.description || '');
    const [brainstorm] = useBrainstormOptionsMutation();
    const [options, setOptions] = useState<any[]>([]);
    const [isBrainstorming, setIsBrainstorming] = useState(false);

    if (!isOpen) return null;

    const handleBrainstorm = async () => {
        setIsBrainstorming(true);
        try {
            const res = await brainstorm(story.id).unwrap();
            setOptions(res);
        } catch (err) {
            console.error(err);
        } finally {
            setIsBrainstorming(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-slate-50 px-10 py-6 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                            <Settings className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Story Identity</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-10 space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Narrative Title</label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full text-2xl font-bold text-slate-900 bg-slate-50 border-2 border-slate-50 rounded-[1.25rem] px-6 py-4 outline-none focus:border-indigo-100 focus:bg-white transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">World Premise</label>
                            <textarea
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                rows={3}
                                className="w-full text-slate-600 text-sm leading-relaxed bg-slate-50 border-2 border-slate-50 rounded-[1.25rem] px-6 py-4 outline-none focus:border-indigo-100 focus:bg-white transition-all resize-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Brainstorming</h4>
                            <button
                                onClick={handleBrainstorm}
                                disabled={isBrainstorming}
                                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold text-[10px] uppercase tracking-widest disabled:opacity-50"
                            >
                                <Wand2 className={`w-3 h-3 ${isBrainstorming ? 'animate-spin' : ''}`} />
                                {isBrainstorming ? 'Thinking...' : 'Generate New Vibes'}
                            </button>
                        </div>

                        {options.length > 0 && (
                            <div className="grid grid-cols-1 gap-3">
                                {options.map((opt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { setTitle(opt.title); setDesc(opt.description); }}
                                        className="text-left p-5 rounded-2xl border-2 border-slate-50 hover:border-indigo-100 bg-slate-50/50 hover:bg-white transition-all group"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <h5 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{opt.title}</h5>
                                            <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-1 italic">{opt.description}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => onSave({ title, description: desc })}
                        className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        Save Narrative Identity
                    </button>
                </div>
            </div>
        </div>
    );
};

export const StorySession: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: story } = useGetStoryByIdQuery(id!);
    const { data: narrations, isLoading: isNarrationsLoading } = useGetNarrationsQuery(id!);
    const [addNarration, { isLoading: isProcessing }] = useAddNarrationMutation();
    const [updateStory] = useUpdateStoryMutation();

    const [input, setInput] = useState('');
    const [activeTab, setActiveTab] = useState<'narration' | 'nexus' | 'entities' | 'bible'>('narration');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const getSession = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('email, xp, level') // Assuming email might be in profile or we use auth.user.email
                    .eq('id', user.id)
                    .single();

                setUser({ ...user, ...profile });
            }
        };
        getSession();
    }, []);

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

    const handleSaveStory = async (updates: any) => {
        await updateStory({ id: id!, updates }).unwrap();
        setIsEditModalOpen(false);
    };

    if (isNarrationsLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (narrations?.length === 0) {
        return <StoryInterview onComplete={handleInterviewComplete} />;
    }

    return (
        <div className="flex h-screen bg-white overflow-hidden font-sans text-slate-900">
            {/* Left Sidebar - Vertical Narrative Timeline */}
            <div className="hidden lg:flex w-72 bg-slate-50/50 border-r border-slate-100 flex-col">
                <div className="p-8">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-3 text-slate-400 hover:text-indigo-600 transition-all text-[10px] font-bold uppercase tracking-[0.2em]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Dashboard
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-8 pb-8 scrollbar-hide">
                    <div className="mb-8">
                        <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            Story Timeline
                        </h3>
                        <Timeline variant="vertical" />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-white relative">
                {/* Header */}
                <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0 z-20">
                    <div className="flex items-center gap-6 max-w-[60%]">
                        <button onClick={() => navigate('/')} className="lg:hidden p-2 -ml-2 text-slate-500"><ArrowLeft className="w-5 h-5" /></button>
                        <div className="flex flex-col">
                            <h2 className="text-xl font-bold text-slate-900 truncate tracking-tight">{story?.title || 'Loading...'}</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 max-w-sm truncate">{story?.description || 'Engine active and listening...'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/profile')}
                            className="flex items-center gap-2 pl-2 pr-4 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200 transition-all group lg:flex"
                        >
                            <div className="w-7 h-7 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                                <User className="w-4 h-4" />
                            </div>
                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest max-w-[120px] truncate">{user?.email || 'Profile'}</span>
                        </button>

                        {/* XP / Level Indicator */}
                        {user && (
                            <div className="hidden md:flex flex-col items-end mr-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">Lvl {user.level || 1}</span>
                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">//</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{user.xp || 0} XP</span>
                                </div>
                                <div className="w-24 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                                        style={{ width: `${Math.min(100, ((user.xp || 0) % ((user.level || 1) ** 2 * 100)) / ((user.level || 1) ** 2) || 5)}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border border-transparent hover:border-indigo-100"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Tab Switcher */}
                <div className="flex bg-white px-10 border-b border-slate-50 h-14 shrink-0 items-center justify-center lg:justify-start gap-8">
                    <button
                        onClick={() => setActiveTab('narration')}
                        className={`group flex items-center gap-2 h-full border-b-2 transition-all text-[11px] font-bold uppercase tracking-widest ${activeTab === 'narration' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        <Activity className="w-4 h-4" />
                        Narration
                    </button>
                    <button
                        onClick={() => setActiveTab('entities')}
                        className={`group flex items-center gap-2 h-full border-b-2 transition-all text-[11px] font-bold uppercase tracking-widest ${activeTab === 'entities' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        <User className="w-4 h-4" />
                        Active Entities
                    </button>
                    <button
                        onClick={() => setActiveTab('nexus')}
                        className={`group flex items-center gap-2 h-full border-b-2 transition-all text-[11px] font-bold uppercase tracking-widest ${activeTab === 'nexus' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        <Share2 className="w-4 h-4" />
                        Relationship Nexus
                    </button>
                    <button
                        onClick={() => setActiveTab('bible')}
                        className={`group flex items-center gap-2 h-full border-b-2 transition-all text-[11px] font-bold uppercase tracking-widest ${activeTab === 'bible' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        <Book className="w-4 h-4" />
                        World Bible
                    </button>
                </div>

                <div className="flex-1 relative flex flex-col overflow-hidden">
                    {activeTab === 'narration' ? (
                        <>
                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 md:p-20 space-y-12 scroll-smooth bg-white">
                                <div className="max-w-4xl mx-auto space-y-16 pb-12">
                                    {narrations?.map((n: any) => (
                                        <div key={n.id} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                            <div className="group relative">
                                                <div className="absolute -left-12 top-0 text-[9px] font-bold text-slate-200 uppercase vertical-text tracking-widest pointer-events-none">SEQ // 00{n.sequence_number + 1}</div>
                                                <div className="p-10 bg-white rounded-[2rem] border border-slate-100 shadow-sm group-hover:shadow-md transition-all duration-500 ring-4 ring-transparent hover:ring-slate-50/50">
                                                    <p className="text-xl text-slate-800 leading-relaxed font-serif tracking-tight">{n.content}</p>
                                                </div>
                                            </div>

                                            {n.listener_response && (
                                                <div className="flex gap-6 pl-10 md:pl-20 animate-in fade-in slide-in-from-left-6 duration-1000 delay-300">
                                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden group">
                                                        <Sparkles className="w-5 h-5 text-indigo-500 relative z-10" />
                                                        <div className="absolute inset-0 bg-indigo-200 opacity-0 group-hover:opacity-20 transition-all duration-700" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <p className="text-indigo-900 text-md italic leading-relaxed font-serif opacity-80">"{n.listener_response}"</p>
                                                        <div className="flex flex-wrap gap-2 pt-1 opacity-60">
                                                            {n.extracted?.characters?.map((c: any) => (
                                                                <span key={c.name} className="px-2 py-1 bg-indigo-50 text-[9px] font-bold text-indigo-600 rounded-lg border border-indigo-100 uppercase tracking-widest">Character // {c.name}</span>
                                                            ))}
                                                            {n.extracted?.events?.map((e: any) => (
                                                                <span key={e.title} className="px-2 py-1 bg-emerald-50 text-[9px] font-bold text-emerald-600 rounded-lg border border-emerald-100 uppercase tracking-widest">Event // {e.title}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {isProcessing && (
                                        <div className="flex items-center gap-4 text-indigo-600 font-bold text-xs uppercase tracking-[0.2em] animate-pulse pl-10">
                                            <Sparkles className="w-5 h-5" />
                                            Deepening Insight...
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-8 bg-white border-t border-slate-50 shadow-[0_-10px_40px_rgba(15,23,42,0.02)] z-10">
                                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative group">
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="What happens next in your world?"
                                        rows={3}
                                        className="w-full pl-8 pr-20 py-6 bg-slate-50 border-2 border-slate-50 rounded-[2rem] focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-100 focus:bg-white outline-none transition-all resize-none text-slate-800 placeholder:text-slate-300 text-lg font-serif"
                                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || isProcessing}
                                        className="absolute right-4 bottom-4 p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] disabled:opacity-50 disabled:bg-slate-200 transition-all shadow-xl shadow-indigo-100 group-hover:scale-105"
                                    >
                                        <Send className="w-6 h-6" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : activeTab === 'nexus' ? (
                        <div className="flex-1 bg-slate-50 p-10 overflow-y-auto flex flex-col"><NarrativeGraph /></div>
                    ) : activeTab === 'entities' ? (
                        <div className="flex-1 bg-slate-50 p-10 overflow-y-auto flex flex-col items-center"><div className="w-full max-w-md"><EntityList /></div></div>
                    ) : (
                        <div className="flex-1 overflow-hidden p-10 bg-slate-50 flex flex-col"><EntityDossier /></div>
                    )}
                </div>

                {/* Fixed Trust layer at bottom */}
                <div className="shrink-0 bg-slate-50/80 backdrop-blur-sm border-t border-slate-100">
                    <SuggestionsOverlay />
                </div>
            </div>

            <StoryEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                story={story}
                onSave={handleSaveStory}
            />
        </div>
    );
};
