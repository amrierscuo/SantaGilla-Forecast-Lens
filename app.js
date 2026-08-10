"use strict";

const COLORS = { ours: "#d84a5f", glm: "#76535b", direct: "#d99a35", recursive: "#24805f", cop: "#176ea6", sat: "#1aa3a3", actual: "#173631", corrected: "#d84a5f", original: "#176ea6", grid: "#dce6e1", muted: "#6b7c76" };
const $ = (selector) => document.querySelector(selector);
let DATA;
let selectedDate;
let currentLang = "it";

try {
  currentLang = localStorage.getItem("sg-language") === "en" ? "en" : "it";
} catch (_) {
  currentLang = "it";
}

const TEXT = {
  it: {
    "meta.description": "Confronto operativo tra la previsione termica modellata per Santa Gilla, Copernicus Marine e dati meteorologici pubblici.",
    skip: "Vai al contenuto",
    "nav.label": "Navigazione principale", "nav.water": "Acqua", "nav.multimodel": "Multimodello", "nav.verify": "Verifica", "nav.sources": "Fonti",
    "language.label": "Lingua dell'interfaccia",
    "hero.eyebrow": "Indicatore operativo scientifico", "hero.title": "Previsione lagunare e mare aperto, nello stesso quadro.",
    "hero.lead": "Il nostro modello enhanced resta in primo piano. Copernicus Marine, satellite e meteo pubblico forniscono il contesto necessario per leggere differenze, traiettorie e limiti.",
    "hero.compare": "Confronta oggi", "hero.method": "Come leggere i dati",
    "status.aria": "Stato del prodotto", "status.snapshot": "Snapshot verificato", "status.loading": "Caricamento",
    "status.updated": "Aggiornato {date}", "status.area": "Area", "status.model": "Modello", "status.access": "Accesso",
    "status.privacy": "Nessun dato osservativo privato è distribuito dal sito.",
    "water.eyebrow": "Confronto termico giornaliero", "water.title": "Acqua modellata e contesto Copernicus",
    "water.dateSelector": "Seleziona la data", "water.previous": "Data precedente", "water.date": "Data", "water.next": "Data successiva", "water.today": "Oggi",
    "water.ourModel": "Nostro modello", "water.lagoon": "Acqua Santa Gilla", "water.rangeUnavailable": "Intervallo non disponibile",
    "water.medModel": "Modello Mediterraneo", "water.surface": "Superficie, Golfo di Cagliari", "water.observation": "Osservazione L4",
    "water.lastAvailable": "Ultimo dato disponibile", "water.public": "Pubblico", "water.dailyMinMax": "Min e max giornalieri",
    "diff.aria": "Differenze calcolate", "diff.copGlm": "Copernicus meno GLM", "diff.satGlm": "Satellite meno GLM",
    "diff.copSat": "Copernicus meno satellite", "diff.refresh": "Aggiorna dato pubblico", "diff.updating": "Aggiornamento",
    "mm.eyebrow": "Previsione operativa notebook 03", "mm.title": "GLM, direct e recursive nello stesso giorno valido",
    "mm.intro": "La curva recursive seleziona a ogni lead il vincitore ufficiale del 03. I punti direct compaiono solo agli orizzonti addestrati.",
    "mm.horizon": "Lead operativo", "mm.recursive": "Enhanced recursive", "mm.direct": "Direct selezionato",
    "mm.directAvailability": "Disponibile a +1, +3, +5, +7 e +14", "mm.delta": "Enhanced meno GLM",
    "mm.deltaNote": "Differenza tra due previsioni lagunari", "mm.winner": "Vincitore recursive",
    "mm.target": "Valido il {date} - lead +{lead}", "mm.winnerNote": "Target {mode}",
    "mm.disclosure": "Le curve operative pubbliche sono un replay locale a risorse limitate. Le metriche di skill qui sotto restano quelle ufficiali del full run 03.",
    "trajectory.title": "Traiettoria termica", "trajectory.subtitle": "Laguna modellata e superficie offshore non sono lo stesso target.",
    "trajectory.legend": "Legenda", "trajectory.chartAria": "Grafico della traiettoria termica", "trajectory.tableAria": "Dati del grafico termico",
    "trajectory.caption": "Valori della traiettoria termica", "trajectory.date": "Data",
    "reading.eyebrow": "Lettura corretta", "reading.defaultTitle": "Confronto, non validazione diretta",
    "reading.defaultText": "Il modello Copernicus non risolve l'interno della laguna. La differenza quantifica il contrasto tra la stima lagunare e il mare esterno.",
    "reading.anomaly": "Anomalia GLM", "reading.p90": "Soglia p90", "reading.p95": "Soglia p95",
    "reading.caution": "Un superamento modellato indica rischio termico. Non conferma una heatwave osservata senza un logger recente indipendente.",
    "reading.high": "Rischio termico modellato elevato", "reading.risk": "Rischio termico modellato", "reading.below": "Condizione modellata sotto p90",
    "weather.aria": "Contesto meteorologico", "weather.clear": "Sereno", "weather.partly": "Poco nuvoloso", "weather.cloudy": "Coperto",
    "weather.fog": "Nebbia", "weather.drizzle": "Pioviggine", "weather.rain": "Pioggia", "weather.storm": "Temporale", "weather.variable": "Variabile",
    "weather.maxWind": "Vento massimo", "weather.precipitation": "Precipitazione", "weather.uv": "Indice UV", "weather.sunshine": "Sole utile",
    "weather.airRange": "{min}-{max} °C aria", "weather.precipDetail": "{mm} mm - {prob}%", "weather.hours": "{hours} ore",
    "verify.eyebrow": "Previsione, correzione e dato reale pubblico", "verify.title": "La correzione si avvicina davvero?",
    "verify.intro": "Verifica 2026 della temperatura dell'aria a Santa Gilla. Qui il riferimento è disponibile e il confronto è omogeneo.",
    "verify.horizon": "Orizzonte", "verify.day1": "+1 giorno", "verify.day3": "+3 giorni", "verify.day5": "+5 giorni", "verify.day7": "+7 giorni",
    "verify.rmseOriginal": "RMSE originale", "verify.rmseCorrected": "RMSE corretto", "verify.rmseChange": "Variazione RMSE", "verify.days": "Giorni valutati",
    "verify.improved": "A +{lead} giorni la correzione riduce l'RMSE. È più vicina al dato reale del forecast originale.",
    "verify.worse": "A +{lead} giorni il forecast originale è migliore. La correzione aumenta l'RMSE di {change}% e non viene promossa.",
    "air.title": "Traiettoria osservata, originale e corretta", "air.subtitle": "Le tre serie usano lo stesso giorno valido.",
    "air.actual": "Dato reale", "air.original": "Originale", "air.corrected": "Corretta", "air.chartAria": "Grafico della verifica delle previsioni",
    "air.foot": "I dati meteorologici di riferimento sono pubblici. La correzione resta sperimentale.",
    "skill.eyebrow": "Skill ufficiale notebook 03", "skill.title": "Quale famiglia vince a ogni orizzonte?",
    "skill.intro": "Sono pubblicate solo metriche aggregate. Full run direct, sanity check observed-day e recursive hanno protocolli diversi e non sono una classifica unica.",
    "skill.horizon": "Orizzonte", "skill.directWinner": "Vincitore observed-day", "skill.directRmse": "RMSE observed-day",
    "skill.recursiveWinner": "Vincitore recursive", "skill.recursiveRmse": "RMSE recursive", "skill.chartTitle": "RMSE aggregato per lead",
    "skill.chartSubtitle": "Tre protocolli ufficiali, mostrati separatamente sullo stesso asse.", "skill.fullrun": "Direct full run",
    "skill.observed": "Direct observed-day", "skill.recursiveLegend": "Recursive rollout", "skill.chartAria": "Metriche aggregate del notebook 03",
    "skill.privacy": "Nessuna temperatura d'acqua osservata riga-per-riga e pubblicata.",
    "skill.sample": "Observed-day n={direct}; recursive n={recursive}. Metriche aggregate del full run ufficiale.",
    "sources.eyebrow": "Tracciabilità", "sources.title": "Cosa usa questa previsione", "sources.open": "Apri la fonte ufficiale ↗",
    "privacy.badge": "PRIVATO", "privacy.title": "Confine privato",
    "privacy.text": "Gli Excel scientifici originali, le osservazioni riga-per-riga, i coefficienti e il file addestrato non sono inclusi né richiesti dal sito.",
    "privacy.factsAria": "Garanzie di riservatezza", "privacy.fact1": "Solo risultati aggregati", "privacy.fact2": "Nessun login o database",
    "privacy.fact3": "Nessuna scrittura pubblica", "privacy.fact4": "Nessun identificativo di stazione", "privacy.policy": "Leggi la policy dati",
    "footer.prototype": "Prototipo scientifico operativo. Non adatto alla navigazione o ad allerta sanitaria.",
    "footer.texture": "Texture visive adattate dagli asset Computational-Physics / MQ.", "footer.project": "Progetto", "footer.data": "Dati", "footer.notes": "Note",
    noscript: "Il tool richiede JavaScript per grafici e selezione delle date.",
    "common.unavailable": "Non disponibile", "dynamic.range": "Intervallo 5-95%: {low}-{high} °C", "dynamic.l4": "Dato L4 del {date}",
    "dynamic.noPrevious": "Nessun dato precedente disponibile", "dynamic.proxyRange": "Intervallo {min}-{max} °C", "dynamic.noMinMax": "Min e max non disponibili",
    "dynamic.aboveP95": "sopra p95", "dynamic.aboveP90": "sopra p90", "dynamic.belowP90": "sotto p90",
    "dynamic.truth": "{date} - GLM lagunare {thermal}. Copernicus e satellite descrivono il punto offshore e non sostituiscono un logger interno.",
    "dynamic.spatial": "Il mare esterno modellato è {delta} °C {direction} della stima lagunare. È un contrasto spaziale, non un errore del GLM.",
    "dynamic.warmer": "più caldo", "dynamic.cooler": "più freddo", "dynamic.noCop": "Copernicus non è disponibile per questa data. La stima lagunare resta visualizzata con le sue soglie.",
    "dynamic.updated": "{count} serie pubbliche aggiornate per {date}.", "dynamic.liveError": "La fonte live non risponde. Rimane visibile lo snapshot verificato.",
    "dynamic.dataError": "Il dataset pubblico non è disponibile. Ricaricare la pagina o consultare il manifest."
  },
  en: {
    "meta.description": "Operational comparison of the Santa Gilla modelled thermal forecast, Copernicus Marine and public weather data.",
    skip: "Skip to content",
    "nav.label": "Main navigation", "nav.water": "Water", "nav.multimodel": "Multimodel", "nav.verify": "Verification", "nav.sources": "Sources",
    "language.label": "Interface language",
    "hero.eyebrow": "Scientific operational indicator", "hero.title": "Lagoon forecast and open sea, in one view.",
    "hero.lead": "Our enhanced model remains in focus. Copernicus Marine, satellite and public weather data provide the context needed to read differences, trajectories and limitations.",
    "hero.compare": "Compare today", "hero.method": "How to read the data",
    "status.aria": "Product status", "status.snapshot": "Verified snapshot", "status.loading": "Loading",
    "status.updated": "Updated {date}", "status.area": "Area", "status.model": "Model", "status.access": "Access",
    "status.privacy": "No private observational data are distributed by this site.",
    "water.eyebrow": "Daily thermal comparison", "water.title": "Modelled water and Copernicus context",
    "water.dateSelector": "Select date", "water.previous": "Previous date", "water.date": "Date", "water.next": "Next date", "water.today": "Today",
    "water.ourModel": "Our model", "water.lagoon": "Santa Gilla water", "water.rangeUnavailable": "Range unavailable",
    "water.medModel": "Mediterranean model", "water.surface": "Surface, Gulf of Cagliari", "water.observation": "L4 observation",
    "water.lastAvailable": "Latest available value", "water.public": "Public", "water.dailyMinMax": "Daily minimum and maximum",
    "diff.aria": "Calculated differences", "diff.copGlm": "Copernicus minus GLM", "diff.satGlm": "Satellite minus GLM",
    "diff.copSat": "Copernicus minus satellite", "diff.refresh": "Refresh public data", "diff.updating": "Updating",
    "mm.eyebrow": "Operational Notebook 03 forecast", "mm.title": "GLM, direct and recursive on the same valid day",
    "mm.intro": "At each lead, the recursive curve selects the official Notebook 03 winner. Direct points appear only at trained horizons.",
    "mm.horizon": "Operational lead", "mm.recursive": "Enhanced recursive", "mm.direct": "Selected direct",
    "mm.directAvailability": "Available at +1, +3, +5, +7 and +14", "mm.delta": "Enhanced minus GLM",
    "mm.deltaNote": "Difference between two lagoon forecasts", "mm.winner": "Recursive winner",
    "mm.target": "Valid {date} - lead +{lead}", "mm.winnerNote": "Target {mode}",
    "mm.disclosure": "Public operational curves are a resource-bounded local replay. Skill metrics below remain the official full-run Notebook 03 results.",
    "trajectory.title": "Thermal trajectory", "trajectory.subtitle": "The modelled lagoon and offshore surface are not the same target.",
    "trajectory.legend": "Legend", "trajectory.chartAria": "Thermal trajectory chart", "trajectory.tableAria": "Thermal chart data",
    "trajectory.caption": "Thermal trajectory values", "trajectory.date": "Date",
    "reading.eyebrow": "Correct interpretation", "reading.defaultTitle": "Comparison, not direct validation",
    "reading.defaultText": "The Copernicus model does not resolve the inside of the lagoon. The difference quantifies the contrast between the lagoon estimate and the open sea.",
    "reading.anomaly": "GLM anomaly", "reading.p90": "p90 threshold", "reading.p95": "p95 threshold",
    "reading.caution": "A modelled exceedance indicates thermal risk. It does not confirm an observed heatwave without a recent independent logger.",
    "reading.high": "High modelled thermal risk", "reading.risk": "Modelled thermal risk", "reading.below": "Modelled condition below p90",
    "weather.aria": "Weather context", "weather.clear": "Clear", "weather.partly": "Partly cloudy", "weather.cloudy": "Overcast",
    "weather.fog": "Fog", "weather.drizzle": "Drizzle", "weather.rain": "Rain", "weather.storm": "Thunderstorm", "weather.variable": "Variable",
    "weather.maxWind": "Maximum wind", "weather.precipitation": "Precipitation", "weather.uv": "UV index", "weather.sunshine": "Useful sunshine",
    "weather.airRange": "{min}-{max} °C air", "weather.precipDetail": "{mm} mm - {prob}%", "weather.hours": "{hours} hours",
    "verify.eyebrow": "Forecast, correction and public observed value", "verify.title": "Does the correction really get closer?",
    "verify.intro": "2026 verification of air temperature at Santa Gilla. Here a reference is available and the comparison is homogeneous.",
    "verify.horizon": "Horizon", "verify.day1": "+1 day", "verify.day3": "+3 days", "verify.day5": "+5 days", "verify.day7": "+7 days",
    "verify.rmseOriginal": "Original RMSE", "verify.rmseCorrected": "Corrected RMSE", "verify.rmseChange": "RMSE change", "verify.days": "Evaluated days",
    "verify.improved": "At +{lead} days, the correction reduces RMSE. It is closer to the observed value than the original forecast.",
    "verify.worse": "At +{lead} days, the original forecast performs better. The correction increases RMSE by {change}% and is not promoted.",
    "air.title": "Observed, original and corrected trajectory", "air.subtitle": "All three series use the same valid day.",
    "air.actual": "Observed", "air.original": "Original", "air.corrected": "Corrected", "air.chartAria": "Forecast verification chart",
    "air.foot": "Reference weather data are public. The correction remains experimental.",
    "skill.eyebrow": "Official Notebook 03 skill", "skill.title": "Which family wins at each horizon?",
    "skill.intro": "Only aggregate metrics are published. Direct full run, observed-day sanity check and recursive rollout use different protocols and are not one ranking.",
    "skill.horizon": "Horizon", "skill.directWinner": "Observed-day winner", "skill.directRmse": "Observed-day RMSE",
    "skill.recursiveWinner": "Recursive winner", "skill.recursiveRmse": "Recursive RMSE", "skill.chartTitle": "Aggregate RMSE by lead",
    "skill.chartSubtitle": "Three official protocols, shown separately on the same axis.", "skill.fullrun": "Direct full run",
    "skill.observed": "Direct observed-day", "skill.recursiveLegend": "Recursive rollout", "skill.chartAria": "Aggregate Notebook 03 metrics",
    "skill.privacy": "No row-level observed water temperature is published.",
    "skill.sample": "Observed-day n={direct}; recursive n={recursive}. Aggregate metrics from the official full run.",
    "sources.eyebrow": "Traceability", "sources.title": "What this forecast uses", "sources.open": "Open official source ↗",
    "privacy.badge": "PRIVATE", "privacy.title": "Private boundary",
    "privacy.text": "Original scientific spreadsheets, row-level observations, coefficients and the trained file are neither included nor required by this site.",
    "privacy.factsAria": "Privacy guarantees", "privacy.fact1": "Aggregated results only", "privacy.fact2": "No login or database",
    "privacy.fact3": "No public write access", "privacy.fact4": "No station identifier", "privacy.policy": "Read the data policy",
    "footer.prototype": "Operational scientific prototype. Not suitable for navigation or public-health alerts.",
    "footer.texture": "Visual textures adapted from Computational-Physics / MQ assets.", "footer.project": "Project", "footer.data": "Data", "footer.notes": "Notes",
    noscript: "This tool requires JavaScript for charts and date selection.",
    "common.unavailable": "Unavailable", "dynamic.range": "5-95% range: {low}-{high} °C", "dynamic.l4": "L4 value for {date}",
    "dynamic.noPrevious": "No earlier value available", "dynamic.proxyRange": "Range {min}-{max} °C", "dynamic.noMinMax": "Minimum and maximum unavailable",
    "dynamic.aboveP95": "above p95", "dynamic.aboveP90": "above p90", "dynamic.belowP90": "below p90",
    "dynamic.truth": "{date} - lagoon GLM {thermal}. Copernicus and satellite describe the offshore point and do not replace an internal logger.",
    "dynamic.spatial": "The modelled open sea is {delta} °C {direction} than the lagoon estimate. This is a spatial contrast, not a GLM error.",
    "dynamic.warmer": "warmer", "dynamic.cooler": "cooler", "dynamic.noCop": "Copernicus is unavailable for this date. The lagoon estimate remains visible with its thresholds.",
    "dynamic.updated": "{count} public series updated for {date}.", "dynamic.liveError": "The live source is not responding. The verified snapshot remains visible.",
    "dynamic.dataError": "The public dataset is unavailable. Reload the page or consult the manifest."
  }
};

const SOURCE_ROLE_EN = {
  "Modello marino offshore": "Offshore marine model",
  "SST satellitare offshore": "Offshore satellite SST",
  "Forcing meteorologico operativo pubblico": "Public operational weather forcing",
  "Proxy marino pubblico di confronto": "Public marine comparison proxy"
};

function t(key, variables = {}) {
  let value = TEXT[currentLang][key] ?? TEXT.it[key] ?? key;
  Object.entries(variables).forEach(([name, replacement]) => {
    value = value.split(`{${name}}`).join(String(replacement));
  });
  return value;
}

function locale() {
  return currentLang === "en" ? "en-GB" : "it-IT";
}

function formatNumber(value, digits = 1) {
  return new Intl.NumberFormat(locale(), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(Number(value));
}

function number(value, digits = 1) {
  return value !== null && value !== "" && Number.isFinite(Number(value)) ? `${formatNumber(value, digits)} °C` : t("common.unavailable");
}

function signed(value, digits = 2) {
  return value !== null && value !== "" && Number.isFinite(Number(value)) ? `${Number(value) >= 0 ? "+" : ""}${formatNumber(value, digits)} °C` : "-";
}

function localDate(iso) {
  if (!iso) return "-";
  return new Intl.DateTimeFormat(locale(), { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));
}

function setGeneratedDate() {
  if (!DATA) return;
  const date = new Intl.DateTimeFormat(locale(), { dateStyle: "medium", timeStyle: "short" }).format(new Date(DATA.meta.generated_at));
  $("#generatedDate").textContent = t("status.updated", { date });
}

function applyLanguage(lang, persist = true) {
  currentLang = lang === "en" ? "en" : "it";
  document.documentElement.lang = currentLang;
  if (persist) {
    try { localStorage.setItem("sg-language", currentLang); } catch (_) { /* preference remains session-only */ }
  }
  document.querySelectorAll("[data-i18n]").forEach((node) => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll("[data-i18n-aria]").forEach((node) => { node.setAttribute("aria-label", t(node.dataset.i18nAria)); });
  document.querySelectorAll("[data-i18n-content]").forEach((node) => { node.setAttribute("content", t(node.dataset.i18nContent)); });
  document.querySelectorAll("[data-lang]").forEach((button) => { button.setAttribute("aria-pressed", String(button.dataset.lang === currentLang)); });
  if (DATA) {
    setGeneratedDate();
    renderSources();
    updateDay();
    updateMultimodel();
    updateModelSkill();
    updateAirVerification();
  }
}

function bindLanguageSwitch() {
  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => applyLanguage(button.dataset.lang));
  });
}

function weather(code) {
  const c = Number(code);
  if (c === 0) return ["sun", "weather.clear"];
  if ([1, 2].includes(c)) return ["cloud-sun", "weather.partly"];
  if (c === 3) return ["cloud", "weather.cloudy"];
  if ([45, 48].includes(c)) return ["cloud-fog", "weather.fog"];
  if ([51, 53, 55, 56, 57].includes(c)) return ["cloud-drizzle", "weather.drizzle"];
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(c)) return ["cloud-rain", "weather.rain"];
  if ([95, 96, 99].includes(c)) return ["cloud-lightning", "weather.storm"];
  return ["thermometer-sun", "weather.variable"];
}

function byDate(list, date, key = "date") {
  return list.find((row) => row[key] === date);
}

function byLead(list, lead) {
  return list.find((row) => Number(row.lead_days) === Number(lead));
}

function modelLabel(value) {
  return String(value || "-")
    .replace("SplineRidge_GAM_like", "SplineRidge GAM-like")
    .replace("RandomForest_light", "Random Forest Light")
    .replace("GradientBoosting_light", "Gradient Boosting Light");
}

function latestOnOrBefore(list, date) {
  return [...list].filter((row) => row.date <= date && Number.isFinite(row.value_c)).sort((a, b) => b.date.localeCompare(a.date))[0];
}

function toast(message) {
  const node = $("#toast");
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove("show"), 3200);
}

function setDate(date) {
  const dates = DATA.water_forecast.map((row) => row.date);
  selectedDate = dates.includes(date) ? date : DATA.meta.reference_date;
  $("#datePicker").value = selectedDate;
  $("#prevDate").disabled = dates.indexOf(selectedDate) <= 0;
  $("#nextDate").disabled = dates.indexOf(selectedDate) >= dates.length - 1;
  updateDay();
}

function updateDay() {
  const water = byDate(DATA.water_forecast, selectedDate);
  const cop = byDate(DATA.copernicus.model_daily, selectedDate);
  const satellite = latestOnOrBefore(DATA.copernicus.satellite_daily, selectedDate);
  const proxy = byDate(DATA.offshore_proxy, selectedDate);
  const dayWeather = byDate(DATA.weather, selectedDate);

  $("#glmValue").textContent = number(water?.glm_c, 2);
  $("#glmRange").textContent = water ? t("dynamic.range", { low: formatNumber(water.q05_c, 2), high: formatNumber(water.q95_c, 2) }) : t("water.rangeUnavailable");
  $("#copValue").textContent = number(cop?.value_c, 2);
  $("#satValue").textContent = number(satellite?.value_c, 2);
  $("#satDate").textContent = satellite ? t("dynamic.l4", { date: localDate(satellite.date) }) : t("dynamic.noPrevious");
  $("#proxyValue").textContent = number(proxy?.mean_c, 2);
  $("#proxyRange").textContent = proxy ? t("dynamic.proxyRange", { min: formatNumber(proxy.min_c, 1), max: formatNumber(proxy.max_c, 1) }) : t("dynamic.noMinMax");

  $("#diffCopGlm").textContent = signed(cop && water ? cop.value_c - water.glm_c : null);
  $("#diffSatGlm").textContent = signed(satellite && water ? satellite.value_c - water.glm_c : null);
  $("#diffCopSat").textContent = signed(cop && satellite ? cop.value_c - satellite.value_c : null);
  $("#anomalyValue").textContent = signed(water?.anomaly_c);
  $("#p90Value").textContent = number(water?.p90_c, 2);
  $("#p95Value").textContent = number(water?.p95_c, 2);

  const thermal = water?.above_p95 ? t("dynamic.aboveP95") : water?.above_p90 ? t("dynamic.aboveP90") : t("dynamic.belowP90");
  $("#truthBanner").textContent = t("dynamic.truth", { date: localDate(selectedDate), thermal });
  $("#readingTitle").textContent = water?.above_p95 ? t("reading.high") : water?.above_p90 ? t("reading.risk") : t("reading.below");
  $("#readingText").textContent = cop && water
    ? t("dynamic.spatial", { delta: formatNumber(Math.abs(cop.value_c - water.glm_c), 2), direction: cop.value_c >= water.glm_c ? t("dynamic.warmer") : t("dynamic.cooler") })
    : t("dynamic.noCop");

  renderWeather(dayWeather);
  drawWaterChart();
  renderWaterTable();
}

function updateMultimodel() {
  const lead = Number($("#modelLeadSelect").value || 1);
  const row = byLead(DATA.multimodel_03.operational, lead);
  $("#mmRecursiveValue").textContent = number(row?.enhanced_recursive_c, 2);
  $("#mmDirectValue").textContent = number(row?.direct_selected_c, 2);
  $("#mmDeltaValue").textContent = signed(row?.delta_vs_glm_c, 2);
  $("#mmWinnerModel").textContent = modelLabel(row?.winner_model);
  $("#mmTargetDate").textContent = row ? t("mm.target", { date: localDate(row.date), lead }) : "-";
  $("#mmWinnerNote").textContent = t("mm.winnerNote", { mode: "next" });
}

function updateModelSkill() {
  const lead = Number($("#skillLeadSelect").value || 1);
  const observed = byLead(DATA.multimodel_03.observed_day_skill, lead);
  const recursive = byLead(DATA.multimodel_03.recursive_skill, lead);
  $("#skillDirectWinner").textContent = modelLabel(observed?.model);
  $("#skillDirectRmse").textContent = number(observed?.rmse_c, 3);
  $("#skillRecursiveWinner").textContent = modelLabel(recursive?.model);
  $("#skillRecursiveRmse").textContent = number(recursive?.rmse_c, 3);
  $("#skillSampleNote").textContent = t("skill.sample", { direct: observed?.n ?? "-", recursive: recursive?.n ?? "-" });
  drawSkillChart();
}

function renderWeather(row) {
  const [conditionIcon, conditionKey] = weather(row?.weather_code);
  const sunshine = row?.sunshine_duration ? row.sunshine_duration / 3600 : null;
  const unavailable = t("common.unavailable");
  const items = [
    { icon: conditionIcon, tone: "condition", title: t(conditionKey), detail: row ? t("weather.airRange", { min: formatNumber(row.temperature_2m_min, 1), max: formatNumber(row.temperature_2m_max, 1) }) : unavailable },
    { icon: "wind", tone: "wind", title: t("weather.maxWind"), detail: row ? `${formatNumber(row.wind_speed_10m_max, 1)} kn` : unavailable },
    { icon: "umbrella", tone: "rain", title: t("weather.precipitation"), detail: row ? t("weather.precipDetail", { mm: formatNumber(row.precipitation_sum, 1), prob: formatNumber(row.precipitation_probability_max, 0) }) : unavailable },
    { icon: "sun-medium", tone: "uv", title: t("weather.uv"), detail: row ? formatNumber(row.uv_index_max, 1) : unavailable },
    { icon: "sunrise", tone: "sunshine", title: t("weather.sunshine"), detail: sunshine !== null ? t("weather.hours", { hours: formatNumber(sunshine, 1) }) : unavailable }
  ];
  $("#weatherRow").innerHTML = items.map((item) => `<article class="weather-card"><span class="weather-icon-shell ${item.tone}" aria-hidden="true"><img src="./assets/icons/${item.icon}.svg" alt="" width="28" height="28"></span><b>${item.title}</b><span class="weather-detail">${item.detail}</span></article>`).join("");
}

function canvasContext(canvas) {
  const ratio = Math.max(1, window.devicePixelRatio || 1);
  const width = Math.max(320, canvas.clientWidth);
  const height = Math.max(260, canvas.clientHeight);
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  const ctx = canvas.getContext("2d");
  ctx.scale(ratio, ratio);
  return { ctx, width, height };
}

function chartFrame(canvas, values, labels) {
  const { ctx, width, height } = canvasContext(canvas);
  const pad = { left: 48, right: 18, top: 20, bottom: 38 };
  const finite = values.filter(Number.isFinite);
  let min = Math.floor(Math.min(...finite) - 0.5);
  let max = Math.ceil(Math.max(...finite) + 0.5);
  if (max - min < 4) { min -= 1; max += 1; }
  const x = (i) => pad.left + (i / Math.max(1, labels.length - 1)) * (width - pad.left - pad.right);
  const y = (v) => pad.top + ((max - v) / (max - min)) * (height - pad.top - pad.bottom);
  ctx.clearRect(0, 0, width, height);
  ctx.font = "11px Segoe UI, sans-serif";
  ctx.lineWidth = 1;
  for (let step = 0; step <= 4; step += 1) {
    const value = min + ((max - min) * step) / 4;
    const yy = y(value);
    ctx.strokeStyle = COLORS.grid;
    ctx.beginPath(); ctx.moveTo(pad.left, yy); ctx.lineTo(width - pad.right, yy); ctx.stroke();
    ctx.fillStyle = COLORS.muted;
    ctx.textAlign = "right";
    ctx.fillText(`${formatNumber(value, 1)}°`, pad.left - 8, yy + 4);
  }
  const labelStep = Math.max(1, Math.ceil(labels.length / 6));
  labels.forEach((label, i) => {
    if (i % labelStep !== 0 && i !== labels.length - 1) return;
    ctx.fillStyle = COLORS.muted;
    ctx.textAlign = "center";
    const display = typeof label === "string" && label.includes("-") ? label.slice(5).replace("-", "/") : `+${label}`;
    ctx.fillText(display, x(i), height - 13);
  });
  return { ctx, width, height, pad, x, y };
}

function drawSeries(frame, values, color, width = 2.5, dash = [], connectGaps = false) {
  const { ctx, x, y } = frame;
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash); ctx.lineJoin = "round"; ctx.lineCap = "round";
  ctx.beginPath();
  let active = false;
  values.forEach((value, i) => {
    if (!Number.isFinite(value)) { if (!connectGaps) active = false; return; }
    if (!active) { ctx.moveTo(x(i), y(value)); active = true; } else ctx.lineTo(x(i), y(value));
  });
  ctx.stroke(); ctx.setLineDash([]);
}

function drawPoints(frame, values, color, size = 4.5, diamond = false) {
  const { ctx, x, y } = frame;
  ctx.fillStyle = color;
  values.forEach((value, i) => {
    if (!Number.isFinite(value)) return;
    ctx.save();
    ctx.translate(x(i), y(value));
    if (diamond) ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    if (diamond) ctx.rect(-size, -size, size * 2, size * 2); else ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawWaterChart() {
  const labels = DATA.water_forecast.map((row) => row.date);
  const glm = DATA.water_forecast.map((row) => row.glm_c);
  const low = DATA.water_forecast.map((row) => row.q05_c);
  const high = DATA.water_forecast.map((row) => row.q95_c);
  const cop = labels.map((date) => byDate(DATA.copernicus.model_daily, date)?.value_c ?? NaN);
  const sat = labels.map((date) => byDate(DATA.copernicus.satellite_daily, date)?.value_c ?? NaN);
  const operational = DATA.multimodel_03.operational;
  const enhanced = labels.map((date) => byDate(operational, date)?.enhanced_recursive_c ?? NaN);
  const direct = labels.map((date) => byDate(operational, date)?.direct_selected_c ?? NaN);
  const ensembleLow = labels.map((date) => byDate(operational, date)?.ensemble_min_c ?? NaN);
  const ensembleHigh = labels.map((date) => byDate(operational, date)?.ensemble_max_c ?? NaN);
  const frame = chartFrame($("#waterChart"), [...low, ...high, ...ensembleLow, ...ensembleHigh, ...enhanced, ...direct, ...cop, ...sat], labels);
  const { ctx, x, y } = frame;
  ctx.fillStyle = "rgba(118,83,91,.08)";
  ctx.beginPath();
  high.forEach((v, i) => i ? ctx.lineTo(x(i), y(v)) : ctx.moveTo(x(i), y(v)));
  [...low].reverse().forEach((v, rev) => { const i = low.length - 1 - rev; ctx.lineTo(x(i), y(v)); });
  ctx.closePath(); ctx.fill();
  const validEnsemble = ensembleHigh.map((value, i) => Number.isFinite(value) && Number.isFinite(ensembleLow[i]));
  const firstBand = validEnsemble.indexOf(true);
  if (firstBand >= 0) {
    ctx.fillStyle = "rgba(216,74,95,.13)";
    ctx.beginPath();
    for (let i = firstBand; i < ensembleHigh.length && validEnsemble[i]; i += 1) i === firstBand ? ctx.moveTo(x(i), y(ensembleHigh[i])) : ctx.lineTo(x(i), y(ensembleHigh[i]));
    for (let i = ensembleLow.length - 1; i >= firstBand; i -= 1) if (validEnsemble[i]) ctx.lineTo(x(i), y(ensembleLow[i]));
    ctx.closePath(); ctx.fill();
  }
  drawSeries(frame, glm, COLORS.glm, 2.2, [7, 4]);
  drawSeries(frame, enhanced, COLORS.ours, 4.1);
  drawPoints(frame, enhanced, COLORS.ours, 3.3);
  drawPoints(frame, direct, COLORS.direct, 4.6, true);
  drawSeries(frame, cop, COLORS.cop, 2.5);
  drawSeries(frame, sat, COLORS.sat, 2.5, [5, 4]);
  const index = labels.indexOf(selectedDate);
  if (index >= 0) {
    ctx.strokeStyle = "rgba(23,54,49,.35)"; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(x(index), frame.pad.top); ctx.lineTo(x(index), frame.height - frame.pad.bottom); ctx.stroke(); ctx.setLineDash([]);
  }
}

function renderWaterTable() {
  const rows = DATA.water_forecast.map((row) => {
    const cop = byDate(DATA.copernicus.model_daily, row.date);
    const sat = byDate(DATA.copernicus.satellite_daily, row.date);
    const mm = byDate(DATA.multimodel_03.operational, row.date);
    return `<tr><td>${row.date}</td><td>${formatNumber(row.glm_c, 3)}</td><td>${mm ? formatNumber(mm.enhanced_recursive_c, 3) : ""}</td><td>${Number.isFinite(mm?.direct_selected_c) ? formatNumber(mm.direct_selected_c, 3) : ""}</td><td>${cop ? formatNumber(cop.value_c, 3) : ""}</td><td>${sat ? formatNumber(sat.value_c, 3) : ""}</td></tr>`;
  }).join("");
  $("#waterTable").innerHTML = `<table><caption>${t("trajectory.caption")}</caption><thead><tr><th>${t("trajectory.date")}</th><th>GLM</th><th>Enhanced recursive</th><th>Direct</th><th>Copernicus</th><th>Satellite</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function drawSkillChart() {
  const recursiveRows = DATA.multimodel_03.recursive_skill;
  const labels = recursiveRows.map((row) => Number(row.lead_days));
  const fullRun = labels.map((lead) => byLead(DATA.multimodel_03.direct_full_run_skill, lead)?.rmse_c ?? NaN);
  const observed = labels.map((lead) => byLead(DATA.multimodel_03.observed_day_skill, lead)?.rmse_c ?? NaN);
  const recursive = labels.map((lead) => byLead(recursiveRows, lead)?.rmse_c ?? NaN);
  const frame = chartFrame($("#skillChart"), [...fullRun, ...observed, ...recursive], labels);
  drawSeries(frame, fullRun, COLORS.cop, 2.4, [6, 4], true);
  drawPoints(frame, fullRun, COLORS.cop, 3.7);
  drawSeries(frame, observed, COLORS.ours, 2.8, [], true);
  drawPoints(frame, observed, COLORS.ours, 4.1, true);
  drawSeries(frame, recursive, COLORS.recursive, 3);
  drawPoints(frame, recursive, COLORS.recursive, 3.5);
}

function updateAirVerification() {
  const lead = Number($("#leadSelect").value);
  const metric = DATA.air_verification.performance.find((row) => row.lead_days === lead);
  const rows = DATA.air_verification.daily.filter((row) => row.lead_days === lead).sort((a, b) => a.date.localeCompare(b.date));
  $("#rmseOriginal").textContent = number(metric.rmse_original_c, 3);
  $("#rmseCorrected").textContent = number(metric.rmse_corrected_c, 3);
  $("#rmseChange").textContent = `${metric.rmse_change_pct > 0 ? "+" : ""}${formatNumber(metric.rmse_change_pct, 1)}%`;
  $("#nDays").textContent = new Intl.NumberFormat(locale()).format(metric.n_days);
  const improved = metric.rmse_corrected_c < metric.rmse_original_c;
  const verdict = $("#correctionVerdict");
  verdict.className = `verdict ${improved ? "positive" : "negative"}`;
  verdict.textContent = improved
    ? t("verify.improved", { lead })
    : t("verify.worse", { lead, change: formatNumber(Math.abs(metric.rmse_change_pct), 1) });
  $("#airDateRange").textContent = `${localDate(rows[0]?.date)} - ${localDate(rows.at(-1)?.date)}`;
  drawAirChart(rows);
}

function drawAirChart(rows) {
  const labels = rows.map((row) => row.date);
  const actual = rows.map((row) => row.actual_c);
  const original = rows.map((row) => row.original_c);
  const corrected = rows.map((row) => row.corrected_c);
  const frame = chartFrame($("#airChart"), [...actual, ...original, ...corrected], labels);
  drawSeries(frame, actual, COLORS.actual, 2.8);
  drawSeries(frame, original, COLORS.original, 2.1);
  drawSeries(frame, corrected, COLORS.corrected, 2.1, [5, 3]);
}

function renderSources() {
  $("#sourceList").innerHTML = DATA.sources.map((source) => {
    const role = currentLang === "en" ? (SOURCE_ROLE_EN[source.role] ?? source.role) : source.role;
    return `<a class="source-item" href="${source.url}" target="_blank" rel="noopener noreferrer"><small>${role}</small><b>${source.label}</b><span>${t("sources.open")}</span></a>`;
  }).join("");
}

function copernicusUrl(date, satellite = false) {
  const layer = satellite
    ? "SST_MED_SST_L4_NRT_OBSERVATIONS_010_004/SST_MED_SST_L4_NRT_OBSERVATIONS_010_004_c_V2_202311/analysed_sst"
    : "MEDSEA_ANALYSISFORECAST_PHY_006_013/cmems_mod_med_phy-tem_anfc_4.2km_P1D-m_202511/thetao";
  const elevation = satellite ? "" : "&elevation=-1.0182366371154785";
  return `https://mds-wmts-dta.lobelia.earth/teroWmts/?service=WMTS&request=GetFeatureInfo&layer=${encodeURIComponent(layer)}&tilematrixset=EPSG%3A3857&tilematrix=10&tilerow=390&tilecol=538&i=28&j=195&INFOFORMAT=text%2Fhtml${elevation}&time=${date}T00%3A00%3A00.000000000`;
}

async function readPublicPoint(date, satellite = false) {
  const response = await fetch(copernicusUrl(date, satellite), { mode: "cors", cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const documentCopy = new DOMParser().parseFromString(await response.text(), "text/html");
  const cells = [...documentCopy.querySelectorAll("table tr:last-child td")];
  const raw = Number(cells[4]?.textContent);
  if (!Number.isFinite(raw)) throw new Error("Public value unavailable");
  return satellite ? raw - 273.15 : raw;
}

async function refreshPublicData() {
  const button = $("#refreshCopernicus");
  button.disabled = true; button.textContent = t("diff.updating");
  const results = await Promise.allSettled([readPublicPoint(selectedDate, false), readPublicPoint(selectedDate, true)]);
  let updated = 0;
  if (results[0].status === "fulfilled") {
    const existing = byDate(DATA.copernicus.model_daily, selectedDate);
    if (existing) existing.value_c = results[0].value; else DATA.copernicus.model_daily.push({ date: selectedDate, value_c: results[0].value });
    updated += 1;
  }
  if (results[1].status === "fulfilled") {
    const existing = byDate(DATA.copernicus.satellite_daily, selectedDate);
    if (existing) existing.value_c = results[1].value; else DATA.copernicus.satellite_daily.push({ date: selectedDate, value_c: results[1].value });
    updated += 1;
  }
  button.disabled = false; button.textContent = t("diff.refresh");
  updateDay();
  toast(updated ? t("dynamic.updated", { count: updated, date: localDate(selectedDate) }) : t("dynamic.liveError"));
}

function bindEvents() {
  const dates = DATA.water_forecast.map((row) => row.date);
  $("#modelLeadSelect").innerHTML = DATA.multimodel_03.operational.map((row) => `<option value="${row.lead_days}">+${row.lead_days}</option>`).join("");
  $("#datePicker").min = dates[0]; $("#datePicker").max = dates.at(-1);
  $("#datePicker").addEventListener("change", (event) => setDate(event.target.value));
  $("#prevDate").addEventListener("click", () => setDate(dates[Math.max(0, dates.indexOf(selectedDate) - 1)]));
  $("#nextDate").addEventListener("click", () => setDate(dates[Math.min(dates.length - 1, dates.indexOf(selectedDate) + 1)]));
  $("#todayButton").addEventListener("click", () => setDate(DATA.meta.reference_date));
  $("#modelLeadSelect").addEventListener("change", updateMultimodel);
  $("#skillLeadSelect").addEventListener("change", updateModelSkill);
  $("#leadSelect").addEventListener("change", updateAirVerification);
  $("#refreshCopernicus").addEventListener("click", refreshPublicData);
  let resizeTimer;
  window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { drawWaterChart(); drawSkillChart(); updateAirVerification(); }, 150); });
}

async function init() {
  bindLanguageSwitch();
  applyLanguage(currentLang, false);
  try {
    if (window.__SANTA_GILLA_PUBLIC_DATA__) {
      DATA = window.__SANTA_GILLA_PUBLIC_DATA__;
    } else {
      const response = await fetch("./data/forecast_public.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      DATA = await response.json();
    }
    setGeneratedDate();
    renderSources();
    bindEvents();
    setDate(DATA.meta.reference_date);
    updateMultimodel();
    updateModelSkill();
    updateAirVerification();
  } catch (error) {
    $("#truthBanner").textContent = t("dynamic.dataError");
    console.error(error);
  }
}

init();
