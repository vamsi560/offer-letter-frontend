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
    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-400">
      <div className="text-xs text-gray-600">ValueMomentum Software Services Private Limited</div>
      <div className="text-xs text-gray-600">Page {pageNumber}</div>
    </div>
  );

  const PageFooter = ({ pageNumber }) => (
    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center pt-2 border-t border-gray-400">
      <div className="text-xs text-gray-500">Confidential Document</div>
      <div className="text-xs text-gray-500">{pageNumber} of 2</div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-100 p-4" style={{ fontFamily: 'Times New Roman, serif' }}>
      {/* Page 1 - Main Offer Letter */}
      <div className="relative bg-white shadow-lg border border-gray-300 mb-6" style={{ 
        width: '210mm', 
        minHeight: '297mm', 
        pageBreakAfter: 'always',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1), 0 6px 20px rgba(0,0,0,0.1)'
      }}>
        {/* Watermark Logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
          <img 
            src="/ValueMomentum_logo.png" 
            alt="ValueMomentum" 
            className="opacity-5"
            style={{ width: '400px', height: 'auto' }}
          />
        </div>

        {/* Content Container */}
        <div className="relative z-10 h-full" style={{ padding: '20mm' }}>
          {/* Page Header */}
          <PageHeader pageNumber={1} />

          {/* Company Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between border-b-2 border-black pb-4">
              <div className="flex items-center">
                <img 
                  src="/ValueMomentum_logo.png" 
                  alt="ValueMomentum" 
                  className="h-16 w-auto mr-6"
                />
                <div>
                  <h2 className="text-xl font-bold text-black leading-tight">ValueMomentum Software Services</h2>
                  <h3 className="text-lg font-bold text-black">Private Limited</h3>
                  <p className="text-sm text-gray-700 font-medium mt-1">Leading P&C Insurance Solutions Provider</p>
                  <p className="text-xs text-gray-600 mt-1">Hyderabad | Coimbatore | Pune | Bangalore</p>
                </div>
              </div>
              <div className="text-right">
                <div className="border-2 border-black px-4 py-2">
                  <p className="text-xs font-medium">Document ID</p>
                  <p className="text-sm font-bold">OL-{new Date().getFullYear()}-{String(Math.floor(Math.random() * 1000)).padStart(3, '0')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center mb-6 border-b-2 border-black pb-4">
            <h1 className="text-2xl font-bold mb-2 text-black tracking-wide">OFFER LETTER</h1>
            <p className="text-sm text-gray-700 font-medium">Date: {formatDate(data.date_of_offer)}</p>
          </div>

          {/* Main Content */}
          <div className="space-y-4 text-justify leading-relaxed text-black" style={{ fontSize: '11pt', lineHeight: '1.5' }}>
            <div className="mb-4">
              <p className="font-medium">
                Dear <span className="font-bold underline">{data.candidate_name || '[Candidate Name]'}</span>,
              </p>
            </div>

            <p className="mb-3">
              With reference to the interviews and subsequent discussions you had with us, we are pleased to extend an offer with <strong>ValueMomentum Software Services Private Limited</strong> (hereafter referred to as <strong>ValueMomentum</strong> or <strong>VM</strong>) as <span className="font-bold underline">{data.designation || '[Designation]'}</span> & <span className="font-bold underline">{data.grade || '[Grade]'}</span> in <span className="font-bold underline">{data.work_location || data.facility || '[Location]'}</span>.
            </p>

            <div className="border-l-4 border-black p-3 my-4 bg-gray-50">
              <p className="text-sm font-medium text-black">
                <strong>About ValueMomentum:</strong> We are a leading solutions provider for the global Property & Casualty insurance industry. We help insurers stay ahead with sustained growth and high performance, enhancing stakeholder value and fostering resilient societies. Having served over 100 insurers, ValueMomentum is one of the largest services providers exclusively focused on P&C insurance.
              </p>
            </div>

            <p className="mb-3">
              We are excited to have you join our <strong>{data.tsc || '[Technology Solution Center]'}</strong> Solution Center Team.
            </p>

            <p className="mb-3">
              Technology Solution Centers at ValueMomentum thrive on tackling complex business challenges with innovative solutions while transforming the P&C insurance value chain. We achieve this through a strong engineering foundation and continuously refining our processes, methodologies, tools, agile delivery teams, and core engineering archetypes.
            </p>

            <p className="mb-3">
              Our Platform, App & Infra Technology Solutions Center, you'll be part of a team that is redefining how enterprise applications are designed, delivered, and deployed on modern cloud infrastructure. We are re-shaping the future of enterprise solutions by harnessing the power of <strong>Cloud, AI, and GenAI</strong> to build smarter, faster, and more resilient systems.
            </p>

            <div className="border border-black p-3 my-4 bg-gray-50">
              <h3 className="font-bold mb-2 text-black">Key Focus Areas:</h3>
              <ul className="text-sm space-y-1 text-black">
                <li>• Enterprise Architecture</li>
                <li>• Application Modernization</li>
                <li>• API Lifecycle Management</li>
                <li>• Microservices & Intelligent Automation</li>
                <li>• User Experience Engineering</li>
              </ul>
            </div>

            <p className="mb-3">
              We have been transformed into an AI-focused organization by embedding AI across the SDLC, reimagining the way we engineer, test, and deliver modern applications.
            </p>

            <p className="font-bold text-black mb-4">
              We look forward to you becoming an integral member of this team of passionate engineers.
            </p>

            {/* Documents Required Section */}
            <div className="border border-black p-3 mb-4 bg-gray-50">
              <h3 className="font-bold mb-2 text-black">Documents Required at Joining:</h3>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <div>
                  <p>1. Educational Certificates (Mandatory)</p>
                  <p>2. Relieving Letters (Mandatory)</p>
                  <p>3. Resignation Acceptance Letter</p>
                  <p>4. Last 3 Months Salary Slips (Mandatory)</p>
                  <p>5. Form 12B/Tax Computation</p>
                </div>
                <div>
                  <p>6. Form 26 AS (Mandatory)</p>
                  <p>7. Passport Photos (Mandatory)</p>
                  <p>8. Aadhar Card Copy (Mandatory)</p>
                  <p>9. Passport Copy (Optional)</p>
                  <p>10. PAN Card Copy (Mandatory)</p>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-700 p-2 border border-gray-400 bg-gray-100">
              <p><strong>Note:</strong> Please carry all certificates in original for verification. All documents will be subject to verification.</p>
            </div>
          </div>

          {/* Page Footer */}
          <PageFooter pageNumber={1} />
        </div>
      </div>

      {/* Page 2 - Terms & Compensation */}
      <div className="relative bg-white shadow-lg border border-gray-300" style={{ 
        width: '210mm', 
        minHeight: '297mm', 
        boxShadow: '0 4px 8px rgba(0,0,0,0.1), 0 6px 20px rgba(0,0,0,0.1)'
      }}>
        {/* Watermark Logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
          <img 
            src="/ValueMomentum_logo.png" 
            alt="ValueMomentum" 
            className="opacity-5"
            style={{ width: '400px', height: 'auto' }}
          />
        </div>

        {/* Content Container */}
        <div className="relative z-10 h-full" style={{ padding: '20mm' }}>
          {/* Page Header */}
          <PageHeader pageNumber={2} />

          <div className="space-y-5" style={{ fontSize: '11pt', lineHeight: '1.5' }}>
            {/* Terms & Conditions */}
            <div className="space-y-4">
              <div className="border-b-2 border-black pb-2">
                <h3 className="font-bold text-black text-sm">BACKGROUND VERIFICATIONS</h3>
              </div>
              <p className="text-sm text-black">
                As part of our hiring process, we conduct comprehensive background checks including criminal record check, employment verification, educational verification, identity validation, and drug testing. Any discrepancies may affect your employment offer.
              </p>

              <div className="border-b-2 border-black pb-2">
                <h3 className="font-bold text-black text-sm">ASSIGNMENTS & TRANSFERS</h3>
              </div>
              <p className="text-sm text-black">
                The company reserves the right to send you on training/deputation/transfer to other offices, clients, or locations in India or abroad based on business requirements.
              </p>

              <div className="border-b-2 border-black pb-2">
                <h3 className="font-bold text-black text-sm">TERMINATION</h3>
              </div>
              <p className="text-sm text-black">
                Either party may terminate employment with <strong>90 days notice</strong>. In cases of misconduct, immediate termination may apply.
              </p>
            </div>

            {/* Compensation Table */}
            <div className="mt-6">
              <div className="bg-black text-white p-3 text-center">
                <h3 className="font-bold text-lg">COMPENSATION BREAKDOWN</h3>
                <p className="text-sm">Candidate: <strong>{data.candidate_name || '[Candidate Name]'}</strong></p>
              </div>
              
              <table className="w-full border-collapse border-2 border-black text-sm bg-white">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-black p-3 text-left font-bold">Components</th>
                    <th className="border border-black p-3 text-right font-bold">Monthly (₹)</th>
                    <th className="border border-black p-3 text-right font-bold">Annual (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {salaryBreakdown?.Compensation_Table_Rows ? (
                    salaryBreakdown.Compensation_Table_Rows.map((row, idx) => (
                      <tr key={idx} className={`${row.component?.includes('Total') ? 'font-bold bg-gray-100' : ''} ${row.component?.includes('Flexible') ? 'font-bold bg-gray-50' : ''}`}>
                        <td className={`border border-black p-2 ${row.component?.includes('Meal') || row.component?.includes('LTC') || row.component?.includes('NPS') ? 'pl-6 text-gray-700' : ''}`}>
                          {row.component}
                        </td>
                        <td className="border border-black p-2 text-right font-mono">{row.monthly || '-'}</td>
                        <td className="border border-black p-2 text-right font-mono">{row.annual || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr><td className="border border-black p-2">Basic Salary</td><td className="border border-black p-2 text-right">-</td><td className="border border-black p-2 text-right">-</td></tr>
                      <tr><td className="border border-black p-2">House Rent Allowance</td><td className="border border-black p-2 text-right">-</td><td className="border border-black p-2 text-right">-</td></tr>
                      <tr><td className="border border-black p-2">Conveyance</td><td className="border border-black p-2 text-right">-</td><td className="border border-black p-2 text-right">-</td></tr>
                      <tr><td className="border border-black p-2">Provident Fund</td><td className="border border-black p-2 text-right">-</td><td className="border border-black p-2 text-right">-</td></tr>
                      <tr><td className="border border-black p-2">Gratuity</td><td className="border border-black p-2 text-right">-</td><td className="border border-black p-2 text-right">-</td></tr>
                      <tr className="font-bold bg-gray-50"><td className="border border-black p-2">Flexible Benefits:</td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
                      <tr><td className="border border-black p-2 pl-6">Meal Card</td><td className="border border-black p-2 text-right">-</td><td className="border border-black p-2 text-right">-</td></tr>
                      <tr><td className="border border-black p-2 pl-6">LTC</td><td className="border border-black p-2 text-right">-</td><td className="border border-black p-2 text-right">-</td></tr>
                      <tr><td className="border border-black p-2 pl-6">NPS</td><td className="border border-black p-2 text-right">-</td><td className="border border-black p-2 text-right">-</td></tr>
                      <tr className="font-bold bg-gray-100"><td className="border border-black p-2">Total</td><td className="border border-black p-2 text-right">-</td><td className="border border-black p-2 text-right">-</td></tr>
                    </>
                  )}
                </tbody>
              </table>

              <div className="border-2 border-black p-4 mt-4 bg-gray-100">
                <p className="font-bold text-lg text-black">
                  Total Annual Gross Salary: <span className="text-2xl">{formatCurrency(data.total_salary)}</span>
                </p>
                <p className="text-sm text-black mt-1">
                  ({salaryBreakdown?.Total_In_Words || '[Amount in Words]'})
                </p>
              </div>
            </div>

            {/* Deductions */}
            <div className="border border-black p-3 bg-gray-100">
              <h4 className="font-bold mb-2 text-black">Standard Deductions:</h4>
              <div className="text-sm text-black grid grid-cols-2 gap-2">
                <p>• Provident Fund: ₹3,600 (Employee + Employer)</p>
                <p>• Professional Tax: ₹200</p>
                <p>• Income Tax: As applicable</p>
                <p>• Group Insurance: As per policy</p>
              </div>
            </div>

            {/* Important Notes */}
            <div className="border border-black p-3 bg-gray-50">
              <p className="text-xs text-black">
                <strong>Important:</strong> This offer is valid until <strong>{formatDate(data.joining_date)}</strong>. 
                You will be entitled to Group Mediclaim and other benefits as per company policy.
              </p>
            </div>

            {/* Signatures */}
            <div className="flex justify-between mt-6 pt-4 border-t-2 border-black">
              <div className="text-center">
                <div className="border-b-2 border-black w-48 mb-2"></div>
                <p className="text-sm font-medium">For ValueMomentum Software Services Pvt Ltd</p>
                <p className="text-xs text-gray-600">Authorized Signatory</p>
              </div>
              <div className="text-center">
                <div className="border-b-2 border-black w-48 mb-2"></div>
                <p className="text-sm font-medium">Candidate Acceptance</p>
                <p className="text-xs text-gray-600">Date: ___________</p>
              </div>
            </div>

            <div className="text-center mt-4 p-3 border border-black bg-gray-100">
              <p className="text-sm font-medium text-black">
                Welcome to ValueMomentum! We look forward to a successful journey together.
              </p>
            </div>
          </div>

          {/* Page Footer */}
          <PageFooter pageNumber={2} />
        </div>
      </div>
    </div>
  );
};

export default OfferLetterPreview;