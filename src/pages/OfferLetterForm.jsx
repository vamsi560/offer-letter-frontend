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
  };
}

import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiBriefcase, FiDollarSign, FiEye, FiFolder, FiLock, FiFileText } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import OfferLetterPreview from '../components/OfferLetterPreview'
import { offerLetterAPI } from '../services/api'

// Custom collapsible accordion item for smart grouping
const SectionAccordion = ({ title, isOpen, onToggle, children, icon: Icon }) => {
  return (
    <div className="border border-teal-100 rounded-xl overflow-hidden mb-6 bg-white shadow-sm hover:shadow transition-shadow duration-300">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex justify-between items-center px-6 py-4 bg-gradient-to-r from-teal-50/70 to-teal-100/30 hover:from-teal-100/50 transition-colors text-left"
      >
        <span className="font-semibold text-teal-800 text-base flex items-center space-x-3">
          {Icon && <Icon className="w-5 h-5 text-teal-600" />}
          <span>{title}</span>
        </span>
        <span className="text-teal-600 font-bold transform transition-transform duration-300" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1200px] opacity-100 border-t border-teal-50' : 'max-h-0 opacity-0 overflow-hidden pointer-events-none'}`}>
        <div className="p-6 bg-white">
          {children}
        </div>
      </div>
    </div>
  );
};

const OfferLetterForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const candidateId = location.state?.candidateId || null

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
    work_mode: '', 
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

  // Accordion Expand States
  const [expandedSections, setExpandedSections] = useState({
    candidateDemographics: true,
    recruiterDetails: true,
    orgPlacement: true,
    roleSpecs: true,
    compBase: true,
    allowances: true,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Indian Rupee Format Helper
  const formatINR = (value) => {
    if (!value) return '';
    const num = String(value).replace(/[^0-9]/g, '');
    if (!num) return '';
    const lastThree = num.substring(num.length - 3);
    const otherNumbers = num.substring(0, num.length - 3);
    const formatted = otherNumbers !== '' 
      ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree 
      : lastThree;
    return '₹ ' + formatted;
  };

  const handleCurrencyChange = (e) => {
    const { name, value } = e.target;
    const rawValue = value.replace(/[^0-9]/g, '');
    setFormData(prev => ({
      ...prev,
      [name]: rawValue
    }));
  };

  // Local Storage Auto-Save Drafts (runs when formData changes)
  useEffect(() => {
    if (!candidateId) {
      const timer = setTimeout(() => {
        localStorage.setItem('offer_letter_draft', JSON.stringify(formData));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData, candidateId]);

  // Restore Draft Action
  useEffect(() => {
    if (!candidateId) {
      const savedDraft = localStorage.getItem('offer_letter_draft');
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          // Check if it has actual data
          if (parsed.candidate_name || parsed.candidate_email) {
            toast.info(
              <div className="flex flex-col">
                <span>We found a previously saved draft.</span>
                <button
                  onClick={() => {
                    setFormData(parsed);
                    toast.success('Draft restored successfully!');
                  }}
                  className="mt-2 bg-teal-600 text-white text-xs px-3 py-1 rounded hover:bg-teal-700 w-fit font-bold"
                >
                  Restore Draft
                </button>
              </div>,
              { autoClose: false, closeOnClick: false }
            );
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [candidateId]);

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
      business_unit: 'ValueMomentum',
      tsc: 'Platform, App & Infra',
      sub_tsc: 'App',
      allocation_unit: 'ValueMomentum',
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
    
    setCalculatingBreakdown(true);
    try {
      const salary = 1600000;
      const breakdown = {
        Total_Annual_Gross: formatCurrency(salary),
        Total_In_Words: 'Sixteen Lakh Only',
        Compensation_Table_Rows: [
          { component: 'Basic Salary', monthly: formatCurrency(salary * 0.4 / 12), annual: formatCurrency(salary * 0.4) },
          { component: 'House Rent Allowance', monthly: formatCurrency(salary * 0.3 / 12), annual: formatCurrency(salary * 0.3) },
          { component: 'Conveyance', monthly: formatCurrency(salary * 0.05 / 12), annual: formatCurrency(salary * 0.05) },
          { component: 'Provident Fund Contribution', monthly: formatCurrency(salary * 0.12 / 12), annual: formatCurrency(salary * 0.12) },
          { component: 'Gratuity (payable as per gratuity act)', monthly: formatCurrency(salary * 0.048 / 12), annual: formatCurrency(salary * 0.048) },
          { component: 'Flexible Benefits:', monthly: '', annual: '' },
          { component: 'Meal Card', monthly: formatCurrency(salary * 0.01 / 12), annual: formatCurrency(salary * 0.01) },
          { component: 'LTC', monthly: formatCurrency(salary * 0.015 / 12), annual: formatCurrency(salary * 0.015) },
          { component: 'NPS', monthly: formatCurrency(salary * 0.02 / 12), annual: formatCurrency(salary * 0.02) },
          { component: 'Total', monthly: formatCurrency(salary / 12), annual: formatCurrency(salary) }
        ]
      };
      
      setSalaryBreakdown(breakdown);
      toast.success('Salary breakdown calculated!');
    } catch (error) {
      console.error(error);
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

  const [generationProgress, setGenerationProgress] = useState(null);

  const getProgressMessage = (status) => {
    switch (status) {
      case 'Generating':
        return 'Compiling statutory splits & rendering placeholder templates...';
      case 'PDF Generated':
        return 'PDF document converted & PAN-encrypted successfully. Delivering secure mail notification...';
      case 'Offer Made':
        return 'Success! Candidate email dispatched with secure PDF attachment.';
      case 'Email Failed':
        return 'Document compiled, but candidate email dispatch failed.';
      case 'Generation Failed':
        return 'PDF conversion subprocess crashed. Check backend logs.';
      default:
        return 'Processing candidate records...';
    }
  };

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
      let breakdown;
      try {
        breakdown = await offerLetterAPI.getSalaryBreakdown(parseFloat(totalSalary));
        breakdown = mapSalaryBreakdown(breakdown);
      } catch (apiError) {
        console.log('API call failed, using mock data:', apiError);
        const salary = parseFloat(totalSalary);
        breakdown = {
          Total_Annual_Gross: formatCurrency(salary),
          Total_In_Words: convertNumberToWords(salary),
          Compensation_Table_Rows: [
            { component: 'Basic Salary', monthly: formatCurrency(salary * 0.4 / 12), annual: formatCurrency(salary * 0.4) },
            { component: 'House Rent Allowance', monthly: formatCurrency(salary * 0.3 / 12), annual: formatCurrency(salary * 0.3) },
            { component: 'Conveyance', monthly: formatCurrency(salary * 0.05 / 12), annual: formatCurrency(salary * 0.05) },
            { component: 'Provident Fund Contribution', monthly: formatCurrency(salary * 0.12 / 12), annual: formatCurrency(salary * 0.12) },
            { component: 'Gratuity (payable as per gratuity act)', monthly: formatCurrency(salary * 0.048 / 12), annual: formatCurrency(salary * 0.048) },
            { component: 'Flexible Benefits:', monthly: '', annual: '' },
            { component: 'Meal Card', monthly: formatCurrency(salary * 0.01 / 12), annual: formatCurrency(salary * 0.01) },
            { component: 'LTC', monthly: formatCurrency(salary * 0.015 / 12), annual: formatCurrency(salary * 0.015) },
            { component: 'NPS', monthly: formatCurrency(salary * 0.02 / 12), annual: formatCurrency(salary * 0.02) },
            { component: 'Total', monthly: formatCurrency(salary / 12), annual: formatCurrency(salary) }
          ]
        };
      }
      
      setSalaryBreakdown(breakdown)
      toast.success('Salary breakdown calculated successfully!');
    } catch (error) {
      console.error(error)
      toast.error('Failed to calculate salary breakdown')
    } finally {
      setCalculatingBreakdown(false)
    }
  }

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

      // Prepare numeric properties properly for API delivery
      const payload = {
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
      };

      const response = candidateId
        ? await offerLetterAPI.update(candidateId, payload)
        : await offerLetterAPI.generate(payload)
      
      const offerId = response.offer_letter_id;
      
      // Clean draft on success
      localStorage.removeItem('offer_letter_draft');
      
      setLastOfferLetter(response)
      if (response.docx_path) setDocxPath(response.docx_path)
      if (response.pdf_path) setPdfPath(response.pdf_path)
      
      // Open full-screen progress animation overlay
      setGenerationProgress({
        show: true,
        status: 'Generating',
        message: 'Initiating document pipeline & compiling splits...'
      });
      
      // Start polling status dynamically
      const pollId = setInterval(async () => {
        try {
          const offerDetails = await offerLetterAPI.getById(offerId);
          const currentStatus = offerDetails.status;
          
          setGenerationProgress(prev => ({
            ...prev,
            status: currentStatus,
            message: getProgressMessage(currentStatus)
          }));
          
          if (currentStatus === 'Offer Made') {
            clearInterval(pollId);
            setTimeout(() => {
              setGenerationProgress(null);
              toast.success('Offer letter generated and candidate notified successfully!');
              navigate('/dashboard');
            }, 1800);
          } else if (currentStatus === 'Generation Failed') {
            clearInterval(pollId);
            setTimeout(() => {
              setGenerationProgress(null);
              toast.error('Failed to generate PDF document. Check server logs.');
            }, 3000);
          } else if (currentStatus === 'Email Failed') {
            clearInterval(pollId);
            setTimeout(() => {
              setGenerationProgress(null);
              toast.warning('Document generated successfully, but automated candidate email dispatch failed.');
              navigate('/dashboard');
            }, 3000);
          }
        } catch (pollErr) {
          console.error('Polling error:', pollErr);
        }
      }, 1500);
      
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
    if (candidateId) {
      offerLetterAPI.getById(candidateId)
        .then((data) => {
          const extra = data.extra_data || {}
          setFormData((prev) => ({
            ...prev,
            candidate_name: data.candidate_name || '',
            candidate_email: data.candidate_email || '',
            candidate_phone: data.candidate_phone || '',
            pan: data.candidate_pan || '',
            status: data.status || '',
            source: data.source || '',
            designation: data.designation || '',
            position: data.position || '',
            department: data.department || '',
            joining_date: data.joining_date || '',
            facility: data.facility || '',
            work_mode: data.work_mode || '',
            total_salary: data.total_salary ? String(data.total_salary) : '',
            current_ctc: data.current_ctc ? String(data.current_ctc) : '',
            tsc: extra.tsc || '',
            ectc: extra.ectc ? String(extra.ectc) : '',
            grade: extra.grade || '',
            jb_amt: extra.jb_amt ? String(extra.jb_amt) : '',
            pos_id: extra.pos_id || '',
            account: extra.account || '',
            project: extra.project || '',
            sub_tsc: extra.sub_tsc || '',
            tag_poc: extra.tag_poc || '',
            comments: extra.comments || '',
            prev_org: extra.prev_org || '',
            deviation: extra.deviation ? String(extra.deviation) : '',
            jb_reason: extra.jb_reason || '',
            days_lapsed: extra.days_lapsed ? String(extra.days_lapsed) : '',
            revised_ctc: extra.revised_ctc ? String(extra.revised_ctc) : '',
            source_type: extra.source_type || '',
            business_unit: extra.business_unit || '',
            date_of_offer: extra.date_of_offer || '',
            notice_period: extra.notice_period || '',
            np_buyout_amt: extra.np_buyout_amt ? String(extra.np_buyout_amt) : '',
            primary_skill: extra.primary_skill || '',
            work_location: extra.work_location || '',
            source_details: extra.source_details || '',
            allocation_unit: extra.allocation_unit || '',
            employment_type: extra.employment_type || 'Full-time',
            secondary_skill: extra.secondary_skill || '',
            current_location: extra.current_location || '',
            probation_period: extra.probation_period || '',
            vam_proposed_ctc: extra.vam_proposed_ctc ? String(extra.vam_proposed_ctc) : '',
            candidate_address: extra.candidate_address || '',
            reporting_manager: extra.reporting_manager || '',
            years_of_experience: extra.years_of_experience ? String(extra.years_of_experience) : '',
            np_buyout_mail_approval_date: extra.np_buyout_mail_approval_date || '',
            offer_approval_received_date: extra.offer_approval_received_date || '',
            offer_approval_email_sent_date: extra.offer_approval_email_sent_date || '',
          }))
          toast.success('Candidate data loaded')
        })
        .catch(() => toast.error('Failed to load candidate data'))
    }
  }, [candidateId]);

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

  let compensationRows = Array.isArray(salaryBreakdown?.Compensation_Table_Rows)
    ? salaryBreakdown.Compensation_Table_Rows.slice()
    : [];

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
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              {candidateId ? 'Edit Offer Letter' : 'Create New Offer Letter'}
            </h1>
            <p className="text-gray-600">{candidateId ? 'Update the candidate details below' : 'Fill in the details to generate an offer letter'}</p>
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
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 border-teal-50">General / Recruitment Details</h2>
                {renderRequiredSummary(1)}
                
                {/* Section 1: Candidate Demographics */}
                <SectionAccordion
                  title="Candidate Demographics"
                  isOpen={expandedSections.candidateDemographics}
                  onToggle={() => toggleSection('candidateDemographics')}
                  icon={FiFileText}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <input type="text" name="candidate_name" placeholder="Candidate Name (Full Name)" className="form-input w-full" value={formData.candidate_name} onChange={handleChange} />
                    <input type="tel" name="candidate_phone" placeholder="Contact No" className="form-input w-full" value={formData.candidate_phone} onChange={handleChange} />
                    <input type="email" name="candidate_email" placeholder="Email ID" className="form-input w-full" value={formData.candidate_email} onChange={handleChange} />
                    <input type="text" name="candidate_address" placeholder="Address" className="form-input w-full" value={formData.candidate_address} onChange={handleChange} />
                    <input type="text" name="current_location" placeholder="Current Location" className="form-input w-full" value={formData.current_location} onChange={handleChange} />
                    
                    <div>
                      <input
                        type="text"
                        name="pan"
                        placeholder="PAN"
                        className={`form-input w-full uppercase ${formData.pan && !isPanValid() ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`}
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
                  </div>
                </SectionAccordion>

                {/* Section 2: Recruitment Context */}
                <SectionAccordion
                  title="Recruitment & Pipeline Context"
                  isOpen={expandedSections.recruiterDetails}
                  onToggle={() => toggleSection('recruiterDetails')}
                  icon={FiFolder}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <select name="status" className="form-input w-full" value={formData.status} onChange={handleChange} required>
                      <option value="">Status</option>
                      {formData.status && !['Joined','Offer Made','Abscond','Decline','Revoked'].includes(formData.status) && (
                        <option value={formData.status}>{formData.status}</option>
                      )}
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
                      {formData.source && !['Direct','ER','Vendor'].includes(formData.source) && (
                        <option value={formData.source}>{formData.source}</option>
                      )}
                      <option value="Direct">Direct</option>
                      <option value="ER">ER</option>
                      <option value="Vendor">Vendor</option>
                    </select>

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
                    
                    <input type="number" name="years_of_experience" placeholder="Years of Experience" className="form-input w-full" value={formData.years_of_experience} onChange={handleChange} />
                    <input type="text" name="primary_skill" placeholder="Primary Skill" className="form-input w-full" value={formData.primary_skill} onChange={handleChange} />
                    <input type="text" name="secondary_skill" placeholder="Secondary Skill" className="form-input w-full" value={formData.secondary_skill} onChange={handleChange} />
                    <input type="text" name="prev_org" placeholder="Previous Organization" className="form-input w-full" value={formData.prev_org} onChange={handleChange} />
                    
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
                    
                    <input type="text" name="comments" placeholder="Comments" className="form-input w-full col-span-1 lg:col-span-3" value={formData.comments} onChange={handleChange} />
                  </div>
                </SectionAccordion>

                <div className="flex justify-end mt-6">
                  <button type="button" onClick={() => goToStep(2)} className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                    Next: Position Details
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="card mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 border-teal-50">Position Details</h2>
                {renderRequiredSummary(2)}

                {/* Section A: Organizational Placement */}
                <SectionAccordion
                  title="Organizational Placement"
                  isOpen={expandedSections.orgPlacement}
                  onToggle={() => toggleSection('orgPlacement')}
                  icon={FiFolder}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <input type="text" name="department" placeholder="Department" className="form-input w-full" value={formData.department} onChange={handleChange} />
                    
                    <select name="business_unit" className="form-input w-full" value={formData.business_unit} onChange={handleChange} required>
                      <option value="">Business Unit (Group)</option>
                      {formData.business_unit && !['ValueMomentum','OwlSure'].includes(formData.business_unit) && (
                        <option value={formData.business_unit}>{formData.business_unit}</option>
                      )}
                      <option value="ValueMomentum">ValueMomentum</option>
                      <option value="OwlSure">OwlSure</option>
                    </select>

                    <select name="tsc" className="form-input w-full" value={formData.tsc} onChange={handleChange} required>
                      <option value="">Technology Solution Center (TSC)</option>
                      {formData.tsc && !['Core Platforms','Platform, App & Infra','Data & BI','Advanced Analytics','Risk Analytics'].includes(formData.tsc) && (
                        <option value={formData.tsc}>{formData.tsc}</option>
                      )}
                      <option value="Core Platforms">Core Platforms</option>
                      <option value="Platform, App & Infra">Platform, App & Infra</option>
                      <option value="Data & BI">Data & BI</option>
                      <option value="Advanced Analytics">Advanced Analytics</option>
                      <option value="Risk Analytics">Risk Analytics</option>
                    </select>

                    <select name="sub_tsc" className="form-input w-full" value={formData.sub_tsc} onChange={handleChange} required>
                      <option value="">Sub-TSC</option>
                      {formData.sub_tsc && !['Core','CCM','Domain','QE','App','Data'].includes(formData.sub_tsc) && (
                        <option value={formData.sub_tsc}>{formData.sub_tsc}</option>
                      )}
                      <option value="Core">Core</option>
                      <option value="CCM">CCM</option>
                      <option value="Domain">Domain</option>
                      <option value="QE">QE</option>
                      <option value="App">App</option>
                      <option value="Data">Data</option>
                    </select>

                    <select name="allocation_unit" className="form-input w-full" value={formData.allocation_unit} onChange={handleChange} required>
                      <option value="">Select Allocation Unit</option>
                      {formData.allocation_unit && !['ValueMomentum','OwlSure'].includes(formData.allocation_unit) && (
                        <option value={formData.allocation_unit}>{formData.allocation_unit}</option>
                      )}
                      <option value="ValueMomentum">ValueMomentum</option>
                      <option value="OwlSure">OwlSure</option>
                    </select>

                    <input type="text" name="account" placeholder="Account" className="form-input w-full" value={formData.account} onChange={handleChange} />
                    <input type="text" name="project" placeholder="Project" className="form-input w-full animate-pulse" value={formData.project} onChange={handleChange} />
                  </div>
                </SectionAccordion>

                {/* Section B: Role Specifications */}
                <SectionAccordion
                  title="Employment & Role Specifications"
                  isOpen={expandedSections.roleSpecs}
                  onToggle={() => toggleSection('roleSpecs')}
                  icon={FiBriefcase}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <input type="text" name="designation" placeholder="Designation" className="form-input w-full font-semibold" value={formData.designation} onChange={handleChange} />
                    <input type="text" name="position" placeholder="Position" className="form-input w-full" value={formData.position} onChange={handleChange} />
                    <input type="text" name="grade" placeholder="Grade" className="form-input w-full" value={formData.grade} onChange={handleChange} />
                    
                    <select name="employment_type" className="form-input w-full" value={formData.employment_type} onChange={handleChange} required>
                      <option value="">Employment Type</option>
                      {formData.employment_type && !['Full-time','Contractor'].includes(formData.employment_type) && (
                        <option value={formData.employment_type}>{formData.employment_type}</option>
                      )}
                      <option value="Full-time">Full-time</option>
                      <option value="Contractor">Contractor</option>
                    </select>

                    <select name="facility" className="form-input w-full" value={formData.facility} onChange={handleChange} required>
                      <option value="">Facility</option>
                      {formData.facility && !['Hyderabad','Coimbatore','Pune','Banglore'].includes(formData.facility) && (
                        <option value={formData.facility}>{formData.facility}</option>
                      )}
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Coimbatore">Coimbatore</option>
                      <option value="Pune">Pune</option>
                      <option value="Banglore">Banglore</option>
                    </select>

                    {formData.facility === 'Hyderabad' && (
                      <select name="work_location" className="form-input w-full" value={formData.work_location} onChange={handleChange} required>
                        <option value="">Work Location</option>
                        <option value="Palnadu">Palnadu</option>
                        <option value="Mantri cosmos">Mantri cosmos</option>
                        <option value="VM-towers">VM-towers</option>
                      </select>
                    )}

                    <select name="work_mode" className="form-input w-full" value={formData.work_mode} onChange={handleChange} required>
                      <option value="">Work Mode</option>
                      {formData.work_mode && !['Work from Office','Remote'].includes(formData.work_mode) && (
                        <option value={formData.work_mode}>{formData.work_mode}</option>
                      )}
                      <option value="Remote">Remote</option>
                      <option value="Work from Office">Work from Office</option>
                    </select>
                    
                    <input type="text" name="reporting_manager" placeholder="Reporting Manager (Full Name)" className="form-input w-full" value={formData.reporting_manager} onChange={handleChange} />
                    <input type="text" name="probation_period" placeholder="Probation Period" className="form-input w-full" value={formData.probation_period} onChange={handleChange} />
                    <input type="text" name="notice_period" placeholder="Notice Period" className="form-input w-full" value={formData.notice_period} onChange={handleChange} />
                    
                    <div className="col-span-1">
                      <label htmlFor="joining_date" className="block text-sm font-semibold text-gray-700 mb-1">Joining Date</label>
                      <input type="date" id="joining_date" name="joining_date" className="form-input w-full" value={formData.joining_date} onChange={handleChange} />
                    </div>
                  </div>
                </SectionAccordion>

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
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 border-teal-50">Compensation Details</h2>
                {renderRequiredSummary(3)}

                {/* Section A: Compensation Baseline */}
                <SectionAccordion
                  title="Salary & Base Compensation"
                  isOpen={expandedSections.compBase}
                  onToggle={() => toggleSection('compBase')}
                  icon={FiDollarSign}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-teal-800 mb-1">Current CTC</label>
                      <input type="text" name="current_ctc" placeholder="Current CTC" className="form-input w-full font-bold text-teal-800 bg-teal-50/20" value={formatINR(formData.current_ctc)} onChange={handleCurrencyChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-teal-800 mb-1">ECTC</label>
                      <input type="text" name="ectc" placeholder="ECTC" className="form-input w-full font-bold text-teal-800 bg-teal-50/20" value={formatINR(formData.ectc)} onChange={handleCurrencyChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-teal-800 mb-1">Proposed VAM CTC</label>
                      <input type="text" name="vam_proposed_ctc" placeholder="VAM Proposed CTC" className="form-input w-full font-bold text-teal-800 bg-teal-50/20" value={formatINR(formData.vam_proposed_ctc)} onChange={handleCurrencyChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-teal-800 mb-1">Revised CTC (after initial offer)</label>
                      <input type="text" name="revised_ctc" placeholder="Revised CTC" className="form-input w-full font-bold text-teal-800 bg-teal-50/20" value={formatINR(formData.revised_ctc)} onChange={handleCurrencyChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-teal-800 mb-1">Total Salary</label>
                      <input type="text" name="total_salary" placeholder="Total Salary" className="form-input w-full font-extrabold text-teal-900 border-2 border-teal-200 bg-teal-50/40" value={formatINR(formData.total_salary)} onChange={handleCurrencyChange} />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Deviation (%) & Calculator</label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          name="deviation"
                          placeholder="Deviation"
                          className="form-input w-full bg-gray-50 border-gray-300 font-semibold"
                          value={calculateDeviation() ? `${calculateDeviation()}%` : ''}
                          readOnly
                        />
                        <button
                          type="button"
                          onClick={calculateSalaryBreakdown}
                          disabled={calculatingBreakdown || !formData.total_salary}
                          className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-lg hover:shadow transition-all disabled:opacity-50 font-bold"
                        >
                          {calculatingBreakdown ? 'Calculating...' : 'Calculate'}
                        </button>
                      </div>
                    </div>
                  </div>
                </SectionAccordion>

                {/* Section B: Allowances & Sign-on Bonuses */}
                <SectionAccordion
                  title="Sign-on Bonuses, Buyouts & Allowances"
                  isOpen={expandedSections.allowances}
                  onToggle={() => toggleSection('allowances')}
                  icon={FiLock}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-teal-800 mb-1">Signing Bonus (JB Amount)</label>
                      <input type="text" name="jb_amt" placeholder="JB Amount" className="form-input w-full font-semibold" value={formatINR(formData.jb_amt)} onChange={handleCurrencyChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">JB Reason</label>
                      <input type="text" name="jb_reason" placeholder="JB Reason" className="form-input w-full" value={formData.jb_reason} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-teal-800 mb-1">Notice Period Buyout Amount</label>
                      <input type="text" name="np_buyout_amt" placeholder="NP Buyout Amount" className="form-input w-full font-semibold" value={formatINR(formData.np_buyout_amt)} onChange={handleCurrencyChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Days Lapsed</label>
                      <input type="number" name="days_lapsed" placeholder="Days Lapsed" className="form-input w-full" value={formData.days_lapsed} onChange={handleChange} />
                    </div>
                    
                    <div className="col-span-1">
                      <label htmlFor="np_buyout_mail_approval_date" className="block text-sm font-semibold text-gray-700 mb-1">NP Buyout Mail Approval Date</label>
                      <input type="date" id="np_buyout_mail_approval_date" name="np_buyout_mail_approval_date" className="form-input w-full" value={formData.np_buyout_mail_approval_date} onChange={handleChange} />
                    </div>
                  </div>
                </SectionAccordion>

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
                  <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border border-teal-50">
                    <h3 className="text-xl font-bold mb-4 text-teal-700 border-b pb-2">Salary Breakdown</h3>
                    <div className="overflow-x-auto border border-teal-100 rounded-lg shadow-sm">
                      <table className="min-w-full text-sm border-collapse bg-white">
                        <thead>
                          <tr className="bg-teal-50/50">
                            <th className="px-4 py-3 text-center font-bold text-teal-800 border-b border-teal-100" colSpan="3">Component A - Earnings</th>
                          </tr>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-2 text-left font-semibold text-gray-600">Earnings</th>
                            <th className="px-4 py-2 text-right font-semibold text-gray-600">Monthly Amount</th>
                            <th className="px-4 py-2 text-right font-semibold text-gray-600">Annual</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100"><td className="px-4 py-2 text-gray-700">Basic Salary</td><td className="px-4 py-2 text-right text-gray-900 font-medium">{salaryBreakdown?.basicMonthly || '-'}</td><td className="px-4 py-2 text-right text-gray-900 font-medium">{salaryBreakdown?.basicAnnual || '-'}</td></tr>
                          <tr className="border-b border-gray-100"><td className="px-4 py-2 text-gray-700">House Rent Allowance</td><td className="px-4 py-2 text-right text-gray-900 font-medium">{salaryBreakdown?.hraMonthly || '-'}</td><td className="px-4 py-2 text-right text-gray-900 font-medium">{salaryBreakdown?.hraAnnual || '-'}</td></tr>
                          <tr className="border-b border-gray-100"><td className="px-4 py-2 text-gray-700">Conveyance</td><td className="px-4 py-2 text-right text-gray-900 font-medium">{salaryBreakdown?.conveyanceMonthly || '-'}</td><td className="px-4 py-2 text-right text-gray-900 font-medium">{salaryBreakdown?.conveyanceAnnual || '-'}</td></tr>
                          <tr className="border-b border-gray-100"><td className="px-4 py-2 text-gray-700">LTA</td><td className="px-4 py-2 text-right text-gray-900 font-medium">{salaryBreakdown?.ltaMonthly || '-'}</td><td className="px-4 py-2 text-right text-gray-900 font-medium">{salaryBreakdown?.ltaAnnual || '-'}</td></tr>
                          <tr className="border-b border-gray-100"><td className="px-4 py-2 text-gray-700">Food allowance</td><td className="px-4 py-2 text-right text-gray-900 font-medium">{salaryBreakdown?.foodMonthly || '-'}</td><td className="px-4 py-2 text-right text-gray-900 font-medium">{salaryBreakdown?.foodAnnual || '-'}</td></tr>
                          <tr className="font-bold bg-teal-50/30 border-b border-teal-100"><td className="px-4 py-2 text-teal-800">Total Earnings</td><td className="px-4 py-2 text-right text-teal-800">{salaryBreakdown?.totalEarningsMonthly || '-'}</td><td className="px-4 py-2 text-right text-teal-800">{salaryBreakdown?.totalEarningsAnnual || '-'}</td></tr>
                          <tr className="bg-teal-50/50"><th className="px-4 py-3 text-center font-bold text-teal-800 border-b border-teal-100" colSpan="3">Component B - Statutory Benefits</th></tr>
                          <tr className="bg-gray-50 border-b border-gray-200"><th className="px-4 py-2 text-left font-semibold text-gray-600">Statutory Benefits</th><th></th><th></th></tr>
                          <tr className="border-b border-gray-100"><td className="px-4 py-2 text-gray-700">Employer PF</td><td className="px-4 py-2 text-right text-gray-900 font-medium">{salaryBreakdown?.employerPfMonthly || '-'}</td><td className="px-4 py-2 text-right text-gray-900 font-medium">{salaryBreakdown?.employerPfAnnual || '-'}</td></tr>
                          <tr className="border-b border-gray-100"><td className="px-4 py-2 text-gray-700">Gratuity</td><td className="px-4 py-2 text-right text-gray-900 font-medium">{salaryBreakdown?.gratuityMonthly || '-'}</td><td className="px-4 py-2 text-right text-gray-900 font-medium">{salaryBreakdown?.gratuityAnnual || '-'}</td></tr>
                          <tr className="border-b border-gray-100"><td className="px-4 py-2 text-gray-700">Total</td><td className="px-4 py-2 text-right text-gray-900 font-medium">{salaryBreakdown?.statutoryTotalMonthly || '-'}</td><td className="px-4 py-2 text-right text-gray-900 font-medium">{salaryBreakdown?.statutoryTotalAnnual || '-'}</td></tr>
                          <tr className="font-bold bg-teal-50/30 border-b border-teal-100"><td className="px-4 py-2 text-teal-800">Total Annual CTC (A+B)</td><td className="px-4 py-2 text-right text-teal-800">{salaryBreakdown?.ctcMonthly || '-'}</td><td className="px-4 py-2 text-right text-teal-800">{salaryBreakdown?.ctcAnnual || '-'}</td></tr>
                          <tr className="bg-teal-50/50"><th className="px-4 py-3 text-center font-bold text-teal-800 border-b border-teal-100" colSpan="3">Deductions</th></tr>
                          <tr className="border-b border-gray-100"><td className="px-4 py-2 text-gray-700">Provident Fund (Employee & Employer)</td><td className="px-4 py-2 text-right text-gray-900 font-medium">{salaryBreakdown?.deductionPfMonthly || '-'}</td><td className="px-4 py-2 text-right text-gray-900 font-medium">{salaryBreakdown?.deductionPfAnnual || '-'}</td></tr>
                          <tr className="border-b border-gray-100"><td className="px-4 py-2 text-gray-700">Gratuity</td><td className="px-4 py-2 text-right text-gray-900 font-medium">{salaryBreakdown?.deductionGratuityMonthly || '-'}</td><td className="px-4 py-2 text-right text-gray-900 font-medium">{salaryBreakdown?.deductionGratuityAnnual || '-'}</td></tr>
                          <tr className="border-b border-gray-100"><td className="px-4 py-2 text-gray-700">Professional Tax</td><td className="px-4 py-2 text-right text-gray-900 font-medium">{salaryBreakdown?.professionalTaxMonthly || '-'}</td><td className="px-4 py-2 text-right text-gray-900 font-medium">{salaryBreakdown?.professionalTaxAnnual || '-'}</td></tr>
                          <tr className="font-bold bg-red-50/50 border-b border-red-100"><td className="px-4 py-2 text-red-800">Total Deductions</td><td className="px-4 py-2 text-right text-red-800">{salaryBreakdown?.totalDeductionsMonthly || '-'}</td><td className="px-4 py-2 text-right text-red-800">{salaryBreakdown?.totalDeductionsAnnual || '-'}</td></tr>
                          <tr><td className="px-4 py-2 text-gray-500">Income Tax</td><td></td><td className="px-4 py-2 text-right text-gray-500 font-semibold">As applicable</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-8 border-t pt-6 border-gray-100">
                  <button type="button" onClick={() => goToStep(2)} className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl font-semibold shadow hover:shadow-xl transition-all duration-300">
                    Back
                  </button>
                  <div className="flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => setShowPreviewModal(true)} 
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 hover:scale-[1.02]"
                    >
                      <FiEye className="w-5 h-5" />
                      View Preview
                    </button>
                    <button type="submit" className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex items-center gap-2" disabled={loading}>
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Generating...</span>
                        </>
                      ) : (
                        <span>Generate Offer Letter</span>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
      
      <Modal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} title="Send Offer Letter Email?">
        {emailSent ? (
          <div className="text-green-700 font-semibold text-lg py-4 text-center">Email sent successfully!</div>
        ) : (
          <>
            <div className="mb-6 mt-2 text-gray-600">Do you want to send the password-protected offer letter PDF to the candidate now?</div>
            <div className="flex gap-4 justify-end border-t pt-4">
              <button onClick={() => setShowEmailModal(false)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors">No</button>
              <button onClick={handleSendEmail} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold shadow transition-all disabled:opacity-50" disabled={emailSending}>{emailSending ? 'Sending...' : 'Yes, Send Email'}</button>
            </div>
          </>
        )}
      </Modal>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-start justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95%] max-h-[95vh] flex flex-col">
            <div className="flex-shrink-0 bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-white">Offer Letter Preview</h2>
                <p className="text-teal-100 text-sm">Review before generating final document</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-5 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pdf-container bg-gray-50 py-6">
              <OfferLetterPreview data={formData} salaryBreakdown={salaryBreakdown} />
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Animated Generation Progress Overlay */}
      <AnimatePresence>
        {generationProgress?.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <style>{`
              @keyframes glide {
                0%, 100% { transform: translateX(0) translateY(0) rotate(0deg); }
                50% { transform: translateX(10px) translateY(-5px) rotate(10deg); }
              }
              .animate-glide {
                animation: glide 1.8s ease-in-out infinite;
              }
            `}</style>
            
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-lg w-full text-center shadow-3xl border border-white/20 flex flex-col items-center"
            >
              {/* Spinner/Status Icons */}
              <div className="mb-6 relative flex items-center justify-center">
                {['Generating', 'PDF Generated'].includes(generationProgress.status) ? (
                  <div className="relative">
                    <div className="animate-spin rounded-full h-20 w-20 border-4 border-teal-100 border-t-teal-600"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-8 h-8 text-teal-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  </div>
                ) : generationProgress.status === 'Offer Made' ? (
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border border-green-200 shadow-lg animate-bounce">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center border border-red-200 shadow-lg">
                    <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-2xl font-extrabold text-gray-800 mb-2">
                {generationProgress.status === 'Generating' && 'Compiling Document...'}
                {generationProgress.status === 'PDF Generated' && 'Securing & Delivering...'}
                {generationProgress.status === 'Offer Made' && 'Offer Letter Dispatched!'}
                {generationProgress.status === 'Email Failed' && 'Mail Dispatch Failed'}
                {generationProgress.status === 'Generation Failed' && 'Compilation Failed'}
              </h3>
              <p className="text-xs text-gray-500 mb-6 max-w-sm font-medium">
                {generationProgress.message}
              </p>

              {/* Glowing Dynamic Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 mb-8 overflow-hidden relative border border-slate-50">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${
                    generationProgress.status === 'Generation Failed'
                      ? 'from-red-500 to-red-600'
                      : generationProgress.status === 'Email Failed'
                        ? 'from-amber-500 to-red-500'
                        : 'from-teal-500 to-indigo-600'
                  }`}
                  style={{
                    width: `${
                      generationProgress.status === 'Generating' ? 35 :
                      ['PDF Generated', 'Email Failed'].includes(generationProgress.status) ? 75 :
                      generationProgress.status === 'Offer Made' ? 100 : 10
                    }%`
                  }}
                />
              </div>

              {/* Refactored 4-Step Pipeline Indicators */}
              <div className="w-full space-y-4 border-t pt-6 text-left">
                
                {/* Step 1: Drafting & Compiling */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      generationProgress.status !== 'Generating'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-teal-100 text-teal-700 animate-pulse'
                    }`}>
                      {generationProgress.status !== 'Generating' ? '✓' : '1'}
                    </div>
                    <span className={`text-sm font-semibold transition-colors duration-300 ${
                      generationProgress.status !== 'Generating' ? 'text-gray-400 line-through' : 'text-gray-800'
                    }`}>
                      Drafting & Compiling Document
                    </span>
                  </div>
                  {generationProgress.status === 'Generating' && (
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-teal-600 border-t-transparent"></div>
                  )}
                </div>

                {/* Step 2: PDF Conversion & PAN Encryption */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      ['PDF Generated', 'Offer Made', 'Email Failed'].includes(generationProgress.status)
                        ? 'bg-green-100 text-green-700'
                        : generationProgress.status === 'Generating'
                          ? 'bg-teal-50/50 text-teal-600'
                          : 'bg-gray-100 text-gray-400'
                    }`}>
                      {['PDF Generated', 'Offer Made', 'Email Failed'].includes(generationProgress.status) ? '✓' : '2'}
                    </div>
                    <span className={`text-sm font-semibold transition-colors duration-300 ${
                      ['PDF Generated', 'Offer Made', 'Email Failed'].includes(generationProgress.status)
                        ? 'text-gray-400 line-through'
                        : 'text-gray-400'
                    }`}>
                      Converting & Securing PDF (PAN-Encrypted)
                    </span>
                  </div>
                  {generationProgress.status === 'Generating' && (
                    <span className="text-xs text-gray-400 font-medium">Waiting...</span>
                  )}
                </div>

                {/* Step 3: Dispatching Email to Candidate */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      generationProgress.status === 'Offer Made'
                        ? 'bg-green-100 text-green-700'
                        : generationProgress.status === 'Email Failed'
                          ? 'bg-red-100 text-red-700'
                          : generationProgress.status === 'PDF Generated'
                            ? 'bg-teal-100 text-teal-700'
                            : 'bg-gray-100 text-gray-400'
                    }`}>
                      {generationProgress.status === 'Offer Made' ? '✓' : generationProgress.status === 'Email Failed' ? '✗' : '3'}
                    </div>
                    <span className={`text-sm font-semibold transition-colors duration-300 ${
                      generationProgress.status === 'Offer Made'
                        ? 'text-gray-400 line-through'
                        : generationProgress.status === 'Email Failed'
                          ? 'text-red-500 font-bold'
                          : generationProgress.status === 'PDF Generated'
                            ? 'text-teal-700 font-bold'
                            : 'text-gray-400'
                    }`}>
                      {generationProgress.status === 'PDF Generated' ? 'Sending Email to Candidate...' : 'Dispatching Email to Candidate'}
                    </span>
                  </div>
                  {generationProgress.status === 'PDF Generated' && (
                    <div className="text-teal-600 animate-glide">
                      <FiSend className="w-4 h-4" />
                    </div>
                  )}
                  {['Generating'].includes(generationProgress.status) && (
                    <span className="text-xs text-gray-400 font-medium">Waiting...</span>
                  )}
                  {generationProgress.status === 'Email Failed' && (
                    <span className="text-xs text-red-500 font-bold">Failed</span>
                  )}
                </div>

                {/* Step 4: Email Successfully Sent */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      generationProgress.status === 'Offer Made'
                        ? 'bg-green-100 text-green-700 animate-bounce'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {generationProgress.status === 'Offer Made' ? '✓' : '4'}
                    </div>
                    <span className={`text-sm font-semibold transition-colors duration-300 ${
                      generationProgress.status === 'Offer Made' ? 'text-green-700 font-extrabold' : 'text-gray-400'
                    }`}>
                      {generationProgress.status === 'Offer Made' ? 'Email Successfully Sent!' : 'Email Successfully Sent'}
                    </span>
                  </div>
                  {generationProgress.status === 'Offer Made' && (
                    <span className="text-xs text-green-600 font-bold animate-pulse">Completed</span>
                  )}
                  {!['Offer Made'].includes(generationProgress.status) && (
                    <span className="text-xs text-gray-400 font-medium">Waiting...</span>
                  )}
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default OfferLetterForm
