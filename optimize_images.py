from pathlib import Path
from PIL import Image

root = Path('images')
out_dir = root / 'optimized'
out_dir.mkdir(exist_ok=True)

for path in sorted(root.iterdir()):
    if not path.is_file():
        continue
    if path.suffix.lower() not in {'.jpg', '.jpeg', '.png', '.gif'}:
        continue
    if path.name.startswith('.') or path.name == 'optimized':
        continue
    out_path = out_dir / f'{path.stem}.webp'
    if out_path.exists():
        continue
    try:
        with Image.open(path) as img:
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGBA')
            else:
                img = img.convert('RGB')
            width, height = img.size
            max_dim = 1400
            if max(width, height) > max_dim:
                if width >= height:
                    new_width = max_dim
                    new_height = max(1, int(height * max_dim / width))
                else:
                    new_height = max_dim
                    new_width = max(1, int(width * max_dim / height))
                img = img.resize((new_width, new_height), Image.LANCZOS)
            img.save(out_path, 'WEBP', quality=78, optimize=True)
            print(f'created {out_path}')
    except Exception as e:
        print(f'skipped {path.name}: {e}')
