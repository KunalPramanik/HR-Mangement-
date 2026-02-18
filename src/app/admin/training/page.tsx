'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function TrainingPage() {
    const [trainings, setTrainings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedTraining, setSelectedTraining] = useState<any | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        instructor: '',
        startDate: '',
        endDate: '',
        durationHours: 1,
        type: 'Technical',
        description: ''
    });

    useEffect(() => {
        fetchTrainings();
    }, []);

    const fetchTrainings = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/training');
            if (res.ok) {
                const data = await res.json();
                setTrainings(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            const res = await fetch('/api/training', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('Training Scheduled');
                setShowModal(false);
                fetchTrainings();
                setFormData({
                    title: '',
                    instructor: '',
                    startDate: '',
                    endDate: '',
                    durationHours: 1,
                    type: 'Technical',
                    description: ''
                });
            } else {
                toast.error('Failed to create training');
            }
        } catch (error) {
            toast.error('Error creating training');
        }
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto pb-20">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Training Programs</h1>
                    <p className="text-slate-500 mt-1">Manage learning and development initiatives.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-500/30"
                >
                    <span className="material-symbols-outlined">add</span>
                    Schedule Training
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">progress_activity</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trainings.map(training => (
                        <div key={training._id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500 opacity-5 rounded-bl-full group-hover:scale-110 transition-transform"></div>

                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${training.type === 'Technical' ? 'bg-blue-100 text-blue-700' :
                                    training.type === 'Soft Skills' ? 'bg-purple-100 text-purple-700' :
                                        training.type === 'Compliance' ? 'bg-orange-100 text-orange-700' :
                                            'bg-gray-100 text-gray-700'
                                    }`}>
                                    {training.type}
                                </span>
                                <span className={`text-xs font-bold px-2 py-1 rounded border ${training.status === 'Scheduled' ? 'text-blue-600 border-blue-200' :
                                    training.status === 'In Progress' ? 'text-green-600 border-green-200' :
                                        'text-gray-500 border-gray-200'
                                    }`}>
                                    {training.status}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{training.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{training.description}</p>

                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 mb-2">
                                <span className="material-symbols-outlined text-sm">calendar_month</span>
                                {new Date(training.startDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 mb-4">
                                <span className="material-symbols-outlined text-sm">schedule</span>
                                {training.durationHours} Hours • {training.instructor}
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <span className="text-xs text-slate-400 font-bold">{training.attendees?.length || 0} Enrolled</span>
                                <button
                                    onClick={() => setSelectedTraining(training)}
                                    className="text-blue-600 font-bold text-sm hover:underline"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                    {trainings.length === 0 && (
                        <div className="col-span-3 text-center py-12 text-gray-400">
                            No training sessions scheduled.
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg p-8 shadow-2xl animate-fadeIn" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Schedule New Training</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Title *</label>
                                <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 border-slate-200 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Type</label>
                                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 border-slate-200 outline-none">
                                        {['Technical', 'Soft Skills', 'Compliance', 'Onboarding', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Duration (Hours)</label>
                                    <input type="number" value={formData.durationHours} onChange={e => setFormData({ ...formData, durationHours: Number(e.target.value) })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 border-slate-200 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Instructor</label>
                                <input value={formData.instructor} onChange={e => setFormData({ ...formData, instructor: e.target.value })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 border-slate-200 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                                    <input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 border-slate-200 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                                    <input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 border-slate-200 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 border-slate-200 outline-none resize-none" />
                            </div>

                            <button onClick={handleCreate} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 mt-2">
                                Schedule Session
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Detail Modal */}
            {selectedTraining && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedTraining(null)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg p-8 shadow-2xl animate-fadeIn" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedTraining.title}</h2>
                            <button onClick={() => setSelectedTraining(null)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                                <span className="material-symbols-outlined text-slate-500">close</span>
                            </button>
                        </div>

                        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Type</label>
                                    <span className="font-bold text-slate-900 dark:text-white">{selectedTraining.type}</span>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Status</label>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${selectedTraining.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                                        selectedTraining.status === 'In Progress' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                        }`}>{selectedTraining.status}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Date & Time</label>
                                <div className="font-medium">
                                    {new Date(selectedTraining.startDate).toLocaleDateString()} - {new Date(selectedTraining.endDate).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-slate-500">{selectedTraining.durationHours} Hours duration</div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Instructor</label>
                                <div className="font-medium">{selectedTraining.instructor}</div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
                                <p className="leading-relaxed">{selectedTraining.description}</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Enrolled Attendees ({selectedTraining.attendees?.length || 0})</label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedTraining.attendees?.length > 0 ? selectedTraining.attendees.map((a: any) => (
                                        <span key={a} className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs">{a}</span>
                                    )) : <span className="text-slate-400 italic">No enrolled employees</span>}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setSelectedTraining(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

