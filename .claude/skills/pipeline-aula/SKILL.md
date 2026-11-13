---
name: pipeline-aula
description: Orquestra a pipeline completa das aulas de Computação Visual (PDF → Markdown → curadoria → figuras → slides + questões), escolhendo modelo/effort de cada agente e conferindo cada etapa. Use quando o usuário pedir para processar aulas ou rodar a pipeline. Argumento opcional: slug de uma aula.
user-invocable: true
model: haiku
---

# Orquestrador da pipeline de aulas

Você **não produz conteúdo**: só despacha agentes e confere. Toda conferência é feita por script (zero tokens de leitura). **Nunca abra os arquivos gerados** para conferir — use `node tools/status.mjs`.

## Pipeline
```
aulas/*.pdf ─conversor─▶ aulas-markdown/<slug>.md (+ img/<slug>/) ─curador-cv─▶ curadoria/<slug>.md ─┬─ilustrador─▶ figuras/<slug>/ ─criador-slides─▶ slides/<slug>.html
                                                                                                 └─criador-questoes─▶ questoes/<slug>.html
```

## Tabela de modelo/effort (passe `model` e `effort` explicitamente na chamada do Agent)
| Etapa | subagent_type | model | effort | Motivo |
|---|---|---|---|---|
| Conversão | conversor | haiku | low | só roda script |
| Curadoria | curador-cv | sonnet | medium | qualidade técnica e didática; base de tudo |
| Figuras | ilustrador | sonnet | low | código precisa rodar; tarefa bem especificada |
| Slides | criador-slides | sonnet | medium | slides visuais com figuras e código; haiku gerou slides só de texto |
| Questões | criador-questoes | haiku | low | extrai de conteúdo já pronto |

**Escalonamento (só se necessário):**
- Haiku falhou na validação **2 vezes** na mesma etapa → refaça com `sonnet`, mesmo effort.
- Sonnet falhou 2 vezes → `effort: high`.
- Curadoria: use `effort: high` só se o Markdown da aula tiver mais de ~60 KB (`wc -c`) ou muita matemática; `opus` apenas se o usuário pedir.
- Nunca use opus por padrão.

## Algoritmo
1. `node tools/status.mjs` (ou `node tools/status.mjs <slug>` se veio argumento).
2. Se alguma aula tem `md=falta` → **um único** Agent `conversor` (ele converte todos os PDFs pendentes de uma vez). Rode o status de novo.
   - Se o conversor responder `POUCO_TEXTO` ou `FALHA`: avise o usuário no relatório final e siga com as outras aulas.
3. Para cada aula, conforme `PROXIMA=`:
   - `curadoria` → Agent `curador-cv` com prompt: `slug=<slug>. Gere curadoria/<slug>.md.`
   - `figuras` → dispare **na mesma mensagem** (em paralelo) `ilustrador` e, se `questoes` não estiver ok, `criador-questoes`. Prompt: `slug=<slug>, aula="<Nome da aula>".`
   - `slides` → `criador-slides` (precisa de `figuras=ok`). Prompt igual.
   - `questoes` → `criador-questoes`.
   - Aulas diferentes podem rodar em paralelo (até 3 agentes por vez).
   - Se a curadoria foi refeita, figuras, slides e questões antigos ficam desatualizados: apague-os antes (`rm -rf figuras/<slug> slides/<slug>.* questoes/<slug>.*`).
4. Após cada retorno, rode `node tools/status.mjs <slug>`:
   - `ok` → segue.
   - `incompleta(...)`, `poucas(...)`, `png-ausente(...)`, `poucas-imagens(...)`, `pouco-codigo(...)`, `imagem-inexistente(...)`, `poucos-slides(...)`, `invalidas(...)`, `pista-tamanho(...)`, `js-quebrado`, `sem-html(...)` → re-despache **o mesmo agente** dizendo apenas o defeito (ex.: `slug=x. status: curadoria incompleta(## Glossário). Corrija só isso, sem reescrever o resto.`). Aplique o escalonamento acima.
   - `sem-html` pode ser resolvido por você mesmo rodando `node tools/build-slides.mjs <slug>` ou `node tools/build-questoes.mjs <slug> "<Nome>"`.
5. Termine quando todas as aulas estiverem `PROXIMA=CONCLUIDA`.

## Regras de economia de tokens
- Prompts para agentes: só o slug, o nome da aula e o defeito (se houver). Eles já sabem o que fazer.
- Não peça resumos aos agentes; eles respondem em uma linha.
- Não releia saídas; confie no `status.mjs`.

## Relatório final ao usuário (curto)
Tabela: aula | slides | questões | observações (falhas, escalonamentos usados). Mostre o caminho dos arquivos: `slides/<slug>.html`, `questoes/<slug>.html`.
