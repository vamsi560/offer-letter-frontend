import axios from 'axios';

/**
 * Fetch and parse offer letter template from backend
 * @param {string} templatePath - Path to the DOCX file
 * @returns {Promise<Object>} Parsed template data
 */
export const fetchOfferLetterTemplate = async (templatePath) => {
  try {
    const response = await axios.get('/api/offer-letter/template', {
      params: { path: templatePath }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching offer letter template:', error);
    throw error;
  }
};

/**
 * Generate preview data by merging template with candidate data
 * @param {Object} templateData - Template data from DOCX
 * @param {Object} candidateData - Candidate information
 * @returns {Object} Merged preview data
 */
export const generatePreviewData = (templateData, candidateData) => {
  return {
    dateOfOfferGeneration: candidateData.dateOfOfferGeneration || new Date().toLocaleDateString(),
    candidateFullName: candidateData.candidateFullName || '',
    designation: candidateData.designation || '',
    grade: candidateData.grade || '',
    location: candidateData.location || '',
    technologyCenter: candidateData.technologyCenter || '',
    dateOfJoining: candidateData.dateOfJoining || '',
    monthlyBasic: candidateData.monthlyBasic || '',
    annualBasic: candidateData.annualBasic || '',
    monthlyHRA: candidateData.monthlyHRA || '',
    annualHRA: candidateData.annualHRA || '',
    monthlyConveyance: candidateData.monthlyConveyance || '',
    annualConveyance: candidateData.annualConveyance || '',
    monthlyPF: candidateData.monthlyPF || '',
    annualPF: candidateData.annualPF || '',
    monthlyGratuity: candidateData.monthlyGratuity || '',
    annualGratuity: candidateData.annualGratuity || '',
    monthlySodexo: candidateData.monthlySodexo || '',
    annualSodexo: candidateData.annualSodexo || '',
    monthlyLTC: candidateData.monthlyLTC || '',
    annualLTC: candidateData.annualLTC || '',
    monthlyNPS: candidateData.monthlyNPS || '',
    monthlyGross: candidateData.monthlyGross || '',
    annualGross: candidateData.annualGross || '',
    totalAnnualGross: candidateData.totalAnnualGross || '',
    totalInWords: candidateData.totalInWords || '',
  };
};
