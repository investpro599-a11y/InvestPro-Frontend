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
            <p className="font-medium">Total Invested:</p>
            <p className="text-2xl font-bold text-green-700">PKR {stats.totalInvested.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Completed: {stats.completedInvestments} | Active: {stats.activeInvestments} | Pending: {stats.pendingInvestments}</p>
          </div>
          <div>
            <p className="font-medium">Total Withdrawn:</p>
            <p className="text-2xl font-bold text-blue-700">PKR {stats.totalWithdrawn.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Completed: {stats.completedWithdrawals} | Pending: {stats.pendingWithdrawals} | Rejected: {stats.rejectedWithdrawals}</p>
          </div>
          <div>
            <p className="font-medium">Total ROI (Your investment returns):</p>
            <p className="text-xl">PKR {stats.availableROI.toLocaleString()}</p>
          </div>
          <div>
            <p className="font-medium">Total Commission (Referral Earnings):</p>
            <p className="text-xl text-purple-700">PKR {stats.totalCommissions?.toLocaleString() ?? '0'}</p>
            <p className="text-xs text-gray-500">All referral commissions you have earned minus withdrawn commissions.</p>
          </div>
          <div>
            <p className="font-medium">Principal Withdrawn:</p>
            <p className="text-xl">PKR {stats.totalPrincipalWithdrawn.toLocaleString()}</p>
          </div>
          <div>
            <p className="font-medium">Investment %:</p>
            <p className="text-xl">{stats.investmentPercentage}%</p>
          </div>
          <div>
            <p className="font-medium">Withdrawal %:</p>
            <p className="text-xl">{stats.withdrawalPercentage}%</p>
          </div>
          <div>
            <p className="font-medium">ROI Estimation:</p>
            <p className="text-xl">PKR {stats.roiEstimation.toLocaleString()}</p>
          </div>
          <div>
            <p className="font-medium">Available Commission:</p>
            <p className="text-xl text-purple-700">PKR {stats.availableCommission?.toLocaleString() ?? '0'}</p>
          </div>
          <div>
            <p className="font-medium">Daily ROI (Your Daily Investment Return):</p>
            <p className="text-xl text-green-700">PKR {stats.dailyROI?.toLocaleString() ?? '0'}</p>
            <p className="text-xs text-gray-500">This is your daily earning from all active investments (monthly ROI divided by 30).</p>
          </div>
          <div>
            <p className="font-medium">Available Principal:</p>
            <p className="text-xl text-blue-700">PKR {stats.availablePrincipal?.toLocaleString() ?? '0'}</p>
          </div>
          <div>
            <p className="font-medium">Total Balance:</p>
            <p className="text-xl text-black">PKR {stats.totalBalance?.toLocaleString() ?? '0'}</p>
          </div>
        </div>
        {/* Daily ROI Block - NEW REQUIREMENT */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2">Daily ROI</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1">Total Daily ROI Earned</span>
              <span className="text-2xl font-bold text-green-700">PKR {(stats.totalCreditedROI ?? 0).toLocaleString()}</span>
            </div>
            <div className="bg-red-50 rounded-lg p-4 flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1">Total ROI Withdrawn</span>
              <span className="text-2xl font-bold text-red-700">PKR {(stats.roiWithdrawn ?? 0).toLocaleString()}</span>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1">Withdrawable ROI</span>
              <span className="text-2xl font-bold text-blue-700">PKR {(stats.availableROI ?? 0).toLocaleString()}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Withdrawable ROI = Total Daily ROI Earned – Total Withdrawn</p>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Commission Breakdown</h3>
          {commissionStats && commissionStats.docs && commissionStats.docs.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 mb-4">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 9 }, (_, i) => i + 1).map((level) => {
                  const total = commissionStats.docs
                    .filter((c: any) => c.level === level)
                    .reduce((sum: number, c: any) => sum + c.amount, 0);
                  return (
                    <tr key={level}>
                      <td className="px-4 py-2">{level === 1 ? 'Direct' : `Level ${level}`}</td>
                      <td className="px-4 py-2">PKR {total.toLocaleString()}</td>
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
            <h3 className="font-semibold">Recent Investments</h3>
            <Link href="/investments" className="text-blue-600 text-sm hover:underline">View All</Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>ROI %</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentInvestments.map((inv: any) => (
                <TableRow key={inv._id}>
                  <TableCell>PKR {inv.amount.toLocaleString()}</TableCell>
                  <TableCell className="capitalize">{inv.plan}</TableCell>
                  <TableCell>{inv.roiRate}%</TableCell>
                  <TableCell className="capitalize">{inv.paymentMethod === 'usdt_trc20' ? 'USDT (TRC20)' : inv.paymentMethod}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{inv.status}</Badge></TableCell>
                  <TableCell>{new Date(inv.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {stats.recentInvestments.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-gray-400">No investments yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Recent Withdrawals</h3>
            <Link href="/withdrawals" className="text-blue-600 text-sm hover:underline">View All</Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentWithdrawals.map((wd: any) => (
                <TableRow key={wd._id}>
                  <TableCell>PKR {wd.amount.toLocaleString()}</TableCell>
                  <TableCell className="capitalize">{wd.type}</TableCell>
                  <TableCell>{wd.walletAddress ? `${wd.walletAddress.slice(0, 6)}...${wd.walletAddress.slice(-4)}` : '-'}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{wd.status}</Badge></TableCell>
                  <TableCell>{new Date(wd.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {stats.recentWithdrawals.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-gray-400">No withdrawals yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
} 