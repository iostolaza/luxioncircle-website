const hostname = window.location.hostname;
const API_ROOT = (hostname === 'luxioncircle.com' || hostname === 'www.luxioncircle.com')
  ? 'https://luxion-backend-168d09f7ef44.herokuapp.com' : 'http://localhost:3000';
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
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
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
  const errorDiv = document.createElement('div'); // For better error display
  errorDiv.className = 'error';
  form.appendChild(errorDiv);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.textContent = ''; // Clear errors
    submitBtn.disabled = true;
    // Client-side validation
    if (!form.first_name.value.trim() || !form.last_name.value.trim() || !form.email.value.trim() || !form.message.value.trim()) {
      errorDiv.textContent = 'Please fill all required fields.';
      submitBtn.disabled = false;
      return;
    }
    const payload = {
      first_name: form.first_name.value.trim(),
      last_name: form.last_name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      message: form.message.value.trim(),
    };
    try {
      const result = await postData(payload);
      console.log('Server response:', result);
      if (result.message === 'Success') {
        alert('Message sent!');
        form.reset();
      } else {
        errorDiv.textContent = 'Error: ' + (result.errors ? result.errors.map(e => e.msg).join(', ') : 'Unknown error');
      }
    } catch (err) {
      console.error('Final failure:', err);
      errorDiv.textContent = 'Unable to send message. Please try again later.';
    } finally {
      submitBtn.disabled = false;
    }
  });
});
