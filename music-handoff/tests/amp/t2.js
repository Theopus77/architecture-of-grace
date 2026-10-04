const L=require("./lab.js"), {AMP}=L;
const kinds={guitar:["clean","blues","chime","crunch","lead","high","groove"], bass:["btube","bclean","bdrive","bvint"]};
for(const [kind, ids] of Object.entries(kinds)){
  for(const id of ids){
    const row=[];
    for(const g of [0,2.5,5,7.5,10]){
      const st=AMP.normalize({model:id, k:{gain:g}}, kind), P=AMP.coreParams(st, kind);
      row.push((100*L.thd(P, kind==="bass"?55:110, 0.3)).toFixed(1).padStart(6));
    }
    console.log(kind.padEnd(6), id.padEnd(7), "THD % at gain 0 2.5 5 7.5 10:", row.join(""));
  }
}
