(() => {
  const root=document.documentElement,button=document.querySelector('.theme-toggle');
  try{root.dataset.theme=localStorage.getItem('andrew-theme')||root.dataset.theme;}catch{}
  button?.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('andrew-theme',root.dataset.theme);}catch{}});
  const toggle=document.querySelector('.nav-toggle'),nav=document.getElementById('site-nav');
  toggle?.addEventListener('click',()=>{const expanded=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(expanded));nav.classList.toggle('open',expanded);});
  const search=document.getElementById('publication-search'),year=document.getElementById('publication-year'),type=document.getElementById('publication-type');
  function filter(){let count=0;document.querySelectorAll('[data-filter-item]').forEach(item=>{const visible=(!year.value||item.dataset.year===year.value)&&(!type.value||item.dataset.type===type.value)&&item.dataset.search.toLowerCase().includes(search.value.toLowerCase());item.hidden=!visible;if(visible)count++;});document.getElementById('filter-empty').hidden=count>0;}
  if(search)for(const element of [search,year,type])element.addEventListener('input',filter);
  document.querySelectorAll('.citation-button').forEach(button=>button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(button.dataset.citation);button.textContent='已复制';}catch{const dialog=document.createElement('dialog');const area=document.createElement('textarea');area.value=button.dataset.citation;area.rows=10;area.style.width='100%';dialog.append(area);const close=document.createElement('button');close.textContent='关闭';close.className='button';close.onclick=()=>{dialog.close();dialog.remove();};dialog.append(close);document.body.append(dialog);dialog.showModal();}}));
})();
