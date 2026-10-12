import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {GitHubStore} from '../src/github-store.mjs';
import {validateSite,validateUploads} from '../src/content-model.mjs';
import {validManagerRequest} from '../src/manager-request.mjs';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));process.chdir(root);
await import('./build.mjs');
const port=5192,origin='http://127.0.0.1:'+port,nonce=randomBytes(32).toString('hex');
const out=path.resolve(root,'dist');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.gif':'image/gif','.pdf':'application/pdf','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
function github(){const result=spawnSync('git',['-c','credential.interactive=false','credential','fill'],{input:'protocol=https\nhost=github.com\n\n',encoding:'utf8',timeout:30000,maxBuffer:1048576,stdio:['pipe','pipe','pipe']});if(result.status!==0)throw new Error('未找到本机 GitHub 登录，请先登录 GitHub，或使用网页令牌连接。');const match=result.stdout.match(/^password=(.+)$/m);if(!match)throw new Error('本机 GitHub 登录不可用。');return new GitHubStore(match[1].trim());}
function json(res,data,status=200){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));}
async function payload(req){const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>60*1024*1024)throw new Error('上传内容过大，请分批发布。');chunks.push(chunk);}return JSON.parse(Buffer.concat(chunks).toString('utf8'));}
function verifyFile(file){const bytes=Buffer.from(file.content,'base64'),extension=path.extname(file.path).toLowerCase();const valid=extension==='.pdf'?bytes.subarray(0,5).toString()==='%PDF-':['.jpg','.jpeg'].includes(extension)?bytes[0]===255&&bytes[1]===216:extension==='.png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):extension==='.gif'?/^GIF8[79]a$/.test(bytes.subarray(0,6).toString()):extension==='.webp'?bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP':false;if(!valid)throw new Error('附件格式与文件内容不一致。');}
const server=http.createServer(async(req,res)=>{
  if(req.headers.host!=='127.0.0.1:'+port){json(res,{error:'请求来源无效。'},403);return;}
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','no-referrer');
  try{
    const url=new URL(req.url,origin);
    if(url.pathname==='/api/health'){json(res,{service:'andrew-website-manager',version:2});return;}
    if(url.pathname.startsWith('/api/')){
      if(!validManagerRequest(req,{origin,nonce})){json(res,{error:'请求校验失败，请从本机管理页面操作。'},403);return;}
      if(url.pathname==='/api/content'&&req.method==='GET'){json(res,await github().load());return;}
      if(['/api/publish','/api/validate'].includes(url.pathname)&&req.method==='POST'){
        const data=await payload(req);validateSite(data.state);validateUploads(data.files||[]);for(const file of data.files||[])verifyFile(file);
        if(url.pathname==='/api/validate'){json(res,{valid:true});return;}
        json(res,await github().publish(data));return;
      }
      json(res,{error:'接口不存在。'},404);return;
    }
    let file=path.resolve(out,'.'+decodeURIComponent(url.pathname));if(file!==out&&!file.startsWith(out+path.sep)){res.writeHead(403).end();return;}
    if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'}).end(fs.readFileSync(path.join(out,'404.html')));return;}
    if(path.extname(file)==='.html'){const html=fs.readFileSync(file,'utf8').replace('<head>','<head><meta name="local-manager" content="'+nonce+'">');res.writeHead(200,{'Content-Type':mime['.html'],'Cache-Control':'no-store'}).end(html);return;}
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
  }catch(error){json(res,{error:error.message||'暂时无法完成，请稍后重试。'},error.status||400);}
});
server.listen(port,'127.0.0.1',()=>console.log('Manager: '+origin+'/admin/'));
