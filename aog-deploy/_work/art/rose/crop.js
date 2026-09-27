const pw=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const [f,x,y,w,o]=process.argv.slice(2);const b=await pw.chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await b.newPage({viewport:{width:+w,height:+w}});require("fs").writeFileSync(f+".html",`<body style="margin:0"><img src="${require("path").basename(f)}" style="position:absolute;left:-${x}px;top:-${y}px">`);await p.goto("file://"+f+".html");await p.waitForTimeout(500);
await p.screenshot({path:o});await b.close();})();
