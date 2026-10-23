// Local demo provider. IBM model calls belong behind this interface on the local server;
// credentials must never be embedded in this browser page.
(()=>{
  const $=s=>document.querySelector(s);
  let issue=null,result=null,saved=false;
  const formOld=$('#issue-form'),form=formOld.cloneNode(true);formOld.replaceWith(form);
  for(const selector of ['#category-edit','#summary-edit','#copy-draft','#restart']){const old=$(selector),copy=old.cloneNode(true);old.replaceWith(copy)}
  const desc=$('#description'),kind=$('#location-kind'),locationInput=$('#location-value'),landmarkInput=$('#landmark');
  const directory={
    'Street or sidewalk':{name:'Street or road maintenance',url:'https://www.nyc.gov/site/dot/about/faq-potholes.page',source:'NYC Department of Transportation · Pothole FAQ',fit:/pothole|road|street|pavement|sidewalk|curb|crack|crosswalk/i},
    'Waste':{name:'Street condition or cleanliness',url:'https://www.nyc.gov/site/dsny/what-we-do/cleaning/street-condition-complaints.page',source:'NYC Department of Sanitation · Street condition complaints',fit:/trash|garbage|litter|dump|debris|bin|waste|overflow/i},
    'Park or public space':{name:'Street condition or cleanliness',url:'https://www.nyc.gov/site/dsny/what-we-do/cleaning/street-condition-complaints.page',source:'NYC Department of Sanitation · Street condition complaints',fit:/trash|garbage|litter|dump|debris|bin|waste|overflow/i}
  };
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function categoryFor(text,selected){if(selected&&selected!=='Not sure'&&selected!=='Other')return selected;const t=text.toLowerCase();if(/light|lamp|dark|streetlight|street light|bulb/.test(t))return'Lighting';if(/trash|garbage|litter|dump|debris|bin|waste|overflow/.test(t))return'Waste';if(/noise|loud|music|construction sound/.test(t))return'Noise';if(/park|playground|bench|public space|tree/.test(t))return'Park or public space';if(/bus|train|transit|stop|station/.test(t))return'Transit';if(/pothole|road|street|pavement|sidewalk|curb|crack|crosswalk/.test(t))return'Street or sidewalk';return selected==='Other'?'Other':'Not sure'}
  function needsLandmark(text){return /broken light|street ?light|lamp|pothole|sidewalk|crosswalk|damaged sign|fallen tree|blocked drain/i.test(text)}
  function locationLabel(type){return type==='address'?'Street address':type==='postal'?'ZIP / postal code':'City or neighborhood'}
  function buildSummary(i){let s=i.description.trim().replace(/\s+/g,' ');s=s.charAt(0).toUpperCase()+s.slice(1);return /[.!?]$/.test(s)?s:s+'.'}
  async function analyzeIssue(i){
    // Replace this deterministic provider with the IBM server adapter once endpoint/model details arrive.
    const category=categoryFor(i.description,i.type),entry=directory[category],route=entry&&entry.fit.test(i.description)?entry:null;
    const confidence=route?'Likely example match':category==='Not sure'||category==='Other'?'More information needed':'No clear local match';
    const nextStep=route?`Review ${route.name} guidance and confirm the local service for ${i.location}. The linked source is a New York City example and may not apply to your location.`:`Check your local government’s official service directory for the department that handles ${category.toLowerCase()} concerns. The demo directory has no location-verified route for this issue.`;
    return{category,summary:buildSummary(i),route,confidence,nextStep};
  }
  function reportText(){const summary=$('#summary-edit').value.trim(),category=$('#category-edit').value,loc=$('#result-location').value.trim(),landmark=$('#result-landmark').value.trim(),step=$('#next-step-edit').value.trim();return`CIVICSIGNAL · COMMUNITY CONCERN\nDRAFT — NOT SUBMITTED\n\nISSUE\n${summary}${issue?.date?`\nNoticed: ${issue.date}`:''}\n\nLOCATION\n${locationLabel($('#result-location-kind').value)}: ${loc}${landmark?`\nNearby landmark: ${landmark}`:''}\n\nCATEGORY\n${category}\n\nSUGGESTED NEXT STEP\n${step}${result?.route?`\n\nREFERENCE SOURCE\n${result.route.source}\n${result.route.url}`:''}\n\nThis is a resident-reviewed draft. CivicSignal has not filed or sent this report.`}
  function refreshPreview(){const preview=$('#report-preview');if(preview)preview.textContent=reportText()}
  function render(){
    $('#summary-edit').value=result.summary;$('#category-edit').value=result.category;
    $('#result-location-kind').value=issue.locationType;$('#result-location').value=issue.location;$('#result-landmark').value=issue.landmark;$('#next-step-edit').value=result.nextStep;
    const confidence=$('#confidence-label');confidence.textContent=result.confidence;confidence.className='confidence'+(result.route?'':' caution');
    $('#clarifying-area').innerHTML=result.confidence==='More information needed'?'<div class="question"><strong>More detail may help</strong><br>The demo assistant cannot identify a local service with confidence. Review the category and use your city’s official directory.</div>':'';
    const routeArea=$('#route-area');
    if(result.route)routeArea.innerHTML=`<article class="route-card"><div class="route-heading"><span class="route-symbol" aria-hidden="true">⌖</span><div><span class="demo-chip">DEMO DIRECTORY · EXAMPLE ONLY</span><h2>${esc(result.route.name)}</h2><p>This example is not matched to your location.</p></div></div><div class="route-rationale"><strong>Why it was suggested</strong><br>The issue description includes terms associated with ${esc(issue.type.toLowerCase())}. This is a simple local keyword match, not an AI determination or verified local routing.</div><div class="source-row"><span class="source-meta">Source: ${esc(result.route.source)}<br><small>NYC example · confirm local applicability</small></span><a class="source-link" href="${result.route.url}" target="_blank" rel="noopener noreferrer">Open source ↗</a></div></article>`;
    else routeArea.innerHTML='<div class="no-match"><strong>No clear local match</strong><div style="font-size:12px">The current demo directory cannot confirm a relevant service for your location. Keep the draft, and check your local government’s official directory before sharing it.</div></div>';
    saved=false;const exact=$('#result-location-kind').value==='address';$('#address-consent-row').hidden=!exact;$('#address-consent').checked=false;$('#review-confirm').checked=false;$('#review-confirm').disabled=false;$('#address-consent').disabled=false;$('#save-status').textContent='';$('#save-report').disabled=false;$('#save-report').textContent='Save confirmed report';$('#report-preview').tabIndex=0;refreshPreview();
  }
  desc.addEventListener('input',()=>$('#char-count').textContent=desc.value.length);
  $('#location-kind').addEventListener('change',e=>{const input=$('#location-value'),k=e.target.value;input.placeholder=k==='address'?'Street address':k==='postal'?'ZIP or postal code':'City or neighborhood';input.autocomplete=k==='address'?'street-address':'off'});
  form.addEventListener('submit',async e=>{
    e.preventDefault();e.stopImmediatePropagation();const message=$('#location-clarification');message.classList.remove('show');
    const text=desc.value.trim(),where=locationInput.value.trim(),near=landmarkInput.value.trim(),type=kind.value;
    if(text.length<4){$('#form-error').classList.add('show');desc.focus();return}$('#form-error').classList.remove('show');
    if(!where){message.textContent='Add a location so the report can be understood. A ZIP code or a general area with a landmark works; use a street address only if you want to.';message.classList.add('show');locationInput.focus();return}
    if(type==='city'&&needsLandmark(text)&&!near){message.textContent='A city alone doesn’t identify which light or street feature you mean. Add an intersection or nearby public landmark, or switch to a ZIP code or street address.';message.classList.add('show');landmarkInput.focus();return}
    issue={description:text,type:$('#issue-type').value||'',locationType:type,location:where,landmark:near,date:$('#noticed').value};
    const loading=$('#loading');loading.classList.add('show');
    try{result=await analyzeIssue(issue);render();loading.classList.remove('show');document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id==='results'));window.scrollTo({top:0,behavior:'smooth'})}
    catch{loading.classList.remove('show');message.textContent='Could not prepare the draft. Your entered details are still available; please try again.';message.classList.add('show')}
  },true);
  $('#category-edit').addEventListener('change',e=>{const edits={summary:$('#summary-edit').value,locationType:$('#result-location-kind').value,location:$('#result-location').value,landmark:$('#result-landmark').value};result.category=e.target.value;const entry=directory[result.category];result.route=entry&&entry.fit.test(issue.description)?entry:null;result.confidence=result.route?'Likely example match':result.category==='Not sure'||result.category==='Other'?'More information needed':'No clear local match';result.nextStep=result.route?`Review ${result.route.name} guidance and confirm the local service for ${issue.location}. The linked source is a New York City example and may not apply to your location.`:`Check your local government’s official service directory for the department that handles ${result.category.toLowerCase()} concerns. The demo directory has no location-verified route for this issue.`;render();$('#summary-edit').value=edits.summary;$('#result-location-kind').value=edits.locationType;$('#result-location').value=edits.location;$('#result-landmark').value=edits.landmark;$('#address-consent-row').hidden=edits.locationType!=='address';refreshPreview()});
  function markEdited(){if(saved)return;$('#review-confirm').checked=false;$('#save-status').textContent='Draft changed. Review it and confirm again before saving.';refreshPreview()}
  ['#summary-edit','#result-location','#result-landmark','#next-step-edit'].forEach(sel=>$(sel).addEventListener('input',markEdited));
  $('#result-location-kind').addEventListener('change',()=>{const exact=$('#result-location-kind').value==='address';$('#address-consent-row').hidden=!exact;$('#address-consent').checked=false;markEdited()});
  $('#copy-draft').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(reportText());$('#copy-message').textContent='Polished report copied.'}catch{$('#report-preview').focus();$('#copy-message').textContent='Clipboard access is unavailable; select and copy the report preview.'}});
  $('#save-report').addEventListener('click',async()=>{
    const status=$('#save-status'),locType=$('#result-location-kind').value,landmark=$('#result-landmark').value.trim();
    if(!$('#review-confirm').checked){status.textContent='Review the report and check the confirmation box before saving.';return}
    if(locType==='address'&&!$('#address-consent').checked){status.textContent='Confirm separately if you want the exact street address stored.';return}
    if(locType==='city'&&needsLandmark(issue.description)&&!landmark){status.textContent='Add an intersection or nearby landmark before saving a specific street issue.';$('#result-landmark').focus();return}
    const payload={description:issue.description,summary:$('#summary-edit').value.trim(),category:$('#category-edit').value,nextStep:$('#next-step-edit').value.trim(),locationType:locType,location:$('#result-location').value.trim(),landmark,noticedDate:issue.date,polishedReport:reportText(),sourceName:result.route?.source||'',sourceUrl:result.route?.url||'',exactLocationConsent:locType==='address'&&$('#address-consent').checked};
    if(!payload.summary||!payload.location||!payload.nextStep){status.textContent='Complete the summary, location, and next step before saving.';return}
    const button=$('#save-report');button.disabled=true;status.textContent='Saving to the local report file…';
    try{const response=await fetch('/api/reports',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await response.json();if(!response.ok)throw new Error(data.error||'Save failed.');saved=true;status.textContent=`Saved locally · ${data.id.slice(0,8)} · not submitted`;button.textContent='Saved to local file';$('#review-confirm').disabled=true;$('#address-consent').disabled=true;['#summary-edit','#category-edit','#result-location-kind','#result-location','#result-landmark','#next-step-edit'].forEach(sel=>$(sel).disabled=true)}
    catch(error){status.textContent=`Could not save: ${error.message}. Start the local server with “node server.js” and open http://127.0.0.1:4173.`;button.disabled=false}
  });
  $('#restart').addEventListener('click',()=>{issue=null;result=null;form.reset();$('#char-count').textContent='0';$('#location-clarification').classList.remove('show');$('#copy-message').textContent='';document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id==='home'));window.scrollTo({top:0,behavior:'smooth'})});
  const about=document.querySelector('.about-card:nth-child(1) p');if(about)about.textContent='Until IBM API details are configured, local demo rules draft the summary and category. Issue details are not sent to an AI provider. The IBM provider will be connected on the server after its endpoint, model, and authentication are known.';
  const hero=document.querySelector('.hero-copy');if(hero)hero.textContent='CivicSignal helps you organize what you noticed, find a relevant public resource, and prepare a location-aware report you can review before saving.';
})();
