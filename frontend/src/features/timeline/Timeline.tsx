import React, { useState } from 'react';
import { useGetTimelineQuery } from '../../services/timeline';
import { useParams } from 'react-router-dom';
import { useUpdateMomentMutation, useDeleteMomentMutation } from '../../services/stories';
import { useRevertMomentMutation } from '../../services/suggestions';
import { Star, Trash2, RotateCcw, X, Check, Activity } from 'lucide-react';

export const Timeline: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: moments, isLoading } = useGetTimelineQuery(id!);
    const [updateMoment] = useUpdateMomentMutation();
    const [revertMoment] = useRevertMomentMutation();
    const [deleteMoment] = useDeleteMomentMutation();

    const [editingMoment, setEditingMoment] = useState<any>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');

    if (isLoading) return <div className="animate-pulse h-32 bg-slate-100 rounded-3xl" />;

    const startEditing = (m: any) => {
        setEditingMoment(m);
        setEditTitle(m.title);
        setEditDesc(m.description || '');
    };

    const handleSave = async () => {
        if (!editingMoment) return;
        await updateMoment({
            storyId: id!,
            momentId: editingMoment.id,
            updates: { title: editTitle, description: editDesc }
        });
        setEditingMoment(null);
    };

    const handleRevert = async () => {
        if (!editingMoment || !window.confirm("Revert this event back to a suggestion? It will reappear in your draft list.")) return;
        try {
            await revertMoment(editingMoment.id).unwrap();
            setEditingMoment(null);
        } catch (err) {
            alert("Could not revert this moment. It might be a core system event.");
        }
    };

    const handleDelete = async () => {
        if (!editingMoment || !window.confirm("Permanently delete this story moment?")) return;
        await deleteMoment({ storyId: id!, momentId: editingMoment.id });
        setEditingMoment(null);
    };

    return (
        <div className="relative py-12 px-4 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-12 min-w-max px-20">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 -z-10" />

                {moments?.map((moment: any, index: number) => {
                    const isMajor = moment.narrative_weight > 7;
                    const isSelected = editingMoment?.id === moment.id;

                    return (
                        <div
                            key={moment.id}
                            onClick={() => startEditing(moment)}
                            className={`relative flex flex-col items-center group cursor-pointer transition-all duration-300 ${isSelected ? 'scale-110' : ''}`}
                            style={{ width: '200px' }}
                        >
                            <div className={`
                                w-4 h-4 rounded-full border-4 border-slate-50 transition-all duration-300 z-10
                                ${isMajor ? 'scale-150 bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-400 group-hover:bg-indigo-400'}
                                ${isSelected ? 'ring-4 ring-indigo-200 bg-indigo-600 scale-150' : ''}
                            `}>
                                {isMajor && <Star className="w-2 h-2 text-white absolute inset-0 m-auto" />}
                            </div>

                            <div className={`
                                absolute w-48 text-center transition-all duration-300
                                ${index % 2 === 0 ? '-top-20' : 'top-10'}
                                ${isSelected ? 'opacity-100 scale-105' : 'opacity-80 group-hover:opacity-100 group-hover:scale-105'}
                            `}>
                                <h4 className={`font-bold text-sm line-clamp-1 ${isSelected ? 'text-indigo-600' : 'text-slate-800'}`}>
                                    {moment.title}
                                </h4>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter mt-1">
                                    {moment.description || 'Impact: ' + moment.narrative_weight}
                                </p>
                            </div>
                        </div>
                    );
                })}

                <div className="flex flex-col items-center opacity-30 select-none">
                    <div className="w-4 h-4 rounded-full bg-slate-200" />
                    <span className="text-[10px] font-bold text-slate-400 mt-4 italic uppercase">Continue...</span>
                </div>
            </div>

            {/* Editing Modal */}
            {editingMoment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-indigo-500" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Correct Timeline Event</span>
                            </div>
                            <button onClick={() => setEditingMoment(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Event Title</label>
                                <input
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full text-lg font-bold text-slate-900 bg-slate-50 border-2 border-slate-50 rounded-2xl px-4 py-3 outline-none focus:border-indigo-100 focus:bg-white transition-all"
                                    placeholder="The inciting incident..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">AI Interpretation</label>
                                <textarea
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    rows={4}
                                    className="w-full text-slate-600 text-sm leading-relaxed bg-slate-50 border-2 border-slate-50 rounded-2xl px-4 py-3 outline-none focus:border-indigo-100 focus:bg-white transition-all"
                                    placeholder="What actually happened in this moment?"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    onClick={handleSave}
                                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all"
                                >
                                    <Check className="w-4 h-4" />
                                    Update Timeline
                                </button>
                                <button
                                    onClick={handleRevert}
                                    className="p-4 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-2xl transition-all"
                                    title="Revert to Draft"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="p-4 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-2xl transition-all"
                                    title="Delete Moment"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
