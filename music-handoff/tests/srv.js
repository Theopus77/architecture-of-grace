const http=require("http"),fs=require("fs"),path=require("path");
const root=process.env.AOG_ROOT||require("path").resolve(__dirname,"../../aog-deploy");
const T={".html":"text/html",".js":"text/javascript",".css":"text/css",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".mp3":"audio/mpeg",".txt":"text/plain",".json":"application/json",".svg":"image/svg+xml",".woff2":"font/woff2"};
module.exports=function(port){ return http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split("?")[0].split("#")[0]); if(u.endsWith("/")) u+="index.html"; let f=path.join(root,u);
  if(!fs.existsSync(f)&&fs.existsSync(f+".html")) f+=".html";
  fs.readFile(f,(e,d)=>{ if(e){ r.writeHead(404); return r.end(); } r.writeHead(200,{"content-type":T[path.extname(f)]||"application/octet-stream"}); r.end(d); }); }).listen(port); };
