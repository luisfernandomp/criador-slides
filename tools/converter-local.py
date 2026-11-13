"""Converte PDF -> Markdown localmente (pymupdf4llm), extraindo as figuras do PDF.
Uso: python3 tools/converter-local.py [aulas/<arquivo>.pdf ...]   (sem argumentos = todos os PDFs pendentes)
Saída: aulas-markdown/<slug>.md  (cabeçalho com o nome da aula)
       aulas-markdown/img/<slug>/pNN-MM.png  (figuras; NN = página do PDF), referenciadas no .md
       como ![figura p.NN](img/<slug>/pNN-MM.png)
       aulas-markdown/img/<slug>/paginas/pagNN.png  (cada página inteira, para figuras que saem picotadas)"""
import re, sys, shutil, tempfile, unicodedata, pathlib
import pymupdf4llm
import pymupdf

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "aulas-markdown"

def slug(s):
    s = unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", re.sub(r"\.pdf$", "", s)).strip("-")

pdfs = [pathlib.Path(a) for a in sys.argv[1:]]
if not pdfs:
    pdfs = [p for p in sorted((ROOT / "aulas").iterdir())
            if p.suffix.lower() == ".pdf" and not (OUT / (slug(p.name) + ".md")).exists()]
if not pdfs:
    print("NADA_PENDENTE")

falhas = 0
for pdf in pdfs:
    try:
        s = slug(pdf.name)
        nome = re.sub(r"\s+", " ", re.sub(r"(?<=\S)-(?=\S)", " ", pdf.stem.replace("_", " "))).strip()
        img_dir = OUT / "img" / s
        shutil.rmtree(img_dir, ignore_errors=True)
        img_dir.mkdir(parents=True)
        with tempfile.TemporaryDirectory() as tmp:
            md = pymupdf4llm.to_markdown(str(pdf), write_images=True, image_path=tmp,
                                         image_format="png", dpi=110, show_progress=False)
            def troca(m):
                orig = pathlib.Path(m.group(1))
                pg = re.search(r"-(\d+)-(\d+)\.png$", orig.name)
                novo = f"p{int(pg.group(1)):02d}-{pg.group(2)}.png" if pg else orig.name
                if orig.exists():
                    shutil.copy(orig, img_dir / novo)
                return f"![figura p.{int(pg.group(1)) if pg else '?'}](img/{s}/{novo})"
            md = re.sub(r"!\[[^\]]*\]\(([^)]+)\)", troca, md)
        # página inteira como imagem: útil quando a figura sai picotada em pedaços
        pag_dir = img_dir / "paginas"
        pag_dir.mkdir()
        with pymupdf.open(str(pdf)) as doc:
            for i, page in enumerate(doc, 1):
                page.get_pixmap(dpi=80).save(str(pag_dir / f"pag{i:02d}.png"))
        dest = OUT / (s + ".md")
        dest.write_text(f'---\naula: "{nome}"\norigem: "aulas/{pdf.name}"\n---\n\n# {nome}\n\n{md}', encoding="utf-8")
        n = len(list(img_dir.glob("*.png")))
        print(f"OK {dest.relative_to(ROOT)} ({n} figuras em aulas-markdown/img/{s}/)")
        if len(re.sub(r"!\[[^\]]*\]\([^)]*\)", "", md).strip()) < 200:
            print(f"POUCO_TEXTO {pdf.name}")
    except Exception as e:  # noqa: BLE001
        falhas += 1
        print(f"FALHA {pdf.name}: {str(e).splitlines()[0] if str(e) else type(e).__name__}")
sys.exit(1 if falhas else 0)
