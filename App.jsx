import React, { useState, useMemo, useEffect, useCallback } from "react";

// ⚠️ URL da sua API (Apps Script). Se um dia você reimplantar e a URL mudar,
//    troque só esta linha.
const API_URL =
  "https://script.google.com/macros/s/AKfycbyi183noK7vugBRyh5AMMcgey2Ksz2oqQvKGAfZ8Q-ZcJU0ag4TxzuiAS6oDP0u3BI7/exec";


const C = {
  bg: "#0b0f10", surface: "#111a1c", surface2: "#162225", line: "#1e2f33",
  cyan: "#00c9cc", bright: "#71fcff", text: "#e8f2f3", muted: "#6f8488", danger: "#e0685f",
  lime: "#dbff00",
};

// campos que são multi-valor (separados por " | " na planilha) e viram chips
const MULTI = ["grupo", "subgrupo", "equipamento", "musculo_alvo"];
const FLAG_FIELDS = [
  { k: "video_proprio", label: "Vídeo próprio" },
  { k: "em_casa", label: "Em casa" },
  { k: "isometrico", label: "Isométrico" },
  { k: "unilateral", label: "Unilateral" },
  { k: "a_filmar", label: "A filmar" },
];


// Logo Idealis (SVG inline — herda a cor via currentColor)
const LOGO_D = "M897.5 1884.9C829.2 1881.6 751.2 1869.1 691.0 1851.9C627.4 1833.7 572.4 1812.3 517.5 1784.5C400.5 1725.2 298.9 1643.7 214.5 1541.5C136.6 1447.2 76.0 1334.2 40.5 1217.0C-16.4 1029.3 -13.0 824.3 49.9 639.8C107.0 472.5 209.1 325.6 346.7 212.6C478.5 104.5 642.5 32.6 809.5 9.6C922.4 -6.0 1025.2 -2.7 1137.0 20.1C1242.2 41.6 1352.2 86.1 1445.0 144.8C1531.7 199.6 1607.8 267.0 1673.6 347.0C1750.1 440.2 1810.5 553.2 1845.5 669.0C1901.2 853.2 1899.2 1052.4 1839.8 1235.0C1784.3 1405.6 1680.1 1557.6 1539.3 1673.4C1433.1 1760.6 1306.1 1824.3 1170.2 1858.4C1128.2 1869.0 1064.7 1879.3 1019.5 1882.9C982.5 1885.9 933.6 1886.7 897.5 1884.9ZM980.0 1785.5C1005.6 1784.4 1015.8 1783.6 1039.0 1780.9C1140.1 1768.9 1234.5 1740.7 1323.4 1695.7C1387.3 1663.4 1445.6 1623.8 1503.0 1573.6C1517.7 1560.8 1560.5 1518.0 1573.6 1503.0C1664.7 1399.0 1726.7 1282.3 1760.0 1152.5C1772.5 1103.8 1782.0 1044.1 1784.5 999.0C1784.9 992.7 1785.3 985.0 1785.6 982.0C1786.1 974.8 1786.1 911.2 1785.6 904.0C1785.3 901.0 1784.9 893.3 1784.5 887.0C1782.6 852.8 1775.9 805.0 1767.5 765.3C1728.3 581.4 1625.0 411.8 1479.4 292.4C1381.4 212.0 1273.0 157.0 1150.5 125.5C1104.4 113.6 1042.3 103.7 999.5 101.5C992.9 101.1 984.8 100.7 981.5 100.5C973.7 100.0 912.3 100.0 904.5 100.5C901.2 100.7 893.1 101.1 886.5 101.5C843.7 103.7 781.6 113.6 735.5 125.5C589.8 163.0 460.4 235.7 353.7 340.0C225.1 465.7 140.3 628.0 111.1 804.5C106.7 831.1 102.8 864.4 101.5 886.0C101.2 891.8 100.7 899.4 100.5 903.0C100.0 911.3 99.9 974.7 100.4 982.0C100.7 985.0 101.1 992.7 101.5 999.0C102.7 1021.0 106.5 1054.2 111.1 1081.5C135.3 1228.0 197.3 1364.0 292.6 1479.6C375.2 1579.8 482.9 1661.8 600.0 1713.5C680.0 1748.8 759.6 1770.6 847.0 1780.9C870.2 1783.6 880.0 1784.4 906.5 1785.6C914.8 1785.9 921.6 1786.3 921.7 1786.4C922.1 1786.7 966.9 1786.1 980.0 1785.5ZM568.8 1524.2C571.0 1521.6 647.9 1416.9 739.7 1291.5C831.5 1166.1 911.9 1056.3 918.3 1047.6C924.7 1038.8 929.7 1031.4 929.4 1031.1C929.1 1030.8 838.3 1030.3 727.6 1030.0L526.4 1029.5L648.5 862.8C715.7 771.1 770.9 695.8 771.2 695.5C772.0 694.6 1069.3 597.0 1069.7 597.4C1069.9 597.6 1019.0 666.8 956.6 751.1L843.1 904.5L1049.0 904.8C1162.3 904.9 1255.0 905.2 1255.0 905.5C1255.0 905.8 1237.3 928.6 1215.7 956.3C1166.2 1019.5 1178.9 1002.5 1018.8 1218.9L882.9 1402.5L1088.9 1402.8C1202.3 1402.9 1295.0 1403.4 1295.0 1403.8C1295.0 1404.3 1244.0 1432.7 1181.7 1466.8L1068.4 1529.0L816.6 1529.0L564.9 1529.0L568.8 1524.2ZM848.3 597.7C848.8 596.0 1122.4 225.2 1122.9 225.6C1123.6 226.2 1145.8 502.5 1145.2 503.1C1144.7 503.6 873.4 591.1 852.2 597.6C848.9 598.6 847.9 598.7 848.3 597.7Z";
const LogoIdealis = ({ size = 30, color }) => (
  <svg viewBox="0 0 1886 1886" width={size} height={size} aria-label="Idealis"
    style={{ display: "block", color: color || C.lime }}>
    <path fill="currentColor" fillRule="evenodd" d={LOGO_D} />
  </svg>
);

const strip = (s) =>
  (s || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const splitVals = (s) =>
  (s || "").toString().split("|").map((x) => x.trim()).filter(Boolean);
const joinVals = (arr) => arr.filter(Boolean).join(" | ");

// Chama o Apps Script com retry automático.
// O Apps Script às vezes devolve uma página HTML (redirect/cota/cold start) em vez
// de JSON — isso estourava "Unexpected token '<'". Aqui detectamos e tentamos de novo.
async function apiCall(payload, { tentativas = 3, metodo = "POST" } = {}) {
  let ultimoErro;
  for (let i = 0; i < tentativas; i++) {
    try {
      const opts = metodo === "GET" ? {} : {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      };
      const r = await fetch(API_URL, opts);
      const txt = await r.text();
      const limpo = txt.trim();
      // resposta HTML = hiccup do Google, não JSON de verdade
      if (limpo.startsWith("<")) throw new Error("resposta_html");
      const j = JSON.parse(limpo);
      return j;
    } catch (e) {
      ultimoErro = e;
      // espera crescente antes da próxima tentativa (0.6s, 1.2s)
      if (i < tentativas - 1) await new Promise((res) => setTimeout(res, 600 * (i + 1)));
    }
  }
  throw ultimoErro;
}

// ordem fixa dos grupos musculares (o que não estiver aqui vai pro fim, alfabético)
const ORDEM_GRUPOS = [
  "Costas", "Peitoral", "Deltóides", "Quadríceps", "Posteriores", "Glúteos",
  "Bíceps", "Tríceps", "Trapézios", "Panturrilha",
  "Antebraço Extensores", "Antebraço Flexores", "Abdômen", "Zona Terapêutica",
  "Lombar", "Aeróbios", "Pliométricos", "Funcional", "Coordenação", "Melhor Idade",
];
const _ordemMap = {};
ORDEM_GRUPOS.forEach((g, i) => { _ordemMap[strip(g)] = i; });
const ordenarGrupos = (arr) =>
  [...arr].sort((a, b) => {
    const ia = _ordemMap[strip(a)], ib = _ordemMap[strip(b)];
    if (ia !== undefined && ib !== undefined) return ia - ib; // ambos na ordem fixa
    if (ia !== undefined) return -1;                          // só a está: a vem antes
    if (ib !== undefined) return 1;                           // só b está: b vem antes
    return a.localeCompare(b, "pt");                          // nenhum: alfabético
  });

function CardapioTab() {
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [lista, setLista] = useState([]);

  const [q, setQ] = useState("");
  const [gruposF, setGruposF] = useState([]);
  const [subgruposF, setSubgruposF] = useState([]);
  const [equipF, setEquipF] = useState([]);
  const [flagsF, setFlagsF] = useState([]);
  const [open, setOpen] = useState(null);

  const [prancheta, setPrancheta] = useState([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [editing, setEditing] = useState(null); // null | {} (novo) | {..} (editar)
  const [gerindo, setGerindo] = useState(false); // tela de gerir tags
  const [gerindoSub, setGerindoSub] = useState(false); // tela de gerir subgrupos curados
  const [subCurados, setSubCurados] = useState([]); // [{id, grupo, subgrupo, ordem}]
  const [erroSub, setErroSub] = useState(""); // erro ao ler subgrupos curados
  const [modoSub, setModoSub] = useState(false); // modo atribuir subgrupos em massa
  const [rascunho, setRascunho] = useState({}); // { [idExercicio]: [subgrupos] }
  const [salvandoLote, setSalvandoLote] = useState(null); // null | {feito, total}

  // ---- carregar da planilha ----
  const carregar = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const j = await apiCall(null, { metodo: "GET" });
      if (!j.ok) throw new Error(j.erro || "Resposta inválida");
      setLista(j.exercicios || []);
    } catch (e) {
      setErro(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const carregarSub = useCallback(async () => {
    setErroSub("");
    try {
      const j = await apiCall({ acao: "sub_ler" });
      if (j.ok) { setSubCurados(j.subgrupos || []); }
      else { setErroSub(j.erro || "resposta inválida"); }
    } catch (e) {
      setErroSub("falha de conexão");
    }
  }, []);

  useEffect(() => { carregar(); carregarSub(); }, [carregar, carregarSub]);

  // ---- vocabulários (derivados da lista viva) ----
  const vocab = useMemo(() => {
    const v = { grupo: new Set(), subgrupo: new Set(), equipamento: new Set(), musculo_alvo: new Set() };
    lista.forEach((x) => MULTI.forEach((f) => splitVals(x[f]).forEach((val) => v[f].add(val))));
    const out = {};
    Object.keys(v).forEach((k) => (out[k] = [...v[k]].sort((a, b) => a.localeCompare(b, "pt"))));
    out.grupo = ordenarGrupos(out.grupo); // ordem fixa dos grupos musculares
    return out;
  }, [lista]);

  // mapa grupo -> subgrupos CURADOS (definidos por você na tela Gerir Subgrupos)
  const subsPorGrupoCurado = useMemo(() => {
    const m = {};
    subCurados.forEach((o) => {
      const g = String(o.grupo || "").trim();
      const s = String(o.subgrupo || "").trim();
      if (!g || !s) return;
      if (!m[g]) m[g] = [];
      if (!m[g].includes(s)) m[g].push(s);
    });
    Object.keys(m).forEach((g) => m[g].sort((a, b) => a.localeCompare(b, "pt")));
    return m;
  }, [subCurados]);

  // subgrupos disponíveis = união dos subgrupos CURADOS dos grupos selecionados
  const subgruposDisponiveis = useMemo(() => {
    if (!gruposF.length) return [];
    const s = new Set();
    gruposF.forEach((g) => (subsPorGrupoCurado[g] || []).forEach((sub) => s.add(sub)));
    return [...s].sort((a, b) => a.localeCompare(b, "pt"));
  }, [gruposF, subsPorGrupoCurado]);

  // ---- busca + filtros ----
  const results = useMemo(() => {
    const terms = strip(q.trim()).split(/\s+/).filter(Boolean);
    return lista.filter((x) => {
      const gs = splitVals(x.grupo);
      const es = splitVals(x.equipamento);
      const sgs = splitVals(x.subgrupo);
      if (gruposF.length && !gruposF.some((g) => gs.includes(g))) return false;
      if (subgruposF.length && !subgruposF.some((s) => sgs.includes(s))) return false;
      if (equipF.length && !equipF.some((e) => es.includes(e))) return false;
      if (flagsF.some((f) => strip(x[f]) !== "x")) return false;
      if (terms.length) {
        const hay = strip(
          [x.exercicio, x.grupo, x.subgrupo, x.equipamento, x.musculo_alvo].join(" ")
        );
        if (!terms.every((t) => hay.includes(t))) return false;
      }
      return true;
    });
  }, [lista, q, gruposF, subgruposF, equipF, flagsF]);

  const toggle = (arr, set, v) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const clearAll = () => { setQ(""); setGruposF([]); setSubgruposF([]); setEquipF([]); setFlagsF([]); };

  // ao (des)marcar um grupo, descarta subgrupos que deixaram de existir nos grupos ativos
  const toggleGrupo = (g) => {
    const novos = gruposF.includes(g) ? gruposF.filter((x) => x !== g) : [...gruposF, g];
    setGruposF(novos);
    if (!novos.length) { setSubgruposF([]); return; }
    const validos = new Set();
    novos.forEach((gr) => (subsPorGrupoCurado[gr] || []).forEach((s) => validos.add(s)));
    setSubgruposF((prev) => prev.filter((s) => validos.has(s)));
  };

  const inPrancheta = (id) => prancheta.some((p) => p.id === id);
  const addPick = (x) =>
    setPrancheta((p) => (inPrancheta(x.id) ? p.filter((y) => y.id !== x.id) : [...p, x]));

  const copiar = () => {
    const txt = prancheta.map((x) => x.exercicio).join("\n");
    const ta = document.createElement("textarea");
    ta.value = txt; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
    setCopied(true); setTimeout(() => setCopied(false), 1600);
  };

  const activeFilters = gruposF.length + subgruposF.length + equipF.length + flagsF.length;

  // grupos cujo NOME casa com o texto digitado (pra sugerir como tag no topo)
  const gruposSugeridos = useMemo(() => {
    const nq = strip(q.trim());
    if (!nq) return [];
    return vocab.grupo.filter((g) => strip(g).includes(nq) && !gruposF.includes(g));
  }, [q, vocab.grupo, gruposF]);

  const aplicarTagGrupo = (g) => {
    setGruposF((prev) => (prev.includes(g) ? prev : [...prev, g]));
    setQ(""); // limpa a busca — passamos a navegar pela categoria
  };

  // ---- modo atribuir em massa (subgrupos OU grupo) ----
  // subgrupos curados do grupo único selecionado (o modo sub exige exatamente 1 grupo)
  const grupoUnico = gruposF.length === 1 ? gruposF[0] : null;
  const subsDoGrupoUnico = grupoUnico ? (subsPorGrupoCurado[grupoUnico] || []) : [];

  // rascunho agora guarda { grupo:[...], subgrupo:[...] } por exercício
  const ligarModoSub = () => {
    const r = {};
    results.forEach((x) => { r[x.id] = { grupo: splitVals(x.grupo), subgrupo: splitVals(x.subgrupo) }; });
    setRascunho(r);
    setModoSub("sub");
    setOpen(null);
  };
  const ligarModoGrupo = () => {
    const r = {};
    results.forEach((x) => { r[x.id] = { grupo: splitVals(x.grupo), subgrupo: splitVals(x.subgrupo) }; });
    setRascunho(r);
    setModoSub("grupo");
    setOpen(null);
  };
  const cancelarModoSub = () => { setModoSub(false); setRascunho({}); };

  // toggle multi (subgrupo)
  const toggleRascunho = (id, sub) => {
    setRascunho((prev) => {
      const atual = (prev[id] && prev[id].subgrupo) || [];
      const novo = atual.includes(sub) ? atual.filter((s) => s !== sub) : [...atual, sub];
      return { ...prev, [id]: { ...prev[id], subgrupo: novo } };
    });
  };
  // toggle de grupo no rascunho (múltipla escolha — exercício pode ter vários grupos)
  const toggleGrupoRascunho = (id, g) => {
    setRascunho((prev) => {
      const atual = (prev[id] && prev[id].grupo) || [];
      const novo = atual.includes(g) ? atual.filter((x) => x !== g) : [...atual, g];
      return { ...prev, [id]: { ...prev[id], grupo: novo } };
    });
  };

  // quais exercícios mudaram (compara grupo+subgrupo do rascunho x original)
  const alterados = useMemo(() => {
    return results.filter((x) => {
      const d = rascunho[x.id] || {};
      const origG = splitVals(x.grupo).slice().sort().join("|");
      const novoG = (d.grupo || []).slice().sort().join("|");
      const origS = splitVals(x.subgrupo).slice().sort().join("|");
      const novoS = (d.subgrupo || []).slice().sort().join("|");
      return origG !== novoG || origS !== novoS;
    });
  }, [results, rascunho]);

  const salvarLote = async () => {
    if (!alterados.length) { cancelarModoSub(); return; }
    setSalvandoLote({ feito: 0, total: alterados.length });
    for (let i = 0; i < alterados.length; i++) {
      const x = alterados[i];
      const d = rascunho[x.id] || {};
      const dados = {
        id: x.id,
        exercicio: x.exercicio,
        grupo: joinVals(d.grupo || splitVals(x.grupo)),
        subgrupo: joinVals(d.subgrupo || splitVals(x.subgrupo)),
        equipamento: x.equipamento,
        musculo_alvo: x.musculo_alvo,
        contexto: x.contexto || "",
        bi_set: x.bi_set || "",
        observacao: x.observacao || "",
      };
      FLAG_FIELDS.forEach((f) => (dados[f.k] = strip(x[f.k]) === "x" ? "X" : ""));
      try {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ acao: "editar", dados }),
        });
      } catch (e) { /* segue; recarrega no fim mostra o que salvou */ }
      setSalvandoLote({ feito: i + 1, total: alterados.length });
    }
    setSalvandoLote(null);
    setModoSub(false);
    setRascunho({});
    await carregar();
  };

  // remove um grupo específico de TODOS os exercícios que ainda o têm (faxina pós-migração)
  const [removendoGrupo, setRemovendoGrupo] = useState(null); // null | {feito,total} | 'confirmar'
  const removerGrupoDeTodos = async (grupoAlvo) => {
    const afetados = lista.filter((x) => splitVals(x.grupo).includes(grupoAlvo));
    if (!afetados.length) { setRemovendoGrupo(null); return; }
    setRemovendoGrupo({ feito: 0, total: afetados.length });
    for (let i = 0; i < afetados.length; i++) {
      const x = afetados[i];
      const novosGrupos = splitVals(x.grupo).filter((g) => g !== grupoAlvo);
      const dados = {
        id: x.id,
        exercicio: x.exercicio,
        grupo: joinVals(novosGrupos),
        subgrupo: x.subgrupo,
        equipamento: x.equipamento,
        musculo_alvo: x.musculo_alvo,
        contexto: x.contexto || "",
        bi_set: x.bi_set || "",
        observacao: x.observacao || "",
      };
      FLAG_FIELDS.forEach((f) => (dados[f.k] = strip(x[f.k]) === "x" ? "X" : ""));
      try {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ acao: "editar", dados }),
        });
      } catch (e) { /* segue */ }
      setRemovendoGrupo({ feito: i + 1, total: afetados.length });
    }
    setRemovendoGrupo(null);
    setGruposF((prev) => prev.filter((g) => g !== grupoAlvo));
    await carregar();
  };

  const chip = (active, onClick, key, children, dim) => (
    <button key={key} onClick={onClick}
      style={{
        background: active ? C.cyan : "transparent",
        color: active ? C.bg : dim ? C.muted : C.text,
        border: `1px solid ${active ? C.cyan : C.line}`,
        borderRadius: 999, padding: "6px 12px", fontSize: 12.5,
        fontWeight: active ? 700 : 500, whiteSpace: "nowrap", cursor: "pointer",
        transition: "all .12s ease",
      }}>
      {children}
    </button>
  );

  return (
    <div style={{ paddingBottom: 96 }}>

      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: `${C.bg}f2`,
        backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.line}`, padding: "14px 14px 10px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
          <h1 style={{ margin: 0, fontSize: 19, fontWeight: 700, letterSpacing: "-0.02em" }}>Cardápio de Exercícios</h1>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700,
            color: results.length ? C.bright : C.muted, lineHeight: 1 }}>
            {String(results.length).padStart(3, "0")}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar exercício, músculo, equipamento…"
            style={{ flex: 1, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10,
              color: C.text, padding: "11px 13px", fontSize: 15, fontFamily: "inherit", outline: "none" }}
            onFocus={(e) => (e.target.style.borderColor = C.cyan)}
            onBlur={(e) => (e.target.style.borderColor = C.line)} />
          <button onClick={() => setEditing({})} title="Novo exercício"
            style={{ flex: "0 0 46px", background: C.cyan, border: "none", borderRadius: 10, color: C.bg,
              fontSize: 24, fontWeight: 700, cursor: "pointer", lineHeight: 1 }}>+</button>
          <button onClick={() => setGerindo(true)} title="Gerir tags"
            style={{ flex: "0 0 46px", background: "transparent", border: `1px solid ${C.line}`, borderRadius: 10,
              color: C.muted, fontSize: 19, cursor: "pointer", lineHeight: 1 }}>⚙</button>
          <button onClick={() => setGerindoSub(true)} title="Gerir subgrupos"
            style={{ flex: "0 0 46px", background: "transparent", border: `1px solid ${C.line}`, borderRadius: 10,
              color: C.muted, fontSize: 17, cursor: "pointer", lineHeight: 1 }}>🗂️</button>
        </div>

        <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "10px 0 0", marginRight: -14 }}>
          {vocab.grupo.map((g) => chip(gruposF.includes(g), () => toggleGrupo(g), "g" + g, g))}
          {activeFilters > 0 && chip(false, clearAll, "clr", "✕ limpar", true)}
        </div>
        {subgruposDisponiveis.length > 0 && (
          <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "8px 0 2px", marginRight: -14,
            marginLeft: 12, borderLeft: `2px solid ${C.cyan}`, paddingLeft: 10 }}>
            {subgruposDisponiveis.map((s) =>
              chip(subgruposF.includes(s), () => toggle(subgruposF, setSubgruposF, s), "sg" + s, s))}
          </div>
        )}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "6px 0 0", marginRight: -14 }}>
          {vocab.equipamento.map((e) => chip(equipF.includes(e), () => toggle(equipF, setEquipF, e), "e" + e, e, true))}
        </div>

        {/* Aviso se a leitura dos subgrupos falhou (dados não foram perdidos) */}
        {erroSub && (
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8,
            background: `${C.danger}12`, border: `1px solid ${C.danger}44`, borderRadius: 10, padding: "8px 11px" }}>
            <span style={{ flex: 1, fontSize: 11.5, color: C.text, lineHeight: 1.4 }}>
              ⚠️ Subgrupos não carregaram ({erroSub}). Seus dados estão salvos na planilha.
            </span>
            <button onClick={carregarSub}
              style={{ background: "none", border: `1px solid ${C.danger}66`, color: C.danger, borderRadius: 8,
                padding: "5px 11px", fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Tentar de novo
            </button>
          </div>
        )}

        {/* Botões para ligar os modos em massa (1 grupo selecionado e fora do modo) */}
        {!modoSub && grupoUnico && (
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            {subsDoGrupoUnico.length > 0 && (
              <button onClick={ligarModoSub}
                style={{ flex: 1, background: "transparent", border: `1px solid ${C.cyan}`,
                  color: C.cyan, borderRadius: 10, padding: "9px", fontSize: 12.5, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit" }}>
                🏷️ Subgrupos em massa
              </button>
            )}
            <button onClick={ligarModoGrupo}
              style={{ flex: 1, background: "transparent", border: `1px solid ${C.muted}`,
                color: C.muted, borderRadius: 10, padding: "9px", fontSize: 12.5, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit" }}>
              🔀 Migrar grupo em massa
            </button>
          </div>
        )}

        {/* Remover este grupo de todos os exercícios (faxina pós-migração) */}
        {!modoSub && grupoUnico && (
          <div style={{ marginTop: 8 }}>
            {removendoGrupo && removendoGrupo.total ? (
              <div style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: "8px" }}>
                Removendo "{grupoUnico}"… {removendoGrupo.feito}/{removendoGrupo.total}
              </div>
            ) : removendoGrupo === "confirmar" ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center", background: `${C.danger}12`,
                border: `1px solid ${C.danger}44`, borderRadius: 10, padding: "9px 11px" }}>
                <span style={{ flex: 1, fontSize: 12, color: C.text, lineHeight: 1.4 }}>
                  Remover "{grupoUnico}" de {lista.filter((x) => splitVals(x.grupo).includes(grupoUnico)).length} exercício(s)? Os outros grupos deles ficam intactos.
                </span>
                <button onClick={() => setRemovendoGrupo(null)}
                  style={{ background: "none", border: `1px solid ${C.line}`, color: C.text, borderRadius: 8,
                    padding: "6px 11px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Não</button>
                <button onClick={() => removerGrupoDeTodos(grupoUnico)}
                  style={{ background: C.danger, border: "none", color: "#fff", borderRadius: 8,
                    padding: "6px 13px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Remover</button>
              </div>
            ) : (
              <button onClick={() => setRemovendoGrupo("confirmar")}
                style={{ width: "100%", background: "transparent", border: `1px solid ${C.danger}66`,
                  color: C.danger, borderRadius: 10, padding: "8px", fontSize: 12, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit" }}>
                🗑 Remover grupo "{grupoUnico}" de todos os exercícios
              </button>
            )}
          </div>
        )}
      </div>

      {/* Barra do modo em massa (sticky logo abaixo do header) */}
      {modoSub && (
        <div style={{ position: "sticky", top: 0, zIndex: 15, background: C.cyan, color: C.bg,
          padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.3 }}>
            {salvandoLote
              ? `Salvando ${salvandoLote.feito}/${salvandoLote.total}…`
              : `${modoSub === "grupo" ? "Migrar grupo" : "Atribuir subgrupos"} · ${grupoUnico} · ${alterados.length} alterado(s)`}
          </div>

          {!salvandoLote && (
            <div style={{ display: "flex", gap: 8, flex: "0 0 auto" }}>
              <button onClick={cancelarModoSub}
                style={{ background: "transparent", border: `1px solid ${C.bg}55`, color: C.bg,
                  borderRadius: 8, padding: "6px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Cancelar
              </button>
              <button onClick={salvarLote} disabled={!alterados.length}
                style={{ background: C.bg, border: "none", color: C.cyan, borderRadius: 8,
                  padding: "6px 14px", fontSize: 12.5, fontWeight: 700,
                  cursor: alterados.length ? "pointer" : "default", opacity: alterados.length ? 1 : 0.5, fontFamily: "inherit" }}>
                Salvar {alterados.length || ""}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Estados */}
      {loading && (
        <div style={{ padding: "60px 24px", textAlign: "center", color: C.muted }}>
          <div style={{ width: 26, height: 26, border: `3px solid ${C.line}`, borderTopColor: C.cyan,
            borderRadius: "50%", margin: "0 auto 14px", animation: "spin .8s linear infinite" }} />
          Carregando da planilha…
        </div>
      )}
      {erro && !loading && (
        <div style={{ padding: "40px 24px", textAlign: "center" }}>
          <div style={{ color: C.danger, marginBottom: 10 }}>Não consegui carregar da planilha.</div>
          <div style={{ color: C.muted, fontSize: 12, marginBottom: 16, wordBreak: "break-word" }}>{erro}</div>
          <button onClick={carregar} style={{ background: C.cyan, border: "none", color: C.bg,
            borderRadius: 8, padding: "9px 16px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            Tentar de novo
          </button>
        </div>
      )}

      {/* Tags de grupo sugeridas pela busca (clique = filtra a categoria) */}
      {!loading && !erro && !modoSub && gruposSugeridos.length > 0 && (
        <div style={{ padding: "12px 14px 6px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.16em", color: C.muted, textTransform: "uppercase", marginBottom: 8 }}>
            Ir para a categoria
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {gruposSugeridos.map((g) => (
              <button key={g} onClick={() => aplicarTagGrupo(g)}
                style={{ background: C.cyan, color: C.bg, border: "none", borderRadius: 999,
                  padding: "8px 16px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontSize: 11 }}>▸</span> {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lista */}
      {!loading && !erro && results.length === 0 && gruposSugeridos.length === 0 && (
        <div style={{ padding: "60px 24px", textAlign: "center", color: C.muted }}>
          <div style={{ fontSize: 15, marginBottom: 8, color: C.text }}>Nenhum exercício com esses filtros.</div>
          <button onClick={clearAll} style={{ background: "none", border: `1px solid ${C.line}`, color: C.cyan,
            borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontFamily: "inherit" }}>Limpar filtros</button>
        </div>
      )}

      {!loading && !erro && results.map((x) => {
        const picked = inPrancheta(x.id);
        const isOpen = open === x.id;
        const gs = splitVals(x.grupo), es = splitVals(x.equipamento);
        const temVideo = strip(x.video_proprio) === "x";
        return (
          <div key={x.id} style={{ borderBottom: `1px solid ${C.line}` }}>
            <div className="row" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px" }}>
              <button onClick={() => addPick(x)} aria-label="prancheta"
                style={{ flex: "0 0 22px", height: 22, borderRadius: 6,
                  border: `1.5px solid ${picked ? C.cyan : C.line}`, background: picked ? C.cyan : "transparent",
                  color: C.bg, fontSize: 13, fontWeight: 700, lineHeight: "19px", cursor: "pointer", padding: 0 }}>
                {picked ? "✓" : ""}
              </button>
              <div style={{ flex: 1, minWidth: 0 }} onClick={() => { if (!modoSub) setOpen(isOpen ? null : x.id); }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  {temVideo && <span title="Vídeo próprio" style={{ width: 6, height: 6, borderRadius: 9, background: C.bright, flex: "0 0 6px" }} />}
                  <span style={{ fontSize: 14.5, fontWeight: 500, lineHeight: 1.25 }}>{x.exercicio}</span>
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                  {gs.join(" · ")}
                  {splitVals(x.subgrupo).length ? "  ›  " + splitVals(x.subgrupo).join(" · ") : ""}
                  {es.length ? "  —  " + es.join(", ") : ""}
                  {strip(x.em_casa) === "x" ? "  ·  🏠" : ""}
                </div>
              </div>
              <button onClick={() => setEditing(x)} title="Editar"
                style={{ flex: "0 0 auto", background: "none", border: "none", color: C.muted,
                  fontSize: 15, cursor: "pointer", padding: 4 }}>✎</button>
            </div>
            {modoSub === "sub" && (
              <div style={{ padding: "0 14px 12px 46px", display: "flex", flexWrap: "wrap", gap: 6 }}>
                {subsDoGrupoUnico.map((s) => {
                  const on = ((rascunho[x.id] && rascunho[x.id].subgrupo) || []).includes(s);
                  return (
                    <button key={s} onClick={() => toggleRascunho(x.id, s)}
                      style={{ background: on ? C.cyan : "transparent", color: on ? C.bg : C.text,
                        border: `1px solid ${on ? C.cyan : C.line}`, borderRadius: 999, padding: "5px 12px",
                        fontSize: 12.5, fontWeight: on ? 700 : 500, cursor: "pointer", fontFamily: "inherit" }}>
                      {s}
                    </button>
                  );
                })}
              </div>
            )}
            {modoSub === "grupo" && (
              <div style={{ padding: "0 14px 12px 46px", display: "flex", flexWrap: "wrap", gap: 6 }}>
                {ORDEM_GRUPOS.map((g) => {
                  const on = ((rascunho[x.id] && rascunho[x.id].grupo) || []).includes(g);
                  return (
                    <button key={g} onClick={() => toggleGrupoRascunho(x.id, g)}
                      style={{ background: on ? C.cyan : "transparent", color: on ? C.bg : C.text,
                        border: `1px solid ${on ? C.cyan : C.line}`, borderRadius: 999, padding: "5px 12px",
                        fontSize: 12.5, fontWeight: on ? 700 : 500, cursor: "pointer", fontFamily: "inherit" }}>
                      {g}
                    </button>
                  );
                })}
              </div>
            )}
            {isOpen && (
              <div style={{ background: C.surface, padding: "12px 14px 14px 46px", fontSize: 12.5, color: C.muted, lineHeight: 1.65 }}>
                {splitVals(x.subgrupo).length > 0 && <div><span style={{ color: C.cyan }}>Categoria</span> · {splitVals(x.subgrupo).join(" | ")}</div>}
                {splitVals(x.musculo_alvo).length > 0 && <div><span style={{ color: C.cyan }}>Alvo terapêutico</span> · {splitVals(x.musculo_alvo).join(" | ")}</div>}
                {x.bi_set && <div><span style={{ color: C.cyan }}>Bi-set</span> · {x.bi_set}</div>}
                {x.observacao && <div><span style={{ color: C.cyan }}>Obs</span> · {x.observacao}</div>}
                <div style={{ marginTop: 4 }}>
                  {strip(x.isometrico) === "x" ? "Isométrico · " : ""}
                  {strip(x.unilateral) === "x" ? "Unilateral · " : ""}
                  {strip(x.a_filmar) === "x" ? "A filmar" : ""}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Prancheta */}
      {prancheta.length > 0 && (
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 30, background: C.surface,
          borderTop: `1px solid ${C.cyan}`, boxShadow: "0 -18px 40px rgba(0,0,0,.6)" }}>
          {sheetOpen && (
            <div style={{ maxHeight: 240, overflowY: "auto", borderBottom: `1px solid ${C.line}` }}>
              {prancheta.map((x, k) => (
                <div key={x.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderBottom: `1px solid ${C.bg}` }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.muted, width: 18 }}>{String(k + 1).padStart(2, "0")}</span>
                  <span style={{ flex: 1, fontSize: 13.5 }}>{x.exercicio}</span>
                  <button onClick={() => addPick(x)} style={{ background: "none", border: "none", color: C.muted, fontSize: 16, cursor: "pointer" }}>×</button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px" }}>
            <button onClick={() => setSheetOpen(!sheetOpen)} style={{ flex: 1, textAlign: "left", background: "none", border: "none", color: C.text, cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
              <div style={{ fontSize: 9.5, letterSpacing: "0.2em", color: C.cyan, fontWeight: 700 }}>PRANCHETA</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{prancheta.length} exercício{prancheta.length > 1 ? "s" : ""} {sheetOpen ? "▾" : "▴"}</div>
            </button>
            <button onClick={() => setPrancheta([])} style={{ background: "none", border: `1px solid ${C.line}`, color: C.muted, borderRadius: 8, padding: "9px 12px", fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>Limpar</button>
            <button onClick={copiar} style={{ background: C.cyan, border: "none", color: C.bg, borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{copied ? "Copiado ✓" : "Copiar lista"}</button>
          </div>
        </div>
      )}

      {/* Modal criar/editar */}
      {editing !== null && (
        <EditorModal
          registro={editing}
          vocab={vocab}
          subsPorGrupoCurado={subsPorGrupoCurado}
          erroSub={erroSub}
          onClose={() => setEditing(null)}
          onSaved={async () => { setEditing(null); await carregar(); }}
        />
      )}

      {/* Tela de gerir tags */}
      {gerindo && (
        <GerirTags
          lista={lista}
          vocab={vocab}
          onClose={() => setGerindo(false)}
          onChanged={carregar}
        />
      )}

      {gerindoSub && (
        <GerirSubgrupos
          grupos={vocab.grupo}
          subCurados={subCurados}
          onClose={() => setGerindoSub(false)}
          onChanged={carregarSub}
        />
      )}
    </div>
  );
}

// =====================================================================
//  Tela: Gerir tags (renomear / excluir em massa)
// =====================================================================
function GerirTags({ lista, vocab, onClose, onChanged }) {
  const CAMPOS = [
    { k: "grupo", label: "Grupos" },
    { k: "equipamento", label: "Equipamentos" },
    { k: "subgrupo", label: "Categorias" },
    { k: "musculo_alvo", label: "Alvos terapêuticos" },
  ];
  const [campo, setCampo] = useState("grupo");
  const [busca, setBusca] = useState("");
  const [msg, setMsg] = useState("");
  const [trabalhando, setTrabalhando] = useState(false);

  // conta uso de cada tag localmente (rápido, sem chamar backend)
  const contagem = useMemo(() => {
    const m = {};
    lista.forEach((x) => splitVals(x[campo]).forEach((v) => (m[v] = (m[v] || 0) + 1)));
    return m;
  }, [lista, campo]);

  const tags = useMemo(() => {
    const nb = strip(busca);
    return (vocab[campo] || [])
      .filter((t) => !nb || strip(t).includes(nb))
      .sort((a, b) => (contagem[b] || 0) - (contagem[a] || 0) || a.localeCompare(b, "pt"));
  }, [vocab, campo, busca, contagem]);

  const chamar = async (payload) => {
    setTrabalhando(true); setMsg("");
    try {
      const r = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.erro || "falhou");
      await onChanged();
      return j;
    } catch (e) {
      setMsg("Erro: " + e);
      return null;
    } finally {
      setTrabalhando(false);
    }
  };

  const renomear = async (tag) => {
    const novo = (prompt(`Renomear "${tag}" para:`, tag) || "").trim();
    if (!novo || novo === tag) return;
    const j = await chamar({ acao: "tag_renomear", campo, de: tag, para: novo });
    if (j) setMsg(`"${tag}" → "${novo}" em ${j.mexidos} exercício(s). ✓`);
  };

  const excluir = async (tag) => {
    const n = contagem[tag] || 0;
    const ok = confirm(
      `Excluir a tag "${tag}"?\n\nEla será removida de ${n} exercício(s). Os exercícios continuam existindo, só perdem essa tag.\n\n(Um backup automático é criado antes.)`
    );
    if (!ok) return;
    const j = await chamar({ acao: "tag_excluir", campo, de: tag });
    if (j) setMsg(`"${tag}" removida de ${j.mexidos} exercício(s). ✓`);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, background: C.bg, overflowY: "auto" }}>
      <div style={{ position: "sticky", top: 0, background: `${C.bg}f5`, backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${C.line}`, padding: "16px 16px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 9.5, letterSpacing: "0.22em", color: C.cyan, fontWeight: 700 }}>GERIR</div>
            <h2 style={{ margin: "2px 0 0", fontSize: 19, fontWeight: 700 }}>Tags</h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: `1px solid ${C.line}`, color: C.text,
            borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>
            ✓ Concluir
          </button>
        </div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", marginRight: -16, paddingBottom: 2 }}>
          {CAMPOS.map((c) => (
            <button key={c.k} onClick={() => { setCampo(c.k); setMsg(""); }}
              style={{ background: campo === c.k ? C.cyan : "transparent", color: campo === c.k ? C.bg : C.text,
                border: `1px solid ${campo === c.k ? C.cyan : C.line}`, borderRadius: 999, padding: "7px 14px",
                fontSize: 13, fontWeight: campo === c.k ? 700 : 500, whiteSpace: "nowrap", cursor: "pointer" }}>
              {c.label}
            </button>
          ))}
        </div>
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Filtrar tags…"
          style={{ width: "100%", marginTop: 10, background: C.surface, border: `1px solid ${C.line}`,
            borderRadius: 9, color: C.text, padding: "9px 12px", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
      </div>

      {msg && (
        <div style={{ padding: "10px 16px", background: C.surface2, color: C.bright, fontSize: 13,
          borderBottom: `1px solid ${C.line}` }}>{msg}</div>
      )}
      {trabalhando && (
        <div style={{ padding: "10px 16px", color: C.muted, fontSize: 13 }}>Trabalhando… (criando backup + aplicando)</div>
      )}

      <div>
        {tags.map((tag) => (
          <div key={tag} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
            borderBottom: `1px solid ${C.line}` }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5 }}>{tag}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{contagem[tag] || 0} exercício(s)</div>
            </div>
            <button onClick={() => renomear(tag)} disabled={trabalhando}
              style={{ background: "none", border: `1px solid ${C.line}`, color: C.text, borderRadius: 7,
                padding: "6px 12px", fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>Renomear</button>
            <button onClick={() => excluir(tag)} disabled={trabalhando}
              style={{ background: "none", border: `1px solid ${C.danger}44`, color: C.danger, borderRadius: 7,
                padding: "6px 12px", fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>Excluir</button>
          </div>
        ))}
        {tags.length === 0 && (
          <div style={{ padding: "40px 24px", textAlign: "center", color: C.muted }}>Nenhuma tag encontrada.</div>
        )}
        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}

// =====================================================================
//  Tela: Gerir Subgrupos (lista curada de subgrupos por grupo)
// =====================================================================
function GerirSubgrupos({ grupos, subCurados, onClose, onChanged }) {
  const [grupoSel, setGrupoSel] = useState(grupos[0] || "");
  const [novo, setNovo] = useState("");
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState("");

  const chamar = async (payload) => {
    return apiCall(payload);
  };

  // subgrupos curados do grupo selecionado
  const doGrupo = subCurados
    .filter((o) => String(o.grupo).trim() === String(grupoSel).trim())
    .sort((a, b) => String(a.subgrupo).localeCompare(String(b.subgrupo), "pt"));

  const adicionar = async () => {
    const val = novo.trim();
    if (!val) return;
    setBusy(true); setErro("");
    try {
      const j = await chamar({ acao: "sub_criar", dados: { grupo: grupoSel, subgrupo: val } });
      if (!j.ok) { setErro(j.erro || "Erro ao criar"); setBusy(false); return; }
      setNovo("");
      await onChanged();
    } catch (e) { setErro(String(e)); }
    setBusy(false);
  };

  const excluir = async (id) => {
    setBusy(true); setErro("");
    try {
      const j = await chamar({ acao: "sub_excluir", dados: { id } });
      if (!j.ok) { setErro(j.erro || "Erro ao excluir"); setBusy(false); return; }
      await onChanged();
    } catch (e) { setErro(String(e)); }
    setBusy(false);
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,.7)",
      display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.bg, width: "100%", maxWidth: 640,
        maxHeight: "92vh", overflowY: "auto", borderTopLeftRadius: 18, borderTopRightRadius: 18,
        border: `1px solid ${C.line}`, padding: "18px 16px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Gerir subgrupos</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: 24, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        <p style={{ fontSize: 12, color: C.muted, marginTop: 0, marginBottom: 16, lineHeight: 1.5 }}>
          Defina os subgrupos de cada grupo. Só os que você criar aqui aparecem no filtro do Cardápio.
        </p>

        {/* Escolher grupo */}
        <label style={{ fontSize: 11, letterSpacing: "0.14em", color: C.cyan, fontWeight: 700, textTransform: "uppercase", marginBottom: 7, display: "block" }}>Grupo</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
          {grupos.map((g) => {
            const on = grupoSel === g;
            return (
              <button key={g} onClick={() => setGrupoSel(g)}
                style={{ background: on ? C.cyan : "transparent", color: on ? C.bg : C.text,
                  border: `1px solid ${on ? C.cyan : C.line}`, borderRadius: 999, padding: "6px 12px",
                  fontSize: 12.5, fontWeight: on ? 700 : 500, cursor: "pointer", fontFamily: "inherit" }}>
                {g}
              </button>
            );
          })}
        </div>

        {/* Adicionar novo subgrupo */}
        <label style={{ fontSize: 11, letterSpacing: "0.14em", color: C.cyan, fontWeight: 700, textTransform: "uppercase", marginBottom: 7, display: "block" }}>
          Subgrupos de {grupoSel || "—"}
        </label>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input value={novo} onChange={(e) => setNovo(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") adicionar(); }}
            placeholder="Ex.: Retos, Oblíquos, Isométricos…"
            style={{ flex: 1, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10,
              color: C.text, padding: "11px 13px", fontSize: 15, fontFamily: "inherit", outline: "none" }}
            onFocus={(e) => (e.target.style.borderColor = C.cyan)}
            onBlur={(e) => (e.target.style.borderColor = C.line)} />
          <button onClick={adicionar} disabled={busy || !novo.trim()}
            style={{ flex: "0 0 auto", background: busy ? C.line : C.cyan, border: "none", borderRadius: 10,
              color: C.bg, fontSize: 14, fontWeight: 700, padding: "0 16px", cursor: "pointer", fontFamily: "inherit" }}>
            + add
          </button>
        </div>

        {erro && <div style={{ color: C.danger, fontSize: 13, marginBottom: 12 }}>{erro}</div>}

        {/* Lista dos subgrupos curados do grupo */}
        {doGrupo.length === 0 ? (
          <div style={{ fontSize: 13, color: C.muted, fontStyle: "italic", padding: "6px 0" }}>
            Nenhum subgrupo definido para {grupoSel || "este grupo"} ainda.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {doGrupo.map((o) => (
              <div key={o.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 12px" }}>
                <span style={{ fontSize: 14 }}>{o.subgrupo}</span>
                <button onClick={() => excluir(o.id)} disabled={busy} title="Excluir"
                  style={{ background: "none", border: "none", color: C.danger, fontSize: 15,
                    cursor: "pointer", padding: 2 }}>🗑</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================================
//  Modal de criar / editar
// =====================================================================
function EditorModal({ registro, vocab, subsPorGrupoCurado = {}, erroSub = "", onClose, onSaved }) {
  const isEdit = !!registro.id;
  const [nome, setNome] = useState(registro.exercicio || "");
  const [sel, setSel] = useState({
    grupo: splitVals(registro.grupo),
    subgrupo: splitVals(registro.subgrupo),
    equipamento: splitVals(registro.equipamento),
    musculo_alvo: splitVals(registro.musculo_alvo),
  });
  const [flags, setFlags] = useState(() => {
    const o = {};
    FLAG_FIELDS.forEach((f) => (o[f.k] = strip(registro[f.k]) === "x"));
    return o;
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const toggleSel = (field, val) =>
    setSel((s) => ({
      ...s,
      [field]: s[field].includes(val) ? s[field].filter((v) => v !== val) : [...s[field], val],
    }));

  const addNova = (field) => {
    const val = (prompt("Nova tag para " + LABELS[field] + ":") || "").trim();
    if (val && !sel[field].includes(val)) toggleSel(field, val);
  };

  const salvar = async () => {
    if (!nome.trim()) { setErro("Dá um nome pro exercício 🙂"); return; }
    if (sel.grupo.length === 0) { setErro("Escolhe pelo menos um grupo."); return; }
    setSalvando(true); setErro("");
    const dados = {
      exercicio: nome.trim(),
      grupo: joinVals(sel.grupo),
      subgrupo: joinVals(sel.subgrupo),
      equipamento: joinVals(sel.equipamento),
      musculo_alvo: joinVals(sel.musculo_alvo),
      contexto: registro.contexto || "",
      bi_set: registro.bi_set || "",
      observacao: registro.observacao || "",
    };
    FLAG_FIELDS.forEach((f) => (dados[f.k] = flags[f.k] ? "X" : ""));
    if (isEdit) dados.id = registro.id;
    try {
      // Apps Script Web App exige POST simples; usamos text/plain p/ evitar preflight CORS
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ acao: isEdit ? "editar" : "criar", dados }),
      });
      await onSaved();
    } catch (e) {
      setErro("Erro ao salvar: " + e);
      setSalvando(false);
    }
  };

  const LABELS = { grupo: "Grupo", subgrupo: "Categoria", equipamento: "Equipamento", musculo_alvo: "Alvo terapêutico" };

  // subgrupos curados dos grupos atualmente marcados no exercício
  const subgruposCuradosDoExercicio = useMemo(() => {
    const s = new Set();
    sel.grupo.forEach((g) => (subsPorGrupoCurado[g] || []).forEach((sub) => s.add(sub)));
    return [...s].sort((a, b) => a.localeCompare(b, "pt"));
  }, [sel.grupo, subsPorGrupoCurado]);

  // subgrupos que o exercício tem marcados mas que NÃO estão na lista curada (órfãos)
  const subgruposOrfaos = sel.subgrupo.filter((s) => !subgruposCuradosDoExercicio.includes(s));

  // seção genérica (grupo, equipamento, alvo) — lista plana do vocab
  const secao = (field) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
        <span style={{ fontSize: 11, letterSpacing: "0.14em", color: C.cyan, fontWeight: 700, textTransform: "uppercase" }}>{LABELS[field]}</span>
        <button onClick={() => addNova(field)} style={{ background: "none", border: `1px solid ${C.line}`, color: C.muted, borderRadius: 7, padding: "3px 9px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>+ nova</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {[...new Set([...vocab[field], ...sel[field]])].sort((a, b) => a.localeCompare(b, "pt")).map((val) => {
          const on = sel[field].includes(val);
          return (
            <button key={val} onClick={() => toggleSel(field, val)}
              style={{ background: on ? C.cyan : "transparent", color: on ? C.bg : C.text,
                border: `1px solid ${on ? C.cyan : C.line}`, borderRadius: 999, padding: "5px 11px",
                fontSize: 12, fontWeight: on ? 700 : 500, cursor: "pointer", fontFamily: "inherit" }}>
              {val}
            </button>
          );
        })}
      </div>
    </div>
  );

  // seção especial de Categoria/subgrupo — só os curados dos grupos do exercício
  const secaoSubgrupo = () => (
    <div style={{ marginBottom: 16 }}>
      <span style={{ fontSize: 11, letterSpacing: "0.14em", color: C.cyan, fontWeight: 700, textTransform: "uppercase" }}>Categoria</span>
      {sel.grupo.length === 0 ? (
        <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic", marginTop: 7 }}>
          Escolha um grupo primeiro pra ver os subgrupos dele.
        </div>
      ) : subgruposCuradosDoExercicio.length === 0 ? (
        <div style={{ fontSize: 12, color: erroSub ? C.danger : C.muted, fontStyle: "italic", marginTop: 7 }}>
          {erroSub
            ? `⚠️ Não consegui carregar os subgrupos (${erroSub}). Seus dados estão salvos — feche e reabra o app.`
            : `Nenhum subgrupo definido para ${sel.grupo.join(", ")}. Crie em 🗂️ Gerir subgrupos.`}
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 7 }}>
          {subgruposCuradosDoExercicio.map((val) => {
            const on = sel.subgrupo.includes(val);
            return (
              <button key={val} onClick={() => toggleSel("subgrupo", val)}
                style={{ background: on ? C.cyan : "transparent", color: on ? C.bg : C.text,
                  border: `1px solid ${on ? C.cyan : C.line}`, borderRadius: 999, padding: "5px 11px",
                  fontSize: 12, fontWeight: on ? 700 : 500, cursor: "pointer", fontFamily: "inherit" }}>
                {val}
              </button>
            );
          })}
        </div>
      )}

      {/* órfãos: subgrupos antigos que o exercício tem mas não estão na lista curada */}
      {subgruposOrfaos.length > 0 && (
        <div style={{ marginTop: 10, padding: "8px 10px", background: `${C.danger}12`,
          border: `1px solid ${C.danger}44`, borderRadius: 8 }}>
          <div style={{ fontSize: 10.5, color: C.danger, fontWeight: 700, marginBottom: 6 }}>
            Fora da lista curada (clique pra remover deste exercício):
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {subgruposOrfaos.map((val) => (
              <button key={val} onClick={() => toggleSel("subgrupo", val)}
                style={{ background: "transparent", color: C.text, border: `1px solid ${C.danger}66`,
                  borderRadius: 999, padding: "5px 11px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                {val} ✕
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,.7)",
      display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.bg, width: "100%", maxWidth: 640,
        maxHeight: "92vh", overflowY: "auto", borderTopLeftRadius: 18, borderTopRightRadius: 18,
        border: `1px solid ${C.line}`, padding: "18px 16px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{isEdit ? "Editar exercício" : "Novo exercício"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: 24, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do exercício"
          style={{ width: "100%", background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10,
            color: C.text, padding: "12px 13px", fontSize: 16, fontFamily: "inherit", outline: "none", marginBottom: 18 }}
          onFocus={(e) => (e.target.style.borderColor = C.cyan)}
          onBlur={(e) => (e.target.style.borderColor = C.line)} />

        {secao("grupo")}
        {secaoSubgrupo()}
        {secao("equipamento")}
        {secao("musculo_alvo")}

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.14em", color: C.cyan, fontWeight: 700, textTransform: "uppercase", marginBottom: 7 }}>Atributos</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {FLAG_FIELDS.map((f) => {
              const on = flags[f.k];
              return (
                <button key={f.k} onClick={() => setFlags((s) => ({ ...s, [f.k]: !s[f.k] }))}
                  style={{ background: on ? C.cyan : "transparent", color: on ? C.bg : C.text,
                    border: `1px solid ${on ? C.cyan : C.line}`, borderRadius: 999, padding: "6px 12px",
                    fontSize: 12.5, fontWeight: on ? 700 : 500, cursor: "pointer", fontFamily: "inherit" }}>
                  {on ? "✓ " : ""}{f.label}
                </button>
              );
            })}
          </div>
        </div>

        {erro && <div style={{ color: C.danger, fontSize: 13, marginBottom: 12 }}>{erro}</div>}

        <button onClick={salvar} disabled={salvando}
          style={{ width: "100%", background: salvando ? C.line : C.cyan, border: "none", color: C.bg,
            borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 700,
            cursor: salvando ? "default" : "pointer", fontFamily: "inherit" }}>
          {salvando ? "Salvando…" : isEdit ? "Salvar alterações" : "Criar exercício"}
        </button>
      </div>
    </div>
  );
}

// =====================================================================
//  Tela: Protocolos Clínicos
// =====================================================================
function ProtocolosTab() {
  const [q, setQ] = useState("");
  const [aberto, setAberto] = useState(null);
  const [catFiltro, setCatFiltro] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [blocos, setBlocos] = useState([]);
  const [editandoBloco, setEditandoBloco] = useState(null); // null | {} (novo) | {..} (editar)

  const carregar = useCallback(async () => {
    setLoading(true); setErro("");
    try {
      const j = await apiCall({ acao: "prot_ler" });
      if (!j.ok) throw new Error(j.erro || "falhou");
      setBlocos(j.blocos || []);
    } catch (e) {
      setErro(String(e).includes("resposta_html")
        ? "O Google demorou a responder (aconteceu 3x seguidas)."
        : String(e));
    }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  const CAT_ORDER = ["testes", "instrucoes", "tratamento", "exercicios"];
  const CAT_LABEL = { testes: "Testes Avaliativos", instrucoes: "Instruções e Princípios",
    tratamento: "Tratamento Recomendado", exercicios: "Exercícios Específicos" };

  // monta a árvore protocolo -> categoria -> subcategoria a partir das linhas planas
  const PROTOCOLOS = useMemo(() => {
    const map = new Map();
    blocos.forEach((b) => {
      const prot = b.protocolo || "(sem título)";
      if (!map.has(prot)) map.set(prot, new Map());
      const cats = map.get(prot);
      const cat = b.categoria || "exercicios";
      if (!cats.has(cat)) cats.set(cat, new Map());
      const subs = cats.get(cat);
      const sub = b.subcategoria || "";
      if (!subs.has(sub)) subs.set(sub, []);
      subs.get(sub).push({
        id: b.id, protocolo: prot, categoria: cat, subcategoria: sub, ordem: b.ordem,
        t: b.conteudo, d: b.detalhe, s: b.severidade, f: b.fase, img: b.url_imagem, leg: b.legenda,
      });
    });
    const out = [];
    let id = 0;
    map.forEach((cats, prot) => {
      id++;
      const catsArr = [];
      let faltando = 0;
      CAT_ORDER.forEach((c) => {
        const subs = [];
        if (cats.has(c)) {
          cats.get(c).forEach((itens, sub) => subs.push({ sub, itens }));
        }
        const vazia = subs.every((s) => s.itens.length === 0);
        if (vazia) faltando++;
        catsArr.push({ cat: c, label: CAT_LABEL[c], subs, vazia });
      });
      out.push({ id, titulo: prot, cats: catsArr, faltando });
    });
    return out;
  }, [blocos]);

  const CATS = [
    { k: "testes", label: "Testes", icon: "🔬" },
    { k: "instrucoes", label: "Instruções", icon: "📌" },
    { k: "tratamento", label: "Tratamento", icon: "🩺" },
    { k: "exercicios", label: "Exercícios", icon: "🏋️" },
  ];

  // vocabulários para o modal sugerir (derivados dos blocos vivos)
  const protVocab = useMemo(() => {
    const protos = new Set();
    const subsPorCat = { testes: new Set(), instrucoes: new Set(), tratamento: new Set(), exercicios: new Set() };
    blocos.forEach((b) => {
      if (b.protocolo) protos.add(b.protocolo);
      const cat = b.categoria || "exercicios";
      if (subsPorCat[cat] && b.subcategoria) subsPorCat[cat].add(b.subcategoria);
    });
    const sortPt = (arr) => [...arr].sort((a, b) => a.localeCompare(b, "pt"));
    const subsOut = {};
    Object.keys(subsPorCat).forEach((k) => (subsOut[k] = sortPt(subsPorCat[k])));
    return { protocolos: sortPt(protos), subsPorCat: subsOut };
  }, [blocos]);

  const lista = useMemo(() => {
    const nq = strip(q.trim());
    return PROTOCOLOS.filter((p) => {
      if (catFiltro.length && !p.cats.some((c) => catFiltro.includes(c.cat) && !c.vazia)) return false;
      if (!nq) return true;
      const hay = strip(
        p.titulo + " " +
        p.cats.map((c) => c.label + " " + c.subs.map((s) =>
          s.sub + " " + s.itens.map((i) => i.t + " " + i.d).join(" ")).join(" ")).join(" ")
      );
      return hay.includes(nq);
    });
  }, [q, catFiltro, PROTOCOLOS]);

  const toggleCat = (k) =>
    setCatFiltro((f) => (f.includes(k) ? f.filter((x) => x !== k) : [...f, k]));

  const sevColor = (s) => {
    const n = strip(s || "");
    if (n.includes("alta")) return "#e0685f";
    if (n.includes("moderada") || n.includes("media")) return "#e0a95f";
    return C.cyan;
  };

  const item = (it, k) => (
    <div key={k} style={{ display: "flex", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.bg}` }}>
      <span style={{ color: C.cyan, flex: "0 0 auto", fontSize: 10, lineHeight: "21px" }}>▸</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ float: "right", marginLeft: 8 }}>
          <button onClick={() => setEditandoBloco(it)} title="Editar bloco"
            style={{ background: "none", border: "none", color: C.muted, fontSize: 13,
              cursor: "pointer", padding: 2 }}>✎</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13.5, lineHeight: 1.45 }}>{it.t}</span>
          {it.s && (
            <span style={{ fontSize: 10, fontWeight: 700, color: sevColor(it.s),
              border: `1px solid ${sevColor(it.s)}55`, borderRadius: 5, padding: "1px 6px",
              whiteSpace: "nowrap" }}>{it.s}</span>
          )}
          {it.f && (
            <span style={{ fontSize: 10, fontWeight: 700, color: C.muted,
              border: `1px solid ${C.line}`, borderRadius: 5, padding: "1px 6px" }}>{it.f}</span>
          )}
        </div>
        {it.d && (
          <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3, lineHeight: 1.5 }}>{it.d}</div>
        )}
        {it.img && (
          <img src={it.img} alt={it.leg || ""} style={{ maxWidth: "100%", borderRadius: 8, marginTop: 8,
            border: `1px solid ${C.line}` }} />
        )}
        {it.leg && (
          <div style={{ fontSize: 10.5, color: C.muted, marginTop: 4, fontStyle: "italic" }}>{it.leg}</div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: `${C.bg}f2`,
        backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.line}`, padding: "12px 14px 10px" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar condição, teste, exercício…"
            style={{ flex: 1, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10,
              color: C.text, padding: "11px 13px", fontSize: 15, fontFamily: "inherit", outline: "none" }}
            onFocus={(e) => (e.target.style.borderColor = C.cyan)}
            onBlur={(e) => (e.target.style.borderColor = C.line)} />
          <button onClick={() => setEditandoBloco({})} title="Novo bloco de protocolo"
            style={{ flex: "0 0 46px", background: C.cyan, border: "none", borderRadius: 10, color: C.bg,
              fontSize: 24, fontWeight: 700, cursor: "pointer", lineHeight: 1 }}>+</button>
        </div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingTop: 9, marginRight: -14 }}>
          {CATS.map((c) => {
            const on = catFiltro.includes(c.k);
            return (
              <button key={c.k} onClick={() => toggleCat(c.k)}
                style={{ background: on ? C.cyan : "transparent", color: on ? C.bg : C.text,
                  border: `1px solid ${on ? C.cyan : C.line}`, borderRadius: 999, padding: "6px 12px",
                  fontSize: 12.5, fontWeight: on ? 700 : 500, whiteSpace: "nowrap", cursor: "pointer",
                  fontFamily: "inherit" }}>
                {c.icon} {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading && (
        <div style={{ padding: "50px 24px", textAlign: "center", color: C.muted }}>
          <div style={{ width: 24, height: 24, border: `3px solid ${C.line}`, borderTopColor: C.cyan,
            borderRadius: "50%", margin: "0 auto 12px", animation: "spin .8s linear infinite" }} />
          Carregando protocolos…
        </div>
      )}
      {erro && !loading && (
        <div style={{ padding: "40px 24px", textAlign: "center" }}>
          <div style={{ color: "#e0685f", marginBottom: 10 }}>Não consegui carregar os protocolos.</div>
          <div style={{ color: C.muted, fontSize: 12, marginBottom: 14, wordBreak: "break-word" }}>{erro}</div>
          <button onClick={carregar} style={{ background: C.cyan, border: "none", color: C.bg,
            borderRadius: 8, padding: "9px 16px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Tentar de novo</button>
        </div>
      )}
      {!loading && !erro && lista.length === 0 && (
        <div style={{ padding: "50px 24px", textAlign: "center", color: C.muted }}>Nada encontrado.</div>
      )}

      {!loading && !erro && lista.map((p) => {
        const open = aberto === p.id;
        const total = p.cats.reduce((a, c) => a + c.subs.reduce((b, s) => b + s.itens.length, 0), 0);
        return (
          <div key={p.id} style={{ borderBottom: `1px solid ${C.line}` }}>
            <button onClick={() => setAberto(open ? null : p.id)}
              style={{ width: "100%", textAlign: "left", background: open ? C.surface : "transparent",
                border: "none", color: C.text, padding: "15px 14px", cursor: "pointer",
                fontFamily: "inherit", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: open ? 700 : 500, lineHeight: 1.3 }}>{p.titulo}</div>
                <div style={{ fontSize: 10.5, color: C.muted, marginTop: 3, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span>
                    {p.cats.filter((c) => !c.vazia).map((c) => CATS.find((x) => x.k === c.cat)?.icon).join(" ")} · {total} itens
                  </span>
                  {p.faltando > 0 && (
                    <span style={{ color: C.danger, border: `1px solid ${C.danger}55`, borderRadius: 5,
                      padding: "1px 6px", fontWeight: 700, fontSize: 10 }}>
                      falta {p.faltando} de 4
                    </span>
                  )}
                </div>
              </div>
              <span style={{ color: C.cyan, fontSize: 12 }}>{open ? "▾" : "▸"}</span>
            </button>

            {open && (
              <div style={{ padding: "2px 14px 22px", background: C.surface }}>
                {p.cats
                  .filter((c) => !catFiltro.length || catFiltro.includes(c.cat))
                  .map((c) => (
                    <div key={c.cat} style={{ marginTop: 16, opacity: c.vazia ? 0.55 : 1 }}>
                      <div style={{ fontSize: 10.5, letterSpacing: "0.14em",
                        color: c.vazia ? C.muted : C.cyan, fontWeight: 700,
                        textTransform: "uppercase", paddingBottom: 6,
                        borderBottom: `1px solid ${C.line}`, marginBottom: 6,
                        display: "flex", alignItems: "center", gap: 7 }}>
                        <span>{CATS.find((x) => x.k === c.cat)?.icon} {c.label}</span>
                        {c.vazia && (
                          <span style={{ fontSize: 9, letterSpacing: "0.08em", color: C.danger,
                            border: `1px solid ${C.danger}55`, borderRadius: 4, padding: "1px 5px" }}>
                            a preencher
                          </span>
                        )}
                      </div>
                      {c.vazia ? (
                        <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic", padding: "4px 0 2px" }}>
                          — ainda sem conteúdo nesta categoria —
                        </div>
                      ) : (
                        c.subs.map((s, si) => (
                          <div key={si} style={{ marginTop: s.sub ? 12 : 0 }}>
                            {s.sub && (
                              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, background: C.surface2,
                                padding: "5px 9px", borderRadius: 6, marginBottom: 4, display: "inline-block" }}>
                                {s.sub}
                              </div>
                            )}
                            {s.itens.map(item)}
                          </div>
                        ))
                      )}
                      <button
                        onClick={() => setEditandoBloco({
                          protocolo: p.titulo,
                          categoria: c.cat,
                          subcategoria: !c.vazia && c.subs.length === 1 ? c.subs[0].sub : "",
                        })}
                        style={{ marginTop: 8, background: "none", border: `1px dashed ${C.line}`,
                          color: C.cyan, borderRadius: 8, padding: "6px 11px", fontSize: 11.5,
                          cursor: "pointer", fontFamily: "inherit" }}>
                        + adicionar em {c.label}
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        );
      })}

      {editandoBloco !== null && (
        <ProtocoloModal
          registro={editandoBloco}
          cats={CATS}
          catLabel={CAT_LABEL}
          vocab={protVocab}
          onClose={() => setEditandoBloco(null)}
          onSaved={async () => { setEditandoBloco(null); await carregar(); }}
        />
      )}
    </div>
  );
}

// =====================================================================
//  Modal: criar / editar / excluir bloco de protocolo
// =====================================================================
function ProtocoloModal({ registro, cats, catLabel, vocab, onClose, onSaved }) {
  const isEdit = !!registro.id;
  const [protocolo, setProtocolo] = useState(registro.protocolo || "");
  const [categoria, setCategoria] = useState(registro.categoria || "testes");
  const [subcategoria, setSubcategoria] = useState(registro.subcategoria || "");
  const [conteudo, setConteudo] = useState(registro.t || "");
  const [detalhe, setDetalhe] = useState(registro.d || "");
  const [severidade, setSeveridade] = useState(registro.s || "");
  const [fase, setFase] = useState(registro.f || "");
  const [urlImagem, setUrlImagem] = useState(registro.img || "");
  const [legenda, setLegenda] = useState(registro.leg || "");
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [confirmaEx, setConfirmaEx] = useState(false);
  const [erro, setErro] = useState("");

  const subSugestoes = vocab.subsPorCat[categoria] || [];

  const salvar = async () => {
    if (!protocolo.trim()) { setErro("Dá um nome pro protocolo 🙂"); return; }
    if (!conteudo.trim()) { setErro("Escreve o conteúdo do bloco."); return; }
    setSalvando(true); setErro("");
    const dados = {
      protocolo: protocolo.trim(),
      categoria,
      subcategoria: subcategoria.trim(),
      ordem: registro.ordem || "",
      conteudo: conteudo.trim(),
      detalhe: detalhe.trim(),
      severidade: severidade.trim(),
      fase: fase.trim(),
      url_imagem: urlImagem.trim(),
      legenda: legenda.trim(),
    };
    if (isEdit) dados.id = registro.id;
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ acao: isEdit ? "prot_editar" : "prot_criar", dados }),
      });
      await onSaved();
    } catch (e) {
      setErro("Erro ao salvar: " + e);
      setSalvando(false);
    }
  };

  const excluir = async () => {
    setExcluindo(true); setErro("");
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ acao: "prot_excluir", dados: { id: registro.id } }),
      });
      await onSaved();
    } catch (e) {
      setErro("Erro ao excluir: " + e);
      setExcluindo(false);
    }
  };

  const labelCss = { fontSize: 11, letterSpacing: "0.14em", color: C.cyan, fontWeight: 700,
    textTransform: "uppercase", marginBottom: 7, display: "block" };
  const inputCss = { width: "100%", background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10,
    color: C.text, padding: "11px 13px", fontSize: 15, fontFamily: "inherit", outline: "none" };
  const foco = (e) => (e.target.style.borderColor = C.cyan);
  const blur = (e) => (e.target.style.borderColor = C.line);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,.7)",
      display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.bg, width: "100%", maxWidth: 640,
        maxHeight: "92vh", overflowY: "auto", borderTopLeftRadius: 18, borderTopRightRadius: 18,
        border: `1px solid ${C.line}`, padding: "18px 16px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{isEdit ? "Editar bloco" : "Novo bloco"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: 24, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        {/* Protocolo (com datalist de existentes) */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelCss}>Protocolo / condição</label>
          <input list="lista-protocolos" value={protocolo} onChange={(e) => setProtocolo(e.target.value)}
            placeholder="Ex.: Radiculopatia, De Quervain…" style={inputCss} onFocus={foco} onBlur={blur} />
          <datalist id="lista-protocolos">
            {vocab.protocolos.map((p) => <option key={p} value={p} />)}
          </datalist>
        </div>

        {/* Categoria (as 4 fixas) */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelCss}>Categoria</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {cats.map((c) => {
              const on = categoria === c.k;
              return (
                <button key={c.k} onClick={() => setCategoria(c.k)}
                  style={{ background: on ? C.cyan : "transparent", color: on ? C.bg : C.text,
                    border: `1px solid ${on ? C.cyan : C.line}`, borderRadius: 999, padding: "6px 12px",
                    fontSize: 12.5, fontWeight: on ? 700 : 500, cursor: "pointer", fontFamily: "inherit" }}>
                  {c.icon} {catLabel[c.k]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subcategoria (livre, com sugestões) */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelCss}>Subcategoria <span style={{ color: C.muted, fontWeight: 400, letterSpacing: 0, textTransform: "none" }}>(opcional)</span></label>
          <input list="lista-subs" value={subcategoria} onChange={(e) => setSubcategoria(e.target.value)}
            placeholder="Ex.: Alongamento Piriforme…" style={inputCss} onFocus={foco} onBlur={blur} />
          <datalist id="lista-subs">
            {subSugestoes.map((s) => <option key={s} value={s} />)}
          </datalist>
        </div>

        {/* Conteúdo */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelCss}>Conteúdo</label>
          <textarea value={conteudo} onChange={(e) => setConteudo(e.target.value)} rows={2}
            placeholder="Texto principal do bloco" style={{ ...inputCss, resize: "vertical", lineHeight: 1.5 }}
            onFocus={foco} onBlur={blur} />
        </div>

        {/* Detalhe */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelCss}>Detalhe <span style={{ color: C.muted, fontWeight: 400, letterSpacing: 0, textTransform: "none" }}>(opcional)</span></label>
          <textarea value={detalhe} onChange={(e) => setDetalhe(e.target.value)} rows={2}
            placeholder="Observação, série x reps, referência…" style={{ ...inputCss, resize: "vertical", lineHeight: 1.5 }}
            onFocus={foco} onBlur={blur} />
        </div>

        {/* Severidade + Fase lado a lado */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelCss}>Severidade</label>
            <input value={severidade} onChange={(e) => setSeveridade(e.target.value)}
              placeholder="Alta / Moderada / Leve" style={inputCss} onFocus={foco} onBlur={blur} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelCss}>Fase</label>
            <input value={fase} onChange={(e) => setFase(e.target.value)}
              placeholder="Ex.: Aguda, Fase 1…" style={inputCss} onFocus={foco} onBlur={blur} />
          </div>
        </div>

        {/* Imagem + legenda */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelCss}>URL da imagem <span style={{ color: C.muted, fontWeight: 400, letterSpacing: 0, textTransform: "none" }}>(opcional)</span></label>
          <input value={urlImagem} onChange={(e) => setUrlImagem(e.target.value)}
            placeholder="https://…" style={inputCss} onFocus={foco} onBlur={blur} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={labelCss}>Legenda <span style={{ color: C.muted, fontWeight: 400, letterSpacing: 0, textTransform: "none" }}>(opcional)</span></label>
          <input value={legenda} onChange={(e) => setLegenda(e.target.value)}
            placeholder="Legenda da imagem" style={inputCss} onFocus={foco} onBlur={blur} />
        </div>

        {erro && <div style={{ color: C.danger, fontSize: 13, marginBottom: 12 }}>{erro}</div>}

        <button onClick={salvar} disabled={salvando || excluindo}
          style={{ width: "100%", background: salvando ? C.line : C.cyan, border: "none", color: C.bg,
            borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 700,
            cursor: salvando ? "default" : "pointer", fontFamily: "inherit" }}>
          {salvando ? "Salvando…" : isEdit ? "Salvar alterações" : "Criar bloco"}
        </button>

        {isEdit && (
          <div style={{ marginTop: 12 }}>
            {!confirmaEx ? (
              <button onClick={() => setConfirmaEx(true)} disabled={salvando || excluindo}
                style={{ width: "100%", background: "none", border: `1px solid ${C.danger}55`,
                  color: C.danger, borderRadius: 10, padding: "11px", fontSize: 13.5, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit" }}>
                Excluir este bloco
              </button>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setConfirmaEx(false)} disabled={excluindo}
                  style={{ flex: 1, background: "none", border: `1px solid ${C.line}`, color: C.text,
                    borderRadius: 10, padding: "11px", fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" }}>
                  Cancelar
                </button>
                <button onClick={excluir} disabled={excluindo}
                  style={{ flex: 1, background: C.danger, border: "none", color: "#fff",
                    borderRadius: 10, padding: "11px", fontSize: 13.5, fontWeight: 700,
                    cursor: excluindo ? "default" : "pointer", fontFamily: "inherit" }}>
                  {excluindo ? "Excluindo…" : "Confirmar exclusão"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================================
//  Shell com abas
// =====================================================================
export default function App() {
  const [aba, setAba] = useState("cardapio");

  const tab = (id, label) => (
    <button onClick={() => setAba(id)}
      style={{ flex: 1, background: "transparent", border: "none", borderBottom: `2px solid ${aba === id ? C.cyan : "transparent"}`,
        color: aba === id ? C.cyan : C.muted, padding: "13px 8px", fontSize: 13.5,
        fontWeight: aba === id ? 700 : 500, cursor: "pointer", fontFamily: "inherit",
        letterSpacing: "0.02em", transition: "all .15s ease" }}>
      {label}
    </button>
  );

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh",
      fontFamily: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;700&display=swap');
        *{box-sizing:border-box} body{margin:0;background:${C.bg}}
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-thumb{background:${C.line};border-radius:9px}
        input::placeholder{color:${C.muted}}
        .row:active{background:${C.surface2}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media (prefers-reduced-motion: reduce){*{transition:none!important}}` }} />

      <div style={{ padding: "12px 14px 2px", display: "flex", alignItems: "center" }}>
        <LogoIdealis size={32} />
      </div>
      <div style={{ display: "flex", borderBottom: `1px solid ${C.line}`, padding: "6px 8px 0" }}>
        {tab("cardapio", "Cardápio")}
        {tab("protocolos", "Protocolos Clínicos")}
      </div>

      {aba === "cardapio" ? <CardapioTab /> : <ProtocolosTab />}
    </div>
  );
}
