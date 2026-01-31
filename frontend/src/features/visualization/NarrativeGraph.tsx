import React, { useMemo, useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useGetStoryConnectionsQuery, useGetStoryElementsQuery } from '../../services/stories';
import { useParams } from 'react-router-dom';

export const NarrativeGraph: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: elements } = useGetStoryElementsQuery(id!);
    const { data: connections } = useGetStoryConnectionsQuery(id!);
    const containerRef = useRef<HTMLDivElement>(null);

    const graphData = useMemo(() => {
        if (!elements || !connections) return { nodes: [], links: [] };

        const nodes = elements.map(el => ({
            id: el.id,
            name: el.name,
            type: el.element_type,
            val: el.element_type === 'character' ? 5 : 3,
            color: el.element_type === 'character' ? '#6366f1' : el.element_type === 'organization' ? '#10b981' : '#f59e0b'
        }));

        const links = connections.map(conn => ({
            source: conn.from_id,
            target: conn.to_id,
            label: conn.connection_type
        }));

        return { nodes, links };
    }, [elements, connections]);

    return (
        <div ref={containerRef} className="w-full h-[400px] bg-white rounded-3xl border border-slate-100 overflow-hidden relative group">
            <div className="absolute top-6 left-6 z-10">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Narrative Intelligence Graph</h3>
                <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Characters</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Organizations</span>
                    </div>
                </div>
            </div>

            {graphData.nodes.length > 0 ? (
                <ForceGraph2D
                    graphData={graphData}
                    width={containerRef.current?.clientWidth || 800}
                    height={400}
                    nodeLabel="name"
                    nodeRelSize={6}
                    linkColor={() => '#e2e8f0'}
                    linkDirectionalArrowLength={3}
                    linkDirectionalArrowRelPos={1}
                    nodeCanvasObject={(node: any, ctx, globalScale) => {
                        const label = node.name;
                        const fontSize = 12 / globalScale;
                        ctx.font = `${fontSize}px Inter, sans-serif`;
                        const textWidth = ctx.measureText(label).width;
                        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

                        ctx.fillStyle = node.color;
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
                        ctx.fill();

                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = '#1e293b';
                        ctx.fillText(label, node.x, node.y + 10);
                    }}
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <p className="text-sm font-medium italic">Establishing narrative connections...</p>
                </div>
            )}
        </div>
    );
};
