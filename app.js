"use strict";

const COLORS = { ours: "#d84a5f", glm: "#76535b", direct: "#d99a35", recursive: "#24805f", cop: "#176ea6", sat: "#1aa3a3", actual: "#173631", corrected: "#d84a5f", original: "#176ea6", grid: "#dce6e1", muted: "#6b7c76" };
const $ = (selector) => document.querySelector(selector);
let DATA;
let selectedDate;
let currentLang = "it";
let compactMode = false;
let clockTimer;
let totalSeriesCache;
let totalPointerBound = false;

try {
  currentLang = localStorage.getItem("sg-language") === "en" ? "en" : "it";
  compactMode = localStorage.getItem("sg-density") === "compact";
} catch (_) {
  currentLang = "it";
  compactMode = false;
}

const TEXT = {
  it: {
    "meta.description": "Confronto operativo tra la previsione termica modellata per Santa Gilla, Copernicus Marine e dati meteorologici pubblici.",
    skip: "Vai al contenuto",
    "nav.label": "Navigazione principale", "nav.water": "Acqua", "nav.multimodel": "Multimodello", "nav.verify": "Verifica", "nav.stats": "Statistiche", "nav.sources": "Fonti",
    "language.label": "Lingua dell'interfaccia", "density.compact": "Compatta", "density.standard": "Standard", "density.enableCompact": "Attiva modalità OLED compatta", "density.enableStandard": "Torna alla modalità standard",
    "hero.eyebrow": "Indicatore operativo scientifico", "hero.title": "Previsione lagunare e mare aperto, nello stesso quadro.",
    "hero.lead": "Il nostro modello enhanced resta in primo piano. Copernicus Marine, satellite e meteo pubblico forniscono il contesto necessario per leggere differenze, traiettorie e limiti.",
    "hero.compare": "Confronta oggi", "hero.method": "Come leggere i dati",
    "status.aria": "Stato del prodotto", "status.snapshot": "Snapshot verificato", "status.loading": "Caricamento",
    "status.updated": "Aggiornato {date}", "status.area": "Area", "status.model": "Modello", "status.validTo": "Valido fino al", "status.access": "Accesso",
    "clock.label": "Ora locale", "clock.aria": "Orologio in ora locale di Cagliari",
    "water.eyebrow": "Confronto termico giornaliero", "water.title": "HW e Copernicus",
    "water.dateSelector": "Seleziona la data", "water.previous": "Data precedente", "water.year": "Anno", "water.yearSelector": "Seleziona anno", "water.date": "Data", "water.next": "Data successiva", "water.today": "Oggi",
    "water.ourModel": "Nostro modello", "water.lagoon": "Acqua Santa Gilla", "water.rangeUnavailable": "Intervallo non disponibile",
    "water.historyReference": "Riferimento modellato al lead +{lead}",
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
    "mm.issue": "Emissione {date} - orizzonte fino al {valid}", "mm.fresh": "Aggiornamento giornaliero attivo",
    "mm.stale": "Ultima emissione non aggiornata: previsione da rinnovare", "mm.outside": "La data selezionata non appartiene all'emissione corrente",
    "mm.next": "Per oggi viene mostrata la prima previsione futura, valida il {date}",
    "mm.disclosure": "Le metriche di skill riportate sotto derivano dal full run ufficiale del notebook 03.",
    "mm.historyEyebrow": "Storico giornaliero modellato", "mm.historyTitle": "Multimodello e GLM per il giorno selezionato",
    "mm.historyIntro": "Per i giorni trascorsi il confronto usa le stime giornaliere archiviate.",
    "mm.historyMulti": "Stima multimodello", "mm.historyGlm": "GLM giornaliero", "mm.historyDelta": "Multimodello meno GLM",
    "mm.historyMethod": "Metodo", "mm.historyMethodValue": "Ensemble giornaliero", "mm.historyTarget": "{date} - stima giornaliera",
    "mm.historyGlmNote": "Ricostruzione GLM 01", "mm.historyDeltaNote": "Differenza tra stime lagunari",
    "mm.historyMethodNote": "Confronto sullo stesso giorno", "mm.historyStatus": "Dati giornalieri disponibili per {date}",
    "mm.historyFresh": "Modalità storica", "mm.dailyEstimate": "Stima multimodello", "mm.dailyEstimateNote": "Valore giornaliero disponibile",
    "mm.archiveEyebrow": "Storico modellato 2025-2026", "mm.archiveTitle": "Originale, corretta e riferimento modellato",
    "mm.archiveIntro": "Confronto giornaliero allo stesso lead selezionato.", "mm.archiveLead": "Lead storico",
    "mm.archiveCorrected": "Previsione corretta", "mm.archiveOriginal": "Previsione originale",
    "mm.archiveDelta": "Corretta meno riferimento", "mm.archiveCloser": "Più vicina",
    "mm.archiveCorrectedNote": "Con correzione meteorologica", "mm.archiveOriginalNote": "Senza correzione",
    "mm.archiveDeltaNote": "Scarto dal riferimento modellato", "mm.archiveCloserNote": "Errore assoluto minore",
    "mm.archiveCorrectedWins": "Corretta", "mm.archiveOriginalWins": "Originale",
    "mm.archiveTarget": "{date} - lead +{lead}", "mm.archiveStatus": "Storico giornaliero disponibile a lead +1 fino a +7",
    "mm.archiveFresh": "Confronto storico modellato",
    "mm.reconstructionEyebrow": "Ricostruzione trentennale 1995-2024", "mm.reconstructionTitle": "Acqua ricostruita, climatologia e soglie",
    "mm.reconstructionIntro": "Ogni giorno usa la ricostruzione ufficiale 01 e la baseline climatologica 1982-2011.",
    "mm.reconstructed": "Acqua ricostruita", "mm.climatology": "Climatologia", "mm.reconstructionAnomaly": "Anomalia",
    "mm.thermalClass": "Stato termico", "mm.reconstructionTarget": "{date} - giorno ricostruito", "mm.climatologyNote": "Media climatologica del giorno",
    "mm.reconstructionAnomalyNote": "Scarto dalla climatologia", "mm.thermalClassNote": "Soglie p90 e p95",
    "mm.reconstructionStatus": "10.958 giornate ricostruite dal 1995 al 2024", "mm.reconstructionFresh": "Archivio climatologico",
    "mm.belowP90": "Sotto p90", "mm.aboveP90": "Sopra p90", "mm.aboveP95": "Sopra p95", "mm.heatwaveLike": "Heatwave-like",
    "trajectory.title": "Traiettoria termica", "trajectory.subtitle": "Laguna modellata e superficie offshore non sono lo stesso target.",
    "trajectory.enhanced": "Enhanced / storico",
    "trajectory.historyReference": "Riferimento modellato", "trajectory.historyCorrected": "Corretta", "trajectory.historyOriginal": "Originale",
    "trajectory.legend": "Legenda", "trajectory.chartAria": "Grafico della traiettoria termica", "trajectory.tableAria": "Dati del grafico termico",
    "trajectory.caption": "Valori della traiettoria termica", "trajectory.date": "Data",
    "reading.eyebrow": "Lettura corretta", "reading.defaultTitle": "Confronto, non validazione diretta",
    "reading.defaultText": "Il modello Copernicus non risolve l'interno della laguna. La differenza quantifica il contrasto tra la stima lagunare e il mare esterno.",
    "reading.anomaly": "Anomalia GLM", "reading.p90": "Soglia p90", "reading.p95": "Soglia p95",
    "reading.caution": "Un superamento modellato indica rischio termico. Non conferma una heatwave osservata senza un logger recente indipendente.",
    "reading.high": "Rischio termico modellato elevato", "reading.risk": "Rischio termico modellato", "reading.below": "Condizione modellata sotto p90",
    "reading.historyTitle": "Confronto storico modellato", "reading.historyText": "Originale e corretta sono confrontate con il riferimento modellato dello stesso giorno.",
    "reading.reconstructionTitle": "Ricostruzione giornaliera 1995-2024", "reading.reconstructionText": "La temperatura dell'acqua è ricostruita dal modello ufficiale usando i forzanti ERA5. Climatologia e soglie descrivono quanto il giorno si discosta dal comportamento atteso.",
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
    "skill.intro": "Full run direct, sanity check observed-day e recursive hanno protocolli diversi e non costituiscono una classifica unica.",
    "skill.horizon": "Orizzonte", "skill.directWinner": "Vincitore observed-day", "skill.directRmse": "RMSE observed-day",
    "skill.recursiveWinner": "Vincitore recursive", "skill.recursiveRmse": "RMSE recursive", "skill.chartTitle": "RMSE aggregato per lead",
    "skill.chartSubtitle": "Tre protocolli ufficiali, mostrati separatamente sullo stesso asse.", "skill.fullrun": "Direct full run",
    "skill.observed": "Direct observed-day", "skill.recursiveLegend": "Recursive rollout", "skill.chartAria": "Metriche aggregate del notebook 03",
    "skill.sample": "Observed-day n={direct}; recursive n={recursive}. Metriche aggregate del full run ufficiale.",
    "stats.eyebrow": "Copertura pubblica", "stats.title": "Dataset in numeri",
    "stats.intro": "Conteggi calcolati direttamente dallo snapshot operativo.",
    "stats.records": "Record pubblici", "stats.recordsNote": "Serie operative, skill e verifica",
    "stats.days": "Giorni disponibili", "stats.daysNote": "Trentennio, storico e finestra corrente",
    "stats.checks": "Confronti di verifica", "stats.checksNote": "Reale, originale e corretta",
    "stats.thermal": "Punti termici", "stats.thermalNote": "Ricostruzione, GLM e multimodello",
    "stats.horizons": "Orizzonti valutati", "stats.horizonsNote": "Lead della verifica pubblica",
    "stats.sources": "Fonti tracciate", "stats.sourcesNote": "Servizi pubblici ufficiali",
    "paper.eyebrow": "Risultati fissi dell'articolo", "paper.title": "Numeri verificati dei notebook 01-03",
    "paper.intro": "Sintesi scientifica del manoscritto, separata dallo snapshot operativo che cambia ogni giorno.",
    "paper.fixed": "Risultati validati", "paper.observations": "Osservazioni valide", "paper.observationsNote": "71 siti di campionamento",
    "paper.dates": "Date indipendenti", "paper.datesNote": "Campione temporale effettivo",
    "paper.glmRmse": "RMSE GLM", "paper.glmRmseValue": "1,554 °C", "paper.glmRmseNote": "Validazione per date",
    "paper.glmMae": "MAE GLM", "paper.glmMaeValue": "1,274 °C", "paper.glmMaeNote": "Modello stagionale selezionato",
    "paper.events": "Eventi MHW-like", "paper.eventDays": "Giorni-evento", "paper.eventDaysNote": "Durata media 8,80 giorni",
    "paper.overlap": "Overlap osservato", "paper.overlapNote": "Giorni in 6 eventi",
    "paper.outDomain": "Fuori dominio", "paper.outDomainValue": "27,7%", "paper.outDomainNote": "Giorni-evento fuori o fortemente fuori",
    "paper.trend": "Trend: eventi annui da 2,07 a 4,67; giorni-evento annui da 15,87 a 43,40.",
    "paper.coverage": "Copertura: l'articolo ricostruisce 22.330 giorni validi nel 1964-2025; il sito mostra il sottoinsieme MHW continuo di 10.958 giorni nel 1995-2024.",
    "paper.caveat": "Il catalogo e i superamenti sono modellati: indicano rischio termico e non sostituiscono un record osservativo continuo.",
    "stats.timestampsAria": "Timestamp consolidati dei dati", "stats.timestampsTitle": "Timestamp dati",
    "stats.timestampsIntro": "Una sola zona per gli aggiornamenti, con sorgenti aventi la stessa data raggruppate.",
    "stats.snapshot": "Snapshot pubblico", "stats.issue": "Emissione forecast", "stats.coverage": "Copertura corrente",
    "stats.availability": "Ultima disponibilità", "stats.copModel": "Modello Copernicus", "stats.satellite": "Satellite L4",
    "stats.weather": "Meteo", "stats.marineProxy": "Proxy marino",
    "sources.eyebrow": "Tracciabilità", "sources.title": "Cosa usa questa previsione", "sources.open": "Apri la fonte ufficiale ↗",
    "total.eyebrow": "Panorama termico completo", "total.title": "Dal trentennio ricostruito fino a oggi",
    "total.intro": "Ogni valore giornaliero contribuisce all'inviluppo. La linea mostra l'andamento mensile, mantenendo visibili estremi e variazioni di lungo periodo.",
    "total.summaryAria": "Sintesi della serie completa", "total.period": "Periodo", "total.days": "Giorni", "total.mean": "Media", "total.maximum": "Massimo",
    "total.dailyEnvelope": "Tutti i dati giornalieri", "total.reconstruction": "Ricostruzione 1995-2024", "total.current": "Modellazione 2025-oggi",
    "total.chartAria": "Serie termica completa dal 1995 a oggi", "total.note": "La compressione è solo grafica: minimi e massimi giornalieri restano rappresentati in ogni colonna del grafico.",
    "total.reconstructedType": "Ricostruzione", "total.modelledType": "Modellazione recente",
    "tutorial.eyebrow": "Guida rapida", "tutorial.title": "Il tool in 11 secondi",
    "tutorial.intro": "Modalità OLED, confronto giornaliero, grafici, verifica, statistiche e fonti in una sola sequenza.",
    "tutorial.fallback": "Il browser non supporta il video.",
    "footer.prototype": "Prototipo scientifico operativo. Non adatto alla navigazione o ad allerta sanitaria.",
    "footer.texture": "Texture visive adattate dagli asset Computational-Physics / MQ.", "footer.project": "Progetto", "footer.data": "Dati", "footer.notes": "Note",
    noscript: "Il tool richiede JavaScript per grafici e selezione delle date.",
    "common.unavailable": "Non disponibile", "dynamic.range": "Intervallo 5-95%: {low}-{high} °C", "dynamic.l4": "Dato L4 del {date}",
    "dynamic.noPrevious": "Nessun dato precedente disponibile", "dynamic.proxyRange": "Intervallo {min}-{max} °C", "dynamic.noMinMax": "Min e max non disponibili",
    "dynamic.aboveP95": "sopra p95 (più caldo del 95% storico)", "dynamic.aboveP90": "sopra p90 (più caldo del 90% storico)", "dynamic.belowP90": "sotto p90",
    "dynamic.truth": "{date} - GLM lagunare {thermal}. Copernicus e satellite descrivono il punto offshore e non sostituiscono un logger interno.",
    "dynamic.futureTruth": "{date} - previsione lagunare. Satellite ancora non osservato; Copernicus e proxy compaiono solo entro il rispettivo orizzonte.",
    "dynamic.pastTruth": "{date} - giorno recente della finestra rolling. Le osservazioni pubbliche sono mostrate solo se realmente disponibili.",
    "dynamic.historyTruth": "{date} - storico modellato al lead +{lead}. Riferimento, previsione originale e corretta usano lo stesso giorno valido.",
    "dynamic.reconstructionTruth": "{date} - ricostruzione giornaliera del trentennio 1995-2024. Valore modellato, climatologia e soglie sono confrontati sullo stesso giorno.",
    "dynamic.reconstructedRange": "Ricostruzione ufficiale 01", "dynamic.climateBaseline": "Baseline 1982-2011",
    "dynamic.reconstructionDelta": "Ricostruzione meno climatologia", "dynamic.reconstructionP90Delta": "Ricostruzione meno p90", "dynamic.reconstructionEvent": "Classificazione evento",
    "dynamic.eventYes": "Heatwave-like", "dynamic.eventNo": "Nessun evento",
    "dynamic.satellitePending": "Osservazione non ancora disponibile per il giorno futuro",
    "dynamic.spatial": "Il mare esterno modellato è {delta} °C {direction} della stima lagunare. È un contrasto spaziale, non un errore del GLM.",
    "dynamic.warmer": "più caldo", "dynamic.cooler": "più freddo", "dynamic.noCop": "Copernicus non è disponibile per questa data. La stima lagunare resta visualizzata con le sue soglie.",
    "dynamic.updated": "{count} serie pubbliche aggiornate per {date}.", "dynamic.liveError": "La fonte live non risponde. Rimane visibile lo snapshot verificato.",
    "dynamic.dataError": "Il dataset pubblico non è disponibile. Ricaricare la pagina o consultare il manifest."
  },
  en: {
    "meta.description": "Operational comparison of the Santa Gilla modelled thermal forecast, Copernicus Marine and public weather data.",
    skip: "Skip to content",
    "nav.label": "Main navigation", "nav.water": "Water", "nav.multimodel": "Multimodel", "nav.verify": "Verification", "nav.stats": "Statistics", "nav.sources": "Sources",
    "language.label": "Interface language", "density.compact": "Compact", "density.standard": "Standard", "density.enableCompact": "Enable compact OLED mode", "density.enableStandard": "Return to standard mode",
    "hero.eyebrow": "Scientific operational indicator", "hero.title": "Lagoon forecast and open sea, in one view.",
    "hero.lead": "Our enhanced model remains in focus. Copernicus Marine, satellite and public weather data provide the context needed to read differences, trajectories and limitations.",
    "hero.compare": "Compare today", "hero.method": "How to read the data",
    "status.aria": "Product status", "status.snapshot": "Verified snapshot", "status.loading": "Loading",
    "status.updated": "Updated {date}", "status.area": "Area", "status.model": "Model", "status.validTo": "Valid through", "status.access": "Access",
    "clock.label": "Local time", "clock.aria": "Clock in Cagliari local time",
    "water.eyebrow": "Daily thermal comparison", "water.title": "HW and Copernicus",
    "water.dateSelector": "Select date", "water.previous": "Previous date", "water.year": "Year", "water.yearSelector": "Select year", "water.date": "Date", "water.next": "Next date", "water.today": "Today",
    "water.ourModel": "Our model", "water.lagoon": "Santa Gilla water", "water.rangeUnavailable": "Range unavailable",
    "water.historyReference": "Modelled reference at lead +{lead}",
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
    "mm.issue": "Issue {date} - horizon through {valid}", "mm.fresh": "Daily refresh active",
    "mm.stale": "Latest issue is stale: forecast refresh required", "mm.outside": "The selected date is not part of the current issue",
    "mm.next": "For today, the first future forecast is shown, valid {date}",
    "mm.disclosure": "The skill metrics below come from the official full run of Notebook 03.",
    "mm.historyEyebrow": "Daily model history", "mm.historyTitle": "Multimodel and GLM for the selected day",
    "mm.historyIntro": "For past days, the comparison uses the archived daily estimates.",
    "mm.historyMulti": "Multimodel estimate", "mm.historyGlm": "Daily GLM", "mm.historyDelta": "Multimodel minus GLM",
    "mm.historyMethod": "Method", "mm.historyMethodValue": "Daily ensemble", "mm.historyTarget": "{date} - daily estimate",
    "mm.historyGlmNote": "GLM 01 reconstruction", "mm.historyDeltaNote": "Difference between lagoon estimates",
    "mm.historyMethodNote": "Same-day comparison", "mm.historyStatus": "Daily data available for {date}",
    "mm.historyFresh": "Historical mode", "mm.dailyEstimate": "Multimodel estimate", "mm.dailyEstimateNote": "Daily value available",
    "mm.archiveEyebrow": "Modelled history 2025-2026", "mm.archiveTitle": "Original, corrected and modelled reference",
    "mm.archiveIntro": "Daily comparison at the same selected lead.", "mm.archiveLead": "Historical lead",
    "mm.archiveCorrected": "Corrected forecast", "mm.archiveOriginal": "Original forecast",
    "mm.archiveDelta": "Corrected minus reference", "mm.archiveCloser": "Closer estimate",
    "mm.archiveCorrectedNote": "With weather correction", "mm.archiveOriginalNote": "Without correction",
    "mm.archiveDeltaNote": "Difference from the modelled reference", "mm.archiveCloserNote": "Lower absolute error",
    "mm.archiveCorrectedWins": "Corrected", "mm.archiveOriginalWins": "Original",
    "mm.archiveTarget": "{date} - lead +{lead}", "mm.archiveStatus": "Daily history available from lead +1 through +7",
    "mm.archiveFresh": "Modelled historical comparison",
    "mm.reconstructionEyebrow": "Thirty-year reconstruction 1995-2024", "mm.reconstructionTitle": "Reconstructed water, climatology and thresholds",
    "mm.reconstructionIntro": "Each day uses the official 01 reconstruction and the 1982-2011 climatological baseline.",
    "mm.reconstructed": "Reconstructed water", "mm.climatology": "Climatology", "mm.reconstructionAnomaly": "Anomaly",
    "mm.thermalClass": "Thermal status", "mm.reconstructionTarget": "{date} - reconstructed day", "mm.climatologyNote": "Daily climatological mean",
    "mm.reconstructionAnomalyNote": "Difference from climatology", "mm.thermalClassNote": "p90 and p95 thresholds",
    "mm.reconstructionStatus": "10,958 reconstructed days from 1995 through 2024", "mm.reconstructionFresh": "Climatological archive",
    "mm.belowP90": "Below p90", "mm.aboveP90": "Above p90", "mm.aboveP95": "Above p95", "mm.heatwaveLike": "Heatwave-like",
    "trajectory.title": "Thermal trajectory", "trajectory.subtitle": "The modelled lagoon and offshore surface are not the same target.",
    "trajectory.enhanced": "Enhanced / history",
    "trajectory.historyReference": "Modelled reference", "trajectory.historyCorrected": "Corrected", "trajectory.historyOriginal": "Original",
    "trajectory.legend": "Legend", "trajectory.chartAria": "Thermal trajectory chart", "trajectory.tableAria": "Thermal chart data",
    "trajectory.caption": "Thermal trajectory values", "trajectory.date": "Date",
    "reading.eyebrow": "Correct interpretation", "reading.defaultTitle": "Comparison, not direct validation",
    "reading.defaultText": "The Copernicus model does not resolve the inside of the lagoon. The difference quantifies the contrast between the lagoon estimate and the open sea.",
    "reading.anomaly": "GLM anomaly", "reading.p90": "p90 threshold", "reading.p95": "p95 threshold",
    "reading.caution": "A modelled exceedance indicates thermal risk. It does not confirm an observed heatwave without a recent independent logger.",
    "reading.high": "High modelled thermal risk", "reading.risk": "Modelled thermal risk", "reading.below": "Modelled condition below p90",
    "reading.historyTitle": "Modelled historical comparison", "reading.historyText": "Original and corrected forecasts are compared with the same-day modelled reference.",
    "reading.reconstructionTitle": "Daily reconstruction 1995-2024", "reading.reconstructionText": "Water temperature is reconstructed by the official model using ERA5 forcing. Climatology and thresholds show how far each day departs from expected conditions.",
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
    "skill.intro": "Direct full run, observed-day sanity check and recursive rollout use different protocols and do not form a single ranking.",
    "skill.horizon": "Horizon", "skill.directWinner": "Observed-day winner", "skill.directRmse": "Observed-day RMSE",
    "skill.recursiveWinner": "Recursive winner", "skill.recursiveRmse": "Recursive RMSE", "skill.chartTitle": "Aggregate RMSE by lead",
    "skill.chartSubtitle": "Three official protocols, shown separately on the same axis.", "skill.fullrun": "Direct full run",
    "skill.observed": "Direct observed-day", "skill.recursiveLegend": "Recursive rollout", "skill.chartAria": "Aggregate Notebook 03 metrics",
    "skill.sample": "Observed-day n={direct}; recursive n={recursive}. Aggregate metrics from the official full run.",
    "stats.eyebrow": "Public coverage", "stats.title": "Dataset by the numbers",
    "stats.intro": "Counts calculated directly from the operational snapshot.",
    "stats.records": "Public records", "stats.recordsNote": "Operational, skill and verification series",
    "stats.days": "Available days", "stats.daysNote": "Thirty-year archive, history and current window",
    "stats.checks": "Verification comparisons", "stats.checksNote": "Observed, original and corrected",
    "stats.thermal": "Thermal points", "stats.thermalNote": "Reconstruction, GLM and multimodel",
    "stats.horizons": "Evaluated horizons", "stats.horizonsNote": "Public verification leads",
    "stats.sources": "Tracked sources", "stats.sourcesNote": "Official public services",
    "paper.eyebrow": "Fixed article results", "paper.title": "Verified Notebook 01-03 results",
    "paper.intro": "Scientific manuscript summary, kept separate from the operational snapshot updated each day.",
    "paper.fixed": "Validated results", "paper.observations": "Valid observations", "paper.observationsNote": "71 sampling sites",
    "paper.dates": "Independent dates", "paper.datesNote": "Effective temporal sample",
    "paper.glmRmse": "GLM RMSE", "paper.glmRmseValue": "1.554 °C", "paper.glmRmseNote": "Date-grouped validation",
    "paper.glmMae": "GLM MAE", "paper.glmMaeValue": "1.274 °C", "paper.glmMaeNote": "Selected seasonal model",
    "paper.events": "MHW-like events", "paper.eventDays": "Event days", "paper.eventDaysNote": "Mean duration 8.80 days",
    "paper.overlap": "Observed overlap", "paper.overlapNote": "Days across 6 events",
    "paper.outDomain": "Outside domain", "paper.outDomainValue": "27.7%", "paper.outDomainNote": "Event days outside or strongly outside",
    "paper.trend": "Trend: annual events increased from 2.07 to 4.67; annual event days increased from 15.87 to 43.40.",
    "paper.coverage": "Coverage: the article reconstructs 22,330 valid days in 1964-2025; the site shows the continuous 10,958-day MHW subset for 1995-2024.",
    "paper.caveat": "The catalogue and threshold exceedances are modelled: they indicate thermal risk and do not replace a continuous observational record.",
    "stats.timestampsAria": "Consolidated data timestamps", "stats.timestampsTitle": "Data timestamps",
    "stats.timestampsIntro": "One update area, with sources sharing the same date grouped together.",
    "stats.snapshot": "Public snapshot", "stats.issue": "Forecast issue", "stats.coverage": "Current coverage",
    "stats.availability": "Latest availability", "stats.copModel": "Copernicus model", "stats.satellite": "L4 satellite",
    "stats.weather": "Weather", "stats.marineProxy": "Marine proxy",
    "sources.eyebrow": "Traceability", "sources.title": "What this forecast uses", "sources.open": "Open official source ↗",
    "total.eyebrow": "Complete thermal overview", "total.title": "From the reconstructed thirty-year period to today",
    "total.intro": "Every daily value contributes to the envelope. The line shows the monthly pattern while preserving extremes and long-term variation.",
    "total.summaryAria": "Complete series summary", "total.period": "Period", "total.days": "Days", "total.mean": "Mean", "total.maximum": "Maximum",
    "total.dailyEnvelope": "All daily data", "total.reconstruction": "Reconstruction 1995-2024", "total.current": "Modelling 2025-today",
    "total.chartAria": "Complete thermal series from 1995 to today", "total.note": "Compression is graphical only: daily minima and maxima remain represented in every chart column.",
    "total.reconstructedType": "Reconstruction", "total.modelledType": "Recent modelling",
    "tutorial.eyebrow": "Quick guide", "tutorial.title": "The tool in 11 seconds",
    "tutorial.intro": "OLED mode, daily comparison, charts, verification, statistics and sources in one short sequence.",
    "tutorial.fallback": "Your browser does not support video.",
    "footer.prototype": "Operational scientific prototype. Not suitable for navigation or public-health alerts.",
    "footer.texture": "Visual textures adapted from Computational-Physics / MQ assets.", "footer.project": "Project", "footer.data": "Data", "footer.notes": "Notes",
    noscript: "This tool requires JavaScript for charts and date selection.",
    "common.unavailable": "Unavailable", "dynamic.range": "5-95% range: {low}-{high} °C", "dynamic.l4": "L4 value for {date}",
    "dynamic.noPrevious": "No earlier value available", "dynamic.proxyRange": "Range {min}-{max} °C", "dynamic.noMinMax": "Minimum and maximum unavailable",
    "dynamic.aboveP95": "above p95 (warmer than 95% of history)", "dynamic.aboveP90": "above p90 (warmer than 90% of history)", "dynamic.belowP90": "below p90",
    "dynamic.truth": "{date} - lagoon GLM {thermal}. Copernicus and satellite describe the offshore point and do not replace an internal logger.",
    "dynamic.futureTruth": "{date} - lagoon forecast. Satellite not yet observed; Copernicus and the proxy appear only within their own horizons.",
    "dynamic.pastTruth": "{date} - recent day in the rolling window. Public observations are shown only when actually available.",
    "dynamic.historyTruth": "{date} - modelled history at lead +{lead}. Reference, original and corrected forecasts use the same valid day.",
    "dynamic.reconstructionTruth": "{date} - daily reconstruction within the 1995-2024 thirty-year period. Modelled value, climatology and thresholds use the same day.",
    "dynamic.reconstructedRange": "Official 01 reconstruction", "dynamic.climateBaseline": "1982-2011 baseline",
    "dynamic.reconstructionDelta": "Reconstruction minus climatology", "dynamic.reconstructionP90Delta": "Reconstruction minus p90", "dynamic.reconstructionEvent": "Event classification",
    "dynamic.eventYes": "Heatwave-like", "dynamic.eventNo": "No event",
    "dynamic.satellitePending": "Observation not yet available for the future day",
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

function latestDate(rows) {
  return (rows || []).map((row) => row.date).filter(Boolean).sort().at(-1) || null;
}

function updateClock() {
  const node = $("#liveClock");
  if (!node) return;
  const now = new Date();
  node.textContent = new Intl.DateTimeFormat(locale(), {
    timeZone: "Europe/Rome",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).format(now);
  node.dateTime = now.toISOString();
}

function startClock() {
  updateClock();
  window.clearInterval(clockTimer);
  clockTimer = window.setInterval(updateClock, 1000);
}

function setGeneratedDate() {
  if (!DATA) return;
  const generatedAt = new Date(DATA.meta.generated_at);
  const generated = new Intl.DateTimeFormat(locale(), {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Europe/Rome"
  }).format(generatedAt);
  const generatedNode = $("#datasetGenerated");
  generatedNode.textContent = generated;
  generatedNode.dateTime = generatedAt.toISOString();

  const issueDate = DATA.multimodel_03.meta.issue_date;
  const issueNode = $("#datasetIssue");
  issueNode.textContent = localDate(issueDate);
  issueNode.dateTime = issueDate;
  $("#datasetCoverage").textContent = `${localDate(DATA.meta.valid_from)} - ${localDate(DATA.meta.valid_to || DATA.multimodel_03.meta.valid_through)}`;
}

function renderDatasetStats() {
  const multimodel = DATA.multimodel_03;
  const collections = [
    DATA.water_forecast,
    DATA.water_history,
    DATA.water_reconstruction,
    multimodel.operational,
    multimodel.direct_full_run_skill,
    multimodel.observed_day_skill,
    multimodel.recursive_skill,
    DATA.copernicus.model_daily,
    DATA.copernicus.satellite_daily,
    DATA.offshore_proxy,
    DATA.weather,
    DATA.air_verification.performance,
    DATA.air_verification.daily
  ];
  const records = collections.reduce((total, rows) => total + (Array.isArray(rows) ? rows.length : 0), 0);
  const horizons = new Set(DATA.air_verification.performance.map((row) => row.lead_days));
  const count = (value) => new Intl.NumberFormat(locale()).format(value);

  $("#statRecords").textContent = count(records);
  const availableDays = new Set([...DATA.water_reconstruction, ...DATA.water_history, ...DATA.water_forecast].map((row) => row.date));
  $("#statDays").textContent = count(availableDays.size);
  $("#statChecks").textContent = count(DATA.air_verification.daily.length);
  $("#statThermal").textContent = count(DATA.water_reconstruction.length + DATA.water_forecast.length + multimodel.operational.length);
  $("#statHorizons").textContent = count(horizons.size);
  $("#statSources").textContent = count(DATA.sources.length);
  const availability = [
    { label: t("stats.copModel"), date: latestDate(DATA.copernicus.model_daily) },
    { label: t("stats.satellite"), date: latestDate(DATA.copernicus.satellite_daily) },
    { label: t("stats.weather"), date: latestDate(DATA.weather) },
    { label: t("stats.marineProxy"), date: latestDate(DATA.offshore_proxy) }
  ];
  const grouped = new Map();
  availability.forEach(({ label, date }) => {
    if (!date) return;
    if (!grouped.has(date)) grouped.set(date, []);
    grouped.get(date).push(label);
  });
  $("#datasetAvailability").textContent = [...grouped.entries()]
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
    .map(([date, labels]) => `${labels.join(" + ")}: ${localDate(date)}`)
    .join(" / ");
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
  updateDensityControl();
  updateClock();
  if (DATA) {
    setGeneratedDate();
    renderDatasetStats();
    renderSources();
    updateDay();
    updateMultimodel();
    updateModelSkill();
    updateAirVerification();
    renderTotalHistory();
  }
}

function bindLanguageSwitch() {
  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => applyLanguage(button.dataset.lang));
  });
}

function updateDensityControl() {
  const button = $("#densityToggle");
  if (!button) return;
  button.setAttribute("aria-pressed", String(compactMode));
  $("#densityLabel").textContent = compactMode ? "STD" : "OLED";
  $("#densityState").textContent = t(compactMode ? "density.standard" : "density.compact");
  button.setAttribute("aria-label", t(compactMode ? "density.enableStandard" : "density.enableCompact"));
}

function updateChartPalette() {
  Object.assign(COLORS, compactMode ? {
    ours: "#ff334d", glm: "#eaff00", direct: "#ffe600", recursive: "#39ff88",
    cop: "#00c8ff", sat: "#00ffb7", actual: "#f1fff8", corrected: "#ff334d",
    original: "#00c8ff", grid: "#18372f", muted: "#86aa9e"
  } : {
    ours: "#d84a5f", glm: "#76535b", direct: "#d99a35", recursive: "#24805f",
    cop: "#176ea6", sat: "#1aa3a3", actual: "#173631", corrected: "#d84a5f",
    original: "#176ea6", grid: "#dce6e1", muted: "#6b7c76"
  });
}

function redrawAllCharts() {
  if (!DATA) return;
  drawWaterChart();
  drawSkillChart();
  updateAirVerification();
  drawTotalHistoryChart();
}

function applyDensity(compact, persist = true) {
  compactMode = Boolean(compact);
  document.body.classList.toggle("oled-compact", compactMode);
  updateChartPalette();
  updateDensityControl();
  const theme = document.querySelector('meta[name="theme-color"]');
  if (theme) theme.content = compactMode ? "#020504" : "#123f3b";
  if (persist) {
    try { localStorage.setItem("sg-density", compactMode ? "compact" : "standard"); } catch (_) { /* preference remains session-only */ }
  }
  requestAnimationFrame(() => requestAnimationFrame(redrawAllCharts));
}

function bindDensityToggle() {
  $("#densityToggle")?.addEventListener("click", () => applyDensity(!compactMode));
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

function historyByDateLead(date, lead) {
  return DATA.water_history.find((row) => row.date === date && Number(row.lead_days) === Number(lead));
}

function reconstructionByDate(date) {
  return byDate(DATA.water_reconstruction, date);
}

function selectableDates() {
  return [...new Set([...DATA.water_reconstruction, ...DATA.water_history, ...DATA.water_forecast].map((row) => row.date))].sort();
}

function nearestSelectableDate(date, dates) {
  if (dates.includes(date)) return date;
  const target = new Date(`${date}T12:00:00Z`).getTime();
  if (!Number.isFinite(target)) return dates[0];
  return dates.reduce((closest, candidate) => {
    const distance = Math.abs(new Date(`${candidate}T12:00:00Z`).getTime() - target);
    return distance < closest.distance ? { date: candidate, distance } : closest;
  }, { date: dates[0], distance: Number.POSITIVE_INFINITY }).date;
}

function setYearOptions() {
  const years = [...new Set(selectableDates().map((date) => date.slice(0, 4)))].sort((a, b) => b.localeCompare(a));
  $("#yearPicker").innerHTML = years.map((year) => `<option value="${year}">${year}</option>`).join("");
}

function setYear(year) {
  const yearDates = selectableDates().filter((date) => date.startsWith(`${year}-`));
  if (!yearDates.length) return;
  const monthDay = selectedDate?.slice(5) || "01-01";
  setDate(nearestSelectableDate(`${year}-${monthDay}`, yearDates));
}

function selectedHistoryRows() {
  if (byDate(DATA.water_forecast, selectedDate)) return [];
  const lead = Number($("#modelLeadSelect").value || 1);
  const rows = DATA.water_history.filter((row) => Number(row.lead_days) === lead).sort((a, b) => a.date.localeCompare(b.date));
  const selectedIndex = rows.findIndex((row) => row.date === selectedDate);
  if (selectedIndex < 0) return [];
  const dayGap = (left, right) => (new Date(`${right}T12:00:00Z`) - new Date(`${left}T12:00:00Z`)) / 86400000;
  let segmentStart = selectedIndex;
  let segmentEnd = selectedIndex + 1;
  while (segmentStart > 0 && dayGap(rows[segmentStart - 1].date, rows[segmentStart].date) <= 1) segmentStart -= 1;
  while (segmentEnd < rows.length && dayGap(rows[segmentEnd - 1].date, rows[segmentEnd].date) <= 1) segmentEnd += 1;
  const segment = rows.slice(segmentStart, segmentEnd);
  const indexInSegment = selectedIndex - segmentStart;
  const start = Math.max(0, Math.min(indexInSegment - 15, segment.length - 31));
  return segment.slice(start, Math.min(segment.length, start + 31));
}

function selectedReconstructionRows() {
  const rows = DATA.water_reconstruction;
  const selectedIndex = rows.findIndex((row) => row.date === selectedDate);
  if (selectedIndex < 0) return [];
  const start = Math.max(0, Math.min(selectedIndex - 15, rows.length - 31));
  return rows.slice(start, Math.min(rows.length, start + 31));
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

function setDate(date, syncModel = true) {
  const dates = selectableDates();
  selectedDate = nearestSelectableDate(date, dates);
  $("#datePicker").value = selectedDate;
  $("#yearPicker").value = selectedDate.slice(0, 4);
  $("#prevDate").disabled = dates.indexOf(selectedDate) <= 0;
  $("#nextDate").disabled = dates.indexOf(selectedDate) >= dates.length - 1;
  if (syncModel) updateMultimodel();
  updateDay();
}

function setKpiMode(reconstructionMode) {
  $("#refreshCopernicus").hidden = reconstructionMode;
  if (reconstructionMode) {
    $("#glmKicker").textContent = "1995-2024";
    $("#glmSource").textContent = "GLM 01";
    $("#glmTitle").textContent = t("mm.reconstructed");
    $("#copKicker").textContent = "Baseline";
    $("#copSource").textContent = "1982-2011";
    $("#copTitle").textContent = t("mm.climatology");
    $("#copNote").textContent = t("dynamic.climateBaseline");
    $("#satKicker").textContent = "Soglia";
    $("#satSource").textContent = "p90";
    $("#satTitle").textContent = "Percentile 90";
    $("#proxyKicker").textContent = "Scarto";
    $("#proxySource").textContent = "Δ";
    $("#proxyTitle").textContent = t("mm.reconstructionAnomaly");
    $("#diffCopGlmLabel").textContent = t("dynamic.reconstructionDelta");
    $("#diffSatGlmLabel").textContent = t("dynamic.reconstructionP90Delta");
    $("#diffCopSatLabel").textContent = t("dynamic.reconstructionEvent");
    return;
  }
  $("#glmKicker").textContent = "Enhanced";
  $("#glmSource").textContent = t("water.ourModel");
  $("#glmTitle").textContent = t("water.lagoon");
  $("#copKicker").textContent = "Offshore";
  $("#copSource").textContent = "Copernicus";
  $("#copTitle").textContent = t("water.medModel");
  $("#copNote").textContent = t("water.surface");
  $("#satKicker").textContent = t("water.observation");
  $("#satSource").textContent = "Satellite";
  $("#satTitle").textContent = "SST offshore";
  $("#proxyKicker").textContent = t("water.public");
  $("#proxySource").textContent = "Proxy";
  $("#proxyTitle").textContent = "Marine API offshore";
  $("#diffCopGlmLabel").textContent = t("diff.copGlm");
  $("#diffSatGlmLabel").textContent = t("diff.satGlm");
  $("#diffCopSatLabel").textContent = t("diff.copSat");
}

function updateDay() {
  const reconstruction = reconstructionByDate(selectedDate);
  if (reconstruction) {
    setKpiMode(true);
    $("#glmValue").textContent = number(reconstruction.reconstructed_c, 2);
    $("#glmRange").textContent = t("dynamic.reconstructedRange");
    $("#copValue").textContent = number(reconstruction.climatology_c, 2);
    $("#satValue").textContent = number(reconstruction.p90_c, 2);
    $("#satDate").textContent = `p95: ${number(reconstruction.p95_c, 2)}`;
    $("#proxyValue").textContent = signed(reconstruction.anomaly_c, 2);
    $("#proxyRange").textContent = `${t("dynamic.reconstructionP90Delta")}: ${signed(reconstruction.intensity_above_p90_c, 2)}`;
    $("#diffCopGlm").textContent = signed(reconstruction.anomaly_c, 2);
    $("#diffSatGlm").textContent = signed(reconstruction.intensity_above_p90_c, 2);
    $("#diffCopSat").textContent = t(reconstruction.heatwave_like ? "dynamic.eventYes" : "dynamic.eventNo");
    $("#anomalyValue").textContent = signed(reconstruction.anomaly_c, 2);
    $("#p90Value").textContent = number(reconstruction.p90_c, 2);
    $("#p95Value").textContent = number(reconstruction.p95_c, 2);
    $("#truthBanner").textContent = t("dynamic.reconstructionTruth", { date: localDate(selectedDate) });
    $("#readingTitle").textContent = t("reading.reconstructionTitle");
    $("#readingText").textContent = t("reading.reconstructionText");
    $("#readingCaution").hidden = false;
    $("#weatherRow").hidden = true;
    drawWaterChart();
    renderWaterTable();
    return;
  }

  setKpiMode(false);
  $("#weatherRow").hidden = false;
  const rollingWater = byDate(DATA.water_forecast, selectedDate);
  const historyLead = Number($("#modelLeadSelect").value || 1);
  const history = historyByDateLead(selectedDate, historyLead);
  const water = rollingWater || (history ? { glm_c: history.reference_model_c } : null);
  const cop = byDate(DATA.copernicus.model_daily, selectedDate);
  const isFuture = selectedDate > DATA.meta.reference_date;
  const isPast = selectedDate < DATA.meta.reference_date;
  const satellite = isFuture
    ? byDate(DATA.copernicus.satellite_daily, selectedDate)
    : latestOnOrBefore(DATA.copernicus.satellite_daily, selectedDate);
  const proxy = byDate(DATA.offshore_proxy, selectedDate);
  const dayWeather = byDate(DATA.weather, selectedDate);

  $("#glmValue").textContent = number(water?.glm_c, 2);
  $("#glmRange").textContent = history && !rollingWater
    ? t("water.historyReference", { lead: historyLead })
    : rollingWater ? t("dynamic.range", { low: formatNumber(rollingWater.q05_c, 2), high: formatNumber(rollingWater.q95_c, 2) }) : t("water.rangeUnavailable");
  $("#copValue").textContent = number(cop?.value_c, 2);
  $("#satValue").textContent = number(satellite?.value_c, 2);
  $("#satDate").textContent = satellite
    ? t("dynamic.l4", { date: localDate(satellite.date) })
    : isFuture ? t("dynamic.satellitePending") : t("dynamic.noPrevious");
  $("#proxyValue").textContent = number(proxy?.mean_c, 2);
  $("#proxyRange").textContent = proxy ? t("dynamic.proxyRange", { min: formatNumber(proxy.min_c, 1), max: formatNumber(proxy.max_c, 1) }) : t("dynamic.noMinMax");

  $("#diffCopGlm").textContent = signed(cop && water ? cop.value_c - water.glm_c : null);
  $("#diffSatGlm").textContent = signed(satellite && water ? satellite.value_c - water.glm_c : null);
  $("#diffCopSat").textContent = signed(cop && satellite ? cop.value_c - satellite.value_c : null);
  $("#anomalyValue").textContent = signed(water?.anomaly_c);
  $("#p90Value").textContent = number(water?.p90_c, 2);
  $("#p95Value").textContent = number(water?.p95_c, 2);

  const historicalMode = Boolean(history && !rollingWater);
  if (historicalMode) {
    $("#truthBanner").textContent = t("dynamic.historyTruth", { date: localDate(selectedDate), lead: historyLead });
    $("#readingTitle").textContent = t("reading.historyTitle");
    $("#readingText").textContent = t("reading.historyText");
    $("#readingCaution").hidden = true;
  } else {
    const thermal = rollingWater?.above_p95 ? t("dynamic.aboveP95") : rollingWater?.above_p90 ? t("dynamic.aboveP90") : t("dynamic.belowP90");
    $("#truthBanner").textContent = isFuture
      ? t("dynamic.futureTruth", { date: localDate(selectedDate) })
      : isPast ? t("dynamic.pastTruth", { date: localDate(selectedDate) })
        : t("dynamic.truth", { date: localDate(selectedDate), thermal });
    $("#readingTitle").textContent = rollingWater?.above_p95 ? t("reading.high") : rollingWater?.above_p90 ? t("reading.risk") : t("reading.below");
    $("#readingText").textContent = cop && rollingWater
      ? t("dynamic.spatial", { delta: formatNumber(Math.abs(cop.value_c - rollingWater.glm_c), 2), direction: cop.value_c >= rollingWater.glm_c ? t("dynamic.warmer") : t("dynamic.cooler") })
      : t("dynamic.noCop");
    $("#readingCaution").hidden = false;
  }

  renderWeather(dayWeather);
  drawWaterChart();
  renderWaterTable();
}

function setModelLeadOptions(leads) {
  const values = [...new Set(leads.map(Number))].sort((a, b) => a - b);
  const signature = values.join(",");
  const select = $("#modelLeadSelect");
  if (select.dataset.leads === signature) return;
  const previous = Number(select.value || values[0]);
  select.innerHTML = values.map((lead) => `<option value="${lead}">+${lead}</option>`).join("");
  select.dataset.leads = signature;
  select.value = values.includes(previous) ? String(previous) : String(values[0]);
}

function updateMultimodel() {
  const operational = DATA.multimodel_03.operational;
  const issueDate = DATA.multimodel_03.meta.issue_date;
  const row = byDate(operational, selectedDate);
  const daily = byDate(DATA.water_forecast, selectedDate);
  const reconstruction = reconstructionByDate(selectedDate);
  const hasHistoryDate = DATA.water_history.some((item) => item.date === selectedDate);
  const dailyMode = Boolean(daily && (!row || selectedDate <= issueDate));

  if (reconstruction) {
    const thermalKey = reconstruction.heatwave_like
      ? "mm.heatwaveLike"
      : reconstruction.above_p95 ? "mm.aboveP95" : reconstruction.above_p90 ? "mm.aboveP90" : "mm.belowP90";
    $("#modelLeadControl").hidden = true;
    $("#multimodelEyebrow").textContent = t("mm.reconstructionEyebrow");
    $("#multimodelTitle").textContent = t("mm.reconstructionTitle");
    $("#multimodelIntro").textContent = t("mm.reconstructionIntro");
    $("#mmRecursiveLabel").textContent = t("mm.reconstructed");
    $("#mmDirectLabel").textContent = t("mm.climatology");
    $("#mmDeltaLabel").textContent = t("mm.reconstructionAnomaly");
    $("#mmWinnerLabel").textContent = t("mm.thermalClass");
    $("#mmRecursiveValue").textContent = number(reconstruction.reconstructed_c, 2);
    $("#mmDirectValue").textContent = number(reconstruction.climatology_c, 2);
    $("#mmDeltaValue").textContent = signed(reconstruction.anomaly_c, 2);
    $("#mmWinnerModel").textContent = t(thermalKey);
    $("#mmTargetDate").textContent = t("mm.reconstructionTarget", { date: localDate(selectedDate) });
    $("#mmDirectNote").textContent = t("mm.climatologyNote");
    $("#mmDeltaNote").textContent = t("mm.reconstructionAnomalyNote");
    $("#mmWinnerNote").textContent = t("mm.thermalClassNote");
    $("#mmIssueStatus").textContent = t("mm.reconstructionStatus");
    $("#mmFreshnessStatus").textContent = t("mm.reconstructionFresh");
    return;
  }

  if (hasHistoryDate && !daily) {
    const historyLeads = DATA.water_history.filter((item) => item.date === selectedDate).map((item) => item.lead_days);
    setModelLeadOptions(historyLeads);
    const lead = Number($("#modelLeadSelect").value || 1);
    const history = historyByDateLead(selectedDate, lead);
    const correctedWins = Math.abs(history.error_corrected_c) <= Math.abs(history.error_original_c);
    $("#modelLeadControl").hidden = false;
    $("#modelLeadLabel").textContent = t("mm.archiveLead");
    $("#multimodelEyebrow").textContent = t("mm.archiveEyebrow");
    $("#multimodelTitle").textContent = t("mm.archiveTitle");
    $("#multimodelIntro").textContent = t("mm.archiveIntro");
    $("#mmRecursiveLabel").textContent = t("mm.archiveCorrected");
    $("#mmDirectLabel").textContent = t("mm.archiveOriginal");
    $("#mmDeltaLabel").textContent = t("mm.archiveDelta");
    $("#mmWinnerLabel").textContent = t("mm.archiveCloser");
    $("#mmRecursiveValue").textContent = number(history.corrected_c, 2);
    $("#mmDirectValue").textContent = number(history.original_c, 2);
    $("#mmDeltaValue").textContent = signed(history.error_corrected_c, 2);
    $("#mmWinnerModel").textContent = t(correctedWins ? "mm.archiveCorrectedWins" : "mm.archiveOriginalWins");
    $("#mmTargetDate").textContent = t("mm.archiveTarget", { date: localDate(selectedDate), lead });
    $("#mmDirectNote").textContent = t("mm.archiveOriginalNote");
    $("#mmDeltaNote").textContent = t("mm.archiveDeltaNote");
    $("#mmWinnerNote").textContent = t("mm.archiveCloserNote");
    $("#mmIssueStatus").textContent = t("mm.archiveStatus");
    $("#mmFreshnessStatus").textContent = t("mm.archiveFresh");
    return;
  }

  if (dailyMode) {
    $("#modelLeadControl").hidden = true;
    $("#multimodelEyebrow").textContent = t("mm.historyEyebrow");
    $("#multimodelTitle").textContent = t("mm.historyTitle");
    $("#multimodelIntro").textContent = t("mm.historyIntro");
    $("#mmRecursiveLabel").textContent = t("mm.historyMulti");
    $("#mmDirectLabel").textContent = t("mm.historyGlm");
    $("#mmDeltaLabel").textContent = t("mm.historyDelta");
    $("#mmWinnerLabel").textContent = t("mm.historyMethod");
    $("#mmRecursiveValue").textContent = number(daily.multimodel_c, 2);
    $("#mmDirectValue").textContent = number(daily.glm_c, 2);
    $("#mmDeltaValue").textContent = signed(daily.multimodel_c - daily.glm_c, 2);
    $("#mmWinnerModel").textContent = t("mm.historyMethodValue");
    $("#mmTargetDate").textContent = t("mm.historyTarget", { date: localDate(selectedDate) });
    $("#mmDirectNote").textContent = t("mm.historyGlmNote");
    $("#mmDeltaNote").textContent = t("mm.historyDeltaNote");
    $("#mmWinnerNote").textContent = t("mm.historyMethodNote");
    $("#mmIssueStatus").textContent = t("mm.historyStatus", { date: localDate(selectedDate) });
    $("#mmFreshnessStatus").textContent = t("mm.historyFresh");
    return;
  }

  setModelLeadOptions(operational.map((item) => item.lead_days));
  $("#modelLeadControl").hidden = false;
  $("#modelLeadLabel").textContent = t("mm.horizon");
  $("#multimodelEyebrow").textContent = t("mm.eyebrow");
  $("#multimodelTitle").textContent = t("mm.title");
  $("#multimodelIntro").textContent = t("mm.intro");
  $("#mmRecursiveLabel").textContent = t("mm.recursive");
  $("#mmDeltaLabel").textContent = t("mm.delta");
  $("#mmWinnerLabel").textContent = t("mm.winner");
  if (row) $("#modelLeadSelect").value = String(row.lead_days);
  const lead = Number(row?.lead_days || $("#modelLeadSelect").value || 1);
  const hasDirect = Number.isFinite(row?.direct_selected_c);
  $("#mmDirectLabel").textContent = hasDirect ? t("mm.direct") : t("mm.dailyEstimate");
  $("#mmDirectNote").textContent = hasDirect ? t("mm.directAvailability") : t("mm.dailyEstimateNote");
  $("#mmDeltaNote").textContent = t("mm.deltaNote");
  $("#mmRecursiveValue").textContent = number(row?.enhanced_recursive_c, 2);
  $("#mmDirectValue").textContent = number(hasDirect ? row.direct_selected_c : daily?.multimodel_c, 2);
  $("#mmDeltaValue").textContent = signed(row?.delta_vs_glm_c, 2);
  $("#mmWinnerModel").textContent = modelLabel(row?.winner_model);
  $("#mmTargetDate").textContent = row ? t("mm.target", { date: localDate(row.date), lead }) : "-";
  $("#mmWinnerNote").textContent = t("mm.winnerNote", { mode: "next" });
  $("#mmIssueStatus").textContent = t("mm.issue", {
    date: localDate(issueDate),
    valid: localDate(DATA.multimodel_03.meta.valid_through)
  });
  const ageHours = (Date.now() - new Date(DATA.meta.generated_at).getTime()) / 3600000;
  $("#mmFreshnessStatus").textContent = ageHours <= 36 ? t("mm.fresh") : t("mm.stale");
  if (!row) $("#mmTargetDate").textContent = t("mm.outside");
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
  $("#weatherRow").innerHTML = items.map((item) => `<article class="weather-card"><span class="weather-icon-shell ${item.tone}" aria-hidden="true"><img src="./assets/icons/${item.icon}.svg" alt="" width="28" height="28"></span><span class="weather-copy"><b>${item.title}</b><span class="weather-detail">${item.detail}</span></span></article>`).join("");
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

function updateWaterLegend(mode) {
  const reconstructionMode = mode === "reconstruction";
  const historyMode = mode === true || mode === "history";
  if (reconstructionMode) {
    $("#legendGlmLabel").textContent = t("mm.reconstructed");
    $("#legendEnhancedLabel").textContent = t("mm.climatology");
    $("#legendCopLabel").textContent = "p90";
    $("#legendSatLabel").textContent = "p95";
    $("#legendGlmItem i").style.background = COLORS.ours;
    $("#legendEnhancedItem i").style.background = COLORS.glm;
    $("#legendCopItem i").style.background = COLORS.direct;
    $("#legendSatItem i").style.background = COLORS.cop;
    $("#legendDirectItem").hidden = true;
    $("#legendSatItem").hidden = false;
    return;
  }
  $("#legendGlmLabel").textContent = historyMode ? t("trajectory.historyReference") : "GLM 01";
  $("#legendEnhancedLabel").textContent = historyMode ? t("trajectory.historyCorrected") : t("trajectory.enhanced");
  $("#legendCopLabel").textContent = historyMode ? t("trajectory.historyOriginal") : "Copernicus";
  $("#legendSatLabel").textContent = "Satellite";
  $("#legendGlmItem i").style.background = COLORS.glm;
  $("#legendEnhancedItem i").style.background = COLORS.ours;
  $("#legendCopItem i").style.background = COLORS.cop;
  $("#legendSatItem i").style.background = COLORS.sat;
  $("#legendDirectItem").hidden = historyMode;
  $("#legendSatItem").hidden = historyMode;
}

function drawWaterChart() {
  const reconstructionRows = selectedReconstructionRows();
  if (reconstructionRows.length) {
    updateWaterLegend("reconstruction");
    const labels = reconstructionRows.map((row) => row.date);
    const reconstructed = reconstructionRows.map((row) => row.reconstructed_c);
    const climatology = reconstructionRows.map((row) => row.climatology_c);
    const p90 = reconstructionRows.map((row) => row.p90_c);
    const p95 = reconstructionRows.map((row) => row.p95_c);
    const frame = chartFrame($("#waterChart"), [...reconstructed, ...climatology, ...p90, ...p95], labels);
    drawSeries(frame, climatology, COLORS.glm, 2.2, [7, 4]);
    drawSeries(frame, p90, COLORS.direct, 2.3);
    drawSeries(frame, p95, COLORS.cop, 2.1, [5, 4]);
    drawSeries(frame, reconstructed, COLORS.ours, 4.1);
    drawPoints(frame, reconstructed, COLORS.ours, 3.2);
    const index = labels.indexOf(selectedDate);
    if (index >= 0) {
      const { ctx, x } = frame;
      ctx.strokeStyle = "rgba(23,54,49,.35)"; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(x(index), frame.pad.top); ctx.lineTo(x(index), frame.height - frame.pad.bottom); ctx.stroke(); ctx.setLineDash([]);
    }
    return;
  }

  const historicalRows = selectedHistoryRows();
  if (historicalRows.length) {
    updateWaterLegend(true);
    const labels = historicalRows.map((row) => row.date);
    const reference = historicalRows.map((row) => row.reference_model_c);
    const original = historicalRows.map((row) => row.original_c);
    const corrected = historicalRows.map((row) => row.corrected_c);
    const frame = chartFrame($("#waterChart"), [...reference, ...original, ...corrected], labels);
    drawSeries(frame, reference, COLORS.glm, 2.2, [7, 4]);
    drawSeries(frame, original, COLORS.cop, 2.6);
    drawSeries(frame, corrected, COLORS.ours, 4.1);
    drawPoints(frame, corrected, COLORS.ours, 3.2);
    const index = labels.indexOf(selectedDate);
    if (index >= 0) {
      const { ctx, x } = frame;
      ctx.strokeStyle = "rgba(23,54,49,.35)"; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(x(index), frame.pad.top); ctx.lineTo(x(index), frame.height - frame.pad.bottom); ctx.stroke(); ctx.setLineDash([]);
    }
    return;
  }

  updateWaterLegend(false);
  const labels = DATA.water_forecast.map((row) => row.date);
  const glm = DATA.water_forecast.map((row) => row.glm_c);
  const low = DATA.water_forecast.map((row) => row.q05_c);
  const high = DATA.water_forecast.map((row) => row.q95_c);
  const cop = labels.map((date) => byDate(DATA.copernicus.model_daily, date)?.value_c ?? NaN);
  const sat = labels.map((date) => byDate(DATA.copernicus.satellite_daily, date)?.value_c ?? NaN);
  const operational = DATA.multimodel_03.operational;
  const issueDate = DATA.multimodel_03.meta.issue_date;
  const enhanced = labels.map((date) => {
    const forecast = byDate(operational, date);
    const daily = byDate(DATA.water_forecast, date);
    return forecast?.enhanced_recursive_c ?? (date <= issueDate ? daily?.multimodel_c : NaN);
  });
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
  const reconstructionRows = selectedReconstructionRows();
  if (reconstructionRows.length) {
    const rows = reconstructionRows.map((row) => `<tr><td>${row.date}</td><td>${formatNumber(row.reconstructed_c, 3)}</td><td>${formatNumber(row.climatology_c, 3)}</td><td>${formatNumber(row.p90_c, 3)}</td><td>${formatNumber(row.p95_c, 3)}</td><td>${formatNumber(row.anomaly_c, 3)}</td></tr>`).join("");
    $("#waterTable").innerHTML = `<table><caption>${t("trajectory.caption")}</caption><thead><tr><th>${t("trajectory.date")}</th><th>${t("mm.reconstructed")}</th><th>${t("mm.climatology")}</th><th>p90</th><th>p95</th><th>${t("mm.reconstructionAnomaly")}</th></tr></thead><tbody>${rows}</tbody></table>`;
    return;
  }
  const historicalRows = selectedHistoryRows();
  if (historicalRows.length) {
    const rows = historicalRows.map((row) => `<tr><td>${row.date}</td><td>${formatNumber(row.reference_model_c, 3)}</td><td>${formatNumber(row.original_c, 3)}</td><td>${formatNumber(row.corrected_c, 3)}</td></tr>`).join("");
    $("#waterTable").innerHTML = `<table><caption>${t("trajectory.caption")}</caption><thead><tr><th>${t("trajectory.date")}</th><th>${t("trajectory.historyReference")}</th><th>${t("trajectory.historyOriginal")}</th><th>${t("trajectory.historyCorrected")}</th></tr></thead><tbody>${rows}</tbody></table>`;
    return;
  }
  const rows = DATA.water_forecast.map((row) => {
    const cop = byDate(DATA.copernicus.model_daily, row.date);
    const sat = byDate(DATA.copernicus.satellite_daily, row.date);
    const mm = byDate(DATA.multimodel_03.operational, row.date);
    const enhanced = mm?.enhanced_recursive_c ?? (row.date <= DATA.multimodel_03.meta.issue_date ? row.multimodel_c : null);
    return `<tr><td>${row.date}</td><td>${formatNumber(row.glm_c, 3)}</td><td>${Number.isFinite(enhanced) ? formatNumber(enhanced, 3) : ""}</td><td>${Number.isFinite(mm?.direct_selected_c) ? formatNumber(mm.direct_selected_c, 3) : ""}</td><td>${cop ? formatNumber(cop.value_c, 3) : ""}</td><td>${sat ? formatNumber(sat.value_c, 3) : ""}</td></tr>`;
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

function totalThermalSeries() {
  if (totalSeriesCache) return totalSeriesCache;
  const values = new Map();
  DATA.water_reconstruction.forEach((row) => {
    if (row.date <= DATA.meta.reference_date && Number.isFinite(row.reconstructed_c)) {
      values.set(row.date, { date: row.date, value: row.reconstructed_c, kind: "reconstruction" });
    }
  });
  DATA.water_history.filter((row) => Number(row.lead_days) === 1).forEach((row) => {
    if (row.date <= DATA.meta.reference_date && Number.isFinite(row.reference_model_c)) {
      values.set(row.date, { date: row.date, value: row.reference_model_c, kind: "recent" });
    }
  });
  DATA.water_forecast.forEach((row) => {
    if (row.date <= DATA.meta.reference_date && Number.isFinite(row.glm_c)) {
      values.set(row.date, { date: row.date, value: row.glm_c, kind: "recent" });
    }
  });
  totalSeriesCache = [...values.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((row) => ({ ...row, time: new Date(`${row.date}T12:00:00Z`).getTime() }));
  return totalSeriesCache;
}

function totalMonthlySeries(rows) {
  const buckets = new Map();
  rows.forEach((row) => {
    const key = row.date.slice(0, 7);
    const bucket = buckets.get(key) || { key, sum: 0, count: 0, kind: row.kind };
    bucket.sum += row.value;
    bucket.count += 1;
    if (row.kind === "recent") bucket.kind = "recent";
    buckets.set(key, bucket);
  });
  return [...buckets.values()].sort((a, b) => a.key.localeCompare(b.key)).map((bucket) => ({
    date: `${bucket.key}-15`,
    time: new Date(`${bucket.key}-15T12:00:00Z`).getTime(),
    value: bucket.sum / bucket.count,
    kind: bucket.kind,
  }));
}

function drawTotalHistoryChart() {
  if (!DATA) return;
  const rows = totalThermalSeries();
  const canvas = $("#totalHistoryChart");
  if (!canvas || !rows.length) return;
  const { ctx, width, height } = canvasContext(canvas);
  const pad = { left: 47, right: 15, top: 18, bottom: 34 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const t0 = rows[0].time;
  const t1 = rows.at(-1).time;
  const min = Math.floor(Math.min(...rows.map((row) => row.value)) - 0.5);
  const max = Math.ceil(Math.max(...rows.map((row) => row.value)) + 0.5);
  const x = (time) => pad.left + ((time - t0) / Math.max(1, t1 - t0)) * plotWidth;
  const y = (value) => pad.top + ((max - value) / Math.max(1, max - min)) * plotHeight;

  ctx.clearRect(0, 0, width, height);
  ctx.font = "10px Segoe UI, sans-serif";
  ctx.lineWidth = 1;
  for (let step = 0; step <= 4; step += 1) {
    const value = min + ((max - min) * step) / 4;
    const yy = y(value);
    ctx.strokeStyle = COLORS.grid;
    ctx.beginPath(); ctx.moveTo(pad.left, yy); ctx.lineTo(width - pad.right, yy); ctx.stroke();
    ctx.fillStyle = COLORS.muted; ctx.textAlign = "right";
    ctx.fillText(`${formatNumber(value, 1)}°`, pad.left - 7, yy + 3);
  }

  const firstYear = Number(rows[0].date.slice(0, 4));
  const lastYear = Number(rows.at(-1).date.slice(0, 4));
  const years = [firstYear];
  for (let year = Math.ceil(firstYear / 5) * 5; year <= lastYear; year += 5) years.push(year);
  if (years.at(-1) !== lastYear && lastYear - years.at(-1) >= 3) years.push(lastYear);
  [...new Set(years)].forEach((year) => {
    const xx = x(new Date(`${year}-01-01T12:00:00Z`).getTime());
    ctx.strokeStyle = "rgba(220,230,225,.62)";
    ctx.beginPath(); ctx.moveTo(xx, pad.top); ctx.lineTo(xx, height - pad.bottom); ctx.stroke();
    ctx.fillStyle = COLORS.muted; ctx.textAlign = "center";
    ctx.fillText(String(year), xx, height - 13);
  });

  const bins = Array.from({ length: Math.max(1, Math.floor(plotWidth)) }, () => null);
  rows.forEach((row) => {
    const index = Math.max(0, Math.min(bins.length - 1, Math.floor(x(row.time) - pad.left)));
    const bucket = bins[index] || { min: row.value, max: row.value };
    bucket.min = Math.min(bucket.min, row.value);
    bucket.max = Math.max(bucket.max, row.value);
    bins[index] = bucket;
  });
  ctx.strokeStyle = "rgba(26,163,163,.22)";
  bins.forEach((bucket, index) => {
    if (!bucket) return;
    const xx = pad.left + index + 0.5;
    ctx.beginPath(); ctx.moveTo(xx, y(bucket.min)); ctx.lineTo(xx, y(bucket.max)); ctx.stroke();
  });

  const monthly = totalMonthlySeries(rows);
  const drawMonthly = (kind, color, lineWidth) => {
    ctx.strokeStyle = color; ctx.lineWidth = lineWidth; ctx.lineJoin = "round"; ctx.lineCap = "round";
    ctx.beginPath();
    let active = false;
    let previousTime = null;
    monthly.forEach((row) => {
      if (row.kind !== kind) { active = false; previousTime = null; return; }
      const gapDays = previousTime === null ? 0 : (row.time - previousTime) / 86400000;
      if (!active || gapDays > 62) { ctx.moveTo(x(row.time), y(row.value)); active = true; }
      else ctx.lineTo(x(row.time), y(row.value));
      previousTime = row.time;
    });
    ctx.stroke();
  };
  drawMonthly("reconstruction", "#315f56", 2.2);
  drawMonthly("recent", COLORS.ours, 3.6);

  const maximum = rows.reduce((best, row) => row.value > best.value ? row : best, rows[0]);
  ctx.fillStyle = COLORS.ours;
  ctx.beginPath(); ctx.arc(x(maximum.time), y(maximum.value), 3.4, 0, Math.PI * 2); ctx.fill();
  canvas._totalChart = { rows, pad, width, height, t0, t1, x, y };
}

function nearestTotalRow(rows, targetTime) {
  let low = 0;
  let high = rows.length - 1;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (rows[middle].time < targetTime) low = middle + 1;
    else high = middle;
  }
  if (low === 0) return rows[0];
  return Math.abs(rows[low].time - targetTime) < Math.abs(rows[low - 1].time - targetTime) ? rows[low] : rows[low - 1];
}

function showTotalTooltip(event) {
  const canvas = $("#totalHistoryChart");
  const tooltip = $("#totalChartTooltip");
  const chart = canvas?._totalChart;
  if (!chart) return;
  const rect = canvas.getBoundingClientRect();
  const localX = (event.clientX - rect.left) * (chart.width / rect.width);
  if (localX < chart.pad.left || localX > chart.width - chart.pad.right) { tooltip.hidden = true; return; }
  const targetTime = chart.t0 + ((localX - chart.pad.left) / (chart.width - chart.pad.left - chart.pad.right)) * (chart.t1 - chart.t0);
  const row = nearestTotalRow(chart.rows, targetTime);
  const cssX = chart.x(row.time) * (rect.width / chart.width);
  const cssY = chart.y(row.value) * (rect.height / chart.height);
  tooltip.innerHTML = `<span>${localDate(row.date)}</span><b>${number(row.value, 2)}</b><span>${t(row.kind === "reconstruction" ? "total.reconstructedType" : "total.modelledType")}</span>`;
  tooltip.style.left = `${Math.max(72, Math.min(rect.width - 72, cssX))}px`;
  tooltip.style.top = `${Math.max(58, cssY)}px`;
  tooltip.hidden = false;
}

function bindTotalHistoryPointer() {
  if (totalPointerBound) return;
  const canvas = $("#totalHistoryChart");
  if (!canvas) return;
  canvas.addEventListener("pointermove", showTotalTooltip);
  canvas.addEventListener("pointerdown", showTotalTooltip);
  canvas.addEventListener("pointerleave", () => { $("#totalChartTooltip").hidden = true; });
  totalPointerBound = true;
}

function renderTotalHistory() {
  const rows = totalThermalSeries();
  if (!rows.length) return;
  const maximum = rows.reduce((best, row) => row.value > best.value ? row : best, rows[0]);
  const mean = rows.reduce((sum, row) => sum + row.value, 0) / rows.length;
  $("#totalPeriod").textContent = `${localDate(rows[0].date)} - ${localDate(rows.at(-1).date)}`;
  $("#totalDays").textContent = new Intl.NumberFormat(locale()).format(rows.length);
  $("#totalMean").textContent = number(mean, 2);
  $("#totalMaximum").textContent = `${number(maximum.value, 2)} · ${localDate(maximum.date)}`;
  drawTotalHistoryChart();
  bindTotalHistoryPointer();
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
  const dates = selectableDates();
  setModelLeadOptions(DATA.multimodel_03.operational.map((row) => row.lead_days));
  setYearOptions();
  $("#datePicker").min = dates[0]; $("#datePicker").max = dates.at(-1);
  $("#datePicker").addEventListener("change", (event) => setDate(event.target.value));
  $("#yearPicker").addEventListener("change", (event) => setYear(event.target.value));
  $("#prevDate").addEventListener("click", () => setDate(dates[Math.max(0, dates.indexOf(selectedDate) - 1)]));
  $("#nextDate").addEventListener("click", () => setDate(dates[Math.min(dates.length - 1, dates.indexOf(selectedDate) + 1)]));
  $("#todayButton").addEventListener("click", () => setDate(DATA.meta.reference_date));
  $("#modelLeadSelect").addEventListener("change", () => {
    if (DATA.water_history.some((row) => row.date === selectedDate) && !byDate(DATA.water_forecast, selectedDate)) {
      updateMultimodel();
      updateDay();
      return;
    }
    const row = byLead(DATA.multimodel_03.operational, Number($("#modelLeadSelect").value));
    if (row) setDate(row.date, false);
    updateMultimodel();
  });
  $("#skillLeadSelect").addEventListener("change", updateModelSkill);
  $("#leadSelect").addEventListener("change", updateAirVerification);
  $("#refreshCopernicus").addEventListener("click", refreshPublicData);
  let resizeTimer;
  window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(redrawAllCharts, 150); });
}

async function init() {
  bindDensityToggle();
  applyDensity(compactMode, false);
  bindLanguageSwitch();
  applyLanguage(currentLang, false);
  startClock();
  try {
    try {
      const response = await fetch("./data/forecast_public.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      DATA = await response.json();
    } catch (fetchError) {
      if (!window.__SANTA_GILLA_PUBLIC_DATA__) throw fetchError;
      DATA = window.__SANTA_GILLA_PUBLIC_DATA__;
    }
    DATA.water_history = DATA.water_history || [];
    DATA.water_reconstruction = DATA.water_reconstruction || [];
    totalSeriesCache = null;
    setGeneratedDate();
    renderDatasetStats();
    renderSources();
    bindEvents();
    setDate(DATA.meta.reference_date);
    updateMultimodel();
    updateModelSkill();
    updateAirVerification();
    renderTotalHistory();
  } catch (error) {
    $("#truthBanner").textContent = t("dynamic.dataError");
    console.error(error);
  }
}

init();
