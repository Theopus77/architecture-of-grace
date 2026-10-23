/* AOG-LOCKER-V2 — a pretend Google for the locker script (aog-deploy/AoG-Studio-Locker.gs): the real .gs file runs in node, with
   a Drive kept in memory (DriveApp, folders, files, the trash), PropertiesService, Utilities, LockService, ContentService,
   ScriptApp and console. Like Drive, a folder's lists also return what is in the trash, so the script must skip it.
   The clock can be moved on (now += ms) to test what happens after a day or a week.
     const G = require("../lib/fakegas.js")(src, {url})   G.run("setup"); G.post({key, action}) → the JSON answer
     G.logs (what the script logged), G.root() (its Drive), G.props, G.clock.now                                       */
const vm = require("vm"), crypto = require("crypto");
module.exports = function fakeGas(src, opts) {
  opts = opts || {};
  const clock = { now: opts.now || Date.UTC(2026, 9, 23, 21, 52) };
  let seq = 0;
  const ALL = [];   /* every folder in this Drive, for getFolderById and DriveApp.getFoldersByName */
  const iter = a => { let i = 0; a = a.slice(); return { hasNext: () => i < a.length, next: () => { if (i >= a.length) throw new Error("no more"); return a[i++]; } }; };
  const blob = (bytes, mime, name) => ({ bytes: Buffer.from(bytes), name: name || "", getBytes() { return this.bytes; }, getDataAsString() { return this.bytes.toString("utf8"); }, getName() { return this.name; } });
  class FFile {
    constructor(name, bytes, mime) { this.id = "f" + (++seq); this.name = name; this.bytes = Buffer.from(bytes); this.mime = mime; this.trashed = false; }
    getId() { return this.id; } getName() { return this.name; } isTrashed() { return this.trashed; } setTrashed(b) { this.trashed = !!b; return this; }
    getSize() { return this.bytes.length; } getBlob() { return blob(this.bytes, this.mime, this.name); }
    setContent(s) { this.bytes = Buffer.from(String(s), "utf8"); return this; }
  }
  class FFolder {
    constructor(name, parent) { this.id = "d" + (++seq); this.name = name; this.parent = parent || null; this.trashed = false; this.folders = []; this.files = []; ALL.push(this); }
    getId() { return this.id; } getName() { return this.name; }
    isTrashed() { let f = this; while (f) { if (f.trashed) return true; f = f.parent; } return false; }
    setTrashed(b) { this.trashed = !!b; return this; }
    getFolders() { return iter(this.folders); }
    getFoldersByName(n) { return iter(this.folders.filter(f => f.name === n)); }
    getFilesByName(n) { return iter(this.files.filter(f => f.name === n)); }
    getFiles() { return iter(this.files); }
    createFolder(n) { const f = new FFolder(String(n), this); this.folders.push(f); return f; }
    createFile(a, content, mime) {
      const f = typeof a === "string" ? new FFile(a, Buffer.from(String(content), "utf8"), mime) : new FFile(a.name, a.bytes, "application/octet-stream");
      this.files.push(f); return f;
    }
  }
  const DRIVE = new FFolder("My Drive", null);
  const props = {}, logs = [];
  const sandbox = {
    console: { log: (...a) => logs.push(a.join(" ")) },
    JSON, Math, String, Number, Object, Array, Error, RegExp, encodeURIComponent, decodeURIComponent,
    Date: class extends Date { static now() { return clock.now; } },
    DriveApp: {
      getFolderById(id) { const f = ALL.find(x => x.id === id); if (!f) throw new Error("No item with the given ID could be found"); return f; },
      getFoldersByName(n) { return iter(ALL.filter(f => f.name === n && f !== DRIVE)); },
      createFolder(n) { return DRIVE.createFolder(n); }
    },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => (k in props ? props[k] : null), setProperty(k, v) { props[k] = String(v); return this; } }) },
    Utilities: {
      getUuid: () => crypto.randomUUID(),
      base64Decode: s => Buffer.from(String(s), "base64"),
      base64Encode: b => Buffer.from(b).toString("base64"),
      newBlob: (bytes, mime, name) => blob(bytes, mime, name)
    },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    ContentService: { MimeType: { JSON: "json" }, createTextOutput: s => ({ s, setMimeType() { return this; }, getContent() { return this.s; } }) },
    ScriptApp: { getService: () => ({ getUrl: () => G.url }) }
  };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: "AoG-Studio-Locker.gs" });
  const G = {
    url: opts.url || "", clock, logs, props, sandbox,
    run(fn) { const n = logs.length; sandbox[fn](); return logs.slice(n); },
    get(params) { return JSON.parse(sandbox.doGet({ parameter: params || {} }).getContent()); },
    post(body) { return JSON.parse(sandbox.doPost({ postData: { contents: typeof body === "string" ? body : JSON.stringify(body) } }).getContent()); },
    root() { const id = props.FOLDER_ID; return id ? ALL.find(f => f.id === id) : null; },
    drive: DRIVE,
    /* the live (not trashed) folders inside a folder */
    live(f) { return (f || G.root()).folders.filter(x => !x.isTrashed()); }
  };
  return G;
};
