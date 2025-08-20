const fs = require('fs').promises;
const mjml2html = require('mjml');

async function renderMjmlTemplate(templatePath, variables) {
  let mjmlContent = await fs.readFile(templatePath, 'utf8');
  for (const [key, value] of Object.entries(variables)) {
    mjmlContent = mjmlContent.replace(new RegExp(`\{\{\${key}\}\}`, 'g'), value);
  }
  const { html, errors } = mjml2html(mjmlContent);
  if (errors.length) {
    console.error('MJML compile errors:', errors);
  }
  return html;
}

module.exports = renderMjmlTemplate;
