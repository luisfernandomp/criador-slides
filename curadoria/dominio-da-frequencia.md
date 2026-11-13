# Domínio da Frequência

## Mapa da aula
Até agora vimos a imagem como uma grade de pixels (domínio espacial). Nesta aula vemos a mesma imagem como uma "receita de ondas" (domínio da frequência). Ordem: (1) a ideia de Fourier; (2) o ciclo transformar, filtrar, voltar; (3) a fórmula contínua; (4) números complexos, magnitude e fase; (5) a DFT 2D do professor, escrita com laços; (6) magnitude, `log` e `shift` para enxergar o espectro; (7) a IDFT; (8) dualidade; (9) convolução vira multiplicação; (10) filtros passa-tudo, passa-baixa e passa-alta; (11) amostragem; (12) teorema de Nyquist; (13) aliasing; (14) antialiasing e reamostragem. Importa porque JPEG, MRI, remoção de ruído periódico, redimensionamento de imagens e áudio digital dependem disso. Pré-requisitos: imagem como matriz, convolução/filtros espaciais, noção básica de seno e cosseno.

## Conceitos

### 1. Série de Fourier: qualquer sinal é soma de ondas
**Em uma frase:** Fourier (1807) afirmou que toda função periódica pode ser escrita como soma de senos e cossenos de frequências diferentes, cada um multiplicado por um coeficiente.
**Analogia:** Um acorde de piano é a soma de notas puras; o ouvido (ou um analisador de espectro) separa as notas. A imagem é o "acorde" e a Fourier lista as "notas". Onde falha: numa imagem as "notas" são padrões de listras 2D, não sons, e a imagem não precisa ser periódica (a DFT a trata como se fosse repetida).
**Explicação aprofundada:** Uma onda de baixa frequência varia devagar (listras largas, o "tom geral" da imagem). Uma de alta frequência varia rápido (listras finas, o "detalhe"). Somando poucas ondas já se aproxima o sinal; somando mais ondas, a aproximação melhora. Na figura de ondas quadradas do professor, 1, 3, 5... senos somados vão se aproximando do degrau. Cantos vivos exigem muitas altas frequências. Isso explica por que bordas e ruído vivem nas altas frequências e áreas lisas nas baixas.
**Exemplo passo a passo:** Onda quadrada $\approx \sin(x) + \tfrac{1}{3}\sin(3x) + \tfrac{1}{5}\sin(5x)+\dots$
| Termos somados | Aparência |
|---|---|
| 1 (só $\sin x$) | onda suave, sem cantos |
| 2 ($+\tfrac13\sin 3x$) | topo mais achatado |
| 3 ($+\tfrac15\sin 5x$) | quase um degrau, com "orelhas" nos cantos |
**A fórmula traduzida:** $f(x)=\sum_k a_k\,\sin(2\pi k x + \varphi_k)$. $f(x)$ = valor do sinal na posição $x$; $\sum$ = some todas as ondas; $k$ = qual frequência; $a_k$ = quanto dessa onda entra (coeficiente); $\varphi_k$ = onde a onda começa (fase).
**Figuras do professor:** `aulas-markdown/img/dominio-da-frequencia/p05-00.png` — quatro senos de frequências diferentes e, embaixo, a soma deles; observe que a soma é uma curva irregular que nenhum seno sozinho faz. `aulas-markdown/img/dominio-da-frequencia/p06-00.png` — onda quadrada aproximada por soma de 1, 3, 5 e mais senos; observe os cantos ficando mais retos conforme entram mais termos.
**Código:**
```python
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(0, 2*np.pi, 1000)
quadrada = np.sign(np.sin(x))            # sinal alvo: onda quadrada
soma = np.zeros_like(x)
fig, eixos = plt.subplots(1, 4, figsize=(14, 3))
for ax, n_termos in zip(eixos, [1, 2, 3, 10]):
    soma[:] = 0
    for k in range(n_termos):
        h = 2*k + 1                       # harmônicos ímpares: 1, 3, 5...
        soma += (4/np.pi) * np.sin(h*x) / h   # coeficiente 4/(pi*h)
    ax.plot(x, quadrada, 'r', lw=1)       # alvo em vermelho
    ax.plot(x, soma, 'b')                 # aproximação em azul
    ax.set_title(f"{n_termos} senos")
plt.savefig("fourier-quadrada.png", dpi=120)
```
Observe que com 10 senos os cantos ficam nítidos, mas sempre sobra uma "orelha" nos degraus (fenômeno de Gibbs).
**Figura a gerar:** `serie-fourier-quadrada.png` — 4 painéis lado a lado: 1 seno | 2 senos | 3 senos | 10 senos, cada um com a onda quadrada vermelha e a soma azul. Sinal sintético.
**Aplicações reais:**
- Áudio (MP3, streaming): o arquivo guarda quanto há de cada frequência; frequências que o ouvido mal percebe são descartadas → arquivo bem menor → o ouvido não nota a perda.
- Engenharia elétrica: analisar o ruído de 60 Hz da rede em um sinal de ECG → decompor em frequências isola o pico em 60 Hz → o médico recebe um traçado limpo.
- Sismologia: separar abalos rápidos de ondas lentas em um sismograma → cada tipo de onda ocupa uma faixa de frequência diferente.
**Erro comum:** Achar que Fourier só vale para sinais periódicos. Na prática, a DFT trata qualquer sinal finito como um período de um sinal que se repete.

### 2. Transformar, operar e voltar (reversibilidade)
**Em uma frase:** Uma transformada pode ser desfeita sem perder informação, então podemos ir ao domínio da frequência, filtrar e voltar ao domínio espacial.
**Analogia:** Traduzir um texto para outro idioma, editar lá e traduzir de volta. Falha: aqui a tradução é exata (matematicamente sem perdas); só o arredondamento do computador introduz erros minúsculos.
**Explicação aprofundada:** O diagrama do professor (Gonzalez & Woods) mostra: $f(x,y)$ (domínio espacial) → Transformada → $T[f](u,v)$ → operação $H$ → Transformada inversa → $g(x,y)$. Por quê? Alguns filtros são mais simples de pensar em frequência ("corte tudo acima de tal valor"). A característica essencial é a reversibilidade: sem alterar nada no meio, a imagem volta idêntica.
**Exemplo passo a passo:** Imagem 1D de 4 pixels $[1,2,3,4]$: FFT dá $[10,\,-2+2j,\,-2,\,-2-2j]$. O primeiro valor (10) é a soma de tudo. IFFT dá $[1,2,3,4]$ de volta.
**A fórmula traduzida:** $g = \mathcal{F}^{-1}\{H\cdot\mathcal{F}\{f\}\}$. $\mathcal F$ = vai para frequência; $H$ = o filtro (multiplica cada frequência por um peso); $\mathcal F^{-1}$ = volta.
**Figuras do professor:** `aulas-markdown/img/dominio-da-frequencia/p07-02.png` — diagrama de blocos "domínio espacial → transformada → operação → transformada inversa → domínio espacial"; observe que a operação acontece no meio, no domínio da transformada.
**Código:**
```python
import numpy as np
from skimage import data

img = data.camera().astype(float)        # foto real em tons de cinza
F = np.fft.fft2(img)                     # vai para o domínio da frequência
volta = np.fft.ifft2(F).real             # volta sem alterar nada
erro = np.abs(img - volta).max()         # maior diferença pixel a pixel
print("erro máximo:", erro)              # ~1e-12: reversível
```
A saída mostra um erro na ordem de $10^{-12}$: a imagem volta idêntica, só com ruído de arredondamento.
**Figura a gerar:** `reversibilidade.png` — original (camera) | espectro log | imagem reconstruída pela IFFT | mapa de diferença (praticamente preto).
**Aplicações reais:**
- Ressonância magnética: o aparelho mede o espectro (espaço k) e o computador aplica a transformada inversa para formar a imagem que o médico vê → só funciona porque a transformada é reversível.
- Restauração de fotos escaneadas com padrão de tela (moiré de impressão): apaga-se o pico periódico no espectro e volta-se à imagem → o padrão regular vira pontos isolados no espectro, fáceis de remover.
**Erro comum:** Imaginar que ir e voltar degrada a imagem. A perda só ocorre se você alterar o espectro (filtrar) ou arredondar para inteiros.

### 3. Transformada de Fourier contínua (FT) e inversa (IFT)
**Em uma frase:** A FT mede, para cada frequência $u$, o quanto dela existe na função; a IFT reconstrói a função a partir dessas medidas.
**Analogia:** Um equalizador gráfico de som: cada barra é "quanto de graves/agudos existe". Falha: a FT contínua tem infinitas barras, uma para cada $u$ real.
**Explicação aprofundada:** Para cada $u$, multiplicamos $f(x)$ por uma onda complexa $e^{-j2\pi u x}$ e somamos (integramos) tudo. Se $f$ "combina" com aquela frequência, o resultado é grande; se não, as partes positivas e negativas se cancelam e o resultado fica perto de zero. A IFT faz o caminho inverso com o sinal do expoente trocado.
**Exemplo passo a passo:** $f(x)=\cos(2\pi\cdot 3x)$. Testar $u=3$: as ondas "casam" a cada instante e a integral é grande. Testar $u=5$: $f$ e a onda de teste ficam ora em fase, ora fora; a soma cancela e dá ~0. Logo o espectro tem picos só em $u=\pm3$.
**A fórmula traduzida:**
$$F(u)=\int_{-\infty}^{\infty} f(x)\,e^{-j2\pi u x}\,dx \qquad f(x)=\int_{-\infty}^{\infty} F(u)\,e^{j2\pi u x}\,du$$
$f(x)$ = sinal original; $u$ = frequência testada; $j=\sqrt{-1}$; $e$ = número de Euler (2,71828...); $e^{-j2\pi ux}=\cos(2\pi ux)-j\sin(2\pi ux)$ = onda de teste; $\int$ = soma contínua de $-\infty$ a $+\infty$; o sinal "$-$" no expoente marca a ida, o "$+$" a volta.
**Figuras do professor:** `aulas-markdown/img/dominio-da-frequencia/p12-00.png` — pulso retangular e seu espectro em forma de função sinc; observe que um pulso estreito gera um espectro largo e cheio de lóbulos.
**Código:**
```python
import numpy as np
import matplotlib.pyplot as plt

fs = 100                                 # 100 amostras por segundo
t = np.arange(0, 2, 1/fs)                # 2 segundos de sinal
sinal = np.cos(2*np.pi*3*t) + 0.5*np.cos(2*np.pi*10*t)  # 3 Hz + 10 Hz
F = np.fft.fft(sinal)
freq = np.fft.fftfreq(len(t), d=1/fs)    # eixo de frequências em Hz
plt.subplot(1, 2, 1); plt.plot(t, sinal); plt.title("Domínio do tempo")
plt.subplot(1, 2, 2); plt.stem(freq[:len(t)//2], np.abs(F)[:len(t)//2])
plt.title("Espectro: picos em 3 e 10 Hz")
plt.savefig("ft-1d.png", dpi=120)
```
Observe dois picos: em 3 Hz (alto) e em 10 Hz (metade da altura, pois a amplitude é 0,5).
**Figura a gerar:** `ft-1d.png` — sinal sintético (3 Hz + 10 Hz) | espectro de magnitude com dois picos | pulso retangular e sua sinc.
**Aplicações reais:**
- Manutenção preditiva: vibração de um motor industrial é medida e o espectro revela um pico na frequência do rolamento defeituoso → detecta a falha semanas antes da quebra.
- Afinador de instrumentos (apps de celular): o app calcula o espectro do microfone e acha a frequência de maior pico → compara com a nota-alvo (ex.: 440 Hz para o Lá).
**Erro comum:** Confundir $u$ (frequência) com $x$ (posição). São eixos de domínios diferentes.

### 4. Número complexo, magnitude (espectro) e fase
**Em uma frase:** A FT de um sinal real é um número complexo $R+jI$; a magnitude diz "quanto" de cada frequência existe e a fase diz "onde" ela está.
**Analogia:** Para cada onda, a magnitude é o volume e a fase é o instante em que ela começa. Falha: dois sons com mesmo volume e fases diferentes parecem iguais ao ouvido, mas duas imagens com mesmo espectro e fases diferentes ficam completamente distintas.
**Explicação aprofundada:** Número complexo: parte real $R(u)$ e parte imaginária $I(u)$. Escrito em forma polar: $F(u)=|F(u)|\,e^{j\phi(u)}$. O **espectro de Fourier** $|F|=\sqrt{R^2+I^2}$ é o que se visualiza. A **fase** $\phi=\arctan(I/R)$ é menos usada para olhar, porque o domínio espacial já mostra "onde" as coisas estão, mas é indispensável para reconstruir a imagem: sem a fase, a IDFT não recupera nada reconhecível.
**Exemplo passo a passo:** $F=3+4j$ → $|F|=\sqrt{3^2+4^2}=5$; $\phi=\arctan(4/3)\approx 53{,}1^\circ$. Se $F=3-4j$, a magnitude continua 5 mas a fase muda para $-53{,}1^\circ$.
**A fórmula traduzida:** $F(u)=R(u)+jI(u)=|F(u)|e^{j\phi(u)}$ — $R$ = parte real; $I$ = parte imaginária; $|F|$ = amplitude (distância à origem no plano complexo); $\phi$ = ângulo da seta.
**Figuras do professor:** `aulas-markdown/img/dominio-da-frequencia/p13-00.png` — espectro de um retângulo visto em perspectiva 3D e como imagem; observe o pico central grande e os lóbulos laterais que diminuem.
**Código:**
```python
import numpy as np
from skimage import data

a = data.camera().astype(float)
b = data.astronaut()[..., :].mean(axis=2)[:512, :512]   # outra foto, cinza
b = np.resize(b, a.shape)
Fa, Fb = np.fft.fft2(a), np.fft.fft2(b)
# magnitude de A com fase de B, e vice-versa
mag_a_fase_b = np.fft.ifft2(np.abs(Fa) * np.exp(1j*np.angle(Fb))).real
mag_b_fase_a = np.fft.ifft2(np.abs(Fb) * np.exp(1j*np.angle(Fa))).real
```
Observe que cada resultado lembra a imagem que forneceu a fase, não a que forneceu a magnitude: a fase carrega a estrutura.
**Figura a gerar:** `magnitude-vs-fase.png` — camera | astronaut | magnitude(camera)+fase(astronaut) | magnitude(astronaut)+fase(camera).
**Aplicações reais:**
- Radar de abertura sintética (SAR) em satélites: o sensor registra amplitude e fase do eco → a fase permite medir deslocamento do solo de milímetros (monitoramento de deslizamentos e vulcões).
- Holografia digital: a imagem 3D é recuperada porque a fase guarda a profundidade → só a magnitude daria uma imagem plana.
**Erro comum:** Achar que o espectro (magnitude) basta para reconstruir a imagem. Sem a fase, não há como voltar.

### 5. A DFT 2D: a fórmula e o código do professor (laços manuais)
**Em uma frase:** Para cada frequência $(u,v)$ somamos todos os pixels da imagem, cada um multiplicado por uma onda $\cos-j\sin$ com ângulo que depende de $(u,v)$ e da posição do pixel.
**Analogia:** Testar a imagem com um "carimbo" de listras de cada espessura e inclinação: quanto a imagem se parece com aquele carimbo, maior o valor naquele ponto do espectro. Falha: o carimbo é complexo (par cosseno/seno) e a soma cobre a imagem inteira, não uma janela local.
**Explicação aprofundada:** Para uma imagem $M\times N$, o espectro também é $M\times N$. Cada ponto $(u,v)$ exige somar $M\cdot N$ termos; no total $(MN)^2$ operações. Para uma imagem 512x512 são cerca de $6{,}9\times10^{10}$ operações, por isso o código do professor é didático e lento. Usando $e^{-j\theta}=\cos\theta-j\sin\theta$, separamos real e imaginário: $R=\sum f\cos\theta$ e $I=-\sum f\sin\theta$. O ponto $(0,0)$ vale a soma de todos os pixels (componente DC, o brilho médio vezes $MN$).
**Exemplo passo a passo:** Imagem 2x2 $f=\begin{bmatrix}1&2\\3&4\end{bmatrix}$ ($M=N=2$). Para $(u,v)=(0,0)$: $\theta=0$ para todos, $R=1+2+3+4=10$, $I=0$. Para $(u,v)=(0,1)$: $\theta=\pi c$; $c=0\Rightarrow\cos=1$, $c=1\Rightarrow\cos=-1$. $R=1-2+3-4=-2$, $I=0$. Para $(1,0)$: $\theta=\pi r$, $R=1+2-3-4=-4$. Para $(1,1)$: $\theta=\pi(r+c)$, $R=1-2-3+4=0$. Espectro $\begin{bmatrix}10&-2\\-4&0\end{bmatrix}$ (confira com `np.fft.fft2`).
**A fórmula traduzida:**
$$\mathcal F(u,v)=\sum_{r=0}^{M-1}\sum_{c=0}^{N-1} f(r,c)\,e^{-j2\pi\left(\frac{ur}{M}+\frac{vc}{N}\right)},\quad \theta=2\pi\left(\frac{ur}{M}+\frac{vc}{N}\right)$$
$$R(u,v)=\sum\sum f(r,c)\cos\theta \qquad I(u,v)=-\sum\sum f(r,c)\sin\theta$$
$M$ = linhas (altura); $N$ = colunas (largura); $f(r,c)$ = brilho do pixel na linha $r$, coluna $c$; $(u,v)$ = frequência vertical e horizontal testada; $\theta$ = ângulo da onda de teste naquele pixel; os dois $\Sigma$ = percorrer todos os pixels.
**Figuras do professor:** `aulas-markdown/img/dominio-da-frequencia/p15-01.png` — fórmula da DFT 2D e definição de $\theta$; `aulas-markdown/img/dominio-da-frequencia/p15-03.png` — fórmula da parte real $R(u,v)$; `aulas-markdown/img/dominio-da-frequencia/p16-01.png` — resumo: DFT, $\theta$, Euler, $R$ e $I$ juntos; `aulas-markdown/img/dominio-da-frequencia/p16-02.png` — código `dft2d` do professor (transcrito abaixo); `aulas-markdown/img/dominio-da-frequencia/p14-00.png` — imagem de um retângulo branco, seu espectro e uma grade de valores; observe o espectro com lóbulos em cruz (largura do retângulo vira espaçamento no espectro).
**Código:**
```python
import math

def dft2d(image):
    M = len(image)                               # número de linhas
    N = len(image[0]) if M > 0 else 0            # número de colunas
    spectrum = [[0 for _ in range(N)] for _ in range(M)]   # matriz de saída
    for u in range(M):                           # para cada frequência vertical
        for v in range(N):                       # e cada frequência horizontal
            real_sum = 0.0
            imag_sum = 0.0
            for r in range(M):                   # somar todos os pixels
                for c in range(N):
                    theta = 2 * math.pi * ((u * r / M) + (v * c / N))
                    f_rc = image[r][c]           # valor do pixel
                    real_sum += f_rc * math.cos(theta)
                    imag_sum += f_rc * math.sin(theta)
            spectrum[u][v] = complex(real_sum, -imag_sum)  # R + j(-sum sen)
    return spectrum
```
São quatro laços aninhados: dois escolhem a frequência $(u,v)$ e dois percorrem os pixels $(r,c)$. A linha `complex(real_sum, -imag_sum)` guarda o sinal negativo da parte imaginária. A versão do mundo real é `np.fft.fft2(img)`, que usa o algoritmo FFT, com custo $O(MN\log MN)$ em vez de $O((MN)^2)$ (para 512x512: milissegundos contra horas).
```python
import numpy as np
img = np.array([[1, 2], [3, 4]], dtype=float)
print(np.round(dft2d(img)))      # confere com o exemplo à mão
print(np.fft.fft2(img))          # mesmo resultado, muito mais rápido
```
**Figura a gerar:** `dft-manual-vs-fft.png` — imagem 32x32 reduzida de camera | espectro pela `dft2d` manual | espectro pela `np.fft.fft2` | diferença (zero); mais um gráfico de tempo em escala log (manual vs FFT) para 16, 32, 64 pixels de lado.
**Aplicações reais:**
- JPEG (câmeras e celulares): a foto é cortada em blocos 8x8 e cada bloco passa por uma transformada da mesma família (DCT) → o espaço ocupado cai muito porque os coeficientes de alta frequência, que o olho nota pouco, são arredondados para zero.
- Processamento de imagens médicas (tomografia, ultrassom): filtros no espectro removem ruído de aquisição → o ruído está espalhado nas altas frequências, que podem ser atenuadas sem apagar as estruturas grandes.
- Inspeção industrial têxtil: detectar falha no tecido → o tecido bom tem espectro com picos regulares e uma falha quebra o padrão, sendo fácil de achar na frequência.
**Erro comum:** Esquecer o sinal negativo na parte imaginária (vem do $e^{-j\theta}$) ou confundir $M$ (linhas) com largura. Também: achar que o código manual serve para imagens grandes; é só didático.

### 6. Visualizando o espectro: magnitude, `shift` e escala log
**Em uma frase:** Para olhar o espectro calculamos a magnitude, movemos a frequência zero para o centro (`shift`) e aplicamos `log` para os valores pequenos aparecerem.
**Analogia:** Uma foto de céu noturno: a Lua é tão clara que as estrelas somem. O `log` é aumentar a exposição das regiões escuras. Falha: o `log` distorce as proporções; serve só para mostrar, nunca para filtrar.
**Explicação aprofundada:** Três ajustes. (a) **Magnitude**: $\sqrt{R^2+I^2}$ transforma cada número complexo num número real positivo. (b) **Shift**: a DFT coloca a frequência zero no canto superior esquerdo; o `shift` troca os quadrantes e leva a frequência zero ao centro, onde baixas frequências ficam perto do centro e altas nas bordas, e fica fácil desenhar filtros circulares. (c) **Log**: o valor DC (centro) é gigantesco comparado ao resto, então sem `log` só se vê um ponto branco. O `epsilon` evita calcular `log(0)`.
**Exemplo passo a passo:** Espectro 4x4 com índices: o pixel $(0,0)$ vai para $(2,2)$ ($u+M/2 \bmod M$), o $(1,1)$ vai para $(3,3)$, o $(2,2)$ para $(0,0)$. Magnitude de $3+4j$ é 5; `log(5)`$\approx1{,}61$; e `log(1000)`$\approx6{,}9$: uma razão de 200 vira uma razão de 4.
**A fórmula traduzida:** $|F|=\sqrt{R^2+I^2}$; $S=\log(|F|+\varepsilon)$. $R$, $I$ = partes real e imaginária; $\varepsilon$ = número minúsculo ($10^{-7}$) para nunca fazer $\log 0$; deslocamento $r=(u+M/2)\bmod M$ = deslocar meia imagem com volta ao início.
**Figuras do professor:** `aulas-markdown/img/dominio-da-frequencia/p19-00.png` — código `magnitude` e `shift` (transcrito abaixo); `aulas-markdown/img/dominio-da-frequencia/p20-00.png` — script que carrega a imagem e chama `dft2d`, `magnitude`, `shift`, `log` e `idft2d`; `aulas-markdown/img/dominio-da-frequencia/p20-01.png` — resultado: imagem, magnitude, magnitude deslocada, magnitude em log e imagem reconstruída; observe que só a versão deslocada em log mostra estrutura, e a última imagem é igual à primeira.
**Código:**
```python
import math

def magnitude(spectrum):
    M = len(spectrum)
    N = len(spectrum[0]) if M > 0 else 0
    magnitude = [[0 for _ in range(N)] for _ in range(M)]
    for u in range(M):
        for v in range(N):
            # módulo do número complexo: sqrt(real^2 + imag^2)
            magnitude[u][v] = math.sqrt(spectrum[u][v].real ** 2
                                        + spectrum[u][v].imag ** 2)
    return magnitude

def shift(spectrum):
    M = len(spectrum)
    N = len(spectrum[0]) if M > 0 else 0
    shifted = [[0 for _ in range(N)] for _ in range(M)]
    for u in range(M):
        for v in range(N):
            r = (u + M // 2) % M          # nova linha: desloca meia altura
            c = (v + M // 2) % M          # nova coluna (no slide usa M//2)
            shifted[r][c] = spectrum[u][v]
    return shifted
```
Na versão do slide a coluna também usa `M // 2`; o correto seria `N // 2` (ver Pontos de atenção). Equivalentes do NumPy, em três linhas:
```python
import numpy as np
from skimage import data
F = np.fft.fft2(data.camera().astype(float))
mag = np.abs(F)                                   # magnitude
mag_centrada = np.fft.fftshift(mag)               # frequência zero no centro
mag_log = np.log(mag_centrada + 1e-7)             # compressão logarítmica
```
Observe que `fftshift` faz o que o `shift` manual faz, mas em C, e o resultado em log mostra uma "estrela" brilhante no centro.
**Figura a gerar:** `visualizar-espectro.png` — camera | magnitude crua (quase tudo preto) | magnitude após fftshift | magnitude após fftshift + log.
**Aplicações reais:**
- Astronomia: analisar periodicidades em imagens de telescópio (ex.: padrão de ruído de leitura do sensor CCD) → picos fora do centro no espectro log denunciam o padrão.
- Controle de qualidade em impressão: detectar a "retícula" de impressão de uma revista → o espectro mostra um padrão de pontos regular que aponta a frequência da tela.
- Ensino/pesquisa: tornar visível a direção das texturas, pois listras verticais viram pontos horizontais no espectro (a direção gira 90 graus).
**Erro comum:** Filtrar o espectro log em vez do espectro de verdade. O `log` serve só para exibir.

### 7. A DFT inversa (IDFT) e a reconstrução
**Em uma frase:** A IDFT soma todas as ondas do espectro, com sinal de expoente trocado e divisão por $MN$, e devolve a imagem original.
**Analogia:** Seguir a receita ao contrário: o espectro lista os ingredientes (ondas) e a IDFT os mistura de volta no prato (imagem). Falha: se o cozinheiro (filtro) trocou ou removeu ingredientes, o prato muda.
**Explicação aprofundada:** A fórmula da IDFT é igual à da DFT com $e^{+j\theta}$ e o fator $1/(MN)$ (para compensar a soma). Como a imagem original é real, a parte imaginária da soma é zero (a menos de arredondamento), e o código do professor calcula só a parte real: $\mathrm{Re}\{(R+jI)(\cos\theta+j\sin\theta)\}=R\cos\theta-I\sin\theta$. Se você modificar o espectro (zerar frequências), o resultado é a imagem filtrada.
**Exemplo passo a passo:** Espectro $\begin{bmatrix}10&-2\\-4&0\end{bmatrix}$ do exemplo 2x2. Pixel $(0,0)$: todos os $\theta=0$, soma $=10-2-4+0=4$, dividir por $MN=4$ dá $1$. Pixel $(0,1)$: sinais $(+,-,+,-)$ para $(u,v)=(0,0),(0,1),(1,0),(1,1)$: $10+2-4-0=8$; $8/4=2$. Recuperamos 1 e 2.
**A fórmula traduzida:** $$f(r,c)=\frac{1}{MN}\sum_{u=0}^{M-1}\sum_{v=0}^{N-1}\mathcal F(u,v)\,e^{j2\pi\left(\frac{ur}{M}+\frac{vc}{N}\right)}$$ $\frac1{MN}$ = média; $\mathcal F(u,v)$ = peso da onda $(u,v)$; $e^{+j\theta}$ = a mesma onda, rodando no sentido contrário ao da DFT; $f(r,c)$ = pixel recuperado.
**Figuras do professor:** `aulas-markdown/img/dominio-da-frequencia/p17-01.png` e `aulas-markdown/img/dominio-da-frequencia/p18-01.png` — a fórmula da IDFT; observe o fator $1/MN$ e o expoente positivo. `aulas-markdown/img/dominio-da-frequencia/p18-02.png` — código `idft2d` (transcrito abaixo).
**Código:**
```python
import math

def idft2d(spectrum):
    M = len(spectrum)                   # (no slide aparece len(image); veja Pontos de atenção)
    N = len(spectrum[0]) if M > 0 else 0
    image = [[0 for _ in range(N)] for _ in range(M)]
    for r in range(M):                  # para cada pixel de saída
        for c in range(N):
            real_sum = 0.0
            for u in range(M):          # somar todas as frequências
                for v in range(N):
                    theta = 2 * math.pi * ((u * r / M) + (v * c / N))
                    f_uv = spectrum[u][v]
                    # parte real de (R + jI)(cos + j sen) = R cos - I sen
                    real_sum += f_uv.real * math.cos(theta) - f_uv.imag * math.sin(theta)
            image[r][c] = real_sum / (M * N)   # divide por M*N
    return image
```
Os laços estão trocados em relação à `dft2d`: aqui os externos percorrem pixels $(r,c)$ e os internos percorrem frequências $(u,v)$. A versão rápida: `np.fft.ifft2(F).real`. Teste:
```python
img = np.random.randint(0, 256, (8, 8)).astype(float)
rec = np.array(idft2d(dft2d(img.tolist())))
print(np.allclose(img, rec))        # True: DFT seguida da IDFT devolve a imagem
```
**Figura a gerar:** `idft-reconstrucao.png` — camera 64x64 | espectro log | reconstrução com todas as frequências | reconstrução usando só as 5% maiores magnitudes (borrada, mas reconhecível).
**Aplicações reais:**
- Tomografia computadorizada: o aparelho mede projeções (espectro em fatias) e a transformada inversa monta a imagem do corte → sem a inversa não há imagem.
- Compressão JPEG2000/vídeo: guardam só os coeficientes mais importantes e a decodificação aplica a transformada inversa → poucas frequências bastam para reconhecer a imagem.
- Super-resolução e deblurring de fotos de telescópio (Hubble): divide-se o espectro da imagem pelo da função de desfoque e aplica-se a IDFT → desfazer um borrão é uma divisão simples em frequência.
**Erro comum:** Esquecer o $1/(MN)$ e obter uma imagem $MN$ vezes mais brilhante; ou esquecer que a saída pode ter parte imaginária minúscula (use `.real`).

### 8. Dualidade: impulso, constante e "alargar vs. estreitar"
**Em uma frase:** O que é estreito num domínio é largo no outro: um impulso vira uma constante e uma constante vira um impulso.
**Analogia:** Uma sanfona: espremer de um lado estica do outro. Também: um estalar de dedos (curtíssimo) soa em todas as frequências; um tom puro (longo) ocupa uma frequência só. Falha: vale como tendência geral; os números exatos dependem da forma da função.
**Explicação aprofundada:** (a) Impulso (variação abrupta e localizada, como um ponto branco numa imagem preta) tem espectro constante: contém todas as frequências. (b) Constante (imagem uniforme, sem variação) tem espectro com só a frequência zero. (c) Se alargamos uma função no espaço, o espectro dela estreita, e vice-versa. Por isso uma imagem borrada (variações lentas) tem espectro concentrado no centro, e uma imagem nítida tem espectro espalhado.
**Exemplo passo a passo:**
| Domínio espacial | Espectro |
|---|---|
| 1 pixel branco | espalhado: todas as frequências |
| imagem toda cinza | 1 ponto no centro (DC) |
| quadrado pequeno | espectro largo |
| quadrado grande | espectro estreito |
**A fórmula traduzida:** Escalonamento: $f(ax)\ \longleftrightarrow\ \frac{1}{|a|}F(u/a)$. $a>1$ comprime $f$ no espaço, e o espectro $F(u/a)$ se alarga; $a<1$ faz o oposto. $\leftrightarrow$ = "tem como par de Fourier".
**Figuras do professor:** `aulas-markdown/img/dominio-da-frequencia/p21-06.png` e `p21-08.png` e `p21-09.png` (em `aulas-markdown/img/dominio-da-frequencia/`) — letra f (domínio espacial), $X[f]$ e uma linha vertical (impulso/constante): são pedaços do slide de dualidade; observe o par "impulso estreito ↔ constante larga". `aulas-markdown/img/dominio-da-frequencia/p22-03.png`, `p22-04.png`, `p22-07.png`, `p22-08.png`, `p22-09.png`, `p22-10.png` — letras $X[t]$/$t$ e curvas $X[f]$ em dois tamanhos: pedaços do slide "alargamento/estreitamento" (rótulos soltos; a página inteira é `aulas-markdown/img/dominio-da-frequencia/paginas/pag22.png`); `aulas-markdown/img/dominio-da-frequencia/p23-02.png` — três gaussianas de larguras diferentes e seus espectros; observe que a mais larga no espaço dá o espectro mais estreito.
**Código:**
```python
import numpy as np
import matplotlib.pyplot as plt

x = np.arange(-64, 64)
fig, eixos = plt.subplots(2, 3, figsize=(10, 5))
for i, sigma in enumerate([2, 6, 20]):             # gaussianas estreita -> larga
    g = np.exp(-x**2 / (2*sigma**2))
    G = np.abs(np.fft.fftshift(np.fft.fft(g)))
    eixos[0, i].plot(x, g);  eixos[0, i].set_title(f"espaço sigma={sigma}")
    eixos[1, i].plot(G);     eixos[1, i].set_title("espectro")
plt.savefig("dualidade.png", dpi=120)
```
Observe: quanto maior o `sigma` (mais larga no espaço), mais estreito o espectro.
**Figura a gerar:** `dualidade.png` — linha de cima: pixel branco / imagem cinza / quadrado pequeno / quadrado grande (sintéticas 128x128); linha de baixo: o espectro log de cada uma.
**Aplicações reais:**
- Fotografia/microscopia: a "função de espalhamento de ponto" (PSF) de uma lente: um ponto de luz vira um borrão; quanto maior o borrão, menos altas frequências passam → explica por que lente ruim perde detalhe fino.
- Radar e sonar: o pulso curto (impulso) tem banda larga e dá boa resolução de distância → por isso radares emitem pulsos muito curtos ou "chirps".
- Telecomunicações: um sinal curto no tempo ocupa muita banda; para economizar banda, se usam pulsos suaves.
**Erro comum:** Achar que "borrada" significa "espectro largo". É o contrário: borrar corta as altas frequências, e o espectro fica estreito.

### 9. Convolução no espaço = multiplicação na frequência
**Em uma frase:** Convoluir duas funções no domínio espacial equivale a multiplicar seus espectros, e vice-versa.
**Analogia:** Em vez de passar o carimbo (kernel) em cada pixel, multiplicamos duas tabelas ponto a ponto. É a diferença entre fazer contas com algarismos romanos e com decimais. Falha: o ganho só aparece quando o kernel é grande; para 3x3, o espacial costuma ser mais rápido.
**Explicação aprofundada:** O filtro espacial (média, Gauss, Sobel) é uma convolução $f*h$. No domínio da frequência vira $F\cdot H$: cada frequência é multiplicada por um peso. Isso permite desenhar o filtro diretamente em frequência (por exemplo, pesos 1 no centro e 0 fora) e unifica "filtrar" com "multiplicar". Também vale o inverso: multiplicar duas imagens no espaço = convolução dos espectros.
**Exemplo passo a passo:** Média móvel de 3 amostras sobre $[0,0,9,0,0]$ no espaço dá $[0,3,3,3,0]$. Em frequência: $F$ do sinal é larga; $H$ da média é um lóbulo estreito perto de zero; o produto $F\cdot H$ derruba as altas frequências, e a IFFT dá o mesmo $[0,3,3,3,0]$.
**A fórmula traduzida:** $f*h \ \longleftrightarrow\ F\cdot H$ e $f\cdot h\ \longleftrightarrow\ F*H$. $*$ = convolução (deslizar e somar); $\cdot$ = multiplicação ponto a ponto; $F,H$ = espectros de $f$ e $h$.
**Figuras do professor:** `aulas-markdown/img/dominio-da-frequencia/p24-02.png` — as quatro relações "se $x[t]\to X[f]$ e $h[t]\to H[f]$ então $x*h\to X\cdot H$"; `aulas-markdown/img/dominio-da-frequencia/p25-01.png` — (a) filtro passa-baixa, (b) um sinal, (c) convolução no espaço ao lado da multiplicação em frequência; observe que o espectro do resultado é o produto dos dois.
**Código:**
```python
import numpy as np
import cv2
from skimage import data

img = data.camera().astype(np.float32)
kernel = cv2.getGaussianKernel(15, 3)           # 1D de 15 pontos, sigma=3
kernel = kernel @ kernel.T                       # vira filtro 2D 15x15

# Caminho 1: convolução no domínio espacial
espacial = cv2.filter2D(img, -1, kernel, borderType=cv2.BORDER_WRAP)

# Caminho 2: multiplicação no domínio da frequência
H = np.fft.fft2(kernel, s=img.shape)            # preenche kernel com zeros até o tamanho da imagem
G = np.fft.fft2(img) * H
freq = np.fft.ifft2(G).real
freq = np.roll(freq, (-7, -7), axis=(0, 1))     # recentra (kernel 15x15 -> deslocamento 7)

print("diferença máxima:", np.abs(espacial - freq).max())   # ~1e-4
```
Observe que os dois caminhos dão a mesma imagem borrada (diferença desprezível), mas a frequência fica mais rápida quando o kernel é grande.
**Figura a gerar:** `convolucao-vs-multiplicacao.png` — camera | resultado da convolução espacial (Gauss) | resultado por multiplicação em frequência | espectro log do filtro H. Foto: camera.
**Aplicações reais:**
- Filtros de desfoque de fundo (modo retrato) com kernel grande: usar FFT torna o filtro muito mais rápido → em vez de milhões de somas por pixel, uma multiplicação.
- Astrofotografia: deconvolução de imagens de telescópio dividindo o espectro pelo da PSF → a convolução (borrão da atmosfera) vira multiplicação, e desfazer = dividir.
- Redes neurais de visão (CNN): algumas bibliotecas aceleram convoluções grandes via FFT → mesma matemática, menos operações.
**Erro comum:** Esquecer que a multiplicação em frequência é na verdade convolução circular; sem preenchimento (padding) com zeros, as bordas "vazam" para o lado oposto.

### 10. Filtros: passa-tudo, passa-baixa e passa-alta
**Em uma frase:** Um filtro no domínio da frequência é uma máscara que multiplica o espectro: passa-tudo deixa tudo, passa-baixa deixa só as frequências baixas (borra) e passa-alta deixa só as altas (realça detalhes).
**Analogia:** Uma peneira ou um equalizador: passa-baixa = cortar agudos (som abafado); passa-alta = cortar graves (som fino). Falha: no filtro ideal, o corte é brusco e gera ondulações ao redor das bordas (artefato de "ringing").
**Explicação aprofundada:** Passa-tudo: $H=1$ em todo lugar, logo $x[t]\cdot\delta[t]=x[t]$, e a imagem não muda. Passa-baixa ideal: $H(u,v)=1$ se a distância ao centro $D(u,v)\le D_0$ e 0 caso contrário. Quanto menor o raio $D_0$ (frequência de corte), mais borrada fica a imagem. Passa-alta: $H_{pa}=1-H_{pb}$. A imagem passa-baixa fica suave; a passa-alta fica com bordas e detalhes. No slide do carro (Gonzalez & Woods) o espectro mostra pontos fora do centro, que são padrões repetidos (ruído periódico) e podem ser removidos com um filtro que zera só esses pontos (notch).
**Exemplo passo a passo:** Imagem 512x512; centro $(256,256)$. Com $D_0=30$: pixel do espectro a distância 10 do centro → $H=1$ (passa); a distância 100 → $H=0$ (corta). Só 0,3% das frequências são preservadas, mas a imagem continua reconhecível, apenas borrada.
**A fórmula traduzida:** $G(u,v)=H(u,v)\,F(u,v)$; $H_{pb}(u,v)=\begin{cases}1 & D(u,v)\le D_0\\0 & D(u,v)>D_0\end{cases}$, $D=\sqrt{(u-M/2)^2+(v-N/2)^2}$. $G$ = espectro filtrado; $H$ = máscara; $D$ = distância ao centro do espectro; $D_0$ = raio de corte.
**Figuras do professor:** `aulas-markdown/img/dominio-da-frequencia/p26-01.png` e `p26-02.png` (em `aulas-markdown/img/dominio-da-frequencia/`) — filtro passa-tudo: $x[t]\cdot\delta[t]=x[t]$ e espectros; `aulas-markdown/img/dominio-da-frequencia/p27-01.png` — a mesma xícara de café com kernels médios 3x3, 5x5, 7x7 e 11x11; observe que quanto maior o kernel mais borrada (mais altas frequências cortadas); `aulas-markdown/img/dominio-da-frequencia/p28-01.png` — espectro com círculos brancos cada vez menores (frequência de corte) e a imagem filtrada correspondente; observe os "anéis" ao redor das bordas; `aulas-markdown/img/dominio-da-frequencia/p29-00.png` — foto de carro, espectro, padrão de pontos e imagem filtrada; `aulas-markdown/img/dominio-da-frequencia/p30-00.png` — foto, espectro, máscara circular e resultado.
**Código:**
```python
import numpy as np
from skimage import data

img = data.camera().astype(float)
M, N = img.shape
F = np.fft.fftshift(np.fft.fft2(img))               # espectro com zero no centro

u, v = np.ogrid[:M, :N]
D = np.sqrt((u - M/2)**2 + (v - N/2)**2)            # distância ao centro
passa_baixa = (D <= 30).astype(float)               # círculo D0 = 30
passa_alta = 1 - passa_baixa                        # complemento

def aplicar(H):
    G = F * H                                       # multiplica o espectro pela máscara
    return np.fft.ifft2(np.fft.ifftshift(G)).real   # desfaz shift e volta ao espaço

img_pb, img_pa = aplicar(passa_baixa), aplicar(passa_alta)
```
Observe que `img_pb` é borrada com "ondas" ao redor das bordas, e `img_pa` mostra só contornos.
**Figura a gerar:** `filtros-frequencia.png` — original (camera) | espectro log | passa-baixa D0=30 | passa-alta D0=30. Uma segunda linha opcional com D0 = 10, 30, 80 em passa-baixa.
**Aplicações reais:**
- Câmeras de celular (modo retrato/noite): reduzir ruído de sensor em baixa luz → o ruído é detalhe fino (alta frequência), então um passa-baixa o atenua.
- Fotografia de documentos e satélite: remover linhas horizontais periódicas de escaneamento → pontos isolados no espectro são zerados (filtro notch) e a imagem volta sem as listras.
- Realce de bordas em imagens de raio-X: o passa-alta destaca fraturas finas → fratura é variação abrupta, ou seja, alta frequência.
**Erro comum:** Achar que o filtro ideal é o melhor. O corte brusco gera ringing (ondulações); por isso se usam filtros suaves como Gaussiano ou Butterworth.

### 11. Amostragem e quantização
**Em uma frase:** Para o computador processar uma função contínua, medimos seu valor em intervalos regulares $\Delta T$ (amostragem) e arredondamos cada valor para níveis fixos (quantização).
**Analogia:** Filmar uma cena: amostragem = quantos quadros por segundo; quantização = quantas cores diferentes cada quadro pode ter. Falha: numa foto, o "tempo" é o espaço, ou seja, a amostragem é quantos pixels por centímetro.
**Explicação aprofundada:** Amostrar equivale a multiplicar a função por um trem de impulsos espaçados de $\Delta T$. Pela dualidade, no espectro isso cria cópias repetidas do espectro original, espaçadas de $1/\Delta T$. O intervalo $\Delta T$ pequeno separa bem as cópias; $\Delta T$ grande as aproxima e elas se sobrepõem. Três situações: **sobreamostragem** (cópias bem separadas, $\Delta T$ pequeno), **amostragem crítica** (cópias encostadas, frequência de Nyquist) e **subamostragem** (cópias sobrepostas, informação perdida).
**Exemplo passo a passo:** Sinal com frequência máxima 10 Hz. $\Delta T=0{,}01\,\text{s}$ (100 amostras/s): cópias a cada 100 Hz, sem sobreposição. $\Delta T=0{,}05\,\text{s}$ (20 amostras/s): cópias a cada 20 Hz = exatamente 2·10 Hz, situação crítica. $\Delta T=0{,}1\,\text{s}$ (10 amostras/s): cópias a cada 10 Hz, sobrepõem.
| $\Delta T$ | taxa | espaçamento das cópias | situação |
|---|---|---|---|
| 0,01 s | 100 Hz | 100 Hz | sobreamostragem |
| 0,05 s | 20 Hz | 20 Hz | crítica |
| 0,1 s | 10 Hz | 10 Hz | subamostragem |
**A fórmula traduzida:** Espaçamento das cópias $=\dfrac{1}{\Delta T}$. $\Delta T$ = intervalo entre amostras; $1/\Delta T$ = taxa de amostragem (amostras por unidade).
**Figuras do professor:** `aulas-markdown/img/dominio-da-frequencia/p32-00.png` — (a) função contínua, (b) trem de impulsos, (c) função amostrada, (d) amostras quantizadas; observe os pontos retirados da curva em intervalos iguais. `aulas-markdown/img/dominio-da-frequencia/p34-00.png` — espectro e suas cópias para sobreamostragem, amostragem crítica e subamostragem; observe as cópias encostando e depois se sobrepondo.
**Código:**
```python
import numpy as np
import matplotlib.pyplot as plt

t = np.linspace(0, 1, 2000)                    # "quase contínuo"
sinal = np.sin(2*np.pi*5*t)                    # 5 Hz
fig, eixos = plt.subplots(1, 3, figsize=(12, 3))
for ax, fs in zip(eixos, [50, 12, 6]):         # sobre, perto do limite, sub
    ta = np.arange(0, 1, 1/fs)                 # instantes de amostragem
    xa = np.sin(2*np.pi*5*ta)                  # valores amostrados
    xq = np.round(xa * 3) / 3                  # quantização em 7 níveis
    ax.plot(t, sinal, 'lightgray'); ax.stem(ta, xq)
    ax.set_title(f"{fs} amostras/s")
plt.savefig("amostragem.png", dpi=120)
```
Observe que com 50 amostras/s a onda se reconhece; com 12, ainda; com 6 (abaixo do dobro de 5 Hz) os pontos parecem formar uma onda mais lenta.
**Figura a gerar:** `amostragem-quantizacao.png` — onda de 5 Hz amostrada a 50, 12 e 6 amostras/s | foto camera com 256, 16 e 4 níveis de cinza (quantização).
**Aplicações reais:**
- Áudio de CD (44,1 kHz): o ouvido humano chega a ~20 kHz, e 44,1 kHz > 2·20 kHz → toda a faixa audível é capturada sem aliasing.
- Câmeras de celular: o sensor tem um número finito de pixels (amostragem espacial) e 8 a 10 bits por canal (quantização) → mais megapixels = mais detalhe fino registrável.
- Telefonia: voz amostrada a 8 kHz porque a voz inteligível chega a ~4 kHz → o dobro do mais alto basta e economiza banda.
**Erro comum:** Confundir amostragem (quantos pontos) com quantização (quantos níveis de valor).

### 12. Teorema da amostragem e taxa de Nyquist
**Em uma frase:** Uma função de banda limitada pode ser recuperada exatamente se amostrada a uma taxa maior que o dobro de sua maior frequência.
**Analogia:** Para ver uma roda girando sem enganos, a câmera precisa tirar pelo menos duas fotos por volta. Falha: o teorema supõe sinal de banda limitada e amostras infinitas, algo que na prática só se aproxima.
**Explicação aprofundada:** **Função de banda limitada** é aquela cuja FT é zero fora de um intervalo $[-\mu_{max},\,\mu_{max}]$ (só tem frequências até um teto). As cópias do espectro estão espaçadas $1/\Delta T$ e cada uma ocupa largura $2\mu_{max}$; para não se tocarem, $1/\Delta T>2\mu_{max}$. Quando isso vale, um filtro passa-baixa isola uma cópia e reconstrói o sinal original.
**Exemplo passo a passo:** Música com frequência máxima 15 kHz. Taxa mínima: $2\times15=30$ kHz; $\Delta T<1/30000\approx33\,\mu s$. Com 44,1 kHz, cabe com folga.
**A fórmula traduzida:** $$\frac{1}{\Delta T}>2\mu_{max}\quad\Longleftrightarrow\quad \Delta T<\frac{1}{2\mu_{max}}$$ $\Delta T$ = intervalo entre amostras; $\mu_{max}$ = maior frequência do sinal; $2\mu_{max}$ = taxa de Nyquist. (No slide aparece escrito como $\frac{1}{2\Delta T}>\mu_{max}$, que é a mesma condição.)
**Figuras do professor:** `aulas-markdown/img/dominio-da-frequencia/p36-00.png` — (a) espectro triangular de função de banda limitada e (b) espectro após amostragem crítica, com cópias encostadas; observe os triângulos com bases tocando. `aulas-markdown/img/dominio-da-frequencia/p39-00.png` — cópias do espectro separadas e um filtro passa-baixa (retângulo) isolando uma só; `aulas-markdown/img/dominio-da-frequencia/p40-00.png` — mesma ideia com a função recuperada: o filtro isola uma cópia e a IFT devolve o sinal original.
**Código:**
```python
import numpy as np
import matplotlib.pyplot as plt

f_sinal = 5                                    # Hz
tf = np.linspace(0, 1, 1000)
fig, eixos = plt.subplots(1, 2, figsize=(10, 3))
for ax, fs in zip(eixos, [30, 8]):             # acima e abaixo de 2*5 = 10 Hz
    ta = np.arange(0, 1, 1/fs)
    xa = np.sin(2*np.pi*f_sinal*ta)
    # reconstrução ideal por sinc: soma de sincs centradas em cada amostra
    rec = sum(x * np.sinc((tf - t0) * fs) for x, t0 in zip(xa, ta))
    ax.plot(tf, np.sin(2*np.pi*f_sinal*tf), 'lightgray', label="original")
    ax.plot(tf, rec, 'b', label="reconstruído"); ax.plot(ta, xa, 'ro')
    ax.set_title(f"fs={fs} Hz ({'ok' if fs > 2*f_sinal else 'abaixo de Nyquist'})")
plt.savefig("nyquist.png", dpi=120)
```
Observe que com 30 Hz a curva reconstruída cola no original; com 8 Hz (< 10 Hz), a reconstrução é uma onda mais lenta que não existia.
**Figura a gerar:** `nyquist.png` — dois painéis: reconstrução com fs=30 Hz (fiel) | fs=8 Hz (falsa); mais um esquema do espectro com cópias separadas e sobrepostas (sintético).
**Aplicações reais:**
- Música digital: 44,1 kHz foi escolhido por ser maior que 2 vezes 20 kHz → o ouvido não percebe diferença entre original e reconstrução.
- Escolha de resolução de sensor em microscopia: a resolução do pixel precisa ser menor que metade do menor detalhe de interesse → senão o detalhe não pode ser recuperado.
- Osciloscópios digitais: taxa de amostragem 5 a 10 vezes a banda anunciada → garantir que o sinal medido reflita o real.
**Erro comum:** Achar que amostrar exatamente a 2$\mu_{max}$ garante tudo. O teorema pede estritamente maior; na amostragem crítica ainda pode haver ambiguidade (por exemplo, amostrar um seno nos seus zeros).

### 13. Aliasing (subamostragem)
**Em uma frase:** Aliasing ocorre quando a amostragem é lenta demais: frequências altas se disfarçam de frequências baixas que não existiam.
**Analogia:** O efeito roda de carroça em filmes: as rodas parecem girar devagar ou para trás porque a câmera tira poucas fotos por volta. Falha: aqui o "disfarce" é matemático e ocorre também no espaço, não só no tempo.
**Explicação aprofundada:** Na subamostragem as cópias do espectro se sobrepõem e não dá mais para isolar uma. O resultado é irreversível. Duas formas em imagens: **aliasing temporal** (intervalo grande entre quadros: roda de carroça) e **aliasing espacial** (poucos pixels: serrilhado/"jaggies", saliências falsas e padrões moiré que não existiam na imagem). É inevitável em sinais finitos, pois limitar a duração insere componentes de alta frequência extras.
**Exemplo passo a passo:** Onda de 9 Hz amostrada a 10 amostras/s (abaixo dos 18 exigidos). A frequência aparente é $|9-10|=1$ Hz: parece uma onda lenta de 1 Hz. Fórmula prática: $f_{aparente}=|f-k\cdot f_s|$, escolhendo o inteiro $k$ mais próximo.
**A fórmula traduzida:** $f_{ap}=|f-k f_s|$. $f$ = frequência real; $f_s$ = taxa de amostragem; $k$ = inteiro que deixa o resultado entre 0 e $f_s/2$; $f_{ap}$ = frequência falsa observada.
**Figuras do professor:** `aulas-markdown/img/dominio-da-frequencia/p38-04.png` — foto de um castelo de tijolos com padrões moiré (listras falsas) nas paredes; observe as faixas onduladas que não existem na parede real. `aulas-markdown/img/dominio-da-frequencia/p42-00.png` — seno de alta frequência e amostras (pontos pretos) que parecem formar um seno de baixa frequência; observe a onda lenta passando pelos pontos. (`aulas-markdown/img/dominio-da-frequencia/p39-00.png` e `p40-00.png` complementam: espectros sobrepostos.)
**Código:**
```python
import numpy as np
import matplotlib.pyplot as plt

t = np.linspace(0, 1, 2000)
real = np.sin(2*np.pi*9*t)                      # sinal verdadeiro: 9 Hz
fs = 10                                         # amostras/s (deveria ser > 18)
ta = np.arange(0, 1, 1/fs)
amostras = np.sin(2*np.pi*9*ta)
falso = -np.sin(2*np.pi*1*t)                    # 9 Hz aparece como 1 Hz (fase invertida)
plt.plot(t, real, 'lightgray'); plt.plot(ta, amostras, 'ko')
plt.plot(t, falso, 'r--'); plt.title("9 Hz amostrado a 10/s parece 1 Hz")
plt.savefig("aliasing.png", dpi=120)
```
Observe que os pontos pretos ficam exatamente sobre a onda lenta vermelha, que é falsa.
**Figura a gerar:** `aliasing.png` — sinal de 9 Hz com amostras a 10/s e onda falsa de 1 Hz | imagem `brick` ou `checkerboard` reduzida sem filtro mostrando moiré/serrilhado.
**Aplicações reais:**
- Cinema e TV: câmera filma hélice de helicóptero ou roda de carro e parece girar ao contrário → o intervalo entre quadros é longo demais para a velocidade de rotação.
- Fotografia de tecidos e telas: camisa listrada em vídeo gera moiré porque o padrão fino do tecido é mais fino que o pixel do sensor → emissoras pedem aos apresentadores que evitem listras finas.
- Jogos 3D: bordas serrilhadas e texturas cintilantes ao longe → pouca amostragem por pixel, resolvido com MSAA/antialiasing.
**Erro comum:** Tentar remover aliasing depois da amostragem. Depois que as cópias se sobrepõem, não há como separar; é preciso prevenir antes.

### 14. Antialiasing e reamostragem de imagens
**Em uma frase:** Antialiasing é aplicar um passa-baixa (borrar) antes de reduzir a amostragem, para tirar as frequências que seriam mal interpretadas.
**Analogia:** Antes de resumir um livro em 10 linhas, você tira os detalhes pequenos; se só pular linhas ao acaso, o resumo sai sem sentido. Falha: o borrão custa nitidez, é uma troca (trade-off).
**Explicação aprofundada:** Redimensionar muda a taxa de amostragem. **Ampliar** é sobreamostrar (sem aliasing). **Reduzir** é subamostrar (aliasing possível). Com **vizinho mais próximo**, reduzir 50% é excluir uma linha sim e outra não, e uma coluna sim e outra não; ampliar 50% [sic: dobrar] é duplicar linhas e colunas. Excluir sem borrar antes gera serrilhado e moiré. A solução do professor: antes da reamostragem, atenuar altas frequências com passa-baixa; o resultado fica um pouco menos nítido, mas fiel.
**Exemplo passo a passo:** Linha de pixels $[0,255,0,255,0,255,0,255]$ (listras finas). Reduzir a 50% pegando 1 sim, 1 não: $[0,0,0,0]$, tudo preto, a listra sumiu (ou, pegando as posições ímpares, tudo branco). Com média antes: $[127,127,127,127]$, cinza correto, fiel ao brilho médio.
**A fórmula traduzida:** Reduzir por fator $k$: manter pixels $f(kr,kc)$. Antes, $g=f*h_{pb}$ (convolução com passa-baixa, equivale a $G=F\cdot H_{pb}$). $k$ = fator de redução; $h_{pb}$ = kernel passa-baixa (média/Gauss).
**Figuras do professor:** `aulas-markdown/img/dominio-da-frequencia/p50-01.png` — diagrama: entrada 256x256 → subamostra direta 128x128 (com aliasing) versus entrada → filtrada (passa-baixa) → subamostra 128x128 (sem aliasing); observe o rótulo "Insufficient sampling, hence aliasing" contra "Pre-filtering reduces frequency content".
**Código:**
```python
import cv2
from skimage import data

img = data.brick()                                  # textura com detalhe fino
# Sem antialiasing: pega 1 pixel a cada 4 (vizinho mais próximo)
ruim = cv2.resize(img, None, fx=0.25, fy=0.25, interpolation=cv2.INTER_NEAREST)
# Com antialiasing: borra antes de reduzir
borrada = cv2.GaussianBlur(img, (0, 0), sigmaX=2)   # passa-baixa Gaussiano
bom = cv2.resize(borrada, None, fx=0.25, fy=0.25, interpolation=cv2.INTER_NEAREST)
# Atalho do OpenCV: INTER_AREA já faz média de blocos (antialiasing embutido)
bom2 = cv2.resize(img, None, fx=0.25, fy=0.25, interpolation=cv2.INTER_AREA)
```
Observe que `ruim` tem padrões falsos e serrilhado, enquanto `bom` e `bom2` ficam suaves e fiéis.
**Figura a gerar:** `antialiasing.png` — original (brick) | reduzida 4x sem filtro (aliasing) | reduzida 4x com Gauss antes | espectros log correspondentes. Alternativa: checkerboard com listras finas.
**Aplicações reais:**
- Miniaturas de fotos (galeria do celular, Google Fotos): ao gerar a prévia pequena aplica-se filtro antes de reduzir → evita moiré em roupas listradas e telhados.
- Mapas digitais (Google Maps): em zoom longe, as ruas finas são suavizadas antes de reduzir a resolução → senão os traços cintilariam ao rolar o mapa.
- Placas de vídeo (jogos): mipmaps (versões pré-filtradas de texturas) → a textura distante é usada já suavizada, eliminando o cintilar.
**Erro comum:** Usar vizinho mais próximo para reduzir uma imagem com detalhe fino (como `cv2.INTER_NEAREST`). Para reduzir, use `INTER_AREA` ou borre antes.

## Glossário
- **Domínio espacial**: a imagem vista como pixels em posições (linha, coluna).
- **Domínio da frequência**: a imagem vista como quantidade de cada onda (frequência) que a compõe.
- **Série de Fourier**: soma de senos/cossenos que reconstrói uma função periódica.
- **Transformada de Fourier (FT)**: ferramenta que mede o quanto de cada frequência existe numa função.
- **DFT**: Transformada de Fourier Discreta, para sinais amostrados; FFT é o algoritmo rápido que a calcula.
- **IFT / IDFT**: transformada inversa; volta do espectro à função/imagem.
- **Número complexo**: $R+jI$, com $j=\sqrt{-1}$.
- **Magnitude (espectro de Fourier)**: $\sqrt{R^2+I^2}$; quanto há de cada frequência.
- **Fase**: ângulo $\phi$ do número complexo; onde a onda começa.
- **Frequência baixa / alta**: variação lenta (áreas suaves) / rápida (bordas, ruído, textura fina).
- **Componente DC**: frequência zero; brilho médio.
- **fftshift**: troca quadrantes para levar a frequência zero ao centro.
- **Dualidade**: estreito num domínio = largo no outro.
- **Passa-baixa / passa-alta / passa-tudo**: filtros que deixam passar frequências baixas / altas / todas.
- **Frequência de corte ($D_0$)**: raio a partir do qual o filtro corta.
- **Ringing**: ondulações ao redor das bordas causadas por corte brusco no espectro.
- **Amostragem**: medir a função em intervalos $\Delta T$.
- **Quantização**: arredondar cada amostra para um conjunto finito de níveis.
- **Função de banda limitada**: FT é zero fora de uma faixa finita de frequências.
- **Taxa de Nyquist**: o dobro da maior frequência do sinal.
- **Aliasing**: frequências altas se passam por baixas devido à subamostragem.
- **Antialiasing**: borrar (passa-baixa) antes de reduzir a amostragem.
- **Moiré**: padrão de ondas falso que aparece por aliasing espacial.
- **Reamostragem**: mudar o número de pixels (ampliar/reduzir).

## Conexões
- Anteriores: imagem como matriz, filtros espaciais e convolução (média, Gauss, Sobel) são o "outro lado" desta aula: aqui vemos que a convolução é multiplicação em frequência e que Gauss é um passa-baixa, Sobel/Laplaciano são passa-alta. Amostragem e quantização da aula de imagem digital ganham o teorema de Nyquist.
- Próximas: compressão (JPEG usa DCT, parente da DFT), transformações geométricas (reamostragem e interpolação precisam de antialiasing), detecção de bordas e características (alta frequência), e CNNs (convolução aprendida; ver o resultado como filtros em frequência).
- Mundo real: ressonância e tomografia (reconstrução por transformada inversa), áudio digital, redes sem fio (OFDM de Wi-Fi/4G/5G usa FFT), codecs de vídeo e jogos (mipmaps, MSAA).

## Revisão rápida
- Toda função (e imagem) é soma de ondas; baixa frequência = áreas suaves, alta = bordas/ruído/detalhe.
- A transformada é reversível: DFT seguida de IDFT devolve a imagem (sem perda, a menos de arredondamento).
- DFT 2D: $\mathcal F(u,v)=\sum\sum f(r,c)e^{-j2\pi(ur/M+vc/N)}$; IDFT usa $e^{+j\ldots}$ e $1/(MN)$.
- O código manual tem 4 laços e custa $(MN)^2$; na prática use `np.fft.fft2` (FFT, $MN\log MN$).
- Espectro = magnitude $\sqrt{R^2+I^2}$; fase guarda a estrutura. Para ver: `fftshift` + `log`.
- Convolução no espaço = multiplicação na frequência; filtrar é multiplicar o espectro por uma máscara.
- Passa-baixa borra; passa-alta realça bordas; $H_{pa}=1-H_{pb}$; corte brusco causa ringing.
- Dualidade: impulso ↔ constante; alargar num domínio = estreitar no outro.
- Nyquist: amostrar a mais que $2\mu_{max}$; abaixo disso ocorre aliasing (irreversível).
- Antialiasing: passa-baixa antes de reduzir a imagem; vizinho mais próximo sem filtro gera serrilhado/moiré.

## Pontos de atenção
- No código `idft2d` do slide (p.18), as linhas 2 e 3 usam `len(image)` e `image[0]`, mas `image` ainda não existe: deveria ser `len(spectrum)` e `spectrum[0]`. Corrigido na transcrição.
- No código `shift` do slide (p.19), a linha da coluna usa `M // 2`; o correto para imagens não quadradas é `N // 2`. Como a imagem do exemplo é quadrada, funciona.
- O código `dft2d` escreve `complex(real_sum, -imag_sum)`; isso está correto (sinal vem de $e^{-j\theta}$) mesmo que pareça estranho.
- No slide de amostragem, a condição aparece como "$\frac{1}{2\Delta T}>\mu_{max}$ ou $\Delta T>\frac{1}{2\mu_{max}}$"; a segunda forma, como extraída do PDF, tem o sentido da desigualdade invertido: o correto é $\Delta T<\frac{1}{2\mu_{max}}$ (intervalo pequeno para taxa alta).
- "Aumentar a imagem em 50%" no slide é descrito como duplicar linhas e colunas, o que na verdade é aumentar 100% (dobrar). Mantido o sentido, mas o número é impreciso.
- Os slides de dualidade (p.21 e p.22) chegaram da conversão como letras e curvas soltas; a descrição segue o texto do slide. As últimas páginas (p.51) são só a licença CC BY-SA 4.0, sem conteúdo.
- O slide 28 (Gonzalez & Woods) usa o termo "ideal" para o passa-baixa; filtros Butterworth/Gaussiano não foram apresentados, só citados aqui como alternativa.
