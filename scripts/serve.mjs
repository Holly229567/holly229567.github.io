import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.xml':'application/xml; charset=utf-8'};
http.createServer((req,res)=>{
  try {
    let location=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
    let file=path.resolve(root,'.'+location);
    if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'}).end(fs.readFileSync(path.join(root,'404.html')));return;}
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
  }catch{res.writeHead(400).end('Bad request');}
}).listen(5188,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:5188/'));
