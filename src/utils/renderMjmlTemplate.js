const fs = require('fs').promises;
const mjml2html = require('mjml'); // v4.15.3

async function renderMjmlTemplate(templatePath, variables) {
  let mjmlContent = await fs.readFile(templatePath, 'utf8');
  
  // Store original for debugging
  const originalContent = mjmlContent;
  
  for (const [key, value] of Object.entries(variables)) {
    // Escape key for regex safety (best practice)
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('\\{\\{' + escapedKey + '\\}\\}', 'g');
    mjmlContent = mjmlContent.replace(regex, value);
  }
  
  // Debug: Check if replacement occurred
  if (mjmlContent === originalContent) {
    console.warn('MJML template variables not replaced; check placeholders.');
  }
  
  const options = { minify: process.env.NODE_ENV === 'production' };
  const { html, errors } = mjml2html(mjmlContent, options);
  if (errors.length) {
    console.error('MJML compile errors:', errors);
    throw new Error('MJML compilation failed');
  }
  return html;
}

module.exports = renderMjmlTemplate;