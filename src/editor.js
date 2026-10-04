(() => {
  const form=document.getElementById('editor-form');if(!form)return;
  const byId=id=>document.getElementById(id);
  const fields=['title','slug','category','date','excerpt','content'];
  const storageKey='leliz-markdown-draft-v1';let dirty=false;
  const today=()=>new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Shanghai'});
  const parser=window.markdownit({html:false,linkify:true}).use(texmath,{engine:window.katex,delimiters:['dollars','brackets'],katexOptions:{throwOnError:false,trust:false,strict:'warn',maxExpand:1000}});
  function message(text,error=false){const el=byId('editor-message');el.textContent=text;el.hidden=false;el.classList.toggle('error',error);}
  function values(){return Object.fromEntries(fields.map(key=>[key,byId('post-'+key).value]));}
  function setValues(data){for(const key of fields)byId('post-'+key).value=data[key]??(key==='category'?'随笔':key==='date'?today():'');}
  setValues({});try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved){setValues(saved);message('已恢复此浏览器中保存的草稿。');}}catch{}
  form.addEventListener('input',()=>{dirty=true;byId('editor-message').hidden=true;});
  function preview(show){byId('post-content').hidden=show;byId('post-preview').hidden=!show;byId('edit-tab').setAttribute('aria-pressed',String(!show));byId('preview-tab').setAttribute('aria-pressed',String(show));if(show)byId('post-preview').innerHTML=parser.render(byId('post-content').value);}
  byId('edit-tab').addEventListener('click',()=>preview(false));byId('preview-tab').addEventListener('click',()=>preview(true));
  byId('save-draft').addEventListener('click',()=>{try{localStorage.setItem(storageKey,JSON.stringify(values()));dirty=false;message('草稿已保存到此浏览器，尚未发布。');}catch{message('本机保存不可用，请下载 Markdown 保存。',true);}});
  function documentText(){const p=values();return '---\n'+['title','date','category','excerpt'].map(key=>key+': '+JSON.stringify(p[key])).join('\n')+'\ndraft: false\n---\n\n'+p.content.trim()+'\n';}
  function download(){const blob=new Blob([documentText()],{type:'text/markdown;charset=utf-8'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=(values().slug||'draft')+'.md';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  byId('download-post').addEventListener('click',()=>{download();message('已下载文章文件。');});
  byId('new-draft').addEventListener('click',()=>{if((dirty||byId('post-content').value)&&!confirm('请先保存或下载当前文章。确认清空并新建？'))return;setValues({});try{localStorage.removeItem(storageKey);}catch{}dirty=false;preview(false);byId('editor-message').hidden=true;});
  form.addEventListener('submit',event=>{event.preventDefault();if(!byId('post-content').value.trim()){preview(false);message('请填写正文。',true);byId('post-content').focus();return;}if(!form.reportValidity())return;const text=documentText(),slug=values().slug;try{localStorage.setItem(storageKey,JSON.stringify(values()));dirty=false;}catch{}const base='https://github.com/'+form.dataset.repository;const url=base+'/new/main/content/posts?filename='+encodeURIComponent(slug+'.md')+'&value='+encodeURIComponent(text);if(url.length>12000){download();window.open(base+'/upload/main/content/posts','_blank','noopener,noreferrer');message('文章较长，已下载 Markdown。请在打开的 GitHub 页面上传文件并提交。');}else{window.open(url,'_blank','noopener,noreferrer');message('已打开 GitHub 编辑器。完成提交后，文章会自动发布。');}});
  window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
})();
