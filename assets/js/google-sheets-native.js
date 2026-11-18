(function(){
  'use strict';

  const ENDPOINT = window.MIMS_GOOGLE_SHEETS_URL || '';

  function getType(form){
    const action = (form.getAttribute('action') || '').toLowerCase();
    if (action.includes('admission-application.php')) return 'application';
    if (action.includes('contact.php')) return 'message';
    return '';
  }

  function getFrame(){
    let frame = document.getElementById('mims-google-sheets-frame');
    if (!frame) {
      frame = document.createElement('iframe');
      frame.id = 'mims-google-sheets-frame';
      frame.name = 'mims-google-sheets-frame';
      frame.style.display = 'none';
      frame.setAttribute('aria-hidden','true');
      document.body.appendChild(frame);
    }
    return frame;
  }

  function hidden(form, name, value){
    let input = form.querySelector('input[data-mims-gs="' + name + '"]');
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.dataset.mimsGs = name;
      form.appendChild(input);
    }
    input.name = name;
    input.value = value;
  }

  function show(form, selector, on){
    const el = form.querySelector(selector);
    if (el) el.classList.toggle('d-block', !!on);
    return el;
  }

  function handle(form){
    if (!ENDPOINT) {
      const err = show(form,'.error-message',true);
      if (err) err.textContent = 'Google Sheets is not configured.';
      return;
    }

    const type = getType(form);
    if (!type) return;

    // Save a local copy too, so the Admin panel can still show submissions on this device.
    try {
      const data = Object.fromEntries(new FormData(form).entries());
      data.createdAt = new Date().toISOString();
      const key = type === 'application' ? 'mims_admission_applications' : 'mims_contact_messages';
      const old = JSON.parse(localStorage.getItem(key) || '[]');
      old.unshift(data);
      localStorage.setItem(key, JSON.stringify(old));
    } catch (_) {}

    const loading = show(form,'.loading',true);
    show(form,'.sent-message',false);
    const error = show(form,'.error-message',false);
    if (error) error.textContent = '';

    const submit = form.querySelector('button[type="submit"]');
    if (submit) submit.disabled = true;

    // Native HTML form POST to a hidden iframe avoids CORS/fetch problems,
    // including when the site is opened locally from file://.
    hidden(form, 'type', type);
    form.method = 'POST';
    form.action = ENDPOINT;
    form.target = 'mims-google-sheets-frame';

    getFrame();

    // form.submit() bypasses the template's old PHP validator and sends directly to Apps Script.
    HTMLFormElement.prototype.submit.call(form);

    // Apps Script responses are cross-origin, so we intentionally don't read them.
    // The request itself is sent by the browser to the Web App.
    setTimeout(function(){
      if (loading) loading.classList.remove('d-block');
      const sent = show(form,'.sent-message',true);
      if (sent) sent.textContent = type === 'application'
        ? 'Your admission application has been submitted successfully.'
        : 'Your message has been submitted successfully.';
      form.reset();
      if (submit) submit.disabled = false;
      // Keep the Google Sheets action in place for the next submission.
      form.action = ENDPOINT;
      form.method = 'POST';
      form.target = 'mims-google-sheets-frame';
    }, 1200);
  }

  document.addEventListener('submit', function(e){
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    const type = getType(form);
    if (!type) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    handle(form);
  }, true);
})();
