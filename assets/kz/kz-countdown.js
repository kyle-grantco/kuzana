(function(){
  var el=document.getElementById('kz-cd');
  if(!el)return;
  var deadline=new Date(el.getAttribute('data-deadline')).getTime();
  var d=el.querySelector('[data-cd="d"]');
  var h=el.querySelector('[data-cd="h"]');
  var m=el.querySelector('[data-cd="m"]');
  var s=el.querySelector('[data-cd="s"]');
  function pad(n){return n<10?'0'+n:String(n);}
  function tick(){
    var diff=Math.max(0,deadline-Date.now());
    d.textContent=pad(Math.floor(diff/864e5));
    h.textContent=pad(Math.floor(diff%864e5/36e5));
    m.textContent=pad(Math.floor(diff%36e5/6e4));
    s.textContent=pad(Math.floor(diff%6e4/1e3));
    if(diff>0){setTimeout(tick,1000-Date.now()%1000);}
    else{el.setAttribute('data-expired','');el.querySelector('.kz-cd-bar__label').textContent='Applications are now closed';}
  }
  tick();
})();
