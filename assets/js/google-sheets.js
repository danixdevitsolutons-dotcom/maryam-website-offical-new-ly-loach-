(function(){
  'use strict';
  function endpoint(){
    return String(window.MIMS_GOOGLE_SHEETS_URL || '').trim();
  }
  function send(type, data){
    const url = endpoint();
    if(!url) return Promise.reject(new Error('Google Sheets endpoint is not configured.'));
    const body = new URLSearchParams();
    body.set('type', type);
    Object.keys(data || {}).forEach(function(k){
      body.set(k, String(data[k] == null ? '' : data[k]));
    });
    return fetch(url, {
      method:'POST',
      mode:'no-cors',
      headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},
      body:body.toString()
    }).then(function(){ return {ok:true}; });
  }
  window.MIMS_GS = { send: send, configured: function(){ return !!endpoint(); } };
})();
