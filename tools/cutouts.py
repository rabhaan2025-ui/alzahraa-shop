"""Download listed Unsplash photos, save small previews, and cut out backgrounds for the ones marked yes."""
import io, os, sys, urllib.request
from PIL import Image
from rembg import remove, new_session

OUT = 'tools/out'
os.makedirs(OUT, exist_ok=True)
session = new_session('isnet-general-use')
for line in open('tools/photos.txt', encoding='utf8'):
    line = line.strip()
    if not line or line.startswith('#'):
        continue
    name, pid, cut = line.split()
    url = 'https://images.unsplash.com/' + pid + '?w=3200&fm=jpg&q=92'
    try:
        data = urllib.request.urlopen(url, timeout=60).read()
    except Exception as e:
        print('FAIL', name, e); continue
    im = Image.open(io.BytesIO(data)).convert('RGB')
    prev = im.copy(); prev.thumbnail((1600, 1600)); prev.save(OUT + '/' + name + '-orig.jpg', quality=86)
    if cut == 'yes':
        res = remove(im, session=session, post_process_mask=True)
        bbox = res.getbbox()
        if bbox:
            res = res.crop(bbox)
        res.thumbnail((2000, 2000))
        res.save(OUT + '/' + name + '-cut.png', optimize=True)
    print('ok', name, im.size)
