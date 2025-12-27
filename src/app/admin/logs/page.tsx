"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { format } from "date-fns";
import { Layout } from "@/components/layout";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { adminApi } from "@/lib";
import type { LogEntry } from "../../../../shared/schema";

interface Log {
  id: number;
  userId: number | null;
  user?: { fullName: string; email: string } | null;
  action: string;
  details: string | null;
  createdAt: string;
}

const LOGS_PER_PAGE = 50;

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'daily' | 'weekly' | 'monthly' | 'calendar'>('daily');
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(undefined);
  const [calendarRange, setCalendarRange] = useState<{ from: Date; to: Date } | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [page, setPage] = useState(1);
  const [paused, setPaused] = useState(false);

  // Polling interval ref
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      fetchLogs();
    }, 5000);
    return () => clearInterval(interval);
  }, [paused, filter, calendarDate, calendarRange]);

  // Fetch logs function
  async function fetchLogs() {
    setLoading(true);
    setError(null);
    try {
      let filterParam = filter;
      let dateParam = undefined;
      if (filter === 'calendar') {
        if (calendarRange && calendarRange.from && calendarRange.to) {
          dateParam = `${calendarRange.from.toISOString().slice(0,10)},${calendarRange.to.toISOString().slice(0,10)}`;
        } else if (calendarDate) {
          dateParam = calendarDate.toISOString().slice(0,10);
        }
      }
      const logEntries: LogEntry[] = await adminApi.getLogs(
        filterParam + (dateParam ? `&date=${dateParam}` : "")
      );
      // Map LogEntry to Log type expected by UI
      const mappedLogs: Log[] = logEntries.map((entry) => ({
        id: entry._id as unknown as number, // fallback if _id is string
        userId: entry.userId ? entry.userId as unknown as number : null,
        user: entry.userId && typeof entry.userId === 'object' ? {
          fullName: (entry.userId as any).fullName || '',
          email: (entry.userId as any).email || '',
        } : null,
        action: entry.action || entry.message || '',
        details: typeof entry.details === 'string' ? entry.details : JSON.stringify(entry.details),
        createdAt: entry.timestamp ? new Date(entry.timestamp).toISOString() : '',
      }));
      setLogs(mappedLogs);
    } catch (err: any) {
      setError(err.message || "Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  }

  // Initial and filter/calendar change fetch
  useEffect(() => {
    if (!paused) fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, calendarDate, calendarRange, paused]);

  // Calculate paginated logs
  const totalPages = Math.ceil(logs.length / LOGS_PER_PAGE);
  const paginatedLogs = logs.slice((page - 1) * LOGS_PER_PAGE, page * LOGS_PER_PAGE);

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">System Logs</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">{filter.charAt(0).toUpperCase() + filter.slice(1)} Filter</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => { setFilter('daily'); setShowCalendar(false); }}>Daily</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setFilter('weekly'); setShowCalendar(false); }}>Weekly</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setFilter('monthly'); setShowCalendar(false); }}>Monthly</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setFilter('calendar'); setShowCalendar(true); }}>Calendar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant={paused ? 'secondary' : 'outline'} onClick={() => setPaused(p => !p)}>
              {paused ? 'Resume' : 'Pause'}
            </Button>
            {filter === 'calendar' && (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Button variant="outline" onClick={() => setShowCalendar((v) => !v)}>
                  {calendarRange && calendarRange.from && calendarRange.to
                    ? `${calendarRange.from.toLocaleDateString()} - ${calendarRange.to.toLocaleDateString()}`
                    : calendarDate
                      ? calendarDate.toLocaleDateString()
                      : 'Pick Date'}
                </Button>
                {showCalendar && (
                  <div className="z-50 bg-white rounded shadow p-2">
                    <Calendar
                      mode="range"
                      selected={calendarRange || undefined}
                      onSelect={(range) => {
                        if (range && range.from && range.to) {
                          setCalendarRange({ from: range.from, to: range.to });
                          setCalendarDate(undefined);
                          setShowCalendar(false);
                        } else if (range && range.from) {
                          setCalendarDate(range.from);
                          setCalendarRange(null);
                          setShowCalendar(false);
                        }
                      }}
                      numberOfMonths={2}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading logs...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No logs found.</div>
              ) : (
                <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                        <TableHead>Admin (User)</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {paginatedLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{format(new Date(log.createdAt), "yyyy-MM-dd HH:mm")}</TableCell>
                          <TableCell>
                            {log.user ? (
                              <div>
                                <div className="font-medium">{log.user.fullName}</div>
                                <div className="text-xs text-gray-500">{log.user.email}</div>
                              </div>
                            ) : (
                              log.userId ?? "-"
                            )}
                          </TableCell>
                        <TableCell>{log.action}</TableCell>
                          <TableCell>
                            <div className="whitespace-pre-wrap text-xs bg-gray-50 rounded p-2 max-w-xl overflow-x-auto">
                              {log.details ? (
                                <pre>{JSON.stringify(
                                  (() => { try { return JSON.parse(log.details); } catch { return log.details; } })(),
                                  null,
                                  2
                                )}</pre>
                              ) : "-"}
                            </div>
                          </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                  {/* Pagination controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-6 gap-2">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          className={`px-3 py-1 rounded border text-sm font-medium ${page === i + 1 ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                          onClick={() => setPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
} 