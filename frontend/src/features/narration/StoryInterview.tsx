import React, { useState } from 'react';
import { Sparkles, ArrowRight, User, MapPin, Target } from 'lucide-react';

interface StoryInterviewProps {
    onComplete: (answers: string[]) => void;
}

const QUESTIONS = [
    {
        icon: <User className="w-6 h-6" />,
        question: "Let's meet your main character. Describe them like you're telling a friend.",
        placeholder: "e.g. Mikey's this messed-up kid with golden hair...",
    },
    {
        icon: <Target className="w-6 h-6" />,
        question: "What's their biggest problem right now?",
        placeholder: "e.g. His own darkness keeps pulling him down while he tries to protect his friends.",
    },
    {
        icon: <MapPin className="w-6 h-6" />,
        question: "Where does this story take place? Describe the vibe.",
        placeholder: "e.g. A gritty, neon-lit version of Tokyo where the streets never sleep.",
    },
    {
        icon: <Sparkles className="w-6 h-6" />,
        question: "What's the 'spark' that changes everything today?",
        placeholder: "e.g. He finds a letter from his brother who disappeared 5 years ago.",
    },
];

export const StoryInterview: React.FC<StoryInterviewProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [currentAnswer, setCurrentAnswer] = useState('');

    const handleNext = () => {
        if (!currentAnswer.trim()) return;

        const newAnswers = [...answers, currentAnswer];
        if (step < QUESTIONS.length - 1) {
            setAnswers(newAnswers);
            setCurrentAnswer('');
            setStep(step + 1);
        } else {
            onComplete(newAnswers);
        }
    };

    const progress = ((step + 1) / QUESTIONS.length) * 100;

    return (
        <div className="max-w-2xl mx-auto py-12 px-6">
            <div className="mb-12">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
                            Phase 1: Extraction
                        </span>
                        <h2 className="text-3xl font-bold text-slate-900 mt-4">Establishing Context</h2>
                    </div>
                    <span className="text-sm font-bold text-slate-400">
                        Step {step + 1} of {QUESTIONS.length}
                    </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        {QUESTIONS[step].icon}
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 leading-tight">
                        {QUESTIONS[step].question}
                    </h3>
                </div>

                <textarea
                    autoFocus
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder={QUESTIONS[step].placeholder}
                    rows={5}
                    className="w-full p-6 bg-white border border-slate-200 rounded-3xl shadow-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-lg text-slate-800 placeholder:text-slate-300 resize-none"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            handleNext();
                        }
                    }}
                />

                <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400 font-medium italic">
                        Tip: Press {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + Enter to continue
                    </p>
                    <button
                        onClick={handleNext}
                        disabled={!currentAnswer.trim()}
                        className="flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-xl hover:shadow-2xl disabled:opacity-30 disabled:shadow-none translate-y-0 active:translate-y-1"
                    >
                        Next Question
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="mt-20 p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    <Sparkles className="text-indigo-600 w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-indigo-900 text-sm">Why are we doing this?</h4>
                    <p className="text-indigo-700 text-sm mt-1 leading-relaxed">
                        Story Engine needs a baseline understanding of your narrative. By answering these, you're building the core narrative intelligence that will help it understand everything you narrate later.
                    </p>
                </div>
            </div>
        </div>
    );
};
