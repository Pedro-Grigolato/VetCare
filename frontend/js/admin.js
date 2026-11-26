(function () {
  "use strict";
  const KEY = "vetcare-admin-animais";
  const STATUS = { available: "Disponível", process: "Em processo", adopted: "Adotado", inactive: "Inativo" };
  const SIZE = { small: "Pequeno", medium: "Médio", large: "Grande" };
  const SPECIES = { dog: "Cachorro", cat: "Gato" };
  const $ = (s) => document.querySelector(s);

  const seed = (window.extraPets || []).map((p) => ({
    id: p.id, name: p.name, species: p.species, sex: p.sex, ageMonths: p.ageMonths,
    size: p.size, breed: p.breed, city: p.city, story: p.story, image: p.image, status: "available",
  }));

  let pets = load();
  let filter = "all", term = "", editingId = null;
  let view = "animais", leadFilter = "all", leadTerm = "";

  function load() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    if (!Array.isArray(saved)) return seed.map((p) => ({ ...p }));
    // Fotos dos animais do site vêm sempre de pets-extra.js, para admin e site ficarem iguais.
    // Só fotos enviadas pelo próprio admin (data:) são mantidas.
    const byId = new Map(seed.map((p) => [p.id, p]));
    saved.forEach((p) => {
      const s = byId.get(p.id);
      if (s && !String(p.image).startsWith("data:")) p.image = s.image;
    });
    seed.forEach((s) => { if (!saved.some((p) => p.id === s.id)) saved.push({ ...s }); });
    return saved;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(pets)); } catch (e) { toast("Não foi possível salvar neste navegador."); } }

  const norm = (t) => String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const age = (m) => (m < 12 ? `${m} ${m === 1 ? "mês" : "meses"}` : `${Math.floor(m / 12)} ${Math.floor(m / 12) === 1 ? "ano" : "anos"}`);

  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toast.id); toast.id = setTimeout(() => (t.hidden = true), 2600);
  }

  function render() {
    const list = pets.filter((p) => (filter === "all" || p.status === filter) && (!term || norm(p.name).includes(term) || norm(p.breed).includes(term)));
    $("#rows").innerHTML = list.map((p) => `
      <tr class="${p.status === "inactive" ? "is-inactive" : ""}">
        <td><img class="thumb" src="${esc(p.image)}" alt="Foto de ${esc(p.name)}" /></td>
        <td class="name">${esc(p.name)}</td>
        <td>${SPECIES[p.species] || ""}</td>
        <td>${age(p.ageMonths)}</td>
        <td>${SIZE[p.size] || ""}</td>
        <td><span class="badge ${p.status}">${STATUS[p.status]}</span></td>
        <td class="col-act"><div class="icons">
          <button class="icon-btn" data-act="view" data-id="${esc(p.id)}" title="Ver" aria-label="Ver ${esc(p.name)}">👁</button>
          <button class="icon-btn" data-act="edit" data-id="${esc(p.id)}" title="Editar" aria-label="Editar ${esc(p.name)}">✎</button>
          <button class="icon-btn" data-act="toggle" data-id="${esc(p.id)}" title="${p.status === "inactive" ? "Reativar" : "Inativar"}" aria-label="${p.status === "inactive" ? "Reativar" : "Inativar"} ${esc(p.name)}">${p.status === "inactive" ? "↺" : "⏻"}</button>
        </div></td>
      </tr>`).join("");
    $("#empty").hidden = list.length > 0;
    $("#count").textContent = `${list.length} ${list.length === 1 ? "animal" : "animais"}`;
  }

  function openView(p) {
    $("#view-body").innerHTML = `
      <img class="view-photo" src="${esc(p.image)}" alt="Foto de ${esc(p.name)}" />
      <div class="view-body">
        <h2 id="view-name">${esc(p.name)}</h2>
        <span class="badge ${p.status}">${STATUS[p.status]}</span>
        <dl>
          <div><dt>Espécie</dt><dd>${SPECIES[p.species]}</dd></div>
          <div><dt>Sexo</dt><dd>${esc(p.sex)}</dd></div>
          <div><dt>Idade</dt><dd>${age(p.ageMonths)}</dd></div>
          <div><dt>Porte</dt><dd>${SIZE[p.size]}</dd></div>
          <div><dt>Raça</dt><dd>${esc(p.breed)}</dd></div>
          <div><dt>Cidade</dt><dd>${esc(p.city)}</dd></div>
        </dl>
        <p>${esc(p.story)}</p>
      </div>`;
    $("#view-dialog").showModal();
  }

  function openForm(p) {
    const f = $("#pet-form");
    f.reset(); $("#form-error").hidden = true;
    editingId = p ? p.id : null;
    $("#form-title").textContent = p ? `Editar ${p.name}` : "Novo animal";
    if (p) {
      const years = p.ageMonths >= 12 && p.ageMonths % 12 === 0;
      f.name.value = p.name; f.species.value = p.species; f.sex.value = p.sex; f.size.value = p.size;
      f.age.value = years ? p.ageMonths / 12 : p.ageMonths; f.unit.value = years ? "years" : "months";
      f.breed.value = p.breed; f.city.value = p.city; f.status.value = p.status; f.story.value = p.story;
    }
    $("#form-dialog").showModal();
  }

  const readFile = (file) => new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = no; r.readAsDataURL(file); });

  async function submit(e) {
    e.preventDefault();
    const f = e.target, err = $("#form-error");
    const name = f.name.value.trim(), n = Number(f.age.value);
    if (name.length < 2) return fail("Informe o nome do animal.");
    if (f.age.value === "" || !(n >= 0)) return fail("Informe uma idade válida.");
    function fail(m) { err.textContent = m; err.hidden = false; }

    const old = pets.find((p) => p.id === editingId);
    let image = old ? old.image : (f.species.value === "cat" ? "img/pets/gato1.jpg" : "img/pets/dog1.jpg");
    const file = f.photo.files[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) return fail("A foto deve ter até 1,5 MB.");
      try { image = await readFile(file); } catch (x) { return fail("Não foi possível ler a foto."); }
    }
    const data = {
      name, species: f.species.value, sex: f.sex.value, size: f.size.value,
      ageMonths: f.unit.value === "years" ? Math.round(n * 12) : Math.round(n),
      breed: f.breed.value.trim() || "Sem raça definida", city: f.city.value.trim(),
      status: f.status.value, story: f.story.value.trim(), image,
    };
    if (old) Object.assign(old, data);
    else pets.unshift({ id: "adm-" + Date.now(), ...data });
    save(); render();
    $("#form-dialog").close();
    toast(old ? "Animal atualizado." : "Animal cadastrado.");
  }

  $("#rows").addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const p = pets.find((x) => x.id === b.dataset.id); if (!p) return;
    if (b.dataset.act === "view") openView(p);
    if (b.dataset.act === "edit") openForm(p);
    if (b.dataset.act === "toggle") {
      p.status = p.status === "inactive" ? "available" : "inactive";
      save(); render(); toast(p.status === "inactive" ? `${p.name} inativado.` : `${p.name} reativado.`);
    }
  });
  $("#tabs").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    filter = b.dataset.status;
    document.querySelectorAll("#tabs button").forEach((x) => x.classList.toggle("is-active", x === b));
    render();
  });
  $("#search").addEventListener("input", (e) => {
    if (view === "animais") { term = norm(e.target.value); render(); }
    else { leadTerm = norm(e.target.value); renderLeads(); }
  });
  $("#new-pet").addEventListener("click", () => openForm(null));
  $("#pet-form").addEventListener("submit", submit);
  document.querySelectorAll("dialog").forEach((d) => {
    d.addEventListener("click", (e) => { if (e.target === d || e.target.closest("[data-close]")) d.close(); });
  });

  /* ---------------- Interessados ---------------- */
  const LKEY = "vetcare-admin-interessados";
  const LSTATUS = { new: "Novo", contact: "Em contato", visit: "Visita agendada", approved: "Aprovado", declined: "Recusado" };

  // Exemplos fictícios (e-mails em example.com, telefones fora de uso) com os mesmos campos do formulário do site.
  const leadSeed = [
    { id: "l1", name: "Ana Beatriz Souza", email: "ana.souza@example.com", phone: "(14) 90000-0001", city: "Botucatu", state: "SP", housing: "Casa", otherPets: "Não", experience: "Sim", petId: "extra-thor", date: "2026-11-22", status: "new", reason: "Sempre quis um cachorro e agora tenho quintal e tempo para passeios diários." },
    { id: "l2", name: "Carlos Eduardo Lima", email: "carlos.lima@example.com", phone: "(14) 90000-0002", city: "Botucatu", state: "SP", housing: "Apartamento", otherPets: "Sim", experience: "Sim", petId: "extra-luna", date: "2026-11-21", status: "contact", reason: "Já tenho um gato adulto e quero uma companhia para ele. A varanda é protegida com tela." },
    { id: "l3", name: "Mariana Ribeiro", email: "mariana.ribeiro@example.com", phone: "(14) 90000-0003", city: "Lençóis Paulista", state: "SP", housing: "Casa", otherPets: "Não", experience: "Não", petId: "extra-mel", date: "2026-11-20", status: "visit", reason: "Moro com meus pais, que também apoiam a adoção. Procuro uma cachorrinha calma." },
    { id: "l4", name: "João Pedro Alves", email: "joao.alves@example.com", phone: "(14) 90000-0004", city: "São Manuel", state: "SP", housing: "Sítio / chácara", otherPets: "Sim", experience: "Sim", petId: "extra-bob", date: "2026-11-18", status: "approved", reason: "Tenho espaço de sobra e já criei cachorros grandes. Quero dar um lar para o Bob." },
    { id: "l5", name: "Fernanda Costa", email: "fernanda.costa@example.com", phone: "(14) 90000-0005", city: "Botucatu", state: "SP", housing: "Apartamento", otherPets: "Não", experience: "Sim", petId: "extra-tom", date: "2026-11-17", status: "declined", reason: "Quero adotar um gatinho idoso para fazer companhia no home office." },
    { id: "l6", name: "Rafael Martins", email: "rafael.martins@example.com", phone: "(14) 90000-0006", city: "Avaré", state: "SP", housing: "Casa", otherPets: "Não", experience: "Não", petId: "extra-pipoca", date: "2026-11-23", status: "new", reason: "Procuro um cão idoso e tranquilo para fazer companhia à minha avó." },
  ];

  let leads = loadLeads();
  function loadLeads() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(LKEY)) || {}; } catch (e) {}
    return leadSeed.map((l) => ({ ...l, status: saved[l.id] || l.status }));
  }
  function saveLeads() {
    const map = {}; leads.forEach((l) => (map[l.id] = l.status));
    try { localStorage.setItem(LKEY, JSON.stringify(map)); } catch (e) { toast("Não foi possível salvar neste navegador."); }
  }
  const initials = (n) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const fmtDate = (iso) => { const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}`; };
  const petOf = (l) => pets.find((p) => p.id === l.petId);
  const statusOptions = (cur) => Object.entries(LSTATUS).map(([k, v]) => `<option value="${k}"${k === cur ? " selected" : ""}>${v}</option>`).join("");

  function renderLeads() {
    const list = leads.filter((l) => {
      const p = petOf(l);
      return (leadFilter === "all" || l.status === leadFilter) &&
        (!leadTerm || [l.name, l.email, l.city, p ? p.name : ""].some((t) => norm(t).includes(leadTerm)));
    });
    $("#lead-rows").innerHTML = list.map((l) => {
      const p = petOf(l);
      return `<tr>
        <td><div class="person"><span class="avatar" aria-hidden="true">${esc(initials(l.name))}</span><div><span class="name">${esc(l.name)}</span><small>${esc(l.email)}</small></div></div></td>
        <td>${p ? `<div class="pet-mini"><img class="thumb" src="${esc(p.image)}" alt="Foto de ${esc(p.name)}" /><div><span class="name">${esc(p.name)}</span><small>${SPECIES[p.species]} · ${age(p.ageMonths)}</small></div></div>` : "—"}</td>
        <td>${esc(l.phone)}</td>
        <td>${esc(l.city)}/${esc(l.state)}</td>
        <td>${fmtDate(l.date)}</td>
        <td><select class="status-select ${l.status}" data-lead-status="${l.id}" aria-label="Andamento de ${esc(l.name)}">${statusOptions(l.status)}</select></td>
        <td class="col-act"><div class="icons"><button class="icon-btn" data-lead-view="${l.id}" title="Ver detalhes" aria-label="Ver detalhes de ${esc(l.name)}">👁</button></div></td>
      </tr>`;
    }).join("");
    $("#lead-empty").hidden = list.length > 0;
    $("#leads-count").textContent = `${list.length} ${list.length === 1 ? "pedido" : "pedidos"}`;
    const fresh = leads.filter((l) => l.status === "new").length;
    const badge = $("#leads-new"); badge.textContent = fresh; badge.hidden = fresh === 0;
    document.querySelectorAll("#lead-tabs button").forEach((b) => {
      const k = b.dataset.status, n = k === "all" ? leads.length : leads.filter((l) => l.status === k).length;
      b.textContent = `${b.textContent.replace(/ \(\d+\)$/, "")} (${n})`;
    });
  }

  function openLead(l) {
    const p = petOf(l);
    $("#lead-body").innerHTML = `
      <div class="lead-head"><span class="avatar" aria-hidden="true">${esc(initials(l.name))}</span><div><h2 id="lead-name">${esc(l.name)}</h2><small>Pedido em ${fmtDate(l.date)}</small></div></div>
      <div class="lead-body">
        <dl>
          <div><dt>E-mail</dt><dd><a href="mailto:${esc(l.email)}">${esc(l.email)}</a></dd></div>
          <div><dt>Telefone</dt><dd><a href="tel:${esc(l.phone.replace(/[^\d+]/g, ""))}">${esc(l.phone)}</a></dd></div>
          <div><dt>Cidade</dt><dd>${esc(l.city)}/${esc(l.state)}</dd></div>
          <div><dt>Tipo de residência</dt><dd>${esc(l.housing)}</dd></div>
          <div><dt>Possui outros animais?</dt><dd>${esc(l.otherPets)}</dd></div>
          <div><dt>Já teve animais?</dt><dd>${esc(l.experience)}</dd></div>
        </dl>
        <h3>Pet de interesse</h3>
        ${p ? `<div class="lead-pet"><img src="${esc(p.image)}" alt="Foto de ${esc(p.name)}" /><div><strong>${esc(p.name)}</strong><br><small>${SPECIES[p.species]} · ${age(p.ageMonths)} · ${SIZE[p.size]} porte · ${STATUS[p.status]}</small></div></div>` : "<p>Animal não encontrado.</p>"}
        <h3>Por que quer adotar</h3>
        <p>${esc(l.reason)}</p>
        <div class="lead-status"><label for="lead-status-sel">Andamento</label>
          <select id="lead-status-sel" data-lead-status="${l.id}">${statusOptions(l.status)}</select></div>
      </div>`;
    $("#lead-dialog").showModal();
  }

  function setLeadStatus(id, value) {
    const l = leads.find((x) => x.id === id); if (!l) return;
    l.status = value; saveLeads(); renderLeads();
    toast(`${l.name}: ${LSTATUS[value]}.`);
  }
  document.addEventListener("change", (e) => {
    const s = e.target.closest("[data-lead-status]");
    if (s && s.tagName === "SELECT") setLeadStatus(s.dataset.leadStatus, s.value);
  });
  $("#lead-rows").addEventListener("click", (e) => {
    const b = e.target.closest("[data-lead-view]"); if (!b) return;
    const l = leads.find((x) => x.id === b.dataset.leadView); if (l) openLead(l);
  });
  $("#lead-tabs").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    leadFilter = b.dataset.status;
    document.querySelectorAll("#lead-tabs button").forEach((x) => x.classList.toggle("is-active", x === b));
    renderLeads();
  });

  function showView(name) {
    view = name;
    $("#view-animais").hidden = name !== "animais";
    $("#view-interessados").hidden = name !== "interessados";
    document.querySelectorAll(".adm-sub [data-view]").forEach((b) => b.classList.toggle("is-current", b.dataset.view === name));
    const s = $("#search");
    s.placeholder = name === "animais" ? "Buscar animal..." : "Buscar interessado...";
    s.setAttribute("aria-label", s.placeholder.replace("...", ""));
    s.value = name === "animais" ? term : leadTerm;
    try { history.replaceState(null, "", name === "animais" ? location.pathname : "#interessados"); } catch (e) {}
  }
  document.querySelectorAll(".adm-sub [data-view]").forEach((b) => b.addEventListener("click", () => showView(b.dataset.view)));

  render();
  renderLeads();
  if (location.hash === "#interessados") showView("interessados");
})();