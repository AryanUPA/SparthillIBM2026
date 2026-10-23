const {categories,inferCategory,routeIssue}=require('./service-directory');

const tidy=s=>String(s||'').replace(/\s+/g,' ').trim();
const answerFor=(items,id)=>items.find(x=>x.id===id)?.answer||'';
function checks(input,category) {
  const flags=[];const text=[input.originalDescription,input.landmark,...input.clarifications.map(x=>x.answer)].join(' ');
  if (/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/.test(text)||/\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(text)) flags.push({type:'Privacy',message:'The original contains what may be contact information. Review it before saving.'});
  if (!input.location && !input.landmark) flags.push({type:'Missing location detail',message:'Only the city is known. A nearby intersection or landmark could help identify the exact issue.'});
  if (category==='Not sure'||category==='Other') flags.push({type:'Unclear issue type',message:'The issue does not match a known category in the current directory.'});
  if (/\b(today|tonight)\b/i.test(text)&&/\b(yesterday|last week|last month)\b/i.test(text)) flags.push({type:'Check timing',message:'The description mentions more than one time frame. Confirm when this occurred.'});
  if (/\b(because the city|deliberately|definitely caused by|must have been)\b/i.test(text)) flags.push({type:'Unverified cause',message:'The report may state a cause that has not been verified. Consider describing what you directly observed.'});
  return flags;
}
function nextQuestion(input,category) {
  const answered=new Set(input.clarifications.map(x=>x.id));
  const text=tidy(input.originalDescription);
  if (text.length<18&&!answered.has('issue-detail')) return {id:'issue-detail',prompt:'What did you observe, and what appears to be affected?',hint:'Describe what you can see without guessing at the cause.'};
  const precise=['Streetlight','Pothole','Sidewalk','Traffic signal','Park maintenance'].includes(category);
  if (precise && input.locationType==='city' && !input.landmark && !answered.has('place')) return {id:'place',prompt:'Where exactly is the issue in San José?',hint:'A cross street, pole number, park name, or nearby business is enough. Avoid a home address if you prefer.'};
  if ((category==='Not sure'||category==='Other')&&!answered.has('type')) return {id:'type',prompt:'What kind of public issue is this closest to?',hint:'For example: streetlight, pothole, sidewalk, dumping, park, or transit.'};
  return null;
}
function buildDraft(input,category,routeResult,flags) {
  let observed=tidy(input.originalDescription);if(observed)observed=observed[0].toUpperCase()+observed.slice(1);if(observed&&!/[.!?]$/.test(observed))observed+='.';
  const details=input.clarifications.filter(x=>x.answer).map(x=>tidy(x.answer));
  const summary=observed+(details.length?` Additional details: ${details.join('; ')}.`:'');
  const subject=`${category==='Not sure'?'Community concern':category} concern in ${tidy(input.city)}`;
  const location=[input.locationType==='address'?'Street address':input.locationType==='postal'?'ZIP / postal code':'City or neighborhood',tidy(input.location||input.city)].join(': ')+(input.landmark?` · Near ${tidy(input.landmark)}`:'');
  const nextStep=routeResult.route?`Review the ${routeResult.route.name.toLowerCase()} guidance. Confirm the details on the official page before submitting a request.`:'Review the City of San José report-issues directory or ask a city representative to identify the right department.';
  return {subject,summary,location,nextStep,flags};
}
async function analyzeIssue(input) {
  // IBM Bob provider boundary: add a documented server-side request here after its endpoint,
  // model and team/header requirements are known. Never expose its key to the browser.
  const hinted=categories.includes(input.categoryHint)?input.categoryHint:null;
  const category=input.forceCategory&&hinted?hinted:hinted&&hinted!=='Not sure'?hinted:inferCategory(`${input.originalDescription} ${input.clarifications.map(x=>x.answer).join(' ')}`);
  const locationAnswer=answerFor(input.clarifications,'place');
  const normalized={...input,landmark:input.landmark||locationAnswer};
  const candidateQuestion=nextQuestion(normalized,category);
  const question=input.skipClarifications?null:candidateQuestion;
  const routeResult=routeIssue(normalized,category);
  const flags=checks(normalized,category);
  if(input.skipClarifications && candidateQuestion) flags.push({type:'Details skipped',message:'The resident chose to continue without additional details.'});
  return {mode:'local-demo',category,question,route:routeResult.route,routeStatus:routeResult.status,routeReason:routeResult.reason,flags,draft:buildDraft(normalized,category,routeResult,flags)};
}
module.exports={analyzeIssue,tidy};
