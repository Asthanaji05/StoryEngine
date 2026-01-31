import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    useGetPendingSuggestionsQuery,
    useConfirmSuggestionMutation,
    useRejectSuggestionMutation,
    useUpdateSuggestionMutation,
    type Suggestion
} from '../../services/suggestions';
import { Check, X, Sparkles, User, MapPin, Shield, Clock, Link as LinkIcon, Edit2, Save } from 'lucide-react';

export const SuggestionsOverlay: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: suggestions, isLoading } = useGetPendingSuggestionsQuery(id!);
    const [confirm] = useConfirmSuggestionMutation();
    const [reject] = useRejectSuggestionMutation();
    const [update] = useUpdateSuggestionMutation();

    // Track which suggestion ID is being edited
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');

    if (isLoading || !suggestions || suggestions.length === 0) return null;

    const startEditing = (s: Suggestion) => {
        setEditingId(s.id);
        const name = s.suggestion_type === 'element' ? s.suggested_data.name :
            s.suggestion_type === 'moment' ? s.suggested_data.title : '';
        setEditValue(name);
    };

    const saveEdit = async (s: Suggestion) => {
        const newData = { ...s.suggested_data };
        if (s.suggestion_type === 'element') newData.name = editValue;
        if (s.suggestion_type === 'moment') newData.title = editValue;

        await update({ id: s.id, data: newData });
        setEditingId(null);
    };

    const renderSuggestionCard = (s: Suggestion) => {
        const type = s.suggestion_type;
        const data = s.suggested_data;
        const isEditing = editingId === s.id;

        const getIcon = () => {
            switch (type) {
                case 'element':
                    if (data.element_type === 'character') return <User className="w-4 h-4" />;
                    if (data.element_type === 'location') return <MapPin className="w-4 h-4" />;
                    return <Shield className="w-4 h-4" />;
                case 'moment': return <Clock className="w-4 h-4" />;
                case 'connection': return <LinkIcon className="w-4 h-4" />;
                default: return <Sparkles className="w-4 h-4" />;
            }
        };

        const getTitle = () => {
            if (type === 'element') return `Character: ${data.name}`;
            if (type === 'moment') return `Event: ${data.title}`;
            if (type === 'connection') return `Link: ${data.from} → ${data.to}`;
            return 'Narrative Insight';
        };

        const getDescription = () => {
            if (type === 'element') return data.mention_phrase || "Newly identified element";
            if (type === 'moment') return data.description;
            if (type === 'connection') return `${data.from} is now ${data.type} ${data.to}`;
            return "";
        };

        return (
            <div key={s.id} className="bg-white border border-indigo-100 rounded-2xl p-4 shadow-lg shadow-indigo-100/20 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        {getIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            {isEditing ? (
                                <input
                                    autoFocus
                                    className="text-xs font-bold text-slate-900 w-full bg-slate-50 border border-indigo-200 rounded px-1 outline-none"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(s)}
                                />
                            ) : (
                                <div className="flex items-center gap-1 group/title">
                                    <h4 className="text-xs font-bold text-slate-900 truncate tracking-tight">{getTitle()}</h4>
                                    {(type === 'element' || type === 'moment') && (
                                        <button
                                            onClick={() => startEditing(s)}
                                            className="opacity-0 group-hover/title:opacity-100 p-0.5 text-slate-400 hover:text-indigo-600 transition-all"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            )}
                            <span className="shrink-0 text-[8px] font-bold text-indigo-400 uppercase tracking-widest px-1.5 py-0.5 bg-indigo-50/50 rounded-md ml-2">
                                {Math.round(data.confidence * 100 || 80)}% Match
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed italic line-clamp-2">
                            "{getDescription()}"
                        </p>

                        <div className="flex items-center gap-2 mt-3">
                            {isEditing ? (
                                <button
                                    onClick={() => saveEdit(s)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                                >
                                    <Save className="w-3 h-3" />
                                    Save Draft
                                </button>
                            ) : (
                                <button
                                    onClick={() => confirm(s.id)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm shadow-indigo-200"
                                >
                                    <Check className="w-3 h-3" />
                                    Confirm
                                </button>
                            )}
                            <button
                                onClick={() => isEditing ? setEditingId(null) : reject(s.id)}
                                className="flex items-center justify-center p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed bottom-24 right-8 w-80 z-50 flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
            <div className="flex items-center gap-2 mb-1 px-2">
                <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">AI Suggestions</h3>
            </div>
            {suggestions.map(s => renderSuggestionCard(s))}
        </div>
    );
};
