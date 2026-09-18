"""Convertit les photos sources en WebP aux tailles utilisées par le site (public/images/).

Les originaux de la galerie officielle sont dans sources/galerie-officielle/ (non versionnés, 107 Mo) :
les télécharger depuis https://www.fadalille.fr/photos/ pour relancer ce script.
"""
from PIL import Image, ImageOps
import os

G = 'sources/galerie-officielle'
SORTIE = 'public/images'
QUALITE = 74  # photos à fort grain argentique : au-delà, le poids grimpe sans gain visible

PHOTOS = {
    'bar-soiree': (f'{G}/04.jpg', [1400, 900, 600]),
    'salle-plongee': (f'{G}/02.jpg', [1400, 900, 600]),
    'lustre-mezzanine': ('sources/db64443d6f3861074443d6f3834744v.jpg', [1280, 800]),
    'niches-arc': (f'{G}/03.jpg', [1000, 640]),
    'scene-rideau': (f'{G}/05.jpg', [1000, 640]),
    'fenetre-demi-lune': (f'{G}/06.jpg', [1000, 640]),
    'terrasse': (f'{G}/07.jpg', [1000, 640]),
    'table-menu': (f'{G}/10.jpg', [1000, 640]),
    'vitrine-affiches': (f'{G}/09.jpg', [1000, 640]),
    'assiette-jambon': (f'{G}/11.jpg', [900, 600]),
    'assiettes-partage': (f'{G}/12.jpg', [900, 600]),
    'assiette-legumes': (f'{G}/13.jpg', [900, 600]),
    'dessert': (f'{G}/16.jpg', [900, 600]),
    'cocktail-mousse': (f'{G}/19.jpg', [900, 600]),
    'spritz-table': (f'{G}/18.jpg', [900, 600]),
    'shot-bar': (f'{G}/21.jpg', [900, 600]),
    'degustation': (f'{G}/22.jpg', [900, 600]),
    'neon-dj': ('sources/image.jpg', [460]),
}

os.makedirs(SORTIE, exist_ok=True)
for nom, (chemin, largeurs) in PHOTOS.items():
    image = ImageOps.exif_transpose(Image.open(chemin)).convert('RGB')
    for i, largeur in enumerate(largeurs):
        hauteur = round(image.height * largeur / image.width)
        reduite = image.resize((largeur, hauteur), Image.LANCZOS) if largeur < image.width else image
        suffixe = '' if i == 0 else f'-{largeur}'
        fichier = f'{SORTIE}/{nom}{suffixe}.webp'
        reduite.save(fichier, 'WEBP', quality=QUALITE, method=6)
        print(f'{fichier:44} {reduite.width}x{reduite.height} {os.path.getsize(fichier) // 1024} Ko')

# Image de partage (réseaux sociaux), 1200 x 630
image = ImageOps.exif_transpose(Image.open(f'{G}/04.jpg')).convert('RGB')
largeur = 1200
hauteur = round(image.height * largeur / image.width)
image = image.resize((largeur, hauteur), Image.LANCZOS)
haut = round(hauteur * 0.36)
image.crop((0, haut, 1200, haut + 630)).save(f'{SORTIE}/og-image.jpg', 'JPEG', quality=82, optimize=True)
print('og-image.jpg')

# Motif tigré officiel (page 2 de la carte du restaurant), en masques WebP : la couleur est donnée en CSS.
# Raccord en miroir pour pouvoir le répéter sans couture.
import pymupdf
import numpy as np

page = pymupdf.open('sources/cartes/carte-restaurant.pdf')[1]


def masque_motif(dpi):
    pix = page.get_pixmap(dpi=dpi)
    gris = np.array(Image.frombytes('RGB', (pix.width, pix.height), pix.samples).convert('L')).astype(float)
    return Image.fromarray((np.clip((238 - gris) / (238 - 25), 0, 1) * 255).astype('uint8'))


def enregistrer_masque(alpha, fichier):
    rgba = Image.new('RGBA', alpha.size, (0, 0, 0, 0))
    rgba.putalpha(alpha)
    rgba.save(fichier, 'WEBP', quality=70, method=6, alpha_quality=60)
    print(fichier, alpha.size, os.path.getsize(fichier) // 1024, 'Ko')


h = masque_motif(144).rotate(90, expand=True)
bande = Image.new('L', (h.width * 2, h.height))
bande.paste(h, (0, 0))
bande.paste(ImageOps.mirror(h), (h.width, 0))
enregistrer_masque(bande.resize((bande.width * 3 // 4, bande.height * 3 // 4), Image.LANCZOS), f'{SORTIE}/motif-tigre.webp')

v = masque_motif(72)
colonne = Image.new('L', (v.width, v.height * 2))
colonne.paste(v, (0, 0))
colonne.paste(ImageOps.flip(v), (0, v.height))
enregistrer_masque(colonne, f'{SORTIE}/motif-tigre-vertical.webp')
