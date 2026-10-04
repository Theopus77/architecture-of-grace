/* Measure kits through the drum machine's own engine (music-handoff/tests/lib/meter.js): each pad at the velocities
   asked for, a rock beat, and the 1987 memory's peak per pad. Recorded kits load one at a time as the meter picks them.
   usage: AOG_ROOT=<.../aog-deploy> node calib.js <out.json> [kits, e.g. D,E] [eras, e.g. 1,0] [velocities, e.g. 3,1,2]
   Port 9512. Used by calibrate.py; also how the baseline of the page-made kits was taken (AOG-DRUM-REAL-V2). */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const fs=require("fs"), path=require("path");
const TESTS=path.join(__dirname, "..", "..", "tests");
const srv=require(path.join(TESTS, "srv.js"))(9512);
const out=process.argv[2]||"calib.json";
const banksArg=(process.argv[3]||"").split(",").filter(Boolean);
const eras=(process.argv[4]||"1").split(",").map(Number);
const vels=(process.argv[5]||"1").split(",").map(Number);
(async()=>{
  const b=await pw.chromium.launch({args:["--autoplay-policy=no-user-gesture-required"]});
  const c=await b.newContext({viewport:{width:1280,height:900}}); const p=await c.newPage();
  const errs=[]; p.on("pageerror",e=>errs.push(e.message)); p.on("console", m=>{ if(m.type()==="error" && !/favicon/.test(m.text())) errs.push(m.text()); });
  await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
  await p.goto("http://localhost:9512/music-drums.html#home"); await p.waitForTimeout(1200);
  await p.addScriptTag({content: fs.readFileSync(path.join(TESTS,"lib/meter.js"),"utf8")});
  await p.click('.sp-pad[data-pad="kick"]'); await p.waitForTimeout(2500);
  const banks=banksArg.length?banksArg:await p.evaluate(()=>BANKS.slice());
  const res={};
  for(const era of eras){
    for(const bank of banks){
      const row=await p.evaluate(async ([bank,era,vels])=>{
        const r={pads:{}, rom:{}};
        for(const v of VOICES){ r.pads[v.id]={}; for(const vel of vels) r.pads[v.id][vel]=await __meter.hit(bank, v.id, vel, era); }
        r.rock=await __meter.pattern(bank, era);
        await ensureKit(bank); const lo=romFor(bank), hi=hiFor(bank);
        for(const v of VOICES){ const d=lo[v.id], h=hi[v.id]; let a=0, q=0; if(d) for(const x of d) a=Math.max(a,Math.abs(x)); if(h) for(const x of h) q=Math.max(q,Math.abs(x)); r.rom[v.id]={lo:+a.toFixed(3), hi:+q.toFixed(3), len:d?+(d.length/26040).toFixed(2):0}; }
        return r;
      }, [bank, era, vels]);
      res[era+":"+bank]=row;
      console.log(`era ${era} kit ${bank}: rock ${row.rock.integ.toFixed(1)} | `+Object.keys(row.pads).map(id=>id+" "+vels.map(vel=>row.pads[id][vel].mom.toFixed(1)).join("/")).join(" | "));
    }
  }
  fs.writeFileSync(out, JSON.stringify(res,null,1));
  if(errs.length) console.log("ERRORS", errs.join(" | "));
  await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.stack); process.exit(1); });
