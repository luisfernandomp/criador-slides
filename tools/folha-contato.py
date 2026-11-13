"""Junta várias imagens em folhas de contato (grade de miniaturas com o nome do arquivo).
Serve para um agente "ver" dezenas de figuras lendo só 1-2 imagens (economia de tokens).
Uso: python3 tools/folha-contato.py <pasta-de-imagens> <saida-prefixo> [colunas=6]
Saída: <saida-prefixo>-1.png, <saida-prefixo>-2.png ... (até 24 miniaturas por folha)"""
import sys, pathlib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.image as mpimg

pasta, prefixo = pathlib.Path(sys.argv[1]), sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 6
imgs = sorted(p for p in pasta.iterdir() if p.suffix.lower() in (".png", ".jpg", ".jpeg"))
POR_FOLHA = cols * 4
for n, i in enumerate(range(0, len(imgs), POR_FOLHA), 1):
    lote = imgs[i:i + POR_FOLHA]
    linhas = (len(lote) + cols - 1) // cols
    fig, axs = plt.subplots(linhas, cols, figsize=(cols * 2.6, linhas * 2.6), squeeze=False)
    for ax in axs.flat:
        ax.axis("off")
    for ax, p in zip(axs.flat, lote):
        ax.imshow(mpimg.imread(p), cmap="gray")
        ax.set_title(p.name, fontsize=9)
    fig.tight_layout()
    saida = f"{prefixo}-{n}.png"
    fig.savefig(saida, dpi=70)
    plt.close(fig)
    print(f"OK {saida} ({len(lote)} imagens)")
