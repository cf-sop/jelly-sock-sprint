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
  const SCORE_KEY='jelly-sock-sprint-best';
  let state = 'title', elapsed = 0, score = 0, hearts = 3, collected = 0;
  let cuddled = false, sofaReady = false, immune = 0, stun = 0;
  let pairStreak = null, pairStreakAt = -99, bestScore = readBestScore();
  const touchVector = {x:0,y:0,active:false};
  let lastTime = 0, toastTime = 0, items = [], effects = [];
  let dog = {x:480,y:285,angle:0};

  function readBestScore() { try { return Number(localStorage.getItem(SCORE_KEY))||0; } catch { return 0; } }
  function saveBestScore() { try { localStorage.setItem(SCORE_KEY,String(bestScore)); } catch {} }

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
  function addItem(type, pair = null) {
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
      const colors=['#537e79','#d06449','#e8b54c','#8e82a5'];
      const color=pair===null?colors[Math.floor(Math.random()*colors.length)]:colors[pair%colors.length];
      node.innerHTML=`<path d="M-9-17H8V1L17 5Q24 10 17 17Q12 21 5 17L-9 8Z" fill="${color}" stroke="#fff8e7" stroke-width="2.5"/><path d="M-8-10H7M-8-5H7" stroke="#fff2dc" stroke-width="3"/><path d="M11 4L5 15" stroke="#fff2dc" stroke-width="5"/>`;
    } else {
      node.innerHTML='<path d="M-16-9L-7-12L-3-18L5-13L14-13L13-4L19 3L11 8L8 16L0 12L-10 15L-11 6L-18 1Z" fill="#ae6d3f" stroke="#f7d59d" stroke-width="2"/><circle r="10" fill="#e6ae65"/><text y="5" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold" font-size="16" fill="#67452e">?</text>';
    }
    const angle=Math.random()*Math.PI*2;
    node.classList.add(type==='snack'?'snack-item':'sock-item');
    items.push({type,x,y,node,pair,rotation:Math.random()*70-35});
  }
  function hud() {
    $('score').textContent=String(score).padStart(3,'0');
    $('best-score').textContent=String(bestScore).padStart(3,'0');
    $('hearts').textContent='♥ '.repeat(hearts)+'♡ '.repeat(3-hearts);
    $('hearts').setAttribute('aria-label',`${hearts} hearts`);
    const remaining=Math.max(0,Math.ceil(60-elapsed));
    $('timer').textContent=`${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}`;
    $('timer').style.color=remaining<=15?'#c36443':'';
    const nearest=nearestSnack();
    $('mood').textContent=stun>0?'A little snack daze':cuddled?'Cuddles secured':nearest&&nearest.distance<155?'Sniffing trouble…':state==='playing'?'Pair-hunting paws':'Ready for mischief';
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
    $('dog').classList.remove('boosted');
    $('dog').classList.toggle('invulnerable',immune>0 && Math.floor(immune*9)%2===0);
  }
  function start() {
    state='playing';elapsed=score=collected=immune=stun=0;hearts=3;cuddled=sofaReady=false;pairStreak=null;pairStreakAt=-99;
    dog={x:480,y:285,angle:0};keys.clear();touchVector.x=0;touchVector.y=0;touchVector.active=false;if(knob)knob.style.transform='translate(0,0)';items=[];effects=[];
    $('items').replaceChildren();$('effects').replaceChildren();
    ['title-screen','end-screen','pause-screen'].forEach(id=>$(id).hidden=true);
    $('sofa').setAttribute('visibility','hidden');
    $('sofa-label').textContent='CUDDLES THIS WAY ↑';
    $('sofa-status').textContent='Sofa arrives at 0:15 remaining';
    for(let pair=0;pair<4;pair++){addItem('sock',pair);addItem('sock',pair);}
    for(let i=0;i<5;i++) addItem('snack');
    toast('Laundry Day! Match pairs for +25.');hud();renderDog();
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
    const newBest=score>bestScore;if(newBest){bestScore=score;saveBestScore();}
    $('result-copy').textContent=newBest?'New best score!':cuddled?'A very speedy farmdog. A very well-earned snuggle.':hearts===0?'Time for a little rest. The socks can wait.':'Next time, follow the sofa call for a big cuddle bonus.';
    $('breakdown').textContent=`${collected} socks × 10 points · matching pairs add +25${cuddled?' + 100 cuddle points':''} · ${hearts} hearts left · best ${bestScore}`;
    $('again').focus({preventScroll:true});
  }
  function pause() {
    if(state!=='playing') return;
    state='paused';keys.clear();touchVector.x=0;touchVector.y=0;touchVector.active=false;if(knob)knob.style.transform='translate(0,0)';renderDog();$('pause-screen').hidden=false;$('resume').focus({preventScroll:true});
  }
  function resume() {
    if(state!=='paused') return;
    state='playing';lastTime=performance.now();$('pause-screen').hidden=true;keys.clear();$('resume').blur();
  }
  function nearestSnack() {
    let nearest=null, distance=Infinity;
    for(const item of items) if(item.type==='snack') { const d=Math.hypot(dog.x-item.x,dog.y-item.y); if(d<distance){nearest=item;distance=d;} }
    return nearest?{item:nearest,distance}:null;
  }
  function applySnackPull(dx,dy) {
    const found=nearestSnack();
    if(!found||found.distance>155) return {dx,dy,auto:false};
    const strength=(1-found.distance/155)*.48;
    const nearest=found.item, distance=found.distance;
    const towardX=(nearest.x-dog.x)/(distance||1), towardY=(nearest.y-dog.y)/(distance||1);
    const hasInput=dx!==0||dy!==0;
    if(!hasInput && distance<135) return {dx:towardX,dy:towardY,auto:true};
    return {dx:dx*(1-strength)+towardX*strength,dy:dy*(1-strength)+towardY*strength,auto:false};
  }
  function update(dt) {
    elapsed=Math.min(60,elapsed+dt);immune=Math.max(0,immune-dt);stun=Math.max(0,stun-dt);
    if(elapsed>=45 && !sofaReady) {
      sofaReady=true;$('sofa').setAttribute('visibility','visible');
      $('sofa-status').textContent='Sofa time! Head to the bottom-right corner.';toast('Sofa time! Find your +100 cuddle.');
    }
    let dx=touchVector.active?touchVector.x:Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));
    let dy=touchVector.active?touchVector.y:Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
    const inputMoving=dx!==0||dy!==0;
    const pulled=applySnackPull(dx,dy);({dx,dy}=pulled);
    const moving=inputMoving||pulled.auto;
    if(moving && stun<=0) {
      const length=Math.hypot(dx,dy);dx/=length;dy/=length;
      const step=pulled.auto?Math.max(48,125*(1-(nearestSnack()?.distance||135)/135)):235;
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
      if(item.type==='sock') {
        score+=10;collected++;pop(item.x,item.y-22,'+10','#355c48');
        if(pairStreak===item.pair && elapsed-pairStreakAt<=8){score+=25;pop(item.x,item.y-45,'PAIR +25','#d26b43');toast('A perfect pair! +25 laundry bonus.');pairStreak=null;}
        else {pairStreak=item.pair;pairStreakAt=elapsed;toast('Pair started! Find its match.');}
      }
      else {hearts--;stun=.65;immune=1.4;pop(item.x,item.y-22,'−1 ♥','#bd5037');toast('Snack smack! Jelly needs a breather.');}
      if(hearts===0){finish();return;}
      addItem(item.type,item.pair);
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
  const joystick=$('joystick'), knob=$('joystick-knob');
  function updateJoystick(event) {
    const rect=joystick.getBoundingClientRect();
    const radius=rect.width*.36;
    let x=event.clientX-(rect.left+rect.width/2), y=event.clientY-(rect.top+rect.height/2);
    const distance=Math.hypot(x,y)||1, scale=Math.min(1,radius/distance);
    x*=scale;y*=scale;touchVector.x=x/radius;touchVector.y=y/radius;touchVector.active=true;
    knob.style.transform=`translate(${x}px,${y}px)`;
  }
  function releaseJoystick(event) {
    if (event?.pointerId!==undefined && joystick.hasPointerCapture?.(event.pointerId)) joystick.releasePointerCapture(event.pointerId);
    touchVector.x=0;touchVector.y=0;touchVector.active=false;knob.style.transform='translate(0,0)';
  }
  joystick.addEventListener('pointerdown',event=>{if(state!=='playing')return;event.preventDefault();joystick.setPointerCapture?.(event.pointerId);updateJoystick(event);});
  joystick.addEventListener('pointermove',event=>{if(touchVector.active) {event.preventDefault();updateJoystick(event);}});
  joystick.addEventListener('pointerup',releaseJoystick);joystick.addEventListener('pointercancel',releaseJoystick);joystick.addEventListener('lostpointercapture',releaseJoystick);
  window.addEventListener('blur',pause);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  $('start').addEventListener('click',start);$('restart').addEventListener('click',start);$('again').addEventListener('click',start);$('resume').addEventListener('click',resume);
  decor();renderDog();hud();requestAnimationFrame(frame);
})();
