export const REPOSITORY = 'Holly229567/holly229567.github.io';
export const COLLECTIONS = {
  links: { title: '联系与链接', singular: '链接', fields: [['title','链接名称','text',true],['url','链接地址','url',true]] },
  news: { title: '动态', singular: '动态', fields: [['date','日期','date'],['title','标题','text',true],['content','内容','markdown'],['url','链接','url']] },
  experience: { title: '经历', singular: '经历', fields: [['period','时间段'],['title','学校 / 单位 / 职位','text',true],['organization','机构'],['description','介绍','markdown']] },
  projects: { title: '项目', singular: '项目', fields: [['title','项目名称','text',true],['description','介绍','markdown'],['language','技术 / 语言'],['url','项目链接','url'],['code','源码链接','url'],['image','封面','asset'],['featured','在首页展示','checkbox']] },
  publications: { title: '论文', singular: '论文', fields: [['title','论文标题','text',true],['authors','作者'],['venue','期刊 / 会议'],['year','年份'],['type','类型','select',['journal','conference','preprint','thesis','other']],['description','摘要 / 简介','markdown'],['doi','DOI'],['url','论文链接','url'],['pdf','PDF','asset'],['code','代码链接','url'],['image','预览图','asset'],['bibtex','BibTeX','textarea'],['featured','精选论文','checkbox']] },
  teaching: { title: '教学', singular: '教学记录', fields: [['title','课程 / 助教工作','text',true],['period','时间'],['organization','机构'],['description','介绍','markdown'],['url','链接','url']] },
  awards: { title: '奖项', singular: '奖项', fields: [['title','奖项名称','text',true],['year','年份'],['organization','颁发机构'],['description','介绍','markdown'],['url','链接','url']] },
  services: { title: '学术服务', singular: '服务记录', fields: [['title','服务 / 活动名称','text',true],['period','时间'],['organization','机构'],['description','介绍','markdown'],['url','链接','url']] },
  posts: { title: '博客', singular: '文章', fields: [['title','文章标题','text',true],['slug','文章地址（英文、数字、连字符）','slug',true],['date','日期','date'],['category','分类'],['excerpt','摘要','textarea'],['content','正文','markdown',true],['image','封面','asset'],['visible','显示在网站','checkbox']] },
  pages: { title: '自定义页面', singular: '页面', fields: [['title','页面标题','text',true],['slug','页面地址（英文、数字、连字符）','slug',true],['content','正文','markdown'],['showInNav','加入导航','checkbox']] }
};
export const PROFILE_FIELDS = [['name','姓名','text',true],['title','身份 / 职位'],['institution','学校 / 单位'],['email','邮箱','email'],['location','所在地'],['avatar','头像','asset'],['interests','研究兴趣（每行一项）','lines'],['github','GitHub','url'],['scholar','Google Scholar','url'],['orcid','ORCID','url'],['linkedin','LinkedIn','url'],['website','其他主页','url'],['about','关于我','markdown'],['cv','简历正文','markdown'],['cvFile','简历 PDF','asset']];
export function emptySite() {
  return { schemaVersion:2, url:'https://holly229567.github.io', repository:REPOSITORY,
    profile:Object.fromEntries(PROFILE_FIELDS.map(([key])=>[key,key==='name'?'Andrew Zhou':key==='interests'?[]:''])),
    settings:{title:'Andrew Zhou',description:'',favicon:'',defaultTheme:'light',accent:'#a7793c',showEmpty:true,homeProjects:true,homePublications:true,homeNews:true,labels:{home:'关于',publications:'论文',projects:'项目',blog:'博客',cv:'简历'}},
    ...Object.fromEntries(Object.keys(COLLECTIONS).map(key=>[key,[]])), media:[], updatedAt:'' };
}
export const clone=value=>JSON.parse(JSON.stringify(value));
export function checkUrl(value,{asset=false,email=false}={}) {
  if(!value)return true;
  if(asset&&/^\/(?:uploads|images)\/[a-zA-Z0-9._/-]+$/.test(value)&&!value.includes('..'))return true;
  try {const url=new URL(value);return ['http:','https:',...(email?['mailto:']:[])].includes(url.protocol);}catch{return false;}
}
export function validateSite(input) {
  if(!input||input.schemaVersion!==2||input.repository!==REPOSITORY)throw new Error('网站数据格式或仓库设置无效。');
  if(typeof input.profile?.name!=='string'||!input.profile.name.trim())throw new Error('请填写姓名。');
  if(input.profile.name.length>100)throw new Error('姓名过长。');
  if(!Array.isArray(input.profile.interests))throw new Error('研究兴趣格式无效。');
  for(const [key,,type] of PROFILE_FIELDS){const value=input.profile[key];if(type!=='lines'&&typeof value!=='string')throw new Error('个人资料字段格式无效。');if(type==='url'&&!checkUrl(value)||type==='asset'&&!checkUrl(value,{asset:true}))throw new Error('请检查个人资料中的链接。');}
  if(!input.settings||!/^#[0-9a-f]{6}$/i.test(input.settings.accent)||!['light','dark'].includes(input.settings.defaultTheme))throw new Error('外观设置无效。');
  for(const key of ['title','description','favicon'])if(typeof input.settings[key]!=='string'||input.settings[key].length>2000)throw new Error('网站设置格式无效。');
  if(!checkUrl(input.settings.favicon,{asset:true}))throw new Error('网站图标地址无效。');
  for(const key of ['homeProjects','homePublications','homeNews'])if(typeof input.settings[key]!=='boolean')throw new Error('首页栏目设置无效。');
  for(const key of ['home','publications','projects','blog','cv'])if(typeof input.settings.labels?.[key]!=='string'||!input.settings.labels[key].trim()||input.settings.labels[key].length>40)throw new Error('请填写有效的导航名称。');
  if(typeof input.url!=='string'||!checkUrl(input.url))throw new Error('网站地址无效。');
  const ids=new Set(),routes=new Set(['admin','preview','blog','projects','publications','experience','teaching','awards','services','news','cv','write']);
  for(const [key,definition] of Object.entries(COLLECTIONS)){
    if(!Array.isArray(input[key])||input[key].length>1000)throw new Error(definition.title+'列表格式无效。');
    const slugs=new Set();
    for(const item of input[key]){
      if(typeof item.id!=='string'||ids.has(item.id))throw new Error('记录编号重复或缺失。');ids.add(item.id);
      for(const [field,label,type='text',required] of definition.fields){const value=item[field]??'';if(type==='checkbox'){if(typeof value!=='boolean')throw new Error(label+'格式无效。');continue;}if(typeof value!=='string'||value.length>200000)throw new Error(label+'格式无效或过长。');if(required===true&&!value.trim())throw new Error('请填写'+label+'。');if(type==='url'&&!checkUrl(value)||type==='asset'&&!checkUrl(value,{asset:true}))throw new Error(label+'地址无效。');if(type==='slug'&&(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)||slugs.has(value)))throw new Error('页面地址无效或重复。');if(type==='date'&&value&&(!/^\d{4}-\d{2}-\d{2}$/.test(value)||Number.isNaN(Date.parse(value))))throw new Error('日期格式无效。');}
      if(item.slug){slugs.add(item.slug);if(key==='pages'&&routes.has(item.slug))throw new Error('自定义页面地址与现有栏目冲突。');}
    }
  }
  if(!Array.isArray(input.media)||input.media.length>500)throw new Error('附件列表格式无效。');
  for(const file of input.media)if(!/^\/uploads\/[a-z0-9-]+\.(?:jpg|jpeg|png|webp|gif|pdf)$/i.test(file.url)||typeof file.label!=='string')throw new Error('附件地址无效。');
  const text=JSON.stringify(input);if(text.length>5000000)throw new Error('网站数据过大，请减少单篇内容。');
  return input;
}
export function newRecord(key) {
  const result={id:crypto.randomUUID()};
  for(const [field,,type='text',options] of COLLECTIONS[key].fields)result[field]=type==='checkbox'?['visible','featured','showInNav'].includes(field):type==='select'?options[0]:type==='date'?new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Shanghai'}):'';
  return result;
}
export function validateUploads(files) {
  if(!Array.isArray(files)||files.length>100)throw new Error('附件数量过多。');
  let total=0;const paths=new Set();
  for(const file of files){if(!/^public\/uploads\/[a-z0-9-]+\.(?:jpg|jpeg|png|webp|gif|pdf)$/i.test(file.path)||paths.has(file.path)||typeof file.content!=='string'||!/^[a-zA-Z0-9+/]*={0,2}$/.test(file.content))throw new Error('附件内容或路径无效。');paths.add(file.path);const size=Math.floor(file.content.length*3/4);if(size>20*1024*1024)throw new Error('单个附件请控制在 20 MB 以内。');total+=size;}
  if(total>40*1024*1024)throw new Error('一次上传的附件请控制在 40 MB 以内。');
  return files;
}
