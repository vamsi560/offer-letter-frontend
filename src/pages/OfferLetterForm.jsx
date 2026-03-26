// Map API salary breakdown keys to UI keys (handles numeric and string values, new API structure)
function mapSalaryBreakdown(apiData) {
  const format = (val) =>
    typeof val === 'number'
      ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(val)
      : val || '-';

  return {
    basicMonthly: format(apiData.Monthly_Basic),
    basicAnnual: format(apiData.Annual_Basic),
    hraMonthly: format(apiData.Monthly_HRA),
    hraAnnual: format(apiData.Annual_HRA),
    conveyanceMonthly: format(apiData.Monthly_Conveyance),
    conveyanceAnnual: format(apiData.Annual_Conveyance),
    ltaMonthly: format(apiData.Monthly_LTA),
    ltaAnnual: format(apiData.Annual_LTA),
    foodMonthly: format(apiData.Monthly_Food),
    foodAnnual: format(apiData.Annual_Food),
    gratuityMonthly: format(apiData.Monthly_Gratuity),
    gratuityAnnual: format(apiData.Annual_Gratuity),
    employerPfMonthly: format(apiData.Employer_PF_Monthly),
    employerPfAnnual: format(apiData.Employer_PF_Annual),
    totalEarningsMonthly: format(apiData.Total_Earnings_Monthly),
    totalEarningsAnnual: format(apiData.Total_Earnings_Annual),
    statutoryTotalMonthly: format(apiData.Total_Statutory_Monthly),
    statutoryTotalAnnual: format(apiData.Total_Statutory_Annual),
    ctcMonthly: format(apiData.Total_Monthly_CTC),
    ctcAnnual: format(apiData.Total_Annual_CTC),
    deductionPfMonthly: apiData.Monthly_PF || '-', // string, e.g. "3600(1800 + 1800)"
    deductionPfAnnual: format(apiData.Annual_PF),
    professionalTaxMonthly: format(apiData.Monthly_Professional_Tax),
    professionalTaxAnnual: format(apiData.Annual_Professional_Tax),
    totalDeductionsMonthly: format(apiData.Total_Deductions_Monthly),
    totalDeductionsAnnual: format(apiData.Total_Deductions_Annual),
    netMonthly: format(apiData.Net_Monthly_Salary),
    netAnnual: format(apiData.Net_Annual_Salary),
    // Add any additional mappings as needed
  };
}
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiBriefcase, FiDollarSign, FiEye } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import OfferLetterPreview from '../components/OfferLetterPreview'
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

  const autoPopulateData = async () => {
    const today = new Date().toISOString().split('T')[0];
    const joiningDate = new Date();
    joiningDate.setDate(joiningDate.getDate() + 30);
    const joiningDateStr = joiningDate.toISOString().split('T')[0];

    const newFormData = {
      status: 'Offer Made',
      tag_poc: 'John Manager',
      pos_id: 'POS-2024-001',
      source: 'Direct',
      source_type: '',
      source_details: 'LinkedIn',
      candidate_name: 'Rajesh Kumar',
      years_of_experience: '5',
      offer_approval_email_sent_date: today,
      offer_approval_received_date: today,
      date_of_offer: today,
      primary_skill: 'React.js',
      secondary_skill: 'Node.js',
      current_location: 'Bangalore',
      candidate_phone: '9876543210',
      candidate_email: 'rajesh.kumar@example.com',
      candidate_address: '123, MG Road, Bangalore, Karnataka - 560001',
      pan: 'ABCDE1234F',
      prev_org: 'Tech Solutions Pvt Ltd',
      comments: 'Excellent candidate with strong technical skills',
      designation: 'Senior Software Engineer',
      position: 'Full Stack Developer',
      grade: 'Grade A',
      department: 'Engineering',
      business_unit: 'P&C',
      tsc: 'Platform, App & Infra',
      sub_tsc: 'App',
      allocation_unit: 'P&C',
      account: 'Internal Projects',
      project: 'Insurance Platform Modernization',
      employment_type: 'Full-time',
      facility: 'Hyderabad',
      work_location: 'Palnadu',
      work_mode: 'Offline',
      reporting_manager: 'Sarah Williams',
      joining_date: joiningDateStr,
      probation_period: '6 months',
      notice_period: '90 days',
      current_ctc: '1200000',
      ectc: '1500000',
      vam_proposed_ctc: '1600000',
      revised_ctc: '',
      total_salary: '1600000',
      deviation: '',
      jb_amt: '',
      jb_reason: '',
      days_lapsed: '',
      np_buyout_amt: '',
      np_buyout_mail_approval_date: '',
    };
    
    setFormData(newFormData);
    toast.success('Form auto-populated with sample data!');
    
    // Trigger salary breakdown calculation immediately after setting form data
    setCalculatingBreakdown(true);
    try {
      // Mock salary breakdown data
      const salary = 1600000;
      const breakdown = {
        Total_Annual_Gross: formatCurrency(salary),
        Total_In_Words: 'Sixteen Lakh Only',
        Compensation_Table_Rows: [
          {
            component: 'Basic Salary',
            monthly: formatCurrency(salary * 0.4 / 12),
            annual: formatCurrency(salary * 0.4)
          },
          {
            component: 'House Rent Allowance',
            monthly: formatCurrency(salary * 0.3 / 12),
            annual: formatCurrency(salary * 0.3)
          },
          {
            component: 'Conveyance',
            monthly: formatCurrency(salary * 0.05 / 12),
            annual: formatCurrency(salary * 0.05)
          },
          {
            component: 'Provident Fund Contribution',
            monthly: formatCurrency(salary * 0.12 / 12),
            annual: formatCurrency(salary * 0.12)
          },
          {
            component: 'Gratuity (payable as per gratuity act)',
            monthly: formatCurrency(salary * 0.048 / 12),
            annual: formatCurrency(salary * 0.048)
          },
          {
            component: 'Flexible Benefits:',
            monthly: '',
            annual: ''
          },
          {
            component: 'Meal Card',
            monthly: formatCurrency(salary * 0.01 / 12),
            annual: formatCurrency(salary * 0.01)
          },
          {
            component: 'LTC',
            monthly: formatCurrency(salary * 0.015 / 12),
            annual: formatCurrency(salary * 0.015)
          },
          {
            component: 'NPS',
            monthly: formatCurrency(salary * 0.02 / 12),
            annual: formatCurrency(salary * 0.02)
          },
          {
            component: 'Total',
            monthly: formatCurrency(salary / 12),
            annual: formatCurrency(salary)
          }
        ]
      };
      
      setSalaryBreakdown(breakdown);
      console.log('Auto-populated salary breakdown:', breakdown);
      toast.success('Salary breakdown calculated!');
    } catch (error) {
      console.error('Error in auto-populate breakdown:', error);
    } finally {
      setCalculatingBreakdown(false);
    }
  };

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
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const requiredFieldsByStep = {
    1: [
      { key: 'candidate_name', label: 'Candidate Name' },
      { key: 'candidate_email', label: 'Candidate Email' },
      { key: 'candidate_phone', label: 'Candidate Phone' },
      { key: 'pan', label: 'PAN' },
      { key: 'tag_poc', label: 'TAG POC' },
      { key: 'status', label: 'Status' },
      { key: 'source', label: 'Source' },
    ],
    2: [
      { key: 'designation', label: 'Designation' },
      { key: 'position', label: 'Position' },
      { key: 'department', label: 'Department' },
      { key: 'employment_type', label: 'Employment Type' },
      { key: 'facility', label: 'Facility' },
      { key: 'work_mode', label: 'Work Mode' },
      { key: 'joining_date', label: 'Joining Date' },
    ],
    3: [
      { key: 'total_salary', label: 'Total Salary' },
      { key: 'current_ctc', label: 'Current CTC' },
    ],
  }

  const requiredForEmail = [
    { key: 'candidate_name', label: 'Candidate Name' },
    { key: 'candidate_email', label: 'Candidate Email' },
    { key: 'tag_poc', label: 'TAG POC' },
    { key: 'designation', label: 'Designation' },
    { key: 'joining_date', label: 'Joining Date' },
    { key: 'facility', label: 'Facility' },
    { key: 'work_mode', label: 'Work Mode' },
  ]

  const calculateSalaryBreakdown = async () => {
    const totalSalary = formData.total_salary;
    if (!totalSalary || parseFloat(totalSalary) <= 0) {
      setSalaryBreakdown(null)
      return
    }

    setCalculatingBreakdown(true)
    try {
      // Try API call first, if it fails, use mock data
      let breakdown;
      try {
        breakdown = await offerLetterAPI.getSalaryBreakdown(parseFloat(totalSalary));
        breakdown = mapSalaryBreakdown(breakdown);
      } catch (apiError) {
        console.log('API call failed, using mock data:', apiError);
        // Mock salary breakdown data
        const salary = parseFloat(totalSalary);
        breakdown = {
          Total_Annual_Gross: formatCurrency(salary),
          Total_In_Words: convertNumberToWords(salary),
          Compensation_Table_Rows: [
            {
              component: 'Basic Salary',
              monthly: formatCurrency(salary * 0.4 / 12),
              annual: formatCurrency(salary * 0.4)
            },
            {
              component: 'House Rent Allowance',
              monthly: formatCurrency(salary * 0.3 / 12),
              annual: formatCurrency(salary * 0.3)
            },
            {
              component: 'Conveyance',
              monthly: formatCurrency(salary * 0.05 / 12),
              annual: formatCurrency(salary * 0.05)
            },
            {
              component: 'Provident Fund Contribution',
              monthly: formatCurrency(salary * 0.12 / 12),
              annual: formatCurrency(salary * 0.12)
            },
            {
              component: 'Gratuity (payable as per gratuity act)',
              monthly: formatCurrency(salary * 0.048 / 12),
              annual: formatCurrency(salary * 0.048)
            },
            {
              component: 'Flexible Benefits:',
              monthly: '',
              annual: ''
            },
            {
              component: 'Meal Card',
              monthly: formatCurrency(salary * 0.01 / 12),
              annual: formatCurrency(salary * 0.01)
            },
            {
              component: 'LTC',
              monthly: formatCurrency(salary * 0.015 / 12),
              annual: formatCurrency(salary * 0.015)
            },
            {
              component: 'NPS',
              monthly: formatCurrency(salary * 0.02 / 12),
              annual: formatCurrency(salary * 0.02)
            },
            {
              component: 'Total',
              monthly: formatCurrency(salary / 12),
              annual: formatCurrency(salary)
            }
          ]
        };
      }
      
      setSalaryBreakdown(breakdown)
      console.log('Salary breakdown calculated:', breakdown);
      toast.success('Salary breakdown calculated successfully!');
    } catch (error) {
      console.error('Error calculating salary breakdown:', error)
      toast.error('Failed to calculate salary breakdown')
    } finally {
      setCalculatingBreakdown(false)
    }
  }

  // Helper function to convert number to words (simplified)
  const convertNumberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num >= 100000) {
      const lakhs = Math.floor(num / 100000);
      const remainder = num % 100000;
      let result = `${ones[lakhs]} Lakh`;
      if (remainder > 0) {
        if (remainder >= 1000) {
          const thousands = Math.floor(remainder / 1000);
          result += ` ${ones[thousands]} Thousand`;
        }
        result += ' Only';
      } else {
        result += ' Only';
      }
      return result;
    }
    return 'Amount in Words';
  };

  // Deviation (in percentage) calculation
  const calculateDeviation = () => {
    const currentCtc = parseFloat(formData.current_ctc) || 0;
    const totalSalary = parseFloat(formData.total_salary) || 0;
    if (currentCtc > 0) {
      return (((totalSalary - currentCtc) / currentCtc) * 100).toFixed(2);
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target
    const normalizedValue = name === 'pan' ? value.toUpperCase().replace(/\s+/g, '') : value
    setFormData((prev) => ({
      ...prev,
      [name]: normalizedValue
    }))
  }

  // Only update the value, do not call salary breakdown here
  const handleTotalSalaryChange = (e) => {
    handleChange(e);
    // Do NOT call calculateSalaryBreakdown here
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const computedDeviation = calculateDeviation()
      const missingAcrossSteps = getMissingFieldsForSteps([1, 2, 3])
      const missingForEmail = getMissingFields(requiredForEmail)
      if (missingAcrossSteps.length > 0 || missingForEmail.length > 0) {
        const allMissing = [...new Set([...missingAcrossSteps, ...missingForEmail])]
        toast.error(`Please fill required fields: ${allMissing.slice(0, 4).join(', ')}${allMissing.length > 4 ? '...' : ''}`)
        setLoading(false)
        return
      }
      if (!isPanValid()) {
        toast.error('Please enter a valid PAN (e.g., ABCDE1234F)')
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
        deviation: computedDeviation ? parseInt(computedDeviation, 10) : undefined,
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
    const missingForEmail = getMissingFields(requiredForEmail)
    if (missingForEmail.length > 0) {
      toast.error(`Please fill email-required fields: ${missingForEmail.slice(0, 4).join(', ')}${missingForEmail.length > 4 ? '...' : ''}`)
      return
    }

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
      const computedDeviation = calculateDeviation()
      const response = await offerLetterAPI.generateDocx({
        ...formData,
        total_salary: formData.total_salary ? parseFloat(formData.total_salary) : undefined,
        current_ctc: formData.current_ctc ? parseFloat(formData.current_ctc) : undefined,
        ectc: formData.ectc ? parseFloat(formData.ectc) : undefined,
        vam_proposed_ctc: formData.vam_proposed_ctc ? parseFloat(formData.vam_proposed_ctc) : undefined,
        revised_ctc: formData.revised_ctc ? parseFloat(formData.revised_ctc) : undefined,
        deviation: computedDeviation ? parseInt(computedDeviation, 10) : undefined,
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

  const isPanValid = () => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test((formData.pan || '').trim())

  const getMissingFields = (requiredList) =>
    requiredList
      .filter(({ key }) => !String(formData[key] ?? '').trim())
      .map(({ label }) => label)

  const getMissingFieldsForStep = (step) => getMissingFields(requiredFieldsByStep[step] || [])

  const getMissingFieldsForSteps = (steps) => steps.flatMap((s) => getMissingFieldsForStep(s))

  const goToStep = (nextStep) => {
    const missingCurrent = getMissingFieldsForStep(currentStep)
    if (nextStep > currentStep && missingCurrent.length > 0) {
      toast.error(`Complete required fields: ${missingCurrent.slice(0, 4).join(', ')}${missingCurrent.length > 4 ? '...' : ''}`)
      return
    }
    setCurrentStep(nextStep)
  }

  const renderRequiredSummary = (step) => {
    const missing = getMissingFieldsForStep(step)
    if (missing.length === 0) return null
    return (
      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
        <div className="text-sm font-semibold text-amber-800">Required fields missing</div>
        <div className="text-sm text-amber-700 mt-1">{missing.join(', ')}</div>
      </div>
    )
  }

  const renderCurrencyPreview = (fieldName) => {
    const raw = formData[fieldName]
    if (raw === '' || raw === null || raw === undefined) return null
    const n = Number(raw)
    if (!Number.isFinite(n)) return null
    return <div className="text-xs text-gray-500 mt-1">{formatCurrency(n)}</div>
  }

  const renderBreakdownValue = (value) => {
    if (Array.isArray(value)) {
      return (
        <div className="space-y-2">
          {value.map((row, index) => (
            <div key={index} className="text-sm text-gray-700">
              {typeof row === 'object' && row !== null
                ? `${row.component || 'Item'}: ${row.monthly || '-'} / ${row.annual || '-'}`
                : String(row)}
            </div>
          ))}
        </div>
      )
    }

    if (value && typeof value === 'object') {
      return (
        <div className="text-sm text-gray-700">
          {Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(', ')}
        </div>
      )
    }

    return <span>{String(value ?? '')}</span>
  }

  // Add a row for 'Total Gross' at the end of the breakdown
  let compensationRows = Array.isArray(salaryBreakdown?.Compensation_Table_Rows)
    ? salaryBreakdown.Compensation_Table_Rows.slice()
    : [];

  // Remove any previous 'Total' row to avoid duplication
  compensationRows = compensationRows.filter(row => !(row.component && row.component.toLowerCase().includes('total')));

  if (formData.total_salary) {
    const totalSalary = parseFloat(formData.total_salary);
    const monthlyGross = (totalSalary / 12).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });
    const annualGross = totalSalary.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });
    compensationRows.push({
      component: 'Total Gross',
      monthly: monthlyGross,
      annual: annualGross,
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-teal-100">
      <Navbar user={user} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Create New Offer Letter
            </h1>
            <p className="text-gray-600">Fill in the details to generate an offer letter</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={autoPopulateData}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <span>Auto Fill</span>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FiBriefcase className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
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
                {renderRequiredSummary(1)}
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
                  <div>
                    <input
                      type="text"
                      name="pan"
                      placeholder="PAN"
                      className={`form-input w-full ${formData.pan && !isPanValid() ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`}
                      maxLength={10}
                      value={formData.pan}
                      onChange={handleChange}
                    />
                    {formData.pan && (
                      <div className={`text-xs mt-1 ${isPanValid() ? 'text-green-600' : 'text-red-600'}`}>
                        {isPanValid() ? 'Valid PAN format' : 'Invalid PAN format (ABCDE1234F)'}
                      </div>
                    )}
                  </div>
                  <input type="text" name="prev_org" placeholder="Previous Organization" className="form-input w-full" value={formData.prev_org} onChange={handleChange} />
                  <input type="text" name="comments" placeholder="Comments" className="form-input w-full" value={formData.comments} onChange={handleChange} />
                </div>
                <div className="flex justify-end mt-6">
                  <button type="button" onClick={() => goToStep(2)} className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                    Next: Position Details
                  </button>
                </div>
              </motion.div>
            )}
            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="card mb-6">
                {/* Position Section */}
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Position Details</h2>
                {renderRequiredSummary(2)}
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
                    <select
                      name="work_mode"
                      className="form-input w-full"
                      value={formData.work_mode}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Work Mode</option>
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
                  <button type="button" onClick={() => goToStep(1)} className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl font-semibold shadow hover:shadow-xl transition-all">
                    Back
                  </button>
                  <button type="button" onClick={() => goToStep(3)} className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                    Next: Compensation Details
                  </button>
                </div>
              </motion.div>
            )}
            {currentStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="card mb-6">
                {/* Compensation Section */}
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Compensation Details</h2>
                {renderRequiredSummary(3)}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><input type="number" name="current_ctc" placeholder="Current CTC" className="form-input w-full" value={formData.current_ctc} onChange={handleChange} />{renderCurrencyPreview('current_ctc')}</div>
                  <div><input type="number" name="ectc" placeholder="ECTC" className="form-input w-full" value={formData.ectc} onChange={handleChange} />{renderCurrencyPreview('ectc')}</div>
                  <div><input type="number" name="vam_proposed_ctc" placeholder="VAM Proposed CTC" className="form-input w-full" value={formData.vam_proposed_ctc} onChange={handleChange} />{renderCurrencyPreview('vam_proposed_ctc')}</div>
                  <div><input type="number" name="revised_ctc" placeholder="Revised CTC (after initial Offer)" className="form-input w-full" value={formData.revised_ctc} onChange={handleChange} />{renderCurrencyPreview('revised_ctc')}</div>
                  <div><input type="number" name="total_salary" placeholder="Total Salary" className="form-input w-full" value={formData.total_salary} onChange={handleTotalSalaryChange} />{renderCurrencyPreview('total_salary')}</div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="deviation"
                      placeholder="Deviation (in percentage)"
                      className="form-input w-full"
                      value={calculateDeviation()}
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={calculateSalaryBreakdown}
                      disabled={calculatingBreakdown || !formData.total_salary}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 whitespace-nowrap"
                    >
                      {calculatingBreakdown ? 'Calculating...' : 'Calculate'}
                    </button>
                  </div>
                  <div><input type="number" name="jb_amt" placeholder="JB Amount (Rs)" className="form-input w-full" value={formData.jb_amt} onChange={handleChange} />{renderCurrencyPreview('jb_amt')}</div>
                  <input type="text" name="jb_reason" placeholder="JB Reason" className="form-input w-full" value={formData.jb_reason} onChange={handleChange} />
                  <input type="number" name="days_lapsed" placeholder="Days Lapsed" className="form-input w-full" value={formData.days_lapsed} onChange={handleChange} />
                  <div><input type="number" name="np_buyout_amt" placeholder="NP Buyout (If yes - amt)" className="form-input w-full" value={formData.np_buyout_amt} onChange={handleChange} />{renderCurrencyPreview('np_buyout_amt')}</div>
                  <div className="col-span-1">
                    <label htmlFor="np_buyout_mail_approval_date" className="block text-sm font-semibold text-gray-700 mb-1">NP Buyout Mail Approval Date</label>
                    <input type="date" id="np_buyout_mail_approval_date" name="np_buyout_mail_approval_date" className="form-input w-full" value={formData.np_buyout_mail_approval_date} onChange={handleChange} />
                  </div>
                </div>
                {/* Salary Breakdown Display */}
                {calculatingBreakdown && (
                  <div className="mt-8 p-6 bg-blue-50 rounded-xl">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mr-3"></div>
                      <p className="text-teal-700 font-medium">Calculating salary breakdown...</p>
                    </div>
                  </div>
                )}
                {salaryBreakdown && (
                  <div className="mt-8 p-6 bg-white rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold mb-4 text-teal-700">Salary Breakdown</h3>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="min-w-full text-sm border border-gray-300">
                        <thead>
                          <tr className="bg-blue-100">
                            <th className="px-3 py-2 text-center font-bold" colSpan="3">Component A - Earnings</th>
                          </tr>
                          <tr className="bg-gray-50">
                            <th className="px-3 py-2 text-left font-semibold">Earnings</th>
                            <th className="px-3 py-2 text-right font-semibold">Monthly Amount</th>
                            <th className="px-3 py-2 text-right font-semibold">Annual</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr><td className="px-3 py-2">Basic Salary</td><td className="px-3 py-2 text-right">{salaryBreakdown?.basicMonthly || '-'}</td><td className="px-3 py-2 text-right">{salaryBreakdown?.basicAnnual || '-'}</td></tr>
                          <tr><td className="px-3 py-2">House Rent Allowance</td><td className="px-3 py-2 text-right">{salaryBreakdown?.hraMonthly || '-'}</td><td className="px-3 py-2 text-right">{salaryBreakdown?.hraAnnual || '-'}</td></tr>
                          <tr><td className="px-3 py-2">Conveyance</td><td className="px-3 py-2 text-right">{salaryBreakdown?.conveyanceMonthly || '-'}</td><td className="px-3 py-2 text-right">{salaryBreakdown?.conveyanceAnnual || '-'}</td></tr>
                          <tr><td className="px-3 py-2">LTA</td><td className="px-3 py-2 text-right">{salaryBreakdown?.ltaMonthly || '-'}</td><td className="px-3 py-2 text-right">{salaryBreakdown?.ltaAnnual || '-'}</td></tr>
                          <tr><td className="px-3 py-2">Food allowance</td><td className="px-3 py-2 text-right">{salaryBreakdown?.foodMonthly || '-'}</td><td className="px-3 py-2 text-right">{salaryBreakdown?.foodAnnual || '-'}</td></tr>
                          <tr className="font-bold bg-blue-50"><td className="px-3 py-2">Total Earnings</td><td className="px-3 py-2 text-right">{salaryBreakdown?.totalEarningsMonthly || '-'}</td><td className="px-3 py-2 text-right">{salaryBreakdown?.totalEarningsAnnual || '-'}</td></tr>
                          <tr className="bg-blue-100"><th className="px-3 py-2 text-center font-bold" colSpan="3">Component B - Statutory Benefits</th></tr>
                          <tr className="bg-gray-50"><th className="px-3 py-2 text-left font-semibold">Statutory Benefits</th><th></th><th></th></tr>
                          <tr><td className="px-3 py-2">Employer PF</td><td className="px-3 py-2 text-right">{salaryBreakdown?.employerPfMonthly || '-'}</td><td className="px-3 py-2 text-right">{salaryBreakdown?.employerPfAnnual || '-'}</td></tr>
                          <tr><td className="px-3 py-2">Gratuity</td><td className="px-3 py-2 text-right">{salaryBreakdown?.gratuityMonthly || '-'}</td><td className="px-3 py-2 text-right">{salaryBreakdown?.gratuityAnnual || '-'}</td></tr>
                          <tr><td className="px-3 py-2">Total</td><td className="px-3 py-2 text-right">{salaryBreakdown?.statutoryTotalMonthly || '-'}</td><td className="px-3 py-2 text-right">{salaryBreakdown?.statutoryTotalAnnual || '-'}</td></tr>
                          <tr className="font-bold bg-blue-50"><td className="px-3 py-2">Total Annual CTC (A+B)</td><td className="px-3 py-2 text-right">{salaryBreakdown?.ctcMonthly || '-'}</td><td className="px-3 py-2 text-right">{salaryBreakdown?.ctcAnnual || '-'}</td></tr>
                          <tr className="bg-blue-100"><th className="px-3 py-2 text-center font-bold" colSpan="3">Deductions</th></tr>
                          <tr><td className="px-3 py-2">Provident Fund (Employee & Employer)</td><td className="px-3 py-2 text-right">{salaryBreakdown?.deductionPfMonthly || '-'}</td><td className="px-3 py-2 text-right">{salaryBreakdown?.deductionPfAnnual || '-'}</td></tr>
                          <tr><td className="px-3 py-2">Gratuity</td><td className="px-3 py-2 text-right">{salaryBreakdown?.deductionGratuityMonthly || '-'}</td><td className="px-3 py-2 text-right">{salaryBreakdown?.deductionGratuityAnnual || '-'}</td></tr>
                          <tr><td className="px-3 py-2">Professional Tax</td><td className="px-3 py-2 text-right">{salaryBreakdown?.professionalTaxMonthly || '-'}</td><td className="px-3 py-2 text-right">{salaryBreakdown?.professionalTaxAnnual || '-'}</td></tr>
                          <tr className="font-bold bg-blue-50"><td className="px-3 py-2">Total Deductions</td><td className="px-3 py-2 text-right">{salaryBreakdown?.totalDeductionsMonthly || '-'}</td><td className="px-3 py-2 text-right">{salaryBreakdown?.totalDeductionsAnnual || '-'}</td></tr>
                          <tr><td className="px-3 py-2">Income Tax</td><td></td><td className="px-3 py-2 text-right">As applicable</td></tr>
                        </tbody>
                      </table>
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
                  <button type="button" onClick={() => goToStep(2)} className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl font-semibold shadow hover:shadow-xl transition-all">
                    Back
                  </button>
                  <div className="flex gap-3">
                    <button 
                      type="button" 
                      onClick={() => setShowPreviewModal(true)} 
                      className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                      <FiEye className="w-5 h-5" />
                      View Preview
                    </button>
                    <button type="button" onClick={handleGenerateDocx} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                      Generate DOCX
                    </button>
                    <button type="submit" className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all" disabled={loading}>
                      {loading ? 'Generating...' : 'Generate Offer Letter'}
                    </button>
                  </div>
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
      <Modal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} title="Send Offer Letter Email?">
        {emailSent ? (
          <div className="text-green-700 font-semibold text-lg">Email sent successfully!</div>
        ) : (
          <>
            <div className="mb-4">Do you want to send the offer letter email to the candidate now?</div>
            <div className="flex gap-4 justify-end">
              <button onClick={() => setShowEmailModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">No</button>
              <button onClick={handleSendEmail} className="px-4 py-2 bg-teal-600 text-white rounded-lg" disabled={emailSending}>{emailSending ? 'Sending...' : 'Yes, Send Email'}</button>
            </div>
          </>
        )}
      </Modal>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-start justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col">
            {/* Fixed Modal Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold">Offer Letter Preview</h2>
                <p className="text-teal-100 text-sm">Review before generating final document</p>
              </div>
              <div className="flex gap-3">
                {/* <button
                  onClick={() => {
                    // Create a new window with just the preview content
                    const printWindow = window.open('', '_blank', 'width=800,height=600');
                    const previewElement = document.querySelector('.print-content');
                    
                    if (printWindow && previewElement) {
                      printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>Offer Letter - ${formData.candidate_name || 'Candidate'}</title>
                          <style>
                            * {
                              margin: 0;
                              padding: 0;
                              box-sizing: border-box;
                            }
                            body {
                              font-family: 'Times New Roman', serif;
                              background: white;
                              color: black;
                              line-height: 1.5;
                            }
                            @page {
                              size: A4;
                              margin: 15mm;
                            }
                            .pdf-page {
                              width: 100%;
                              min-height: 297mm;
                              padding: 20mm;
                              background: white;
                              page-break-after: always;
                              margin-bottom: 20px;
                            }
                            .pdf-page:last-child {
                              page-break-after: avoid;
                              margin-bottom: 0;
                            }
                            table {
                              width: 100%;
                              border-collapse: collapse;
                              margin: 10px 0;
                            }
                            th, td {
                              border: 1px solid black;
                              padding: 8px;
                              text-align: left;
                            }
                            th {
                              background-color: #f0f0f0;
                              font-weight: bold;
                            }
                            .text-center { text-align: center; }
                            .text-right { text-align: right; }
                            .font-bold { font-weight: bold; }
                            .underline { text-decoration: underline; }
                            .border-b { border-bottom: 2px solid black; padding-bottom: 10px; }
                            .border-t { border-top: 2px solid black; padding-top: 10px; }
                            .border-l-4 { border-left: 4px solid black; padding-left: 10px; }
                            .bg-gray-50 { background-color: #f9f9f9; }
                            .bg-gray-100 { background-color: #f3f3f3; }
                            .bg-black { background-color: black; color: white; }
                            .text-black { color: black; }
                            .p-3 { padding: 12px; }
                            .p-4 { padding: 16px; }
                            .mb-2 { margin-bottom: 8px; }
                            .mb-4 { margin-bottom: 16px; }
                            .mb-6 { margin-bottom: 24px; }
                            .mt-4 { margin-top: 16px; }
                            .mt-6 { margin-top: 24px; }
                            .grid { display: grid; }
                            .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
                            .gap-1 { gap: 4px; }
                            .gap-2 { gap: 8px; }
                            .flex { display: flex; }
                            .justify-between { justify-content: space-between; }
                            .items-center { align-items: center; }
                            .space-y-1 > * + * { margin-top: 4px; }
                            .space-y-4 > * + * { margin-top: 16px; }
                            .space-y-5 > * + * { margin-top: 20px; }
                            .text-xs { font-size: 10px; }
                            .text-sm { font-size: 12px; }
                            .text-lg { font-size: 18px; }
                            .text-xl { font-size: 20px; }
                            .text-2xl { font-size: 24px; }
                            .leading-tight { line-height: 1.25; }
                            .leading-relaxed { line-height: 1.6; }
                            img { max-width: 100px; height: auto; }
                            @media print {
                              body { background: white !important; }
                              .pdf-page { 
                                border: none !important; 
                                margin-bottom: 0 !important;
                                box-shadow: none !important;
                                page-break-after: always;
                              }
                              .pdf-page:last-child {
                                page-break-after: avoid;
                              }
                            }
                          </style>
                        </head>
                        <body>
                          ${previewElement.innerHTML}
                        </body>
                        </html>
                      `);
                      
                      printWindow.document.close();
                      
                      // Wait for content to load then print
                      setTimeout(() => {
                        printWindow.focus();
                        printWindow.print();
                        printWindow.close();
                      }, 500);
                    } else {
                      toast.error('Unable to open print preview');
                    }
                  }}
                  className="px-4 py-2 bg-white text-teal-600 rounded-lg hover:bg-gray-100 transition font-semibold flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Preview
                </button> */}
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
            
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto pdf-container">
              <OfferLetterPreview data={formData} salaryBreakdown={salaryBreakdown} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OfferLetterForm
