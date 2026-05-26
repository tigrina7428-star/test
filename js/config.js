const models = [
  {name:'Склад 300',area:'300 м²',dims:'30×10×6 м',tagline:'Старт малого бизнеса',price:4200000,power:'25 кВт',time:'45 дней',svgSize:'300'},
  {name:'Склад 500',area:'500 м²',dims:'50×10×7 м',tagline:'Оптимальный выбор',price:6800000,power:'25 кВт',time:'60 дней',svgSize:'500'},
  {name:'Склад 1000',area:'1000 м²',dims:'50×20×8 м',tagline:'Масштабное хранение',price:11500000,power:'25 кВт',time:'75 дней',svgSize:'1 000'},
  {name:'Склад 2000',area:'2000 м²',dims:'100×20×9 м',tagline:'Промышленный масштаб',price:21000000,power:'25 кВт',time:'90 дней',svgSize:'2 000'},
];
const levels = [
  {name:'Старт',extra:0,power:'25 кВт'},
  {name:'Комфорт',extra:680000,power:'50 кВт'},
  {name:'Премиум',extra:1400000,power:'100 кВт'},
];
const services = [
  {name:'Климат-контроль',price:980000},
  {name:'Охрана и видеонаблюдение',price:420000},
  {name:'Офисный блок',price:680000},
  {name:'Автоматические ворота',price:540000},
  {name:'Солнечная генерация',price:760000},
  {name:'Строительный контроль',price:320000},
];
const fins = [
  {name:'100% оплата',detail:'Единовременно',discount:0.05},
  {name:'Лизинг',detail:'от 11,9% / год',discount:0},
  {name:'Кредит',detail:'от 14,5% / год',discount:0},
  {name:'Поэтапно',detail:'30% → 40% → 30%',discount:0},
];

let state = {model:-1,level:-1,services:[],fin:-1};
let curStep = 0;

function fmt(n){return n.toLocaleString('ru-RU')+'  ₽';}

function goToStep(s){
  document.querySelectorAll('.page').forEach((p,i)=>p.classList.toggle('active',i===s));
  document.querySelectorAll('.step-item').forEach((el,i)=>{
    el.classList.remove('active','done');
    if(i===s) el.classList.add('active');
    else if(i<s) el.classList.add('done');
  });
  curStep = s;
  if(s===4) buildResult();
  updateLeftPanel();
}

function selectModel(i){
  state.model=i;
  document.querySelectorAll('[id^="mr"]').forEach((el,j)=>el.classList.toggle('selected',j===i));
  updateLeftPanel();
}
function selectLevel(i){
  state.level=i;
  document.querySelectorAll('[id^="lr"]').forEach((el,j)=>el.classList.toggle('selected',j===i));
  updateLeftPanel();
}
function toggleService(i){
  const idx=state.services.indexOf(i);
  if(idx===-1) state.services.push(i); else state.services.splice(idx,1);
  document.getElementById('sv'+i).classList.toggle('selected',state.services.includes(i));
  updateLeftPanel();
}
function selectFin(i){
  state.fin=i;
  document.querySelectorAll('[id^="fn"]').forEach((el,j)=>el.classList.toggle('selected',j===i));
  updateLeftPanel();
}

function calcTotal(){
  if(state.model<0) return 0;
  let t = models[state.model].price;
  if(state.level>=0) t += levels[state.level].extra;
  state.services.forEach(s=>t+=services[s].price);
  if(state.fin===0) t = Math.round(t*0.95);
  return t;
}

function updateLeftPanel(){
  const m = state.model>=0?models[state.model]:null;
  const l = state.level>=0?levels[state.level]:null;
  const f = state.fin>=0?fins[state.fin]:null;
  document.getElementById('lp-tagline').textContent = m?m.tagline:'Выберите модель';
  document.getElementById('lp-title').textContent = m?m.name:'Склад';
  const total = calcTotal();
  document.getElementById('lp-price').textContent = total>0?fmt(total):'—';
  document.getElementById('lp-pricesub').textContent = total>0?'итоговая стоимость':'выберите модель и комплектацию';
  document.getElementById('spec-area').textContent = m?m.area:'—';
  document.getElementById('spec-level').textContent = l?l.name:'—';
  document.getElementById('spec-power').textContent = l?l.power:(m?m.power:'—');
  document.getElementById('spec-services').textContent = state.services.length>0?state.services.length+' опций':'—';
  document.getElementById('spec-fin').textContent = f?f.name:'—';
  const btn = document.getElementById('lp-mainbtn');
  if(curStep<4){btn.textContent=curStep===0?'Выбрать модель →':'Продолжить →';}
  else{btn.textContent='Отправить заявку →';}
  // update svg size label
  if(m){
    const svgs=document.querySelectorAll('#lp-svg text');
    svgs.forEach(t=>{if(t.getAttribute('font-size')==='28')t.textContent=m.area;});
  }
}

function handleMainBtn(){
  if(curStep<4) goToStep(Math.min(curStep+1,4));
  else submitRequest();
}

function buildResult(){
  const m=state.model>=0?models[state.model]:{name:'—',area:'—',time:'—'};
  const l=state.level>=0?levels[state.level]:{name:'—',power:'—'};
  const f=state.fin>=0?fins[state.fin]:{name:'—',detail:'—',discount:0};
  document.getElementById('res-model').textContent=m.name;
  document.getElementById('res-area').textContent=m.area;
  document.getElementById('res-level').textContent=l.name;
  document.getElementById('res-power').textContent=l.power;
  document.getElementById('res-time').textContent=m.time;
  document.getElementById('res-fin').textContent=f.name;
  document.getElementById('res-fin-detail').textContent=f.detail;
  document.getElementById('res-discount').textContent=f.discount>0?'-'+(f.discount*100)+'%':'—';
  const sl=document.getElementById('res-services-list');
  if(state.services.length===0){
    sl.innerHTML='<div class="result-line"><span class="result-line-key">Дополнительные опции</span><span class="result-line-val" style="color:var(--gray-dim)">не выбраны</span></div>';
  } else {
    sl.innerHTML=state.services.map(i=>`<div class="result-line"><span class="result-line-key">${services[i].name}</span><span class="result-line-val" style="color:var(--accent)">+ ${services[i].price.toLocaleString('ru-RU')} ₽</span></div>`).join('');
  }
  const total=calcTotal();
  document.getElementById('res-total').textContent=total>0?fmt(total):'—';
  document.getElementById('res-note').textContent=f.discount>0?'Включена скидка 5% за 100% оплату':'';
}

function submitRequest(){alert('Заявка отправлена! Менеджер свяжется с вами в течение 30 минут.');}
function requestCallback(){alert('Оставьте номер телефона — мы перезвоним.');}

updateLeftPanel();

// Читаем параметр ?model= из URL и автоматически выбираем модель
(function(){
  const params = new URLSearchParams(window.location.search);
  const modelParam = params.get('model');
  if(modelParam !== null){
    const idx = parseInt(modelParam, 10);
    if(idx >= 0 && idx < models.length){
      selectModel(idx);
      goToStep(1);
    }
  }
})();

// Плавный скролл: страница появляется снизу и поднимается наверх
/* window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const target = document.querySelector('.configurator');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 400);
}) */;