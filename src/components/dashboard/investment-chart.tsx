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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Investment Overview</CardTitle>
          <div className="flex space-x-2">
            {periods.map((period) => (
              <Button
                key={period.key}
                variant={selectedPeriod === period.key ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod(period.key)}
                disabled={isLoading}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="byDay">By Day</TabsTrigger>
            <TabsTrigger value="byPlan">By Plan</TabsTrigger>
            <TabsTrigger value="byStatus">By Status</TabsTrigger>
          </TabsList>
          <TabsContent value="byDay">
            <div className="h-80">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData?.byDay || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `PKR ${value.toLocaleString()}`} />
                    <Tooltip formatter={(value) => [`PKR ${value.toLocaleString()}`, "Investment Amount"]} labelStyle={{ color: "#374151" }} contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} />
                    <Line type="monotone" dataKey="amount" stroke="hsl(207, 90%, 54%)" strokeWidth={3} dot={{ fill: "hsl(207, 90%, 54%)", strokeWidth: 2, r: 6 }} activeDot={{ r: 8, stroke: "hsl(207, 90%, 54%)", strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>
          <TabsContent value="byPlan">
            <div className="h-80">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData?.byPlan || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="plan" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `PKR ${value.toLocaleString()}`} />
                    <Tooltip formatter={(value) => [`PKR ${value.toLocaleString()}`, "Investment Amount"]} />
                    <Bar dataKey="amount" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>
          <TabsContent value="byStatus">
            <div className="h-80">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData?.byStatus || []} dataKey="amount" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                      {(chartData?.byStatus || []).map((entry: any, idx: number) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(value) => [`PKR ${value.toLocaleString()}`, "Investment Amount"]} />
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