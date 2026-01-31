import React from 'react';
import { useGetElementsQuery } from '../../services/elements';
import { useParams } from 'react-router-dom';
import { User, MapPin, Users, Info } from 'lucide-react';

export const EntityList: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: elements, isLoading } = useGetElementsQuery(id!);

    const categories = [
        { type: 'character', icon: <User className="w-4 h-4" />, label: 'Characters' },
        { type: 'location', icon: <MapPin className="w-4 h-4" />, label: 'Locations' },
        { type: 'organization', icon: <Users className="w-4 h-4" />, label: 'Factions & Orgs' },
    ];

    if (isLoading) return <div className="space-y-4 animate-pulse"><div className="h-10 bg-slate-100 rounded-lg w-full" /></div>;

    return (
        <div className="space-y-8">
            {categories.map((cat) => {
                const filtered = elements?.filter(e => e.element_type === cat.type);
                if (!filtered || filtered.length === 0) return null;

                return (
                    <div key={cat.type} className="animate-in fade-in slide-in-from-left-2 duration-500">
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <div className="text-slate-400">{cat.icon}</div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{cat.label}</h4>
                        </div>
                        <div className="space-y-3">
                            {filtered.map(element => (
                                <div
                                    key={element.id}
                                    className="group p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer overflow-hidden relative"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h5 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                            {element.name}
                                        </h5>
                                        {!element.user_confirmed && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-100" />
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                        {element.attributes?.description || 'Establishing presence...'}
                                    </p>

                                    {/* Decorative background icon */}
                                    <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                                        {React.cloneElement(cat.icon as React.ReactElement, { className: 'w-12 h-12' })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
