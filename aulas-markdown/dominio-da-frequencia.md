---
aula: "Domínio da Frequência"
origem: "aulas/Domínio da Frequência.pdf"
---

# Domínio da Frequência

# **Computação Visual Ciência da Computação** 

Prof. André Kishimoto 2026 

## **Referências** 

Este material foi baseado e adaptado a partir das seguintes referências: ▪ **Computação Gráfica: teoria e prática vol. 2** AZEVEDO, E.; CONCI, A.; LETA, F. Alta Books, 2022. 

▪ **Processamento digital de imagens, 3ª ed.** GONZALES, R. C.; WOODS, R. C. Pearson Prentice Hall, 2010. 

- **Introduction to Visual Computing: Core Concepts in Computer Vision, Graphics, and Image Processing** 

MAJUDER, A.; GOPI, M. CRC Press, 2018 

- **Fundamentos da Imagem Digital (slides de aula)** CRUVINEL, L., 2012. 

**Domínio da Frequência** 

## **Fourier** 

▪ Filtragem de imagens digitais no domínio da frequência é realizada com a **Transformada de Fourier** (FT = _Fourier Transform_ ). ▪ Jean-Baptiste Joseph Fourier em 1807 – **Série de Fourier** : 

_“Qualquer_ **_função periódica_** _pode ser expressa como a soma de senos e/ou cossenos de diferentes frequências, cada uma multiplicada por um coeficiente diferente.”_ 


![figura p.5](img/dominio-da-frequencia/p05-00.png)


Fonte: **Processamento digital de imagens, 3ª ed.** (GONZALES, R. C.; WOODS, R. C., 2010) 


![figura p.6](img/dominio-da-frequencia/p06-00.png)


Fonte: **<u>https://en.wikibooks.org/wiki/Basic_Physics_of_Nuclear_Medicine/Fourier_Methods</u>** 

## **Característica** 

Uma função (série ou transformada) pode ser totalmente recuperada, sem perda de informação, por meio de um processo inverso. 


![figura p.7](img/dominio-da-frequencia/p07-02.png)


Fonte: **Processamento digital de imagens, 3ª ed.** (GONZALES, R. C.; WOODS, R. C., 2010) 

**FT de funções contínuas de uma variável** Seja 𝑓 𝑥 uma **função contínua** da variável real 𝑥, então sua 𝑥 **Transformada de Fourier** , expressa por ℑ 𝑓 , é definida pela equação: 

∞ ℑ 𝑓 𝑥 = ℱ 𝑓 𝑥𝑒<sup>−𝑗2𝜋𝑢𝑥</sup> 𝑑𝑥 𝑢= න −∞ 

Sendo: ▪ 𝑢: uma variável contínua ▪ 𝑗: −1 ▪ 𝑒: Número Euleriano 2,71828 … 

**IFT de funções contínuas de uma variável** Dada ℱ 𝑢 , a função 𝑓 𝑥 pode ser **recuperada** calculando-se a **Transformada de Fourier Inversa (IFT)** , 𝑓 𝑥= ℑ<sup>−1</sup> ℱ 𝑢 , definida pela equação: 

∞ 

ℑ<sup>−1</sup> ℱ 𝑢 = 𝑓 ℱ 𝑢𝑒<sup>𝑗2𝜋𝑢𝑥</sup> 𝑑𝑢 𝑥= න −∞ 

Sendo: ▪ 𝑢: uma variável contínua ▪ 𝑗: −1 ▪ 𝑒: Número Euleriano 2,71828 … 

**FT de funções contínuas de uma variável** Podemos considerar que a Transformada de Fourier de uma função real é um **valor complexo** , ou seja: 

ℱ 𝑢= 𝑅 𝑢 𝑢+ 𝑗𝐼 

Sendo: ▪ 𝑅 𝑢 : componente real do número complexo. ▪ 𝐼 𝑢 : componente imaginário do número complexo. 

## **Fourier** 

Para visualização, costuma-se trabalhar com a **magnitude** da Transformada de Fourier: 

ℱ 𝑢= ℱ 𝑢𝑒<sup>𝑗𝜙</sup> 𝑢 

Sendo: 

▪ ℱ 𝑢 : **Espectro de Fourier** ou **Espectro da Frequência** ▪ Indica o “quanto” de uma frequência está presente. 

▪ Mostra quais frequências estão presentes na função original e com quais amplitudes. ▪ 𝜙 𝑢 : Ângulo de fase 

▪ Indica “onde” a frequência está na imagem (mas nem sempre é usada, pois é mais fácil ver o conteúdo do domínio espacial). 


![figura p.12](img/dominio-da-frequencia/p12-00.png)


Fonte: **Processamento digital de imagens, 3ª ed.** (GONZALES, R. C.; WOODS, R. C., 2010) 


![figura p.13](img/dominio-da-frequencia/p13-00.png)


Fonte: **Processamento digital de imagens, 3ª ed.** (GONZALES, R. C.; WOODS, R. C., 2010) 


![figura p.14](img/dominio-da-frequencia/p14-00.png)


## **FT para imagem** 


![figura p.15](img/dominio-da-frequencia/p15-01.png)


<!-- Start of picture text -->
𝑀−1 𝑁−1<br>𝑢𝑟 𝑣𝑐<br>ℱ 𝑓 𝑟, 𝑐𝑒 −𝑗2𝜋 𝑀 + 𝑁<br>𝑢, 𝑣= ෍ ෍<br>𝑟=0 𝑐=0<br>𝑢𝑟 𝑣𝑐<br>𝜃= 2𝜋 𝑀 + 𝑁<br><!-- End of picture text -->

𝑒<sup>−𝑗𝜃</sup> = cos 𝜃−𝑗sin 𝜃 


![figura p.15](img/dominio-da-frequencia/p15-03.png)


<!-- Start of picture text -->
𝑀−1 𝑁−1<br>𝑅 𝑓 𝑟, 𝑐∗cos 𝜃<br>𝑢, 𝑣= ෍ ෍<br>𝑟=0 𝑐=0<br><!-- End of picture text -->

#### Sendo: 

- 𝑀: número de linhas (altura da imagem). 

- ▪ 𝑁: número de colunas (largura da imagem). 

- 𝑓 𝑟, 𝑐 : valor do pixel na posição 𝑟, 𝑐 . 

- ℱ 𝑢, 𝑣 : valor da FT na posição 𝑢, 𝑣 . 

- 𝑅 𝑢, 𝑣 : componente real do número complexo. 

- 𝐼 𝑢, 𝑣 : componente imaginário do número complexo. 

𝑀−1 𝑁−1 𝐼 𝑓 𝑟, 𝑐∗sin 𝜃 𝑢, 𝑣= −෍ ෍ 𝑟=0 𝑐=0 

## **FT para imagem** 


![figura p.16](img/dominio-da-frequencia/p16-01.png)


<!-- Start of picture text -->
𝑀−1 𝑁−1<br>𝑢𝑟 𝑣𝑐<br>ℱ 𝑓 𝑟, 𝑐𝑒 −𝑗2𝜋 𝑀 + 𝑁<br>𝑢, 𝑣= ෍ ෍<br>𝑟=0 𝑐=0<br>𝑢𝑟 𝑣𝑐<br>𝜃= 2𝜋 𝑀 + 𝑁<br>𝑒 −𝑗𝜃 = cos 𝜃−𝑗sin 𝜃<br>𝑀−1 𝑁−1<br>𝑅 𝑓 𝑟, 𝑐∗cos 𝜃<br>𝑢, 𝑣= ෍ ෍<br>𝑟=0 𝑐=0<br>𝑀−1 𝑁−1<br>𝐼 𝑓 𝑟, 𝑐∗sin 𝜃<br>𝑢, 𝑣= −෍ ෍<br>𝑟=0 𝑐=0<br><!-- End of picture text -->


![figura p.16](img/dominio-da-frequencia/p16-02.png)


## **IFT para imagem** 


![figura p.17](img/dominio-da-frequencia/p17-01.png)


<!-- Start of picture text -->
𝑀−1 𝑁−1<br>𝑢𝑟 𝑣𝑐<br>1<br>ℱ 𝑀 + 𝑁<br>𝑓 𝑟, 𝑐= 𝑢, 𝑣𝑒 𝑗2𝜋<br>𝑀𝑁 ෍ ෍<br>𝑢=0 𝑣=0<br><!-- End of picture text -->

Sendo: 

- 𝑀: número de linhas (altura da imagem). 

- ▪ 𝑁: número de colunas (largura da imagem). 

- ℱ 𝑢, 𝑣 : valor da FT na posição 𝑢, 𝑣 . 

- 𝑓 𝑟, 𝑐 : valor da posição 𝑟, 𝑐 da imagem original recuperada. 

## **IFT para imagem** 


![figura p.18](img/dominio-da-frequencia/p18-01.png)


<!-- Start of picture text -->
𝑀−1 𝑁−1<br>𝑢𝑟 𝑣𝑐<br>1<br>ℱ 𝑀 + 𝑁<br>𝑓 𝑟, 𝑐= 𝑢, 𝑣𝑒 𝑗2𝜋<br>𝑀𝑁 ෍ ෍<br>𝑢=0 𝑣=0<br><!-- End of picture text -->


![figura p.18](img/dominio-da-frequencia/p18-02.png)



![figura p.19](img/dominio-da-frequencia/p19-00.png)


**FT para imagem** 


![figura p.20](img/dominio-da-frequencia/p20-00.png)



![figura p.20](img/dominio-da-frequencia/p20-01.png)


**FT para imagem** 

## **Dualidade** 

### Domínio Espacial 

X[t] 

Domínio da Frequência X[f] 

Impulso no domínio espacial (variação abrupta e localizada) é uma constante no domínio da frequência (impulso contém todas as frequências). 

t 


![figura p.21](img/dominio-da-frequencia/p21-06.png)


<!-- Start of picture text -->
f<br><!-- End of picture text -->

X[t] Constante no domínio espacial (sem variações) é um impulso no domínio da frequência (apenas a frequência zero está presente). 


![figura p.21](img/dominio-da-frequencia/p21-08.png)


<!-- Start of picture text -->
X[f]<br><!-- End of picture text -->


![figura p.21](img/dominio-da-frequencia/p21-09.png)


f 

t 

## **Dualidade** 

### Domínio Espacial 

X[t] 


![figura p.22](img/dominio-da-frequencia/p22-03.png)


<!-- Start of picture text -->
X[t]<br><!-- End of picture text -->


![figura p.22](img/dominio-da-frequencia/p22-04.png)


<!-- Start of picture text -->
t<br><!-- End of picture text -->

Alargamento em um domínio significa estreitamento no outro e vice-versa. 

### Domínio da Frequência 


![figura p.22](img/dominio-da-frequencia/p22-07.png)


<!-- Start of picture text -->
X[f]<br>f<br><!-- End of picture text -->


![figura p.22](img/dominio-da-frequencia/p22-08.png)



![figura p.22](img/dominio-da-frequencia/p22-09.png)


<!-- Start of picture text -->
X[f]<br><!-- End of picture text -->


![figura p.22](img/dominio-da-frequencia/p22-10.png)


<!-- Start of picture text -->
f<br><!-- End of picture text -->

t 

## **Dualidade** 

Alargamento em um domínio significa estreitamento no outro e viceversa. 


![figura p.23](img/dominio-da-frequencia/p23-02.png)


Fonte: **Introduction to Visual Computing** (MAJUDER, A.; GOPI, M., 2018) 

## **Dualidade** 

Convolução de duas funções no domínio espacial/temporal é uma multiplicação no domínio da frequência (e vice-versa). 


![figura p.24](img/dominio-da-frequencia/p24-02.png)


Fonte: **Introduction to Visual Computing** (MAJUDER, A.; GOPI, M., 2018) 

## **Convolução** 


![figura p.25](img/dominio-da-frequencia/p25-01.png)


- (a) Filtros passa-baixa ( _low pass_ ) _b[t]_ (esq.) e respectivas frequências (dir.), com frequências de corte. 

- (b) Função geral _x[t]_ . 

(c) Convolução entre _x_ e _b_ no domínio espacial (esq.) implica em multiplicação entre _X[f]_ e _B[f]_ no domínio da frequência (dir.) 

Fonte: **Introduction to Visual Computing** (MAJUDER, A.; GOPI, M., 2018) 

## **Filtro passa-tudo (all pass)** 


![figura p.26](img/dominio-da-frequencia/p26-01.png)



![figura p.26](img/dominio-da-frequencia/p26-02.png)


Fonte: **Introduction to Visual Computing** (MAJUDER, A.; GOPI, M., 2018) 

## **Filtro passa-baixa** 


![figura p.27](img/dominio-da-frequencia/p27-01.png)


Fonte: **Introduction to Visual Computing** (MAJUDER, A.; GOPI, M., 2018) 

## **Filtro passa-baixa (espectro)** 


![figura p.28](img/dominio-da-frequencia/p28-01.png)


Fonte: **Introduction to Visual Computing** (MAJUDER, A.; GOPI, M., 2018) 


![figura p.29](img/dominio-da-frequencia/p29-00.png)


Fonte: **Processamento digital de imagens, 3ª ed.** (GONZALES, R. C.; WOODS, R. C., 2010) 


![figura p.30](img/dominio-da-frequencia/p30-00.png)


Fonte: **Processamento digital de imagens, 3ª ed.** (GONZALES, R. C.; WOODS, R. C., 2010) 

## **Funções amostradas** 

**Amostragem de Funções Contínuas** ▪ **Funções contínuas** são **convertidas** em uma sequência de **valores discretos** para serem processadas por um programa computacional. 

▪ Esse processo é realizado utilizando: 

▪ **Amostragem:** amostra da função contínua em intervalos uniformes de ∆𝑇. ▪ **Quantização:** valor do impulso de cada amostra da função contínua. 


![figura p.32](img/dominio-da-frequencia/p32-00.png)


Fonte: **Processamento digital de imagens, 3ª ed.** (GONZALES, R. C.; WOODS, R. C., 2010) 

## **Funções amostradas** 

### **Transformada de Fourier de funções amostradas** 

▪ O intervalo entre as cópias da amostragem é determinado por: (∆𝑇 = taxa de amostragem). 

1 ∆𝑇 

▪ A taxa de amostragem pode gerar três situações: ▪ **Sobreamostragem:** separação entre os períodos (∆𝑇 pequeno). 

- **Amostragem crítica:** períodos vizinhos (frequência de Nyquist). 

- **Subamostragem:** os períodos foram sobrepostos, onde não foi possível preservar a transformada original (∆𝑇 grande). 


![figura p.34](img/dominio-da-frequencia/p34-00.png)


Fonte: **Processamento digital de imagens, 3ª ed.** (GONZALES, R. C.; WOODS, R. C., 2010) 

## **Funções amostradas** 

- **Teorema da amostragem** ▪ Uma função contínua pode ser **unicamente recuperada** (sinal original reconstruído) a partir do conjunto de suas amostras. 

- ▪ Uma **função de banda limitada** é uma função cuja Transformada de Fourier é zero para valores de frequências fora de um intervalo finito. 

   - Contém apenas frequências dentro de uma faixa finita, cujo intervalo é −𝜇𝑚𝑖𝑛, 𝜇𝑚𝑎𝑥 . 


![figura p.36](img/dominio-da-frequencia/p36-00.png)


Fonte: **Processamento digital de imagens, 3ª ed.** (GONZALES, R. C.; WOODS, R. C., 2010) 

## **Funções amostradas** 

**Teorema da amostragem** ▪ A **separação suficiente** entre os períodos de uma função contínua é garantida se: 

1 1 2∆𝑇<sup>> 𝜇𝑚𝑎𝑥ou</sup> ∆𝑇<sup>> 2𝜇𝑚𝑎𝑥</sup> 

- As equações anteriores indicam que uma função de banda limitada contínua **pode ser recuperada** a partir de um conjunto de amostras **se** : 

   - **_As amostras_** _forem adquiridas em_ **_uma taxa maior_** _ao_ **_dobro da frequência mais alta_** _contida na função (taxa de Nyquist)._ 

## **Funções amostradas** 

### **_Aliasing_** 

▪ O _aliasing_ ocorre quando uma função de banda limitada é **amostrada** em uma **taxa menor** que o dobro de sua frequência mais alta. 

▪ Significa que o _aliasing_ é o exemplo de _subamostragem_ . ▪ No _aliasing_ , os períodos se sobrepõem e passa a ser impossível isolar um período da transformada. 


![figura p.38](img/dominio-da-frequencia/p38-04.png)


▪ Esse efeito também é conhecido como 

**_aliasing_ de frequência** . 


![figura p.39](img/dominio-da-frequencia/p39-00.png)


Fonte: **Processamento digital de imagens, 3ª ed.** (GONZALES, R. C.; WOODS, R. C., 2010) 


![figura p.40](img/dominio-da-frequencia/p40-00.png)


Fonte: **Processamento digital de imagens, 3ª ed.** (GONZALES, R. C.; WOODS, R. C., 2010) 

## **Funções amostradas** 

### **_Aliasing_** 

▪ Infelizmente, **o** **_aliasing_ é** um resultado **inevitável** ao trabalharmos com sinais **amostrados de tamanho finito** . 

- Os **efeitos** do _aliasing_ podem ser **reduzidos** pela **suavização** da função de entrada. 

   - Esse efeito é chamado de: **_antialiasing_** _._ 

   - **Por exemplo:** o borramento de imagens digitais que atenua as altas frequências (bordas e ruídos) da imagem de entrada. 


![figura p.42](img/dominio-da-frequencia/p42-00.png)


Fonte: **Processamento digital de imagens, 3ª ed.** (GONZALES, R. C.; WOODS, R. C., 2010) 

## **Funções amostradas** 

**_Aliasing_ em imagens digitais** 

▪ O ato de **limitar a duração** de uma função insere **componentes corruptores** na frequência. 

▪ Por esse motivo, o _aliasing_ está **sempre presente** em imagem digitais. 

▪ Da mesma forma como está presente nas funções 1D amostradas. ▪ O _aliasing_ se manifesta em imagens de duas formas: 

▪ _Aliasing_ temporal 

▪ _Aliasing_ espacial 

## **Funções amostradas** 

### **_Aliasing_ temporal** 

▪ Ocorre no **intervalo** existente entre imagens de uma sequência de imagens finitas. 

- O **exemplo** mais comum é o efeito de **"roda de carroça"** : ▪ Ocorre quando os raios das rodas em uma sequência de imagens (um vídeo) parecem estar girando para trás. 

▪ Esse efeito é provocado pelo fato de a velocidade de projeção ser baixa demais em relação à velocidade de rotação da roda na sequência. 

## **Funções amostradas** 

### **_Aliasing_ espacial** 

▪ Ocorre devido à **subamostragem** no domínio da imagem digital. ▪ Os **principais problemas** do _aliasing_ espacial são: 

- A inserção de artefatos com _jaggies_ (serrilhados) nas linhas de uma sequência de _pixels._ 

- Saliências falsas. 

- Aparecimento de padrões de frequência ausentes na imagem original. 

## **Funções amostradas** 

**Reduzindo o efeito do** **_aliasing_ em imagens** ▪ Para reduzir o efeito do _aliasing_ , devemos **atenuar** as **altas frequências** da imagem digital. 

   - Lembrando que, para atenuar as altas frequências, aplicamos um filtro passa-baixa (borramento). 

- Esse processo é conhecido como **_antialiasing_** _._ 

   - O _antialiasing_ é realizado antes da (re)amostragem da imagem. 

## **Funções amostradas** 

**_Aliasing_ em imagens reamostradas** ▪ A **reamostragem** de _pixels_ ocorre no processo de redimensionamento de imagens. 

▪ Observamos os seguintes comportamentos na reamostragem de imagens: 

▪ **Ampliação:** pode ser vista como uma sobreamostragem. ▪ **Redução:** pode ser vista como uma subamostragem. 

## **Funções amostradas** 

**_Aliasing_ em imagens reamostradas** ▪ Usando o modelo de vizinho mais próximo no processo de interpolação de pixels... 

   - Para diminuir a imagem em 50% 

      - Exclui-se linha sim e outra não; e 

      - Exclui-se coluna sim e outra não. 

   - Para aumentar a imagem em 50% 

      - Duplica-se cada linha da imagem; e 

      - Duplica-se cada coluna da imagem. 

- Veja o exemplo do efeito de _aliasing_ de frequência em uma imagem reamostrada no slide seguinte. 

Fonte: **Processamento digital de imagens, 3ª ed.** (GONZALES, R. C.; WOODS, R. C., 2010) 

## **Artefatos de aliasing** 


![figura p.50](img/dominio-da-frequencia/p50-01.png)


<!-- Start of picture text -->
Pre-Filtering reduces<br>frequency content.<br>Hence, lower sampling is<br>sufficient.<br>Input (256 x 256) Filtered (256 x 256)<br>ANTI-ALIASING<br>Insufficient sampling.<br>Hence, aliasing.<br>Subsampled from filtered<br>Subsampled(128 x 128)<br>image(128 x 128)<br><!-- End of picture text -->

Fonte: **Introduction to Visual Computing** (MAJUDER, A.; GOPI, M., 2018) 


![figura p.51](img/dominio-da-frequencia/p51-00.png)



![figura p.51](img/dominio-da-frequencia/p51-01.png)


