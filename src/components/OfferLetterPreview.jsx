import React from 'react';

const OfferLetterPreview = ({ data = {}, salaryBreakdown = null }) => {
  const formatCurrency = (amount) => {
    if (!amount) return '₹ 0.00';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '[Date]';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const PageHeader = ({ pageNumber }) => (
    <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-300">
      <div className="text-[10px] text-gray-500 font-sans uppercase tracking-wider">ValueMomentum Software Services Private Limited</div>
      <div className="text-[10px] text-gray-500 font-sans">Page {pageNumber}</div>
    </div>
  );

  const PageFooter = ({ pageNumber }) => (
    <div className="absolute bottom-8 left-12 right-12 flex justify-between items-center pt-2 border-t border-gray-300">
      <div className="text-[10px] text-gray-400 font-sans tracking-wide">Confidential Offer Letter Document</div>
      <div className="text-[10px] text-gray-400 font-sans">{pageNumber} of 2</div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-200 p-8 print-content flex flex-col items-center space-y-8" style={{ fontFamily: 'Times New Roman, Georgia, serif' }}>
      
      {/* PAGE 1: Core Offer Agreement */}
      <div className="relative bg-white shadow-2xl border border-gray-300 pdf-page" style={{ 
        width: '210mm', 
        minHeight: '297mm', 
        padding: '20mm 25mm 25mm 25mm',
        boxSizing: 'border-box'
      }}>
        {/* Subtle Watermark Logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
          <img 
            src="/ValueMomentum_logo.png" 
            alt="ValueMomentum" 
            className="opacity-[0.02]"
            style={{ width: '450px', height: 'auto' }}
          />
        </div>

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <PageHeader pageNumber={1} />

            {/* Letterhead Header */}
            <div className="flex justify-between items-start mb-6 border-b-2 border-black pb-4">
              <div className="flex items-center space-x-4">
                <img 
                  src="/ValueMomentum_logo.png" 
                  alt="ValueMomentum" 
                  className="h-14 w-auto"
                />
                <div>
                  <h2 className="text-lg font-bold text-black leading-tight tracking-wide">ValueMomentum Software Services</h2>
                  <h3 className="text-base font-bold text-black">Private Limited</h3>
                  <p className="text-[10px] text-gray-500 font-sans mt-0.5">Hyderabad | Coimbatore | Pune | Bangalore</p>
                </div>
              </div>
              <div className="text-right font-sans text-xs">
                <div className="border border-black p-2 rounded bg-gray-50">
                  <p className="text-[9px] font-bold text-gray-500">DOCUMENT ID</p>
                  <p className="text-xs font-extrabold text-black">OL-{new Date().getFullYear()}-{String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}</p>
                </div>
              </div>
            </div>

            {/* Title Block */}
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-black tracking-widest border-b pb-2 mb-1">OFFER LETTER</h1>
              <p className="text-sm text-gray-600 font-sans font-semibold">Date of Offer: {formatDate(data.date_of_offer || new Date())}</p>
            </div>

            {/* Salutation */}
            <div className="mb-4 text-sm font-bold text-black">
              Dear {data.candidate_name || '[Candidate Name]'},
            </div>

            {/* Core Paragraphs - Matching DOCX Template exactly */}
            <div className="text-sm text-black space-y-4 text-justify leading-relaxed" style={{ fontSize: '10.5pt' }}>
              <p>
                With reference to the interviews and subsequent discussions you had with us, we are pleased to extend an offer with <strong>ValueMomentum Software Services Private Limited</strong> (hereafter referred to as ValueMomentum or VM) as <span className="font-bold underline">{data.designation || '[Designation]'}</span> & <span className="font-bold underline">{data.grade || '[Grade]'}</span> in <span className="font-bold underline">{data.work_location || data.facility || '[Location]'}</span>.
              </p>
              
              <p>
                ValueMomentum is a leading solutions provider for the global Property & Casualty insurance industry. We help insurers stay ahead with sustained growth and high performance, enhancing stakeholder value and fostering resilient societies. Having served over 100 insurers, ValueMomentum is one of the largest services providers exclusively focused on P&C insurance.
              </p>
              
              <p>
                We are excited to have you join our <strong>{data.tsc || '[Technology Solution Center]'}</strong> Technology Solution Center Team.
              </p>
              
              <p>
                Technology Solution Centers at ValueMomentum thrive on tackling complex business challenges with innovative solutions while transforming the P&C insurance value chain. We achieve this through a strong engineering foundation and continuously refining our processes, methodologies, tools, agile delivery teams, and core engineering archetypes.
              </p>
              
              <p>
                Our Platform, App & Infra Technology Solutions Center, you’ll be part of a team that is redefining how enterprise applications are designed, delivered, and deployed on modern cloud infrastructure. We are re-shaping the future of enterprise solutions by harnessing the power of Cloud, AI, and GenAI to build smarter, faster, and more resilient systems. Our focus spans Enterprise Architecture, Application Modernization, API Lifecycle Management, Microservices, Intelligent Automation, and User Experience Engineering. By joining our team, you’ll gain hands-on experience with the latest emerging technologies, working on transformative solutions that drive real business impact and preparing enterprises for the future. We have been transformed into an AI-focused organization by embedding AI across the SDLC, reimagining the way we engineer, test, and deliver modern applications.
              </p>
              
              <p className="font-bold">
                We look forward to you becoming an integral member of this team of passionate engineers.
              </p>

              {/* Required Documents List */}
              <div className="border border-black p-4 mt-6 bg-gray-50 rounded">
                <h4 className="font-bold text-xs text-black mb-2 uppercase tracking-wide border-b pb-1 font-sans">At the time of joining, you are required to submit the following:</h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                  <p>1. All Educational Certificates (Mandatory)</p>
                  <p>6. Form 26 AS (Mandatory)</p>
                  <p>2. Relieving/Service Letters from all employers (Mandatory)</p>
                  <p>7. 3 Passport size photographs (Mandatory)</p>
                  <p>3. Resignation acceptance letter from previous employer</p>
                  <p>8. Aadhar Card Copy (Mandatory)</p>
                  <p>4. Last 3 Months Salary Pay Slips (Mandatory)</p>
                  <p>8. Passport Copy (Optional)</p>
                  <p>5. Form 12B or previous Employer Tax Computation</p>
                  <p>9. Pan Card Copy (Mandatory)</p>
                </div>
              </div>
              
              <p className="text-[10px] text-gray-500 font-sans mt-2 italic">
                Please carry all the certificates supporting your educational qualifications along with mark sheets in the original for verification. Kindly note that all the above-mentioned documents shared by you will be subject to verification.
              </p>
            </div>
          </div>
          <PageFooter pageNumber={1} />
        </div>
      </div>

      {/* PAGE 2: Terms, Conditions & Compensation Table */}
      <div className="relative bg-white shadow-2xl border border-gray-300 pdf-page" style={{ 
        width: '210mm', 
        minHeight: '297mm', 
        padding: '20mm 25mm 25mm 25mm',
        boxSizing: 'border-box'
      }}>
        {/* Subtle Watermark Logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
          <img 
            src="/ValueMomentum_logo.png" 
            alt="ValueMomentum" 
            className="opacity-[0.02]"
            style={{ width: '450px', height: 'auto' }}
          />
        </div>

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="text-sm text-black space-y-4 leading-relaxed" style={{ fontSize: '9.5pt' }}>
            <PageHeader pageNumber={2} />

            {/* Legal Terms Blocks matching DOCX paragraphs exactly */}
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-xs uppercase border-b border-black pb-1 mb-1 font-sans">Background Verifications / Checks</h4>
                <p className="text-justify text-xs">
                  As part of our hiring process, we conduct comprehensive background checks, which may include a criminal record check, previous employment verification, educational verification, identity validation, drug testing, and other relevant checks based on the specific requirements of the role. To complete these checks, we may need to collect and verify your personal information. You are expected to provide accurate and timely information to enable us to carry out these checks efficiently. In case of any missing or insufficient details, please ensure that you provide the necessary information promptly to avoid delays.
                </p>
                <p className="text-justify text-xs mt-1 font-semibold text-gray-700">
                  If any discrepancies or issues arise during the background verification process, this may affect the outcome of your employment offer or result in termination, at the discretion of the management. Please note that these checks are a crucial part of ensuring a safe and reliable work environment for all employees.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase border-b border-black pb-1 mb-1 font-sans">Assignments/Transfer/Deputation</h4>
                <p className="text-justify text-xs">
                  Though you have been engaged for a specific position, shift or location, the company reserves the right to send you on training/deputation/transfer/other assignments to our other offices, sister companies, associate companies, client’s location or third parties whether in India or abroad or ask you to report to work from office basis client needs and business circumstances. In the event of such assignments, the terms and conditions applicable to the new service will govern your employment.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase border-b border-black pb-1 mb-1 font-sans">Termination of employment</h4>
                <p className="text-justify text-xs">
                  Either party may terminate this employment by providing a notice of <strong>90 days</strong> to the other. In cases of serious misconduct or unethical conduct, the company reserves the right to end the employment immediately, without the usual notice period.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase border-b border-black pb-1 mb-1 font-sans">Terms & Conditions of Employment</h4>
                <p className="text-justify text-xs">
                  On your joining, you are expected to understand & sign a) Appointment Letter which covers the details of your position and conditions of your appointment, b) Employment Agreement which covers the Company’s terms and conditions of employment and Company policies, c) Employment & Surety Agreements, based on applicability. The detailed terms and conditions of your employment will be outlined in your formal appointment letter.
                </p>
              </div>
            </div>

            {/* Compensation Table */}
            <div className="mt-4">
              <div className="bg-black text-white p-2 text-center rounded-t border border-black">
                <h4 className="font-bold text-sm tracking-widest font-sans">STACK UP DETAILS OF COMPENSATION</h4>
                <p className="text-xs font-sans mt-0.5">Candidate: <strong>{data.candidate_name || '[Candidate Name]'}</strong></p>
              </div>
              
              <table className="w-full border-collapse border-2 border-black text-xs bg-white" style={{ fontSize: '9pt' }}>
                <thead>
                  <tr className="bg-teal-50">
                    <th className="border border-black p-1.5 text-center font-bold text-teal-900" colSpan="3">Component A - Earnings</th>
                  </tr>
                  <tr className="bg-gray-100 font-sans">
                    <th className="border border-black p-1 text-left font-semibold text-gray-700">Earnings</th>
                    <th className="border border-black p-1 text-right font-semibold text-gray-700 w-1/4">Monthly Amount</th>
                    <th className="border border-black p-1 text-right font-semibold text-gray-700 w-1/4">Annual</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-black p-1">Basic Salary</td><td className="border border-black p-1 text-right">{salaryBreakdown?.basicMonthly || '-'}</td><td className="border border-black p-1 text-right">{salaryBreakdown?.basicAnnual || '-'}</td></tr>
                  <tr><td className="border border-black p-1">House Rent Allowance</td><td className="border border-black p-1 text-right">{salaryBreakdown?.hraMonthly || '-'}</td><td className="border border-black p-1 text-right">{salaryBreakdown?.hraAnnual || '-'}</td></tr>
                  <tr><td className="border border-black p-1">Conveyance</td><td className="border border-black p-1 text-right">{salaryBreakdown?.conveyanceMonthly || '-'}</td><td className="border border-black p-1 text-right">{salaryBreakdown?.conveyanceAnnual || '-'}</td></tr>
                  <tr><td className="border border-black p-1">LTA</td><td className="border border-black p-1 text-right">{salaryBreakdown?.ltaMonthly || '-'}</td><td className="border border-black p-1 text-right">{salaryBreakdown?.ltaAnnual || '-'}</td></tr>
                  <tr><td className="border border-black p-1">Food allowance</td><td className="border border-black p-1 text-right">{salaryBreakdown?.foodMonthly || '-'}</td><td className="border border-black p-1 text-right">{salaryBreakdown?.foodAnnual || '-'}</td></tr>
                  <tr className="font-bold bg-teal-50/20"><td className="border border-black p-1 text-teal-900">Total Earnings</td><td className="border border-black p-1 text-right text-teal-900">{salaryBreakdown?.totalEarningsMonthly || '-'}</td><td className="border border-black p-1 text-right text-teal-900">{salaryBreakdown?.totalEarningsAnnual || '-'}</td></tr>
                  
                  <tr className="bg-teal-50"><th className="border border-black p-1.5 text-center font-bold text-teal-900" colSpan="3">Component B - Statutory Benefits</th></tr>
                  <tr className="bg-gray-100 font-sans"><th className="border border-black p-1 text-left font-semibold text-gray-700">Statutory Benefits</th><th></th><th></th></tr>
                  <tr><td className="border border-black p-1">Employer PF</td><td className="border border-black p-1 text-right">{salaryBreakdown?.employerPfMonthly || '-'}</td><td className="border border-black p-1 text-right">{salaryBreakdown?.employerPfAnnual || '-'}</td></tr>
                  <tr><td className="border border-black p-1">Gratuity</td><td className="border border-black p-1 text-right">{salaryBreakdown?.gratuityMonthly || '-'}</td><td className="border border-black p-1 text-right">{salaryBreakdown?.gratuityAnnual || '-'}</td></tr>
                  <tr className="font-bold"><td className="border border-black p-1">Total Statutory</td><td className="border border-black p-1 text-right">{salaryBreakdown?.statutoryTotalMonthly || '-'}</td><td className="border border-black p-1 text-right">{salaryBreakdown?.statutoryTotalAnnual || '-'}</td></tr>
                  
                  <tr className="font-extrabold bg-teal-50 text-teal-900"><td className="border border-black p-1.5">Total Annual CTC (A+B)</td><td className="border border-black p-1.5 text-right"></td><td className="border border-black p-1.5 text-right">{salaryBreakdown?.ctcAnnual || '-'}</td></tr>
                  
                  <tr className="bg-teal-50"><th className="border border-black p-1.5 text-center font-bold text-teal-900" colSpan="3">Deductions</th></tr>
                  <tr><td className="border border-black p-1">Provident Fund (Employee & Employer)</td><td className="border border-black p-1 text-right">3,600.00 (1800+1800)</td><td className="border border-black p-1 text-right">{salaryBreakdown?.deductionPfAnnual || '-'}</td></tr>
                  <tr><td className="border border-black p-1">Gratuity</td><td className="border border-black p-1 text-right">{salaryBreakdown?.gratuityMonthly || '-'}</td><td className="border border-black p-1 text-right">{salaryBreakdown?.gratuityAnnual || '-'}</td></tr>
                  <tr><td className="border border-black p-1">Professional Tax</td><td className="border border-black p-1 text-right">{salaryBreakdown?.professionalTaxMonthly || '-'}</td><td className="border border-black p-1 text-right">{salaryBreakdown?.professionalTaxAnnual || '-'}</td></tr>
                  <tr className="font-bold bg-red-50 text-red-950"><td className="border border-black p-1">Total Deductions</td><td className="border border-black p-1 text-right">{salaryBreakdown?.totalDeductionsMonthly || '-'}</td><td className="border border-black p-1 text-right">{salaryBreakdown?.totalDeductionsAnnual || '-'}</td></tr>
                  <tr><td className="border border-black p-1 text-gray-500">Income Tax</td><td className="border border-black p-1 text-right text-gray-500">As applicable</td><td className="border border-black p-1"></td></tr>
                </tbody>
              </table>

              <div className="border border-black p-3 mt-3 bg-gray-50 rounded font-sans text-xs">
                <p className="font-bold text-gray-500 text-[10px] uppercase">Total Annual Gross Salary</p>
                <p className="text-lg font-extrabold text-teal-800 leading-none mt-1">{formatCurrency(data.total_salary)}</p>
                <p className="text-[10px] text-gray-600 mt-1 italic">({salaryBreakdown?.Total_In_Words || '[Amount in Words]'})</p>
              </div>
            </div>

            {/* Note & Policy Info */}
            <div className="text-[10px] text-gray-600 space-y-1 font-sans">
              <p><strong>Note:</strong> Deductions will be made towards Provident Fund, Professional Tax, Group Term Life Insurance, Group Personal Accidental Insurance, and Income Tax as applicable.</p>
              <p>You will be entitled to Benefits like Group Mediclaim Personal Insurance as per the company policy.</p>
              <p>You are requested to contact the Human Resources Department for further clarification if any. This Offer Letter is valid for you to join on or before <strong>{formatDate(data.joining_date)}</strong>.</p>
            </div>

            {/* Signatures Panel */}
            <div className="flex justify-between items-end mt-8 border-t-2 border-black pt-4 font-sans text-xs font-bold text-black">
              <div>
                <p>For ValueMomentum Software Services Private Limited</p>
                <br />
                <br />
                <div className="border-b border-black w-48 mb-1"></div>
                <p className="text-[10px] text-gray-500 font-sans uppercase">Authorized Signatory</p>
              </div>
              <div className="text-right">
                <p>I accept the terms of this letter</p>
                <br />
                <br />
                <div className="border-b border-black w-48 mb-1 ml-auto"></div>
                <p className="text-[10px] text-gray-500 font-sans uppercase">Candidate’s Signature</p>
              </div>
            </div>
          </div>
          <PageFooter pageNumber={2} />
        </div>
      </div>
    </div>
  );
};

export default OfferLetterPreview;