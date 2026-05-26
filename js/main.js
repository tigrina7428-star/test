

// ── HERO SLIDER ──
const track = document.querySelector('.hero-track');
if (track) {

let currentSlide = 1;
const slides = document.querySelectorAll('.slide');
const totalRealSlides = slides.length;
const heroNav = document.getElementById('heroNav');
const slideNum = document.getElementById('slideNum');

// 1. Клонируем элементы для бесшовного перехода
const firstClone = slides[0].cloneNode(true);
const lastClone = slides[totalRealSlides - 1].cloneNode(true);

track.appendChild(firstClone); // Клон первого в конец
track.insertBefore(lastClone, slides[0]); // Клон последнего в начало

// Устанавливаем начальную позицию на настоящий первый слайд (100vw)
track.style.transform = `translateX(-${currentSlide * 100}vw)`;

// Флаг: идёт ли сейчас анимация перехода (защита от стакирования)
let isTransitioning = false;

// Массив имен для табов (можно расширять)
const slideSeries = ['Серийные здания','Склад 300', 'Склад 500', 'Склад 1000','Склад 2000'];
const slideNames = ['Под ключ','Базовый','Хит продаж', 'Флагман', 'Фаворит'];

// Создаем табы
for (let i = 0; i < totalRealSlides; i++) {
  const tab = document.createElement('button');
  tab.className = 'hero-tab';
  tab.innerHTML = `
    <span class="tab-title">${slideSeries[i] || 'Модель ' + (i+1)}</span>
    <span class="tab-subtitle">${slideNames[i] || 'Модель ' + (i+1)}</span>
    <div class="tab-progress-bar">
      <div class="tab-progress-fill"></div>
    </div>
  `;
  tab.addEventListener('click', () => goToSlide(i + 1));
  heroNav.appendChild(tab);
}

// Активируем первый таб с минимальной задержкой после отрисовки
setTimeout(() => { heroNav.children[0].classList.add('active'); }, 100);

function setActiveTab(slideIndex) {
  const tabIndex = (slideIndex - 1 + totalRealSlides) % totalRealSlides;

  Array.from(heroNav.children).forEach((t, i) => {
    if (i === tabIndex) {
      // Шаг 1: убираем .active, чтобы браузер «забыл» текущее состояние fill
      t.classList.remove('active');

      const fill = t.querySelector('.tab-progress-fill');
      if (fill) {
        // Шаг 2: мгновенно обнуляем ширину (без transition)
        fill.style.transition = 'none';
        fill.style.width = '0';

        // Шаг 3: принудительный reflow — браузер должен «увидеть» ширину 0
        // прежде чем мы отпустим управление CSS
        void fill.offsetWidth;

        // Шаг 4: снимаем инлайн-переопределение — CSS-правило .active снова берёт верх
        fill.style.transition = '';
        fill.style.width = '';
      }

      // Шаг 5: добавляем .active — CSS запускает анимацию с 0 до 100% за 5 s
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });

  if (slideNum) slideNum.textContent = String(tabIndex + 1).padStart(2, '0');
}

function goToSlide(n) {
  if (isTransitioning) return; // Не начинаем новый переход пока идёт текущий
  isTransitioning = true;

  track.style.transition = 'transform 0.3s cubic-bezier(0.65, 0, 0.35, 1)';
  currentSlide = n;
  track.style.transform = `translateX(-${currentSlide * 100}vw)`;
  setActiveTab(currentSlide);

  // Бесшовное зацикливание через клоны — ОДИН обработчик на треке (не накапливается)
  track.addEventListener('transitionend', onTransitionEnd, { once: true });
}

function onTransitionEnd() {
  if (currentSlide === totalRealSlides + 1) {
    // Клон первого слайда в конце → телепортируемся на реальный первый
    track.style.transition = 'none';
    currentSlide = 1;
    track.style.transform = `translateX(-${currentSlide * 100}vw)`;
  } else if (currentSlide === 0) {
    // Клон последнего слайда в начале → телепортируемся на реальный последний
    track.style.transition = 'none';
    currentSlide = totalRealSlides;
    track.style.transform = `translateX(-${currentSlide * 100}vw)`;
  }
  isTransitioning = false;
}

// Автопереключение — сохраняем ссылку для возможности остановки
let sliderInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);

// ── Пауза при скрытой вкладке (экономия ресурсов) ──
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearInterval(sliderInterval);
  } else {
    // Сбрасываем прогресс активного таба — CSS-анимация была заморожена,
    // при возврате она продолжилась бы с произвольного места
    setActiveTab(currentSlide);
    sliderInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);
  }
});

// ── Сброс при восстановлении из bfcache (кнопка «Назад») ──
// Проблема: браузер сохраняет страницу «замороженной» — currentSlide может быть
// на клоне, интервал сбился, track стоит в неверной позиции.
// Решение: при pageshow сбрасываем слайдер в начало и перезапускаем таймер.
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    clearInterval(sliderInterval);
    isTransitioning = false;
    currentSlide = 1;
    track.style.transition = 'none';
    track.style.transform = `translateX(-${currentSlide * 100}vw)`;
    setActiveTab(currentSlide);
    sliderInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);
  }
});

// ── Остановка интервала при уходе со страницы ──
// Не даём слайдеру сдвигать currentSlide во время fadeout-перехода (450мс).
window.addEventListener('pagehide', () => {
  clearInterval(sliderInterval);
});

} // end if (track)


// ── MODAL ──
function openModal() { document.getElementById('modalOverlay').classList.add('open'); }
function closeModal() { document.getElementById('modalOverlay').classList.remove('open'); }
function closeModalOutside(e) { if (e.target === document.getElementById('modalOverlay')) closeModal(); }
function submitModal() {
  closeModal();
  alert('✅ Заявка принята! Пришлём КП в течение 24 часов.');
}

 // ── КАЛЬКУЛЯТОР ──
 const calcModels = [
  { name:'СКЛАД 300', tag:'Базовый · 1 ворота · 60 м² офис',    price:24900000, perm:83000, time:'90 дней',  model:0, max:449  },
  { name:'СКЛАД 500', tag:'Расширенный · 2 ворота · 2-ур. офис', price:42500000, perm:85000, time:'120 дней', model:1, max:799  },
  { name:'СКЛАД 1000',tag:'Флагман · 3 ворота · Полный инжиниринг',price:79000000,perm:79000,time:'150 дней', model:2, max:1499 },
  { name:'СКЛАД 2000',tag:'Индустриальный · 4+ ворот · Кран-балка',price:148000000,perm:74000,time:'180 дней',model:3, max:2000 },
];

function fmt(n){ return n.toLocaleString('ru-RU') + ' ₽'; }

function getModelByArea(area){
  return calcModels.find(m => area <= m.max) || calcModels[3];
}

function updateCalc(){
  const slider = document.getElementById('calc-slider');
  const area = parseInt(slider.value);
  const m = getModelByArea(area);

  document.getElementById('calc-area-val').textContent = area;
  document.getElementById('calc-model-name').textContent = m.name;
  document.getElementById('calc-model-tag').textContent = m.tag;
  document.getElementById('calc-price').textContent = fmt(m.price);
  document.getElementById('calc-perm').textContent = fmt(m.perm);
  document.getElementById('calc-time').textContent = m.time;
  document.getElementById('calc-btn-config').onclick = () => navigateTo('configurator.html?model=' + m.model);

  // Подсветка pill-ов
  calcModels.forEach((_, i) => {
    document.getElementById('cpill-' + i).classList.toggle('active', i === m.model);
  });

  // Ползунок прогресс
  const pct = (area - 300) / (2000 - 300) * 100;
  document.getElementById('calc-slider-fill').style.width = pct + '%';
  slider.style.setProperty('--pct', pct + '%');
}

const calcSlider = document.getElementById('calc-slider');
if (calcSlider) {
  calcSlider.addEventListener('input', updateCalc);
  updateCalc();
}

// ── CTA-форма заявки (.cta-form) ─────────────────────────
// Переключатели комплектаций
(function () {
  var toggles = document.querySelectorAll('#ctaLevelToggles .cta-form__toggle');
  toggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      toggles.forEach(function (b) { b.classList.remove('cta-form__toggle--active'); });
      btn.classList.add('cta-form__toggle--active');
    });
  });
})();

// Свотчи цветов
(function () {
  document.querySelectorAll('.cta-form__swatches').forEach(function (group) {
    var swatches = group.querySelectorAll('.cta-form__swatch');
    var nameEl = document.getElementById(group.dataset.target);
    swatches.forEach(function (sw) {
      sw.addEventListener('click', function () {
        swatches.forEach(function (s) { s.classList.remove('cta-form__swatch--active'); });
        sw.classList.add('cta-form__swatch--active');
        if (nameEl) nameEl.textContent = sw.dataset.color;
      });
    });
  });
})();

// Отправка формы
function submitCtaForm(e) {
  e.preventDefault();
  var consents = document.querySelectorAll('.cta-form__checkbox');
  var allChecked = true;
  consents.forEach(function (c) { if (!c.checked) allChecked = false; });
  if (!allChecked) {
    alert('Пожалуйста, подтвердите все необходимые согласия.');
    return;
  }
  alert('✅ Заявка принята! Пришлём предложение в течение 24 часов.');
}

