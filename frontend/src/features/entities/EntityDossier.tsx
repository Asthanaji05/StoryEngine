import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useGetStoryElementsQuery, useGetStoryMentionsQuery } from '../../services/stories';
import { User, MapPin, Shield, MessageSquare, Clock, Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const SentimentArc: React.FC<{ data: number[] }> = ({ data }) => {
    if (data.length < 2) return null;

    const width = 300;
    const height = 60;
    const padding = 10;

    // Normalize points to SVG space
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
                <div className="text-slate-300">Emotional Highs & Lows</div>
                <div className="flex items-center gap-1.5 text-rose-500">
                    <TrendingDown className="w-3 h-3" />
                    Negative
                </div>
            </div>
            <div className="relative h-[60px] bg-slate-50/50 rounded-2xl border border-slate-100/50 overflow-hidden">
                {/* Zero Line */}
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-200 border-dashed" />

                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="drop-shadow-sm">
                    <defs>
                        <linearGradient id="arcGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                            <stop offset="50%" stopColor="#6366f1" stopOpacity="0" />
                            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.2" />
                        </linearGradient>
                    </defs>
                    <path
                        d={pathData}
                        fill="none"
                        stroke="url(#arcGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-in fade-in duration-1000"
                    />
                    {points.map((p, i) => (
                        <circle
                            key={i}
                            cx={p.x}
                            cy={p.y}
                            r="3"
                            className={`${data[i] > 0 ? 'fill-emerald-500' : data[i] < 0 ? 'fill-rose-500' : 'fill-slate-400'}`}
                        />
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

    const sentimentData = useMemo(() => {
        return entityMentions.map(m => m.emotional_state?.sentiment_score ?? 0);
    }, [entityMentions]);

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
                        <div className="flex items-start justify-between">
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

                            {selectedEntity.element_type === 'character' && sentimentData.length > 1 && (
                                <div className="w-64">
                                    <SentimentArc data={sentimentData} />
                                </div>
                            )}
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

                            <div className="space-y-0">
                                {entityMentions.length > 0 ? entityMentions.map((mention, idx) => {
                                    const sentiment = mention.emotional_state?.sentiment_score ?? 0;
                                    const isPositive = sentiment > 0;
                                    const isNegative = sentiment < 0;

                                    return (
                                        <div key={mention.id} className="relative pl-12 pb-12 group">
                                            {/* Timeline Vertical Line */}
                                            <div className={`absolute left-[15px] top-6 w-[2px] h-full ${idx === entityMentions.length - 1 ? 'bg-transparent' : 'bg-slate-100'
                                                }`} />

                                            {/* Sentiment Flow Dot */}
                                            <div className={`absolute left-0 top-1.5 w-8 h-8 rounded-2xl flex items-center justify-center transition-all border-2 ${isPositive ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                                                    isNegative ? 'bg-rose-50 border-rose-200 text-rose-600' :
                                                        'bg-white border-slate-200 text-slate-400'
                                                } group-hover:scale-110 shadow-sm`}>
                                                {isPositive ? <TrendingUp className="w-4 h-4" /> :
                                                    isNegative ? <TrendingDown className="w-4 h-4" /> :
                                                        <Minus className="w-4 h-4" />}
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        Episode {idx + 1}
                                                    </span>
                                                    {sentiment !== 0 && (
                                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                                            }`}>
                                                            {sentiment > 0 ? '+' : ''}{sentiment} Intensity
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="p-6 bg-white rounded-2xl border border-slate-100 group-hover:shadow-lg group-hover:border-indigo-100 transition-all cursor-default">
                                                    <p className="text-slate-800 text-sm leading-relaxed">
                                                        "{mention.mention_context}"
                                                    </p>
                                                    {mention.emotional_state?.current_emotion && (
                                                        <div className={`mt-3 inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase rounded-md border ${isPositive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                isNegative ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                                    'bg-slate-50 text-slate-600 border-slate-100'
                                                            }`}>
                                                            {mention.emotional_state.current_emotion}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }) : (
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
