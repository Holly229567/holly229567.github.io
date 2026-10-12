import {spawn} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const origin='http://127.0.0.1:5192';
async function ready(){try{const response=await fetch(origin+'/api/health',{signal:AbortSignal.timeout(1000)});return (await response.json()).service==='andrew-website-manager';}catch{return false;}}
if(!await ready()){const processHandle=spawn(process.execPath,[path.join(root,'scripts','manager.mjs')],{cwd:root,detached:true,windowsHide:true,stdio:'ignore'});processHandle.unref();}
let active=false;for(let attempt=0;attempt<30;attempt++){if(await ready()){active=true;break;}await new Promise(resolve=>setTimeout(resolve,500));}
if(!active)throw new Error('管理台未能启动，请在项目目录运行 npm run manage 查看原因。');
if(process.platform==='win32'){const browser=spawn('cmd.exe',['/c','start','',origin+'/admin/'],{windowsHide:true,stdio:'ignore'});browser.unref();}
else{spawn(process.platform==='darwin'?'open':'xdg-open',[origin+'/admin/'],{stdio:'ignore',detached:true}).unref();}
