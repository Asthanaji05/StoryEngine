import React, { useMemo } from 'react';
import { useGetStoryConnectionsQuery, useGetStoryElementsQuery, useGetStoryMentionsQuery } from '../../services/stories';
import { useParams } from 'react-router-dom';
import { Share2, User, MapPin, Shield, Zap, ArrowDown, Users } from 'lucide-react';

export const NarrativeGraph: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: elements } = useGetStoryElementsQuery(id!);
    const { data: connections } = useGetStoryConnectionsQuery(id!);
    const { data: mentions } = useGetStoryMentionsQuery(id!);

    const nexusItems = useMemo(() => {
        if (!connections || !elements) return [];

        // Map IDs to names for easy lookup
        const elementMap = elements.reduce((acc, el) => {
            acc[el.id] = el;
            return acc;
        }, {} as Record<string, any>);

        return connections.map(conn => ({
            ...conn,
            from: elementMap[conn.from_id],
            to: elementMap[conn.to_id],
        })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [connections, elements]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'character': return <User className="w-4 h-4" />;
            case 'location': return <MapPin className="w-4 h-4" />;
            case 'organization': return <Shield className="w-4 h-4" />;
            default: return <Zap className="w-4 h-4" />;
        }
    };

    if (!nexusItems.length) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                <div className="p-6 bg-slate-50 rounded-full mb-4">
                    <Share2 className="w-10 h-10 opacity-20" />
                </div>
                <p className="text-sm font-medium italic tracking-wide">No relationships mapped yet.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 h-full overflow-y-auto px-4 pb-20 scrollbar-hide">
            <div className="max-w-2xl mx-auto py-10 space-y-12">
                <div className="text-center space-y-2 mb-16">
                    <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em]">Vertical Narrative Nexus</h3>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Evolving Relationships</h2>
                </div>

                <div className="relative space-y-0">
                    {nexusItems.map((conn, idx) => (
                        <div key={conn.id} className="relative pl-12 pb-16 group">
                            {/* Vertical Line */}
                            {idx !== nexusItems.length - 1 && (
                                <div className="absolute left-5 top-10 w-[2px] h-full bg-slate-100 group-hover:bg-indigo-100 transition-colors" />
                            )}

                            {/* Connector Icon */}
                            <div className="absolute left-0 top-1.5 w-10 h-10 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 group-hover:border-indigo-400 group-hover:text-indigo-600 transition-all shadow-sm z-10">
                                <Zap className="w-4 h-4" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm group-hover:shadow-xl group-hover:border-indigo-50 transition-all duration-500">
                                {/* From Entity */}
                                <div className="flex flex-col items-center text-center space-y-2">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                        {getIcon(conn.from?.element_type)}
                                    </div>
                                    <span className="text-sm font-bold text-slate-800 tracking-tight">{conn.from?.name || 'Unknown'}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{conn.from?.element_type}</span>
                                </div>

                                {/* Connection Type */}
                                <div className="flex flex-col items-center space-y-3">
                                    <div className="px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <span className="text-[10px] font-bold uppercase tracking-wider">{conn.connection_type}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-1 h-1 rounded-full ${i < (conn.weight / 2) ? 'bg-indigo-400' : 'bg-slate-200'}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* To Entity */}
                                <div className="flex flex-col items-center text-center space-y-2">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                        {getIcon(conn.to?.element_type)}
                                    </div>
                                    <span className="text-sm font-bold text-slate-800 tracking-tight">{conn.to?.name || 'Unknown'}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{conn.to?.element_type}</span>
                                </div>
                            </div>

                            {/* Connection Description */}
                            <div className="mt-4 ml-8">
                                <p className="text-xs text-slate-400 italic font-medium leading-relaxed max-w-md">
                                    "{conn.description || 'A connection established in the narrative.'}"
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
