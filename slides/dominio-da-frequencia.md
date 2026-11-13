# Domínio da Frequência

Ver a imagem como uma **receita de ondas**

![](aulas-markdown/img/dominio-da-frequencia/p20-01.png)

Note:
Aula sobre Fourier aplicado a imagens: espectro, filtros, amostragem, Nyquist e aliasing.

---

## O que vamos aprender

<div class="cols"><div>

- Imagem = soma de ondas (Fourier)
- Ir ao espectro, filtrar e voltar
- DFT 2D: fórmula e código com laços
- Ver o espectro: `fftshift` + `log`
- Convolução vira multiplicação
- Passa-baixa, passa-alta, amostragem, Nyquist, aliasing

</div><div>

![](figuras/dominio-da-frequencia/filtros-frequencia.png)

</div></div>

> Onde isso aparece: JPEG, ressonância magnética, MP3, miniaturas de fotos, jogos 3D.

Note:
Pré-requisitos: imagem como matriz, convolução/filtros espaciais, noção de seno e cosseno.

---

## Pré-requisitos

- Imagem como matriz de pixels (0 a 255)
- Convolução e filtros espaciais (média, Gauss, Sobel)
- Seno e cosseno: onda com frequência e amplitude
- Números complexos: só o básico, explicamos no caminho

> Até agora: imagem = grade de pixels (**domínio espacial**). Hoje: imagem = receita de ondas (**domínio da frequência**).

---

## 1. Série de Fourier: tudo é soma de ondas

<div class="cols"><div>

- Fourier (1807): todo sinal periódico = soma de senos e cossenos
- Onda lenta = **baixa frequência** (tom geral)
- Onda rápida = **alta frequência** (detalhe, borda, ruído)

> Um acorde de piano é a soma de notas puras. A imagem é o acorde; Fourier lista as notas.

</div><div>

![](aulas-markdown/img/dominio-da-frequencia/p05-00.png)

</div></div>

Note:
Onde a analogia falha: numa imagem as "notas" são padrões de listras 2D, e a imagem não precisa ser periódica (a DFT a trata como repetida).

---

## Veja acontecer: onda quadrada

![](figuras/dominio-da-frequencia/serie-fourier-quadrada.png)

Observe: com 10 senos os cantos ficam nítidos, mas sobra a "orelha" de Gibbs nos degraus.

--

## Onda quadrada: o professor

![](aulas-markdown/img/dominio-da-frequencia/p06-00.png)

Observe os cantos ficando mais retos conforme entram mais senos (1, 3, 5...).

--

## A fórmula traduzida

$$f(x)=\sum_k a_k\,\sin(2\pi k x + \varphi_k)$$

- $f(x)$ = valor do sinal na posição $x$
- $\sum$ = some todas as ondas
- $k$ = qual frequência; $a_k$ = quanto entra; $\varphi_k$ = onde a onda começa

| Termos somados | Aparência |
|---|---|
| 1 ($\sin x$) | onda suave, sem cantos |
| 2 ($+\tfrac13\sin 3x$) | topo mais achatado |
| 3 ($+\tfrac15\sin 5x$) | quase degrau, com "orelhas" |

--

## Código: somando senos

<div class="cols"><div>

```python
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(0, 2*np.pi, 1000)
quadrada = np.sign(np.sin(x))   # alvo
soma = np.zeros_like(x)
fig, eixos = plt.subplots(1, 4, figsize=(14, 3))
for ax, n_termos in zip(eixos, [1, 2, 3, 10]):
    soma[:] = 0
    for k in range(n_termos):
        h = 2*k + 1             # harmônicos ímpares
        soma += (4/np.pi) * np.sin(h*x) / h
    ax.plot(x, quadrada, 'r', lw=1)  # alvo: vermelho
    ax.plot(x, soma, 'b')            # aproximação: azul
    ax.set_title(f"{n_termos} senos")
plt.savefig("fourier-quadrada.png", dpi=120)
```

</div><div>

![](figuras/dominio-da-frequencia/serie-fourier-quadrada.png)

</div></div>

--

## No mundo real: Fourier em sinais

- **Áudio (MP3):** guarda quanto há de cada frequência e descarta as que o ouvido mal percebe, e o arquivo encolhe sem você notar
- **ECG:** o ruído de 60 Hz da rede aparece como um pico isolado, que é removido e o médico recebe um traçado limpo
- **Sismologia:** abalos rápidos e ondas lentas ocupam faixas de frequência diferentes

> Erro comum: achar que Fourier só vale para sinais periódicos. A DFT trata qualquer sinal finito como um período que se repete.

---

## 2. Transformar, operar e voltar

<div class="cols"><div>

- Transformada **reversível**: sem perda
- Ciclo: espaço → transformada → operação $H$ → inversa → espaço
- Alguns filtros são mais simples em frequência

> Traduzir um texto, editar no outro idioma e traduzir de volta.

</div><div>

![](aulas-markdown/img/dominio-da-frequencia/p07-02.png)

</div></div>

---

## Veja acontecer: ir e voltar

![](figuras/dominio-da-frequencia/reversibilidade.png)

Observe: a diferença é preta (erro ~1e-12). A imagem volta idêntica.

---

## Fórmula e exemplo à mão

$$g = \mathcal{F}^{-1}\{H\cdot\mathcal{F}\{f\}\}$$

- $\mathcal F$ = vai para a frequência; $H$ = filtro (um peso por frequência); $\mathcal F^{-1}$ = volta

Imagem 1D $[1,2,3,4]$: a FFT dá $[10,\,-2+2j,\,-2,\,-2-2j]$. O primeiro valor (10) é a soma de tudo. A IFFT devolve $[1,2,3,4]$.

---

## Código: prova de reversibilidade

<div class="cols"><div>

```python
import numpy as np
from skimage import data

img = data.camera().astype(float)
F = np.fft.fft2(img)        # vai à frequência
volta = np.fft.ifft2(F).real # volta sem alterar
erro = np.abs(img - volta).max()
print("erro máximo:", erro)  # ~1e-12
```

</div><div>

![](figuras/dominio-da-frequencia/reversibilidade.png)

</div></div>

---

## No mundo real: reversibilidade

- **Ressonância magnética:** o aparelho mede o espectro (espaço k) e a transformada inversa forma a imagem do médico
- **Fotos escaneadas com moiré de impressão:** o padrão vira pontos no espectro; apaga-se o pico e volta-se à imagem limpa

> Erro comum: achar que ir e voltar degrada. A perda vem só de filtrar ou arredondar.

---

## 3. Transformada de Fourier contínua

<div class="cols"><div>

- Para cada frequência $u$: "quanto dela existe?"
- Multiplica $f(x)$ por uma onda de teste e soma
- Casou: resultado grande. Não casou: cancela, ~0

> Um equalizador gráfico: cada barra é quanto de graves/agudos existe.

</div><div>

![](aulas-markdown/img/dominio-da-frequencia/p12-00.png)

</div></div>

Note:
Pulso estreito gera espectro largo com lóbulos (sinc). A FT contínua tem infinitas barras.

---

## Veja acontecer: dois picos

![](figuras/dominio-da-frequencia/ft-1d.png)

Observe: 3 Hz + 10 Hz vira dois picos, o de 10 Hz com metade da altura (amplitude 0,5).

---

## Fórmula traduzida

$$F(u)=\int_{-\infty}^{\infty} f(x)\,e^{-j2\pi u x}\,dx \qquad f(x)=\int_{-\infty}^{\infty} F(u)\,e^{j2\pi u x}\,du$$

- $u$ = frequência testada; $j=\sqrt{-1}$
- $e^{-j2\pi ux}=\cos(2\pi ux)-j\sin(2\pi ux)$ = onda de teste
- $\int$ = soma contínua; sinal "$-$" = ida, "$+$" = volta

Exemplo: $\cos(2\pi\cdot3x)$ com $u=3$ casa sempre (integral grande); com $u=5$ cancela (~0). Picos só em $u=\pm3$.

---

## Código: espectro 1D

<div class="cols"><div>

```python
import numpy as np
import matplotlib.pyplot as plt

fs = 100                      # amostras/s
t = np.arange(0, 2, 1/fs)     # 2 s
sinal = np.cos(2*np.pi*3*t) + 0.5*np.cos(2*np.pi*10*t)
F = np.fft.fft(sinal)
freq = np.fft.fftfreq(len(t), d=1/fs)  # Hz
plt.subplot(1, 2, 1); plt.plot(t, sinal)
plt.title("Domínio do tempo")
plt.subplot(1, 2, 2)
plt.stem(freq[:len(t)//2], np.abs(F)[:len(t)//2])
plt.title("Espectro: picos em 3 e 10 Hz")
plt.savefig("ft-1d.png", dpi=120)
```

</div><div>

![](figuras/dominio-da-frequencia/ft-1d.png)

</div></div>

---

## No mundo real: espectro de um sinal

- **Manutenção preditiva:** vibração de um motor; um pico na frequência do rolamento acusa a falha semanas antes da quebra
- **Afinador no celular:** espectro do microfone, pico mais alto comparado à nota-alvo (Lá = 440 Hz)

> Erro comum: confundir $u$ (frequência) com $x$ (posição). São eixos de domínios diferentes.

---

## 4. Complexo, magnitude e fase

<div class="cols"><div>

- A FT é um número complexo $R+jI$
- **Magnitude** $|F|$ = quanto de cada frequência
- **Fase** $\phi$ = onde a onda começa
- A fase guarda a **estrutura** da imagem

> Magnitude é o volume; fase é o instante em que a onda começa.

</div><div>

![](aulas-markdown/img/dominio-da-frequencia/p13-00.png)

</div></div>

---

## Veja acontecer: troca de fase

![](figuras/dominio-da-frequencia/magnitude-vs-fase.png)

Observe: cada híbrida lembra a imagem que deu a **fase**, não a magnitude.

---

## Fórmula e conta à mão

$$F(u)=R(u)+jI(u)=|F(u)|e^{j\phi(u)},\quad |F|=\sqrt{R^2+I^2},\ \phi=\arctan(I/R)$$

- $F=3+4j$: $|F|=\sqrt{9+16}=5$; $\phi\approx 53{,}1^\circ$
- $F=3-4j$: mesma magnitude 5, fase $-53{,}1^\circ$

---

## Código: magnitude de A com fase de B

<div class="cols"><div>

```python
import numpy as np
from skimage import data

a = data.camera().astype(float)
b = data.astronaut()[..., :].mean(axis=2)[:512, :512]
b = np.resize(b, a.shape)
Fa, Fb = np.fft.fft2(a), np.fft.fft2(b)
# magnitude de A com fase de B, e vice-versa
mag_a_fase_b = np.fft.ifft2(
    np.abs(Fa) * np.exp(1j*np.angle(Fb))).real
mag_b_fase_a = np.fft.ifft2(
    np.abs(Fb) * np.exp(1j*np.angle(Fa))).real
```

</div><div>

![](figuras/dominio-da-frequencia/magnitude-vs-fase.png)

</div></div>

---

## No mundo real: fase

- **Radar SAR em satélites:** registra amplitude e fase do eco; a fase mede deslocamentos do solo de milímetros (deslizamentos, vulcões)
- **Holografia digital:** a fase guarda a profundidade; só com a magnitude a imagem seria plana

> Erro comum: achar que a magnitude basta. Sem a fase não há como voltar.

---

## 5. A DFT 2D (código do professor)

<div class="cols"><div>

- Para cada $(u,v)$: soma todos os pixels vezes uma onda
- Imagem $M\times N$ gera espectro $M\times N$
- $(0,0)$ = soma de todos os pixels (**DC**)

> Testar a imagem com um carimbo de listras de cada espessura e inclinação.

</div><div>

![](aulas-markdown/img/dominio-da-frequencia/p14-00.png)

</div></div>

Note:
Retângulo branco: espectro com lóbulos em cruz; a largura do retângulo vira espaçamento no espectro. O carimbo é complexo (cosseno/seno) e cobre a imagem inteira.

---

## A fórmula do professor

<div class="cols"><div>

![](aulas-markdown/img/dominio-da-frequencia/p15-01.png)

![](aulas-markdown/img/dominio-da-frequencia/p15-03.png)

</div><div>

![](aulas-markdown/img/dominio-da-frequencia/p16-01.png)

</div></div>

--

## Fórmula traduzida

$$\mathcal F(u,v)=\sum_{r=0}^{M-1}\sum_{c=0}^{N-1} f(r,c)\,e^{-j2\pi\left(\frac{ur}{M}+\frac{vc}{N}\right)}$$

$$R=\sum\sum f\cos\theta \qquad I=-\sum\sum f\sin\theta$$

- $M$ = linhas; $N$ = colunas; $f(r,c)$ = brilho do pixel
- $(u,v)$ = frequência vertical e horizontal testada
- $\theta=2\pi(ur/M+vc/N)$ = ângulo da onda naquele pixel

--

## Conta à mão: imagem 2x2

$f=\begin{bmatrix}1&2\\3&4\end{bmatrix}$

| $(u,v)$ | conta | $R$ |
|---|---|---|
| (0,0) | $1+2+3+4$ | 10 |
| (0,1) | $1-2+3-4$ | -2 |
| (1,0) | $1+2-3-4$ | -4 |
| (1,1) | $1-2-3+4$ | 0 |

Espectro: $\begin{bmatrix}10&-2\\-4&0\end{bmatrix}$. Confira com `np.fft.fft2`.

---

## Código do professor: `dft2d`

<div class="cols"><div>

![](aulas-markdown/img/dominio-da-frequencia/p16-02.png)

</div><div>

- 4 laços: 2 escolhem $(u,v)$, 2 percorrem pixels
- `complex(real_sum, -imag_sum)` guarda o sinal de $e^{-j\theta}$
- Custo $(MN)^2$: em 512x512, ~$7\times10^{10}$ operações

</div></div>

--

```python
import math

def dft2d(image):
    M = len(image)                               # linhas
    N = len(image[0]) if M > 0 else 0            # colunas
    spectrum = [[0 for _ in range(N)] for _ in range(M)]
    for u in range(M):                           # freq. vertical
        for v in range(N):                       # freq. horizontal
            real_sum = 0.0
            imag_sum = 0.0
            for r in range(M):                   # todos os pixels
                for c in range(N):
                    theta = 2 * math.pi * ((u * r / M) + (v * c / N))
                    f_rc = image[r][c]
                    real_sum += f_rc * math.cos(theta)
                    imag_sum += f_rc * math.sin(theta)
            spectrum[u][v] = complex(real_sum, -imag_sum)
    return spectrum
```

--

## Versão do mundo real: FFT

<div class="cols"><div>

```python
import numpy as np
img = np.array([[1, 2], [3, 4]], dtype=float)
print(np.round(dft2d(img)))   # confere à mão
print(np.fft.fft2(img))       # igual, bem mais rápido
```

- FFT: $O(MN\log MN)$ contra $O((MN)^2)$
- 512x512: milissegundos contra horas

</div><div>

![](figuras/dominio-da-frequencia/dft-manual-vs-fft.png)

</div></div>

---

## Veja acontecer: manual x FFT

![](figuras/dominio-da-frequencia/dft-manual-vs-fft.png)

Observe: mesma imagem de espectro, diferença zero, mas o tempo da FFT cresce bem mais devagar.

---

## No mundo real: DFT 2D

- **JPEG:** blocos 8x8 passam por uma DCT (da família de Fourier) e as altas frequências, que o olho nota pouco, viram zero
- **Tomografia e ultrassom:** o ruído mora nas altas frequências e é atenuado sem apagar as estruturas grandes
- **Inspeção têxtil:** tecido bom tem picos regulares no espectro e uma falha quebra o padrão

> Erro comum: esquecer o sinal negativo da parte imaginária, ou achar que o código manual serve para imagens grandes.

---

## 6. Visualizando o espectro

<div class="cols"><div>

- **Magnitude:** $\sqrt{R^2+I^2}$
- **Shift:** zero vai para o centro
- **Log:** o DC é gigante e esconde o resto

> Céu noturno: a Lua apaga as estrelas; o `log` aumenta a exposição do escuro.

</div><div>

![](aulas-markdown/img/dominio-da-frequencia/p20-01.png)

</div></div>

Note:
Só a versão deslocada em log mostra estrutura; a última imagem do professor é igual à primeira. O log serve só para exibir.

---

## Veja acontecer: cru, shift, log

![](figuras/dominio-da-frequencia/visualizar-espectro.png)

Observe: crua e deslocada parecem pretas; só `fftshift` + `log` revela a estrela.

---

## Fórmula e conta à mão

$$|F|=\sqrt{R^2+I^2}\qquad S=\log(|F|+\varepsilon)\qquad r=(u+M/2)\bmod M$$

- $\varepsilon\approx10^{-7}$ evita $\log 0$
- Magnitude de $3+4j$ = 5; $\log 5\approx1{,}61$
- $\log 1000\approx6{,}9$: razão 200 vira razão 4
- Em 4x4: o pixel $(0,0)$ vai para $(2,2)$ e o $(1,1)$ para $(3,3)$

---

## Código do professor: magnitude e shift

<div class="cols"><div>

![](aulas-markdown/img/dominio-da-frequencia/p19-00.png)

</div><div>

![](aulas-markdown/img/dominio-da-frequencia/p20-00.png)

</div></div>

--

```python
import math

def magnitude(spectrum):
    M = len(spectrum)
    N = len(spectrum[0]) if M > 0 else 0
    magnitude = [[0 for _ in range(N)] for _ in range(M)]
    for u in range(M):
        for v in range(N):
            # módulo do complexo: sqrt(real^2 + imag^2)
            magnitude[u][v] = math.sqrt(spectrum[u][v].real ** 2
                                        + spectrum[u][v].imag ** 2)
    return magnitude

def shift(spectrum):
    M = len(spectrum)
    N = len(spectrum[0]) if M > 0 else 0
    shifted = [[0 for _ in range(N)] for _ in range(M)]
    for u in range(M):
        for v in range(N):
            r = (u + M // 2) % M          # desloca meia altura
            c = (v + M // 2) % M          # no slide usa M//2; o certo é N//2
            shifted[r][c] = spectrum[u][v]
    return shifted
```

--

## Equivalente em NumPy

<div class="cols"><div>

```python
import numpy as np
from skimage import data
F = np.fft.fft2(data.camera().astype(float))
mag = np.abs(F)                       # magnitude
mag_centrada = np.fft.fftshift(mag)   # zero no centro
mag_log = np.log(mag_centrada + 1e-7) # compressão log
```

- Faz o mesmo que o `shift` manual, mas em C
- Resultado: estrela brilhante no centro

</div><div>

![](figuras/dominio-da-frequencia/visualizar-espectro.png)

</div></div>

---

## No mundo real: olhar o espectro

- **Astronomia:** picos fora do centro no espectro log denunciam padrão de ruído de leitura do sensor CCD
- **Controle de impressão:** a retícula de uma revista vira pontos regulares que revelam a frequência da tela
- **Texturas:** listras verticais viram pontos horizontais (a direção gira 90 graus)

> Erro comum: filtrar o espectro log em vez do espectro de verdade. O `log` serve só para exibir.

---

## 7. A DFT inversa (IDFT)

<div class="cols"><div>

- Soma todas as ondas do espectro
- Expoente trocado ($e^{+j\theta}$) e divisão por $MN$
- Como a imagem é real, usa só a parte real

> A receita ao contrário: ingredientes (ondas) viram o prato (imagem).

</div><div>

![](aulas-markdown/img/dominio-da-frequencia/p17-01.png)

</div></div>

--

## Fórmula traduzida

$$f(r,c)=\frac{1}{MN}\sum_{u=0}^{M-1}\sum_{v=0}^{N-1}\mathcal F(u,v)\,e^{j2\pi\left(\frac{ur}{M}+\frac{vc}{N}\right)}$$

- $\frac1{MN}$ = média; $\mathcal F(u,v)$ = peso da onda $(u,v)$
- Parte real: $R\cos\theta-I\sin\theta$

Conta: espectro $\begin{bmatrix}10&-2\\-4&0\end{bmatrix}$. Pixel (0,0): $(10-2-4+0)/4=1$. Pixel (0,1): $(10+2-4-0)/4=2$. Recuperamos 1 e 2.

![](aulas-markdown/img/dominio-da-frequencia/p18-01.png)

---

## Veja acontecer: reconstrução

![](figuras/dominio-da-frequencia/idft-reconstrucao.png)

Observe: com só 5% das maiores magnitudes a imagem fica borrada, mas reconhecível.

---

## Código do professor: `idft2d`

<div class="cols"><div>

![](aulas-markdown/img/dominio-da-frequencia/p18-02.png)

</div><div>

- Laços trocados: externos nos pixels, internos nas frequências
- Divide por `M * N`
- Corrigimos `len(image)` para `len(spectrum)`

</div></div>

--

```python
import math

def idft2d(spectrum):
    M = len(spectrum)
    N = len(spectrum[0]) if M > 0 else 0
    image = [[0 for _ in range(N)] for _ in range(M)]
    for r in range(M):                  # cada pixel de saída
        for c in range(N):
            real_sum = 0.0
            for u in range(M):          # todas as frequências
                for v in range(N):
                    theta = 2 * math.pi * ((u * r / M) + (v * c / N))
                    f_uv = spectrum[u][v]
                    # parte real de (R + jI)(cos + j sen)
                    real_sum += f_uv.real * math.cos(theta) - f_uv.imag * math.sin(theta)
            image[r][c] = real_sum / (M * N)
    return image
```

--

## Teste e versão rápida

<div class="cols"><div>

```python
img = np.random.randint(0, 256, (8, 8)).astype(float)
rec = np.array(idft2d(dft2d(img.tolist())))
print(np.allclose(img, rec))  # True

# versão rápida
rec2 = np.fft.ifft2(np.fft.fft2(img)).real
```

</div><div>

![](figuras/dominio-da-frequencia/idft-reconstrucao.png)

</div></div>

---

## No mundo real: a inversa

- **Tomografia (CT):** o aparelho mede projeções (espectro em fatias) e a inversa monta a imagem do corte
- **JPEG2000 e vídeo:** guardam só os coeficientes mais importantes; a decodificação aplica a inversa
- **Telescópio Hubble:** divide-se o espectro pelo do desfoque e aplica-se a IDFT, o que desfaz o borrão

> Erro comum: esquecer o $1/(MN)$ (imagem $MN$ vezes mais clara) ou o `.real`.

---

## 8. Dualidade: estreito vira largo

<div class="cols"><div>

- Impulso (1 pixel branco) vira espectro constante
- Constante (imagem cinza) vira um ponto (DC)
- Alargar num domínio estreita no outro

> Uma sanfona: espremer de um lado estica do outro. Um estalar de dedos soa em todas as frequências.

</div><div>

![](aulas-markdown/img/dominio-da-frequencia/p23-02.png)

</div></div>

Note:
Três gaussianas de larguras diferentes e seus espectros: a mais larga no espaço dá o espectro mais estreito. Os slides p21/p22 do professor chegaram como letras soltas; a página inteira está em aulas-markdown/img/dominio-da-frequencia/paginas/pag22.png.

---

## Veja acontecer: pixel, cinza, quadrados

![](figuras/dominio-da-frequencia/dualidade.png)

Observe: quanto maior o quadrado, mais estreito o espectro.

--

## O slide de alargamento do professor

![](aulas-markdown/img/dominio-da-frequencia/paginas/pag22.png)

--

## Tabela e fórmula

| Domínio espacial | Espectro |
|---|---|
| 1 pixel branco | espalhado: todas as frequências |
| imagem toda cinza | 1 ponto no centro (DC) |
| quadrado pequeno | espectro largo |
| quadrado grande | espectro estreito |

$$f(ax)\ \longleftrightarrow\ \frac{1}{|a|}F(u/a)$$

$a>1$ comprime $f$ e alarga o espectro; $a<1$ faz o oposto.

--

## Código: gaussianas

<div class="cols"><div>

```python
import numpy as np
import matplotlib.pyplot as plt

x = np.arange(-64, 64)
fig, eixos = plt.subplots(2, 3, figsize=(10, 5))
for i, sigma in enumerate([2, 6, 20]):
    g = np.exp(-x**2 / (2*sigma**2))
    G = np.abs(np.fft.fftshift(np.fft.fft(g)))
    eixos[0, i].plot(x, g)
    eixos[0, i].set_title(f"espaço sigma={sigma}")
    eixos[1, i].plot(G)
    eixos[1, i].set_title("espectro")
plt.savefig("dualidade.png", dpi=120)
```

</div><div>

![](figuras/dominio-da-frequencia/dualidade.png)

</div></div>

---

## No mundo real: dualidade

- **Lentes e microscopia:** a PSF é o borrão de um ponto; quanto maior, menos altas frequências passam, e por isso lente ruim perde detalhe fino
- **Radar e sonar:** pulso curto tem banda larga e dá boa resolução de distância (pulsos curtos e "chirps")
- **Telecom:** sinal curto ocupa muita banda; pulsos suaves economizam banda

> Erro comum: achar que "borrada" tem espectro largo. É o contrário: borrar corta as altas frequências.

---

## 9. Convolução = multiplicação

<div class="cols"><div>

- Filtro espacial: $f*h$
- Na frequência: $F\cdot H$ (um peso por frequência)
- Vale também o inverso

> Contas com algarismos romanos (convolução) ou decimais (multiplicação).

</div><div>

![](aulas-markdown/img/dominio-da-frequencia/p24-02.png)

</div></div>

Note:
Onde a analogia falha: o ganho só aparece com kernel grande; para 3x3 o espacial costuma ser mais rápido.

---

## Veja acontecer: dois caminhos, mesma imagem

![](figuras/dominio-da-frequencia/convolucao-vs-multiplicacao.png)

Observe: o resultado é o mesmo borrão; H é um passa-baixa.

--

![](aulas-markdown/img/dominio-da-frequencia/p25-01.png)

O professor: (a) passa-baixa, (b) sinal, (c) convolução ao lado da multiplicação.

--

## Fórmula e exemplo 1D

$$f*h \longleftrightarrow F\cdot H \qquad f\cdot h \longleftrightarrow F*H$$

- $*$ = deslizar e somar; $\cdot$ = multiplicar ponto a ponto

Média móvel de 3 sobre $[0,0,9,0,0]$ dá $[0,3,3,3,0]$. Em frequência, $F\cdot H$ derruba as altas e a IFFT dá o mesmo resultado.

---

## Código: espaço x frequência

<div class="cols"><div>

```python
import numpy as np
import cv2
from skimage import data

img = data.camera().astype(np.float32)
kernel = cv2.getGaussianKernel(15, 3)  # 1D, sigma=3
kernel = kernel @ kernel.T             # 2D 15x15

# Caminho 1: convolução no espaço
espacial = cv2.filter2D(img, -1, kernel,
                        borderType=cv2.BORDER_WRAP)

# Caminho 2: multiplicação na frequência
H = np.fft.fft2(kernel, s=img.shape)   # zero padding
G = np.fft.fft2(img) * H
freq = np.fft.ifft2(G).real
freq = np.roll(freq, (-7, -7), axis=(0, 1))  # recentra

print("diferença máxima:", np.abs(espacial - freq).max())
```

</div><div>

![](figuras/dominio-da-frequencia/convolucao-vs-multiplicacao.png)

</div></div>

---

## No mundo real: convolução rápida

- **Modo retrato:** desfoque de fundo com kernel enorme; com FFT é uma multiplicação em vez de milhões de somas por pixel
- **Astrofotografia:** o borrão da atmosfera é uma convolução; divide-se o espectro pelo da PSF para desfazer
- **CNNs:** algumas bibliotecas aceleram convoluções grandes via FFT

> Erro comum: a multiplicação é convolução circular. Sem padding de zeros, as bordas vazam para o lado oposto.

---

## Pare e pense 1

Você tem a foto de um documento escaneado com **listras horizontais regulares** (defeito do scanner).

**Onde essas listras aparecem no espectro, e como você as removeria sem borrar o texto?**

Note:
Pense 1 minuto antes de avançar.

--

## Resposta

![](aulas-markdown/img/dominio-da-frequencia/p29-00.png)

- Padrão periódico vira **pontos isolados** fora do centro do espectro
- Zere só esses pontos (filtro **notch**) e aplique a inversa
- O texto (bordas, mistura de frequências) quase não é afetado; um passa-baixa borraria o texto todo

---

## 10. Filtros na frequência

<div class="cols"><div>

- **Passa-tudo:** $H=1$, nada muda
- **Passa-baixa:** deixa as baixas; borra
- **Passa-alta:** deixa as altas; só contornos
- $H_{pa}=1-H_{pb}$

> Equalizador: cortar agudos abafa o som; cortar graves o deixa fino.

</div><div>

![](aulas-markdown/img/dominio-da-frequencia/p28-01.png)

</div></div>

Note:
Espectros com círculos cada vez menores e a imagem filtrada; observe os anéis (ringing) ao redor das bordas.

---

## Veja acontecer: passa-baixa e passa-alta

![](figuras/dominio-da-frequencia/filtros-frequencia.png)

Observe: passa-baixa borra (com ringing); passa-alta deixa só contornos; menor $D_0$ borra mais.

--

## Passa-tudo e kernels no espaço

<div class="cols"><div>

![](aulas-markdown/img/dominio-da-frequencia/p26-01.png)

![](aulas-markdown/img/dominio-da-frequencia/p26-02.png)

</div><div>

![](aulas-markdown/img/dominio-da-frequencia/p27-01.png)

</div></div>

Kernels 3x3, 5x5, 7x7, 11x11: quanto maior, mais altas frequências cortadas.

--

## Fórmula traduzida

$$G(u,v)=H(u,v)\,F(u,v),\quad H_{pb}=\begin{cases}1 & D\le D_0\\0 & D>D_0\end{cases},\quad D=\sqrt{(u-\tfrac M2)^2+(v-\tfrac N2)^2}$$

- $H$ = máscara; $D$ = distância ao centro; $D_0$ = raio de corte
- Imagem 512x512, $D_0=30$: distância 10 passa; distância 100 corta
- Só 0,3% das frequências ficam, e a imagem ainda é reconhecível

---

## Código: filtros circulares

<div class="cols"><div>

```python
import numpy as np
from skimage import data

img = data.camera().astype(float)
M, N = img.shape
F = np.fft.fftshift(np.fft.fft2(img))  # zero no centro

u, v = np.ogrid[:M, :N]
D = np.sqrt((u - M/2)**2 + (v - N/2)**2)
passa_baixa = (D <= 30).astype(float)  # D0 = 30
passa_alta = 1 - passa_baixa           # complemento

def aplicar(H):
    G = F * H                          # espectro x máscara
    return np.fft.ifft2(np.fft.ifftshift(G)).real

img_pb, img_pa = aplicar(passa_baixa), aplicar(passa_alta)
```

</div><div>

![](figuras/dominio-da-frequencia/filtros-frequencia.png)

</div></div>

---

## Filtro de ruído periódico (notch)

<div class="cols"><div>

![](aulas-markdown/img/dominio-da-frequencia/p29-00.png)

</div><div>

![](aulas-markdown/img/dominio-da-frequencia/p30-00.png)

</div></div>

Esquerda: foto de carro com pontos fora do centro, zerados. Direita: máscara circular e resultado.

---

## No mundo real: filtros

- **Celular em baixa luz:** ruído de sensor é detalhe fino (alta frequência); um passa-baixa o atenua
- **Documentos e satélite:** linhas periódicas de escaneamento viram pontos no espectro; zerá-los remove as listras
- **Raio-X:** o passa-alta destaca fraturas finas, que são variações abruptas

> Erro comum: achar que o filtro ideal é o melhor. O corte brusco gera ringing; prefira Gaussiano ou Butterworth.

---

## 11. Amostragem e quantização

<div class="cols"><div>

- **Amostragem:** medir a cada $\Delta T$ (quantos pontos)
- **Quantização:** arredondar a níveis fixos (quantos valores)
- Amostrar = multiplicar por um trem de impulsos
- No espectro: **cópias** a cada $1/\Delta T$

> Filmar: amostragem = quadros por segundo; quantização = cores por quadro.

</div><div>

![](aulas-markdown/img/dominio-da-frequencia/p32-00.png)

</div></div>

---

## Veja acontecer: menos amostras, menos níveis

![](figuras/dominio-da-frequencia/amostragem-quantizacao.png)

Observe: poucas amostras perdem a onda de 5 Hz; poucos níveis de cinza causam posterização.

--

## Cópias do espectro

![](aulas-markdown/img/dominio-da-frequencia/p34-00.png)

Sobreamostragem, crítica e subamostragem: as cópias encostam e depois se sobrepõem.

--

## Exemplo: sinal com no máximo 10 Hz

| $\Delta T$ | taxa | espaçamento das cópias | situação |
|---|---|---|---|
| 0,01 s | 100 Hz | 100 Hz | sobreamostragem |
| 0,05 s | 20 Hz | 20 Hz | crítica |
| 0,1 s | 10 Hz | 10 Hz | subamostragem |

Espaçamento das cópias $=1/\Delta T$.

--

## Código: amostrando 5 Hz

<div class="cols"><div>

```python
import numpy as np
import matplotlib.pyplot as plt

t = np.linspace(0, 1, 2000)       # quase contínuo
sinal = np.sin(2*np.pi*5*t)       # 5 Hz
fig, eixos = plt.subplots(1, 3, figsize=(12, 3))
for ax, fs in zip(eixos, [50, 12, 6]):
    ta = np.arange(0, 1, 1/fs)    # instantes
    xa = np.sin(2*np.pi*5*ta)     # amostras
    xq = np.round(xa * 3) / 3     # 7 níveis
    ax.plot(t, sinal, 'lightgray'); ax.stem(ta, xq)
    ax.set_title(f"{fs} amostras/s")
plt.savefig("amostragem.png", dpi=120)
```

</div><div>

![](figuras/dominio-da-frequencia/amostragem-quantizacao.png)

</div></div>

---

## No mundo real: amostragem

- **CD (44,1 kHz):** o ouvido vai a ~20 kHz e 44,1 > 2x20, então a faixa audível é capturada sem aliasing
- **Câmera de celular:** pixels são amostragem espacial; 8 a 10 bits por canal são quantização
- **Telefonia:** voz inteligível chega a ~4 kHz, então 8 kHz bastam e economizam banda

> Erro comum: confundir amostragem (quantos pontos) com quantização (quantos níveis).

---

## 12. Teorema de Nyquist

<div class="cols"><div>

- Sinal de **banda limitada** (frequência máxima $\mu_{max}$)
- Recuperável se $f_s > 2\mu_{max}$
- Um passa-baixa isola uma cópia e reconstrói

> Para ver uma roda girar sem engano, duas fotos por volta, no mínimo.

</div><div>

![](aulas-markdown/img/dominio-da-frequencia/p39-00.png)

</div></div>

--

## Teorema: slides do professor

<div class="cols"><div>

![](aulas-markdown/img/dominio-da-frequencia/p36-00.png)

</div><div>

![](aulas-markdown/img/dominio-da-frequencia/p40-00.png)

</div></div>

Esquerda: amostragem crítica, cópias encostadas. Direita: o filtro isola uma cópia e a IFT devolve o sinal.

---

## Veja acontecer: 30 Hz x 8 Hz

![](figuras/dominio-da-frequencia/nyquist.png)

Observe: com 30 Hz a reconstrução cola no sinal; com 8 Hz (< 10 Hz) surge uma onda lenta falsa.

--

## Fórmula traduzida

$$\frac{1}{\Delta T}>2\mu_{max}\quad\Longleftrightarrow\quad \Delta T<\frac{1}{2\mu_{max}}$$

- $\Delta T$ = intervalo entre amostras; $2\mu_{max}$ = taxa de Nyquist
- Música até 15 kHz: mínimo $30$ kHz, $\Delta T<33\,\mu s$. Com 44,1 kHz há folga.

--

## Código: reconstrução por sinc

<div class="cols"><div>

```python
import numpy as np
import matplotlib.pyplot as plt

f_sinal = 5                          # Hz
tf = np.linspace(0, 1, 1000)
fig, eixos = plt.subplots(1, 2, figsize=(10, 3))
for ax, fs in zip(eixos, [30, 8]):   # acima/abaixo de 10 Hz
    ta = np.arange(0, 1, 1/fs)
    xa = np.sin(2*np.pi*f_sinal*ta)
    # soma de sincs centradas em cada amostra
    rec = sum(x * np.sinc((tf - t0) * fs)
              for x, t0 in zip(xa, ta))
    ax.plot(tf, np.sin(2*np.pi*f_sinal*tf), 'lightgray')
    ax.plot(tf, rec, 'b'); ax.plot(ta, xa, 'ro')
    ax.set_title(f"fs={fs} Hz "
        f"({'ok' if fs > 2*f_sinal else 'abaixo de Nyquist'})")
plt.savefig("nyquist.png", dpi=120)
```

</div><div>

![](figuras/dominio-da-frequencia/nyquist.png)

</div></div>

---

## No mundo real: Nyquist

- **Música digital:** 44,1 kHz > 2x20 kHz; o ouvido não distingue original e reconstrução
- **Microscopia:** o pixel precisa ser menor que metade do menor detalhe de interesse
- **Osciloscópios:** amostram a 5 a 10 vezes a banda anunciada

> Erro comum: achar que exatamente $2\mu_{max}$ basta. O teorema pede estritamente maior (um seno amostrado nos zeros some).

---

## 13. Aliasing

<div class="cols"><div>

- Amostragem lenta demais: alta frequência se **disfarça** de baixa
- **Temporal:** roda de carroça no filme
- **Espacial:** serrilhado e **moiré**
- É irreversível

> Roda que parece girar devagar ou para trás: poucas fotos por volta.

</div><div>

![](aulas-markdown/img/dominio-da-frequencia/p38-04.png)

</div></div>

Note:
Castelo de tijolos com moiré: faixas onduladas que não existem na parede real.

---

## Veja acontecer: onda falsa

![](figuras/dominio-da-frequencia/aliasing.png)

Observe: os pontos de 9 Hz a 10/s caem sobre uma onda falsa de 1 Hz; reduzir sem filtro gera moiré.

--

![](aulas-markdown/img/dominio-da-frequencia/p42-00.png)

O professor: seno rápido e amostras que parecem formar um seno lento.

--

## Fórmula e conta

$$f_{ap}=|f-k f_s|$$

- $f$ = frequência real; $f_s$ = taxa; $k$ = inteiro que deixa o resultado entre 0 e $f_s/2$
- 9 Hz a 10 amostras/s (precisava de mais de 18): $|9-10|=1$ Hz

--

## Código: 9 Hz parece 1 Hz

<div class="cols"><div>

```python
import numpy as np
import matplotlib.pyplot as plt

t = np.linspace(0, 1, 2000)
real = np.sin(2*np.pi*9*t)       # verdadeiro: 9 Hz
fs = 10                          # deveria ser > 18
ta = np.arange(0, 1, 1/fs)
amostras = np.sin(2*np.pi*9*ta)
falso = -np.sin(2*np.pi*1*t)     # 9 Hz vira 1 Hz
plt.plot(t, real, 'lightgray'); plt.plot(ta, amostras, 'ko')
plt.plot(t, falso, 'r--')
plt.title("9 Hz amostrado a 10/s parece 1 Hz")
plt.savefig("aliasing.png", dpi=120)
```

</div><div>

![](figuras/dominio-da-frequencia/aliasing.png)

</div></div>

---

## No mundo real: aliasing

- **Cinema e TV:** hélice ou roda parece girar ao contrário, pois os quadros são lentos demais
- **Roupa listrada em vídeo:** o padrão é mais fino que o pixel do sensor e gera moiré; emissoras evitam listras finas
- **Jogos 3D:** bordas serrilhadas e texturas cintilantes ao longe, resolvidas com MSAA

> Erro comum: tentar remover aliasing depois. Com as cópias sobrepostas não há como separar; previna antes.

---

## 14. Antialiasing e reamostragem

<div class="cols"><div>

- Reduzir = subamostrar (aliasing)
- Ampliar = sobreamostrar (sem aliasing)
- **Antialiasing:** passa-baixa antes de reduzir

> Antes de resumir um livro, tire os detalhes pequenos; pular linhas ao acaso não faz sentido.

</div><div>

![](aulas-markdown/img/dominio-da-frequencia/p50-01.png)

</div></div>

---

## Veja acontecer: sem e com filtro

![](figuras/dominio-da-frequencia/antialiasing.png)

Observe: sem filtro, serrilhado e dobras no espectro; borrando antes, a textura fica fiel.

--

## Exemplo e fórmula

Listras finas $[0,255,0,255,0,255,0,255]$ reduzidas a 50%:

- Pegando 1 sim, 1 não: $[0,0,0,0]$ (preto, a listra sumiu)
- Média antes: $[127,127,127,127]$ (cinza correto)

$$g=f*h_{pb}\ \ (G=F\cdot H_{pb}),\quad \text{depois mantém } f(kr,kc)$$

---

## Código: três jeitos de reduzir

<div class="cols"><div>

```python
import cv2
from skimage import data

img = data.brick()   # textura com detalhe fino
# Sem antialiasing: 1 pixel a cada 4
ruim = cv2.resize(img, None, fx=0.25, fy=0.25,
                  interpolation=cv2.INTER_NEAREST)
# Com antialiasing: borra antes
borrada = cv2.GaussianBlur(img, (0, 0), sigmaX=2)
bom = cv2.resize(borrada, None, fx=0.25, fy=0.25,
                 interpolation=cv2.INTER_NEAREST)
# Atalho: INTER_AREA faz média de blocos
bom2 = cv2.resize(img, None, fx=0.25, fy=0.25,
                  interpolation=cv2.INTER_AREA)
```

</div><div>

![](figuras/dominio-da-frequencia/antialiasing.png)

</div></div>

---

## No mundo real: antialiasing

- **Miniaturas (Google Fotos):** filtro antes de reduzir evita moiré em roupas listradas e telhados
- **Google Maps:** ruas finas são suavizadas ao afastar o zoom, senão cintilariam
- **Placas de vídeo:** mipmaps (texturas pré-filtradas) eliminam o cintilar ao longe

> Erro comum: usar `INTER_NEAREST` para reduzir. Use `INTER_AREA` ou borre antes.

---

## Pare e pense 2

Você gera miniaturas de **fotos de roupas listradas** para um app e, nas pequenas, aparecem ondas coloridas que não existem na foto.

**O que está acontecendo e qual a correção em uma linha de código?**

--

## Resposta

![](figuras/dominio-da-frequencia/antialiasing.png)

- Aliasing espacial: as listras são mais finas que o novo pixel (moiré)
- Corrija com passa-baixa antes de reduzir: `cv2.resize(img, None, fx=0.25, fy=0.25, interpolation=cv2.INTER_AREA)`
- O custo é um pouco de nitidez, e o ganho é fidelidade

---

## Revisão rápida

- Imagem = soma de ondas: baixa = áreas suaves, alta = bordas e ruído
- DFT seguida de IDFT devolve a imagem (reversível)
- DFT 2D tem 4 laços; use `np.fft.fft2` (FFT)
- Magnitude mostra quanto; **fase** guarda a estrutura; para ver: `fftshift` + `log`
- Convolução no espaço = multiplicação na frequência
- Passa-baixa borra, passa-alta realça; corte brusco causa ringing
- Nyquist: $f_s>2\mu_{max}$; abaixo disso há aliasing irreversível
- Antialiasing: borre antes de reduzir

---

## Glossário (1/2)

- **Domínio espacial / da frequência:** imagem como pixels / como receita de ondas
- **DFT / FFT:** transformada discreta / seu algoritmo rápido
- **Magnitude e fase:** quanto de cada frequência / onde a onda começa
- **Componente DC:** frequência zero, brilho médio
- **fftshift:** leva a frequência zero ao centro
- **Dualidade:** estreito num domínio = largo no outro
- **Passa-baixa / passa-alta / passa-tudo:** deixam baixas / altas / todas

---

## Glossário (2/2)

- **Frequência de corte ($D_0$):** raio onde o filtro corta
- **Ringing:** ondulações causadas por corte brusco
- **Amostragem / quantização:** medir a cada $\Delta T$ / arredondar a níveis
- **Banda limitada:** FT zero fora de uma faixa de frequências
- **Taxa de Nyquist:** o dobro da maior frequência
- **Aliasing / moiré:** frequência alta disfarçada de baixa / padrão falso
- **Antialiasing / reamostragem:** borrar antes de reduzir / mudar o número de pixels

---

## Conexões

<div class="cols"><div>

- **Antes:** filtros espaciais e convolução; Gauss é passa-baixa, Sobel e Laplaciano são passa-alta
- **Depois:** compressão (JPEG, DCT), transformações geométricas (precisam de antialiasing), bordas e CNNs
- **Mundo real:** ressonância, CT, Wi-Fi/5G (OFDM usa FFT), codecs, jogos

</div><div>

![](figuras/dominio-da-frequencia/convolucao-vs-multiplicacao.png)

</div></div>
