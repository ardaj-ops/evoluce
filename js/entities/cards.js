// js/entities/cards.js – vylepšení (karty): 25 druhů × 5 vzácností, jména a popisy účinků, nabídka podle štěstí a vlny
const RAR=['Běžná','Neobvyklá','Vzácná','Epická','Legendární'],RCOL=['#9aa3c7','#5cffa8','#4dd2ff','#c86bff','#ffd27a'],RW=[60,25,10,4,1];
const UP={
 dmg:{g:'Útok',n:['Naostřená munice','Sílící údery','Krvavé hrany','Katův rozsudek','Hněv bohů'],v:[8,14,22,34,55],t:v=>`+${v} % poškození všech zbraní`,f:(u,v)=>{u.dmg*=1+v/100}},
 rate:{g:'Útok',n:['Pohotové ruce','Bojový rytmus','Horečný tanec','Bouře oceli','Čas se zastavil'],v:[8,14,22,32,48],t:v=>`+${v} % rychlost útoku`,f:(u,v)=>{u.rate*=1+v/100}},
 crit:{g:'Útok',n:['Čich na slabiny','Lovcovo oko','Vražedný instinkt','Chirurg smrti','Osudový zásah'],v:[5,9,14,20,30],t:v=>`+${v} % šance na kritický zásah`,f:(u,v)=>{u.crit+=v/100}},
 critd:{g:'Útok',n:['Těžší rána','Rozdrcené kosti','Roztříštění','Dobití','Poslední slovo'],v:[20,35,55,80,120],t:v=>`kritický zásah dává o ${v} % víc poškození`,f:(u,v)=>{u.critd+=v/100}},
 boss:{g:'Útok',n:['Lovec obrů','Zabiják titánů','Kat velikánů','Pán zrůd','Bohoborec'],v:[10,18,28,42,65],t:v=>`+${v} % poškození bossům`,f:(u,v)=>{u.boss*=1+v/100}},
 burn:{g:'Živly',n:['Zápalná jiskra','Žhavé hroty','Plamenné zásahy','Peklo na zemi','Spálená země'],v:[2,4,7,11,18],t:v=>`zásahy zapálí: ${v} poškození za sekundu po dobu 3 s`,f:(u,v)=>{u.burn+=v}},
 slow:{g:'Živly',n:['Studený dotek','Mrazivé hroty','Ledové zásahy','Zimní smrt','Věčná zima'],v:[10,16,24,34,48],t:v=>`zásahy zpomalí nepřátele o ${v} % na 2 s`,f:(u,v)=>{u.slow=Math.min(.75,u.slow+v/100)}},
 pierce:{g:'Střelné',r:1,n:['Hrotová munice','Průrazná špička','Wolframové jádro','Duchovní střela','Střela bez konce'],v:[1,1,2,2,3],t:v=>`střely probijí o ${v} nepřátel víc`,f:(u,v)=>{u.pierce+=v}},
 multi:{g:'Střelné',r:1,n:['Širší záběr','Dvojitá hlaveň','Smršť střel','Dělová salva','Kaskáda'],v:[1,1,1,2,2],t:v=>`+${v} projektil${v>1?'y':''} na výstřel`,f:(u,v)=>{u.multi+=v}},
 blast:{g:'Střelné',r:1,n:['Výbušná špička','Střepinová munice','Tříštivá munice','Granátové jádro','Dělostřelecký úder'],v:[1.2,1.6,2.1,2.7,3.5],t:v=>`střely vybuchují v okruhu ${v} m (60 % poškození)`,f:(u,v)=>{u.blast=Math.max(u.blast,v)}},
 mag:{g:'Munice',r:1,n:['Větší zásobník','Prodloužená schránka','Bubnový zásobník','Dvojitý zásobník','Bezedný zásobník'],v:[15,25,40,60,100],t:v=>`+${v} % kapacita zásobníku`,f:(u,v)=>{u.mag*=1+v/100}},
 res:{g:'Munice',r:1,n:['Přidaná munice','Patrontaška','Zásobovací vak','Muniční sklad','Arzenál'],v:[20,35,55,80,130],t:v=>`+${v} % rezervní munice`,f:(u,v)=>{u.res*=1+v/100}},
 rld:{g:'Munice',r:1,n:['Nacvičené nabíjení','Pohotový zásobník','Bleskové dobití','Rychlé ruce','Okamžité nabití'],v:[12,20,32,45,65],t:v=>`+${v} % rychlost přebíjení`,f:(u,v)=>{u.rld*=1+v/100}},
 thrift:{g:'Munice',r:1,n:['Šetrná střelba','Úsporný režim','Poslední náboj','Kouzelný zásobník','Nevyčerpatelný'],v:[8,14,22,32,45],t:v=>`${v} % šance, že výstřel nespotřebuje náboj`,f:(u,v)=>{u.thr=1-(1-u.thr)*(1-v/100)}},
 reach:{g:'Útok',m:1,n:['Delší rukojeť','Prodloužené ostří','Mistr vzdálenosti','Dlouhý stín','Dosah legend'],v:[8,14,22,32,45],t:v=>`+${v} % dosah chladných zbraní`,f:(u,v)=>{u.reach*=1+v/100}},
 hp:{g:'Obrana',n:['Hrubá kůže','Těžká zbroj','Obří srdce','Nezlomný','Titánův základ'],v:[15,25,40,60,90],t:v=>`+${v} max. životů a vyléčení o stejnou hodnotu`,f:(u,v,p)=>{p.mhp+=v;p.hp=Math.min(p.mhp,p.hp+v)}},
 regen:{g:'Obrana',n:['Rychlé hojení','Obvaz za pochodu','Regenerace buněk','Fénixův dech','Věčný život'],v:[.5,1,1.6,2.4,4],t:v=>`+${v} života za sekundu`,f:(u,v)=>{u.regen+=v}},
 shield:{g:'Obrana',n:['Zvyk uhýbat','Bojový reflex','Hbitost','Stín bez dotyku','Mezi údery'],v:[.1,.18,.28,.4,.6],t:v=>`po zásahu +${v} s nezranitelnosti`,f:(u,v)=>{u.shield+=v}},
 armor:{g:'Obrana',n:['Kožený kabátec','Kroužková zbroj','Plátový krunýř','Dračí šupiny','Neprostupná zeď'],v:[5,9,14,20,30],t:v=>`−${v} % přijímaného poškození`,f:(u,v)=>{u.armor=1-(1-u.armor)*(1-v/100)}},
 revive:{g:'Obrana',mt:2,n:['—','—','Druhá šance','Fénixovo pírko','Návrat z říše mrtvých'],v:[0,0,1,1,2],t:v=>`po smrti vstaneš s polovinou životů (${v}×)`,f:(u,v)=>{u.rev+=v}},
 speed:{g:'Pohyb',n:['Lehká obuv','Poutníkův krok','Vítr v patách','Rychlost blesku','Bleskový pohyb'],v:[5,9,14,20,30],t:v=>`+${v} % rychlost pohybu`,f:(u,v)=>{u.spd*=1+v/100}},
 dashcd:{g:'Pohyb',n:['Nacvičený úskok','Pružné nohy','Bleskový úskok','Nepolapitelný','Fantomový krok'],v:[10,18,28,40,55],t:v=>`−${v} % čekání na dash`,f:(u,v)=>{u.cdash*=1-v/100}},
 vamp:{g:'Přežití',n:['Krvavá odměna','Hladový meč','Pijavice','Upíří pakt','Hostina smrti'],v:[1,2,3,5,8],t:v=>`+${v} životů za každé zabití`,f:(u,v)=>{u.vamp+=v}},
 exec:{g:'Exekuce',n:['Zkušený kat','Ostrá exekuce','Rána z milosti','Mistr poprav','Smrtící finále'],v:[5,8,12,16,22],t:v=>`exekuce bossů už od ${20+v} % jeho životů`,f:(u,v)=>{u.xth+=v/100}},
 luck:{g:'Štěstí',n:['Štěstí v neštěstí','Šťastná hvězda','Osudová karta','Boží přízeň','Kostka je vržena'],v:[10,18,28,40,60],t:v=>`lepší šance na vzácné karty (+${v} % štěstí)`,f:(u,v)=>{u.luck+=v}}};
const UPK=Object.keys(UP);
function cardInfo(k){const a=String(k).split(':'),t=UP[a[0]],r=a[1]|0;if(!t||r<0||r>4)return null;return{id:a[0],tier:r,name:t.n[r],rar:RAR[r],col:RCOL[r],desc:t.t(t.v[r]),grp:t.g}}
// nabídka karet: hráč dostane jen karty, které dávají smysl jeho zbrani; vzácnost závisí na štěstí a vlně
function genOffer(p,n){const mel=!!WP[p.wp].mel,ok=UPK.filter(k=>!(UP[k].r&&mel)&&!(UP[k].m&&!mel)),out=[];
 for(let i=0;i<n&&ok.length>out.length;i++){let id;do{id=ok[R()*ok.length|0]}while(out.some(o=>o.startsWith(id+':')));
  const w=RW.map((x,j)=>x*(1+(p.u.luck/100+st.wave*.04)*j));let u=R()*w.reduce((a,b)=>a+b,0),t=0;for(;t<4;t++){u-=w[t];if(u<=0)break}t=Math.max(t,UP[id].mt||0);out.push(id+':'+t)}
 return out}
function applyCard(p,k){const a=String(k).split(':'),t=UP[a[0]],r=a[1]|0;if(!t||r<0||r>4)return;const m0=magMax(p),r0=resMax(p);t.f(p.u,t.v[r],p);p.cards.push(k);
 if(WP[p.wp].am){p.am+=Math.max(0,magMax(p)-m0);p.rs+=Math.max(0,resMax(p)-r0)}}
