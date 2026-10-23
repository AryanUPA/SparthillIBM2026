// Curated public routes for the San José area. These links are guidance, not submission APIs.
const checkedOn = '2026-10-23';
const services = Object.freeze({
  streetlight: { id:'streetlight', category:'Streetlight', department:'San José 311 · Streetlight repairs', name:'Report a streetlight outage', url:'https://www.sanjoseca.gov/your-government/departments-offices/transportation/streets/streetlights', sourceName:'City of San José · Streetlights', checkedOn, reason:'The city directs dark or broken roadway streetlights to San José 311.' },
  pothole: { id:'pothole', category:'Pothole', department:'San José 311 · Potholes', name:'Report a pothole', url:'https://www.sanjoseca.gov/your-government/departments-offices/customer-service/san-jos-311', sourceName:'City of San José · San José 311', checkedOn, reason:'Potholes are listed as a San José 311 service request.' },
  dumping: { id:'dumping', category:'Illegal dumping', department:'San José 311 · Illegal dumping', name:'Report illegal dumping', url:'https://www.sanjoseca.gov/residents/report-issues', sourceName:'City of San José · Report Issues', checkedOn, reason:'The city lists illegal dumping among issues handled through San José 311.' },
  sidewalk: { id:'sidewalk', category:'Sidewalk', department:'San José Department of Transportation · Sidewalks', name:'Report a damaged sidewalk', url:'https://www.sanjoseca.gov/your-government/departments-offices/transportation/contacts', sourceName:'City of San José · Transportation contacts', checkedOn, reason:'The city lists broken or uneven sidewalks under its Department of Transportation contacts.' },
  signal: { id:'signal', category:'Traffic signal', department:'San José Department of Transportation · Traffic signals', name:'Report a traffic signal issue', url:'https://www.sanjoseca.gov/your-government/departments-offices/transportation/streets/signals', sourceName:'City of San José · Traffic signals', checkedOn, reason:'The city directs traffic signal issues to its Department of Transportation.' },
  park: { id:'park', category:'Park maintenance', department:'San José Parks · Park concerns', name:'Report a city park concern', url:'https://www.sanjoseca.gov/your-government/departments-offices/parks-recreation-neighborhood-services/general-information/report-a-concern', sourceName:'City of San José · Report a Park Concern', checkedOn, reason:'The city has a dedicated concern form for maintenance issues in San José parks.' },
  transit: { id:'transit', category:'Transit', department:'VTA · Customer service', name:'Report a VTA maintenance issue', url:'https://www.vta.org/about/contact', sourceName:'VTA · Help and Contacts', checkedOn, reason:'VTA accepts reports about bus stop and station maintenance on its contact page.' }
});

const categories = ['Streetlight','Pothole','Sidewalk','Illegal dumping','Traffic signal','Park maintenance','Transit','Noise','Other','Not sure'];
function inferCategory(text) {
  const t = text.toLowerCase();
  if (/traffic signal|stoplight|walk signal|pedestrian signal/.test(t)) return 'Traffic signal';
  if (/bus stop|light rail|transit|vta|train station/.test(t)) return 'Transit';
  if (/park|playground|recreation center/.test(t) && /broken|damage|light|trash|unsafe|repair|maintenance/.test(t)) return 'Park maintenance';
  if (/street ?light|lamp ?post|light pole|broken light|dark street/.test(t)) return 'Streetlight';
  if (/pothole|road hole|hole in the road/.test(t)) return 'Pothole';
  if (/sidewalk|curb|pedestrian path/.test(t)) return 'Sidewalk';
  if (/illegal dump|dumped|dumping|abandoned trash|discarded furniture/.test(t)) return 'Illegal dumping';
  if (/noise|loud|music at night/.test(t)) return 'Noise';
  return 'Not sure';
}
function isSanJose(city) { return /^(san jos[eé]|sj)$/i.test(String(city||'').trim()); }
function routeIssue(input, category) {
  if (!isSanJose(input.city)) return { route:null, status:'Needs review', reason:'The demo directory covers City of San José routes; another city needs a local directory check.' };
  const t = `${input.originalDescription||''} ${input.clarifications?.map(x=>x.answer).join(' ')||''}`.toLowerCase();
  let id = { Streetlight:'streetlight', Pothole:'pothole', Sidewalk:'sidewalk', 'Illegal dumping':'dumping', 'Traffic signal':'signal', 'Park maintenance':'park', Transit:'transit' }[category];
  if (id==='streetlight' && /inside (a |the )?park|park path|playground/.test(t)) id='park';
  if (id==='pothole' && /freeway|highway|interstate|i-\d+|us-\d+/.test(t)) return { route:null, status:'Needs review', reason:'Freeways may be outside city maintenance responsibility.' };
  if (!id) return { route:null, status:'Needs review', reason:'The curated directory does not establish a destination for this category.' };
  const route=services[id];
  const hasSpecificPlace = Boolean(String(input.location||'').trim() && ['address','postal'].includes(input.locationType)) || Boolean(String(input.landmark||'').trim());
  if (!hasSpecificPlace && ['streetlight','pothole','sidewalk','signal','park'].includes(id)) return { route, status:'Needs review', reason:'The likely department is known, but the exact asset or nearby place needs review.' };
  return { route, status:'Assigned in local tracker', reason:route.reason };
}
module.exports={ services, categories, inferCategory, routeIssue, isSanJose };
