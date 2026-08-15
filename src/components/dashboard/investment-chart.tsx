"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart, Bar } from "recharts";
import { PieChart, Pie, Cell, Legend } from "recharts";

interface ChartData {
  level: string;
  amount: number;
}

export function InvestmentChart() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("30D");
  const [tab, setTab] = useState<string>("byDay");

  const { data: chartData, isLoading, error } = useQuery({
    queryKey: ["dashboard/investment-chart", selectedPeriod],
    queryFn: () => dashboardApi.getInvestmentChart(selectedPeriod),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const periods = [
    { key: "7D", label: "7D" },
    { key: "30D", label: "30D" },
    { key: "90D", label: "90D" },
  ];

  const COLORS = ["#2563eb", "#22c55e", "#f59e42", "#e11d48", "#a21caf", "#0ea5e9", "#fbbf24", "#10b981", "#6366f1"];

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Investment Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80 text-red-500">
            Failed to load chart data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-sky-500/25 bg-[#0e2238]/90 overflow-hidden">
      <CardHeader className="border-b border-sky-500/20 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl font-extrabold font-display text-white">Portfolio Growth Analytics</CardTitle>
          <div className="flex bg-[#07172b] p-1 rounded-xl border border-sky-500/25">
            {periods.map((period) => (
              <Button
                key={period.key}
                variant={selectedPeriod === period.key ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod(period.key)}
                disabled={isLoading}
                className={`rounded-lg text-xs font-bold px-3 ${selectedPeriod === period.key ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-sky-500/30' : 'text-slate-300 hover:text-white'}`}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="mb-6 bg-[#07172b] border border-sky-500/25 p-1 rounded-xl">
            <TabsTrigger value="byDay" className="rounded-lg text-xs font-bold data-[state=active]:bg-sky-500 data-[state=active]:text-white">By Timeline</TabsTrigger>
            <TabsTrigger value="byPlan" className="rounded-lg text-xs font-bold data-[state=active]:bg-sky-500 data-[state=active]:text-white">By Investment Plan</TabsTrigger>
            <TabsTrigger value="byStatus" className="rounded-lg text-xs font-bold data-[state=active]:bg-sky-500 data-[state=active]:text-white">By Status</TabsTrigger>
          </TabsList>
          <TabsContent value="byDay">
            <div className="h-80">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-full w-full bg-slate-800/50 rounded-2xl" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData?.byDay || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value.toLocaleString()}`} />
                    <Tooltip
                      formatter={(value) => [`$${value.toLocaleString()}`, "Investment Amount"]}
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        borderColor: "rgba(255, 255, 255, 0.15)",
                        borderRadius: "12px",
                        backdropFilter: "blur(12px)",
                        color: "#f8fafc",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#38bdf8"
                      strokeWidth={3}
                      dot={{ fill: "#38bdf8", strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 8, stroke: "#60a5fa", strokeWidth: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>
          <TabsContent value="byPlan">
            <div className="h-80">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-full w-full bg-slate-800/50 rounded-2xl" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData?.byPlan || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="plan" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value.toLocaleString()}`} />
                    <Tooltip
                      formatter={(value) => [`$${value.toLocaleString()}`, "Investment Amount"]}
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        borderColor: "rgba(255, 255, 255, 0.15)",
                        borderRadius: "12px",
                        color: "#f8fafc"
                      }}
                    />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>
          <TabsContent value="byStatus">
            <div className="h-80">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-full w-full bg-slate-800/50 rounded-2xl" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData?.byStatus || []} dataKey="amount" nameKey="status" cx="50%" cy="50%" outerRadius={90} label>
                      {(chartData?.byStatus || []).map((entry: any, idx: number) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: "12px" }} />
                    <Tooltip
                      formatter={(value) => [`$${value.toLocaleString()}`, "Investment Amount"]}
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        borderColor: "rgba(255, 255, 255, 0.15)",
                        borderRadius: "12px",
                        color: "#f8fafc"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}