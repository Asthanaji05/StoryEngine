import React, { useMemo, useRef, useState, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useGetStoryConnectionsQuery, useGetStoryElementsQuery } from '../../services/stories';
import { useParams } from 'react-router-dom';

export const NarrativeGraph: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: elements } = useGetStoryElementsQuery(id!);
    const { data: connections } = useGetStoryConnectionsQuery(id!);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    // Handle responsiveness
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        // Use a small timeout to ensure layout has settled
        const timer = setTimeout(updateDimensions, 100);

        return () => {
            window.removeEventListener('resize', updateDimensions);
            clearTimeout(timer);
        };
    }, []);

    const graphData = useMemo(() => {
        if (!elements || !connections) return { nodes: [], links: [] };

        const nodes = elements.map(el => ({
            id: el.id,
            name: el.name,
            type: el.element_type,
            val: el.element_type === 'character' ? 8 : 5,
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
        <div ref={containerRef} className="flex-1 w-full h-full bg-white rounded-3xl border border-slate-100 overflow-hidden relative group shadow-inner shadow-slate-50">
            <div className="absolute top-8 left-8 z-10 pointer-events-none">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 opacity-50">Narrative Intelligence Graph</h3>
                <div className="flex gap-6 mt-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-200" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Characters</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Organizations</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-200" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Locations</span>
                    </div>
                </div>
            </div>

            {graphData.nodes.length > 0 ? (
                <ForceGraph2D
                    graphData={graphData}
                    width={dimensions.width}
                    height={dimensions.height}
                    nodeLabel="name"
                    nodeRelSize={6}
                    linkColor={() => '#f1f5f9'}
                    linkDirectionalArrowLength={4}
                    linkDirectionalArrowRelPos={1}
                    linkWidth={1.5}
                    backgroundColor="#ffffff"
                    nodeCanvasObject={(node: any, ctx, globalScale) => {
                        const label = node.name;
                        const fontSize = 14 / globalScale;
                        ctx.font = `${fontSize}px Inter, sans-serif`;

                        // Draw shadow/glow
                        ctx.shadowColor = 'rgba(0,0,0,0.05)';
                        ctx.shadowBlur = 4;

                        // Draw Node dot
                        ctx.fillStyle = node.color;
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
                        ctx.fill();

                        // Reset shadow
                        ctx.shadowBlur = 0;

                        // Draw Label
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = '#1e293b';
                        ctx.fillText(label, node.x, node.y + 12);
                    }}
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <p className="text-sm font-medium italic animate-pulse tracking-wide">Synthesizing narrative network...</p>
                </div>
            )}
        </div>
    );
};
