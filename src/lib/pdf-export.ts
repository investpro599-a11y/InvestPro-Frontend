import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import type { DashboardStats } from '@shared/schema';

interface InvestmentData {
  _id?: string;
  id?: number;
  amount: number;
  plan: string;
  createdAt: Date;
  roiRate: number;
  status: string;
  paymentMethod: 'usdt_trc20';
  transactionProof?: string | null;
  notes?: string | null;
  maturityDate?: Date | null;
  approvedBy?: string | null;
  approvedAt?: Date | null;
}

interface WithdrawalData {
  _id?: string;
  id?: number;
  amount: number;
  type: string;
  method: string;
  createdAt: Date;
  status: string;
  phoneNumber?: string;
  accountNumber?: string;
  bankName?: string;
  trcId?: string;
  accountName?: string;
  platform?: string;
  walletAddress?: string;
  txid?: string | null;
  notes?: string | null;
  processedBy?: string | null;
  processedAt?: Date | null;
}

export class PDFExporter {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  private addHeader(title: string, subtitle?: string) {
    // Add company logo/name
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Investment Tracker', 20, 20);

    // Add title
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, 20, 35);

    // Add subtitle
    if (subtitle) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(subtitle, 20, 45);
    }

    // Add date
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy at h:mm a')}`, 20, 55);

    // Add line separator
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(20, 60, 190, 60);
  }

  private addSummary(data: any[], type: 'investment' | 'withdrawal') {
    const totalAmount = data.reduce((sum, item) => sum + (typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount), 0);
    const totalCount = data.length;

    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Summary', 20, 80);

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Total ${type}s: ${totalCount}`, 20, 90);
    this.doc.text(`Total Amount: PKR ${totalAmount.toLocaleString()}`, 20, 100);

    // Add status breakdown
    const statusCounts = data.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    let yPos = 110;
    Object.entries(statusCounts).forEach(([status, count]) => {
      this.doc.text(`${status}: ${count}`, 20, yPos);
      yPos += 8;
    });

    return yPos + 10; // Return next Y position
  }

  exportInvestments(investments: InvestmentData[], filename?: string) {
    this.doc = new jsPDF();
    
    this.addHeader('Investment Report', `Total Investments: ${investments.length}`);

    let yPos = this.addSummary(investments, 'investment');

    // Add investments table
    autoTable(this.doc, {
      startY: yPos,
      head: [['Amount', 'Plan', 'Date', 'ROI Rate', 'Status', 'Payment Method']],
      body: investments.map(inv => [
        `PKR ${inv.amount.toLocaleString()}`,
        inv.plan,
        format(new Date(inv.createdAt), 'MMM dd, yyyy'),
        `${inv.roiRate}%`,
        inv.status,
        inv.paymentMethod
      ]),
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
    });

    // Save the PDF
    this.doc.save(filename || `investments-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  }

  exportWithdrawals(withdrawals: WithdrawalData[], filename?: string) {
    this.doc = new jsPDF();
    
    this.addHeader('Withdrawal Report', `Total Withdrawals: ${withdrawals.length}`);

    let yPos = this.addSummary(withdrawals, 'withdrawal');

    // Add withdrawals table
    autoTable(this.doc, {
      startY: yPos,
      head: [['Amount', 'Type', 'Method', 'Date', 'Status', 'TXID']],
      body: withdrawals.map(w => [
        `PKR ${w.amount.toLocaleString()}`,
        w.type,
        w.method,
        format(new Date(w.createdAt), 'MMM dd, yyyy'),
        w.status,
        w.txid || '-'
      ]),
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
    });

    // Save the PDF
    this.doc.save(filename || `withdrawals-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  }

  exportDashboardReport(stats: DashboardStats, filename?: string) {
    this.doc = new jsPDF();
    
    this.addHeader('Dashboard Report', 'Investment Tracker Overview');

    // Add statistics
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Key Statistics', 20, 80);

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    let yPos = 90;
    const statsData = [
      { label: 'Total Investment Amount', value: `PKR ${stats.investmentAmount?.toLocaleString() || '0'}` },
      { label: 'Unpaid ROI', value: `PKR ${stats.unpaidROI?.toLocaleString() || '0'}` },
      { label: 'Unpaid Commissions', value: `PKR ${stats.unpaidCommissions?.toLocaleString() || '0'}` },
      { label: 'Direct Commissions', value: `PKR ${stats.directCommissions?.toLocaleString() || '0'}` },
      { label: 'Total Commissions', value: `PKR ${stats.totalCommissions?.toLocaleString() || '0'}` },
      { label: 'Total Referrals', value: String(stats.totalReferrals || '0') },
      { label: 'Active Referrals', value: String(stats.activeReferrals || '0') },
    ];

    statsData.forEach(stat => {
      this.doc.text(`${stat.label}:`, 20, yPos);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(String(stat.value), 80, yPos);
      this.doc.setFont('helvetica', 'normal');
      yPos += 12;
    });

    // Add referral link
    yPos += 10;
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Referral Link:', 20, yPos);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(stats.referralLink || 'N/A', 20, yPos + 8);

    // Save the PDF
    this.doc.save(filename || `dashboard-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  }
}

export const pdfExporter = new PDFExporter(); 