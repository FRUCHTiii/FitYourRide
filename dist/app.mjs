import {FOOT_PROFILES,BAR_SCALES,HARDWARE,CALIBRATION_REVISION} from './ride-calibration.mjs';
import {evaluateFit,recommend,scalePosition,barPolygon,suggestTrainerLift} from './fit-model.mjs';
const $=id=>document.getElementById(id);
const fmt=n=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:1,minimumFractionDigits:1}).format(Math.abs(n)<0.05?0:n);
const signed=n=>(n>0.05?'+':'')+fmt(n);
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
let mode='frame',activeFoot='medium',latest=null;
const fields=[
 ['trainer-fields','trainerLift','Traineranhebung',0,0,100],
 ['frame-fields','stack','Stack',560,200,1000],['frame-fields','reach','Reach',385,100,800],['frame-fields','head','Lenkwinkel',73,45,89,'°'],['saddle-fields','seatAngle','Sitzrohrwinkel (Geometrie)',null,45,89,'°'],
 ['cockpit-fields','cover','Steuersatzabdeckung',10,0,100],['cockpit-fields','spacers','Spacer',20,0,150],['cockpit-fields','stemStack','Vorbau-Klemmhöhe',40,1,100],['cockpit-fields','stem','Vorbaulänge',100,1,250],['cockpit-fields','angle','Vorbauwinkel',-6,-60,60,'°'],
 ['reach-fields','bikeBarReach','Lenker-Reach am Zielrad',null,0,200],
 ['hand-fields','bikeHandX','Handpunkt ΔX',null,-100,300],['hand-fields','bikeHandY','Handpunkt ΔY',null,-150,150],
 ['direct-fields','directX','Reach am Messpunkt',null,100,1000],['direct-fields','directY','Stack am Messpunkt',null,200,1200],
 ['saddle-fields','height','Sattelhöhe bis Referenzpunkt',null,300,1200],['saddle-fields','postSetback','Stützen-Setback horizontal',0,-100,100],['saddle-fields','setback','Setback am Referenzpunkt · optional',null,-250,450,'mm',false],['saddle-fields','saddleAngle','Sattelneigung · manuell einstellen',null,-30,30,'°',false],
 ['equipment-fields','width','Lenkerbreite am Ride',null,250,550,'mm',false],['equipment-fields','crank','Kurbel am Zielrad',null,120,220,'mm',false],['equipment-fields','rideCrank','Kurbel am Ride',HARDWARE.crank,120,220,'mm',false],
];
for(const [parent,id,label,value,min,max,unit='mm',required=true] of fields){
 const wrap=el('div','field'),l=el('label',null,label);wrap.id=id+'-field';l.htmlFor=id;const h=el('div','input-wrap'),input=el('input');
 Object.assign(input,{id,name:id,type:'number',step:'any',min,max,required});if(value!==null)input.value=value;else input.placeholder='—';h.append(input,el('span','unit',unit));wrap.append(l,h);$(parent).append(wrap);
}
function syncMode(){
 $('frame-mode').hidden=mode!=='frame';$('direct-mode').hidden=mode!=='direct';
 $('mode-frame').setAttribute('aria-pressed',String(mode==='frame'));$('mode-direct').setAttribute('aria-pressed',String(mode==='direct'));
 const hoods=$('point').value==='hoods',reach=$('point').value==='reach';$('reach-inputs').hidden=!reach;$('hand-inputs').hidden=!hoods;$('saddle-inputs').hidden=!$('includeSaddle').checked;
 $('direct-legend').textContent=(hoods?'Handposition':'Lenkerklemmmitte')+' ab Tretlager';
 $('point-hint').textContent=reach?'Gleicht die Reach-Differenz zum Ride horizontal aus; die Handposition wird angenähert.':hoods?'Definierter Handpunkt: gemessener Offset oder eindeutig definierte effektive Maße.':'Überträgt die Klemmmitte; eine identische Handposition ist damit nicht bestimmt.';
 const geometry=$('saddleMode').value==='geometry';$('postSetback-field').hidden=!geometry;$('seatAngle-field').hidden=!geometry;$('setback-field').hidden=geometry;
 $('saddle-hint').textContent=geometry?'Geometrische Näherung aus Sitzwinkel, Stützenversatz und Sattelaufbau. Individuellen Setback anschließend prüfen.':'Höhe und Setback bis zum selben Referenzpunkt messen. Setback positiv hinter dem Tretlager. Ohne Setback: Klemmposition möglichst 0, Schienen mittig.';
 for(const [,id] of fields)$(id).disabled=Boolean($(id).closest('[hidden]'));
 $('heightType').disabled=!$('includeSaddle').checked;
}
function read(){return {...Object.fromEntries(fields.map(([,id])=>[id,$(id).disabled||$(id).value.trim()===''?null:$(id).valueAsNumber])),mode,point:$('point').value,heightType:$('heightType').value,includeSaddle:$('includeSaddle').checked,saddleMode:$('saddleMode').value};}
function message(text,warn=false){$('messages').append(el('p','message'+(warn?' warn':''),text));}
function metric(label,value,detail){const n=el('div','metric');n.append(el('span','metric-label',label));const v=el('span','metric-value',fmt(value));v.append(el('small',null,'mm'));n.append(v,el('span','metric-detail',detail));$('metrics').append(n);}
function scaleText(frac,travel){const p=scalePosition(frac,travel);if(!p)return 'Außerhalb A–X';return p.letter+(p.rest<0.05?'':` + ${fmt(p.rest)} mm → ${p.next}`);}
function row(parent,label,value,sub){const r=el('div','setting-row');r.append(el('span',null,label));const n=el('strong',null,value);if(sub)n.append(el('br'),el('small',null,sub));r.append(n);parent.append(r);}
function rail(parent,value){const t=el('div','scale-track'),dot=el('i');dot.style.left=`${Math.max(0,Math.min(1,value))*100}%`;t.append(dot);const labels=el('div','scale-labels');labels.append(el('span',null,'A'),el('span',null,'X'));parent.append(t,labels);}
function saddleScaleText(fraction){
 const value=Math.max(0,Math.min(23,Math.round(fraction*23*100)/100)),index=Math.floor(value),rest=value-index;
 return String.fromCharCode(65+index)+(rest<.01||index===23?'':` + ${Math.round(rest*100)} % → ${String.fromCharCode(66+index)}`);
}
function movement(n,positive,negative){return Math.abs(n)<.05?'0,0 mm':`${fmt(Math.abs(n))} mm ${n>0?positive:negative}`;}
function renderSettings(r,p,t,v){
 $('adjustments').replaceChildren();$('messages').replaceChildren();
 const scope=t.saddle?'Cockpit + Sattel':'Cockpit';
 $('fit-status').replaceChildren(el('p','status-line'+(r.reachable?'':' bad'),`${scope}: ${r.reachable?(r.approximate?'Näherung im einstellbaren Bereich':r.ready?'im kalibrierten Bereich':'im vorläufigen Bereich'):'Ziel nicht vollständig abgedeckt'}`));
 $('active-foot').textContent=p.label;
 const bar=el('div','setting-group');bar.append(el('h3',null,'Lenker'));
 if(r.bar.status==='reachable'){
  row(bar,'Auszug',scaleText(r.bar.u,BAR_SCALES.reachTravel),`${fmt(r.bar.u*BAR_SCALES.reachTravel)} mm ab A`);rail(bar,r.bar.u);
  row(bar,'Höhe',scaleText(r.bar.v,BAR_SCALES.heightTravel),`${fmt(r.bar.v*BAR_SCALES.heightTravel)} mm ab A`);rail(bar,r.bar.v);
 }else if(r.bar.status==='outside'){
  row(bar,'Abstand zum Bereich',`${fmt(r.bar.distance)} mm`);
  bar.append(el('p','hint',`Am nächsten Randpunkt: ΔX ${signed(r.bar.residual.x)} / ΔY ${signed(r.bar.residual.y)} mm.`));
 }else bar.append(el('p','message warn','Lenker-/Hood-Kalibrierung fehlt.'));
 if(r.widthRequested)row(bar,'Lenkerbreite',`${fmt(v.width)} mm`,r.widthOK?'Fouriers-Skala':'Außerhalb 320–440 mm');
 $('adjustments').append(bar);
 if(t.saddle){
  const saddle=el('div','setting-group');saddle.append(el('h3',null,t.saddleMode==='geometry'?'Sattel · Geometrie-Referenz':'Sattel · Messposition'));
  if(Number.isFinite(t.saddleAngle))row(saddle,'Zielneigung',`${signed(t.saddleAngle)}°`,'Manuell einstellen; Position danach kontrollieren');
  if(r.saddle.status==='reachable'){
   const m=r.saddle.moves;
   row(saddle,'A · Stützenhöhe',saddleScaleText(m.height),'Prozent zwischen zwei Skalenstrichen');
   row(saddle,'B · Klemmposition',m.clamp===0?'0':`+${m.clamp}`,m.clamp>=40?'Klemmkopf gedreht montieren':'Klemmkopf in Grundorientierung');
   row(saddle,'C · Sattelschienen',movement(m.rail,'nach vorne','nach hinten'),'Horizontal ab Mitte des vermessenen Klemmbereichs');
   row(saddle,'Schienenstellung',`${Math.round(r.saddle.railFraction*100)} %`,'0 % = Sattel ganz hinten · 100 % = ganz vorne');
   saddle.append(el('p','hint','Ausgangseinstellung: Setback und Neigung einstellen, danach schräge Sattelhöhe und Setback am Referenzpunkt kontrollieren.'));
  }else saddle.append(el('p','message warn',r.saddle.status==='missing'?'Sattelkalibrierung fehlt.':'Keine der vier Klemmpositionen deckt die Sattelmaße innerhalb A–X und des vermessenen Schienenwegs ab.'));
  $('adjustments').append(saddle);
 }
 $('adjustments').classList.toggle('single',!t.saddle);
 if(r.trainerLift>0){
  row(bar,'Trainer anheben',`${fmt(r.trainerLift)} mm`,`Vorwärtsneigung ca. ${fmt(r.tiltDegrees)}°`);
  message('Anhebung rechnerisch geschätzt. Lenker, Hoods und Sattel werden mitgedreht. Gleichmäßige, standsichere Unterlage verwenden und Zielposition am Aufbau prüfen.');
 }
 if(t.approximate){
  row(bar,'Reach-Ausgleich',`${signed(t.reachDelta)} mm`,`${fmt(v.bikeBarReach)} − ${fmt(HARDWARE.handlebarReach)} mm`);
  message('Näherung: vergleichbare Griffmontage und Lenkerrotation vorausgesetzt. Klemmhöhe bleibt gleich; vertikale Handposition nicht abgeglichen.');
 }
 if(t.crankDelta!==null&&Math.abs(t.crankDelta)>.01)message(`Kurbelabweichung Ride − Zielrad: ${signed(t.crankDelta)} mm. Pedalkreis nicht identisch.`,true);
 if(t.hand&&!r.widthCalibrated)message('Hood-Offset für diese Breite nicht bestätigt.',true);
 if(t.hand&&p.hand?.status==='demo')message('Handposition verwendet einen Ride-Hood-Dummywert.',true);
 if(t.hand&&p.hand?.status==='provisional')message('Hood-Offset bei 400 mm gemessen; Übertragung noch vorläufig.',true);
 if(t.saddle)message('Sattel: Näherung mit 52 mm Aufbau. Einfluss von Neigung und Schienenstellung auf die Höhe nicht vermessen.');
 if(!r.widthOK)message('Lenkerbreite außerhalb 320–440 mm.',true);
 const coordinates=[];
 if(r.clamp)coordinates.push(`Ride-Klemmmitte X ${fmt(r.clamp.x)} / Y ${fmt(r.clamp.y)} mm`);
 if(t.saddle&&(!t.heightOnly||r.saddle.status==='reachable'))coordinates.push(`Sattel X ${signed(t.saddle.x)} / Y ${fmt(t.saddle.y)} mm`);
 if(coordinates.length)message(coordinates.join(' · '));
}
function renderFeet(result){
 $('foot-profiles').replaceChildren();$('scope-label').textContent=$('includeSaddle').checked?'Cockpit + Sattel':'Nur Cockpit';
 for(const p of FOOT_PROFILES){
  const r=result?.profiles.find(r=>r.id===p.id),button=el('button','foot-card');button.type='button';button.setAttribute('aria-pressed',String(p.id===activeFoot));button.setAttribute('aria-label',p.footHeight===null?p.label:`${p.label}, ${fmt(p.footHeight)} Millimeter`);
  button.append(el('strong',null,p.label));if(p.id===activeFoot)button.append(el('span','foot-check','✓'));
  const h=el('span','foot-size',p.footHeight===null?'—':fmt(p.footHeight));if(p.footHeight!==null)h.append(el('small',null,' mm'));button.append(h,el('span','foot-status '+(r?.reachable?'good':'bad'),!r?'Maße ergänzen':r.reachable?'Im Bereich':'Nicht abgedeckt'));
  button.onclick=()=>{activeFoot=p.id;update();};$('foot-profiles').append(button);
 }
 $('recommendation').replaceChildren();if(!result)return;
 const preferred=recommend(result.profiles,activeFoot);
 if(!preferred)$('recommendation').append(el('span',null,'Kein Fuß deckt die gewählten Ziele vollständig ab.'));
 else if(preferred.id===activeFoot)$('recommendation').append(el('span',null,'Gewählter Fuß deckt die berechneten Ziele ab.'));
 else {const name=FOOT_PROFILES.find(p=>p.id===preferred.id).label;const b=el('button',null,`${name} verwenden →`);b.type='button';b.onclick=()=>{activeFoot=preferred.id;update();};$('recommendation').append(b);}
}
const ns='http://www.w3.org/2000/svg';
function svg(tag,attrs,text){const n=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));if(text!==undefined)n.textContent=text;return n;}
function draw(t,r,p){
 const root=$('plot');root.replaceChildren();const axisFont=Math.max(17,12*800/Math.max(280,root.clientWidth)),pointFont=Math.max(21,13*800/Math.max(280,root.clientWidth));const poly=p.handlebar?barPolygon(p.handlebar):[];
 const targetBar=r.clamp,pts=[{x:0,y:0},...[t.saddle].filter(Boolean),...poly,...[targetBar,t.hand,t.frame].filter(Boolean)];
 const minX=Math.min(-280,...pts.map(p=>p.x))-75,maxX=Math.max(650,...pts.map(p=>p.x))+85,maxY=Math.max(830,...pts.map(p=>p.y))+95;
 const scale=Math.min(690/(maxX-minX),465/(maxY+65)),offX=(800-(maxX-minX)*scale)/2,offY=(580-(maxY+65)*scale)/2;
 const xy=v=>({x:offX+(v.x-minX)*scale,y:580-offY-(v.y+65)*scale});
 const line=(a,b,stroke,width=1,dash)=>{a=xy(a);b=xy(b);const at={x1:a.x,y1:a.y,x2:b.x,y2:b.y,stroke,'stroke-width':width};if(dash)at['stroke-dasharray']=dash;root.append(svg('line',at));};
 root.append(svg('title',{},'Zielposition und Lenkerbereich des gewählten Fußes'),svg('desc',{},`${t.saddle?'Sattel X '+fmt(t.saddle.x)+', Y '+fmt(t.saddle.y)+' Millimeter. ':''}${p.label}. ${r.reachable?'Ziel im Modell erreichbar.':'Ziel nicht vollständig erreichbar.'}`));
 const step=Math.max(100,Math.ceil(maxY/1400)*100);
 for(let y=0;y<=maxY-50;y+=step)line({x:minX+35,y},{x:maxX-25,y},'#304841');
 for(let x=Math.ceil((minX+35)/step)*step;x<=maxX-25;x+=step)line({x,y:0},{x,y:maxY-50},'#304841');
 line({x:minX+35,y:0},{x:maxX-25,y:0},'#60776a');line({x:0,y:0},{x:0,y:maxY-50},'#60776a');
 for(let y=200;y<=maxY-60;y+=200){const q=xy({x:0,y});root.append(svg('text',{x:q.x-10,y:q.y-6,fill:'#a3baa7','font-size':axisFont,'text-anchor':'end'},String(y)));}
 for(let x=200;x<=maxX-80;x+=200){const q=xy({x,y:0});root.append(svg('text',{x:q.x,y:q.y+26,fill:'#a3baa7','font-size':axisFont,'text-anchor':'middle'},String(x)));}
 if(t.seatAngle){const a=t.seatAngle*Math.PI/180;line({x:0,y:0},{x:-780*Math.cos(a),y:780*Math.sin(a)},'#829485',1.5,'4 7');}
 if(poly.length)root.append(svg('polygon',{points:poly.map(v=>{const q=xy(v);return `${q.x},${q.y}`;}).join(' '),fill:'#83c9bd','fill-opacity':'.14',stroke:'#83c9bd','stroke-width':1.8}));
 if(targetBar&&t.saddle){line({x:0,y:0},t.saddle,'#8ba96a',2.5);line(t.saddle,targetBar,'#8ba96a',1.5,'5 7');}
 if(t.frame){line({x:0,y:0},t.frame,'#71876b',2.5);line(t.frame,t.steerer,'#dcf77a',4);line(t.steerer,t.targetClamp||t.clamp,'#dcf77a',4);}
 if(t.approximate&&t.targetClamp&&targetBar)line(t.targetClamp,targetBar,'#edb77b',2,'5 5');
 if(t.hand&&targetBar)line(targetBar,t.hand,'#dcf77a',3);
 const mark=(v,label,dx,dy,color='#dcf77a',radius=6)=>{const q=xy(v);root.append(svg('circle',{cx:q.x,cy:q.y,r:radius,fill:color,stroke:'#182f2c','stroke-width':2}));if(label)root.append(svg('text',{x:q.x+(q.x>665?-12:dx),y:q.y+dy,fill:'#f0f6df','font-size':pointFont,'font-weight':500,'text-anchor':q.x>665?'end':'start'},label));};
 if(t.saddle){mark(t.saddle,'Sattel ≈',-24,-20);const a=(t.saddleAngle??0)*Math.PI/180;line({x:t.saddle.x-55*Math.cos(a),y:t.saddle.y-55*Math.sin(a)},{x:t.saddle.x+55*Math.cos(a),y:t.saddle.y+55*Math.sin(a)},'#dcf77a',4);}if(t.hand)mark(t.hand,'Hand',10,-17);if(targetBar)mark(targetBar,t.hand?null:t.approximate?'Ride-Klemmmitte ≈':'Lenker',12,-16);
 if(targetBar){const q=xy(targetBar);root.append(svg('circle',{cx:q.x,cy:q.y,r:11,fill:'none',stroke:'#dcf77a','stroke-width':1.5}));}
 if(r.bar.status==='outside'&&targetBar){line(targetBar,r.bar.achieved,'#edb77b',2,'5 5');mark(r.bar.achieved,null,0,0,'#edb77b',5);}
 mark({x:0,y:0},'Tretlager',15,5,'#e0ebd7',8);
 const yt=xy({x:0,y:maxY-25});root.append(svg('text',{x:yt.x-10,y:yt.y,fill:'#adc2af','font-size':axisFont,'text-anchor':'end'},'Y · mm'));
 const xt=xy({x:maxX-15,y:0});root.append(svg('text',{x:xt.x,y:xt.y-12,fill:'#adc2af','font-size':axisFont,'text-anchor':'end'},'X · mm'));
}
function displayTarget(result,r){
 const t=result.target;
 if(!t.heightOnly||r.saddle.status!=='reachable')return t;
 const saddle=r.saddle.target;
 return {...t,saddle,drop:saddle.y-(t.hand||t.clamp).y};
}
function update(){
 syncMode();$('errors').hidden=true;$('lift-suggestions').replaceChildren();
 try{
  let invalid=false;for(const [,id] of fields){const n=$(id),bad=!n.disabled&&!n.validity.valid;n.setAttribute('aria-invalid',String(bad));if(bad)invalid=true;}
  if(invalid)throw new Error('Markierte Maße ergänzen oder korrigieren.');
  const v=read(),result=evaluateFit(v,FOOT_PROFILES),r=result.profiles.find(r=>r.id===activeFoot),p=r.effectiveProfile,t=displayTarget(result,r);
  latest={...result,selectedFoot:activeFoot,input:v,calibrationRevision:CALIBRATION_REVISION};
  $('result-content').hidden=false;renderFeet(result);renderSettings(r,p,t,v);draw(t.heightOnly&&r.saddle.status!=='reachable'?{...t,saddle:null}:t,r,p);$('metrics').replaceChildren();
  metric(t.approximate?'Ride-Klemmmitte X ≈':t.hand?'Hand-Reach':'Lenker-Reach',(t.hand||t.clamp).x,'X ab Tretlager');
  metric(t.approximate?'Ride-Klemmmitte Y':t.hand?'Hand-Stack':'Lenker-Stack',(t.hand||t.clamp).y,'Y ab Tretlager');
  if(t.saddle&&(!t.heightOnly||r.saddle.status==='reachable'))metric('Überhöhung ≈',t.drop,'Sattel − Cockpit');
  $('metrics').classList.toggle('two',!t.saddle);
  $('result-state').textContent=r.approximate?'Näherung':p.status==='demo'?'DEMO':r.ready?'Kalibriert':'Vorläufig';
  $('print').disabled=false;
 }catch(error){latest=null;$('errors').textContent=error.message;$('errors').hidden=false;$('result-content').hidden=true;$('print').disabled=true;renderFeet(null);}
}
$('bike-form').addEventListener('input',update);
$('bike-form').addEventListener('change',update);
$('bike-form').addEventListener('submit',event=>event.preventDefault());
$('suggest-lift').addEventListener('click',()=>{
 update();if(!latest)return;
 const target=$('lift-suggestions');
 target.append(el('p','hint','Suche 0–100 mm je Fuß im 1-mm-Raster, anschließend verfeinert. Vorschlag rechnerisch geschätzt.'));
 for(const p of FOOT_PROFILES){
  const suggestion=suggestTrainerLift(latest.input,p),line=el('p','message');
  if(suggestion.status==='found'){
   const b=el('button','button quiet',`${p.label}: ${fmt(suggestion.height)} mm übernehmen`);b.type='button';
   b.onclick=()=>{activeFoot=p.id;$('trainerLift').value=suggestion.height;update();};line.append(b);
  }else line.textContent=`${p.label}: Im Suchraster bis 100 mm keine passende Gesamtposition gefunden.`;
  target.append(line);
 }
});
for(const m of ['frame','direct'])$('mode-'+m).addEventListener('click',()=>{mode=m;update();});
$('print').addEventListener('click',()=>{
 if(!latest)return;const v=latest.input;
 const pairs=fields.filter(([,id])=>!$(id).disabled&&v[id]!==null).map(([,id,label,,,,unit='mm'])=>`${label} ${fmt(v[id])} ${unit}`);
 $('print-meta').textContent=`${new Date().toLocaleString('de-DE')} · ${mode==='frame'?'Geometrie & Vorbau':'Direkte Maße'} · ${v.point==='hoods'?'Hoods':v.point==='reach'?'Lenker-Reach · Näherung':'Klemmmitte'} · ${v.includeSaddle?(v.saddleMode==='geometry'?'Sitzwinkel-Simulation':'Sattel-Messwerte')+' ('+(v.heightType==='radial'?'diagonal':'senkrecht')+')':'Nur Cockpit'} · ${CALIBRATION_REVISION}\n${pairs.join(' · ')}`;window.print();
});
window.addEventListener('resize',()=>{if(latest){const r=latest.profiles.find(p=>p.id===activeFoot);const t=displayTarget(latest,r);draw(t.heightOnly&&r.saddle.status!=='reachable'?{...t,saddle:null}:t,r,r.effectiveProfile);}});
$('demo-banner').hidden=true;
update();
