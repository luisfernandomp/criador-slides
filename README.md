# criador-slides

Pipeline de estudo para Computação Visual: PDF da aula → Markdown → curadoria didática → slides + questões.

## Uso
1. Instale uma vez: `pip install -r requirements.txt` (precisa também de Node para os scripts em `tools/`)
2. Coloque os PDFs em `aulas/` (o nome do arquivo vira o nome da aula, ex.: `Aula 03 - Filtragem Espacial.pdf`).
3. No Claude Code: `/pipeline-aula` (ou inicie com `claude --agent orquestrador`).

## Saídas
| Pasta | Conteúdo | Agente (modelo / effort) |
|---|---|---|
| `aulas-markdown/` | PDF convertido + figuras do PDF em `img/` (`tools/converter-local.py`) | `conversor` (haiku / low) |
| `curadoria/` | explicação aprofundada e didática | `curador-cv` (sonnet / medium) |
| `figuras/<aula>/` | figuras didáticas geradas pelo código da curadoria | `ilustrador` (sonnet / low) |
| `slides/<aula>.html` | slides reveal.js com figuras e código (abra no navegador) | `criador-slides` (sonnet / medium) |
| `questoes/<aula>.html` | questões com radio button e correção | `criador-questoes` (haiku / low) |

`node tools/status.mjs` mostra em que etapa cada aula está.

