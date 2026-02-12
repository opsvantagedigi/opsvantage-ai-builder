"use client";

import { useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type CalendarValue = Date;

export default function ConciergeBookingPage() {
  const [selectedDate, setSelectedDate] = useState<CalendarValue | null>(null);

  const minAllowedDate = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3);
    return date;
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <section className="mx-auto max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/70 p-6 md:p-8">
        <h1 className="text-2xl font-semibold text-amber-200">Concierge Booking</h1>
        <p className="mt-2 text-sm text-slate-400">Select your consultation date. Earliest available date is 3 days from today.</p>

        <div className="mt-6 overflow-hidden rounded-xl border border-slate-700 bg-white p-4 text-slate-900">
          <Calendar
            value={selectedDate}
            onChange={(value) => setSelectedDate(value as Date)}
            minDate={minAllowedDate}
            tileDisabled={({ date }) => date < minAllowedDate}
          />
        </div>

        <div className="mt-4 text-sm text-slate-300">
          {selectedDate ? `Selected consultation date: ${selectedDate.toDateString()}` : "No date selected yet."}
        </div>
      </section>
    </main>
  );
}
