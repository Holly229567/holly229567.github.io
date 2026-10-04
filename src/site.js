(() => {
  const root=document.documentElement;
  const themeButton=document.querySelector('.theme-toggle');
  function updateTheme(){themeButton?.setAttribute('aria-label',root.dataset.theme==='dark'?'切换浅色主题':'切换深色主题');}
  updateTheme();
  themeButton?.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('leliz-pages-theme',root.dataset.theme);}catch{}updateTheme();});
  const menu=document.querySelector('.menu-toggle'),navigation=document.getElementById('navigation');
  menu?.addEventListener('click',()=>{const expanded=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(expanded));navigation.classList.toggle('open',expanded);});
  navigation?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{navigation.classList.remove('open');menu?.setAttribute('aria-expanded','false');}));
  const filters=[...document.querySelectorAll('[data-category-filter]')];
  const search=document.getElementById('article-search');
  let category=new URLSearchParams(location.search).get('category')||'全部';if(!['全部','研究','开发','随笔'].includes(category))category='全部';
  function filterArticles(){let count=0;const query=(search?.value||'').trim().toLowerCase();document.querySelectorAll('.article-row').forEach(row=>{const match=(category==='全部'||row.dataset.category===category)&&(row.dataset.search||'').toLowerCase().includes(query);row.hidden=!match;if(match)count++;});filters.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.categoryFilter===category)));const empty=document.getElementById('no-results');if(empty)empty.hidden=count>0;}
  filters.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.categoryFilter;filterArticles();}));search?.addEventListener('input',filterArticles);if(filters.length)filterArticles();
})();
