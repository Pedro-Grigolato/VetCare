(function () {
"use strict";
const { revealObserver, initMotion } = window.VetMotion;
const extraPets = window.extraPets || [];

/* ---- Dados e regras do catálogo (antes em data.js) ---- */
const basePets = [];
const faq = [];

const normalize = (text) =>
  String(text).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

function filterPets(list, f, favs) {
  const term = normalize(f.search);
  const result = list.filter((p) => {
    if (f.species !== "all" && p.species !== f.species) return false;
    if (f.size !== "all" && p.size !== f.size) return false;
    if (f.age === "puppy" && p.ageMonths >= 12) return false;
    if (f.age === "adult" && (p.ageMonths < 12 || p.ageMonths >= 96)) return false;
    if (f.age === "senior" && p.ageMonths < 96) return false;
    if (term && !normalize(p.name).includes(term)) return false;
    if (f.onlyFavorites && !favs.has(p.id)) return false;
    return true;
  });
  if (f.sort === "name") result.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  else if (f.sort === "young") result.sort((a, b) => a.ageMonths - b.ageMonths);
  else if (f.sort === "old") result.sort((a, b) => b.ageMonths - a.ageMonths);
  return result;
}

function validateInterest(d) {
  const errors = [];
  if (!d.name || d.name.trim().length < 3) errors.push("Informe seu nome completo.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email || "")) errors.push("Informe um e-mail válido.");
  if (String(d.phone || "").replace(/\D/g, "").length < 10) errors.push("Informe um telefone com DDD.");
  if (!d.city || d.city.trim().length < 2) errors.push("Informe sua cidade.");
  if (!d.state) errors.push("Selecione o estado.");
  if (!d.housing) errors.push("Selecione o tipo de residência.");
  if (!d.otherPets) errors.push("Informe se possui outros animais.");
  if (!d.experience) errors.push("Informe se já teve animais.");
  if (!d.reason || d.reason.trim().length < 20) errors.push("Conte um pouco mais sobre por que deseja adotar (mín. 20 caracteres).");
  if (!d.consent) errors.push("É preciso aceitar a política de privacidade.");
  return errors;
}

/* ---- API (antes em api.js): ainda sem integração real ---- */
class IntegrationUnavailable extends Error {}
const api = {
  registerInterest: async () => { throw new IntegrationUnavailable(); },
  contact: async () => { throw new IntegrationUnavailable(); },
};

// Pets do data.js + os 8 novos (sem duplicar ids).
const pets = [
  ...basePets,
  ...extraPets.filter((e) => !basePets.some((p) => p.id === e.id)),
];
const PET_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 140 110'%3E%3Crect width='140' height='110' fill='%23FFD84D'/%3E%3Cg fill='%2370452F' opacity='.75'%3E%3Cellipse cx='70' cy='68' rx='20' ry='16'/%3E%3Cellipse cx='44' cy='50' rx='7' ry='10'/%3E%3Cellipse cx='60' cy='36' rx='7' ry='10'/%3E%3Cellipse cx='80' cy='36' rx='7' ry='10'/%3E%3Cellipse cx='96' cy='50' rx='7' ry='10'/%3E%3C/g%3E%3C/svg%3E";
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const paths = {
  paw: '<path d="M8 14c-3 0-5 5-2 6 2 1 4-1 6-1s4 2 6 1c3-1 1-6-2-6-2-1-2-3-4-3s-2 2-4 3Z"/><ellipse cx="5" cy="9" rx="2" ry="3"/><ellipse cx="10" cy="5" rx="2" ry="3"/><ellipse cx="16" cy="5" rx="2" ry="3"/><ellipse cx="21" cy="10" rx="2" ry="3"/>',
  heart:
    '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  left: '<path d="M20 12H4m6-6-6 6 6 6"/>',
  shield:
    '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-5"/>',
  home: '<path d="m3 10 9-7 9 7v11h-6v-8H9v8H3V10Z"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  check: '<path d="m5 12 4 4L20 5"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',
  edit: '<path d="m15 4 5 5M4 20l4-1L21 6l-4-4L4 15v5Z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  play: '<path d="m7 4 13 8-13 8V4Z"/>',
};
const icon = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.paw}</svg>`;
const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function icons(root = document) {
  $$("[data-icon]", root).forEach(
    (el) => (el.innerHTML = icon(el.dataset.icon)),
  );
}
icons();
$("#year").textContent = new Date().getFullYear();
const filters = {
  species: "all",
  age: "all",
  size: "all",
  search: "",
  sort: "recent",
  onlyFavorites: false,
};
const favorites = new Set();
let shown = new Set();
let limit = 6;
let selectedPet = null;
let returnFocus = null;
let toastTimer;
function ageLabel(months) {
  return months < 12
    ? `${months} meses`
    : `${Math.floor(months / 12)} ${Math.floor(months / 12) === 1 ? "ano" : "anos"}`;
}
const sizeLabel = { small: "Pequeno", medium: "Médio", large: "Grande" };
function syncFavorite(btn, pet, active) {
  btn.classList.toggle("active", active);
  btn.setAttribute("aria-pressed", String(active));
  btn.setAttribute(
    "aria-label",
    `${active ? "Remover" : "Adicionar"} ${pet.name} ${active ? "dos" : "aos"} favoritos`,
  );
  btn.title = `${active ? "Remover dos" : "Adicionar aos"} favoritos`;
  $("#fav-count").textContent = favorites.size;
  const count = $("#fav-count");
  count.classList.remove("bump");
  void count.offsetWidth;
  count.classList.add("bump");
  if (active) {
    btn.classList.remove("pop");
    void btn.offsetWidth;
    btn.classList.add("pop");
    btn.addEventListener("animationend", () => btn.classList.remove("pop"), {
      once: true,
    });
  }
}
function toast(text) {
  $("#toast").textContent = text;
  $("#toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 2500);
}
const observer = revealObserver();
if (observer) {
  document.documentElement.classList.add("js-motion");
  $$(".reveal").forEach((el) => observer.observe(el));
}
function renderPets() {
  const list = filterPets(pets, filters, favorites);
  $("#results-count").textContent =
    `${list.length} ${list.length === 1 ? "amigo encontrado" : "amigos encontrados"}`;
  $("#fav-count").textContent = favorites.size;
  $("#favorites-filter").setAttribute(
    "aria-pressed",
    String(filters.onlyFavorites),
  );
  const page = list.slice(0, limit);
  const entering = page.filter((p) => !shown.has(p.id)).map((p) => p.id);
  const enterClass = (p) => (entering.includes(p.id) ? " reveal" : "");
  const enterDelay = (p) => {
    const n = entering.indexOf(p.id);
    return n < 0 ? 0 : (n % 3) * 70;
  };
  $("#pet-grid").innerHTML =
    page
      .map(
        (p) =>
          `<article class="pet-card${enterClass(p)}" style="--reveal-delay:${enterDelay(p)}ms"><div class="pet-photo"><img src="${p.image}" alt="${escape(p.species === "dog" ? "Cachorro" : "Gato")} representando ${escape(p.name)}, pet de exemplo" width="1400" height="1100" loading="lazy" onerror="this.onerror=null;this.src='${PET_FALLBACK}'"><span class="pet-status"><span class="status-dot"></span> Disponível • exemplo</span><button class="icon-button favorite ${favorites.has(p.id) ? "active" : ""}" data-favorite="${p.id}" aria-label="${favorites.has(p.id) ? "Remover" : "Adicionar"} ${escape(p.name)} ${favorites.has(p.id) ? "dos" : "aos"} favoritos" aria-pressed="${favorites.has(p.id)}" title="${favorites.has(p.id) ? "Remover dos" : "Adicionar aos"} favoritos">${icon("heart")}</button></div><div class="pet-body"><div class="pet-name-row"><h3>${escape(p.name)}</h3><span>${p.sex === "Fêmea" ? "♀" : "♂"} ${p.sex}</span></div><div class="pet-meta"><span>${ageLabel(p.ageMonths)}</span><span>•</span><span>${sizeLabel[p.size]} porte</span><span>•</span><span>${p.species === "dog" ? "Cachorro" : "Gato"}</span></div><div class="pet-location">${icon("pin")} ${escape(p.city)}</div><div class="personality">${p.personality.map((t) => `<span>${escape(t)}</span>`).join("")}</div><button class="pet-button" data-pet="${p.id}">Conhecer ${escape(p.name)} ${icon("arrow")}</button></div></article>`,
      )
      .join("") ||
    `<div class="empty-state">${icon("search")}<h3>Nenhum amigo encontrado por aqui.</h3><p>Experimente outro nome ou ajuste os filtros.</p><button class="button outline" id="empty-reset">Limpar filtros</button></div>`;
  $("#load-more").hidden = list.length <= limit;
  shown = new Set(page.map((p) => p.id));
  if (observer) $$(".pet-card.reveal").forEach((el) => observer.observe(el));
  $("#empty-reset")?.addEventListener("click", resetFilters);
}
function resetFilters() {
  Object.assign(filters, {
    species: "all",
    age: "all",
    size: "all",
    search: "",
    sort: "recent",
    onlyFavorites: false,
  });
  $("#search").value = "";
  $("#age").value = "all";
  $("#size").value = "all";
  $("#sort").value = "recent";
  $$("[data-species]").forEach((b) => {
    b.classList.toggle("active", b.dataset.species === "all");
    b.setAttribute("aria-pressed", String(b.dataset.species === "all"));
  });
  limit = 6;
  renderPets();
}
$$("[data-species]").forEach((b) =>
  b.addEventListener("click", () => {
    filters.species = b.dataset.species;
    $$("[data-species]").forEach((t) => {
      t.classList.toggle("active", t === b);
      t.setAttribute("aria-pressed", String(t === b));
    });
    limit = 6;
    renderPets();
  }),
);
["age", "size", "sort"].forEach((key) =>
  $("#" + key).addEventListener("change", (e) => {
    filters[key] = e.target.value;
    limit = 6;
    renderPets();
  }),
);
$("#search").addEventListener("input", (e) => {
  filters.search = e.target.value;
  limit = 6;
  renderPets();
});
$("#favorites-filter").addEventListener("click", () => {
  filters.onlyFavorites = !filters.onlyFavorites;
  limit = 6;
  renderPets();
});
$("#clear-filters").addEventListener("click", resetFilters);
$("#load-more").addEventListener("click", () => {
  limit += 6;
  renderPets();
});
$("#pet-grid").addEventListener("click", (e) => {
  const fav = e.target.closest("[data-favorite]");
  if (fav) {
    const id = fav.dataset.favorite;
    const pet = pets.find((p) => p.id === id);
    const active = !favorites.has(id);
    active ? favorites.add(id) : favorites.delete(id);
    if (filters.onlyFavorites) {
      renderPets();
      $(`[data-favorite="${id}"]`)?.focus();
      return;
    }
    syncFavorite(fav, pet, active);
    return;
  }
  const btn = e.target.closest("[data-pet]");
  if (btn) openPet(btn.dataset.pet);
});
function openDialog(dialog) {
  returnFocus = document.activeElement;
  dialog.showModal();
  document.body.style.overflow = "hidden";
}
function openPet(id) {
  selectedPet = pets.find((p) => p.id === id);
  if (!selectedPet) return;
  const p = selectedPet;
  $("#pet-detail").innerHTML =
    `<img class="detail-image" src="${p.image}" alt="${escape(p.name)} — fotografia ilustrativa" width="1400" height="900" onerror="this.onerror=null;this.src='${PET_FALLBACK}'"><div class="detail-content"><div class="detail-top"><div><span class="eyebrow">UM NOVO CAPÍTULO</span><h2 id="pet-dialog-title">${escape(p.name)}</h2></div><span class="demo-note">Pet de exemplo</span></div><div class="gallery-nav"><span>Galeria • ${p.images.length} fotografia ilustrativa</span></div><div class="detail-info"><span>${ageLabel(p.ageMonths)} • ${p.sex}</span><span>Porte ${sizeLabel[p.size].toLowerCase()}</span><span>${escape(p.breed)}</span><span>${escape(p.city)}</span></div><div class="personality">${p.personality.map((t) => `<span>${escape(t)}</span>`).join("")}</div><h3>Minha história</h3><p>${escape(p.story)}</p><h3>Cuidados e necessidades</h3><p>${escape(p.needs)}</p><h3>Saúde: confirmação necessária</h3><p>Vacinação: ${escape(p.health.vaccination)}.<br>Castração: ${escape(p.health.neutering)}.</p><h3>Responsável pela adoção</h3><p>${escape(p.guardian)}.</p><button class="button" id="show-interest">Quero dar um lar para este pet ${icon("heart")}</button></div>`;
  $("#show-interest").addEventListener("click", () => {
    const form = $("#interest-form");
    form.reset();
    form.elements.petId.value = p.id;
    form.elements.petName.value = p.name;
    $(".form-status", form).textContent = "";
    $("#pet-dialog").close();
    openDialog($("#interest-dialog"));
  });
  openDialog($("#pet-dialog"));
}
$$("dialog").forEach((dialog) => {
  dialog.addEventListener("close", () => {
    document.body.style.overflow = "";
    if (returnFocus?.isConnected) returnFocus.focus();
  });
  $(".close-dialog", dialog).addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        dialog.close();
    }
  });
});
const toggle = $(".menu-toggle");
function closeMenu() {
  $("#navigation").classList.remove("open");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Abrir menu");
  toggle.innerHTML = icon("menu");
}
toggle.addEventListener("click", () => {
  const open = $("#navigation").classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  toggle.innerHTML = icon(open ? "close" : "menu");
});
$$("#navigation a").forEach((a) => a.addEventListener("click", closeMenu));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && $("#navigation").classList.contains("open")) {
    closeMenu();
    toggle.focus();
  }
});
document.addEventListener("click", (e) => {
  // composedPath(): o ícone do botão é trocado no clique, então e.target já pode estar fora do DOM.
  const path = e.composedPath();
  if (
    $("#navigation").classList.contains("open") &&
    !path.includes($("#navigation")) &&
    !path.includes(toggle)
  )
    closeMenu();
});
window
  .matchMedia("(min-width: 801px)")
  .addEventListener("change", (e) => e.matches && closeMenu());
const faqList = $("#faq-list");
if (faqList) faqList.innerHTML = faq
  .map(
    ([q, a]) =>
      `<details><summary>${escape(q)}</summary><p>${escape(a)}</p></details>`,
  )
  .join("");
$$(".privacy-open").forEach((b) =>
  b.addEventListener("click", () => openDialog($("#privacy-dialog"))),
);
$("#open-register").addEventListener("click", () =>
  openDialog($("#register-dialog")),
);
const states = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];
$("#state-options").innerHTML += states
  .map((s) => `<option value="${s}">${s}</option>`)
  .join("");
function formFeedback(form, text, error = false) {
  const status = $(".form-status", form);
  status.textContent = text;
  status.classList.toggle("error", error);
}
async function submitWithApi(form, action, data) {
  const submit = $('[type="submit"]', form);
  submit.disabled = true;
  try {
    await action(data);
    formFeedback(
      form,
      "Interesse recebido para avaliação pelo responsável. Isso não significa aprovação da adoção.",
    );
    form.reset();
  } catch (error) {
    formFeedback(
      form,
      error instanceof IntegrationUnavailable
        ? "Demonstração concluída: os campos estão válidos, mas nada foi enviado ou registrado. O encaminhamento depende da integração."
        : error.message,
      !(error instanceof IntegrationUnavailable),
    );
  } finally {
    submit.disabled = false;
  }
}
$("#interest-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  const errors = validateInterest(data);
  if (errors.length) {
    formFeedback(e.target, errors.join(" "), true);
    return;
  }
  submitWithApi(e.target, api.registerInterest, data);
});
$("#contact-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  const submit = $('[type="submit"]', form);
  submit.disabled = true;
  try {
    await api.contact(data);
    formFeedback(form, "Mensagem recebida.");
    form.reset();
  } catch (error) {
    formFeedback(
      form,
      error instanceof IntegrationUnavailable
        ? "Sua mensagem está válida, mas não foi enviada. Os canais oficiais e a integração ainda não estão disponíveis."
        : error.message,
      !(error instanceof IntegrationUnavailable),
    );
  } finally {
    submit.disabled = false;
  }
});
let objectUrls = [];
$("#pet-photos").addEventListener("change", (e) => {
  objectUrls.forEach(URL.revokeObjectURL);
  objectUrls = [];
  $("#photo-preview").replaceChildren();
  const files = [...e.target.files];
  if (
    files.length > 6 ||
    files.some(
      (f) =>
        f.size > 5 * 1024 * 1024 ||
        !["image/jpeg", "image/png", "image/webp"].includes(f.type),
    )
  ) {
    e.target.value = "";
    toast("Escolha até 6 imagens JPG, PNG ou WebP, com até 5 MB cada.");
    return;
  }
  files.forEach((file) => {
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    objectUrls.push(url);
    img.src = url;
    img.alt = "Prévia da fotografia selecionada";
    $("#photo-preview").append(img);
  });
});
$("#register-form").addEventListener("submit", (e) => {
  e.preventDefault();
  formFeedback(
    e.target,
    "Prévia validada. Nenhum animal foi publicado ou salvo. O cadastro real exige autorização e integração.",
  );
});
renderPets();

// Números do catálogo: vêm direto de data.js (nada é inventado).
const catalogCounts = {
  total: pets.length,
  dog: pets.filter((p) => p.species === "dog").length,
  cat: pets.filter((p) => p.species === "cat").length,
};
$$("[data-stat]").forEach((el) => {
  el.dataset.counter = String(catalogCounts[el.dataset.stat] ?? 0);
});
// Seção atual: entre as que cruzam a faixa de leitura, vale a mais abaixo no DOM
// (evita o menu marcar a seção anterior quando duas ficam visíveis juntas).
const inReadingBand = new Set();
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) =>
      entry.isIntersecting
        ? inReadingBand.add(entry.target)
        : inReadingBand.delete(entry.target),
    );
    const current = $$("main section[id]")
      .filter((section) => inReadingBand.has(section))
      .pop();
    if (!current) return;
    $$("#navigation a").forEach((link) => {
      if (link.hash === "#" + current.id)
        link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  },
  { rootMargin: "-15% 0px -60% 0px", threshold: 0 },
);
$$("main section[id]").forEach((section) => sectionObserver.observe(section));

initMotion();
})();