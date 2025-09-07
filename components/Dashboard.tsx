
import React, { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Book, Feather, Calendar, TrendingUp, History } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DiaryEntry, Mood } from '../types';
import { MOOD_COLORS, MOOD_EMOJIS } from '../constants';
import { format, parseISO, isSameDay, subDays } from 'date-fns';

const StatCard: React.FC<{ icon: React.ReactNode, title: string, value: string | number, color: string }> = ({ icon, title, value, color }) => (
    <div className="bg-secondary/30 backdrop-blur-sm border border-border p-6 rounded-lg flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-muted-foreground text-sm">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

const RecentEntryCard: React.FC<{ entry: DiaryEntry }> = ({ entry }) => (
    <div className={`p-4 rounded-lg border ${MOOD_COLORS[entry.mood]} bg-secondary/30`}>
        <p className="font-bold truncate">{entry.title}</p>
        <p className="text-sm text-muted-foreground">{format(parseISO(entry.date), 'MMMM d, yyyy')}</p>
    </div>
);

const OnThisDayCard: React.FC<{ entry: DiaryEntry }> = ({ entry }) => {
    const year = parseISO(entry.date).getFullYear();
    return (
        <div className="bg-secondary/30 backdrop-blur-sm border border-border p-4 rounded-lg">
            <p className="text-sm font-semibold text-purple-300 mb-1">From {year}</p>
            <p className="font-bold truncate">{entry.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{entry.content}</p>
        </div>
    );
};

const Dashboard: React.FC = () => {
    const { entries, settings } = useAppContext();

    const stats = useMemo(() => {
        const totalEntries = entries.length;
        const words = entries.reduce((acc, e) => acc + e.content.split(/\s+/).length, 0);
        const avgWords = totalEntries > 0 ? Math.round(words / totalEntries) : 0;
        const lastMonthEntries = entries.filter(e => parseISO(e.date) > subDays(new Date(), 30)).length;
        return { totalEntries, avgWords, lastMonthEntries };
    }, [entries]);

    const recentEntries = useMemo(() => {
        return [...entries]
            .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
            .slice(0, 5);
    }, [entries]);

    const moodFrequency = useMemo(() => {
        const moodMap = entries.reduce((acc, entry) => {
            acc[entry.mood] = (acc[entry.mood] || 0) + 1;
            return acc;
        }, {} as Record<Mood, number>);

        return Object.entries(moodMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [entries]);

    const onThisDayEntries = useMemo(() => {
        const today = new Date();
        const todayMonth = today.getMonth();
        const todayDate = today.getDate();

        return entries.filter(entry => {
            const entryDate = parseISO(entry.date);
            // Don't show today's entry in "On This Day"
            if (isSameDay(today, entryDate)) return false; 
            
            return entryDate.getMonth() === todayMonth && entryDate.getDate() === todayDate;
        }).sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
    }, [entries]);


    return (
        <div className="space-y-6">
            <h1 className="text-4xl font-bold">Welcome back, {settings.userName}!</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={<Book size={24} />} title="Total Entries" value={stats.totalEntries} color="bg-blue-500/30 text-blue-300" />
                <StatCard icon={<Feather size={24} />} title="Avg. Words" value={stats.avgWords} color="bg-green-500/30 text-green-300" />
                <StatCard icon={<Calendar size={24} />} title="Last 30 Days" value={stats.lastMonthEntries} color="bg-purple-500/30 text-purple-300" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-secondary/30 backdrop-blur-sm border border-border p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Recent Entries</h2>
                    <div className="space-y-3">
                        {recentEntries.length > 0 ? recentEntries.map(entry => (
                           <RecentEntryCard key={entry.id} entry={entry} />
                        )) : <p className="text-muted-foreground">No recent entries found.</p>}
                    </div>
                </div>

                <div className="bg-secondary/30 backdrop-blur-sm border border-border p-6 rounded-lg">
                     <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                        <TrendingUp size={22} />
                        <span>Mood Frequency</span>
                    </h2>
                    <div className="space-y-3">
                        {moodFrequency.map(mood => (
                             <div key={mood.name} className="flex items-center">
                                <span className={`text-2xl mr-3 ${MOOD_COLORS[mood.name as Mood]}`}>{MOOD_EMOJIS[mood.name as Mood]}</span>
                                <span className="text-sm font-medium flex-grow">{mood.name}</span>
                                <span className="text-sm font-bold">{mood.value}</span>
                            </div>
                        ))}
                         {moodFrequency.length === 0 && <p className="text-muted-foreground text-sm">No mood data yet.</p>}
                    </div>
                </div>
            </div>

            {onThisDayEntries.length > 0 && (
                 <div className="bg-secondary/30 backdrop-blur-sm border border-border p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                        <History size={22} className="text-purple-300"/>
                        <span>On This Day</span>
                    </h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {onThisDayEntries.map(entry => (
                            <OnThisDayCard key={entry.id} entry={entry} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;