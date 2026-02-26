import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiBriefcase, FiDollarSign } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import { offerLetterAPI } from '../services/api'

const OfferLetterForm = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [formData, setFormData] = useState({
    // General/Recruitment Section
    status: '',
    tag_poc: '',
    pos_id: '',
    source: '',
    source_type: '',
    source_details: '',
    candidate_name: '',
    years_of_experience: '',
    offer_approval_email_sent_date: '',
    offer_approval_received_date: '',
    date_of_offer: '',
    primary_skill: '',
    secondary_skill: '',
    current_location: '',
    candidate_phone: '',
    candidate_email: '',
    candidate_address: '',
    pan: '',
    prev_org: '',
    comments: '',
    // Position Section
    designation: '',
    position: '',
    grade: '',
    department: '',
    business_unit: '',
    tsc: '',
    sub_tsc: '',
    allocation_unit: '',
    account: '',
    project: '',
    employment_type: 'Full-time',
    facility: '',
    work_location: '',
    work_mode: '', // Add new field for Work Mode
    reporting_manager: '',
    joining_date: '',
    probation_period: '',
    notice_period: '',
    // Compensation Section
    current_ctc: '',
    ectc: '',
    vam_proposed_ctc: '',
    revised_ctc: '',
    total_salary: '',
    deviation: '',
    jb_amt: '',
    jb_reason: '',
    days_lapsed: '',
    np_buyout_amt: '',
    np_buyout_mail_approval_date: '',
  })

  const [salaryBreakdown, setSalaryBreakdown] = useState(null)
  const [loading, setLoading] = useState(false)
  const [calculatingBreakdown, setCalculatingBreakdown] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [lastOfferLetter, setLastOfferLetter] = useState(null)
  const [pdfPath, setPdfPath] = useState('');
  const [docxPath, setDocxPath] = useState('');

  const calculateSalaryBreakdown = async () => {
    if (!formData.total_salary || formData.total_salary <= 0) {
      setSalaryBreakdown(null)
      return
    }

    setCalculatingBreakdown(true)
    try {
      const breakdown = await offerLetterAPI.getSalaryBreakdown(
        parseFloat(formData.total_salary)
      )
      setSalaryBreakdown(breakdown)
    } catch (error) {
      console.error('Error calculating salary breakdown:', error)
    } finally {
      setCalculatingBreakdown(false)
    }
  }

  // Deviation (in percentage) calculation
  const calculateDeviation = () => {
    const ectc = parseFloat(formData.ectc) || 0;
    const totalSalary = parseFloat(formData.total_salary) || 0;
    if (ectc > 0) {
      return (((totalSalary - ectc) / ectc) * 100).toFixed(2);
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTotalSalaryChange = (e) => {
    handleChange(e);
    calculateSalaryBreakdown();
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Basic validation for required fields
      if (!formData.designation || !formData.department || !formData.joining_date || !formData.employment_type) {
        toast.error('Please fill in all required Position fields')
        setLoading(false)
        return
      }
      if (!formData.total_salary) {
        toast.error('Please fill in Total Salary in Compensation')
        setLoading(false)
        return
      }
      const response = await offerLetterAPI.generate({
        ...formData,
        total_salary: formData.total_salary ? parseFloat(formData.total_salary) : undefined,
        current_ctc: formData.current_ctc ? parseFloat(formData.current_ctc) : undefined,
        ectc: formData.ectc ? parseFloat(formData.ectc) : undefined,
        vam_proposed_ctc: formData.vam_proposed_ctc ? parseFloat(formData.vam_proposed_ctc) : undefined,
        revised_ctc: formData.revised_ctc ? parseFloat(formData.revised_ctc) : undefined,
        deviation: formData.deviation ? parseInt(formData.deviation) : undefined,
        jb_amt: formData.jb_amt ? parseFloat(formData.jb_amt) : undefined,
        days_lapsed: formData.days_lapsed ? parseInt(formData.days_lapsed) : undefined,
        np_buyout_amt: formData.np_buyout_amt ? parseFloat(formData.np_buyout_amt) : undefined
      })
      setLastOfferLetter(response)
      setDocxPath(response.docx_path)
      setPdfPath(response.pdf_path)
      setShowEmailModal(true)
      toast.success('Offer letter generated successfully!')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate offer letter')
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async () => {
    setEmailSending(true)
    try {
      await offerLetterAPI.sendEmail({
        candidate_email: formData.candidate_email,
        pdf_path: lastOfferLetter.pdf_path,
        candidate_name: formData.candidate_name,
        designation: formData.designation,
        joining_date: formData.joining_date,
        facility: formData.facility,
        work_mode: formData.work_mode,
        tag_poc: formData.tag_poc,
        // Optionally add cc_email: formData.tag_poc
      })
      setEmailSent(true)
      toast.success('Offer letter email sent!')
      setTimeout(() => {
        setShowEmailModal(false)
        navigate('/dashboard')
      }, 1500)
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send offer letter email')
    } finally {
      setEmailSending(false)
    }
  }

  const handleGenerateDocx = async () => {
    try {
      const response = await offerLetterAPI.generateDocx({
        ...formData,
        total_salary: formData.total_salary ? parseFloat(formData.total_salary) : undefined,
        current_ctc: formData.current_ctc ? parseFloat(formData.current_ctc) : undefined,
        ectc: formData.ectc ? parseFloat(formData.ectc) : undefined,
        vam_proposed_ctc: formData.vam_proposed_ctc ? parseFloat(formData.vam_proposed_ctc) : undefined,
        revised_ctc: formData.revised_ctc ? parseFloat(formData.revised_ctc) : undefined,
        deviation: formData.deviation ? parseInt(formData.deviation) : undefined,
        jb_amt: formData.jb_amt ? parseFloat(formData.jb_amt) : undefined,
        days_lapsed: formData.days_lapsed ? parseInt(formData.days_lapsed) : undefined,
        np_buyout_amt: formData.np_buyout_amt ? parseFloat(formData.np_buyout_amt) : undefined
      })
      setDocxPath(response.docx_path)
      toast.success('Offer letter (docx) generated!')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate docx offer letter')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  useEffect(() => {
    setSalaryBreakdown(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-teal-100">
      <Navbar user={user} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Create New Offer Letter
            </h1>
            <p className="text-gray-600">Fill in the details to generate an offer letter</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FiBriefcase className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
        {/* Progress Steps */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className="flex items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: step * 0.1 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                      step <= currentStep
                        ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step < currentStep ? (
                      <FiDollarSign className="w-5 h-5" />
                    ) : (
                      step
                    )}
                  </motion.div>
                  <span className={`ml-2 text-sm font-medium hidden sm:block ${
                    step <= currentStep ? 'text-gray-800' : 'text-gray-400'
                  }`}>
                    {step === 1 && 'General / Recruitment'}
                    {step === 2 && 'Position'}
                    {step === 3 && 'Compensation'}
                  </span>
                </div>
                {step < totalSteps && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step < currentStep ? 'bg-teal-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="card mb-6">
                {/* General/Recruitment Section */}
                <h2 className="text-2xl font-bold text-gray-800 mb-4">General / Recruitment Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <select name="status" className="form-input w-full" value={formData.status} onChange={handleChange} required>
                    <option value="">Status</option>
                    <option value="Joined">Joined</option>
                    <option value="Offer Made">Offer Made</option>
                    <option value="Abscond">Abscond</option>
                    <option value="Decline">Decline</option>
                    <option value="Revoked">Revoked</option>
                  </select>
                  <input type="text" name="tag_poc" placeholder="TAG POC" className="form-input w-full" value={formData.tag_poc} onChange={handleChange} />
                  <input type="text" name="pos_id" placeholder="POS ID" className="form-input w-full" value={formData.pos_id} onChange={handleChange} />
                  <select name="source" className="form-input w-full" value={formData.source} onChange={handleChange} required>
                    <option value="">Source</option>
                    <option value="Direct">Direct</option>
                    <option value="ER">ER</option>
                    <option value="Vendor">Vendor</option>
                  </select>
                  {/* Source Type/Details dynamic fields */}
                  {formData.source === 'Direct' && (
                    <input type="text" name="source_details" placeholder="Source Details" className="form-input w-full" value={formData.source_details} onChange={handleChange} />
                  )}
                  {formData.source === 'Vendor' && (
                    <>
                      <input type="text" name="source_type" placeholder="Vendor POC" className="form-input w-full" value={formData.source_type} onChange={handleChange} />
                      <input type="text" name="source_details" placeholder="Vendor Details" className="form-input w-full" value={formData.source_details} onChange={handleChange} />
                    </>
                  )}
                  {formData.source === 'ER' && (
                    <input type="text" name="source_type" placeholder="ER - Referral Email" className="form-input w-full" value={formData.source_type} onChange={handleChange} />
                  )}
                  <input type="text" name="candidate_name" placeholder="Candidate Name (Full Name)" className="form-input w-full" value={formData.candidate_name} onChange={handleChange} />
                  <input type="number" name="years_of_experience" placeholder="Years of Experience" className="form-input w-full" value={formData.years_of_experience} onChange={handleChange} />
                  <div className="col-span-1">
                    <label htmlFor="offer_approval_email_sent_date" className="block text-sm font-semibold text-gray-700 mb-1">Offer Approval Email Sent Date</label>
                    <input type="date" id="offer_approval_email_sent_date" name="offer_approval_email_sent_date" className="form-input w-full" value={formData.offer_approval_email_sent_date} onChange={handleChange} />
                  </div>
                  <div className="col-span-1">
                    <label htmlFor="offer_approval_received_date" className="block text-sm font-semibold text-gray-700 mb-1">Offer Approval Received Date</label>
                    <input type="date" id="offer_approval_received_date" name="offer_approval_received_date" className="form-input w-full" value={formData.offer_approval_received_date} onChange={handleChange} />
                  </div>
                  <div className="col-span-1">
                    <label htmlFor="date_of_offer" className="block text-sm font-semibold text-gray-700 mb-1">Date of Offer</label>
                    <input type="date" id="date_of_offer" name="date_of_offer" className="form-input w-full" value={formData.date_of_offer} onChange={handleChange} />
                  </div>
                  <input type="text" name="primary_skill" placeholder="Primary Skill" className="form-input w-full" value={formData.primary_skill} onChange={handleChange} />
                  <input type="text" name="secondary_skill" placeholder="Secondary Skill" className="form-input w-full" value={formData.secondary_skill} onChange={handleChange} />
                  <input type="text" name="current_location" placeholder="Current Location" className="form-input w-full" value={formData.current_location} onChange={handleChange} />
                  <input type="tel" name="candidate_phone" placeholder="Contact No" className="form-input w-full" value={formData.candidate_phone} onChange={handleChange} />
                  <input type="email" name="candidate_email" placeholder="Email ID" className="form-input w-full" value={formData.candidate_email} onChange={handleChange} />
                  <input type="text" name="candidate_address" placeholder="Address" className="form-input w-full" value={formData.candidate_address} onChange={handleChange} />
                  <input type="text" name="pan" placeholder="PAN" className="form-input w-full" value={formData.pan} onChange={handleChange} />
                  <input type="text" name="prev_org" placeholder="Previous Organization" className="form-input w-full" value={formData.prev_org} onChange={handleChange} />
                  <input type="text" name="comments" placeholder="Comments" className="form-input w-full" value={formData.comments} onChange={handleChange} />
                </div>
                <div className="flex justify-end mt-6">
                  <button type="button" onClick={() => setCurrentStep(2)} className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                    Next: Position Details
                  </button>
                </div>
              </motion.div>
            )}
            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="card mb-6">
                {/* Position Section */}
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Position Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="text" name="designation" placeholder="Designation" className="form-input w-full" value={formData.designation} onChange={handleChange} />
                  <input type="text" name="position" placeholder="Position" className="form-input w-full" value={formData.position} onChange={handleChange} />
                  <input type="text" name="grade" placeholder="Grade" className="form-input w-full" value={formData.grade} onChange={handleChange} />
                  <input type="text" name="department" placeholder="Department" className="form-input w-full" value={formData.department} onChange={handleChange} />
                  <select name="business_unit" className="form-input w-full" value={formData.business_unit} onChange={handleChange} required>
                    <option value="">Business Unit (Group)</option>
                    <option value="P&C">P&C</option>
                    <option value="OwlSure">OwlSure</option>
                  </select>
                  <select name="tsc" className="form-input w-full" value={formData.tsc} onChange={handleChange} required>
                    <option value="">Technology Solution Center (TSC)</option>
                    <option value="Core Platforms">Core Platforms</option>
                    <option value="Platform, App & Infra">Platform, App & Infra</option>
                    <option value="Data & BI">Data & BI</option>
                    <option value="Advanced Analytics">Advanced Analytics</option>
                    <option value="Risk Analytics">Risk Analytics</option>
                  </select>
                  <select name="sub_tsc" className="form-input w-full" value={formData.sub_tsc} onChange={handleChange} required>
                    <option value="">Sub-TSC</option>
                    <option value="Core">Core</option>
                    <option value="CCM">CCM</option>
                    <option value="Domain">Domain</option>
                    <option value="QE">QE</option>
                    <option value="App">App</option>
                    <option value="Data">Data</option>
                  </select>
                  <select name="allocation_unit" className="form-input w-full" value={formData.allocation_unit} onChange={handleChange} required>
                    <option value="">Select Allocation Unit</option>
                    <option value="P&C">P&C</option>
                    <option value="OwlSure">OwlSure</option>
                  </select>
                  <input type="text" name="account" placeholder="Account" className="form-input w-full" value={formData.account} onChange={handleChange} />
                  <input type="text" name="project" placeholder="Project" className="form-input w-full" value={formData.project} onChange={handleChange} />
                  <select name="employment_type" className="form-input w-full" value={formData.employment_type} onChange={handleChange} required>
                    <option value="">Employment Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Contractor">Contractor</option>
                  </select>
                  <select name="facility" className="form-input w-full" value={formData.facility} onChange={handleChange} required>
                    <option value="">Facility</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Coimbatore">Coimbatore</option>
                    <option value="Pune">Pune</option>
                    <option value="Banglore">Banglore</option>
                  </select>
                  {/* Work Location dropdown only for Hyderabad */}
                  {formData.facility === 'Hyderabad' && (
                    <select name="work_location" className="form-input w-full" value={formData.work_location} onChange={handleChange} required>
                      <option value="">Work Location</option>
                      <option value="Palnadu">Palnadu</option>
                      <option value="Mantri cosmos">Mantri cosmos</option>
                      <option value="VM-towers">VM-towers</option>
                    </select>
                  )}
                  <div className="form-group">
                    <label htmlFor="work_mode">Work Mode</label>
                    <select
                      id="work_mode"
                      name="work_mode"
                      value={formData.work_mode}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select</option>
                      <option value="Remote">Remote</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>
                  <input type="text" name="reporting_manager" placeholder="Reporting Manager (Full Name)" className="form-input w-full" value={formData.reporting_manager} onChange={handleChange} />
                  <div className="col-span-1">
                    <label htmlFor="joining_date" className="block text-sm font-semibold text-gray-700 mb-1">Joining Date</label>
                    <input type="date" id="joining_date" name="joining_date" className="form-input w-full" value={formData.joining_date} onChange={handleChange} />
                  </div>
                  <input type="text" name="probation_period" placeholder="Probation Period" className="form-input w-full" value={formData.probation_period} onChange={handleChange} />
                  <input type="text" name="notice_period" placeholder="Notice Period" className="form-input w-full" value={formData.notice_period} onChange={handleChange} />
                </div>
                <div className="flex justify-between mt-6">
                  <button type="button" onClick={() => setCurrentStep(1)} className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl font-semibold shadow hover:shadow-xl transition-all">
                    Back
                  </button>
                  <button type="button" onClick={() => setCurrentStep(3)} className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                    Next: Compensation Details
                  </button>
                </div>
              </motion.div>
            )}
            {currentStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="card mb-6">
                {/* Compensation Section */}
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Compensation Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="number" name="current_ctc" placeholder="Current CTC" className="form-input w-full" value={formData.current_ctc} onChange={handleChange} />
                  <input type="number" name="ectc" placeholder="ECTC" className="form-input w-full" value={formData.ectc} onChange={handleChange} />
                  <input type="number" name="vam_proposed_ctc" placeholder="VAM Proposed CTC" className="form-input w-full" value={formData.vam_proposed_ctc} onChange={handleChange} />
                  <input type="number" name="revised_ctc" placeholder="Revised CTC (after initial Offer)" className="form-input w-full" value={formData.revised_ctc} onChange={handleChange} />
                  <input type="number" name="total_salary" placeholder="Total Salary" className="form-input w-full" value={formData.total_salary} onChange={handleTotalSalaryChange} />
                  <input
                    type="text"
                    name="deviation"
                    placeholder="Deviation (in percentage)"
                    className="form-input w-full"
                    value={calculateDeviation()}
                    readOnly
                  />
                  <input type="number" name="jb_amt" placeholder="JB Amount (Rs)" className="form-input w-full" value={formData.jb_amt} onChange={handleChange} />
                  <input type="text" name="jb_reason" placeholder="JB Reason" className="form-input w-full" value={formData.jb_reason} onChange={handleChange} />
                  <input type="number" name="days_lapsed" placeholder="Days Lapsed" className="form-input w-full" value={formData.days_lapsed} onChange={handleChange} />
                  <input type="number" name="np_buyout_amt" placeholder="NP Buyout (If yes - amt)" className="form-input w-full" value={formData.np_buyout_amt} onChange={handleChange} />
                  <div className="col-span-1">
                    <label htmlFor="np_buyout_mail_approval_date" className="block text-sm font-semibold text-gray-700 mb-1">NP Buyout Mail Approval Date</label>
                    <input type="date" id="np_buyout_mail_approval_date" name="np_buyout_mail_approval_date" className="form-input w-full" value={formData.np_buyout_mail_approval_date} onChange={handleChange} />
                  </div>
                </div>
                {/* Salary Breakdown Display */}
                {salaryBreakdown && (
                  <div className="mt-8 p-6 bg-white rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold mb-4 text-teal-700">Salary Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Render backend breakdown keys if available, else fallback to frontend */}
                      {Object.entries(salaryBreakdown).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-bold">{key.replace(/_/g, ' ')}:</span> <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="form-group">
                  <label>Download Offer Letter (PDF):</label>
                  {pdfPath && <a href={pdfPath} target="_blank" rel="noopener noreferrer">Download PDF</a>}
                </div>
                <div className="form-group">
                  <label>Download Offer Letter (DOCX):</label>
                  {docxPath && <a href={docxPath} target="_blank" rel="noopener noreferrer">Download DOCX</a>}
                </div>
                <div className="flex justify-between mt-6">
                  <button type="button" onClick={() => setCurrentStep(2)} className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl font-semibold shadow hover:shadow-xl transition-all">
                    Back
                  </button>
                  <button type="submit" className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all" disabled={loading}>
                    {loading ? 'Generating...' : 'Generate Offer Letter'}
                  </button>
                  <button type="button" onClick={handleGenerateDocx} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                    Generate Docx Offer Letter
                  </button>
                </div>
                {docxPath && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                    <span className="font-semibold text-blue-700">Offer letter (docx) generated:</span>
                    <a href={`/${docxPath}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 underline">Download / Preview</a>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
      <Modal isOpen={showEmailModal} onClose={() => { setShowEmailModal(false); navigate('/dashboard') }} title="Send Offer Letter Email?">
        {emailSent ? (
          <div className="text-green-700 font-semibold text-lg">Email sent successfully!</div>
        ) : (
          <>
            <div className="mb-4">Do you want to send the offer letter email to the candidate now?</div>
            <div className="flex gap-4 justify-end">
              <button onClick={() => { setShowEmailModal(false); navigate('/dashboard') }} className="px-4 py-2 bg-gray-200 rounded-lg">No</button>
              <button onClick={handleSendEmail} className="px-4 py-2 bg-teal-600 text-white rounded-lg" disabled={emailSending}>{emailSending ? 'Sending...' : 'Yes, Send Email'}</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}

export default OfferLetterForm
