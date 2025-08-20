const fs = require('fs').promises;
const mjml2html = require('mjml'); // v4.15.3
async function renderMjmlTemplate(templatePath, variables) {
  let mjmlContent = await fs.readFile(templatePath, 'utf8');
  for (const [key, value] of Object.entries(variables)) {
    mjmlContent = mjmlContent.replace(new RegExp(`\\{\\{\${key}\\}\\}`, 'g'), value);
  }
  const options = { minify: process.env.NODE_ENV === 'production' }; // Best practice: minify in prod
  const { html, errors } = mjml2html(mjmlContent, options);
  if (errors.length) {
    console.error('MJML compile errors:', errors);
    throw new Error('MJML compilation failed');
  }
  return html;
}
module.exports = renderMjmlTemplate;
