import { REPOSITORY, OWNER_ID, validateSite, validateUploads } from './content-model.mjs';
function contentKey(state) {
  const normalize=value=>Array.isArray(value)?value.map(normalize):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,normalize(value[key])])):value;
  const {updatedAt,...content}=state;
  return JSON.stringify(normalize(content));
}
function decode(content){return validateSite(JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(content.replace(/\s/g,'')),c=>c.charCodeAt(0)))));}
export class GitHubStore {
  constructor(token,{fetcher=fetch}={}){this.token=token;this.fetcher=fetcher;}
  async api(path,method='GET',data){
    const response=await this.fetcher('https://api.github.com'+path,{method,redirect:'error',headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+this.token,'X-GitHub-Api-Version':'2022-11-28',...(data?{'Content-Type':'application/json'}:{})},...(data?{body:JSON.stringify(data)}:{})});
    const result=await response.json().catch(()=>({}));
    if(!response.ok){const error=new Error(response.status===401?'GitHub 登录已失效，请重新连接。':response.status===403?'当前 GitHub 登录没有网站仓库的写入权限。':response.status===422?'网站同时有其他更新，请重新加载后再发布。':'GitHub 请求失败（'+response.status+'），请稍后重试。');error.status=response.status;throw error;}
    return result;
  }
  request(path,method='GET',data){return this.api('/repos/'+REPOSITORY+path,method,data);}
  async assertOwner(){
    const account=await this.api('/user');
    if(account.id!==OWNER_ID||account.type!=='User'){
      const error=new Error('此网站仅允许 Holly229567 本人管理，请使用你的网站所有者账号登录。');error.status=403;throw error;
    }
    const repository=await this.request('');
    if(repository.owner?.id!==OWNER_ID||repository.owner?.type!=='User'){
      const error=new Error('网站仓库所有者校验失败，已停止发布。');error.status=403;throw error;
    }
    if(repository.permissions?.push===false){
      const error=new Error('当前登录没有此网站的写入权限。');error.status=403;throw error;
    }
    return {id:account.id,login:account.login};
  }
  async load(){
    const account=await this.assertOwner();
    const file=await this.request('/contents/site.json?ref=main');
    let content=file.content;if(!content){content=(await this.request('/git/blobs/'+file.sha)).content;}
    return {state:decode(content),baseSha:file.sha,repository:REPOSITORY,account};
  }
  async publish({state,baseSha,files=[]}){
    validateSite(state);validateUploads(files);
    await this.assertOwner();
    const ref=await this.request('/git/ref/heads/main');
    const parent=await this.request('/git/commits/'+ref.object.sha);
    const entries=await this.request('/git/trees/'+parent.tree.sha);
    const current=entries.tree.find(item=>item.path==='site.json');
    if(!baseSha||current?.sha!==baseSha){
      let safe=false;
      if(/^[a-f0-9]{40}$/i.test(baseSha)&&/^[a-f0-9]{40}$/i.test(current?.sha||'')){
        const [oldBlob,currentBlob]=await Promise.all([this.request('/git/blobs/'+baseSha),this.request('/git/blobs/'+current.sha)]);
        const before=decode(oldBlob.content),latest=decode(currentBlob.content);
        safe=contentKey(before)===contentKey(latest)||contentKey(state)===contentKey(latest);
      }
      if(!safe){const error=new Error('网站内容已在其他地方更新。你的草稿仍保留，请先备份，再重新加载最新内容。');error.status=409;throw error;}
    }
    const tree=[];
    for(const file of files){const blob=await this.request('/git/blobs','POST',{content:file.content,encoding:'base64'});tree.push({path:file.path,mode:'100644',type:'blob',sha:blob.sha});}
    const data=await this.request('/git/blobs','POST',{content:JSON.stringify(state,null,2)+'\n',encoding:'utf-8'});
    tree.push({path:'site.json',mode:'100644',type:'blob',sha:data.sha});
    const createdTree=await this.request('/git/trees','POST',{base_tree:parent.tree.sha,tree});
    const commit=await this.request('/git/commits','POST',{message:'Update website content from content manager',tree:createdTree.sha,parents:[ref.object.sha]});
    await this.request('/git/refs/heads/main','PATCH',{sha:commit.sha,force:false});
    return {baseSha:data.sha,commit:commit.sha,url:'https://github.com/'+REPOSITORY+'/commit/'+commit.sha};
  }
}
