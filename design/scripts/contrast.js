// Calcule les ratios de contraste WCAG 2.x des jetons de couleur.
const L = h => { const c = h.replace('#','').match(/../g).map(x => parseInt(x,16)/255).map(v => v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4)); return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]; };
const ratio = (a,b) => { const [x,y]=[L(a),L(b)].sort((p,q)=>q-p); return (x+0.05)/(y+0.05); };
const pairs = [
 // [jeton, couleur, fond, nom du fond, seuil]
 ['--ink','#0b0b0c','#ffffff','surface',4.5],
 ['--ink','#0b0b0c','#f5f6fd','bg',4.5],
 ['--ink-2 (texte secondaire)','#4a5072','#ffffff','surface',4.5],
 ['--ink-2 (texte secondaire)','#4a5072','#f5f6fd','bg',4.5],
 ['--navy (titres)','#1a1f4a','#f5f6fd','bg',4.5],
 ['--primary (lien/texte)','#4353df','#ffffff','surface',4.5],
 ['--primary (lien/texte)','#4353df','#f5f6fd','bg',4.5],
 ['--on-primary','#ffffff','#4353df','primary',4.5],
 ['--on-primary (survol)','#ffffff','#3341c4','primary-strong',4.5],
 ['--primary-ink (texte sur tint)','#2d3aa8','#eef0fd','primary-tint',4.5],
 ['--border-strong (bord champ)','#767c9e','#ffffff','surface',3],
 ['--focus (anneau)','#4353df','#ffffff','surface',3],
 ['--success (texte)','#1d7a5a','#ffffff','surface',4.5],
 ['--success-ink','#145c43','#e3f5ee','success-bg',4.5],
 ['--danger (texte erreur)','#b42318','#ffffff','surface',4.5],
 ['--danger-ink','#8f1c13','#fdecea','danger-bg',4.5],
 ['--on-danger','#ffffff','#b42318','danger',4.5],
 ['--grave-bloquante','#ffffff','#b42318','bloquante (plein)',4.5],
 ['--grave-majeure-ink','#7a3d00','#fdebd3','majeure-bg',4.5],
 ['--grave-majeure-border','#b35a00','#ffffff','surface',3],
 ['--grave-mineure-ink','#3d4466','#eceef5','mineure-bg',4.5],
 ['--statut-nouvelle-ink','#2d3aa8','#eef0fd','nouvelle-bg',4.5],
 ['--statut-encours-ink','#7a3d00','#fdebd3','encours-bg',4.5],
 ['--statut-corrigee-ink','#145c43','#e3f5ee','corrigee-bg',4.5],
 ['--statut-verifiee (plein)','#ffffff','#1d7a5a','success',4.5],
 ['--nav actif','#4353df','#ffffff','surface',4.5],
 ['--nav inactif','#4a5072','#ffffff','surface',4.5],
 ['Doxeva vert #29a57b (référence, non retenu en texte)','#29a57b','#ffffff','surface',4.5],
];
let ok=true; const rows=[];
for (const [n,c,b,bn,s] of pairs){ const r=ratio(c,b); const pass=r>=s; if(!pass && !n.includes('non retenu')) ok=false; rows.push(`| \`${n}\` | ${c} | ${bn} ${b} | ${r.toFixed(2)}:1 | ${s}:1 | ${pass?'OK':'ÉCHEC'} |`); }
console.log('| Jeton | Couleur | Fond | Ratio | Seuil | Résultat |\n|---|---|---|---|---|---|\n'+rows.join('\n'));
console.log('\nTOUS LES JETONS RETENUS CONFORMES :', ok);
