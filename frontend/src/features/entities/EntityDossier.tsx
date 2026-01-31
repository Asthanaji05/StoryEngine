import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    useGetStoryElementsQuery,
    useGetStoryMentionsQuery,
    useUpdateElementMutation,
    useDeleteElementMutation
} from '../../services/stories';
import { useRevertElementMutation } from '../../services/suggestions';
import {
    User, MapPin, Shield, MessageSquare, Clock, Sparkles,
    TrendingUp, TrendingDown, Minus, Edit3, Trash2, Check, X, RotateCcw
} from 'lucide-react';

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
        <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                <div className="flex items-center gap-1.5 text-emerald-500">
                    <TrendingUp className="w-3 h-3" />
                    Positive
                </div>
                <div className="text-slate-300">Emotional Life</div>
                <div className="flex items-center gap-1.5 text-rose-500">
                    <TrendingDown className="w-3 h-3" />
                    Negative
                </div>
            </div>
            <div className="relative h-[60px] bg-slate-50/50 rounded-2xl border border-slate-100/50 overflow-hidden">
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-200 border-dashed" />
                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="drop-shadow-sm">
                    <defs>
                        <linearGradient id="arcGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                            <stop offset="50%" stopColor="#6366f1" stopOpacity="0" />
                            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.2" />
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

export const EntityDossier: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: elements } = useGetStoryElementsQuery(id!);
    const { data: mentions } = useGetStoryMentionsQuery(id!);
    const [updateElement] = useUpdateElementMutation();
    const [deleteElement] = useDeleteElementMutation();
    const [revertElement] = useRevertElementMutation();

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editTraits, setEditTraits] = useState<string[]>([]);
    const [newTrait, setNewTrait] = useState('');

    const categories = useMemo(() => {
        if (!elements) return { characters: [], locations: [], organizations: [] };
        return {
            characters: elements.filter(e => e.element_type === 'character'),
            locations: elements.filter(e => e.element_type === 'location'),
            organizations: elements.filter(e => e.element_type === 'organization'),
        };
    }, [elements]);

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
        await updateElement({
            storyId: id!,
            elementId: selectedId,
            updates: {
                name: editName,
                attributes: { ...selectedEntity.attributes, description: editDesc, traits: editTraits }
            }
        });
        setIsEditMode(false);
    };

    const handleDelete = async () => {
        if (!selectedId || !window.confirm("Are you sure you want to delete this narrative element? This cannot be undone.")) return;
        await deleteElement({ storyId: id!, elementId: selectedId });
        setSelectedId(null);
        setIsEditMode(false);
    };

    const handleRevert = async () => {
        if (!selectedId || !window.confirm("Revert this fact back to a suggestion? It will reappear in your approval list.")) return;
        try {
            await revertElement(selectedId).unwrap();
            setSelectedId(null);
            setIsEditMode(false);
        } catch (err) {
            alert("Could not revert this item. It might not have originated from a suggestion.");
        }
    };

    const addTrait = () => {
        if (newTrait.trim() && !editTraits.includes(newTrait.trim())) {
            setEditTraits([...editTraits, newTrait.trim()]);
            setNewTrait('');
        }
    };

    const removeTrait = (t: string) => {
        setEditTraits(editTraits.filter(trait => trait !== t));
    };

    const renderEntityIcon = (type: string) => {
        switch (type) {
            case 'character': return <User className="w-4 h-4" />;
            case 'location': return <MapPin className="w-4 h-4" />;
            case 'organization': return <Shield className="w-4 h-4" />;
            default: return <User className="w-4 h-4" />;
        }
    };

    return (
        <div className="flex h-full bg-slate-50 overflow-hidden rounded-3xl border border-slate-100 shadow-inner">
            <div className="w-72 bg-white border-r border-slate-100 flex flex-col">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Story Elements</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-8">
                    {categories.characters.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <User className="w-3 h-3" />
                                Characters
                            </div>
                            <div className="space-y-1">
                                {categories.characters.map(char => (
                                    <button
                                        key={char.id}
                                        onClick={() => { setSelectedId(char.id); setIsEditMode(false); }}
                                        className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${selectedId === char.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {char.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {categories.locations.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <MapPin className="w-3 h-3" />
                                Locations
                            </div>
                            <div className="space-y-1">
                                {categories.locations.map(loc => (
                                    <button
                                        key={loc.id}
                                        onClick={() => { setSelectedId(loc.id); setIsEditMode(false); }}
                                        className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${selectedId === loc.id ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {loc.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50/50">
                {selectedEntity ? (
                    <div className="max-w-3xl mx-auto p-12 space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-2xl ${selectedEntity.element_type === 'character' ? 'bg-indigo-100 text-indigo-600' : selectedEntity.element_type === 'location' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {renderEntityIcon(selectedEntity.element_type)}
                                </div>
                                <div className="flex-1">
                                    {isEditMode ? (
                                        <input value={editName} onChange={(e) => setEditName(e.target.value)} className="text-3xl font-bold text-slate-900 tracking-tight bg-white border-b-2 border-indigo-500 outline-none w-full" />
                                    ) : (
                                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{selectedEntity.name}</h1>
                                    )}
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Narrative Sovereignty Active</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {isEditMode ? (
                                    <>
                                        <button onClick={handleSave} className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all" title="Save Changes">
                                            <Check className="w-5 h-5" />
                                        </button>
                                        <button onClick={handleRevert} className="p-2 bg-amber-100 text-amber-600 rounded-xl hover:bg-amber-200 transition-all shadow-sm" title="Revert to Suggestion">
                                            <RotateCcw className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => setIsEditMode(false)} className="p-2 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300 transition-all" title="Cancel">
                                            <X className="w-5 h-5" />
                                        </button>
                                        <button onClick={handleDelete} className="p-2 bg-rose-100 text-rose-600 rounded-xl hover:bg-rose-200 transition-all ml-2" title="Delete Permanent Fact">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => setIsEditMode(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:shadow-md transition-all text-xs font-bold uppercase tracking-widest">
                                        <Edit3 className="w-4 h-4" />
                                        Edit Fact
                                    </button>
                                )}
                            </div>
                        </div>

                        {selectedEntity.element_type === 'character' && sentimentData.length > 1 && (
                            <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                <SentimentArc data={sentimentData} />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <MessageSquare className="w-3 h-3" /> AI Description
                                </h4>
                                {isEditMode ? (
                                    <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={4} className="w-full text-slate-600 text-sm leading-relaxed border-2 border-indigo-50 rounded-xl p-2 outline-none focus:border-indigo-200 transition-all" />
                                ) : (
                                    <p className="text-slate-600 text-sm leading-relaxed italic">{selectedEntity.attributes?.description || "No description provided."}</p>
                                )}
                            </div>

                            <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" /> Extracted Traits
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {editTraits.map(trait => (
                                        <span key={trait} className="group relative px-3 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold uppercase rounded-lg border border-slate-100">
                                            {trait}
                                            {isEditMode && <button onClick={() => removeTrait(trait)} className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all"><X className="w-2 h-2" /></button>}
                                        </span>
                                    ))}
                                    {isEditMode && (
                                        <div className="flex gap-1 w-full mt-2">
                                            <input value={newTrait} onChange={(e) => setNewTrait(e.target.value)} placeholder="Add trait..." className="flex-1 text-[10px] bg-slate-50 border border-slate-200 rounded-lg px-2 outline-none" onKeyDown={(e) => e.key === 'Enter' && addTrait()} />
                                            <button onClick={addTrait} className="px-2 py-1 bg-indigo-600 text-white rounded-lg text-[10px]">Add</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
                                <Clock className="w-3 h-3" /> Narrative Journey
                            </h4>
                            <div className="space-y-0">
                                {entityMentions.length > 0 ? entityMentions.map((mention, idx) => {
                                    const sentiment = mention.emotional_state?.sentiment_score ?? 0;
                                    const isPositive = sentiment >= 3;
                                    const isNegative = sentiment <= -3;
                                    return (
                                        <div key={mention.id} className="relative pl-12 pb-12 group">
                                            {idx !== entityMentions.length - 1 && <div className="absolute left-[15px] top-6 w-[2px] h-full bg-slate-100" />}
                                            <div className={`absolute left-0 top-1.5 w-8 h-8 rounded-2xl flex items-center justify-center transition-all border-2 ${isPositive ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : isNegative ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-200 text-slate-400'} group-hover:scale-110 shadow-sm`}>
                                                {isPositive ? <TrendingUp className="w-4 h-4" /> : isNegative ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Episode {idx + 1}</span></div>
                                                <div className="p-6 bg-white rounded-2xl border border-slate-100 group-hover:shadow-lg group-hover:border-indigo-100 transition-all cursor-default">
                                                    <p className="text-slate-800 text-sm leading-relaxed">"{mention.mention_context}"</p>
                                                    {mention.emotional_state?.current_emotion && <div className={`mt-3 inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase rounded-md border ${isPositive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : isNegative ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>{mention.emotional_state.current_emotion}</div>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-slate-200"><p className="text-slate-400 text-sm italic">New journey tracking data will appear here.</p></div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300"><div className="p-6 rounded-full bg-slate-100/50 mb-4"><User className="w-8 h-8 opacity-20" /></div><p className="text-sm font-medium italic tracking-wide">Select a narrative element</p></div>
                )}
            </div>
        </div>
    );
};
