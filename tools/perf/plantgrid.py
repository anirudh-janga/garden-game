"""Montage the tiles plantgrid.cjs made into labelled sheets: python3 plantgrid.py <dir> [per_row] [rows]."""
import json, sys, os
from PIL import Image, ImageDraw
d = sys.argv[1]; per = int(sys.argv[2]) if len(sys.argv) > 2 else 6; rows = int(sys.argv[3]) if len(sys.argv) > 3 else 3
lst = json.load(open(os.path.join(d, 'list.json')))
W, H = 260, 290
for s in range(0, len(lst), per * rows):
    chunk = lst[s:s + per * rows]
    sheet = Image.new('RGB', (W * per, (H + 18) * ((len(chunk) + per - 1) // per)), 'white')
    dr = ImageDraw.Draw(sheet)
    for i, p in enumerate(chunk):
        im = Image.open(os.path.join(d, p['id'] + '.png')).crop((20, 25, 280, 315))
        x, y = (i % per) * W, (i // per) * (H + 18)
        sheet.paste(im, (x, y + 18))
        dr.text((x + 4, y + 3), f"{p['id']} ({p['h']}m)", fill='black')
    sheet.save(os.path.join(d, f'sheet_{s // (per * rows)}.png'))
    print(os.path.join(d, f'sheet_{s // (per * rows)}.png'))
