import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Video, FileText } from 'lucide-react';
import { api } from '../../api/client';

const CalendarWidget = ({ className = "" }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        time: '12:00',
        type: 'meeting' 
    });

   
    useEffect(() => {
        fetchEvents();
    }, [currentDate]);

    const fetchEvents = async () => {
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;

            // Get first and last day of month for valid range
            const start = `${year}-${month.toString().padStart(2, '0')}-01`;
            const lastDay = new Date(year, month, 0).getDate();
            const end = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;

            const res = await api.get('/api/calendar', { params: { start, end } });
            setEvents(res.data);
        } catch (err) {
            console.error("Failed to fetch events", err);
        }
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };



    const [viewMode, setViewMode] = useState('list'); // 'list' or 'add'

    const handleDayClick = (day) => {
        const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        setSelectedDate(dateStr);
        setViewMode('list'); // Default to list view
        setNewEvent({ ...newEvent, title: '', description: '', time: '09:00', type: 'meeting' });
        setIsModalOpen(true);
    };

    const handleCreateEvent = async () => {
        try {
            const dateTime = `${selectedDate} ${newEvent.time}:00`;
            await api.post('/api/calendar', {
                title: newEvent.title,
                description: newEvent.description,
                event_date: dateTime,
                event_type: newEvent.type,
                source: 'manual'
            });
            setViewMode('list'); // Go back to list
            fetchEvents(); // Refresh
        } catch (err) {
            alert("Failed to create event");
        }
    };

    // Calendar Helper
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sun
    const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // 0=Mon, 6=Sun

    const days = [];
    for (let i = 0; i < startingDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    // Get events for specific day - Helper to handle string dates
    const getEventsForDay = (day) => {
        if (!day) return [];
        // Construct YYYY-MM-DD
        const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

        return events.filter(e => {
            // Handle both ISO strings and custom formats if any
            const eDate = new Date(e.event_date);
            const eDateStr = `${eDate.getFullYear()}-${(eDate.getMonth() + 1).toString().padStart(2, '0')}-${eDate.getDate().toString().padStart(2, '0')}`;
            return eDateStr === dateStr;
        });
    };

    const getEventTypeColor = (type) => {
        switch (type) {
            case 'interview': return 'bg-emerald-400';
            case 'meeting': return 'bg-blue-400';
            case 'remark': return 'bg-yellow-400';
            default: return 'bg-zinc-400';
        }
    };

    return (
        <div className={`
            group relative overflow-visible
            bg-black/40 backdrop-blur-xl border border-white/10 
            rounded-3xl p-6 flex flex-col h-full 
            transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_40px_rgba(255,255,255,0.03)]
            ${className}
        `}>
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <CalendarIcon size={16} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white tracking-wide uppercase opacity-90">Calendar</h3>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={handlePrevMonth} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                            <ChevronLeft size={16} />
                        </button>
                        <button onClick={handleNextMonth} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Grid Header */}
                <div className="grid grid-cols-7 mb-2 text-center">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                        <div key={d} className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">{d}</div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 flex-1 content-start">
                    {days.map((day, idx) => {
                        const dayEvents = getEventsForDay(day);
                        const isToday = day === new Date().getDate() &&
                            currentDate.getMonth() === new Date().getMonth() &&
                            currentDate.getFullYear() === new Date().getFullYear();

                        return (
                            <div
                                key={idx}
                                onClick={() => day && handleDayClick(day)}
                                className={`
                                min-h-[60px] rounded-lg p-1.5 relative group border transition-all cursor-pointer
                                ${!day ? 'invisible border-transparent pointer-events-none' : 'border-white/5 hover:bg-white/5 hover:border-white/10'}
                                ${isToday ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-transparent'}
                            `}
                            >
                                {day && (
                                    <>
                                        <span className={`text-xs font-medium ${isToday ? 'text-indigo-300' : 'text-zinc-400'}`}>{day}</span>
                                        {/* Events Dots */}
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {dayEvents.slice(0, 4).map((ev, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1.5 w-1.5 rounded-full ${getEventTypeColor(ev.event_type)}`}
                                                    title={ev.title}
                                                />
                                            ))}
                                            {dayEvents.length > 4 && (
                                                <span className="text-[8px] text-zinc-600 leading-none">+</span>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm rounded-3xl" onClick={() => setIsModalOpen(false)}>
                        <div className="bg-[#09090b] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
                                <Plus size={20} className="rotate-45" />
                            </button>

                            <h3 className="text-lg font-bold text-white mb-1">
                                {viewMode === 'add' ? 'Add Note' : 'Daily Agenda'}
                            </h3>
                            <p className="text-xs text-zinc-500 mb-4 uppercase tracking-wider font-bold">
                                {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>

                            {viewMode === 'list' ? (
                                <div className="space-y-4">
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                                        {getEventsForDay(parseInt(selectedDate.split('-')[2])).length > 0 ? (
                                            getEventsForDay(parseInt(selectedDate.split('-')[2])).map((ev, i) => (
                                                <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5 flex gap-3">
                                                    <div className={`w-1 h-full rounded-full ${getEventTypeColor(ev.event_type)} flex-shrink-0`} />
                                                    <div className="overflow-hidden">
                                                        <h4 className="text-sm font-bold text-white truncate">{ev.title}</h4>
                                                        <p className="text-xs text-zinc-400 truncate">{ev.description || "No description"}</p>
                                                        <div className="flex gap-2 mt-1">
                                                            <span className="text-[9px] px-1.5 py-0.5 bg-white/5 rounded text-zinc-500 uppercase tracking-wide">
                                                                {new Date(ev.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            <span className="text-[9px] px-1.5 py-0.5 bg-white/5 rounded text-zinc-500 uppercase tracking-wide">
                                                                {ev.source === 'auto_application' ? 'Auto-Sync' : 'User Note'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-zinc-500 text-xs italic">
                                                No events scheduled for this day.
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setViewMode('add')}
                                        className="w-full py-2.5 rounded-lg border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus size={14} /> Add Note / Event
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {/* ADD FORM */}
                                    <div>
                                        <label className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider block mb-1">Title</label>
                                        <input
                                            type="text"
                                            className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                            placeholder="e.g. Follow up email"
                                            value={newEvent.title}
                                            onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider block mb-1">Time</label>
                                            <input
                                                type="time"
                                                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                                value={newEvent.time}
                                                onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider block mb-1">Type</label>
                                            <select
                                                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                                value={newEvent.type}
                                                onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}
                                            >
                                                <option value="meeting">Meeting</option>
                                                <option value="interview">Interview</option>
                                                <option value="remark">Remark (Note)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider block mb-1">Description</label>
                                        <textarea
                                            className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none h-20"
                                            placeholder="Add details here..."
                                            value={newEvent.description}
                                            onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className="flex-1 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 text-zinc-400 text-xs font-bold uppercase tracking-wider transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleCreateEvent}
                                            className="flex-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider transition-colors"
                                        >
                                            Save Note
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarWidget;
