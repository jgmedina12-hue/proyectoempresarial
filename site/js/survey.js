// ETHOS landing — pre-booking survey and WhatsApp handoff.
// Questions are adapted from the ETHOS demand survey (October 2026).
(function () {
  "use strict";

  var CONFIG = window.ETHOS_CONFIG || {};
  var STORAGE_KEY = "ethos-survey-v1";

  var QUESTIONS = [
    {
      id: "sector", label: "Sector", type: "single", twoCol: true,
      title: "¿A qué sector pertenece tu negocio?",
      options: ["Comercio", "Gastronomía", "Salud y bienestar", "Servicios profesionales",
                "Educación", "Construcción o industria", "Tecnología", "Otro"]
    },
    {
      id: "ubicacion", label: "Ubicación", type: "single",
      title: "¿Dónde está ubicado?",
      options: ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta", "Otra ciudad"]
    },
    {
      id: "canales", label: "Canales que usa", type: "multi", twoCol: true, exclusive: "Ninguno",
      title: "¿Qué redes o canales digitales usa hoy?",
      hint: "Puedes elegir varios.",
      options: ["Instagram", "Facebook", "WhatsApp Business", "TikTok", "LinkedIn",
                "Página web o tienda en línea", "Google (ficha o anuncios)", "Ninguno"]
    },
    {
      id: "quien", label: "Quién maneja el marketing", type: "single",
      title: "¿Quién maneja hoy las redes y el marketing?",
      options: ["Yo mismo", "Un empleado o familiar", "Un freelancer", "Una agencia", "Nadie lo maneja"]
    },
    {
      id: "medicion", label: "Mide resultados", type: "single",
      title: "¿Mides los resultados de tus redes?",
      options: ["Sí, con indicadores y reportes", "Miro seguidores o \"me gusta\"",
                "No los mido", "No sé cómo medirlos"]
    },
    {
      id: "dificultades", label: "Mayores dificultades", type: "multi", max: 2,
      title: "¿Cuáles son tus dos mayores dificultades con el marketing digital?",
      hint: "Elige hasta 2.",
      options: ["Falta de presupuesto", "Falta de tiempo", "No sé qué estrategia seguir",
                "No sé usar las herramientas", "No puedo medir si da resultado",
                "No encuentro un proveedor confiable"]
    },
    {
      id: "presupuesto", label: "Presupuesto mensual", type: "single",
      title: "¿Cuánto podrías invertir al mes en marketing?",
      hint: "Sin contar lo que pagas en anuncios. Nos ayuda a recomendarte el plan adecuado.",
      options: ["Menos de $800.000", "$800.000 a $1.500.000", "$1.500.000 a $2.500.000",
                "Más de $2.500.000", "Prefiero conversarlo en la reunión"]
    }
  ];
  var ROLES = ["Dueño o socio", "Gerente o administrador", "Encargado de marketing o redes", "Otro"];
  var CONTACT_STEP = QUESTIONS.length;      // index of the contact step
  var DONE_STEP = QUESTIONS.length + 1;     // index of the confirmation screen

  var dialog = document.getElementById("survey");
  var form = document.getElementById("survey-form");
  var body = document.getElementById("survey-body");
  var backBtn = document.getElementById("survey-back");
  var nextBtn = document.getElementById("survey-next");
  var bar = document.getElementById("progress-bar");
  var progressLabel = document.getElementById("progress-label");

  var state = load() || { step: 0, answers: {}, contact: {} };
  var advanceTimer = null;

  // ---------- persistence (per tab; survey keeps progress if closed) ----------
  function load() {
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY)); } catch (e) { return null; }
  }
  function save() {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }
  function reset() {
    state = { step: 0, answers: {}, contact: {} };
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  }

  function track(event, data) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: event }, data || {}));
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
    });
  }

  // ---------- rendering ----------
  function render() {
    clearTimeout(advanceTimer);
    var step = state.step;
    var total = QUESTIONS.length;

    if (step < CONTACT_STEP) {
      bar.style.width = (step / (total + 1)) * 100 + "%";
      progressLabel.textContent = "Pregunta " + (step + 1) + " de " + total + " · menos de 2 minutos";
      renderQuestion(QUESTIONS[step]);
    } else if (step === CONTACT_STEP) {
      bar.style.width = (total / (total + 1)) * 100 + "%";
      progressLabel.textContent = "Último paso";
      renderContact();
    } else {
      bar.style.width = "100%";
      progressLabel.textContent = "¡Listo!";
      renderDone();
    }

    backBtn.style.visibility = step > 0 && step < DONE_STEP ? "visible" : "hidden";
    nextBtn.hidden = step === DONE_STEP;
    nextBtn.textContent = step === CONTACT_STEP ? "Agendar por WhatsApp ›" : "Siguiente";
    updateNext();
    focusFirst();
  }

  function renderQuestion(q) {
    var current = state.answers[q.id];
    var isMulti = q.type === "multi";
    var html = '<fieldset class="options' + (q.twoCol ? " two-col" : "") + '">' +
      '<legend class="q-title">' + esc(q.title) + "</legend>" +
      '<p class="q-hint" style="grid-column:1/-1">' + esc(q.hint || (isMulti ? "Puedes elegir varios." : "Elige una opción.")) + "</p>";
    q.options.forEach(function (opt, i) {
      var checked = isMulti ? (current || []).indexOf(opt) !== -1 : current === opt;
      html += '<label class="opt' + (isMulti ? " multi" : "") + '">' +
        '<input type="' + (isMulti ? "checkbox" : "radio") + '" name="' + q.id + '" value="' + esc(opt) + '"' +
        (checked ? " checked" : "") + ">" +
        '<span class="box" aria-hidden="true">✓</span>' + esc(opt) + "</label>";
    });
    html += "</fieldset>";
    body.innerHTML = html;
    if (isMulti) enforceMultiRules(q);
  }

  function renderContact() {
    var c = state.contact;
    var roleOptions = '<option value="">Selecciona…</option>' + ROLES.map(function (r) {
      return '<option' + (c.cargo === r ? " selected" : "") + ">" + esc(r) + "</option>";
    }).join("");
    body.innerHTML =
      '<h3 class="q-title">¿Con quién hablamos?</h3>' +
      '<p class="q-hint">Con estos datos preparamos tu diagnóstico antes de la reunión.</p>' +
      '<label class="field"><span>Tu nombre</span>' +
        '<input name="nombre" autocomplete="name" required value="' + esc(c.nombre || "") + '"></label>' +
      '<label class="field"><span>Tu cargo</span>' +
        '<select name="cargo" required>' + roleOptions + "</select></label>" +
      '<label class="field"><span>Nombre del negocio</span>' +
        '<input name="negocio" autocomplete="organization" required value="' + esc(c.negocio || "") + '"></label>' +
      '<label class="field"><span>Instagram o página web <small>(opcional)</small></span>' +
        '<input name="redes" placeholder="@tunegocio" value="' + esc(c.redes || "") + '"></label>' +
      '<label class="consent"><input type="checkbox" name="consent"' + (c.consent ? " checked" : "") + ' required>' +
        '<span>Autorizo a ETHOS a usar estos datos para preparar mi diagnóstico y contactarme, según su ' +
        '<a href="politica-de-datos.html" target="_blank" rel="noopener">política de tratamiento de datos</a> (Ley 1581 de 2012).</span></label>' +
      '<p class="error" id="contact-error" role="alert"></p>';
  }

  function renderDone() {
    var url = whatsappUrl();
    body.innerHTML =
      '<div class="done">' +
        '<div class="done-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.3-.5.1-1 .1-3.3-.8-2.7-1.1-4.4-3.9-4.6-4.1-.1-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"/></svg></div>' +
        '<h3 class="q-title">¡Gracias, ' + esc(state.contact.nombre.split(" ")[0]) + "!</h3>" +
        "<p>Abrimos WhatsApp con tus respuestas listas. Solo envía el mensaje y te proponemos un horario para tu reunión de 20 minutos.</p>" +
        '<a class="btn btn-lg btn-wa" href="' + esc(url) + '" target="_blank" rel="noopener">Abrir WhatsApp ›</a>' +
      "</div>";
  }

  function focusFirst() {
    var el = body.querySelector("input:not([type=hidden]), select, a.btn");
    if (el) el.focus({ preventScroll: true });
  }

  // ---------- answers ----------
  function readQuestion(q) {
    var inputs = body.querySelectorAll('input[name="' + q.id + '"]:checked');
    var values = Array.prototype.map.call(inputs, function (i) { return i.value; });
    if (q.type === "multi") state.answers[q.id] = values;
    else state.answers[q.id] = values[0];
    save();
  }

  function enforceMultiRules(q) {
    var inputs = body.querySelectorAll('input[name="' + q.id + '"]');
    var checked = Array.prototype.filter.call(inputs, function (i) { return i.checked; });
    if (q.max) {
      Array.prototype.forEach.call(inputs, function (i) {
        i.disabled = !i.checked && checked.length >= q.max;
      });
    }
  }

  function isAnswered(step) {
    if (step < CONTACT_STEP) {
      var a = state.answers[QUESTIONS[step].id];
      return Array.isArray(a) ? a.length > 0 : !!a;
    }
    return true; // contact step is validated on submit so we can show messages
  }

  function updateNext() {
    nextBtn.disabled = !isAnswered(state.step);
  }

  function readContact() {
    state.contact = {
      nombre: form.nombre.value.trim(),
      cargo: form.cargo.value,
      negocio: form.negocio.value.trim(),
      redes: form.redes.value.trim(),
      consent: form.consent.checked
    };
    save();
  }

  function validateContact() {
    var c = state.contact;
    var problems = [];
    [["nombre", "tu nombre"], ["cargo", "tu cargo"], ["negocio", "el nombre del negocio"]].forEach(function (f) {
      var el = form[f[0]];
      var bad = !c[f[0]];
      el.setAttribute("aria-invalid", bad ? "true" : "false");
      if (bad) problems.push(f[1]);
    });
    var msg = "";
    if (problems.length) msg = "Falta " + problems.join(", ") + ".";
    else if (!c.consent) msg = "Para continuar necesitamos tu autorización de tratamiento de datos.";
    document.getElementById("contact-error").textContent = msg;
    if (msg) {
      var first = body.querySelector('[aria-invalid="true"]') || form.consent;
      first.focus();
    }
    return !msg;
  }

  // ---------- WhatsApp message ----------
  function buildMessage() {
    var c = state.contact;
    var lines = [CONFIG.greeting || "Hola ETHOS 👋 Quiero agendar mi diagnóstico digital gratis.", ""];
    lines.push("*Nombre:* " + c.nombre + " (" + c.cargo + ")");
    lines.push("*Negocio:* " + c.negocio);
    if (c.redes) lines.push("*Instagram / web:* " + c.redes);
    QUESTIONS.forEach(function (q) {
      var a = state.answers[q.id];
      if (Array.isArray(a)) a = a.join(", ");
      if (a) lines.push("*" + q.label + ":* " + a);
    });
    var src = sourceInfo();
    if (src) lines.push("*Origen:* " + src);
    return lines.join("\n");
  }

  function sourceInfo() {
    try {
      var p = new URLSearchParams(window.location.search);
      return [p.get("utm_source"), p.get("utm_medium"), p.get("utm_campaign")].filter(Boolean).join(" / ");
    } catch (e) { return ""; }
  }

  function whatsappUrl() {
    var number = String(CONFIG.whatsappNumber || "").replace(/\D/g, "");
    return "https://wa.me/" + number + "?text=" + encodeURIComponent(buildMessage());
  }

  // ---------- navigation ----------
  function next() {
    if (state.step < CONTACT_STEP) {
      readQuestion(QUESTIONS[state.step]);
      if (!isAnswered(state.step)) return;
      track("ethos_survey_step", { step: state.step + 1, question: QUESTIONS[state.step].id });
      state.step += 1;
      save();
      render();
    } else if (state.step === CONTACT_STEP) {
      readContact();
      if (!validateContact()) return;
      var url = whatsappUrl();
      if (/^5?7?0+$/.test(String(CONFIG.whatsappNumber || "").replace(/\D/g, ""))) {
        console.warn("ETHOS: configure your WhatsApp number in js/config.js");
      }
      track("ethos_survey_complete", { sector: state.answers.sector, presupuesto: state.answers.presupuesto });
      window.open(url, "_blank", "noopener");
      state.step = DONE_STEP;
      save();
      render();
    }
  }

  function back() {
    if (state.step > 0 && state.step < DONE_STEP) {
      if (state.step === CONTACT_STEP) readContact();
      else readQuestion(QUESTIONS[state.step]);
      state.step -= 1;
      save();
      render();
    }
  }

  function open() {
    if (state.step === DONE_STEP) reset();
    render();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    document.body.style.overflow = "hidden";
    track("ethos_survey_open");
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  // ---------- events ----------
  document.querySelectorAll("[data-open-survey]").forEach(function (btn) {
    btn.addEventListener("click", open);
  });
  dialog.querySelectorAll("[data-close-survey]").forEach(function (btn) {
    btn.addEventListener("click", close);
  });
  dialog.addEventListener("close", function () {
    clearTimeout(advanceTimer);
    document.body.style.overflow = "";
  });
  // click on the dark backdrop closes the dialog
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) close();
  });

  body.addEventListener("change", function (e) {
    var input = e.target;
    if (state.step >= CONTACT_STEP || !input.name) return;
    var q = QUESTIONS[state.step];
    if (q.type === "multi") {
      if (q.exclusive) {
        var all = body.querySelectorAll('input[name="' + q.id + '"]');
        Array.prototype.forEach.call(all, function (i) {
          if (input.checked && input.value === q.exclusive && i !== input) i.checked = false;
          if (input.checked && input.value !== q.exclusive && i.value === q.exclusive) i.checked = false;
        });
      }
      enforceMultiRules(q);
      readQuestion(q);
      updateNext();
    } else {
      readQuestion(q);
      updateNext();
      // single choice: move on automatically after a short pause
      advanceTimer = setTimeout(next, 280);
    }
  });

  nextBtn.addEventListener("click", next);
  backBtn.addEventListener("click", back);
  form.addEventListener("submit", function (e) { e.preventDefault(); next(); });

  // ---------- sticky mobile CTA ----------
  var sticky = document.getElementById("sticky-cta");
  var hero = document.querySelector(".hero");
  var finalCta = document.querySelector(".final-cta");
  if (sticky && "IntersectionObserver" in window) {
    var heroVisible = true, finalVisible = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.target === hero) heroVisible = en.isIntersecting;
        if (en.target === finalCta) finalVisible = en.isIntersecting;
      });
      sticky.classList.toggle("show", !heroVisible && !finalVisible);
    });
    io.observe(hero);
    io.observe(finalCta);
  }

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // exposed for testing in the browser console
  window.ETHOS_SURVEY = { buildMessage: buildMessage, whatsappUrl: whatsappUrl, state: function () { return state; } };
})();
