export const LOCAL_MANAGER_ORIGIN='http://127.0.0.1:5192';
export const WEBSITE_ORIGIN='https://holly229567.github.io';
export function trustedMessage(event,{source,origin,nonce,type}) {
  return !!source&&event.source===source&&event.origin===origin&&event.data?.nonce===nonce&&event.data?.type===type;
}
