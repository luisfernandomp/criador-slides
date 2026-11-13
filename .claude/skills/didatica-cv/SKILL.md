---
name: didatica-cv
description: Diretrizes didáticas para explicar Computação Visual (processamento de imagens, visão computacional, computação gráfica) para leigos e estudantes. Use ao curar conteúdo de aula, montar slides ou explicar qualquer conceito da disciplina.
user-invocable: true
---

# Didática para Computação Visual

Público-alvo: estudante que **nunca viu o assunto** e pode ter base fraca em matemática. Meta: ele entende *a intuição* antes da fórmula, e a fórmula vira só "a intuição escrita em símbolos".

## Regras de ouro
1. **Intuição → exemplo → formalização → aplicação.** Nunca comece pela fórmula.
2. **Uma ideia por vez.** Se um parágrafo tem dois conceitos novos, quebre.
3. **Analogia do cotidiano** para cada conceito (foto do celular, filtro do Instagram, óculos, carimbo, peneira, mapa, régua...). Diga também *onde a analogia falha*.
4. **Números pequenos e concretos.** Mostre uma imagem 3x3 ou 5x5 com valores reais de pixel e faça a conta à mão, passo a passo.
5. **Traduza toda fórmula** símbolo por símbolo em português ("Σ = some tudo", "I(x,y) = brilho do pixel na coluna x, linha y").
6. **Jargão só depois de explicado.** Primeiro uso de um termo: em **negrito** + definição de uma frase; depois vai pro glossário.
7. **Mostre o "para que serve"**: onde aparece no mundo real (câmera do celular, carro autônomo, exame médico, reconhecimento facial, jogos, cinema).
8. **Antecipe a dúvida.** Inclua "Erro comum:" e "Pergunta que todo mundo faz:".
9. **Conecte** com o que veio antes e o que vem depois na disciplina.
10. **Português claro**, frases curtas, voz ativa. Nada de "trivialmente", "obviamente", "é fácil ver que".

## Kit de conhecimentos-base da disciplina (use para dar contexto)
- **Imagem digital** = matriz de números (pixels). Tons de cinza: 0 (preto) a 255 (branco). Cor: 3 matrizes (R, G, B).
- **Amostragem** (quantos pixels) × **quantização** (quantos níveis de cor).
- **Histograma**, contraste, equalização, limiarização (threshold).
- **Convolução / filtros**: janela (kernel) que desliza sobre a imagem; média/Gauss (suaviza), mediana (ruído sal-e-pimenta), Sobel/Prewitt/Laplaciano/Canny (bordas).
- **Domínio da frequência**: Fourier — "receita" de ondas que compõem a imagem; passa-baixa = borrar, passa-alta = realçar detalhes.
- **Morfologia**: erosão, dilatação, abertura, fechamento (para imagens binárias).
- **Segmentação**: separar objetos (limiar, Otsu, crescimento de regiões, watershed, k-means).
- **Características**: cantos (Harris), descritores (SIFT, ORB), HOG.
- **Geometria**: transformações (translação, rotação, escala, afim, homografia), coordenadas homogêneas, modelo de câmera pinhole, calibração, estéreo/profundidade.
- **Cor**: RGB, HSV, YCbCr, CMY(K), percepção humana.
- **Aprendizado**: classificação, CNNs (convolução aprendida), detecção (YOLO), segmentação semântica.
- **Computação gráfica** (se a disciplina cobrir): rasterização, pipeline gráfico, iluminação (Phong), textura, projeção.

## Computação Visual se aprende VENDO (obrigatório)
Esta disciplina é visual: texto sozinho não ensina. Todo conceito precisa de três coisas:
1. **Imagem**: a figura do professor que ilustra o conceito **e/ou** uma figura gerada que mostra o efeito numa foto real (ex.: original | espectro | depois do filtro). "Antes e depois" lado a lado é o formato mais didático.
2. **Código que roda**: Python com NumPy/OpenCV (10–20 linhas, comentado em português) mostrando o conceito na prática. Se o professor mostrou código, use e explique o código dele; depois mostre a versão "do mundo real" (ex.: `np.fft.fft2` em vez do laço manual) e diga por que ela é mais rápida.
3. **Aplicação real concreta**, não genérica. Ruim: "usado em processamento de imagens". Bom: "Ressonância magnética: o aparelho mede o *espectro* (espaço k) e o computador aplica a transformada inversa para formar a imagem que o médico vê". Diga **setor + problema + como o conceito resolve + por que funciona**.

## Formatos que funcionam
- Figuras lado a lado com títulos curtos ("Original", "Espectro", "Passa-baixa D0=30").
- Tabelas pequenas de pixels em Markdown.
- Diagramas Mermaid simples ou setas em texto para fluxos (entrada → processo → saída).
- Fórmulas em LaTeX com `$...$` / `$$...$$`, sempre seguidas da tradução.
- Código Python comentado em português, com nomes de variáveis claros.

## Caminhos de arquivos (padrão do projeto)
Sempre a partir da raiz do repositório:
- Figuras do professor: `aulas-markdown/img/<slug>/pNN-MM.png` (NN = página). Páginas inteiras: `aulas-markdown/img/<slug>/paginas/pagNN.png`.
- Figuras geradas: `figuras/<slug>/<nome>.png`, com legendas em `figuras/<slug>/LEGENDAS.md`.
