"use strict";

const COLORS = { ours: "#d84a5f", cop: "#176ea6", sat: "#1aa3a3", actual: "#173631", corrected: "#d84a5f", original: "#176ea6", grid: "#dce6e1", muted: "#6b7c76" };
const $ = (selector) => document.querySelector(selector);
let DATA;
let selectedDate;

function number(value, digits = 1) {
  return Number.isFinite(Number(value)) ? `${Number(value).toFixed(digits)} °C` : "Non disponibile";
}

function signed(value, digits = 2) {
  return Number.isFinite(Number(value)) ? `${Number(value) >= 0 ? "+" : ""}${Number(value).toFixed(digits)} °C` : "-";
}

function localDate(iso) {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));
}

function weather(code) {
  const c = Number(code);
  if (c === 0) return ["☀️", "Sereno"];
  if ([1, 2].includes(c)) return ["🌤️", "Poco nuvoloso"];
  if (c === 3) return ["☁️", "Coperto"];
  if ([45, 48].includes(c)) return ["🌫️", "Nebbia"];
  if ([51, 53, 55, 56, 57].includes(c)) return ["🌦️", "Pioviggine"];
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(c)) return ["🌧️", "Pioggia"];
  if ([95, 96, 99].includes(c)) return ["⛈️", "Temporale"];
  return ["🌡️", "Variabile"];
}

function byDate(list, date, key = "date") {
  return list.find((row) => row[key] === date);
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
  $("#glmRange").textContent = water ? `Intervallo 5-95%: ${water.q05_c.toFixed(2)}-${water.q95_c.toFixed(2)} °C` : "Intervallo non disponibile";
  $("#copValue").textContent = number(cop?.value_c, 2);
  $("#satValue").textContent = number(satellite?.value_c, 2);
  $("#satDate").textContent = satellite ? `Dato L4 del ${localDate(satellite.date)}` : "Nessun dato precedente disponibile";
  $("#proxyValue").textContent = number(proxy?.mean_c, 2);
  $("#proxyRange").textContent = proxy ? `Intervallo ${proxy.min_c.toFixed(1)}-${proxy.max_c.toFixed(1)} °C` : "Min e max non disponibili";

  $("#diffCopGlm").textContent = signed(cop && water ? cop.value_c - water.glm_c : null);
  $("#diffSatGlm").textContent = signed(satellite && water ? satellite.value_c - water.glm_c : null);
  $("#diffCopSat").textContent = signed(cop && satellite ? cop.value_c - satellite.value_c : null);
  $("#anomalyValue").textContent = signed(water?.anomaly_c);
  $("#p90Value").textContent = number(water?.p90_c, 2);
  $("#p95Value").textContent = number(water?.p95_c, 2);

  const thermal = water?.above_p95 ? "sopra p95" : water?.above_p90 ? "sopra p90" : "sotto p90";
  $("#truthBanner").textContent = `${localDate(selectedDate)} - GLM lagunare ${thermal}. Copernicus e satellite descrivono il punto offshore e non sostituiscono un logger interno.`;
  $("#readingTitle").textContent = water?.above_p95 ? "Rischio termico modellato elevato" : water?.above_p90 ? "Rischio termico modellato" : "Condizione modellata sotto p90";
  $("#readingText").textContent = cop && water
    ? `Il mare esterno modellato è ${Math.abs(cop.value_c - water.glm_c).toFixed(2)} °C ${cop.value_c >= water.glm_c ? "più caldo" : "più freddo"} della stima lagunare. È un contrasto spaziale, non un errore del GLM.`
    : "Copernicus non è disponibile per questa data. La stima lagunare resta visualizzata con le sue soglie.";

  renderWeather(dayWeather);
  drawWaterChart();
  renderWaterTable();
}

function renderWeather(row) {
  const [icon, label] = weather(row?.weather_code);
  const sunshine = row?.sunshine_duration ? row.sunshine_duration / 3600 : null;
  const items = [
    [icon, label, row ? `${row.temperature_2m_min.toFixed(1)}-${row.temperature_2m_max.toFixed(1)} °C aria` : "Non disponibile"],
    ["💨", "Vento massimo", row ? `${row.wind_speed_10m_max.toFixed(1)} kn` : "Non disponibile"],
    ["🌧️", "Precipitazione", row ? `${row.precipitation_sum.toFixed(1)} mm - ${row.precipitation_probability_max.toFixed(0)}%` : "Non disponibile"],
    ["🔆", "Indice UV", row ? row.uv_index_max.toFixed(1) : "Non disponibile"],
    ["🌅", "Sole utile", sunshine !== null ? `${sunshine.toFixed(1)} ore` : "Non disponibile"],
  ];
  $("#weatherRow").innerHTML = items.map(([i, title, detail]) => `<article class="weather-card"><span class="weather-icon" aria-hidden="true">${i}</span><b>${title}</b><span>${detail}</span></article>`).join("");
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
    ctx.fillText(`${value.toFixed(1)}°`, pad.left - 8, yy + 4);
  }
  const labelStep = Math.max(1, Math.ceil(labels.length / 6));
  labels.forEach((label, i) => {
    if (i % labelStep !== 0 && i !== labels.length - 1) return;
    ctx.fillStyle = COLORS.muted;
    ctx.textAlign = "center";
    ctx.fillText(label.slice(5).replace("-", "/"), x(i), height - 13);
  });
  return { ctx, width, height, pad, x, y };
}

function drawSeries(frame, values, color, width = 2.5, dash = []) {
  const { ctx, x, y } = frame;
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash); ctx.lineJoin = "round"; ctx.lineCap = "round";
  ctx.beginPath();
  let active = false;
  values.forEach((value, i) => {
    if (!Number.isFinite(value)) { active = false; return; }
    if (!active) { ctx.moveTo(x(i), y(value)); active = true; } else ctx.lineTo(x(i), y(value));
  });
  ctx.stroke(); ctx.setLineDash([]);
}

function drawWaterChart() {
  const labels = DATA.water_forecast.map((row) => row.date);
  const glm = DATA.water_forecast.map((row) => row.glm_c);
  const low = DATA.water_forecast.map((row) => row.q05_c);
  const high = DATA.water_forecast.map((row) => row.q95_c);
  const cop = labels.map((date) => byDate(DATA.copernicus.model_daily, date)?.value_c ?? NaN);
  const sat = labels.map((date) => byDate(DATA.copernicus.satellite_daily, date)?.value_c ?? NaN);
  const frame = chartFrame($("#waterChart"), [...low, ...high, ...cop, ...sat], labels);
  const { ctx, x, y } = frame;
  ctx.fillStyle = "rgba(216,74,95,.12)";
  ctx.beginPath();
  high.forEach((v, i) => i ? ctx.lineTo(x(i), y(v)) : ctx.moveTo(x(i), y(v)));
  [...low].reverse().forEach((v, rev) => { const i = low.length - 1 - rev; ctx.lineTo(x(i), y(v)); });
  ctx.closePath(); ctx.fill();
  drawSeries(frame, glm, COLORS.ours, 3.2);
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
    return `<tr><td>${row.date}</td><td>${row.glm_c}</td><td>${cop?.value_c ?? ""}</td><td>${sat?.value_c ?? ""}</td></tr>`;
  }).join("");
  $("#waterTable").innerHTML = `<table><caption>Valori della traiettoria termica</caption><thead><tr><th>Data</th><th>GLM</th><th>Copernicus</th><th>Satellite</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function updateAirVerification() {
  const lead = Number($("#leadSelect").value);
  const metric = DATA.air_verification.performance.find((row) => row.lead_days === lead);
  const rows = DATA.air_verification.daily.filter((row) => row.lead_days === lead).sort((a, b) => a.date.localeCompare(b.date));
  $("#rmseOriginal").textContent = number(metric.rmse_original_c, 3);
  $("#rmseCorrected").textContent = number(metric.rmse_corrected_c, 3);
  $("#rmseChange").textContent = `${metric.rmse_change_pct > 0 ? "+" : ""}${metric.rmse_change_pct.toFixed(1)}%`;
  $("#nDays").textContent = metric.n_days.toLocaleString("it-IT");
  const improved = metric.rmse_corrected_c < metric.rmse_original_c;
  const verdict = $("#correctionVerdict");
  verdict.className = `verdict ${improved ? "positive" : "negative"}`;
  verdict.textContent = improved
    ? `A +${lead} giorni la correzione riduce l’RMSE. È più vicina al dato reale del forecast originale.`
    : `A +${lead} giorni il forecast originale è migliore. La correzione aumenta l’RMSE di ${Math.abs(metric.rmse_change_pct).toFixed(1)}% e non viene promossa.`;
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
  $("#sourceList").innerHTML = DATA.sources.map((source) => `<a class="source-item" href="${source.url}" target="_blank" rel="noopener noreferrer"><small>${source.role}</small><b>${source.label}</b><span>Apri la fonte ufficiale ↗</span></a>`).join("");
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
  if (!Number.isFinite(raw)) throw new Error("Dato non disponibile");
  return satellite ? raw - 273.15 : raw;
}

async function refreshPublicData() {
  const button = $("#refreshCopernicus");
  button.disabled = true; button.textContent = "Aggiornamento";
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
  button.disabled = false; button.textContent = "Aggiorna dato pubblico";
  updateDay();
  toast(updated ? `${updated} serie pubbliche aggiornate per ${localDate(selectedDate)}.` : "La fonte live non risponde. Rimane visibile lo snapshot verificato.");
}

function bindEvents() {
  const dates = DATA.water_forecast.map((row) => row.date);
  $("#datePicker").min = dates[0]; $("#datePicker").max = dates.at(-1);
  $("#datePicker").addEventListener("change", (event) => setDate(event.target.value));
  $("#prevDate").addEventListener("click", () => setDate(dates[Math.max(0, dates.indexOf(selectedDate) - 1)]));
  $("#nextDate").addEventListener("click", () => setDate(dates[Math.min(dates.length - 1, dates.indexOf(selectedDate) + 1)]));
  $("#todayButton").addEventListener("click", () => setDate(DATA.meta.reference_date));
  $("#leadSelect").addEventListener("change", updateAirVerification);
  $("#refreshCopernicus").addEventListener("click", refreshPublicData);
  let resizeTimer;
  window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { drawWaterChart(); updateAirVerification(); }, 150); });
}

async function init() {
  try {
    if (window.__SANTA_GILLA_PUBLIC_DATA__) {
      DATA = window.__SANTA_GILLA_PUBLIC_DATA__;
    } else {
      const response = await fetch("./data/forecast_public.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      DATA = await response.json();
    }
    $("#generatedDate").textContent = `Aggiornato ${new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(DATA.meta.generated_at))}`;
    renderSources(); bindEvents(); setDate(DATA.meta.reference_date); updateAirVerification();
  } catch (error) {
    $("#truthBanner").textContent = "Il dataset pubblico non è disponibile. Ricaricare la pagina o consultare il manifest.";
    console.error(error);
  }
}

init();
