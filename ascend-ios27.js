/* Ascend iOS layer — slides the tab-bar pill and adds light haptic feel.
   No changes to app.js required. */
(()=>{
  const nav=document.getElementById('nav'); if(!nav) return;
  const sync=()=>{
    const items=[...nav.querySelectorAll('.nav-item')];
    const i=items.findIndex(b=>b.classList.contains('active'));
    nav.style.setProperty('--n',items.length);
    nav.style.setProperty('--i',Math.max(i,0));
    nav.style.setProperty('--pill',i<0?0:1);   // hide pill on sub-pages (e.g. Deep Work)
  };
  new MutationObserver(sync).observe(nav,{subtree:true,attributes:true,attributeFilter:['class']});
  sync();
  // PC: number keys 1-6 jump between tabs; give each item a hint badge + tooltip
  const items=[...nav.querySelectorAll('.nav-item')];
  items.forEach((b,n)=>{b.dataset.key=n+1;b.title=(b.textContent.trim()||b.dataset.view)+' ('+(n+1)+')';});
  document.addEventListener('keydown',e=>{
    if(e.metaKey||e.ctrlKey||e.altKey||e.target.closest('input,textarea,select,[contenteditable]'))return;
    if(document.querySelector('.proof-backdrop,.task-alert-backdrop:not([hidden]),dialog[open]'))return;
    const n=parseInt(e.key,10); if(n>=1&&n<=items.length) items[n-1].click();
  });
  // Respect safe areas when the on-screen keyboard resizes the viewport
  if(window.visualViewport){
    const vv=window.visualViewport;
    const fit=()=>document.documentElement.style.setProperty('--kb',Math.max(0,innerHeight-vv.height)+'px');
    vv.addEventListener('resize',fit); fit();
  }
  // Tiny tactile tick on tab change where the Vibration API exists (Android/desktop; iOS ignores it silently)
  nav.addEventListener('click',()=>navigator.vibrate&&navigator.vibrate(6),{passive:true});
})();
