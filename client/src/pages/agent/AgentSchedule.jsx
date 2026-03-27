// client/src/pages/agent/AgentSchedule.jsx
import { useState, useEffect } from 'react';
import { CalendarDays, Clock, Moon, Sun, Sunrise, Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import toast from 'react-hot-toast';

// BUG FIX: Renamed component from AgentPayslips to AgentSchedule
export default function AgentSchedule() {
    const [shifts, setShifts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMyShifts();
    }, []);

    const fetchMyShifts = async () => {
        try {
            // 1. Get the Agent's secure session token
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;
            if (!session) return;

            // 2. Fetch shifts (Backend secure routing handles the specific user filtering)
            const response = await fetch('https://bpo-backend-vemc.onrender.com/api/shifts', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch schedule');

            const data = await response.json();
            // Assuming pagination metadata is returned, extract the data array
            setShifts(data.data || data); 
        } catch (error) {
            console.error("Fetch Error:", error);
            toast.error("Could not load your schedule.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- HELPER FUNCTIONS FOR FORMATTING ---

    // Safely parse "YYYY-MM-DD" without timezone bugs jumping back a day
    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
        });
    };

    // Convert "09:00:00" to "9:00 AM"
    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hour, minute] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hour, 10));
        date.setMinutes(parseInt(minute, 10));
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    // Get dynamic styles based on shift type
    const getShiftTheme = (type) => {
        switch (type) {
            case 'morning':
                return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: <Sunrise className="h-6 w-6 text-amber-500" /> };
            case 'evening':
                return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: <Sun className="h-6 w-6 text-blue-500" /> };
            case 'night':
                return { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', icon: <Moon className="h-6 w-6 text-indigo-500" /> };
            default:
                return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', icon: <Clock className="h-6 w-6 text-slate-500" /> };
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center space-x-3 mb-8">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                    <CalendarDays className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Schedule</h1>
                    <p className="text-sm text-slate-500 mt-1">View your upcoming assigned shifts and hours.</p>
                </div>
            </div>

            {/* Schedule Feed */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center items-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : shifts.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-sm">
                        <CalendarDays className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-800">No Upcoming Shifts</h3>
                        <p className="text-slate-500 mt-2">You currently have no shifts assigned. Enjoy your time off!</p>
                    </div>
                ) : (
                    shifts.map((shift) => {
                        const theme = getShiftTheme(shift.shift_type);

                        return (
                            <div key={shift.id} className={`flex items-center p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md bg-white ${theme.border}`}>

                                {/* Icon Box */}
                                <div className={`flex items-center justify-center h-14 w-14 rounded-xl ${theme.bg} mr-6`}>
                                    {theme.icon}
                                </div>

                                {/* Shift Info */}
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                                        {formatDate(shift.shift_date)}
                                    </h3>
                                    <div className="flex items-center space-x-4 text-sm font-medium">
                                        <span className={`uppercase tracking-wider px-2.5 py-1 rounded-md ${theme.bg} ${theme.text}`}>
                                            {shift.shift_type} Shift
                                        </span>
                                        <span className="flex items-center text-slate-600">
                                            <Clock className="h-4 w-4 mr-1.5 text-slate-400" />
                                            {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                                        </span>
                                    </div>
                                </div>

                                {/* Night Shift Badge (Optional Callout) */}
                                {shift.is_night_shift && (
                                    <div className="hidden sm:block">
                                        <span className="px-3 py-1 bg-slate-800 text-slate-100 text-xs font-bold rounded-full uppercase tracking-wider">
                                            Night Premium
                                        </span>
                                    </div>
                                )}

                            </div>
                        );
                    })
                )}
            </div>

        </div>
    );
}