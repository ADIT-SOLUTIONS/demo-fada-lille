"""Redessine le logo FADA en vectoriel d'après le PNG officiel (sources/marque/logo-fada-officiel.png).

Formes mesurées au pixel, réunies en un seul contour (utile pour le néon de la version 2).
Écrit src/data/logo-trace.ts et affiche l'écart avec le PNG.
"""
from shapely.geometry import Polygon, box
from shapely.ops import unary_union
from PIL import Image, ImageDraw
import numpy as np

def pente(x_haut, y_haut, x_bas, y_bas):
    return lambda y: x_haut + (x_bas - x_haut) * (y - y_haut) / (y_bas - y_haut)

# F : fût, barre haute, barre du milieu (qui se soude au premier A)
F = unary_union([box(38, 600, 188, 900), box(38, 600, 357, 705), box(38, 735, 420, 826)])

def lettre_a(g_haut, d_haut, sommet):
    """A aux jambes inclinées ; contre-forme triangulaire et ouverture sous la barre."""
    g = pente(g_haut, 600, g_haut - 95, 900)
    d = pente(d_haut, 600, d_haut + 96, 900)
    ig = pente(sommet - 1, 668, sommet - 61, 900)
    id_ = pente(sommet + 1, 668, sommet + 61, 900)
    exterieur = Polygon([(g_haut, 600), (d_haut, 600), (d(900), 900), (g(900), 900)])
    contre = Polygon([(sommet - 1, 668), (sommet + 1, 668), (id_(779), 779), (ig(779), 779)])
    ouverture = Polygon([(ig(862), 862), (id_(862), 862), (id_(900.5), 900.5), (ig(900.5), 900.5)])
    return exterieur.difference(contre).difference(ouverture)

A1 = lettre_a(399, 640, 519)
A2 = lettre_a(1125, 1366, 1245)

# D : fût droit, panse mesurée ; la partie cachée sous le second A passe à l'intérieur de sa jambe
D_ext = Polygon([
    (691, 600), (928, 600), (971, 604), (992, 608), (1007, 612), (1018, 616), (1028, 620), (1043, 628),
    (1054, 636), (1062, 644), (1069, 652), (1075, 660), (1079, 668), (1083, 676), (1086, 684),
    (1095, 720), (1098, 750), (1095, 790), (1080, 830), (1060, 850), (1042, 860),
    (1028, 870), (1005, 880), (983, 890), (960, 895), (939, 898), (915, 900), (691, 900),
])
D_contre = Polygon([
    (842, 703), (888, 703), (906, 706), (914, 709), (919, 712), (925, 718), (929, 724), (932, 730),
    (934, 739), (935, 751), (934, 763), (932, 772), (929, 781), (925, 787), (921, 793), (913, 799),
    (907, 802), (899, 805), (888, 807), (842, 807),
])
D = D_ext.difference(D_contre)

logo = unary_union([F, A1, D, A2])

# Contrôle : écart avec le PNG officiel
png = np.array(Image.open('sources/marque/logo-fada-officiel.png').convert('RGB')).astype(int)
cible = (png[:, :, 0] < 200) & (png[:, :, 1] < 150)
rendu = Image.new('L', (png.shape[1], png.shape[0]), 0)
dessin = ImageDraw.Draw(rendu)
formes = logo.geoms if logo.geom_type == 'MultiPolygon' else [logo]
for f in formes:
    dessin.polygon(list(f.exterior.coords), fill=255)
    for trou in f.interiors:
        dessin.polygon(list(trou.coords), fill=0)
r = np.array(rendu) > 127
iou = (r & cible).sum() / (r | cible).sum()
print(f'IoU avec le PNG officiel : {iou:.4f} ; formes : {len(list(formes))}')

# Chemin SVG, origine en haut à gauche du logo (largeur 1424, hauteur 300)
def anneau(coords):
    pts = [(round(x - 38, 1), round(y - 600, 1)) for x, y in coords][:-1]
    fmt = lambda v: ('%g' % v)
    return 'M' + ' L'.join(f'{fmt(x)} {fmt(y)}' for x, y in pts) + ' Z'

chemins = []
contours = []
for f in formes:
    chemins.append(anneau(f.exterior.coords))
    contours.append([[round(x - 38, 1), round(y - 600, 1)] for x, y in list(f.exterior.coords)[:-1]])
    for trou in f.interiors:
        chemins.append(anneau(trou.coords))
        contours.append([[round(x - 38, 1), round(y - 600, 1)] for x, y in list(trou.coords)[:-1]])

with open('src/data/logo-trace.ts', 'w', encoding='utf-8') as sortie:
    sortie.write('// Généré par scripts/logo-fada.py d\'après le logo officiel : ne pas modifier à la main.\n\n')
    sortie.write('/** Dimensions du logo FADA dans son repère SVG. */\n')
    sortie.write('export const LOGO_LARGEUR = 1424\nexport const LOGO_HAUTEUR = 300\n\n')
    sortie.write('/** Contour du logo (règle de remplissage evenodd : les contre-formes sont des trous). */\n')
    sortie.write(f"export const LOGO_CHEMIN =\n  '{' '.join(chemins)}'\n\n")
    sortie.write('/** Mêmes contours sous forme de points, pour le néon en 3D. */\n')
    sortie.write('export const LOGO_CONTOURS: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = ')
    sortie.write(str(contours).replace(' ', '').replace('],[', '], [').replace('.0]', ']').replace('.0,', ',') + '\n')
print('écrit src/data/logo-trace.ts')
