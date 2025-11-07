import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import NavigationHero from '../components/NavigationHero';
import Footer from '../components/Footer';
import { Download, FileText, Users, TrendingUp, DollarSign, CheckCircle, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
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
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    // Tạo dữ liệu giả đẹp
    generateMockData();
  }, [selectedYear, viewType]);

  const generateMockData = () => {
    setLoading(true);
    
    // Simulate loading
    setTimeout(() => {
      const mockStats: ReportStats = {
        totalApplications: 2847,
        approvalRate: 87.5,
        paidApplications: 2156,
        totalPaid: 14580000000,
        statusDistribution: [
          { name: 'Đã duyệt', value: 2156, color: '#10b981' },
          { name: 'Chờ xử lý', value: 387, color: '#f59e0b' },
          { name: 'Từ chối', value: 234, color: '#ef4444' },
          { name: 'Đang xem xét', value: 70, color: '#3b82f6' },
        ],
        programDistribution: [
          { name: 'Người già', applications: 1245, amount: 6225000000 },
          { name: 'Trẻ em', applications: 892, amount: 3568000000 },
          { name: 'Người khuyết tật', applications: 456, amount: 2736000000 },
          { name: 'Hộ nghèo', applications: 254, amount: 2051000000 },
        ],
        monthlyTrend: [
          { month: 'T1', applications: 234, amount: 1170000000 },
          { month: 'T2', applications: 198, amount: 990000000 },
          { month: 'T3', applications: 267, amount: 1335000000 },
          { month: 'T4', applications: 245, amount: 1225000000 },
          { month: 'T5', applications: 289, amount: 1445000000 },
          { month: 'T6', applications: 312, amount: 1560000000 },
          { month: 'T7', applications: 298, amount: 1490000000 },
          { month: 'T8', applications: 276, amount: 1380000000 },
          { month: 'T9', applications: 254, amount: 1270000000 },
          { month: 'T10', applications: 287, amount: 1435000000 },
          { month: 'T11', applications: 201, amount: 1005000000 },
          { month: 'T12', applications: 186, amount: 930000000 },
        ],
      };
      
      setStats(mockStats);
      setLoading(false);
    }, 500);
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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <NavigationHero />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu báo cáo...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <NavigationHero />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="w-10 h-10 text-blue-600" />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Báo cáo và Thống kê
                </span>
              </h1>
              <p className="text-gray-600 mt-2 text-sm">Thống kê tổng hợp về hoạt động trợ cấp xã hội</p>
            </div>

        {/* Filters & Export */}
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div className="flex gap-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              {[2024, 2023, 2022, 2021].map(year => (
                <option key={year} value={year}>📅 Năm {year}</option>
              ))}
            </select>

            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value)}
              className="px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <option value="overview">📊 Tổng quan</option>
              <option value="monthly">📅 Theo tháng</option>
              <option value="program">📋 Theo chương trình</option>
            </select>
          </div>

          {/* Modern Export Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold hover:scale-105"
            >
              <Download className="w-5 h-5" />
              <span>Xuất file</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showExportMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-10 animate-scaleIn">
                <button
                  onClick={() => {
                    exportToExcel();
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 group"
                >
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">Xuất Excel</p>
                    <p className="text-xs text-gray-500">Định dạng .xlsx</p>
                  </div>
                </button>
                
                <div className="h-px bg-gray-200"></div>
                
                <button
                  onClick={() => {
                    exportToPDF();
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 group"
                >
                  <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                    <FileText className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">Xuất PDF</p>
                    <p className="text-xs text-gray-500">Định dạng .pdf</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl shadow-md">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              <p className="font-semibold">{error}</p>
            </div>
          </div>
        )}

        {stats && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <p className="text-sm font-medium opacity-90 mb-1">Tổng hồ sơ</p>
                    <p className="text-4xl font-bold">{stats.totalApplications.toLocaleString('vi-VN')}</p>
                    <p className="text-xs opacity-75 mt-2">📈 +12.5% so với tháng trước</p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-4 rounded-2xl backdrop-blur-sm">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <p className="text-sm font-medium opacity-90 mb-1">Tỷ lệ duyệt</p>
                    <p className="text-4xl font-bold">{stats.approvalRate}%</p>
                    <p className="text-xs opacity-75 mt-2">✅ Cao hơn mục tiêu 2.5%</p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-4 rounded-2xl backdrop-blur-sm">
                    <TrendingUp className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <p className="text-sm font-medium opacity-90 mb-1">Đã chi trả</p>
                    <p className="text-4xl font-bold">{stats.paidApplications.toLocaleString('vi-VN')}</p>
                    <p className="text-xs opacity-75 mt-2">💰 {((stats.paidApplications / stats.totalApplications) * 100).toFixed(1)}% tổng hồ sơ</p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-4 rounded-2xl backdrop-blur-sm">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <p className="text-sm font-medium opacity-90 mb-1">Tổng chi trả</p>
                    <p className="text-4xl font-bold">{formatCurrency(stats.totalPaid)}</p>
                    <p className="text-xs opacity-75 mt-2">💵 {(stats.totalPaid / 1000000000).toFixed(1)} tỷ VNĐ</p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-4 rounded-2xl backdrop-blur-sm">
                    <DollarSign className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Phân bố theo trạng thái</h3>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={stats.statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {stats.statusDistribution.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      <span className="text-sm text-gray-500 ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Program Distribution Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Theo loại trợ cấp</h3>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={stats.programDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar 
                      dataKey="applications" 
                      fill="url(#colorApps)" 
                      name="Số hồ sơ" 
                      radius={[8, 8, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Trend (always show) */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Xu hướng theo tháng năm {selectedYear}</h3>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={stats.monthlyTrend}>
                  <defs>
                    <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Area 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="applications" 
                    stroke="#3b82f6" 
                    fillOpacity={1}
                    fill="url(#colorApplications)"
                    name="Số hồ sơ" 
                    strokeWidth={3}
                  />
                  <Area 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#10b981" 
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                    name="Số tiền (VNĐ)" 
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Additional Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-6 rounded-2xl border-2 border-orange-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-500 rounded-xl">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-800">Trung bình mỗi tháng</h4>
                </div>
                <p className="text-3xl font-bold text-orange-700">{Math.round(stats.totalApplications / 12)}</p>
                <p className="text-sm text-orange-600 mt-1">hồ sơ/tháng</p>
              </div>

              <div className="bg-gradient-to-br from-pink-100 to-pink-200 p-6 rounded-2xl border-2 border-pink-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-pink-500 rounded-xl">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-800">Trung bình trợ cấp</h4>
                </div>
                <p className="text-3xl font-bold text-pink-700">{(stats.totalPaid / stats.paidApplications / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-pink-600 mt-1">VNĐ/hồ sơ</p>
              </div>

              <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-6 rounded-2xl border-2 border-indigo-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-indigo-500 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-800">Hiệu suất xử lý</h4>
                </div>
                <p className="text-3xl font-bold text-indigo-700">{((stats.paidApplications / stats.totalApplications) * 100).toFixed(1)}%</p>
                <p className="text-sm text-indigo-600 mt-1">đã hoàn thành</p>
              </div>
            </div>
          </>
        )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReportsPage;
