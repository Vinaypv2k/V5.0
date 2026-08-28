import {TUBULAR_LIBRARY} from "./data/tubular-library.js";
import {U,fromBase,toBase,capacity} from "./units.js";
import {componentCalc,tallyCalc} from "./modules/string-bha.js";
import {bodyArea,strength} from "./modules/tubular-strength.js";
import {fishingLoads} from "./modules/fishing-loads.js";

const $=id=>document.getElementById(id),F=x=>Number(x).toLocaleString(undefined,{maximumFractionDigits:3});
let mode="oil",selected=null,tally=[],lastAllow=0,reports=[];
const unit=t=>U[mode][t];

document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>{document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));b.classList.add("active");$(b.dataset.p).classList.add("active")});
$("system").onchange=()=>{mode=$("system").value;renderUnits();renderSelected();renderTally()};

function uniq(a){return [...new Set(a)]}
function populateCategories(){
 $("category").innerHTML=uniq(TUBULAR_LIBRARY.map(x=>x.category)).map(x=>`<option>${x}</option>`).join("");
 populateSizes();
}
function populateSizes(){
 const cat=$("category").value, list=TUBULAR_LIBRARY.filter(x=>x.category===cat);
 $("size").innerHTML=uniq(list.map(x=>x.size)).map(x=>`<option>${x}</option>`).join("");
 populateWeights();
}
function populateWeights(){
 const list=TUBULAR_LIBRARY.filter(x=>x.category===$("category").value&&x.size===$("size").value);
 $("weight").innerHTML=list.map((x,i)=>`<option value="${x.weight}">${x.weight} lb/ft</option>`).join("");
 populateGrades();
}
function currentRecord(){
 return TUBULAR_LIBRARY.find(x=>x.category===$("category").value&&x.size===$("size").value&&String(x.weight)===String($("weight").value))||null
}
function populateGrades(){
 selected=currentRecord(); if(!selected)return;
 $("grade").innerHTML=selected.grades.map(x=>`<option>${x}</option>`).join("");
 $("connection").innerHTML=selected.connections.map(x=>`<option>${x}</option>`).join("");
 renderSelected();
}
["category","size","weight","grade","connection"].forEach(id=>$(id).onchange=()=>{if(id==="category")populateSizes();else if(id==="size")populateWeights();else if(id==="weight")populateGrades();else renderSelected()});

function renderUnits(){
 $("uLen").textContent=unit("len");$("uForce").textContent=unit("force");$("uHook").textContent=unit("force");$("uOver").textContent=unit("force");$("uAllow").textContent=unit("force");
}
function renderSelected(){
 selected=currentRecord(); if(!selected)return;
 const grade=$("grade").value||selected.grades[0],gd=selected.grade_data[grade]||{},A=bodyArea(selected.od,selected.id),yieldL=A*(gd.smys||0);
 const v=(x,t)=>F(fromBase(x,t,mode));
 $("componentName").value=`${selected.category} ${selected.size}" ${selected.weight} lb/ft ${grade} ${$("connection").value||""}`;
 $("selected").innerHTML=`<h4>Selected tubular</h4><b>${$("componentName").value}</b><br>${selected.standard}<br>${selected.source}`;
 $("dOD").textContent=`${v(selected.od,"dia")} ${unit("dia")}`;
 $("dID").textContent=`${v(selected.id,"dia")} ${unit("dia")}`;
 $("dWall").textContent=`${v(selected.wall,"dia")} ${unit("dia")}`;
 $("dDrift").textContent=selected.drift?`${v(selected.drift,"dia")} ${unit("dia")}`:"N/A";
 $("dWt").textContent=`${v(selected.weight,"lin")} ${unit("lin")}`;
 $("dSMYS").textContent=gd.smys?`${v(gd.smys,"press")} ${unit("press")}`:"Verify";
 $("dUTS").textContent=gd.uts?`${v(gd.uts,"press")} ${unit("press")}`:"Verify";
 $("dArea").textContent=`${F(A)} in²`;
 $("dYield").textContent=yieldL?`${v(yieldL,"force")} ${unit("force")}`:"Verify";
 $("dTJOD").textContent=selected.tool_joint_od?`${v(selected.tool_joint_od,"dia")} ${unit("dia")}`:"N/A";
 $("dTJID").textContent=selected.tool_joint_id?`${v(selected.tool_joint_id,"dia")} ${unit("dia")}`:"N/A";
 $("dSource").textContent=selected.standard;
 $("kTub").textContent=`${selected.category} ${selected.size}"`;
 $("kGrade").textContent=grade;$("kOD").textContent=$("dOD").textContent;$("kID").textContent=$("dID").textContent;$("kWt").textContent=$("dWt").textContent;$("kArea").textContent=$("dArea").textContent;
}
window.addSelectedTubular=()=>{
 if(!selected)return;
 const L=toBase(Number($("componentLength").value)||0,"len",mode), q=Number($("quantity").value)||1;
 if(L<=0)return alert("Enter component length.");
 const c=componentCalc(selected,L,q);
 tally.push({name:$("componentName").value,grade:$("grade").value,connection:$("connection").value,rec:selected,...c});
 renderTally();
};
function renderTally(){
 $("tallyBody").innerHTML=tally.map((x,i)=>`<tr><td>${x.name}</td><td>${x.grade}</td><td>${x.connection}</td><td>${F(fromBase(x.rec.od,"dia",mode))}</td><td>${F(fromBase(x.rec.id,"dia",mode))}</td><td>${F(fromBase(x.rec.weight,"lin",mode))}</td><td>${F(fromBase(x.totalLength,"len",mode))}</td><td>${F(fromBase(x.air,"force",mode))}</td><td>${F(fromBase(x.volume,"vol",mode))}</td><td><button onclick="removeRow(${i})">×</button></td></tr>`).join("");
 const t=tallyCalc(tally);
 $("tallyResult").innerHTML=tally.length?`<h4>Intermediate calculation steps</h4>1. Air weight = Σ(linear weight × length) = <b>${F(fromBase(t.air,"force",mode))} ${unit("force")}</b><br>2. Internal volume = Σ(ID²/1029.4 × length) = <b>${F(fromBase(t.volume,"vol",mode))} ${unit("vol")}</b><br>3. Total string length = <b>${F(fromBase(t.length,"len",mode))} ${unit("len")}</b>`:"No components added.";
}
window.removeRow=i=>{tally.splice(i,1);renderTally()};

window.calculateSelectedStrength=()=>{
 if(!selected)return alert("Select a tubular first.");
 const load=toBase(Number($("appliedLoad").value)||0,"force",mode), eff=(Number($("connectionEfficiency").value)||100)/100,df=Number($("designFactor").value)||0.8,grade=$("grade").value,r=strength(selected,grade,eff,df,load);
 lastAllow=r.allow;$("allowablePull").placeholder=F(fromBase(lastAllow,"force",mode));
 $("strengthResult").innerHTML=`<h4>Intermediate calculation steps</h4>1. Metal area = π/4 × (OD² − ID²) = <b>${F(r.A)} in²</b><br>2. Pipe-body yield = area × SMYS = <b>${F(fromBase(r.body,"force",mode))} ${unit("force")}</b><br>3. Connection-adjusted capacity = body yield × efficiency = <b>${F(fromBase(r.connection,"force",mode))} ${unit("force")}</b><br>4. Design allowable = adjusted capacity × design factor = <b>${F(fromBase(r.allow,"force",mode))} ${unit("force")}</b><br>5. Remaining axial margin = allowable − applied load = <b class="${r.margin>=0?"ok":"bad"}">${F(fromBase(r.margin,"force",mode))} ${unit("force")}</b>`;
 reports.push(`<h3>Tubular Strength</h3>${$("strengthResult").innerHTML}`);$("reportOut").innerHTML=reports.join("<hr>");
};
window.calculateFishingLoad=()=>{
 const hook=toBase(Number($("hookload").value)||0,"force",mode),over=toBase(Number($("plannedOverpull").value)||0,"force",mode),allow=toBase(Number($("allowablePull").value)||0,"force",mode)||lastAllow,r=fishingLoads(hook,over,allow);
 $("fishingResult").innerHTML=`<h4>Intermediate calculation steps</h4>1. Planned hookload = hookload + overpull = <b>${F(fromBase(r.planned,"force",mode))} ${unit("force")}</b><br>2. Allowable pull = <b>${F(fromBase(allow,"force",mode))} ${unit("force")}</b><br>3. Remaining margin = allowable − planned = <b class="${r.margin>=0?"ok":"bad"}">${F(fromBase(r.margin,"force",mode))} ${unit("force")}</b><br>4. Utilization = planned / allowable × 100 = <b>${F(r.utilization)}%</b>`;
 reports.push(`<h3>Fishing Loads</h3>${$("fishingResult").innerHTML}`);$("reportOut").innerHTML=reports.join("<hr>");
};

populateCategories();renderUnits();
