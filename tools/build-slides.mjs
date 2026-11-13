// Gera slides/<slug>.html a partir de slides/<slug>.md usando o template reveal.js.
// Caminhos de imagem a partir da raiz do repo (figuras/..., aulas-markdown/...) são ajustados para ../
// Uso: node tools/build-slides.mjs <slug>
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const s = process.argv[2];
if (!s) { console.error('uso: node tools/build-slides.mjs <slug>'); process.exit(2); }
let md = fs.readFileSync(path.join(ROOT, 'slides', s + '.md'), 'utf8');

const imgs = [...md.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)].map((m) => m[1]);
const faltando = imgs.filter((i) => !fs.existsSync(path.join(ROOT, i.replace(/^\.\.\//, ''))));
md = md.replace(/(!\[[^\]]*\]\()(?:\.\.\/)?((?:figuras|aulas-markdown)\/)/g, '$1../$2');

const titulo = (md.match(/^#\s+(.+)$/m) || [, s])[1].trim();
const tpl = fs.readFileSync(path.join(ROOT, 'tools/templates/slides.html'), 'utf8');
const html = tpl.replaceAll('{{TITULO}}', titulo.replace(/</g, '&lt;'))
  .replace('{{MARKDOWN}}', () => md.replace(/<\/textarea>/gi, '&lt;/textarea>'));
fs.writeFileSync(path.join(ROOT, 'slides', s + '.html'), html);
const codigos = (md.match(/^```\w+/gm) || []).length;
console.log(`OK slides/${s}.html (${md.split(/\n---\n/).length} slides, ${imgs.length} imagens, ${codigos} códigos)`);
if (faltando.length) { console.log('IMAGENS_INEXISTENTES: ' + faltando.join(', ')); process.exit(1); }
