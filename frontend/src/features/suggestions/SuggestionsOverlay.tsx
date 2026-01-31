import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    useGetPendingSuggestionsQuery,
    useConfirmSuggestionMutation,
    useRejectSuggestionMutation,
    useUpdateSuggestionMutation,
    type Suggestion
} from '../../services/suggestions';
import { X, Sparkles, User, MapPin, Shield, Clock, Link as LinkIcon, Edit2, ChevronRight } from 'lucide-react';

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

    const renderCard = (s: Suggestion) => {
        const type = s.suggestion_type;
        const data = s.suggested_data;
        const isEditing = editingId === s.id;

        const getIcon = () => {
            switch (type) {
                case 'element':
                    if (data.element_type === 'character') return <User className="w-3.5 h-3.5" />;
                    if (data.element_type === 'location') return <MapPin className="w-3.5 h-3.5" />;
                    return <Shield className="w-3.5 h-3.5" />;
                case 'moment': return <Clock className="w-3.5 h-3.5" />;
                case 'connection': return <LinkIcon className="w-3.5 h-3.5" />;
                default: return <Sparkles className="w-3.5 h-3.5" />;
            }
        };

        const getTitle = () => {
            if (type === 'element') return data.name;
            if (type === 'moment') return data.title;
            if (type === 'connection') return `${data.from} → ${data.to}`;
            return 'Narrative Insight';
        };

        return (
            <div key={s.id} className="min-w-[280px] max-w-[280px] bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all animate-in slide-in-from-right-4 duration-500 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${type === 'element' ? 'bg-indigo-50 text-indigo-600' : type === 'moment' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                {getIcon()}
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{type}</span>
                        </div>
                        <span className="text-[8px] font-bold text-indigo-400 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                            {Math.round(data.confidence * 100 || 80)}% CONF
                        </span>
                    </div>

                    {isEditing ? (
                        <input
                            autoFocus
                            className="text-xs font-bold text-slate-900 w-full bg-slate-50 border border-indigo-200 rounded-lg px-2 py-1.5 outline-none mb-2"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(s)}
                        />
                    ) : (
                        <div className="group/title flex items-center justify-between gap-2 mb-1">
                            <h4 className="text-sm font-bold text-slate-800 truncate tracking-tight">{getTitle()}</h4>
                            <button onClick={() => startEditing(s)} className="opacity-0 group-hover/title:opacity-100 p-1 text-slate-300 hover:text-indigo-600 transition-all">
                                <Edit2 className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                    <p className="text-[11px] text-slate-500 italic line-clamp-2 leading-relaxed h-8">
                        {type === 'element' ? data.mention_phrase : type === 'moment' ? data.description : `Linked ${data.from} to ${data.to}`}
                    </p>
                </div>

                <div className="flex items-center gap-2 mt-4">
                    {isEditing ? (
                        <button onClick={() => saveEdit(s)} className="flex-1 py-1.5 bg-emerald-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                            Save
                        </button>
                    ) : (
                        <button onClick={() => confirm(s.id)} className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 shadow-transparent hover:shadow-indigo-100">
                            Confirm
                        </button>
                    )}
                    <button onClick={() => isEditing ? setEditingId(null) : reject(s.id)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full flex flex-col h-40">
            <div className="px-10 py-3 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Pending Narrative Truths</h3>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{suggestions.length} Awaiting Approval</span>
                </div>
            </div>
            <div className="flex-1 flex items-center gap-4 px-10 overflow-x-auto scrollbar-hide py-4">
                {suggestions.map(s => renderCard(s))}
                <div className="min-w-[100px] flex items-center justify-center">
                    <div className="text-slate-200">
                        <ChevronRight className="w-6 h-6" />
                    </div>
                </div>
            </div>
        </div>
    );
};
