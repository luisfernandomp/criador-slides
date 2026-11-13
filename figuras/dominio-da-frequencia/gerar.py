import os, math, time
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import cv2
from skimage import data

OUT = os.path.dirname(os.path.abspath(__file__))

def salvar(fig, nome):
    fig.savefig(os.path.join(OUT, nome), dpi=90, bbox_inches="tight")
    plt.close(fig)

def espectro_log(img):
    return np.log1p(np.abs(np.fft.fftshift(np.fft.fft2(img))))

def mostrar(ax, im, titulo, cmap="gray"):
    ax.imshow(im, cmap=cmap); ax.set_title(titulo, fontsize=11); ax.axis("off")

def dft2d(image):
    M = len(image); N = len(image[0])
    sp = [[0 for _ in range(N)] for _ in range(M)]
    for u in range(M):
        for v in range(N):
            rs = 0.0; im = 0.0
            for r in range(M):
                for c in range(N):
                    th = 2*math.pi*((u*r/M)+(v*c/N))
                    rs += image[r][c]*math.cos(th)
                    im += image[r][c]*math.sin(th)
            sp[u][v] = complex(rs, -im)
    return sp

def fig_serie():
    x = np.linspace(0, 2*np.pi, 1000)
    q = np.sign(np.sin(x))
    fig, ax = plt.subplots(1, 4, figsize=(16, 4))
    for a, n in zip(ax, [1, 2, 3, 10]):
        s = sum((4/np.pi)*np.sin((2*k+1)*x)/(2*k+1) for k in range(n))
        a.plot(x, q, "r", lw=1); a.plot(x, s, "b")
        a.set_title(f"{n} seno{'s' if n>1 else ''}")
    salvar(fig, "serie-fourier-quadrada.png")

def fig_reversibilidade():
    img = data.camera().astype(float)
    F = np.fft.fft2(img); volta = np.fft.ifft2(F).real
    erro = np.abs(img-volta)
    fig, ax = plt.subplots(1, 4, figsize=(16, 4))
    mostrar(ax[0], img, "Original")
    mostrar(ax[1], espectro_log(img), "Espectro (log)")
    mostrar(ax[2], volta, "Reconstruída (IFFT)")
    mostrar(ax[3], erro, f"Diferença (máx {erro.max():.1e})")
    ax[3].images[0].set_clim(0, 255)
    salvar(fig, "reversibilidade.png")

def fig_ft1d():
    fs = 100; t = np.arange(0, 2, 1/fs)
    s = np.cos(2*np.pi*3*t)+0.5*np.cos(2*np.pi*10*t)
    F = np.fft.fft(s); fr = np.fft.fftfreq(len(t), d=1/fs)
    h = len(t)//2
    fig, ax = plt.subplots(1, 3, figsize=(15, 3.8))
    ax[0].plot(t, s); ax[0].set_title("Tempo: 3 Hz + 10 Hz"); ax[0].set_xlabel("s")
    ax[1].stem(fr[:h], np.abs(F)[:h]); ax[1].set_xlim(0, 20)
    ax[1].set_title("Espectro: picos em 3 e 10 Hz"); ax[1].set_xlabel("Hz")
    x = np.arange(-256, 256); p = (np.abs(x) <= 8).astype(float)
    P = np.abs(np.fft.fftshift(np.fft.fft(p)))
    ax[2].plot(np.linspace(-0.5, 0.5, 512), P)
    ax[2].set_xlim(-0.2, 0.2); ax[2].set_title("Pulso retangular -> sinc")
    salvar(fig, "ft-1d.png")

def fig_mag_fase():
    a = data.camera().astype(float)
    b = cv2.resize(data.astronaut().mean(axis=2), (512, 512)).astype(float)
    Fa, Fb = np.fft.fft2(a), np.fft.fft2(b)
    m1 = np.fft.ifft2(np.abs(Fa)*np.exp(1j*np.angle(Fb))).real
    m2 = np.fft.ifft2(np.abs(Fb)*np.exp(1j*np.angle(Fa))).real
    fig, ax = plt.subplots(1, 4, figsize=(16, 4))
    mostrar(ax[0], a, "Camera"); mostrar(ax[1], b, "Astronaut")
    mostrar(ax[2], m1, "Magnitude camera\n+ fase astronaut")
    mostrar(ax[3], m2, "Magnitude astronaut\n+ fase camera")
    salvar(fig, "magnitude-vs-fase.png")

def fig_dft_manual():
    img = cv2.resize(data.camera(), (32, 32), interpolation=cv2.INTER_AREA).astype(float)
    Fm = np.array(dft2d(img.tolist())); Ff = np.fft.fft2(img)
    def lg(F): return np.log1p(np.abs(np.fft.fftshift(F)))
    lados = [8, 16, 32]; tm = []; tf = []
    for n in lados:
        im = np.random.rand(n, n)
        t0 = time.perf_counter(); dft2d(im.tolist()); tm.append(time.perf_counter()-t0)
        t0 = time.perf_counter()
        for _ in range(100): np.fft.fft2(im)
        tf.append((time.perf_counter()-t0)/100)
    fig, ax = plt.subplots(1, 5, figsize=(20, 4))
    mostrar(ax[0], img, "Camera 32x32"); mostrar(ax[1], lg(Fm), "dft2d manual (log)")
    mostrar(ax[2], lg(Ff), "np.fft.fft2 (log)")
    d = np.abs(Fm-Ff); mostrar(ax[3], d, f"Diferença (máx {d.max():.1e})")
    ax[3].images[0].set_clim(0, 1)
    ax[4].semilogy(lados, tm, "o-", label="manual (4 laços)")
    ax[4].semilogy(lados, tf, "s-", label="FFT")
    ax[4].set_xticks(lados); ax[4].set_xlabel("lado da imagem (px)"); ax[4].set_ylabel("segundos")
    ax[4].set_title("Tempo (escala log)"); ax[4].legend()
    salvar(fig, "dft-manual-vs-fft.png")

def fig_visualizar():
    img = data.camera().astype(float)
    F = np.fft.fft2(img); mag = np.abs(F); mc = np.fft.fftshift(mag)
    fig, ax = plt.subplots(1, 4, figsize=(16, 4))
    mostrar(ax[0], img, "Camera"); mostrar(ax[1], mag, "Magnitude crua")
    mostrar(ax[2], mc, "Após fftshift")
    mostrar(ax[3], np.log(mc+1e-7), "fftshift + log")
    salvar(fig, "visualizar-espectro.png")

def fig_idft():
    img = cv2.resize(data.camera(), (64, 64), interpolation=cv2.INTER_AREA).astype(float)
    F = np.fft.fft2(img)
    rec = np.fft.ifft2(F).real
    lim = np.quantile(np.abs(F), 0.95)
    F5 = np.where(np.abs(F) >= lim, F, 0)
    rec5 = np.fft.ifft2(F5).real
    fig, ax = plt.subplots(1, 4, figsize=(16, 4))
    mostrar(ax[0], img, "Camera 64x64"); mostrar(ax[1], espectro_log(img), "Espectro (log)")
    mostrar(ax[2], rec, "Todas as frequências")
    mostrar(ax[3], rec5, "Só 5% maiores magnitudes")
    salvar(fig, "idft-reconstrucao.png")

def fig_dualidade():
    n = 128
    a = np.zeros((n, n)); a[n//2, n//2] = 1
    b = np.full((n, n), 0.5)
    c = np.zeros((n, n)); c[n//2-4:n//2+4, n//2-4:n//2+4] = 1
    d = np.zeros((n, n)); d[n//2-24:n//2+24, n//2-24:n//2+24] = 1
    nomes = ["Pixel branco", "Imagem cinza", "Quadrado pequeno", "Quadrado grande"]
    fig, ax = plt.subplots(2, 4, figsize=(16, 8))
    for i, (im, nm) in enumerate(zip([a, b, c, d], nomes)):
        mostrar(ax[0, i], im, nm); ax[0, i].images[0].set_clim(0, 1)
        mostrar(ax[1, i], espectro_log(im), "Espectro (log)")
    salvar(fig, "dualidade.png")

def fig_convolucao():
    img = data.camera().astype(np.float32)
    k = cv2.getGaussianKernel(15, 3); k = (k @ k.T).astype(np.float32)
    esp = cv2.filter2D(img, -1, k, borderType=cv2.BORDER_WRAP)
    H = np.fft.fft2(k, s=img.shape)
    fr = np.fft.ifft2(np.fft.fft2(img)*H).real
    fr = np.roll(fr, (-7, -7), axis=(0, 1))
    dif = np.abs(esp-fr).max()
    fig, ax = plt.subplots(1, 4, figsize=(16, 4))
    mostrar(ax[0], img, "Camera")
    mostrar(ax[1], esp, "Convolução espacial (Gauss)")
    mostrar(ax[2], fr, f"Multiplicação em frequência\n(dif. máx {dif:.1e})")
    mostrar(ax[3], np.log1p(np.abs(np.fft.fftshift(H))), "Espectro log do filtro H")
    salvar(fig, "convolucao-vs-multiplicacao.png")

def fig_filtros():
    img = data.camera().astype(float); M, N = img.shape
    F = np.fft.fftshift(np.fft.fft2(img))
    u, v = np.ogrid[:M, :N]; D = np.sqrt((u-M/2)**2+(v-N/2)**2)
    def ap(H): return np.fft.ifft2(np.fft.ifftshift(F*H)).real
    pb = lambda d0: (D <= d0).astype(float)
    fig, ax = plt.subplots(2, 4, figsize=(16, 8))
    mostrar(ax[0, 0], img, "Original"); mostrar(ax[0, 1], espectro_log(img), "Espectro (log)")
    mostrar(ax[0, 2], ap(pb(30)), "Passa-baixa D0=30")
    mostrar(ax[0, 3], ap(1-pb(30)), "Passa-alta D0=30")
    ax[0, 3].images[0].set_clim(-40, 40)
    for a, d0 in zip(ax[1, 1:], [10, 30, 80]):
        mostrar(a, ap(pb(d0)), f"Passa-baixa D0={d0}")
    mostrar(ax[1, 0], pb(30), "Máscara passa-baixa D0=30")
    salvar(fig, "filtros-frequencia.png")

def fig_amostragem():
    t = np.linspace(0, 1, 2000); s = np.sin(2*np.pi*5*t)
    fig, ax = plt.subplots(2, 3, figsize=(15, 7))
    for a, fs in zip(ax[0], [50, 12, 6]):
        ta = np.arange(0, 1, 1/fs); xq = np.round(np.sin(2*np.pi*5*ta)*3)/3
        a.plot(t, s, "lightgray"); a.stem(ta, xq); a.set_title(f"{fs} amostras/s")
    img = data.camera()
    for a, n in zip(ax[1], [256, 16, 4]):
        q = np.floor(img/256*n)*(255/(n-1))
        mostrar(a, q, f"{n} níveis de cinza"); a.images[0].set_clim(0, 255)
    salvar(fig, "amostragem-quantizacao.png")

def fig_nyquist():
    f = 5; tf = np.linspace(0, 1, 1000)
    fig, ax = plt.subplots(1, 3, figsize=(16, 3.8))
    for a, fs in zip(ax[:2], [30, 8]):
        ta = np.arange(0, 1, 1/fs); xa = np.sin(2*np.pi*f*ta)
        rec = sum(x*np.sinc((tf-t0)*fs) for x, t0 in zip(xa, ta))
        a.plot(tf, np.sin(2*np.pi*f*tf), "lightgray", lw=3, label="original")
        a.plot(tf, rec, "b", label="reconstruído"); a.plot(ta, xa, "ro")
        a.set_title(f"fs={fs} Hz ({'fiel' if fs > 2*f else 'abaixo de Nyquist'})")
        a.legend(loc="upper right", fontsize=8)
    # espectro com cópias
    a = ax[2]; fr = np.linspace(-60, 60, 2000)
    tri = lambda x, c: np.clip(1-np.abs(x-c)/10, 0, None)
    for fs, cor, ls in [(40, "tab:blue", "-"), (14, "tab:red", "--")]:
        tot = sum(tri(fr, k*fs) for k in range(-4, 5))
        a.plot(fr, tot, cor, ls=ls, label=f"fs={fs} (banda 10)")
    a.set_title("Cópias do espectro: separadas x sobrepostas"); a.set_xlabel("Hz"); a.legend(fontsize=8)
    salvar(fig, "nyquist.png")

def fig_aliasing():
    t = np.linspace(0, 1, 2000); fs = 10
    ta = np.arange(0, 1, 1/fs)
    fig, ax = plt.subplots(1, 3, figsize=(16, 4))
    ax[0].plot(t, np.sin(2*np.pi*9*t), "lightgray")
    ax[0].plot(ta, np.sin(2*np.pi*9*ta), "ko")
    ax[0].plot(t, -np.sin(2*np.pi*t), "r--"); ax[0].set_title("9 Hz amostrado a 10/s parece 1 Hz")
    img = data.checkerboard()
    ruim = cv2.resize(data.brick(), None, fx=0.2, fy=0.2, interpolation=cv2.INTER_NEAREST)
    mostrar(ax[1], data.brick(), "Brick original")
    mostrar(ax[2], ruim, "Reduzida 5x sem filtro (moiré)")
    salvar(fig, "aliasing.png")

def fig_antialiasing():
    img = data.brick()
    ruim = cv2.resize(img, None, fx=0.25, fy=0.25, interpolation=cv2.INTER_NEAREST)
    bom = cv2.resize(cv2.GaussianBlur(img, (0, 0), sigmaX=2), None, fx=0.25, fy=0.25, interpolation=cv2.INTER_NEAREST)
    fig, ax = plt.subplots(2, 3, figsize=(13, 8))
    for i, (im, nm) in enumerate([(img, "Original"), (ruim, "Reduzida 4x sem filtro"), (bom, "Gauss antes, depois reduzida")]):
        mostrar(ax[0, i], im, nm)
        s = espectro_log(im.astype(float))
        mostrar(ax[1, i], s, "Espectro (log)")
    salvar(fig, "antialiasing.png")

if __name__ == "__main__":
    for f in [fig_serie, fig_reversibilidade, fig_ft1d, fig_mag_fase, fig_dft_manual,
              fig_visualizar, fig_idft, fig_dualidade, fig_convolucao, fig_filtros,
              fig_amostragem, fig_nyquist, fig_aliasing, fig_antialiasing]:
        f()
