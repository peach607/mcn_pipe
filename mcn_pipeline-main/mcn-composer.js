window.setComposerExample=function(inputId,text){
  const input=document.getElementById(inputId);
  if(!input)return;
  input.value=text;
  input.focus();
};
window.chooseModel=function(btn){
  const model=btn.getAttribute('data-model');
  if(!model)return;
  const label=document.getElementById('modelLabel');
  if(label)label.textContent=model;
  const menu=btn.closest('.picker-menu');
  if(menu){menu.querySelectorAll('button').forEach(function(b){b.classList.remove('active')});btn.classList.add('active');}
  const picker=btn.closest('.picker');
  if(picker)picker.classList.remove('open');
};
window.togglePicker=function(pickerId,ev){
  if(ev)ev.stopPropagation();
  const picker=document.getElementById(pickerId);
  if(!picker)return;
  /* 关闭其他 picker */
  document.querySelectorAll('.picker.open').forEach(function(p){if(p.id!==pickerId)p.classList.remove('open');});
  picker.classList.toggle('open');
};
window.chooseAgent=function(agentKey,btn){
  const nameEl=document.getElementById('composerAgentName');
  if(nameEl){
    const names={boss:'工作台助手',content:'内容创作助手',lead:'线索洞察助手',qa:'客户问答助手',review:'运营复盘助手'};
    nameEl.textContent=names[agentKey]||agentKey;
  }
  const menu=btn.closest('.picker-menu');
  if(menu){menu.querySelectorAll('button').forEach(function(b){b.classList.remove('active')});btn.classList.add('active');}
  const picker=btn.closest('.picker');
  if(picker)picker.classList.remove('open');
};
/* 点击外部关闭所有 picker */
document.addEventListener('click',function(){document.querySelectorAll('.picker.open').forEach(function(p){p.classList.remove('open');});});
