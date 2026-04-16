import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { 
  FiUsers, 
  FiClock, 
  FiCheckCircle, 
  FiPlus,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiCalendar,
  FiDownload
} from 'react-icons/fi'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import Navbar from '../components/Navbar'
import { dashboardAPI, offerLetterAPI } from '../services/api'
import { DashboardSkeleton } from '../components/LoadingSkeleton'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloadingPdf, setDownloadingPdf] = useState({})
  const [statusMap, setStatusMap] = useState({})
  const [savingStatus, setSavingStatus] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    loadDashboard()
  }, [])

  const handleDownloadPdf = async (candidate) => {
    setDownloadingPdf(prev => ({ ...prev, [candidate.id]: true }));
    
    try {
      if (candidate.pdf_path) {
        // Use the existing PDF path from the API
        const pdfUrl = candidate.pdf_path;
        
        // Create a temporary anchor element to trigger download
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `offer_letter_${candidate.name.replace(/\s+/g, '_')}.pdf`;
        link.target = '_blank';
        
        // For blob URLs or external URLs, we need to fetch and download
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
            
            // Clean up the object URL
            window.URL.revokeObjectURL(downloadUrl);
            
            toast.success(`PDF downloaded: ${candidate.name}`);
          } else {
            throw new Error('Failed to fetch PDF');
          }
        } catch (fetchError) {
          // Fallback: try direct link opening
          console.log('Direct fetch failed, trying direct link:', fetchError);
          window.open(pdfUrl, '_blank');
          toast.success('PDF opened in new tab');
        }
      } else {
        // Generate PDF if it doesn't exist (fallback)
        const response = await offerLetterAPI.generate({
          candidate_name: candidate.name,
          candidate_email: candidate.email,
          designation: candidate.position,
          total_salary: candidate.salary || 1600000,
          date_of_offer: candidate.offer_date || new Date().toISOString().split('T')[0],
          joining_date: candidate.joining_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          facility: candidate.facility || 'Hyderabad',
          work_mode: candidate.work_mode || 'Offline',
          grade: candidate.grade || 'Grade A',
          tsc: candidate.tsc || 'Platform, App & Infra'
        });
        
        if (response.pdf_path) {
          window.open(response.pdf_path, '_blank');
          toast.success('PDF generated and opened');
        } else {
          toast.error('Failed to generate PDF');
        }
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

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const stats = [
    {
      label: 'Total Candidates',
      value: dashboardData?.total_candidates || 0,
      icon: FiUsers,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-100',
      textColor: 'text-teal-600',
    },
    {
      label: 'Pending Offers',
      value: dashboardData?.pending_offers || 0,
      icon: FiClock,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
    },
    {
      label: 'Sent Offers',
      value: dashboardData?.sent_offers || 0,
      icon: FiCheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
  ]

  const chartData = [
    { name: 'Sent Offers', value: dashboardData?.sent_offers || 0 },
    { name: 'Pending Offers', value: dashboardData?.pending_offers || 0 },
  ]

  const COLORS = ['#10b981', '#eab308']

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-teal-100">
        <Navbar user={user} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-teal-100">
        <Navbar user={user} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-red-500">Failed to load dashboard</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Navbar user={dashboardData.user} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <p className="text-gray-600">Here's an overview of your candidates</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/offer-letter')}
            className="mt-4 md:mt-0 flex items-center space-x-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <FiPlus className="w-5 h-5" />
            <span className="font-semibold">Create New Offer Letter</span>
          </motion.button>
        </motion.div>

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
                className={`stat-card bg-white rounded-2xl p-6 shadow-lg border border-gray-100`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.bgColor} p-3 rounded-xl`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                </div>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </motion.div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Candidates Table */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 card"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Your Candidates</h2>
              <span className="text-sm text-gray-500">
                {dashboardData.candidates.length} total
              </span>
            </div>
            {dashboardData.candidates.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FiUsers className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No candidates found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Position</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.candidates.map((candidate, index) => (
                      <motion.tr
                        key={candidate.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div
                            className="flex items-center space-x-3 cursor-pointer group"
                            onClick={() => navigate(`/offer-letter`, { state: { candidateId: candidate.id } })}
                          >
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {candidate.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800 group-hover:text-teal-600 transition-colors underline-offset-2 group-hover:underline">{candidate.name}</div>
                              <div className="text-sm text-gray-500 flex items-center space-x-1">
                                <FiMail className="w-3 h-3" />
                                <span>{candidate.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2 text-gray-700">
                            <FiBriefcase className="w-4 h-4" />
                            <span>{candidate.position}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <select
                              value={statusMap[candidate.id] ?? candidate.status}
                              onChange={e => handleStatusChange(candidate.id, e.target.value)}
                              className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200 bg-white text-gray-700"
                            >
                              <option value="Offer Made">Offer Made</option>
                              <option value="Accepted">Accepted</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                            {statusMap[candidate.id] && statusMap[candidate.id] !== candidate.status && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSaveStatus(candidate)}
                                disabled={savingStatus[candidate.id]}
                                className="px-2 py-1.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white text-xs rounded-lg hover:shadow-md transition-all duration-300 disabled:opacity-50"
                              >
                                {savingStatus[candidate.id] ? 'Saving...' : 'Save'}
                              </motion.button>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {candidate.offer_date ? (
                            <div className="flex items-center space-x-2 text-gray-600">
                              <FiCalendar className="w-4 h-4" />
                              <span className="text-sm">{candidate.offer_date}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">N/A</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            {candidate.status === 'Pending' && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  navigate('/offer-letter', {
                                    state: { candidate }
                                  })
                                }
                                className="px-3 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white text-sm rounded-lg hover:shadow-lg transition-all duration-300"
                              >
                                Send Offer
                              </motion.button>
                            )}
                            
                            {candidate.pdf_path && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDownloadPdf(candidate)}
                                disabled={downloadingPdf[candidate.id]}
                                className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50"
                                title="Download PDF"
                              >
                                {downloadingPdf[candidate.id] ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <FiDownload className="w-4 h-4" />
                                )}
                              </motion.button>
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

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Offer Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
