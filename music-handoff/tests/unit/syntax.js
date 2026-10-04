/* every inline <script> in a page, parsed (not run): a syntax error fails */
const fs = require("fs"), vm = require("vm");
let bad = 0;
for (const f of process.argv.slice(2)) {
  const s = fs.readFileSync(f, "utf8"), re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let m, i = 0;
  while ((m = re.exec(s))) { i++; try { new vm.Script(m[1], { filename: f + "#script" + i }); } catch (e) { bad++; console.log("SYNTAX", f, "script", i, e.message); } }
  console.log(f.split("/").pop() + ": " + i + " inline scripts parsed");
}
process.exit(bad ? 1 : 0);
