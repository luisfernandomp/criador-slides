const QUESTOES = [
  {
    "pergunta": "Um scanner de documentos deixa um padrão de listras finas e regulares, iguais em toda a página. Qual alternativa explica corretamente como o domínio da frequência resolve o problema?",
    "opcoes": [
      "Usar a fase para apagar as listras, já que a fase mostra onde cada padrão está e basta zerá-la na imagem toda.",
      "Zerar no espectro os picos que correspondem às listras, já que padrões repetitivos concentram energia em poucas frequências.",
      "Aplicar um passa-baixa forte, porque listras são padrões de baixa frequência que se espalham pela página e somem com o borramento.",
      "Somar um valor constante a todos os pixels, porque o brilho médio fica em (0,0) e a média absorve o padrão das listras da imagem."
    ],
    "correta": 1,
    "explicacao": "Padrões periódicos aparecem como picos bem localizados no espectro, então dá para removê-los zerando esses picos e voltando com a IFT. A opção mais tentadora é a do passa-baixa, mas ele também apagaria os detalhes úteis do texto, e a listra não é de baixa frequência."
  },
  {
    "pergunta": "Um aluno analisa a foto de um céu limpo e de uma cerca com arame. Ele afirma que o céu liso ocupa a região de altas frequências do espectro, e os arames ocupam a região perto de (0,0). Qual correção está correta?",
    "opcoes": [
      "O céu liso muda o brilho devagar e fica perto de (0,0); os arames mudam bruscamente e ocupam altas frequências.",
      "O céu liso fica em altas frequências por não ter bordas, e os arames ficam perto de (0,0) por serem a média de brilho da cena.",
      "O céu e os arames ocupam a mesma faixa, porque a frequência depende da cor, e não da rapidez com que o brilho varia na cena.",
      "O céu aparece só na fase, pois o espectro guarda a magnitude apenas das bordas, e nunca das áreas planas da fotografia."
    ],
    "correta": 0,
    "explicacao": "Em imagem, frequência é a rapidez com que o brilho muda ao longo dos pixels: áreas lisas ficam em baixas frequências e bordas ou texturas finas em altas. A alternativa sobre a média de brilho é a mais tentadora, mas a média é a frequência (0,0) e é o que o céu liso, não os arames, mais se aproxima."
  },
  {
    "pergunta": "Um engenheiro calcula a FT de uma foto, multiplica o espectro por um filtro e entrega o resultado sem fazer a transformada inversa. O cliente reclama que o arquivo não parece uma foto. Qual alternativa explica corretamente o problema?",
    "opcoes": [
      "A FT perdeu informação ao ser calculada, então seria preciso outra transformada, pois a FT descarta componentes que não voltam.",
      "O filtro deveria ter sido somado, e não multiplicado, pois a convolução no espaço vira soma no espectro, e não produto ponto a ponto.",
      "Falta a IFT, que volta ao domínio espacial; o espectro filtrado ainda são coeficientes complexos, e a IFT com 1/MN os reconverte.",
      "O erro está na fase, que deveria ser zerada antes da IFT, pois ela é ruído e não tem relação com a posição dos pixels na foto."
    ],
    "correta": 2,
    "explicacao": "O fluxo correto é imagem, FT, filtro, IFT, imagem filtrada, e a IFT é o passo que devolve os valores de pixel com o fator 1/MN. A opção sobre a fase é tentadora, mas a fase é necessária para reconstruir a imagem e não pode ser descartada."
  },
  {
    "pergunta": "Em um vídeo de uma corrida, as rodas de um carro parecem girar para trás, embora o carro esteja andando para frente. Qual alternativa explica corretamente o fenômeno?",
    "opcoes": [
      "Aliasing espacial: os raios ficam serrilhados nos pixels, e o olho lê a serrilha como movimento contrário porque os pixels são quadrados.",
      "Antialiasing excessivo: o filtro passa-baixa aplicado ao vídeo apaga os raios, que são trocados por um movimento fantasma na cena.",
      "Quantização: o número de níveis de cinza é pequeno, então o brilho dos raios muda em saltos que parecem girar a roda ao contrário.",
      "Aliasing temporal: a taxa de quadros é baixa demais para a rotação, e o padrão repetido entre quadros parece girar para trás."
    ],
    "correta": 3,
    "explicacao": "A roda gira mais rápido do que a câmera consegue amostrar entre quadros, então a rotação real se disfarça de rotação lenta ou para trás (efeito roda de carroça). A opção sobre aliasing espacial é tentadora, mas ela trata dos pixels dentro de um quadro, não do intervalo entre quadros."
  },
  {
    "pergunta": "Um satélite reduz uma imagem de 2000 x 2000 para 1000 x 1000 pixels por vizinho mais próximo, sem filtro. Telhados com listras finas viram cinza sólido ou ganham listras que não existem. Qual alternativa explica corretamente o que aconteceu?",
    "opcoes": [
      "Reduzir a imagem é sobreamostragem, então as cópias do espectro se afastam e criam listras extras, pois a interpolação gera pixels novos.",
      "O problema está na quantização: com menos pixels, o número de níveis de cinza cai, e por isso os telhados viram cinza sólido na imagem.",
      "Reduzir sem filtro é subamostragem: detalhes acima da nova taxa de Nyquist viram padrões falsos na imagem; um passa-baixa antes evitaria isso.",
      "A redução fez a imagem perder a fase, e sem ela as listras viram manchas, mas o espectro de magnitude continua correto nessa imagem."
    ],
    "correta": 2,
    "explicacao": "Ao reduzir, a taxa de amostragem cai, e detalhes finos que ficam acima da nova metade da taxa viram padrões falsos (aliasing). O antialiasing, um passa-baixa aplicado antes da redução, atenua esses detalhes e evita o defeito. A opção da sobreamostragem é tentadora, mas ela descreve o caso de ampliar, não de reduzir."
  },
  {
    "pergunta": "Uma imagem tem listras verticais finas que alternam 0 e 255 em todas as linhas. Ela é reduzida a 50% mantendo as colunas 0 e 2 e descartando as colunas 1 e 3, sem nenhum filtro. Qual é o resultado e por quê?",
    "opcoes": [
      "A imagem fica toda branca, pois as colunas mantidas são as de maior brilho e a redução preserva o valor máximo de cada região.",
      "A imagem fica toda preta, pois as colunas mantidas têm valor 0 e as listras somem; é aliasing, já que o padrão fino vira valor falso.",
      "A imagem fica cinza uniforme em 127,5, pois o descarte de colunas faz a média dos valores, como se espera sem aliasing nessa redução.",
      "A imagem permanece igual, pois o vizinho mais próximo não altera nenhum valor de pixel, e então nenhuma frequência se perde no processo."
    ],
    "correta": 1,
    "explicacao": "Como só as colunas de valor 0 sobram, a imagem fica preta e as listras desaparecem: esse é o aliasing da subamostragem. O cinza uniforme de 127,5 é o resultado que se obtém quando se tira a média antes de reduzir, que é o antialiasing, e não o descarte puro."
  },
  {
    "pergunta": "Um estudante escreve a fórmula da IFT de uma imagem M x N. Qual das alternativas descreve corretamente essa fórmula?",
    "opcoes": [
      "Usa sinal positivo no expoente e o fator 1/MN, que compensa a soma sobre todas as frequências (u,v) usadas na reconstrução.",
      "Usa sinal negativo no expoente, igual à FT, e o fator 1/MN, que compensa a soma sobre os pixels (r,c) da imagem original.",
      "Usa sinal positivo no expoente e não precisa de fator, pois a soma sobre as frequências já devolve os pixels originais.",
      "Usa sinal negativo no expoente e o fator 1/(M+N), porque a soma é feita separadamente nas linhas e nas colunas da imagem."
    ],
    "correta": 0,
    "explicacao": "A IFT soma as ondas 2D com peso F(u,v) e usa sinal positivo no expoente; o fator 1/MN desfaz o acúmulo da soma. A opção com sinal negativo é tentadora, mas é a da FT, que também não tem o fator 1/MN na mesma forma."
  },
  {
    "pergunta": "Um filtro no domínio da frequência tem ganho 1 nas frequências baixas e média, e ganho 0 nas altas. O espectro da imagem tem valores 100 (baixa), 50 (média) e 20 (alta). Qual é o espectro filtrado, nessa mesma ordem?",
    "opcoes": [
      "100, 50, 20",
      "0, 0, 20",
      "100, 50, 0",
      "100, 100, 0"
    ],
    "correta": 2,
    "explicacao": "Filtrar é multiplicar cada componente do espectro pelo ganho do filtro: 100 x 1 = 100, 50 x 1 = 50 e 20 x 0 = 0. As altas frequências somem e a imagem fica borrada. A opção 100, 50, 20 é tentadora para quem esquece de multiplicar pelo ganho."
  },
  {
    "pergunta": "Um aplicativo de fotos aplica um borrão gaussiano (passa-baixa) para suavizar a pele de um retrato. O usuário diz que a foto ficou mais escura. Qual explicação é a mais correta?",
    "opcoes": [
      "O passa-baixa trata da rapidez de variação, não do brilho; a foto só perde os detalhes finos, e o escurecimento vem de outra causa.",
      "O passa-baixa deixa passar apenas os tons escuros, pois as altas frequências são as partes claras e o filtro as remove da foto.",
      "O passa-baixa remove a frequência zero, que guarda o brilho médio da cena, então a imagem escurece por causa dessa remoção.",
      "O borrão troca a fase pela magnitude, e sem a fase os tons claros se perdem, deixando a foto com aparência mais escura ao final."
    ],
    "correta": 0,
    "explicacao": "Passa-baixa e passa-alta se referem a frequência (rapidez de variação), não a tons claros ou escuros, e um kernel de borrão normalizado mantém a média de brilho. A opção dos tons escuros é tentadora porque mistura frequência com brilho, um erro comum da aula."
  },
  {
    "pergunta": "Uma câmera de vigilância grava uma pessoa com camisa de listras finas. No monitor, as listras aparecem onduladas e com cores falsas. Qual alternativa explica corretamente o fenômeno?",
    "opcoes": [
      "Aliasing temporal, porque a câmera tira fotos rápido demais e o movimento da camisa é registrado fora de ordem entre os quadros.",
      "Quantização, porque a camisa tem poucos níveis de cinza e o sensor arredonda o brilho para valores que não existem na cena real.",
      "Aliasing espacial, porque as listras estão mais finas que a grade de pixels, e o padrão registrado não é o da cena real.",
      "Antialiasing excessivo, porque o sistema borrou a camisa demais, e o padrão ondulado é só o resíduo do filtro passa-baixa aplicado."
    ],
    "correta": 2,
    "explicacao": "Listras mais finas que a grade de pixels estão acima da taxa de Nyquist espacial, e viram um padrão falso de frequência menor (moiré). A opção de quantização é tentadora, mas ela trata do número de níveis de cinza, não da posição dos pixels."
  },
  {
    "pergunta": "Um sinal com maior frequência de 10 Hz é amostrado a 12 Hz. Um estudante diz que a amostragem é suficiente, porque 12 é maior que 10. Qual alternativa responde corretamente?",
    "opcoes": [
      "Está correta, porque basta que a taxa supere a maior frequência para não haver perda de informação no sinal amostrado.",
      "A amostragem é insuficiente: a taxa deve superar o dobro da maior frequência (20 Hz), e a 12 Hz gera onda falsa de 2 Hz.",
      "Está correta, porque 12 Hz corresponde a um intervalo de 1/12 s, menor que o período de 10 Hz, e assim captura a onda inteira.",
      "A amostragem é insuficiente, mas a falha pode ser corrigida depois com um passa-baixa aplicado aos 12 Hz, recuperando a onda original."
    ],
    "correta": 1,
    "explicacao": "O teorema de Nyquist exige taxa maior que o dobro da maior frequência, ou seja, mais que 20 Hz; a 12 Hz ocorre aliasing e a frequência aparente é |10 - 12| = 2 Hz. A opção de corrigir depois é tentadora, mas a informação já se misturou e não se recupera após a amostragem."
  },
  {
    "pergunta": "Um sistema de coleta registra um sinal com intervalo de amostragem ΔT = 0,05 s. Qual é a taxa de amostragem e o efeito de diminuir ΔT?",
    "opcoes": [
      "A taxa é 20 amostras por segundo; diminuir ΔT aumenta a taxa, afasta as cópias do espectro e melhora a separação.",
      "A taxa é 0,05 amostras por segundo; diminuir ΔT aproxima as cópias do espectro e causa aliasing no sinal registrado.",
      "A taxa é 20 amostras por segundo; diminuir ΔT aproxima as cópias do espectro, e isso causa aliasing no sinal registrado.",
      "A taxa é 0,05 amostras por segundo; diminuir ΔT afasta as cópias, mas não altera a separação entre elas no espectro."
    ],
    "correta": 0,
    "explicacao": "A taxa é 1/ΔT = 1/0,05 = 20 amostras por segundo, e as cópias do espectro ficam a cada 1/ΔT. Diminuir ΔT aumenta a taxa e afasta as cópias. A opção que inverte o efeito de ΔT é tentadora, porque confunde o intervalo com a taxa."
  },
  {
    "pergunta": "Um engenheiro de áudio quer reproduzir uma onda quadrada (liga-desliga) com quinas nítidas. Ele tenta usar só a onda de frequência fundamental, que é senoidal e suave. Qual alternativa explica por que o resultado sai arredondado?",
    "opcoes": [
      "As quinas exigem as ondas de alta frequência da soma de Fourier, e uma única onda suave não tem essas componentes.",
      "A fundamental tem fase errada, pois toda onda quadrada precisa de fase zero em todas as frequências para formar quinas.",
      "O som arredonda porque a fundamental ocupa só frequências negativas, e a IFT não reconstrói frequências negativas.",
      "A onda quadrada não é periódica, então a série de Fourier não se aplica a ela, e qualquer aproximação sai arredondada."
    ],
    "correta": 0,
    "explicacao": "A onda quadrada é aproximada pela soma da fundamental com as harmônicas de frequências 3, 5, 7 e assim por diante, e são essas componentes que formam as quinas. A opção de que a série não se aplica é tentadora, mas a onda quadrada é periódica, então a série vale para ela."
  },
  {
    "pergunta": "Um pesquisador transforma uma linha de pixels e obtém, para uma frequência, o valor complexo F = 3 + 4j. Ele quer mostrar na tela o quanto dessa frequência existe, mas não sabe o que escolher. Qual alternativa está correta?",
    "opcoes": [
      "A opção de mostrar a parte imaginária, 4, pois ela sozinha indica a amplitude de cada onda, e a parte real descreve a fase.",
      "A opção de mostrar a fase, arctan(4/3), pois ela informa quanto da frequência existe, e a magnitude serve só para reconstruir.",
      "A opção de mostrar a soma 3 + 4 = 7, pois o espectro é a soma das partes real e imaginária, dando a quantidade total da frequência.",
      "A opção de mostrar a magnitude, 5, pois ela indica quanto da frequência existe; a fase é necessária para reconstruir, mas não é visualizada."
    ],
    "correta": 3,
    "explicacao": "O espectro é a magnitude raiz de (3^2 + 4^2) = 5, que mostra a amplitude de cada frequência, e a fase arctan(4/3) diz o deslocamento da onda, necessária para reconstruir a imagem. A opção que soma as partes é tentadora, mas a soma não é a magnitude, que usa a raiz da soma dos quadrados."
  },
  {
    "pergunta": "Uma foto é borrada com um kernel muito largo, que espalha cada pixel por uma grande área. Qual alternativa descreve corretamente o que acontece com o espectro da imagem?",
    "opcoes": [
      "O espectro fica mais largo, pois o borrão espalha a energia por mais frequências, incluindo as mais altas da imagem toda.",
      "O espectro não muda, pois o kernel atua só sobre o brilho, e a frequência não depende do tamanho do kernel usado aqui.",
      "O espectro fica mais estreito, concentrado perto de zero, pois kernel largo no espaço corresponde a espectro estreito, cortando altas.",
      "O espectro vira constante em todas as frequências, pois a convolução com kernel largo soma todos os pixels e os espalha igualmente."
    ],
    "correta": 2,
    "explicacao": "Pela dualidade, o que é largo no espaço é estreito na frequência; a convolução vira multiplicação, e o filtro largo tem espectro concentrado perto de zero, que deixa passar só as baixas frequências. A opção do espectro mais largo é tentadora porque inverte a regra da dualidade."
  }
];
