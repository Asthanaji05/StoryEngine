import React from 'react';
import { useGetStoriesQuery, useCreateStoryMutation } from '../../services/stories';
import { useNavigate } from 'react-router-dom';
import { Plus, Book, Clock, ChevronRight } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const { data: stories, isLoading } = useGetStoriesQuery();
    const [createStory, { isLoading: isCreating }] = useCreateStoryMutation();
    const navigate = useNavigate();

    const handleCreateStory = async () => {
        try {
            const newStory = await createStory({ title: 'A New Narrative' }).unwrap();
            navigate(`/story/${newStory.id}`);
        } catch (err) {
            console.error('Failed to create story:', err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <Book className="text-white w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-900">Story Engine</span>
                    </div>
                    <button
                        onClick={() => {/* TODO: Profile/Logout */ }}
                        className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden"
                    >
                        {/* User avatar */}
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Your Narratives</h1>
                        <p className="text-slate-500 mt-1">Capture, understand, and evolve your worlds.</p>
                    </div>
                    <button
                        onClick={handleCreateStory}
                        disabled={isCreating}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                    >
                        <Plus className="w-5 h-5" />
                        New Story
                    </button>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-40 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                        ))}
                    </div>
                ) : stories?.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Book className="text-slate-400 w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-800">No stories yet</h3>
                        <p className="text-slate-500 mt-2 mb-6">Start your first narration and see it come alive.</p>
                        <button
                            onClick={handleCreateStory}
                            className="text-indigo-600 font-semibold hover:underline"
                        >
                            Begin a journey
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {stories?.map((story) => (
                            <div
                                key={story.id}
                                onClick={() => navigate(`/story/${story.id}`)}
                                className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                        <Book className="text-indigo-600 w-5 h-5 group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
                                        <Clock className="w-3 h-3" />
                                        {new Date(story.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                    {story.title}
                                </h3>
                                <p className="text-slate-500 mt-2 text-sm line-clamp-2">
                                    {story.description || 'No description yet. Start narrating to build your world.'}
                                </p>
                                <div className="mt-6 flex items-center text-sm font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Open Engine <ChevronRight className="w-4 h-4 ml-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};
