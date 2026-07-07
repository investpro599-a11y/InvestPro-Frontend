import { useQuery } from '@tanstack/react-query';
import { dashboardApi, commissionApi } from '@/lib';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export function UserPortfolio() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard/stats'],
    queryFn: dashboardApi.getStats,
  });

  const { data: commissionStats } = useQuery({
    queryKey: ['commissions'],
    queryFn: commissionApi.getAll,
  });

  if (isLoading || !stats) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Portfolio Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">Loading portfolio data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Your Portfolio Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="font-medium">Total Invested (Active):</p>
            <p className="text-2xl font-bold text-green-700">PKR {(stats.investmentAmount ?? 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="font-medium">Unpaid ROI:</p>
            <p className="text-2xl font-bold text-blue-700">PKR {(stats.unpaidROI ?? 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="font-medium">Unpaid Commissions:</p>
            <p className="text-xl text-purple-700">${parseFloat(String(stats.unpaidCommissions ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="font-medium">Direct Commissions:</p>
            <p className="text-xl">${parseFloat(String(stats.directCommissions ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="font-medium">Total Commissions:</p>
            <p className="text-xl text-purple-700">${parseFloat(String(stats.totalCommissions ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="font-medium">Total Referrals:</p>
            <p className="text-xl">{stats.totalReferrals ?? 0} ({stats.activeReferrals ?? 0} active)</p>
          </div>
          <div>
            <p className="font-medium">Investment %:</p>
            <p className="text-xl">{stats.investmentPercentage ?? '0.0'}%</p>
          </div>
          <div>
            <p className="font-medium">Commission %:</p>
            <p className="text-xl">{stats.commissionPercentage ?? '0.0'}%</p>
          </div>
        </div>
        {/* ROI Block */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2">ROI Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1">Unpaid ROI</span>
              <span className="text-2xl font-bold text-green-700">PKR {(stats.unpaidROI ?? 0).toLocaleString()}</span>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1">ROI %</span>
              <span className="text-2xl font-bold text-blue-700">{stats.roiPercentage ?? '0.0'}%</span>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1">Investment Growth</span>
              <span className="text-2xl font-bold text-purple-700">{stats.investmentGrowth ?? '0.0'}%</span>
            </div>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Commission Breakdown</h3>
          {commissionStats && commissionStats.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 mb-4">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 9 }, (_, i) => i + 1).map((level) => {
                  const total = commissionStats
                    .filter((c: any) => c.level === level)
                    .reduce((sum: number, c: any) => sum + c.amount, 0);
                  return (
                    <tr key={level}>
                      <td className="px-4 py-2">{level === 1 ? 'Direct' : `Level ${level}`}</td>
                      <td className="px-4 py-2">${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-gray-500">No commissions yet</div>
          )}
        </div>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Referral Link</h3>
          </div>
          <div className="bg-gray-50 rounded p-3 text-sm break-all">
            <span className="text-gray-600">{stats.referralLink ?? '-'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 