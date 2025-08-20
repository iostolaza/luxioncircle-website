// js/contact-form.js

const hostname = window.location.hostname;
const API_ROOT = (
  hostname === 'luxioncircle.com' || hostname === 'www.luxioncircle.com'
) ? 'https://luxion-backend-168d09f7ef44.herokuapp.com' : 'http://localhost:3000';

const MAX_RETRIES = 1;  
const RETRY_DELAY_MS = 500;  

console.log(`contact-form.js loaded; using API_ROOT=${API_ROOT}`);

async function postData(payload, retries = MAX_RETRIES) {
  try {
    const resp = await fetch(`${API_ROOT}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const { ok, status } = resp;
    if (!ok) {
      throw new Error(`HTTP ${status}`);
    }

    return await resp.json();
  } catch (err) {
    console.warn(`postData error: ${err.message}`);
    if (retries > 0) {
      console.log(`Retrying in ${RETRY_DELAY_MS}ms... (${retries} left)`);
      await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
      return postData(payload, retries - 1);
    }
    throw err;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;   
    console.log('Form submit triggered');         

    const payload = {
      first_name: form.first_name.value,
      last_name: form.last_name.value,
      email: form.email.value,
      phone: form.phone.value,
      message: form.message.value,
    };

    try {
      const result = await postData(payload);
      console.log('🔔 server response:', result);

      if (result.message === 'Success') {  // Match your route's success response
        alert('Message sent!');
        form.reset();
      } else {
        alert('Error: ' + (result.errors ? result.errors.map(e => e.msg).join(', ') : 'Unknown error'));
      }
    } catch (err) {
      console.error('Final failure:', err);
      alert('Unable to send message. Please try again later.');
    } finally {
      submitBtn.disabled = false;
    }
  });
});
