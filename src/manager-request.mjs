export function validManagerRequest({method,headers},{origin,nonce}){
  return headers['x-andrew-manager']===nonce
    && (!headers.origin||headers.origin===origin)
    && (method==='GET'||headers.origin===origin)
    && headers['sec-fetch-site']!=='cross-site';
}
