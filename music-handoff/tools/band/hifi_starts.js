/* AOG-BAND-HIFI-V1 — where each recording made again at 44.1 kHz starts: the start the Band page found on the 32 kHz file
   it replaces (decoded at 32 kHz, as the page did, by the page's own onsetOf), moved by however far the new file sits
   from the old one (hifi_report.json "lag", in samples at 44.1 kHz), into the manifest as "st" (seconds; negative where
   the page skipped a breath in front). The page uses it instead of measuring the new file again (band_script.js startOf).
   Not for the voices or what the computer makes (made again, not the same samples): the page measures those as before.
     node music-handoff/tools/band/hifi_starts.js        then python3 aog-deploy/_work/music/make_band.py
   Port 9464. */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const fs=require("fs"), path=require("path");
const ROOT=path.resolve(__dirname,"../../../aog-deploy"), MANF=path.join(ROOT,"audio/band/manifest.json");
const REP=JSON.parse(fs.readFileSync(path.join(__dirname,"hifi_report.json"),"utf8"));
const REMADE=["koto","panflute","melodica","boomwhackers","voice_f_aa","voice_f_uu","voice_m_aa","voice_m_uu"];
const srv=require("../../tests/srv.js")(9464);
(async()=>{
  const man=JSON.parse(fs.readFileSync(MANF,"utf8"));
  const jobs=REP.notes.filter(r=>REMADE.indexOf(r.player)<0).map(r=>({p:r.player, k:r.key, lag:r.lag, old:man[r.player].dir.replace(/\/hq$/,"")}));
  const b=await pw.chromium.launch(), page=await b.newPage();
  await page.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await page.goto("http://localhost:9464/music-band.html"); await page.waitForTimeout(800);
  const st=await page.evaluate(async(jobs)=>{
    const dec=new OfflineAudioContext(1,1,32000), out={};
    for(const j of jobs){
      let buf=await decodeWith(dec, await (await fetch("/audio/band/"+j.old+"/"+j.k+".mp3")).arrayBuffer());
      const at=onsetOf(buf, j.p!=="kit"), breath=BREATH.has(buf), s=Math.max(0, at+j.lag/44100);
      (out[j.p]=out[j.p]||{})[j.k]=Math.round((breath ? -1 : 1)*Math.max(s, breath ? 1e-4 : 0)*1e5)/1e5;
    }
    return out; }, jobs);
  let n=0; Object.keys(st).forEach(p=>{ man[p].st=st[p]; n+=Object.keys(st[p]).length; });
  fs.writeFileSync(MANF, JSON.stringify(man));
  console.log("st written for", Object.keys(st).length, "players,", n, "recordings");
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
