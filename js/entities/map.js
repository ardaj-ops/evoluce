// js/entities/map.js – mapa arény: překážky (sloupy, bedny, sudy) s kolizemi pro hráče, nepřátele a střely; stejná data používá server i klient
const MAPOB=[[-14,-12,2.2,'pillar'],[14,-12,2.2,'pillar'],[-14,12,2.2,'pillar'],[14,12,2.2,'pillar'],[0,-19,1.7,'crate'],[0,19,1.7,'crate'],[-22,0,1.5,'crate'],[22,0,1.5,'crate'],
 [-7,7,1.1,'barrel'],[7,-7,1.1,'barrel'],[-8,-17,1.1,'barrel'],[9,17,1.1,'barrel']];
function pushOut(o,r){for(const q of MAPOB){const dx=o.x-q[0],dz=o.z-q[1],d=hyp(dx,dz),m=q[2]+r;if(d<m){if(d>1e-6){o.x=q[0]+dx/d*m;o.z=q[1]+dz/d*m}else o.x=q[0]+m}}}
function blockedAt(x,z){for(const q of MAPOB)if(hyp(x-q[0],z-q[1])<q[2])return true;return false}
