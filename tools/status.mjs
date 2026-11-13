// Verificação determinística da pipeline (custa zero tokens de modelo).
// Uso: node tools/status.mjs            -> tabela de todas as aulas
//      node tools/status.mjs <slug>     -> só uma aula
// Saída por aula: slug | md | curadoria | figuras | slides | questoes | PROXIMA=<etapa>
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const p = (...a) => path.join(ROOT, ...a);
const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/\.pdf$/i, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const ler = (f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null);
const conta = (txt, re) => (txt.match(re) || []).length;

function checar(s) {
  const r = {};
  const md = ler(p('aulas-markdown', s + '.md'));
  r.md = !md ? 'falta' : md.length < 200 ? 'vazio?' : 'ok';

  // curadoria: seções obrigatórias + código e aplicações por conceito
  const cur = ler(p('curadoria', s + '.md'));
  let nConceitos = 0;
  if (!cur) r.curadoria = 'falta';
  else {
    const secoes = ['## Mapa da aula', '## Conceitos', '## Glossário', '## Revisão rápida'];
    const faltam = secoes.filter((x) => !cur.includes(x));
    nConceitos = conta(cur, /^### /gm);
    const codigos = conta(cur, /^```python/gm);
    const apps = conta(cur, /\*\*Aplicações reais:\*\*/g);
    const figs = conta(cur, /\*\*Figura a gerar:\*\*/g);
    const problemas = [];
    if (faltam.length) problemas.push('sem ' + faltam.join(','));
    if (codigos < Math.ceil(nConceitos * 0.7)) problemas.push(`codigo ${codigos}/${nConceitos} conceitos (min 70%)`);
    if (apps < nConceitos) problemas.push(`aplicacoes-reais ${apps}/${nConceitos}`);
    if (figs < Math.ceil(nConceitos * 0.6)) problemas.push(`figura-a-gerar ${figs}/${nConceitos}`);
    r.curadoria = problemas.length ? `incompleta(${problemas.join('; ')})` : `ok(${nConceitos} conceitos)`;
  }

  // figuras geradas: LEGENDAS.md + todos os PNGs listados existem
  const leg = ler(p('figuras', s, 'LEGENDAS.md'));
  if (!leg) r.figuras = 'falta';
  else {
    const lista = [...leg.matchAll(/^-\s*(\S+\.png)/gm)].map((m) => m[1]);
    const ausentes = lista.filter((f) => !fs.existsSync(p(f)));
    r.figuras = ausentes.length ? `png-ausente(${ausentes.length})`
      : lista.length < Math.max(5, Math.ceil(nConceitos * 0.6)) ? `poucas(${lista.length})` : `ok(${lista.length})`;
  }

  // slides: quantidade, imagens existentes, código presente
  const sl = ler(p('slides', s + '.md'));
  if (!sl) r.slides = 'falta';
  else {
    const n = sl.split(/\n---\n/).length;
    const imgs = [...sl.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)].map((m) => m[1].replace(/^\.\.\//, ''));
    const ausentes = imgs.filter((f) => !fs.existsSync(p(f)));
    const codigos = conta(sl, /^```\w+/gm);
    const html = ler(p('slides', s + '.html'));
    const problemas = [];
    if (ausentes.length) problemas.push(`imagem-inexistente(${ausentes.length})`);
    if (imgs.length < nConceitos * 2) problemas.push(`poucas-imagens(${imgs.length}; min ${nConceitos * 2})`);
    if (codigos < Math.ceil(nConceitos * 0.7)) problemas.push(`pouco-codigo(${codigos}; min ${Math.ceil(nConceitos * 0.7)})`);
    if (n < 8) problemas.push(`poucos-slides(${n})`);
    r.slides = problemas.length ? problemas.join('; ') : !html || fs.statSync(p('slides', s + '.html')).mtimeMs < fs.statSync(p('slides', s + '.md')).mtimeMs
      ? 'sem-html(rode build-slides)' : `ok(${n} slides, ${imgs.length} imgs, ${codigos} codigos)`;
  }

  const qjs = ler(p('questoes', s + '.js'));
  let q = 'falta';
  if (qjs) {
    try {
      const ctx = {}; vm.runInNewContext(qjs + ';this.Q=QUESTOES', ctx);
      const ruins = ctx.Q.filter((x) => !x.pergunta || !Array.isArray(x.opcoes) || x.opcoes.length < 2
        || !(x.correta >= 0 && x.correta < x.opcoes.length) || !x.explicacao);
      // pista de tamanho: a correta não pode ser frequentemente a alternativa mais longa nem a mais curta
      const extremo = (f) => ctx.Q.filter((x) => {
        const L = x.opcoes.map((o) => o.length); return L[x.correta] === f(...L);
      }).length;
      const maisLonga = extremo(Math.max), maisCurta = extremo(Math.min), lim = Math.ceil(ctx.Q.length * 0.4);
      q = ruins.length ? `invalidas(${ruins.length})`
        : maisLonga > lim ? `pista-tamanho(correta-mais-longa ${maisLonga}/${ctx.Q.length})`
        : maisCurta > lim ? `pista-tamanho(correta-mais-curta ${maisCurta}/${ctx.Q.length})`
        : !fs.existsSync(p('questoes', s + '.html'))
        ? 'sem-html(rode build-questoes)' : `ok(${ctx.Q.length})`;
    } catch (e) { q = 'js-quebrado'; }
  }
  r.questoes = q;

  // ordem: md -> curadoria -> figuras -> slides ; questoes depende só da curadoria
  const ordem = ['md', 'curadoria', 'figuras', 'slides', 'questoes'];
  const prox = ordem.find((k) => !r[k].startsWith('ok'));
  r.PROXIMA = !prox ? 'CONCLUIDA' : prox;
  return r;
}

const pdfs = fs.readdirSync(p('aulas')).filter((f) => f.toLowerCase().endsWith('.pdf')).map(slug);
const mds = fs.readdirSync(p('aulas-markdown')).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3));
let todas = [...new Set([...pdfs, ...mds])].sort();
if (process.argv[2]) todas = [process.argv[2]];
if (!todas.length) console.log('NENHUMA_AULA (coloque PDFs em aulas/)');
for (const s of todas) {
  const r = checar(s);
  console.log([s, ...Object.entries(r).map(([k, v]) => `${k}=${v}`)].join(' | '));
}
