import React from 'react';
import { useGetTimelineQuery } from '../../services/timeline';
import { useParams } from 'react-router-dom';
import { Circle, Flag, Star } from 'lucide-react';

export const Timeline: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: moments, isLoading } = useGetTimelineQuery(id!);

    if (isLoading) return <div className="animate-pulse h-32 bg-slate-100 rounded-3xl" />;

    return (
        <div className="relative py-12 px-4 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-12 min-w-max px-20">
                {/* The Timeline Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 -z-10" />

                {moments?.map((moment, index) => {
                    const isMajor = moment.narrative_weight > 7;
                    const emotion = Object.keys(moment.emotional_signature)[0] || 'neutral';

                    return (
                        <div
                            key={moment.id}
                            className="relative flex flex-col items-center group cursor-pointer"
                            style={{ width: '200px' }}
                        >
                            {/* Connector dot */}
                            <div className={`
                w-4 h-4 rounded-full border-4 border-slate-50 transition-all duration-300 z-10
                ${isMajor ? 'scale-150 bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-400 group-hover:bg-indigo-400'}
              `}>
                                {isMajor && <Star className="w-2 h-2 text-white absolute inset-0 m-auto" />}
                            </div>

                            {/* Label - Above or Below */}
                            <div className={`
                absolute w-48 text-center transition-all duration-300
                ${index % 2 === 0 ? '-top-20' : 'top-10'}
                opacity-80 group-hover:opacity-100 group-hover:scale-105
              `}>
                                <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{moment.title}</h4>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter mt-1">
                                    {moment.description || 'Impact: ' + moment.narrative_weight}
                                </p>
                            </div>

                            {/* Progress pulse for the current moment */}
                            {index === (moments?.length || 0) - 1 && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-500/20 rounded-full animate-ping -z-0" />
                            )}
                        </div>
                    );
                })}

                {/* Placeholder for the "Developing..." edge */}
                <div className="flex flex-col items-center opacity-30 select-none">
                    <div className="w-4 h-4 rounded-full bg-slate-200" />
                    <span className="text-[10px] font-bold text-slate-400 mt-4 italic uppercase">Narration continues...</span>
                </div>
            </div>
        </div>
    );
};
