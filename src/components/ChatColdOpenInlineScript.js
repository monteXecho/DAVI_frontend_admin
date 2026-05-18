import { normalizedChatPublicHostnames } from '@/lib/chatPublicHost'
import {
  PUBLIC_CHAT_RESUME_COOKIE,
  PUBLIC_CHAT_RESUME_PATH_KEY,
} from '@/lib/publicChatResume'

/**
 * Executes before React when the document still shows `/`. Progressier and
 * similar PWAs use `/?launchedfrom=homescreen` — service workers bypass Next
 * middleware; this redirects using the resume cookie or `/publicChat`.
 *
 * Mirrors `migrateLegacyPublicChatPath`: cookie may still contain
 * `/publicChat/{uuid}/{chat}`; normalize to canonical `/publicChat/{chat}/{uuid}`.
 */
export default function ChatColdOpenInlineScript() {
  const hosts = normalizedChatPublicHostnames()
  if (!hosts.length) return null

  const names = JSON.stringify(hosts)
  const prefix = `${PUBLIC_CHAT_RESUME_COOKIE}=`

  const pathKey = PUBLIC_CHAT_RESUME_PATH_KEY.replace(/\\/g, '\\\\').replace(
    /"/g,
    '\\"',
  )

  const js = `(function(){
try{
var H=${names};
var hn=(location.hostname||"").split(":")[0].toLowerCase();
if(H.indexOf(hn)<0)return;
typeof navigator!="undefined"&&navigator.serviceWorker&&(navigator.serviceWorker.register=function(){return Promise.reject(new Error("SW disabled"));},navigator.serviceWorker.getRegistrations&&navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(x){try{x.unregister();}catch(e){}});}));
function migPath(pathOnly){
  try{
    var uuidRx=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    var m=/^\\/publicChat\\/([^/]+)\\/([^/]+)$/.exec(pathOnly);
    if(!m)return pathOnly;
    var a=decodeURIComponent(m[1]);var b=decodeURIComponent(m[2]);
    if(uuidRx.test(a)&&!uuidRx.test(b)){
      return "/publicChat/"+encodeURIComponent(b)+"/"+encodeURIComponent(a);
    }
  }catch(e){}
  return pathOnly;
}
var p=location.pathname||"";
if(p!=="/")return;

var tgt="/publicChat";
var want="${prefix.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}";
var ck=document.cookie||"";
var ch=ck.split(";");
for(var i=0;i<ch.length;i++){
  var kv=ch[i].trim();
  if(kv.indexOf(want)!==0)continue;
  try{
    var v=decodeURIComponent(kv.substring(want.length));
    var pathOnly=migPath((v.split("?")[0]||"").replace(/\\/$/,""));
    if(/^\\/publicChat\\/[^/]+\\/[^/]+$/.test(pathOnly))tgt=pathOnly;
  }catch(e){}
  break;
}
if(tgt==="/publicChat"){
  try{
    var ls=localStorage.getItem("${pathKey}");
    if(ls){
      var lp=migPath((ls.split("?")[0]||"").replace(/\\/$/,""));
      if(/^\\/publicChat\\/[^/]+\\/[^/]+$/.test(lp))tgt=lp;
    }
  }catch(e){}
}

location.replace(location.origin+tgt+(location.hash||""));
}catch(e){}
})();`

  return <script dangerouslySetInnerHTML={{ __html: js }} />
}
