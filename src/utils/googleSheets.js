const { google } = require('googleapis');
const fs = require('fs').promises; 

async function appendToSheet(contact) {
  try {
    let auth;
    if (process.env.GOOGLE_PRIVATE_KEY) { 
      const credentials = {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), 
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_CLIENT_EMAIL)}`,
        universe_domain: 'googleapis.com',
      };
      auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
    } else {  
      auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_PATH,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
    }
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    const values = [
      [
        new Date().toISOString(), 
        contact.first_name,
        contact.last_name,
        contact.email,
        contact.phone || '',
        contact.message,
      ],
    ];
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'Contacts',
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });
    console.log('Appended to Google Sheet:', contact.email);
  } catch (err) {
    console.error('Google Sheets append failed:', err);
  }
}

module.exports = { appendToSheet };