# Genera la imagen que se ve al compartir kuovahealth.com (WhatsApp, LinkedIn, X, Slack...):
#   python scripts/make-og.py            -> public/images/kuova-og.jpg (1200x630)
#   python scripts/make-og.py --t 52     -> otro fotograma de la seda
# Hace una captura de scripts/og/og.html con Edge o Chrome sin ventana y la guarda en JPG ligero
# (WhatsApp ignora imágenes pesadas: mejor por debajo de ~300 KB).
# Si cambias la imagen, cambia también el nombre del archivo (y en lib/seo.ts): las apps guardan
# la vista previa por dirección y con el mismo nombre seguirían enseñando la vieja.
import argparse
import pathlib
import subprocess
import sys
import tempfile

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / "scripts" / "og" / "og.html"
OUT = ROOT / "public" / "images" / "kuova-og.jpg"
BROWSERS = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--t", type=float, default=46)
    args = parser.parse_args()
    browser = next((b for b in BROWSERS if pathlib.Path(b).exists()), None)
    if not browser:
        print("No encuentro Edge ni Chrome", file=sys.stderr)
        return 1
    with tempfile.TemporaryDirectory() as tmp:
        png = pathlib.Path(tmp) / "og.png"
        subprocess.run(
            [
                browser,
                "--headless=new",
                "--hide-scrollbars",
                "--force-device-scale-factor=1",
                "--enable-unsafe-swiftshader",
                "--use-angle=swiftshader",
                "--virtual-time-budget=6000",
                f"--user-data-dir={tmp}",
                "--window-size=1200,630",
                f"--screenshot={png}",
                f"{TEMPLATE.as_uri()}?t={args.t}",
            ],
            check=True,
            capture_output=True,
        )
        Image.open(png).convert("RGB").save(OUT, "JPEG", quality=86, optimize=True, progressive=True)
    print(f"{OUT.relative_to(ROOT)}: {OUT.stat().st_size // 1024} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
