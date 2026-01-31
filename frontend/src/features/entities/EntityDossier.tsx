import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    useGetStoryElementsQuery,
    useGetStoryMentionsQuery,
    useUpdateElementMutation,
    useDeleteElementMutation,
    useInterviewCharacterMutation
} from '../../services/stories';
import { useRevertElementMutation } from '../../services/suggestions';
import {
    User, MapPin, Shield, MessageSquare, Clock, Sparkles,
    TrendingUp, TrendingDown, Minus, Edit3, Trash2, Check, X,
    RotateCcw, ArrowLeft, Search, Filter, Activity, Send, Download
} from 'lucide-react';
import { useRef } from 'react';

const SentimentArc: React.FC<{ data: number[] }> = ({ data }) => {
    if (data.length < 2) return null;

    const width = 300;
    const height = 60;
    const padding = 10;

    const points = data.map((val, i) => ({
        x: padding + (i * (width - 2 * padding) / (data.length - 1)),
        y: height / 2 - (val * (height / 2 - padding) / 10)
    }));

    const pathData = `M ${points[0].x} ${points[0].y} ` +
        points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                <div className="flex items-center gap-1.5 text-emerald-500">
                    <TrendingUp className="w-3 h-3" />
                    Ascent
                </div>
                <div className="text-slate-300">Emotional Life Arc</div>
                <div className="flex items-center gap-1.5 text-rose-500">
                    <TrendingDown className="w-3 h-3" />
                    Descent
                </div>
            </div>
            <div className="relative h-[60px] bg-slate-50/50 rounded-2xl border border-slate-100/30 overflow-hidden">
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-200/50 border-dashed" />
                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="drop-shadow-sm">
                    <defs>
                        <linearGradient id="arcGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                            <stop offset="50%" stopColor="#6366f1" stopOpacity="0" />
                            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.4" />
                        </linearGradient>
                    </defs>
                    <path d={pathData} fill="none" stroke="url(#arcGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    {points.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r="3" className={`${data[i] > 0 ? 'fill-emerald-500' : data[i] < 0 ? 'fill-rose-500' : 'fill-slate-400'}`} />
                    ))}
                </svg>
            </div>
        </div>
    );
};

const CharacterInterviewModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    character: any;
    storyId: string;
}> = ({ isOpen, onClose, character, storyId }) => {
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
    const [input, setInput] = useState('');
    const [interview, { isLoading }] = useInterviewCharacterMutation();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setMessages([{ role: 'ai', content: `*${character.name} looks at you, waiting.*` }]);
        }
    }, [isOpen, character]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (!isOpen) return null;

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

        try {
            const response = await interview({ storyId, characterId: character.id, prompt: userMsg }).unwrap();
            setMessages(prev => [...prev, { role: 'ai', content: response }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'ai', content: '*Seem unable to speak right now.*' }]);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-4xl h-[80vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
                {/* Character Sidebar inside Modal */}
                <div className="w-full md:w-80 bg-slate-50 border-r border-slate-100 p-8 flex flex-col items-center text-center shrink-0">
                    <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <User className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{character.name}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Living Simulation</p>
                    <div className="mt-8 text-left w-full space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Core Traits</label>
                            <div className="flex flex-wrap gap-2">
                                {character.attributes?.traits?.map((t: string) => (
                                    <span key={t} className="px-2 py-1 bg-white border border-slate-100 rounded-lg text-[10px] text-slate-600 font-bold uppercase">{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mt-auto">
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                            <X className="w-4 h-4" /> End Session
                        </button>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-white">
                    <div className="flex-1 overflow-y-auto p-8 space-y-6" ref={scrollRef}>
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-6 rounded-3xl text-sm leading-relaxed font-serif ${m.role === 'user' ? 'bg-slate-100 text-slate-800 rounded-br-none' : 'bg-indigo-600 text-white rounded-bl-none shadow-lg shadow-indigo-100'}`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-indigo-50 text-indigo-600 px-6 py-4 rounded-3xl rounded-bl-none text-xs font-bold uppercase tracking-widest animate-pulse">
                                    Thinking...
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-6 border-t border-slate-50">
                        <form onSubmit={handleSend} className="relative">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={`Ask ${character.name} something...`}
                                className="w-full pl-6 pr-16 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-indigo-100 outline-none transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all hover:scale-105"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const EntityDossier: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: elements } = useGetStoryElementsQuery(id!);
    const { data: mentions } = useGetStoryMentionsQuery(id!);
    const [updateElement] = useUpdateElementMutation();
    const [deleteElement] = useDeleteElementMutation();
    const [revertElement] = useRevertElementMutation();

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isInterviewOpen, setIsInterviewOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string | null>(null);

    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editTraits, setEditTraits] = useState<string[]>([]);
    const [newTrait, setNewTrait] = useState('');

    const filteredElements = useMemo(() => {
        if (!elements) return [];
        return elements.filter(e => {
            const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterType ? e.element_type === filterType : true;
            return matchesSearch && matchesFilter;
        });
    }, [elements, searchTerm, filterType]);

    const selectedEntity = useMemo(() => {
        return elements?.find(e => e.id === selectedId);
    }, [elements, selectedId]);

    const entityMentions = useMemo(() => {
        return mentions?.filter(m => m.element_id === selectedId) || [];
    }, [mentions, selectedId]);

    const sentimentData = useMemo(() => {
        return entityMentions.map(m => m.emotional_state?.sentiment_score ?? 0);
    }, [entityMentions]);

    useEffect(() => {
        if (selectedEntity) {
            setEditName(selectedEntity.name);
            setEditDesc(selectedEntity.attributes?.description || '');
            setEditTraits(selectedEntity.attributes?.traits || []);
        }
    }, [selectedEntity]);

    const handleSave = async () => {
        if (!selectedId || !selectedEntity) return;
        try {
            await updateElement({
                storyId: id!,
                elementId: selectedId,
                updates: {
                    name: editName,
                    attributes: { ...selectedEntity.attributes, description: editDesc, traits: editTraits }
                }
            }).unwrap();
            setIsEditMode(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        if (!selectedId || !window.confirm("Delete this world fact permanently?")) return;
        await deleteElement({ storyId: id!, elementId: selectedId });
        setSelectedId(null);
    };

    const handleRevert = async () => {
        if (!selectedId || !window.confirm("Revert this fact to a draft suggestion?")) return;
        await revertElement(selectedId).unwrap();
        setSelectedId(null);
    };

    const renderIcon = (type: string, size = "w-4 h-4") => {
        switch (type) {
            case 'character': return <User className={size} />;
            case 'location': return <MapPin className={size} />;
            case 'organization': return <Shield className={size} />;
            default: return <Sparkles className={size} />;
        }
    };

    if (selectedId && selectedEntity) {
        return (
            <div className="flex-1 flex flex-col h-full bg-white overflow-hidden animate-in fade-in duration-500">
                <header className="h-20 px-10 flex items-center justify-between border-b border-slate-50 shrink-0">
                    <button
                        onClick={() => setSelectedId(null)}
                        className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to World Bible
                    </button>
                    <div className="flex items-center gap-3">
                        {isEditMode ? (
                            <div className="flex gap-2">
                                <button onClick={handleSave} className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100"><Check className="w-5 h-5" /></button>
                                <button onClick={() => setIsEditMode(false)} className="p-3 bg-slate-100 text-slate-400 rounded-2xl"><X className="w-5 h-5" /></button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                {selectedEntity.element_type === 'character' && (
                                    <button onClick={() => setIsInterviewOpen(true)} className="flex items-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-2xl transition-all mr-2 font-bold text-[10px] uppercase tracking-widest">
                                        <MessageSquare className="w-4 h-4" /> Interview
                                    </button>
                                )}
                                <button onClick={() => setIsEditMode(true)} className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all"><Edit3 className="w-5 h-5" /></button>
                                <button onClick={handleRevert} className="p-3 bg-amber-50 text-amber-500 hover:bg-amber-100 rounded-2xl transition-all" title="Revert to Draft"><RotateCcw className="w-5 h-5" /></button>
                                <button onClick={handleDelete} className="p-3 bg-rose-50 text-rose-400 hover:text-rose-600 rounded-2xl transition-all"><Trash2 className="w-5 h-5" /></button>
                            </div>
                        )}
                    </div>
                </header>

                <CharacterInterviewModal
                    isOpen={isInterviewOpen}
                    onClose={() => setIsInterviewOpen(false)}
                    character={selectedEntity}
                    storyId={id!}
                />

                <div className="flex-1 overflow-y-auto px-10 py-16 scrollbar-hide">
                    <div className="max-w-4xl mx-auto space-y-16">
                        <section className="flex flex-col md:flex-row gap-10 items-start">
                            <div className={`shrink-0 w-32 h-32 rounded-[2.5rem] flex items-center justify-center overflow-hidden relative ${selectedEntity.element_type === 'character' ? 'bg-indigo-50 text-indigo-600 shadow-xl shadow-indigo-100/50' : 'bg-emerald-50 text-emerald-600 shadow-xl shadow-emerald-100/50'}`}>
                                {selectedEntity.attributes?.visual_url ? (
                                    <img src={selectedEntity.attributes.visual_url} alt={selectedEntity.name} className="w-full h-full object-cover" />
                                ) : (
                                    renderIcon(selectedEntity.element_type, "w-12 h-12")
                                )}
                            </div>
                            <div className="flex-1 space-y-4">
                                {isEditMode ? (
                                    <input value={editName} onChange={(e) => setEditName(e.target.value)} className="text-4xl font-bold text-slate-800 tracking-tight bg-slate-50 px-4 py-2 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all w-full" />
                                ) : (
                                    <h1 className="text-5xl font-bold text-slate-900 tracking-tighter">{selectedEntity.name}</h1>
                                )}
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                                        <Activity className="w-3.5 h-3.5 text-indigo-500" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{entityMentions.length} Mentions recorded</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Added {new Date(selectedEntity.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            <div className="lg:col-span-12 space-y-12">
                                <div className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">World Description</h3>
                                        {isEditMode ? (
                                            <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={4} className="w-full text-slate-600 text-lg font-serif border-2 border-slate-50 rounded-2xl p-6 outline-none focus:bg-white focus:border-indigo-100 transition-all " />
                                        ) : (
                                            <p className="text-xl text-slate-700 leading-relaxed font-serif">{selectedEntity.attributes?.description || "A placeholder in the grand narrative. Begin narrating to deepen this fact."}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-slate-50">
                                        <div className="space-y-6">
                                            <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Extracted Essence</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {editTraits.map(t => (
                                                    <span key={t} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                                                        {t}
                                                        {isEditMode && <button onClick={() => setEditTraits(editTraits.filter(tr => tr !== t))}><X className="w-3 h-3" /></button>}
                                                    </span>
                                                ))}
                                                {isEditMode && (
                                                    <input
                                                        value={newTrait}
                                                        onChange={(e) => setNewTrait(e.target.value)}
                                                        placeholder="+ Essence Tag"
                                                        className="px-3 py-1.5 bg-slate-50 text-[10px] rounded-xl outline-none border border-slate-100"
                                                        onKeyDown={e => e.key === 'Enter' && (setEditTraits([...editTraits, newTrait]), setNewTrait(''))}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            {selectedEntity.element_type === 'character' && (
                                                <SentimentArc data={sentimentData} />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] px-4 underline decoration-indigo-500/30 decoration-4 underline-offset-8">Narrative Journey</h3>
                                    <div className="space-y-6">
                                        {entityMentions.map((m, i) => (
                                            <div key={i} className="group p-8 bg-slate-50 hover:bg-white rounded-3xl border border-transparent hover:border-indigo-100 transition-all duration-500 relative">
                                                <div className="absolute -left-4 top-8 w-8 h-8 bg-white border border-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-300 shadow-sm font-mono">0{i + 1}</div>
                                                <p className="text-md text-slate-600 leading-relaxed italic opacity-80 group-hover:opacity-100 transition-opacity">"{m.mention_context}"</p>
                                                {m.emotional_state?.current_emotion && (
                                                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-100 text-[10px] font-bold text-indigo-500 uppercase">
                                                        {m.emotional_state.current_emotion}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const handleExport = () => {
        if (!elements) return;

        let md = `# World Bible\n\nGenerated by Story Engine\n\n`;

        // Characters
        md += `## Characters\n\n`;
        elements.filter(e => e.element_type === 'character').forEach(c => {
            md += `### ${c.name}\n`;
            md += `> ${c.attributes?.description || 'No description.'}\n\n`;
            if (c.attributes?.traits?.length) {
                md += `**Traits**: ${c.attributes.traits.join(', ')}\n\n`;
            }
        });

        // Locations
        md += `## Locations\n\n`;
        elements.filter(e => e.element_type === 'location').forEach(l => {
            md += `### ${l.name}\n`;
            md += `> ${l.attributes?.description || 'No description.'}\n\n`;
        });

        // Organizations
        md += `## Organizations\n\n`;
        elements.filter(e => e.element_type === 'organization').forEach(o => {
            md += `### ${o.name}\n`;
            md += `> ${o.attributes?.description || 'No description.'}\n\n`;
        });

        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'world_bible.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden rounded-[3rem] border border-slate-100 shadow-inner p-1">
            <header className="bg-white rounded-t-[2.8rem] px-10 py-8 flex items-center justify-between shrink-0">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tighter italic">World Bible</h2>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Institutional Repository of Facts</p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Find a legend..."
                            className="pl-12 pr-6 py-3 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-100 focus:bg-white outline-none text-sm transition-all"
                        />
                    </div>
                    <div className="flex bg-slate-50 p-1 rounded-2xl gap-1">
                        {[
                            { id: null, label: 'All' },
                            { id: 'character', icon: <User className="w-3 h-3" /> },
                            { id: 'location', icon: <MapPin className="w-3 h-3" /> }
                        ].map(f => (
                            <button
                                key={f.label || f.id}
                                onClick={() => setFilterType(f.id)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${filterType === f.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {f.icon} {f.label && f.label}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleExport} className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all" title="Export to Markdown">
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredElements.map(el => (
                        <div
                            key={el.id}
                            onClick={() => setSelectedId(el.id)}
                            className="group bg-white p-8 rounded-[2rem] border border-slate-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 cursor-pointer relative overflow-hidden"
                        >
                            <div className="relative z-10 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className={`p-4 rounded-2xl ${el.element_type === 'character' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'} transition-all group-hover:scale-110`}>
                                        {renderIcon(el.element_type, "w-6 h-6")}
                                    </div>
                                    {!el.user_confirmed && <span className="px-2 py-0.5 bg-amber-50 text-amber-500 text-[8px] font-bold uppercase rounded-md animate-pulse">Pending Draft</span>}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">{el.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">{el.element_type}</p>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed italic">{el.attributes?.description || "A silent observer of the narrative stream."}</p>
                            </div>

                            {/* Decorative background number */}
                            <div className="absolute -bottom-6 -right-4 text-9xl font-black text-slate-50 group-hover:text-indigo-50/50 transition-colors -z-0 select-none">
                                {el.name.charAt(0)}
                            </div>
                        </div>
                    ))}
                </div>
                {filteredElements.length === 0 && (
                    <div className="h-60 flex flex-col items-center justify-center text-slate-300">
                        <Activity className="w-10 h-10 opacity-10 mb-2" />
                        <p className="text-sm italic">The bible is silent. Add entities via narration.</p>
                    </div>
                )}
            </div>
        </div >
    );
};
