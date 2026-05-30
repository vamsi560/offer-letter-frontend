import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiUsers, 
  FiClock, 
  FiCheckCircle, 
  FiPlus,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiCalendar,
  FiDownload,
  FiFilter,
  FiTrash2,
  FiSend,
  FiFileText,
  FiTrendingUp,
  FiPercent,
  FiSearch
} from 'react-icons/fi'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts'
import Navbar from '../components/Navbar'
import { dashboardAPI, offerLetterAPI } from '../services/api'
import { DashboardSkeleton } from '../components/LoadingSkeleton'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloadingPdf, setDownloadingPdf] = useState({})
  const [statusMap, setStatusMap] = useState({})
  const [savingStatus, setSavingStatus] = useState({})
  
  // Interactive Filters States
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDept, setSelectedDept] = useState('')
  const [selectedFacility, setSelectedFacility] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedTagPoc, setSelectedTagPoc] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  // Bulk Operations State
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkStatus, setBulkStatus] = useState('')
  const [bulkProcessing, setBulkProcessing] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const data = await dashboardAPI.getDashboard()
      console.log('Dashboard Data:', data)
      setDashboardData(data)
    } catch (error) {
      toast.error('Failed to load dashboard data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPdf = async (candidate) => {
    setDownloadingPdf(prev => ({ ...prev, [candidate.id]: true }));
    
    try {
      if (candidate.pdf_path) {
        const pdfUrl = candidate.pdf_path;
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `offer_letter_${candidate.name.replace(/\s+/g, '_')}.pdf`;
        link.target = '_blank';
        
        try {
          const response = await fetch(pdfUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/pdf',
            },
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            
            link.href = downloadUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
            toast.success(`PDF downloaded: ${candidate.name}`);
          } else {
            throw new Error('Failed to fetch PDF');
          }
        } catch (fetchError) {
          console.log('Direct fetch failed, trying direct link:', fetchError);
          window.open(pdfUrl, '_blank');
          toast.success('PDF opened in new tab');
        }
      } else {
        toast.warning('PDF is still generating in the background. Please wait a moment.');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF. Please try again.');
    } finally {
      setDownloadingPdf(prev => ({ ...prev, [candidate.id]: false }));
    }
  };

  const handleStatusChange = (candidateId, value) => {
    setStatusMap(prev => ({ ...prev, [candidateId]: value }))
  }

  const handleSaveStatus = async (candidate) => {
    const newStatus = statusMap[candidate.id]
    if (!newStatus) return
    setSavingStatus(prev => ({ ...prev, [candidate.id]: true }))
    try {
      await offerLetterAPI.updateStatus(candidate.id, newStatus)
      setDashboardData(prev => ({
        ...prev,
        candidates: prev.candidates.map(c =>
          c.id === candidate.id ? { ...c, status: newStatus } : c
        )
      }))
      setStatusMap(prev => { const s = { ...prev }; delete s[candidate.id]; return s })
      toast.success(`Status updated to "${newStatus}"`)
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setSavingStatus(prev => ({ ...prev, [candidate.id]: false }))
    }
  }

  // --- INTERACTIVE FILTERS LOGIC ---
  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedDept('')
    setSelectedFacility('')
    setSelectedStatus('')
    setSelectedTagPoc('')
    setStartDate('')
    setEndDate('')
    toast.info('Filters cleared')
  }

  const getFilteredCandidates = () => {
    if (!dashboardData?.candidates) return []
    return dashboardData.candidates.filter(c => {
      const matchSearch = 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.position.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchDept = selectedDept ? c.department === selectedDept : true
      const matchFacility = selectedFacility ? c.facility === selectedFacility : true
      const matchStatus = selectedStatus ? c.status === selectedStatus : true
      const matchTagPoc = selectedTagPoc ? c.tag_poc === selectedTagPoc : true
      
      let matchDate = true
      if (startDate || endDate) {
        const itemDate = new Date(c.created_at || c.offer_date)
        if (startDate) {
          const sDate = new Date(startDate)
          matchDate = matchDate && itemDate >= sDate
        }
        if (endDate) {
          const eDate = new Date(endDate)
          eDate.setHours(23, 59, 59, 999) // include whole end date
          matchDate = matchDate && itemDate <= eDate
        }
      }
      
      return matchSearch && matchDept && matchFacility && matchStatus && matchTagPoc && matchDate
    })
  }

  const filteredCandidates = getFilteredCandidates()

  // Get filter option sets dynamically from data
  const departments = [...new Set((dashboardData?.candidates || []).map(c => c.department).filter(Boolean))]
  const facilities = [...new Set((dashboardData?.candidates || []).map(c => c.facility).filter(Boolean))]
  const statuses = [...new Set((dashboardData?.candidates || []).map(c => c.status).filter(Boolean))]
  const tagPocs = [...new Set((dashboardData?.candidates || []).map(c => c.tag_poc).filter(Boolean))]

  // --- BULK OPERATIONS LOGIC ---
  const handleSelectRow = (candidateId) => {
    setSelectedIds(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId) 
        : [...prev, candidateId]
    )
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredCandidates.map(c => c.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleBulkStatusChange = async () => {
    if (!bulkStatus || selectedIds.length === 0) return
    setBulkProcessing(true)
    let successCount = 0
    
    try {
      for (const id of selectedIds) {
        await offerLetterAPI.updateStatus(id, bulkStatus)
        successCount++
      }
      
      // Update local state
      setDashboardData(prev => ({
        ...prev,
        candidates: prev.candidates.map(c => 
          selectedIds.includes(c.id) ? { ...c, status: bulkStatus } : c
        )
      }))
      
      toast.success(`Successfully updated ${successCount} candidates to "${bulkStatus}"`)
      setSelectedIds([])
      setBulkStatus('')
    } catch (e) {
      console.error(e)
      toast.error('Error occurred during bulk status shift')
    } finally {
      setBulkProcessing(false)
    }
  }

  const handleBulkExportCSV = () => {
    if (selectedIds.length === 0) return
    const selectedCandidates = dashboardData.candidates.filter(c => selectedIds.includes(c.id))
    
    const headers = ['Name', 'Email', 'Position', 'Department', 'Facility', 'Status', 'Date', 'Tag POC']
    const rows = selectedCandidates.map(c => [
      `"${c.name}"`,
      `"${c.email}"`,
      `"${c.position}"`,
      `"${c.department || ''}"`,
      `"${c.facility || ''}"`,
      `"${c.status}"`,
      `"${c.offer_date || ''}"`,
      `"${c.tag_poc || ''}"`
    ])
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `offers_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${selectedCandidates.length} records to CSV!`);
    setSelectedIds([])
  }

  const handleBulkSendReminders = async () => {
    if (selectedIds.length === 0) return
    setBulkProcessing(true)
    let reminderCount = 0
    
    const selectedCandidates = dashboardData.candidates.filter(c => selectedIds.includes(c.id))
    const withPdfs = selectedCandidates.filter(c => c.pdf_path)
    
    if (withPdfs.length === 0) {
      toast.warning('None of the selected candidates have generated offer PDFs yet.')
      setBulkProcessing(false)
      return
    }

    try {
      toast.info(`Sending batch reminders to ${withPdfs.length} candidates in the background...`)
      
      for (const c of withPdfs) {
        await offerLetterAPI.sendEmail({
          candidate_email: c.email,
          pdf_path: c.pdf_path,
          candidate_name: c.name,
          designation: c.position,
          joining_date: c.joining_date || c.offer_date,
          facility: c.facility || 'Hyderabad',
          work_mode: 'Offline',
          tag_poc: c.tag_poc || 'HR Team'
        })
        reminderCount++
      }
      toast.success(`Successfully sent ${reminderCount} offer reminders!`)
      setSelectedIds([])
    } catch (e) {
      console.error(e)
      toast.error('Failed to send batch email reminders')
    } finally {
      setBulkProcessing(false)
    }
  }

  // --- ADVANCED ANALYTICS METRICS ---
  const calculateMetrics = (candidates) => {
    if (!candidates || candidates.length === 0) return { oar: '0.0%', tto: '2.5 days' }
    
    // Offer Acceptance Rate (OAR)
    const sentCount = candidates.filter(c => ['Offer Made', 'Accepted', 'Rejected'].includes(c.status)).length
    const acceptedCount = candidates.filter(c => c.status === 'Accepted').length
    const oar = sentCount > 0 ? ((acceptedCount / sentCount) * 100).toFixed(1) + '%' : '0.0%'
    
    // Average Time-to-Offer (TTO) - Mock logic or dynamic based on dates
    const offersWithDates = candidates.filter(c => c.created_at && c.offer_date)
    let tto = '2.4 days'
    if (offersWithDates.length > 0) {
      let totalDays = 0
      offersWithDates.forEach(c => {
        const d1 = new Date(c.created_at)
        const d2 = new Date(c.offer_date)
        const diff = Math.abs(d2 - d1)
        totalDays += Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1
      })
      tto = (totalDays / offersWithDates.length).toFixed(1) + ' days'
    }
    
    return { oar, tto }
  }

  const metrics = calculateMetrics(dashboardData?.candidates)

  // Recharts Department Hires data mapper
  const getDepartmentChartData = () => {
    if (!dashboardData?.candidates) return []
    const counts = {}
    dashboardData.candidates.forEach(c => {
      if (c.department) {
        counts[c.department] = (counts[c.department] || 0) + 1
      }
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }

  const deptChartData = getDepartmentChartData()

  // Monthly trends line chart data mapper
  const getMonthlyChartData = () => {
    if (!dashboardData?.candidates) return []
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const counts = Array(12).fill(0)
    
    dashboardData.candidates.forEach(c => {
      const dateStr = c.created_at || c.offer_date
      if (dateStr) {
        const d = new Date(dateStr)
        if (!isNaN(d.getMonth())) {
          counts[d.getMonth()]++
        }
      }
    })
    
    return months.map((name, i) => ({ name, Volume: counts[i] })).slice(0, new Date().getMonth() + 1)
  }

  const monthlyChartData = getMonthlyChartData()

  const stats = [
    {
      label: 'Total Candidates',
      value: dashboardData?.total_candidates || 0,
      icon: FiUsers,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50 text-teal-600',
    },
    {
      label: 'Offer Acceptance Rate',
      value: metrics.oar,
      icon: FiPercent,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 text-green-600',
    },
    {
      label: 'Avg. Time-To-Offer',
      value: metrics.tto,
      icon: FiClock,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 text-blue-600',
    },
  ]

  const chartData = [
    { name: 'Sent Offers', value: dashboardData?.sent_offers || 0 },
    { name: 'Pending / Generating', value: dashboardData?.pending_offers || 0 },
  ]

  const COLORS = ['#10b981', '#eab308']

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-teal-100">
        <Navbar user={JSON.parse(localStorage.getItem('user') || '{}')} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/20 to-indigo-50/30">
      <Navbar user={dashboardData.user} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Welcome back, <span className="text-teal-600">{dashboardData.user.name}</span>
            </h1>
            <p className="text-gray-600">Enterprise Offer Generation & Recruiter Dashboard</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`flex items-center space-x-2 px-5 py-3 rounded-xl border font-semibold shadow-sm hover:shadow transition-all ${
                showFilterPanel 
                  ? 'bg-teal-50 border-teal-200 text-teal-700' 
                  : 'bg-white border-gray-200 text-gray-700'
              }`}
            >
              <FiFilter className="w-5 h-5" />
              <span>Advanced Filters</span>
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/offer-letter')}
              className="flex items-center space-x-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
            >
              <FiPlus className="w-5 h-5" />
              <span>Create Offer Letter</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Dynamic Interactive Filter Panel */}
        <AnimatePresence>
          {showFilterPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-md mb-8 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <FiFilter className="text-teal-600" />
                  <span>Advanced Criteria Selector</span>
                </h3>
                <button onClick={handleClearFilters} className="text-xs text-red-500 hover:text-red-700 font-semibold">Clear All Filters</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Search Keywords</label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="Name, email, role..." 
                      className="form-input w-full pl-9 text-sm"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Department</label>
                  <select className="form-input w-full text-sm" value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Facility Location</label>
                  <select className="form-input w-full text-sm" value={selectedFacility} onChange={e => setSelectedFacility(e.target.value)}>
                    <option value="">All Facilities</option>
                    {facilities.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Process Status</label>
                  <select className="form-input w-full text-sm" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
                    <option value="">All Statuses</option>
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">TAG POC</label>
                  <select className="form-input w-full text-sm" value={selectedTagPoc} onChange={e => setSelectedTagPoc(e.target.value)}>
                    <option value="">All Recruiters</option>
                    {tagPocs.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Joining Date From</label>
                  <input type="date" className="form-input w-full text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Joining Date To</label>
                  <input type="date" className="form-input w-full text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="text-gray-500 font-semibold text-sm mb-1">{stat.label}</span>
                  <span className="text-3xl font-extrabold text-gray-800">{stat.value}</span>
                </div>
                <div className={`${stat.bgColor} p-4 rounded-2xl`}>
                  <Icon className="w-7 h-7" />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Candidates Registry Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 card bg-white rounded-2xl p-6 shadow-md border"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Candidates Registry</h2>
                <p className="text-xs text-gray-500 mt-1">Showing {filteredCandidates.length} of {dashboardData.candidates.length} profiles</p>
              </div>
              {selectedIds.length > 0 && (
                <span className="text-xs bg-teal-100 text-teal-700 font-bold px-3 py-1 rounded-full">{selectedIds.length} Selected</span>
              )}
            </div>
            
            {filteredCandidates.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <FiUsers className="w-16 h-16 mx-auto mb-4 text-gray-300 animate-bounce" />
                <p className="text-lg font-bold text-gray-700">No candidates match filters</p>
                <button onClick={handleClearFilters} className="text-sm text-teal-600 font-semibold hover:underline mt-2">Reset filters</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-left w-10">
                        <input 
                          type="checkbox" 
                          className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                          onChange={handleSelectAll}
                          checked={filteredCandidates.length > 0 && selectedIds.length === filteredCandidates.length}
                        />
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Candidate</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Position / Team</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Joining Date</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.map((candidate, index) => (
                      <motion.tr
                        key={candidate.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`border-b border-gray-100 hover:bg-teal-50/20 transition-colors ${selectedIds.includes(candidate.id) ? 'bg-teal-50/10' : ''}`}
                      >
                        <td className="py-4 px-4">
                          <input 
                            type="checkbox" 
                            className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                            checked={selectedIds.includes(candidate.id)}
                            onChange={() => handleSelectRow(candidate.id)}
                          />
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate(`/offer-letter`, { state: { candidateId: candidate.id } })}>
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-base shadow-sm">
                              {candidate.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-gray-800 group-hover:text-teal-600 transition-colors underline-offset-2 group-hover:underline">{candidate.name}</div>
                              <div className="text-xs text-gray-400 flex items-center space-x-1 mt-0.5">
                                <FiMail className="w-3 h-3" />
                                <span>{candidate.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="text-sm font-semibold text-gray-800 flex items-center space-x-1.5">
                              <FiBriefcase className="w-4 h-4 text-gray-400" />
                              <span>{candidate.position}</span>
                            </div>
                            {candidate.department && (
                              <div className="text-xs text-gray-400 ml-5">{candidate.department}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            {candidate.status === 'Generating' ? (
                              <span className="flex items-center text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-100">
                                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-amber-600 mr-2"></div>
                                Generating...
                              </span>
                            ) : candidate.status === 'Generation Failed' ? (
                              <span className="text-red-600 bg-red-50 px-3 py-1.5 rounded-full text-xs font-bold border border-red-100">Failed</span>
                            ) : (
                              <>
                                <select
                                  value={statusMap[candidate.id] ?? candidate.status}
                                  onChange={e => handleStatusChange(candidate.id, e.target.value)}
                                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200 bg-white font-semibold text-gray-700 shadow-sm"
                                >
                                  {candidate.status && !['Offer Made','Accepted','Rejected', 'Joined', 'Draft'].includes(candidate.status) && (
                                    <option value={candidate.status}>{candidate.status}</option>
                                  )}
                                  <option value="Draft">Draft</option>
                                  <option value="Offer Made">Offer Made</option>
                                  <option value="Accepted">Accepted</option>
                                  <option value="Rejected">Rejected</option>
                                  <option value="Joined">Joined</option>
                                </select>
                                {statusMap[candidate.id] && statusMap[candidate.id] !== candidate.status && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSaveStatus(candidate)}
                                    disabled={savingStatus[candidate.id]}
                                    className="px-2.5 py-1.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white text-xs rounded-lg hover:shadow-md transition-all duration-300 disabled:opacity-50 font-bold"
                                  >
                                    {savingStatus[candidate.id] ? 'Saving...' : 'Save'}
                                  </motion.button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm font-semibold text-gray-600">
                          {candidate.joining_date ? (
                            <div className="flex items-center space-x-1.5">
                              <FiCalendar className="w-4 h-4 text-gray-400" />
                              <span>{candidate.joining_date}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">Not Set</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            {candidate.status === 'Pending' && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/offer-letter', { state: { candidate } })}
                                className="px-3.5 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white text-xs font-bold rounded-lg hover:shadow-lg transition-all duration-300"
                              >
                                Send Offer
                              </motion.button>
                            )}
                            
                            {candidate.pdf_path ? (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDownloadPdf(candidate)}
                                disabled={downloadingPdf[candidate.id]}
                                className="px-3 py-2.5 bg-gradient-to-r from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 border border-teal-200 text-teal-700 text-sm rounded-lg hover:shadow transition-all duration-300 flex items-center justify-center disabled:opacity-50"
                                title="Download PDF"
                              >
                                {downloadingPdf[candidate.id] ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-700"></div>
                                ) : (
                                  <FiDownload className="w-4 h-4" />
                                )}
                              </motion.button>
                            ) : (
                              candidate.status === 'Generating' && (
                                <div className="text-xs text-teal-600 font-semibold animate-pulse">Building PDF...</div>
                              )
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Graphical Analytics Panel */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="card bg-white rounded-2xl p-6 shadow-md border"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                <FiTrendingUp className="text-teal-600" />
                <span>Offer Volume Funnel</span>
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={65}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="card bg-white rounded-2xl p-6 shadow-md border"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                <FiBriefcase className="text-indigo-600" />
                <span>Hires by Department</span>
              </h2>
              {deptChartData.length === 0 ? (
                <p className="text-xs text-gray-400 py-8 text-center">No department metrics available</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={deptChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </div>
        </div>

        {/* Dynamic Line Chart for Recruiter Activity Trends */}
        {monthlyChartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card bg-white rounded-2xl p-6 shadow-md border mb-8"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
              <FiTrendingUp className="text-green-600" />
              <span>Recruiter Monthly Volume Trends</span>
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="Volume" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Floating Recruiter Bulk Action Dashboard Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-gray-900 text-white rounded-2xl shadow-2xl p-5 border border-gray-800 flex flex-col md:flex-row items-center gap-5 w-[90%] max-w-4xl"
          >
            <div className="flex items-center gap-3 border-b md:border-b-0 md:border-r border-gray-800 pb-3 md:pb-0 md:pr-5">
              <div className="bg-teal-500 text-white p-2.5 rounded-xl">
                <FiUsers className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-teal-400">{selectedIds.length} Candidate Profiles</div>
                <div className="text-xs text-gray-400 mt-0.5">Checked for bulk recruiter action</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full justify-between">
              {/* Batch status change */}
              <div className="flex items-center gap-2">
                <select 
                  className="bg-gray-800 border border-gray-700 text-white text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={bulkStatus}
                  onChange={e => setBulkStatus(e.target.value)}
                >
                  <option value="">Shift Status to...</option>
                  <option value="Draft">Draft</option>
                  <option value="Offer Made">Offer Made</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Joined">Joined</option>
                </select>
                <button 
                  onClick={handleBulkStatusChange}
                  disabled={bulkProcessing || !bulkStatus}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl px-4 py-2.5 transition disabled:opacity-50"
                >
                  Apply
                </button>
              </div>

              {/* Batch Actions */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleBulkSendReminders}
                  disabled={bulkProcessing}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl px-4 py-2.5 transition disabled:opacity-50"
                  title="Send reminders to selected"
                >
                  <FiSend className="w-3.5 h-3.5" />
                  <span>Send Reminders</span>
                </button>
                <button 
                  onClick={handleBulkExportCSV}
                  disabled={bulkProcessing}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded-xl px-4 py-2.5 transition border border-gray-700"
                  title="Export selected to CSV"
                >
                  <FiFileText className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button 
                  onClick={() => setSelectedIds([])}
                  className="text-xs text-red-400 hover:text-red-300 font-bold px-2 py-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Dashboard
