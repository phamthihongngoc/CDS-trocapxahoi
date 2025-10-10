import React, { useState, useEffect } from 'react';
import OfficerLayout from '../components/OfficerLayout';
import { Download, FileText, Users, TrendingUp, DollarSign, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../utils/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ReportStats {
  totalApplications: number;
  approvalRate: number;
  paidApplications: number;
  totalPaid: number;
  statusDistribution: Array<{ name: string; value: number; color: string }>;
  programDistribution: Array<{ name: string; applications: number; amount: number }>;
  monthlyTrend: Array<{ month: string; applications: number; amount: number }>;
}

const ReportsPage: React.FC = () => {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [viewType, setViewType] = useState('overview');

  useEffect(() => {
    fetchReportStats();
  }, [selectedYear, viewType]);

  const fetchReportStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await api.get(`/api/reports/stats?year=${selectedYear}&view=${viewType}`);
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      setError('Không thể tải dữ liệu báo cáo');
      console.error('Failed to fetch report stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!stats) return;

    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ['BÁO CÁO THỐNG KÊ BẢO TRỢ XÃ HỘI'],
      ['Năm: ' + selectedYear],
      [''],
      ['KPI TỔNG QUAN'],
      ['Tổng hồ sơ', stats.totalApplications],
      ['Tỷ lệ duyệt', `${stats.approvalRate}%`],
      ['Đã chi trả', stats.paidApplications],
      ['Tổng chi trả', `${stats.totalPaid.toLocaleString('vi-VN')} VNĐ`],
      [''],
      ['PHÂN BỐ THEO TRẠNG THÁI'],
      ['Trạng thái', 'Số lượng'],
      ...stats.statusDistribution.map(s => [s.name, s.value]),
      [''],
      ['THEO LOẠI TRỢ CẤP'],
      ['Chương trình', 'Số hồ sơ', 'Số tiền'],
      ...stats.programDistribution.map(p => [p.name, p.applications, p.amount]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo tổng quan');

    XLSX.writeFile(wb, `Bao_cao_bao_tro_xa_hoi_${selectedYear}.xlsx`);
  };

  const exportToPDF = () => {
    if (!stats) return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('BÁO CÁO THỐNG KÊ BẢO TRỢ XÃ HỘI', 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Năm: ${selectedYear}`, 14, 30);

    // KPI Summary
    doc.setFontSize(14);
    doc.text('KPI TỔNG QUAN', 14, 45);
    
    (doc as any).autoTable({
      startY: 50,
      head: [['Chỉ số', 'Giá trị']],
      body: [
        ['Tổng hồ sơ', stats.totalApplications.toString()],
        ['Tỷ lệ duyệt', `${stats.approvalRate}%`],
        ['Đã chi trả', stats.paidApplications.toString()],
        ['Tổng chi trả', `${stats.totalPaid.toLocaleString('vi-VN')} VNĐ`],
      ],
    });

    // Status Distribution
    doc.setFontSize(14);
    doc.text('PHÂN BỐ THEO TRẠNG THÁI', 14, (doc as any).lastAutoTable.finalY + 15);
    
    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Trạng thái', 'Số lượng']],
      body: stats.statusDistribution.map(s => [s.name, s.value.toString()]),
    });

    // Program Distribution
    doc.setFontSize(14);
    doc.text('THEO LOẠI TRỢ CẤP', 14, (doc as any).lastAutoTable.finalY + 15);
    
    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Chương trình', 'Số hồ sơ', 'Số tiền (VNĐ)']],
      body: stats.programDistribution.map(p => [
        p.name,
        p.applications.toString(),
        p.amount.toLocaleString('vi-VN')
      ]),
    });

    doc.save(`Bao_cao_bao_tro_xa_hoi_${selectedYear}.pdf`);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    return amount.toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <OfficerLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu báo cáo...</p>
        </div>
      </OfficerLayout>
    );
  }

  return (
    <OfficerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7" /> Báo cáo và Thống kê
          </h1>
          <p className="text-gray-600 mt-1">Thống kê tổng hợp về hoạt động trợ cấp xã hội</p>
        </div>

        {/* Filters & Export */}
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {[2024, 2023, 2022, 2021].map(year => (
                <option key={year} value={year}>Năm {year}</option>
              ))}
            </select>

            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="overview">Tổng quan</option>
              <option value="monthly">Theo tháng</option>
              <option value="program">Theo chương trình</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {stats && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng hồ sơ</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalApplications}</p>
                  </div>
                  <Users className="w-10 h-10 text-blue-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tỷ lệ duyệt</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{stats.approvalRate}%</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-green-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Đã chi trả</p>
                    <p className="text-3xl font-bold text-purple-600 mt-1">{stats.paidApplications}</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-purple-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng chi trả</p>
                    <p className="text-3xl font-bold text-cyan-600 mt-1">{formatCurrency(stats.totalPaid)}</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-cyan-500" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status Distribution Chart */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân bố theo trạng thái</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Program Distribution Chart */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Theo loại trợ cấp</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.programDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="applications" fill="#3b82f6" name="Số hồ sơ" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Trend (if available) */}
            {viewType === 'monthly' && stats.monthlyTrend.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Xu hướng theo tháng</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="applications" stroke="#3b82f6" name="Số hồ sơ" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="amount" stroke="#10b981" name="Số tiền (VNĐ)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </div>
    </OfficerLayout>
  );
};

export default ReportsPage;
