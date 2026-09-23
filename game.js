(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  const keys = new Set();
  const controls = new Set(['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright']);
  const furniture = [
    {x:40,y:40,w:105,h:95}, {x:783,y:39,w:132,h:76},
    {x:43,y:437,w:100,h:78}
  ];
  let state = 'title', elapsed = 0, score = 0, hearts = 3, collected = 0;
  let cuddled = false, sofaReady = false, boost = 0, immune = 0;
  let lastTime = 0, toastTime = 0, items = [], effects = [];
  let dog = {x:480,y:285,angle:0};

  function svg(tag, attrs, parent) {
    const node = document.createElementNS(NS, tag);
    for (const [key,value] of Object.entries(attrs)) node.setAttribute(key,value);
    if (parent) parent.appendChild(node);
    return node;
  }
  function decor() {
    const group = $('decor');
    group.innerHTML = `
      <g filter="url(#shadow)"><rect x="41" y="41" width="104" height="94" rx="15" fill="#aa7650"/><rect x="45" y="42" width="96" height="82" rx="13" fill="#f3e3ca"/><circle cx="93" cy="82" r="24" fill="#c48b68"/><g fill="#59775a" stroke="#46654b" stroke-width="2"><ellipse cx="78" cy="66" rx="10" ry="23" transform="rotate(-40 78 66)"/><ellipse cx="108" cy="64" rx="10" ry="25" transform="rotate(35 108 64)"/><ellipse cx="112" cy="88" rx="22" ry="10" transform="rotate(-20 112 88)"/><ellipse cx="78" cy="91" rx="23" ry="10" transform="rotate(30 78 91)"/></g></g>
      <g filter="url(#shadow)"><rect x="783" y="40" width="132" height="75" rx="10" fill="#aa7650"/><rect x="787" y="40" width="124" height="63" rx="8" fill="#c8996d"/><rect x="798" y="49" width="32" height="40" rx="3" fill="#748b79" transform="rotate(-8 814 69)"/><rect x="833" y="51" width="25" height="37" rx="3" fill="#edd4ad" transform="rotate(9 845 69)"/><circle cx="885" cy="69" r="12" fill="#fff6e7"/><circle cx="885" cy="69" r="8" fill="#84674c"/></g>
      <g filter="url(#shadow)"><rect x="43" y="437" width="100" height="78" rx="28" fill="#899c85"/><rect x="50" y="443" width="86" height="64" rx="25" fill="#c3cbb0"/><ellipse cx="93" cy="475" rx="32" ry="21" fill="#a4b393"/><path d="M78 473Q93 458 110 476" fill="none" stroke="#e2e5cc" stroke-width="3"/></g>
      <g fill="#f4e4ce" stroke="#c4a67f" stroke-width="3"><circle cx="199" cy="498" r="18"/><circle cx="244" cy="498" r="18"/></g><circle cx="199" cy="498" r="12" fill="#8ebcc1"/><circle cx="244" cy="498" r="12" fill="#b88e5e"/>
      <text x="95" y="535" text-anchor="middle" font-size="10" letter-spacing="2" fill="#8b7359">JELLY’S CORNER</text>`;
  }
  function hitsRect(x,y,r,rect) {
    const nx = Math.max(rect.x,Math.min(x,rect.x+rect.w));
    const ny = Math.max(rect.y,Math.min(y,rect.y+rect.h));
    return (x-nx)**2+(y-ny)**2 < r*r;
  }
  function free(x,y,r=25) {
    return x>=r+12 && x<=948-r && y>=r+12 && y<=548-r &&
      !furniture.some(rect=>hitsRect(x,y,r,rect));
  }
  function addItem(type) {
    let x,y,found=false;
    // Reserve the sofa corner even before it appears, and never spawn on Jelly.
    for(let attempt=0;attempt<250;attempt++) {
      x=40+Math.random()*880; y=50+Math.random()*455;
      if(free(x,y,29) && !hitsRect(x,y,35,{x:705,y:365,w:210,h:150}) &&
        Math.hypot(x-dog.x,y-dog.y)>110 && items.every(i=>Math.hypot(x-i.x,y-i.y)>67)) {found=true;break;}
    }
    if(!found) return;
    const node=svg('g',{transform:`translate(${x} ${y}) rotate(${Math.random()*70-35})`,filter:'url(#shadow)'},$('items'));
    if(type==='sock') {
      const color=['#537e79','#d06449','#e8b54c','#8e82a5'][Math.floor(Math.random()*4)];
      node.innerHTML=`<path d="M-9-17H8V1L17 5Q24 10 17 17Q12 21 5 17L-9 8Z" fill="${color}" stroke="#fff8e7" stroke-width="2.5"/><path d="M-8-10H7M-8-5H7" stroke="#fff2dc" stroke-width="3"/><path d="M11 4L5 15" stroke="#fff2dc" stroke-width="5"/>`;
    } else {
      node.innerHTML='<path d="M-16-9L-7-12L-3-18L5-13L14-13L13-4L19 3L11 8L8 16L0 12L-10 15L-11 6L-18 1Z" fill="#ae6d3f" stroke="#f7d59d" stroke-width="2"/><circle r="10" fill="#e6ae65"/><text y="5" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold" font-size="16" fill="#67452e">?</text>';
    }
    items.push({type,x,y,node});
  }
  function hud() {
    $('score').textContent=String(score).padStart(3,'0');
    $('hearts').textContent='♥ '.repeat(hearts)+'♡ '.repeat(3-hearts);
    $('hearts').setAttribute('aria-label',`${hearts} hearts`);
    const remaining=Math.max(0,Math.ceil(60-elapsed));
    $('timer').textContent=`${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}`;
    $('timer').style.color=remaining<=15?'#c36443':'';
    $('mood').textContent=boost>0?'Snack-fuelled zoomies!':cuddled?'Cuddles secured':state==='playing'?'On sock patrol':'Ready for mischief';
  }
  function toast(message) {
    $('toast').textContent=message; $('toast').classList.add('show'); toastTime=3;
  }
  function pop(x,y,text,color) {
    const node=svg('text',{x,y,'text-anchor':'middle',fill:color,'font-family':'Trebuchet MS, sans-serif','font-size':20,'font-weight':'bold',stroke:'#fff9ed','stroke-width':3,'paint-order':'stroke'},$('effects'));
    node.textContent=text; effects.push({node,y,life:1});
  }
  function renderDog(moving=false) {
    $('dog').setAttribute('transform',`translate(${dog.x} ${dog.y})`);
    $('dog-body').setAttribute('transform',`rotate(${dog.angle})`);
    $('dog').classList.toggle('running',moving && state==='playing');
    $('dog').classList.toggle('boosted',boost>0);
    $('dog').classList.toggle('invulnerable',immune>0 && Math.floor(immune*9)%2===0);
  }
  function start() {
    state='playing';elapsed=score=collected=boost=immune=0;hearts=3;cuddled=sofaReady=false;
    dog={x:480,y:285,angle:0};keys.clear();items=[];effects=[];
    $('items').replaceChildren();$('effects').replaceChildren();
    ['title-screen','end-screen','pause-screen'].forEach(id=>$(id).hidden=true);
    $('sofa').setAttribute('visibility','hidden');
    $('sofa-label').textContent='CUDDLES THIS WAY ↑';
    $('sofa-status').textContent='Sofa arrives at 0:15 remaining';
    for(let i=0;i<7;i++) addItem('sock');
    for(let i=0;i<6;i++) addItem('snack');
    toast('Go, Jelly! Rescue those socks.');hud();renderDog();
    lastTime=performance.now();
    // Keep Space/Enter from accidentally activating a focused restart button.
    if(document.activeElement instanceof HTMLElement) document.activeElement.blur();
  }
  function finish() {
    state='ended';keys.clear();renderDog();hud();
    $('toast').classList.remove('show');$('end-screen').hidden=false;
    $('final-score').textContent=score;
    $('result-kicker').textContent=cuddled?'SOCKS. ZOOMIES. SOFA.':'THE ZOOMIES ARE OVER';
    $('result-title').textContent=cuddled?'Cuddle mission complete.':hearts===0?'Too many mystery snacks!':'Still dreaming of socks.';
    $('result-copy').textContent=cuddled?'A very speedy farmdog. A very well-earned snuggle.':hearts===0?'Time for a little rest. The socks can wait.':'Next time, follow the sofa call for a big cuddle bonus.';
    $('breakdown').textContent=`${collected} socks × 10 points${cuddled?' + 100 cuddle points':''} · ${hearts} hearts left`;
    $('again').focus({preventScroll:true});
  }
  function pause() {
    if(state!=='playing') return;
    state='paused';keys.clear();renderDog();$('pause-screen').hidden=false;$('resume').focus({preventScroll:true});
  }
  function resume() {
    if(state!=='paused') return;
    state='playing';lastTime=performance.now();$('pause-screen').hidden=true;keys.clear();$('resume').blur();
  }
  function update(dt) {
    elapsed=Math.min(60,elapsed+dt);boost=Math.max(0,boost-dt);immune=Math.max(0,immune-dt);
    if(elapsed>=45 && !sofaReady) {
      sofaReady=true;$('sofa').setAttribute('visibility','visible');
      $('sofa-status').textContent='Sofa time! Head to the bottom-right corner.';toast('Sofa time! Find your +100 cuddle.');
    }
    let dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));
    let dy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
    const moving=dx!==0||dy!==0;
    if(moving) {
      const length=Math.hypot(dx,dy);dx/=length;dy/=length;
      const step=(boost>0?355:235)*dt;
      const x=Math.max(32,Math.min(928,dog.x+dx*step));
      const y=Math.max(32,Math.min(528,dog.y+dy*step));
      if(free(x,dog.y,18))dog.x=x;
      if(free(dog.x,y,18))dog.y=y;
      dog.angle=Math.atan2(dy,dx)*180/Math.PI;
    }
    for(const item of [...items]) {
      if(Math.hypot(dog.x-item.x,dog.y-item.y)>31)continue;
      if(item.type==='snack' && immune>0)continue;
      items.splice(items.indexOf(item),1);item.node.remove();
      if(item.type==='sock') {score+=10;collected++;pop(item.x,item.y-22,'+10','#355c48');}
      else {hearts--;boost=2;immune=1.4;pop(item.x,item.y-22,'−1 ♥','#bd5037');toast('Oops. Not food! Here come the zoomies…');}
      if(hearts===0){finish();return;}
      addItem(item.type);
    }
    if(sofaReady&&!cuddled&&hitsRect(dog.x,dog.y,22,{x:719,y:379,w:185,h:123})) {
      cuddled=true;score+=100;pop(813,378,'+100 ♥','#355c48');toast('Cuddle secured! There’s still time for socks.');
      $('sofa-label').textContent='CUDDLE SECURED ♡';$('sofa-status').textContent='Cuddle bonus secured. Keep collecting!';
    }
    effects=effects.filter(effect=>{
      effect.life-=dt;effect.node.setAttribute('y',effect.y-(1-effect.life)*35);effect.node.setAttribute('opacity',Math.max(0,effect.life));
      if(effect.life<=0){effect.node.remove();return false;}return true;
    });
    toastTime-=dt;if(toastTime<=0)$('toast').classList.remove('show');
    renderDog(moving);hud();if(elapsed>=60)finish();
  }
  function frame(now) {
    // Small substeps keep collisions reliable even during short frame stalls.
    let dt=Math.min((now-lastTime)/1000,.25);lastTime=now;
    while(dt>0&&state==='playing'){const step=Math.min(dt,1/120);update(step);dt-=step;}
    requestAnimationFrame(frame);
  }
  document.addEventListener('keydown',event=>{
    const key=event.key.toLowerCase();
    if(controls.has(key)&&state==='playing'){event.preventDefault();keys.add(key);}
    if(key==='escape'&&!event.repeat){if(state==='playing')pause();else if(state==='paused')resume();}
  });
  document.addEventListener('keyup',event=>keys.delete(event.key.toLowerCase()));
  document.querySelectorAll('.d-pad button').forEach(button => {
    const key = button.dataset.key;
    const release = event => {
      if (event.pointerId !== undefined && button.hasPointerCapture?.(event.pointerId)) button.releasePointerCapture(event.pointerId);
      keys.delete(key); button.classList.remove('pressed');
    };
    button.addEventListener('pointerdown', event => {
      if (state !== 'playing') return;
      event.preventDefault(); button.setPointerCapture?.(event.pointerId);
      keys.add(key); button.classList.add('pressed');
    });
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('lostpointercapture', release);
  });
  window.addEventListener('blur',pause);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  $('start').addEventListener('click',start);$('restart').addEventListener('click',start);$('again').addEventListener('click',start);$('resume').addEventListener('click',resume);
  decor();renderDog();hud();requestAnimationFrame(frame);
})();
