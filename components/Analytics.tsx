import React, { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Mood } from '../types';
import { MOOD_COLORS, MOOD_EMOJIS } from '../constants';
import { format, subDays, eachDayOfInterval, parseISO } from 'date-fns';
// FIX: Added XAxis and YAxis to imports
import { BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, XAxis, YAxis } from 'recharts';

const Heatmap: React.FC = () => {
    const { entries } = useAppContext();
    const endDate = new Date();
    const startDate = subDays(endDate, 90);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    const dataByDate = useMemo(() => {
        const map = new Map<string, { count: number; mood: Mood | null }>();
        for (const entry of entries) {
            const dateStr = format(parseISO(entry.date), 'yyyy-MM-dd');
            const existing = map.get(dateStr) || { count: 0, mood: null };
            existing.count++;
            // Use the mood of the first entry of the day for coloring
            if (!existing.mood) {
                existing.mood = entry.mood;
            }
            map.set(dateStr, existing);
        }
        return map;
    }, [entries]);

    const moodColorClasses: Record<Mood, string> = {
      [Mood.Happy]: 'bg-yellow-500/80', [Mood.Energetic]: 'bg-orange-500/80', [Mood.Calm]: 'bg-blue-500/80',
      [Mood.Sad]: 'bg-indigo-500/80', [Mood.Neutral]: 'bg-gray-500/80'
    };

    return (
        <div className="grid grid-cols-7 gap-1.5" style={{ gridAutoFlow: 'column', gridTemplateRows: `repeat(${Math.ceil(dateRange.length / 7)}, 1fr)` }}>
            {dateRange.map(date => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const data = dataByDate.get(dateStr);
                const colorClass = data ? moodColorClasses[data.mood!] : 'bg-secondary/50';
                return (
                    // FIX: Replaced recharts Tooltip component with the native title attribute.
                    // The Tooltip component from recharts is not a generic wrapper and was being used incorrectly.
                    <div
                        key={dateStr}
                        className={`w-full aspect-square rounded ${colorClass} transition-colors`}
                        title={`Entries on ${dateStr}: ${data?.count || 0}`}
                    >
                    </div>
                );
            })}
        </div>
    );
};

const Analytics: React.FC = () => {
    const { entries } = useAppContext();

    const moodDistribution = useMemo(() => Object.values(Mood).map(mood => ({
        name: mood,
        value: entries.filter(e => e.mood === mood).length,
    })), [entries]);
    
    const moodColorsForChart: Record<Mood, string> = {
        [Mood.Happy]: '#facc15', [Mood.Energetic]: '#fb923c', [Mood.Calm]: '#60a5fa',
        [Mood.Sad]: '#818cf8', [Mood.Neutral]: '#9ca3af'
    };

    const entriesByDay = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days.map((day, i) => ({
            name: day,
            entries: entries.filter(e => parseISO(e.date).getDay() === i).length
        }));
    }, [entries]);

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold">Analytics</h1>
            
            <div className="bg-secondary/30 backdrop-blur-sm border border-border p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">90-Day Activity</h2>
                <Heatmap />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-secondary/30 backdrop-blur-sm border border-border p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Mood Distribution</h2>
                    <div className="h-72">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={moodDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                {moodDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={moodColorsForChart[entry.name as Mood]} />
                                ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: "rgba(20, 20, 20, 0.8)", borderColor: "#4a5568" }}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                 <div className="bg-secondary/30 backdrop-blur-sm border border-border p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Entries by Day of Week</h2>
                     <div className="h-72">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={entriesByDay}>
                                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} />
                                <YAxis stroke="#a1a1aa" fontSize={12} />
                                <Tooltip contentStyle={{ background: "rgba(20, 20, 20, 0.8)", borderColor: "#4a5568" }}/>
                                <Bar dataKey="entries" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;