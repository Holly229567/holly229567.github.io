import { REPOSITORY, validateSite, validateUploads } from './content-model.mjs';
export class GitHubStore {
  constructor(token,{fetcher=fetch}={}){this.token=token;this.fetcher=fetcher;}
  async request(path,method='GET',data){
    const response=await this.fetcher('https://api.github.com/repos/'+REPOSITORY+path,{method,headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+this.token,'X-GitHub-Api-Version':'2022-11-28',...(data?{'Content-Type':'application/json'}:{})},...(data?{body:JSON.stringify(data)}:{})});
    const result=await response.json().catch(()=>({}));
    if(!response.ok){const error=new Error(response.status===401?'GitHub 登录已失效，请重新连接。':response.status===403?'当前 GitHub 登录没有网站仓库的写入权限。':response.status===422?'网站同时有其他更新，请重新加载后再发布。':'GitHub 请求失败（'+response.status+'），请稍后重试。');error.status=response.status;throw error;}
    return result;
  }
  async load(){
    const repository=await this.request('');if(!repository.permissions?.push)throw new Error('当前账号没有此网站的写入权限。');
    const file=await this.request('/contents/site.json?ref=main');
    let content=file.content;if(!content){content=(await this.request('/git/blobs/'+file.sha)).content;}
    const bytes=Uint8Array.from(atob(content.replace(/\s/g,'')),c=>c.charCodeAt(0));
    return {state:validateSite(JSON.parse(new TextDecoder().decode(bytes))),baseSha:file.sha,repository:REPOSITORY};
  }
  async publish({state,baseSha,files=[]}){
    validateSite(state);validateUploads(files);
    const ref=await this.request('/git/ref/heads/main');
    const parent=await this.request('/git/commits/'+ref.object.sha);
    const entries=await this.request('/git/trees/'+parent.tree.sha);
    const current=entries.tree.find(item=>item.path==='site.json');
    if(!baseSha||current?.sha!==baseSha){const error=new Error('网站已在其他地方更新。请导出当前草稿，再重新加载最新内容。');error.status=409;throw error;}
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
