import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useGetStoryElementsQuery, useGetStoryMentionsQuery } from '../../services/stories';
import { User, MapPin, Shield, MessageSquare, Clock, Sparkles } from 'lucide-react';

export const EntityDossier: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: elements } = useGetStoryElementsQuery(id!);
    const { data: mentions } = useGetStoryMentionsQuery(id!);
    const [selectedId, setSelectedId] = useState<string | null>(null);

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
            {/* List Sidebar */}
            <div className="w-72 bg-white border-r border-slate-100 flex flex-col">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Story Elements</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-8">
                    {/* Characters Section */}
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
                                        onClick={() => setSelectedId(char.id)}
                                        className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${selectedId === char.id
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                                : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        {char.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Locations Section */}
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
                                        onClick={() => setSelectedId(loc.id)}
                                        className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${selectedId === loc.id
                                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                                                : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        {loc.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail View */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50">
                {selectedEntity ? (
                    <div className="max-w-3xl mx-auto p-12 space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                        {/* Header */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-2xl ${selectedEntity.element_type === 'character' ? 'bg-indigo-100 text-indigo-600' :
                                        selectedEntity.element_type === 'location' ? 'bg-emerald-100 text-emerald-600' :
                                            'bg-amber-100 text-amber-600'
                                    }`}>
                                    {renderEntityIcon(selectedEntity.element_type)}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{selectedEntity.name}</h1>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                        Level 1 Narrative Intelligence Profile
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Analysis Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <MessageSquare className="w-3 h-3" />
                                    AI Description
                                </h4>
                                <p className="text-slate-600 text-sm leading-relaxed italic">
                                    {selectedEntity.attributes?.description || "No specific character profile has been built yet. Provide more narration to sharpen the AI's understanding."}
                                </p>
                            </div>
                            {selectedEntity.attributes?.traits && (
                                <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Sparkles className="w-3 h-3" />
                                        Extracted Traits
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(selectedEntity.attributes.traits as string[]).map(trait => (
                                            <span key={trait} className="px-3 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold uppercase rounded-lg border border-slate-100">
                                                {trait}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Journey/Mentions */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    Narrative Journey
                                </h4>
                                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide bg-indigo-50 px-2 py-0.5 rounded-full">
                                    {entityMentions.length} Mentions Found
                                </span>
                            </div>

                            <div className="space-y-4">
                                {entityMentions.length > 0 ? entityMentions.map((mention, idx) => (
                                    <div key={mention.id} className="relative pl-8 pb-8 group">
                                        {/* Timeline Line */}
                                        {idx !== entityMentions.length - 1 && (
                                            <div className="absolute left-[7px] top-4 w-[2px] h-full bg-slate-100" />
                                        )}
                                        {/* Dot */}
                                        <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-slate-200 bg-white group-hover:border-indigo-400 transition-colors" />

                                        <div className="space-y-2">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                Episode {idx + 1}
                                            </div>
                                            <div className="p-6 bg-white rounded-2xl border border-slate-100 group-hover:shadow-md transition-all">
                                                <p className="text-slate-800 text-sm leading-relaxed">
                                                    "{mention.mention_context}"
                                                </p>
                                                {mention.emotional_state?.current_emotion && (
                                                    <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold uppercase rounded-md border border-rose-100">
                                                        Emotion: {mention.emotional_state.current_emotion}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-slate-200">
                                        <p className="text-slate-400 text-sm italic">New journey tracking data will appear here for subsequent narrations.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300">
                        <div className="p-6 rounded-full bg-slate-100/50 mb-4">
                            <User className="w-8 h-8 opacity-20" />
                        </div>
                        <p className="text-sm font-medium italic tracking-wide">Select a narrative element to view its dossier</p>
                    </div>
                )}
            </div>
        </div>
    );
};
