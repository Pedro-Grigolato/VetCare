(function () {
"use strict";
/* ==========================================================================
   motion.js — sistema de movimento da VetCare
   --------------------------------------------------------------------------
   Sem dependências. Tudo via IntersectionObserver, CSS e Web Animations API.
   Exporta o que o script.js já importava (revealObserver, initMotion) e
   mais alguns módulos reutilizáveis.

   Atributos de HTML usados:
     data-reveal="up|down|left|right|scale|fade"   entrada ao rolar
     .reveal                                       o mesmo que data-reveal="up"
     data-reveal-delay="120"                       atraso extra em ms
     data-stagger="90"                             atraso sequencial dos filhos
     data-counter="123"                            contador animado
     data-accordion                                acordeão em <details>
     data-carousel                                 carrossel (veja o modelo no index.html)
   ========================================================================== */

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia(REDUCED_QUERY).matches;

const debounce = (fn, wait = 150) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
};

/* --------------------------------------------------------------------------
   1. Scroll reveal
   Um único observer para a página inteira. Cada elemento é observado até
   aparecer uma vez e depois é liberado: nada reanima ao rolar de volta.
   Devolve null quando o usuário prefere menos movimento (ou sem suporte);
   nesse caso a classe .js-motion não existe e tudo fica visível.
   -------------------------------------------------------------------------- */
let sharedReveal = null;

function revealObserver() {
  if (sharedReveal) return sharedReveal;
  if (!("IntersectionObserver" in window) || prefersReducedMotion()) return null;

  sharedReveal = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    },
    // Sem margem negativa: elementos pequenos no fim da página também aparecem.
    { threshold: 0.12 },
  );
  document.documentElement.classList.add("js-motion");
  return sharedReveal;
}

function setupStagger(root = document) {
  $$("[data-stagger]", root).forEach((group) => {
    const step = Number(group.dataset.stagger) || 90;
    [...group.children].forEach((child, index) => {
      child.style.setProperty("--reveal-delay", `${index * step}ms`);
    });
  });
  $$("[data-reveal-delay]", root).forEach((el) => {
    el.style.setProperty("--reveal-delay", `${Number(el.dataset.revealDelay) || 0}ms`);
  });
}

function observeReveals(root = document) {
  const observer = revealObserver();
  if (!observer) return;
  $$(".reveal:not(.visible), [data-reveal]:not(.visible)", root).forEach((el) =>
    observer.observe(el),
  );
}

/* --------------------------------------------------------------------------
   2. Header: aparência muda ao rolar (sentinela, sem listener de scroll)
   -------------------------------------------------------------------------- */
function initHeader() {
  const header = $("#header");
  if (!header || !("IntersectionObserver" in window)) return;
  const sentinel = document.createElement("div");
  sentinel.className = "scroll-sentinel";
  sentinel.setAttribute("aria-hidden", "true");
  document.body.prepend(sentinel);
  new IntersectionObserver(([entry]) => {
    header.classList.toggle("scrolled", !entry.isIntersecting);
  }).observe(sentinel);
}

/* --------------------------------------------------------------------------
   3. Hero: título por palavras, parallax leve, pausa fora da tela
   -------------------------------------------------------------------------- */
function splitWords(el) {
  let index = 0;
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const fragment = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            fragment.append(document.createTextNode(part));
            return;
          }
          const word = document.createElement("span");
          word.className = "word";
          word.style.setProperty("--w", String(index++));
          const inner = document.createElement("span");
          inner.textContent = part;
          word.append(inner);
          fragment.append(word);
        });
        child.replaceWith(fragment);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  };
  walk(el);
}

function initHero() {
  const hero = $(".hero");
  if (!hero) return;
  const reduced = prefersReducedMotion();

  const title = $(".hero-copy h1", hero);
  if (title && !reduced) splitWords(title);

  if (!("IntersectionObserver" in window)) return;
  let ticking = false;
  let listening = false;

  const update = () => {
    ticking = false;
    const shift = Math.min(window.scrollY, hero.offsetHeight);
    hero.style.setProperty("--hero-shift", shift.toFixed(1));
  };
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  new IntersectionObserver(([entry]) => {
    hero.classList.toggle("is-offscreen", !entry.isIntersecting);
    if (reduced) return;
    if (entry.isIntersecting && !listening) {
      listening = true;
      window.addEventListener("scroll", onScroll, { passive: true });
      update();
    } else if (!entry.isIntersecting && listening) {
      listening = false;
      window.removeEventListener("scroll", onScroll);
    }
  }).observe(hero);
}

/* --------------------------------------------------------------------------
   4. Marquee infinito
   Duplica o grupo para o loop ser contínuo (-50% = exatamente um grupo).
   -------------------------------------------------------------------------- */
function initMarquee() {
  const marquee = $(".marquee");
  const track = marquee && $(".marquee-track", marquee);
  const group = track && $(".marquee-group", track);
  if (!group) return;

  const clone = group.cloneNode(true);
  clone.setAttribute("aria-hidden", "true");
  track.append(clone);
  marquee.classList.add("is-ready");

  // Velocidade constante (~70 px/s) independente da largura da tela.
  const setSpeed = () => {
    const width = group.getBoundingClientRect().width;
    if (width) marquee.style.setProperty("--marquee-duration", `${Math.max(18, width / 70).toFixed(1)}s`);
  };
  setSpeed();
  window.addEventListener("resize", debounce(setSpeed, 200));
  document.fonts?.ready.then(setSpeed);


  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      marquee.classList.toggle("is-offscreen", !entry.isIntersecting);
    }).observe(marquee);
  }
}

/* --------------------------------------------------------------------------
   5. Contadores animados (uma vez por carregamento)
   Só anima o número que estiver em data-counter: nada é inventado aqui.
   -------------------------------------------------------------------------- */
const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

function initCounters(root = document) {
  const counters = $$("[data-counter]", root).filter((el) => !el.dataset.counterReady);
  if (!counters.length) return;
  const reduced = prefersReducedMotion();
  const decimalsOf = (el) => Number(el.dataset.counterDecimals) || 0;
  const format = (el, value) =>
    `${el.dataset.counterPrefix || ""}${new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: decimalsOf(el),
      maximumFractionDigits: decimalsOf(el),
    }).format(value)}${el.dataset.counterSuffix || ""}`;

  counters.forEach((el) => {
    el.dataset.counterReady = "true";
    const target = Number(el.dataset.counter) || 0;
    // Leitores de tela recebem o valor final; o número animado fica oculto.
    el.innerHTML = `<span aria-hidden="true">${format(el, reduced ? target : 0)}</span><span class="sr-only">${format(el, target)}</span>`;
  });
  if (reduced || !("IntersectionObserver" in window)) return;

  const run = (el) => {
    const target = Number(el.dataset.counter) || 0;
    const visual = $("span[aria-hidden]", el);
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      visual.textContent = format(el, target * easeOutExpo(progress));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        run(entry.target);
      });
    },
    { threshold: 0.5 },
  );
  counters.forEach((el) => observer.observe(el));
}

/* --------------------------------------------------------------------------
   6. Acordeão em <details> (abre e fecha com altura animada)
   Mantém o <details>/<summary> nativo: teclado, leitor de tela e toque
   continuam funcionando. Sem animação disponível, o comportamento nativo.
   -------------------------------------------------------------------------- */
const accordionAnimations = new WeakMap();

function toggleDetails(details, summary) {
  const from = details.getBoundingClientRect().height;
  accordionAnimations.get(details)?.cancel();

  const border = parseFloat(getComputedStyle(details).borderBottomWidth) || 0;
  const collapsed = summary.getBoundingClientRect().height + border;
  const opening = !details.open || details.dataset.state === "closing";

  details.dataset.state = opening ? "opening" : "closing";
  details.style.overflow = "hidden";
  if (opening) details.open = true;
  const to = opening ? details.getBoundingClientRect().height : collapsed;

  const animation = details.animate(
    { height: [`${from}px`, `${to}px`] },
    { duration: opening ? 420 : 320, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "forwards" },
  );
  accordionAnimations.set(details, animation);
  animation.onfinish = () => {
    if (!opening) details.open = false;
    animation.cancel();
    accordionAnimations.delete(details);
    details.style.overflow = "";
    delete details.dataset.state;
  };
}

function initAccordion(root = document) {
  $$("[data-accordion]", root).forEach((group) => {
    if (group.dataset.accordionReady) return;
    group.dataset.accordionReady = "true";
    group.addEventListener("click", (event) => {
      const summary = event.target.closest("summary");
      const details = summary?.parentElement;
      if (!details || details.tagName !== "DETAILS" || !group.contains(details)) return;
      if (prefersReducedMotion() || typeof details.animate !== "function") return;
      event.preventDefault();
      toggleDetails(details, summary);
    });
  });
}

/* --------------------------------------------------------------------------
   7. Carrossel (setas, indicadores, arraste por toque/mouse e teclado)
   -------------------------------------------------------------------------- */
function initCarousel(root) {
  if (root.dataset.carouselReady) return;
  const viewport = $(".carousel-viewport", root);
  const track = $(".carousel-track", root);
  const slides = track ? $$(".carousel-slide", track) : [];
  if (!viewport || slides.length === 0) return;
  root.dataset.carouselReady = "true";

  const prev = $("[data-carousel-prev]", root);
  const next = $("[data-carousel-next]", root);
  const dotsBox = $(".carousel-dots", root);
  let index = 0;

  const dots = slides.map((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-dot";
    dot.setAttribute("aria-label", `Ir para o slide ${i + 1} de ${slides.length}`);
    dot.addEventListener("click", () => go(i));
    dotsBox?.append(dot);
    return dot;
  });

  function render() {
    track.style.setProperty("--index", String(index));
    track.style.setProperty("--drag", "0px");
    slides.forEach((slide, i) => {
      const active = i === index;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
      slide.toggleAttribute("inert", !active);
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");
      slide.setAttribute("aria-label", `${i + 1} de ${slides.length}`);
    });
    dots.forEach((dot, i) => dot.setAttribute("aria-current", String(i === index)));
  }

  function go(target) {
    index = (target + slides.length) % slides.length;
    render();
  }

  if (slides.length < 2) {
    [prev, next, dotsBox].forEach((el) => el && (el.hidden = true));
  }
  prev?.addEventListener("click", () => go(index - 1));
  next?.addEventListener("click", () => go(index + 1));

  root.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") go(index + 1);
    else if (event.key === "ArrowLeft") go(index - 1);
    else if (event.key === "Home") go(0);
    else if (event.key === "End") go(slides.length - 1);
    else return;
    event.preventDefault();
  });

  // Arraste: só captura o ponteiro depois de passar de 6 px (cliques seguem normais).
  let startX = 0;
  let dx = 0;
  let pressed = false;
  let captured = false;
  let suppressClick = false;

  viewport.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pressed = true;
    captured = false;
    startX = event.clientX;
    dx = 0;
  });
  viewport.addEventListener("pointermove", (event) => {
    if (!pressed) return;
    dx = event.clientX - startX;
    if (!captured && Math.abs(dx) > 6) {
      captured = true;
      viewport.setPointerCapture(event.pointerId);
      track.classList.add("is-dragging");
    }
    if (captured) track.style.setProperty("--drag", `${dx}px`);
  });
  const finishDrag = () => {
    if (!pressed) return;
    pressed = false;
    track.classList.remove("is-dragging");
    const threshold = Math.min(120, viewport.clientWidth * 0.18);
    if (captured) suppressClick = true;
    if (dx < -threshold) go(index + 1);
    else if (dx > threshold) go(index - 1);
    else render();
    captured = false;
    dx = 0;
  };
  viewport.addEventListener("pointerup", finishDrag);
  viewport.addEventListener("pointercancel", finishDrag);
  viewport.addEventListener(
    "click",
    (event) => {
      if (!suppressClick) return;
      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    },
    true,
  );

  render();
}

function initCarousels(root = document) {
  $$("[data-carousel]", root).forEach(initCarousel);
}

/* --------------------------------------------------------------------------
   8. Rastro de patinhas no cursor
   Só com mouse (sem toque) e sem "menos movimento". No máximo 4 patinhas na
   tela: quando surge a quinta, a mais antiga some. Cada uma desaparece sozinha.
   -------------------------------------------------------------------------- */
function initPawTrail({
  max = 4,
  spacing = 56,
  src = "img/pata-cursor.png",
  lifetime = 1100,
} = {}) {
  if (prefersReducedMotion()) return;
  if (!window.matchMedia?.("(hover: hover) and (pointer: fine)").matches) return;

  const probe = new Image();
  probe.onload = () => startPawTrail({ max, spacing, src, lifetime });
  probe.src = src;
}

function startPawTrail({ max, spacing, src, lifetime }) {
  const layer = document.createElement("div");
  layer.className = "paw-trail";
  layer.setAttribute("aria-hidden", "true");
  document.body.append(layer);

  let lastX = null;
  let lastY = null;
  let side = 1;

  const spawn = (x, y, angle) => {
    const paw = document.createElement("img");
    paw.className = "paw-print";
    paw.src = src;
    paw.alt = "";
    paw.draggable = false;
    paw.style.left = `${x}px`;
    paw.style.top = `${y}px`;
    paw.style.setProperty("--paw-rot", `${angle}deg`);
    paw.style.setProperty("--paw-life", `${lifetime}ms`);
    paw.addEventListener("animationend", () => paw.remove(), { once: true });
    layer.append(paw);
    while (layer.children.length > max) layer.firstElementChild.remove();
  };

  document.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse") return;
      if (lastX === null) {
        lastX = event.clientX;
        lastY = event.clientY;
        return;
      }
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      const dist = Math.hypot(dx, dy);
      if (dist < spacing) return;
      // Afasta cada pata um pouco para o lado, alternando esquerda/direita.
      const nx = -dy / dist;
      const ny = dx / dist;
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      spawn(event.clientX + nx * 10 * side, event.clientY + ny * 10 * side, angle);
      side *= -1;
      lastX = event.clientX;
      lastY = event.clientY;
    },
    { passive: true },
  );
  document.addEventListener("pointerleave", () => {
    lastX = lastY = null;
  });
}

/* --------------------------------------------------------------------------
   Ponto de entrada
   -------------------------------------------------------------------------- */
function initMotion() {
  if (initMotion.done) return;
  initMotion.done = true;

  setupStagger();
  observeReveals();
  initHeader();
  initHero();
  initMarquee();
  initCounters();
  initAccordion();
  initCarousels();
  initPawTrail();
  document.documentElement.classList.add("motion-ready");
}

window.VetMotion = { revealObserver, initMotion, initCounters, initAccordion, initCarousel, initCarousels, initPawTrail };

})();