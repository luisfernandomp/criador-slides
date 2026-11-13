// Gera questoes/<slug>.html (página simples) que carrega questoes/<slug>.js + questoes/quiz.js
// Uso: node tools/build-questoes.mjs <slug> "<Título da aula>"
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const [s, titulo = s] = process.argv.slice(2);
if (!s) { console.error('uso: node tools/build-questoes.mjs <slug> "<titulo>"'); process.exit(2); }
const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>Questões - ${titulo}</title></head>
<body>
<h1>Questões - ${titulo}</h1>
<div id="quiz"></div>
<p id="placar"></p>
<script src="${s}.js"></script>
<script src="quiz.js"></script>
</body></html>
`;
fs.writeFileSync(path.join(ROOT, 'questoes', s + '.html'), html);
console.log(`OK questoes/${s}.html`);
