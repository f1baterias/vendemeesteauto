#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
 Vendeme Este Auto - Panel de Administracion
 Herramienta de gestion de vehiculos para la concesionaria.

 Requisitos: Python 3.x con tkinter (incluido por defecto).
 Opcional: Pillow (pip install Pillow) para ver miniaturas de fotos.

 Uso: python admin.py
=============================================================================
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import json
import os
import shutil
import subprocess
import uuid
import re
import unicodedata

# ── Intentar importar Pillow para miniaturas ──────────────────────────────
try:
    from PIL import Image, ImageTk
    PILLOW_DISPONIBLE = True
except ImportError:
    PILLOW_DISPONIBLE = False

# ══════════════════════════════════════════════════════════════════════════
#  CONFIGURACION
# ══════════════════════════════════════════════════════════════════════════

# Directorio base = donde esta este script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_JSON_PATH = os.path.join(BASE_DIR, "data", "cars", "data.json")
IMG_BASE_DIR = os.path.join(BASE_DIR, "res", "cars", "img")

# ── Paleta de colores (tema oscuro moderno) ───────────────────────────────
COLOR_BG = "#111111"
COLOR_BG_CARD = "#1a1a1a"
COLOR_BG_SIDEBAR = "#161616"
COLOR_BG_INPUT = "#222222"
COLOR_BG_INPUT_FOCUS = "#2a2a2a"
COLOR_BG_HOVER = "#1e1e1e"
COLOR_TEXTO = "#e8e8e8"
COLOR_TEXTO_SECUNDARIO = "#888888"
COLOR_TEXTO_PLACEHOLDER = "#555555"
COLOR_ORO = "#d4af37"
COLOR_ORO_HOVER = "#e0c04a"
COLOR_ORO_OSCURO = "#b8960c"
COLOR_ROJO = "#dc3545"
COLOR_ROJO_HOVER = "#c82333"
COLOR_VERDE = "#28a745"
COLOR_VERDE_HOVER = "#218838"
COLOR_AZUL = "#2d6bcf"
COLOR_AZUL_HOVER = "#3a7be0"
COLOR_BORDE = "#2a2a2a"
COLOR_BORDE_INPUT = "#333333"
COLOR_SELECCION = "#2a2510"
COLOR_SELECCION_HOVER = "#332e18"
COLOR_HEADER_BAR = "#0d0d0d"

# Opciones para los dropdowns del formulario
MARCAS = [
    "Toyota", "Volkswagen", "Ford", "Chevrolet", "Fiat", "Peugeot",
    "Renault", "Honda", "Nissan", "Jeep", "Citro\u00ebn", "Hyundai",
    "Kia", "Mercedes-Benz", "BMW", "Audi", "Otra"
]
COMBUSTIBLES = ["Nafta", "Diesel", "GNC", "H\u00edbrido", "El\u00e9ctrico"]
CARROCERIAS = [
    "Sed\u00e1n", "Hatchback", "SUV", "Camioneta", "Coup\u00e9",
    "Familiar", "Descapotable", "Cami\u00f3n", "Coche peque\u00f1o", "Otra"
]
ANIOS = [str(a) for a in range(2026, 1989, -1)]  # 2026 a 1990

# Tamano de miniaturas
THUMB_LISTA_SIZE = (70, 52)     # Miniatura en la lista lateral
THUMB_FOTO_SIZE = (120, 90)     # Miniatura en la seccion de fotos del formulario

# Espaciado consistente
PAD_SECTION = 20        # Padding entre secciones
PAD_FIELD = 6           # Padding entre campos
PAD_CARD_X = 20         # Padding horizontal dentro de cards
PAD_CARD_Y = 16         # Padding vertical dentro de cards
BORDER_RADIUS = 0       # tkinter no soporta border-radius real


# ══════════════════════════════════════════════════════════════════════════
#  FUNCIONES AUXILIARES
# ══════════════════════════════════════════════════════════════════════════

def cargar_datos():
    """Carga el archivo data.json. Si no existe, crea uno vacio."""
    os.makedirs(os.path.dirname(DATA_JSON_PATH), exist_ok=True)

    if not os.path.exists(DATA_JSON_PATH):
        datos_vacios = {"autos": []}
        with open(DATA_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(datos_vacios, f, ensure_ascii=False, indent=2)
        return datos_vacios

    try:
        with open(DATA_JSON_PATH, "r", encoding="utf-8") as f:
            datos = json.load(f)
        if "autos" not in datos:
            datos["autos"] = []
        return datos
    except (json.JSONDecodeError, IOError) as e:
        messagebox.showerror(
            "Error al cargar datos",
            f"No se pudo leer data.json:\n{e}\n\nSe creara uno nuevo."
        )
        datos_vacios = {"autos": []}
        with open(DATA_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(datos_vacios, f, ensure_ascii=False, indent=2)
        return datos_vacios


def guardar_datos(datos):
    """Guarda los datos en data.json con formato legible."""
    os.makedirs(os.path.dirname(DATA_JSON_PATH), exist_ok=True)
    with open(DATA_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(datos, f, ensure_ascii=False, indent=2)


def generar_id(marca, modelo, anio):
    """
    Genera un ID unico a partir de marca, modelo y ano.
    Ejemplo: "Ford", "EcoSport", "2010" -> "ford_ecosport_2010"
    Si ya existe, agrega _2, _3, etc.
    """
    texto = f"{marca}_{modelo}_{anio}"
    texto = unicodedata.normalize("NFKD", texto)
    texto = texto.encode("ascii", "ignore").decode("ascii")
    texto = texto.lower().strip()
    texto = re.sub(r"[^a-z0-9]+", "_", texto)
    texto = texto.strip("_")
    return texto


def id_unico(id_base, datos, id_actual=None):
    """
    Asegura que el ID sea unico. Si ya existe (y no es el propio auto
    que estamos editando), agrega un sufijo numerico.
    """
    ids_existentes = {a["id"] for a in datos.get("autos", []) if a["id"] != id_actual}
    if id_base not in ids_existentes:
        return id_base
    contador = 2
    while f"{id_base}_{contador}" in ids_existentes:
        contador += 1
    return f"{id_base}_{contador}"


def crear_miniatura(ruta_imagen, tamanio):
    """
    Crea una miniatura de la imagen. Requiere Pillow.
    Devuelve un objeto PhotoImage de tkinter o None si falla.
    """
    if not PILLOW_DISPONIBLE:
        return None
    try:
        img = Image.open(ruta_imagen)
        img.thumbnail(tamanio, Image.LANCZOS)
        return ImageTk.PhotoImage(img)
    except Exception:
        return None


def formatear_precio(precio):
    """Formatea el precio con separador de miles."""
    try:
        return f"USD {int(precio):,}".replace(",", ".")
    except (ValueError, TypeError):
        return f"USD {precio}"


# ══════════════════════════════════════════════════════════════════════════
#  TOOLTIP (ayuda emergente al pasar el mouse)
# ══════════════════════════════════════════════════════════════════════════

class Tooltip:
    """Muestra un tooltip al pasar el mouse sobre un widget."""
    def __init__(self, widget, texto):
        self.widget = widget
        self.texto = texto
        self.tooltip_ventana = None
        widget.bind("<Enter>", self.mostrar)
        widget.bind("<Leave>", self.ocultar)

    def mostrar(self, event=None):
        if self.tooltip_ventana:
            return
        x = self.widget.winfo_rootx() + 20
        y = self.widget.winfo_rooty() + self.widget.winfo_height() + 5
        self.tooltip_ventana = tw = tk.Toplevel(self.widget)
        tw.wm_overrideredirect(True)
        tw.wm_geometry(f"+{x}+{y}")
        label = tk.Label(
            tw, text=self.texto, justify="left",
            background="#2a2a2a", foreground="#e8e8e8",
            relief="solid", borderwidth=1,
            font=("Segoe UI", 9), padx=8, pady=5
        )
        label.pack()

    def ocultar(self, event=None):
        if self.tooltip_ventana:
            self.tooltip_ventana.destroy()
            self.tooltip_ventana = None


# ══════════════════════════════════════════════════════════════════════════
#  APLICACION PRINCIPAL
# ══════════════════════════════════════════════════════════════════════════

class AplicacionAdmin:
    """Ventana principal de administracion de vehiculos."""

    def __init__(self, root):
        self.root = root
        self.root.title("Vendeme Este Auto - Administrador")
        self.root.geometry("1200x800")
        self.root.minsize(1000, 650)
        self.root.configure(bg=COLOR_BG)

        # Intentar poner un icono
        try:
            self.root.iconbitmap(os.path.join(BASE_DIR, "favicon.ico"))
        except Exception:
            pass

        # ── Estado de la aplicacion ───────────────────────────────────
        self.datos = cargar_datos()
        self.auto_seleccionado_id = None
        self.modo_edicion = False
        # Lista unificada de fotos: cada elemento es una tupla (tipo, valor)
        # tipo="existente" -> valor es el nombre de archivo en disco
        # tipo="nueva"     -> valor es la ruta absoluta al archivo original
        self.fotos_lista = []
        self.thumbs_cache = {}
        self.lista_thumbs = []

        # ── Configurar estilos ttk ────────────────────────────────────
        self._configurar_estilos()

        # ── Construir interfaz ────────────────────────────────────────
        self._construir_interfaz()

        # ── Cargar lista de autos ─────────────────────────────────────
        self.refrescar_lista()
        self.limpiar_formulario()

    # ──────────────────────────────────────────────────────────────────
    #  ESTILOS TTK
    # ──────────────────────────────────────────────────────────────────
    def _configurar_estilos(self):
        """Configura los estilos de ttk para el tema oscuro moderno."""
        estilo = ttk.Style()
        estilo.theme_use("clam")

        # Estilo general
        estilo.configure(".", background=COLOR_BG, foreground=COLOR_TEXTO,
                         fieldbackground=COLOR_BG_INPUT, font=("Segoe UI", 10))

        # Frame
        estilo.configure("TFrame", background=COLOR_BG)
        estilo.configure("Card.TFrame", background=COLOR_BG_CARD)
        estilo.configure("Sidebar.TFrame", background=COLOR_BG_SIDEBAR)

        # Label
        estilo.configure("TLabel", background=COLOR_BG, foreground=COLOR_TEXTO,
                         font=("Segoe UI", 10))
        estilo.configure("CardLabel.TLabel", background=COLOR_BG_CARD,
                         foreground=COLOR_TEXTO, font=("Segoe UI", 10))

        # Entry
        estilo.configure("TEntry", fieldbackground=COLOR_BG_INPUT,
                         foreground=COLOR_TEXTO, insertcolor=COLOR_TEXTO)

        # Combobox
        estilo.configure("TCombobox", fieldbackground=COLOR_BG_INPUT,
                         foreground=COLOR_TEXTO, selectbackground=COLOR_ORO_OSCURO,
                         selectforeground=COLOR_TEXTO)
        estilo.map("TCombobox",
                   fieldbackground=[("readonly", COLOR_BG_INPUT)],
                   foreground=[("readonly", COLOR_TEXTO)],
                   selectbackground=[("readonly", COLOR_ORO_OSCURO)])

        # Checkbutton
        estilo.configure("TCheckbutton", background=COLOR_BG_CARD,
                         foreground=COLOR_TEXTO, font=("Segoe UI", 10))
        estilo.map("TCheckbutton",
                   background=[("active", COLOR_BG_CARD)],
                   foreground=[("active", COLOR_ORO)])

        # Scrollbar
        estilo.configure("TScrollbar", background=COLOR_BG_CARD,
                         troughcolor=COLOR_BG_SIDEBAR, arrowcolor=COLOR_TEXTO_SECUNDARIO)

        # Separator
        estilo.configure("TSeparator", background=COLOR_BORDE)

    # ──────────────────────────────────────────────────────────────────
    #  CONSTRUCCION DE LA INTERFAZ
    # ──────────────────────────────────────────────────────────────────
    def _construir_interfaz(self):
        """Construye toda la interfaz grafica."""

        # ══════════════════════════════════════════════════════════════
        #  BARRA SUPERIOR (Header)
        # ══════════════════════════════════════════════════════════════
        header = tk.Frame(self.root, bg=COLOR_HEADER_BAR, height=56)
        header.pack(fill="x", side="top")
        header.pack_propagate(False)

        header_inner = tk.Frame(header, bg=COLOR_HEADER_BAR)
        header_inner.pack(fill="both", expand=True, padx=20)

        # Logo / Titulo
        frame_logo = tk.Frame(header_inner, bg=COLOR_HEADER_BAR)
        frame_logo.pack(side="left", pady=10)

        tk.Label(
            frame_logo, text="VENDEME ESTE AUTO",
            font=("Segoe UI", 13, "bold"), fg=COLOR_ORO, bg=COLOR_HEADER_BAR
        ).pack(side="left")

        # Separador visual
        tk.Label(
            frame_logo, text="  |  ",
            font=("Segoe UI", 13), fg=COLOR_BORDE, bg=COLOR_HEADER_BAR
        ).pack(side="left")

        tk.Label(
            frame_logo, text="Panel de Administracion",
            font=("Segoe UI", 11), fg=COLOR_TEXTO_SECUNDARIO, bg=COLOR_HEADER_BAR
        ).pack(side="left")

        # Boton publicar cambios (git)
        self.btn_publicar = tk.Button(
            header_inner, text="PUBLICAR CAMBIOS",
            font=("Segoe UI", 9, "bold"), fg="#ffffff", bg=COLOR_AZUL,
            activebackground=COLOR_AZUL_HOVER, activeforeground="#ffffff",
            relief="flat", padx=16, pady=6, cursor="hand2",
            command=self.publicar_cambios
        )
        self.btn_publicar.pack(side="right", pady=12)
        Tooltip(self.btn_publicar, "Sube los cambios al servidor (git push)")

        # Linea dorada sutil debajo del header
        tk.Frame(self.root, bg=COLOR_ORO, height=2).pack(fill="x")

        # ══════════════════════════════════════════════════════════════
        #  CONTENIDO PRINCIPAL
        # ══════════════════════════════════════════════════════════════
        contenido = tk.Frame(self.root, bg=COLOR_BG)
        contenido.pack(fill="both", expand=True)

        # ══════════════════════════════════════════════════════════════
        #  PANEL IZQUIERDO: Lista de autos (sidebar)
        # ══════════════════════════════════════════════════════════════
        panel_izquierdo = tk.Frame(contenido, bg=COLOR_BG_SIDEBAR, width=320)
        panel_izquierdo.pack(side="left", fill="y")
        panel_izquierdo.pack_propagate(False)

        # Linea divisoria derecha del sidebar
        tk.Frame(contenido, bg=COLOR_BORDE, width=1).pack(side="left", fill="y")

        # ── Encabezado de la lista ─────────────────────────────────
        enc_lista = tk.Frame(panel_izquierdo, bg=COLOR_BG_SIDEBAR, padx=16, pady=12)
        enc_lista.pack(fill="x")

        self.lbl_conteo = tk.Label(
            enc_lista, text="Vehiculos (0)",
            font=("Segoe UI", 12, "bold"), fg=COLOR_TEXTO, bg=COLOR_BG_SIDEBAR
        )
        self.lbl_conteo.pack(side="left")

        # Boton agregar vehiculo
        btn_agregar = tk.Button(
            enc_lista, text="+ NUEVO",
            font=("Segoe UI", 9, "bold"), fg=COLOR_BG, bg=COLOR_ORO,
            activebackground=COLOR_ORO_HOVER, activeforeground=COLOR_BG,
            relief="flat", padx=12, pady=4, cursor="hand2",
            command=self.nuevo_vehiculo
        )
        btn_agregar.pack(side="right")
        Tooltip(btn_agregar, "Agregar un nuevo vehiculo al catalogo")

        # Separador
        tk.Frame(panel_izquierdo, bg=COLOR_BORDE, height=1).pack(fill="x")

        # ── Lista scrollable de autos ──────────────────────────────
        frame_lista_contenedor = tk.Frame(panel_izquierdo, bg=COLOR_BG_SIDEBAR)
        frame_lista_contenedor.pack(fill="both", expand=True)

        self.canvas_lista = tk.Canvas(
            frame_lista_contenedor, bg=COLOR_BG_SIDEBAR,
            highlightthickness=0, bd=0
        )
        scrollbar_lista = ttk.Scrollbar(
            frame_lista_contenedor, orient="vertical",
            command=self.canvas_lista.yview
        )
        self.frame_lista_autos = tk.Frame(self.canvas_lista, bg=COLOR_BG_SIDEBAR)

        self.frame_lista_autos.bind(
            "<Configure>",
            lambda e: self.canvas_lista.configure(
                scrollregion=self.canvas_lista.bbox("all")
            )
        )

        self.canvas_lista_window = self.canvas_lista.create_window(
            (0, 0), window=self.frame_lista_autos, anchor="nw"
        )
        self.canvas_lista.configure(yscrollcommand=scrollbar_lista.set)

        self.canvas_lista.bind("<Configure>", self._ajustar_ancho_lista)

        self.canvas_lista.pack(side="left", fill="both", expand=True)
        scrollbar_lista.pack(side="right", fill="y")

        # Scroll con rueda del mouse en la lista
        self.canvas_lista.bind_all("<MouseWheel>", self._scroll_lista)

        # ══════════════════════════════════════════════════════════════
        #  PANEL DERECHO: Formulario
        # ══════════════════════════════════════════════════════════════
        panel_derecho = tk.Frame(contenido, bg=COLOR_BG)
        panel_derecho.pack(side="right", fill="both", expand=True)

        # Canvas scrollable para el formulario
        self.canvas_form = tk.Canvas(panel_derecho, bg=COLOR_BG,
                                     highlightthickness=0, bd=0)
        scrollbar_form = ttk.Scrollbar(
            panel_derecho, orient="vertical", command=self.canvas_form.yview
        )
        self.frame_formulario = tk.Frame(self.canvas_form, bg=COLOR_BG)

        self.frame_formulario.bind(
            "<Configure>",
            lambda e: self.canvas_form.configure(
                scrollregion=self.canvas_form.bbox("all")
            )
        )

        self.canvas_form_window = self.canvas_form.create_window(
            (0, 0), window=self.frame_formulario, anchor="nw"
        )
        self.canvas_form.configure(yscrollcommand=scrollbar_form.set)

        self.canvas_form.bind("<Configure>", self._ajustar_ancho_form)

        self.canvas_form.pack(side="left", fill="both", expand=True)
        scrollbar_form.pack(side="right", fill="y")

        # Scroll con rueda en formulario
        self.canvas_form.bind("<Enter>", lambda e: self._vincular_scroll_form())
        self.canvas_form.bind("<Leave>", lambda e: self._desvincular_scroll_form())

        # ── Construir campos del formulario ──────────────────────────
        self._construir_formulario()

        # ══════════════════════════════════════════════════════════════
        #  BARRA DE ESTADO (inferior)
        # ══════════════════════════════════════════════════════════════
        self.barra_estado = tk.Label(
            self.root, text="  Listo", anchor="w",
            bg=COLOR_HEADER_BAR, fg=COLOR_TEXTO_SECUNDARIO,
            font=("Segoe UI", 9), padx=12, pady=5
        )
        self.barra_estado.pack(fill="x", side="bottom")

    def _ajustar_ancho_lista(self, event):
        """Ajusta el ancho del frame de la lista al ancho del canvas."""
        self.canvas_lista.itemconfig(self.canvas_lista_window, width=event.width)

    def _ajustar_ancho_form(self, event):
        """Ajusta el ancho del formulario al canvas."""
        self.canvas_form.itemconfig(self.canvas_form_window, width=event.width)

    def _scroll_lista(self, event):
        """Maneja el scroll con rueda del mouse."""
        self.canvas_lista.yview_scroll(int(-1 * (event.delta / 120)), "units")

    def _vincular_scroll_form(self):
        """Vincula el scroll del mouse al formulario."""
        self.canvas_form.bind_all("<MouseWheel>", self._scroll_form)

    def _desvincular_scroll_form(self):
        """Restaura el scroll del mouse a la lista."""
        self.canvas_lista.bind_all("<MouseWheel>", self._scroll_lista)

    def _scroll_form(self, event):
        """Scroll en el formulario."""
        self.canvas_form.yview_scroll(int(-1 * (event.delta / 120)), "units")

    # ──────────────────────────────────────────────────────────────────
    #  HELPERS: Crear secciones y campos modernos
    # ──────────────────────────────────────────────────────────────────

    def _crear_card(self, parent, titulo_seccion=None):
        """
        Crea un contenedor tipo 'card' con fondo ligeramente mas claro.
        Retorna el frame interior donde agregar widgets.
        """
        # Wrapper con margen
        wrapper = tk.Frame(parent, bg=COLOR_BG)
        wrapper.pack(fill="x", padx=24, pady=(0, PAD_SECTION))

        # Card
        card = tk.Frame(wrapper, bg=COLOR_BG_CARD,
                        highlightbackground=COLOR_BORDE, highlightthickness=1)
        card.pack(fill="x")

        # Titulo de seccion
        if titulo_seccion:
            frame_titulo = tk.Frame(card, bg=COLOR_BG_CARD)
            frame_titulo.pack(fill="x", padx=PAD_CARD_X, pady=(PAD_CARD_Y, 4))

            tk.Label(
                frame_titulo, text=titulo_seccion,
                font=("Segoe UI", 12, "bold"), fg=COLOR_ORO, bg=COLOR_BG_CARD
            ).pack(side="left")

            # Linea debajo del titulo
            tk.Frame(card, bg=COLOR_BORDE, height=1).pack(
                fill="x", padx=PAD_CARD_X, pady=(0, 12)
            )

        # Frame interior para contenido
        interior = tk.Frame(card, bg=COLOR_BG_CARD)
        interior.pack(fill="x", padx=PAD_CARD_X, pady=(
            PAD_CARD_Y if not titulo_seccion else 0,
            PAD_CARD_Y
        ))

        return interior, card

    def _crear_campo_vertical(self, parent, label_texto, variable, placeholder="",
                               obligatorio=False):
        """Crea un campo de texto vertical (label arriba, input abajo)."""
        frame = tk.Frame(parent, bg=COLOR_BG_CARD)
        frame.pack(fill="x", pady=(0, PAD_FIELD))

        # Label
        texto_label = label_texto
        lbl = tk.Label(
            frame, text=texto_label,
            font=("Segoe UI", 10, "bold" if obligatorio else ""),
            fg=COLOR_TEXTO if obligatorio else COLOR_TEXTO_SECUNDARIO,
            bg=COLOR_BG_CARD
        )
        lbl.pack(anchor="w", pady=(0, 3))

        # Entry con borde
        entry = tk.Entry(
            frame, textvariable=variable, font=("Segoe UI", 11),
            bg=COLOR_BG_INPUT, fg=COLOR_TEXTO, insertbackground=COLOR_TEXTO,
            relief="flat", bd=0, highlightthickness=1,
            highlightcolor=COLOR_ORO, highlightbackground=COLOR_BORDE_INPUT
        )
        entry.pack(fill="x", ipady=7)

        # Placeholder
        if placeholder:
            self._agregar_placeholder(entry, variable, placeholder)

        return entry

    def _crear_combo_vertical(self, parent, label_texto, variable, valores,
                               obligatorio=False):
        """Crea un campo dropdown vertical (label arriba, combo abajo)."""
        frame = tk.Frame(parent, bg=COLOR_BG_CARD)
        frame.pack(fill="x", pady=(0, PAD_FIELD))

        # Label
        lbl = tk.Label(
            frame, text=label_texto,
            font=("Segoe UI", 10, "bold" if obligatorio else ""),
            fg=COLOR_TEXTO if obligatorio else COLOR_TEXTO_SECUNDARIO,
            bg=COLOR_BG_CARD
        )
        lbl.pack(anchor="w", pady=(0, 3))

        # Combobox
        combo = ttk.Combobox(
            frame, textvariable=variable, values=valores,
            font=("Segoe UI", 11), state="readonly"
        )
        combo.pack(fill="x", ipady=5)

        return lbl, combo

    def _crear_fila_doble(self, parent):
        """Crea un frame con dos columnas iguales para poner campos lado a lado."""
        fila = tk.Frame(parent, bg=COLOR_BG_CARD)
        fila.pack(fill="x", pady=(0, PAD_FIELD))
        fila.columnconfigure(0, weight=1, uniform="dualcol")
        fila.columnconfigure(1, weight=1, uniform="dualcol")
        return fila

    def _crear_campo_en_fila(self, parent, label_texto, variable, columna,
                              placeholder="", obligatorio=False):
        """Crea un campo de texto dentro de una fila doble (grid)."""
        frame = tk.Frame(parent, bg=COLOR_BG_CARD)
        frame.grid(row=0, column=columna, sticky="ew",
                   padx=(0, 8) if columna == 0 else (8, 0))

        lbl = tk.Label(
            frame, text=label_texto,
            font=("Segoe UI", 10, "bold" if obligatorio else ""),
            fg=COLOR_TEXTO if obligatorio else COLOR_TEXTO_SECUNDARIO,
            bg=COLOR_BG_CARD
        )
        lbl.pack(anchor="w", pady=(0, 3))

        entry = tk.Entry(
            frame, textvariable=variable, font=("Segoe UI", 11),
            bg=COLOR_BG_INPUT, fg=COLOR_TEXTO, insertbackground=COLOR_TEXTO,
            relief="flat", bd=0, highlightthickness=1,
            highlightcolor=COLOR_ORO, highlightbackground=COLOR_BORDE_INPUT
        )
        entry.pack(fill="x", ipady=7)

        if placeholder:
            self._agregar_placeholder(entry, variable, placeholder)

        return entry

    def _crear_combo_en_fila(self, parent, label_texto, variable, valores,
                              columna, obligatorio=False):
        """Crea un combo dentro de una fila doble (grid)."""
        frame = tk.Frame(parent, bg=COLOR_BG_CARD)
        frame.grid(row=0, column=columna, sticky="ew",
                   padx=(0, 8) if columna == 0 else (8, 0))

        lbl = tk.Label(
            frame, text=label_texto,
            font=("Segoe UI", 10, "bold" if obligatorio else ""),
            fg=COLOR_TEXTO if obligatorio else COLOR_TEXTO_SECUNDARIO,
            bg=COLOR_BG_CARD
        )
        lbl.pack(anchor="w", pady=(0, 3))

        combo = ttk.Combobox(
            frame, textvariable=variable, values=valores,
            font=("Segoe UI", 11), state="readonly"
        )
        combo.pack(fill="x", ipady=5)

        return lbl, combo

    # ──────────────────────────────────────────────────────────────────
    #  FORMULARIO DE DATOS
    # ──────────────────────────────────────────────────────────────────
    def _construir_formulario(self):
        """Construye el formulario con layout vertical moderno en cards."""
        form = self.frame_formulario

        # ══════════════════════════════════════════════════════════════
        #  TITULO DEL FORMULARIO
        # ══════════════════════════════════════════════════════════════
        frame_titulo_form = tk.Frame(form, bg=COLOR_BG)
        frame_titulo_form.pack(fill="x", padx=24, pady=(PAD_SECTION, 8))

        self.lbl_titulo_form = tk.Label(
            frame_titulo_form, text="Nuevo Vehiculo",
            font=("Segoe UI", 18, "bold"), fg=COLOR_ORO, bg=COLOR_BG
        )
        self.lbl_titulo_form.pack(side="left")

        self.lbl_subtitulo_form = tk.Label(
            frame_titulo_form, text="  Complete los datos del vehiculo",
            font=("Segoe UI", 10), fg=COLOR_TEXTO_SECUNDARIO, bg=COLOR_BG
        )
        self.lbl_subtitulo_form.pack(side="left", pady=(6, 0))

        # Separador
        tk.Frame(form, bg=COLOR_BORDE, height=1).pack(fill="x", padx=24, pady=(4, PAD_SECTION))

        # ══════════════════════════════════════════════════════════════
        #  CARD 1: DATOS PRINCIPALES
        # ══════════════════════════════════════════════════════════════
        interior_principal, _ = self._crear_card(form, "Datos Principales")

        # Marca y Modelo en la misma fila
        fila_marca_modelo = self._crear_fila_doble(interior_principal)

        self.var_marca = tk.StringVar()
        lbl_marca, combo_marca = self._crear_combo_en_fila(
            fila_marca_modelo, "Marca *", self.var_marca, MARCAS, 0, obligatorio=True
        )
        Tooltip(combo_marca, "Selecciona la marca del vehiculo")
        self.var_marca.trace_add("write", self._al_cambiar_marca)

        self.var_modelo = tk.StringVar()
        self._crear_campo_en_fila(
            fila_marca_modelo, "Modelo *", self.var_modelo, 1,
            placeholder="Ej: Corolla, Gol, EcoSport", obligatorio=True
        )

        # Campo marca personalizada (oculto por defecto)
        self.frame_marca_otra = tk.Frame(interior_principal, bg=COLOR_BG_CARD)
        self.entry_marca_otra = self._crear_entry_simple(
            self.frame_marca_otra, "Escribi la marca..."
        )

        # Version y Ano en la misma fila
        fila_version_anio = self._crear_fila_doble(interior_principal)

        self.var_version = tk.StringVar()
        self._crear_campo_en_fila(
            fila_version_anio, "Version", self.var_version, 0,
            placeholder="Ej: XLS, Highline, Tendance"
        )

        self.var_anio = tk.StringVar()
        self._crear_combo_en_fila(
            fila_version_anio, "Ano *", self.var_anio, ANIOS, 1, obligatorio=True
        )

        # Precio (campo destacado, ancho completo)
        self.var_precio = tk.StringVar()
        frame_precio = tk.Frame(interior_principal, bg=COLOR_BG_CARD)
        frame_precio.pack(fill="x", pady=(4, PAD_FIELD))

        tk.Label(
            frame_precio, text="Precio USD *",
            font=("Segoe UI", 11, "bold"),
            fg=COLOR_ORO, bg=COLOR_BG_CARD
        ).pack(anchor="w", pady=(0, 3))

        entry_precio = tk.Entry(
            frame_precio, textvariable=self.var_precio,
            font=("Segoe UI", 16, "bold"),
            bg=COLOR_BG_INPUT, fg=COLOR_ORO, insertbackground=COLOR_ORO,
            relief="flat", bd=0, highlightthickness=2,
            highlightcolor=COLOR_ORO, highlightbackground=COLOR_BORDE_INPUT
        )
        entry_precio.pack(fill="x", ipady=8)
        self._agregar_placeholder(entry_precio, self.var_precio, "Ej: 4600")

        # ══════════════════════════════════════════════════════════════
        #  CARD 2: ESPECIFICACIONES TECNICAS
        # ══════════════════════════════════════════════════════════════
        interior_specs, _ = self._crear_card(form, "Especificaciones Tecnicas")

        # Motor y Combustible en la misma fila
        fila_motor_comb = self._crear_fila_doble(interior_specs)

        self.var_motor = tk.StringVar()
        self._crear_campo_en_fila(
            fila_motor_comb, "Motor", self.var_motor, 0,
            placeholder="Ej: 1.6 L, 2.0 TDI"
        )

        self.var_combustible = tk.StringVar(value="Nafta")
        self._crear_combo_en_fila(
            fila_motor_comb, "Combustible", self.var_combustible,
            COMBUSTIBLES, 1
        )

        # Carroceria y Kilometraje en la misma fila
        fila_carro_km = self._crear_fila_doble(interior_specs)

        self.var_carroceria = tk.StringVar()
        self._crear_combo_en_fila(
            fila_carro_km, "Carroceria", self.var_carroceria,
            CARROCERIAS, 0
        )

        self.var_kilometraje = tk.StringVar()
        self._crear_campo_en_fila(
            fila_carro_km, "Kilometraje", self.var_kilometraje, 1,
            placeholder="Ej: 145.000 km"
        )

        # Documentacion (ancho completo)
        self.var_documentacion = tk.StringVar()
        self._crear_campo_vertical(
            interior_specs, "Documentacion", self.var_documentacion,
            placeholder="Ej: 08 al dia"
        )

        # ══════════════════════════════════════════════════════════════
        #  CARD 3: OPCIONES
        # ══════════════════════════════════════════════════════════════
        interior_opciones, _ = self._crear_card(form, "Opciones")

        # Checkboxes con estilo moderno
        frame_checks = tk.Frame(interior_opciones, bg=COLOR_BG_CARD)
        frame_checks.pack(fill="x", pady=(0, 4))

        self.var_permuta = tk.BooleanVar(value=True)
        chk_permuta = tk.Checkbutton(
            frame_checks, text="  Acepta permuta",
            variable=self.var_permuta, font=("Segoe UI", 11),
            bg=COLOR_BG_CARD, fg=COLOR_TEXTO, selectcolor=COLOR_BG_INPUT,
            activebackground=COLOR_BG_CARD, activeforeground=COLOR_ORO,
            cursor="hand2"
        )
        chk_permuta.pack(anchor="w", pady=3)
        Tooltip(chk_permuta, "Indicar si se acepta otro vehiculo como parte de pago")

        self.var_destacado = tk.BooleanVar(value=False)
        chk_destacado = tk.Checkbutton(
            frame_checks, text="  Destacado (aparece primero en la web)",
            variable=self.var_destacado, font=("Segoe UI", 11),
            bg=COLOR_BG_CARD, fg=COLOR_ORO, selectcolor=COLOR_BG_INPUT,
            activebackground=COLOR_BG_CARD, activeforeground=COLOR_ORO,
            cursor="hand2"
        )
        chk_destacado.pack(anchor="w", pady=3)
        Tooltip(chk_destacado, "Los vehiculos destacados aparecen primero en la web")

        # ══════════════════════════════════════════════════════════════
        #  CARD 4: FOTOS
        # ══════════════════════════════════════════════════════════════
        interior_fotos, self.card_fotos = self._crear_card(form, "Fotos del Vehiculo")

        # Info + boton agregar
        frame_fotos_info = tk.Frame(interior_fotos, bg=COLOR_BG_CARD)
        frame_fotos_info.pack(fill="x", pady=(0, 10))

        tk.Label(
            frame_fotos_info,
            text="La primera foto sera la imagen principal.",
            font=("Segoe UI", 9), fg=COLOR_TEXTO_SECUNDARIO, bg=COLOR_BG_CARD
        ).pack(side="left")

        btn_agregar_fotos = tk.Button(
            frame_fotos_info, text="+ AGREGAR FOTOS",
            font=("Segoe UI", 9, "bold"), fg=COLOR_BG, bg=COLOR_ORO,
            activebackground=COLOR_ORO_HOVER, activeforeground=COLOR_BG,
            relief="flat", padx=14, pady=5, cursor="hand2",
            command=self.agregar_fotos
        )
        btn_agregar_fotos.pack(side="right")
        Tooltip(btn_agregar_fotos, "Seleccionar fotos JPG o PNG del vehiculo")

        # Frame scrollable para las miniaturas de fotos
        frame_fotos_contenedor = tk.Frame(
            interior_fotos, bg=COLOR_BG_INPUT,
            highlightbackground=COLOR_BORDE_INPUT, highlightthickness=1
        )
        frame_fotos_contenedor.pack(fill="x")

        self.canvas_fotos = tk.Canvas(
            frame_fotos_contenedor, bg=COLOR_BG_INPUT,
            height=150, highlightthickness=0
        )
        scrollbar_fotos = ttk.Scrollbar(
            frame_fotos_contenedor, orient="horizontal",
            command=self.canvas_fotos.xview
        )
        self.frame_fotos = tk.Frame(self.canvas_fotos, bg=COLOR_BG_INPUT)

        self.frame_fotos.bind(
            "<Configure>",
            lambda e: self.canvas_fotos.configure(
                scrollregion=self.canvas_fotos.bbox("all")
            )
        )

        self.canvas_fotos.create_window((0, 0), window=self.frame_fotos, anchor="nw")
        self.canvas_fotos.configure(xscrollcommand=scrollbar_fotos.set)

        self.canvas_fotos.pack(fill="x", expand=True)
        scrollbar_fotos.pack(fill="x")

        # Mensaje cuando no hay fotos
        self.lbl_sin_fotos = tk.Label(
            self.frame_fotos,
            text="No hay fotos agregadas.\nHace clic en '+ AGREGAR FOTOS' para seleccionar imagenes.",
            font=("Segoe UI", 10), fg=COLOR_TEXTO_SECUNDARIO,
            bg=COLOR_BG_INPUT, justify="center", pady=45, padx=20
        )
        self.lbl_sin_fotos.pack()

        # ══════════════════════════════════════════════════════════════
        #  BOTONES DE ACCION
        # ══════════════════════════════════════════════════════════════
        frame_botones = tk.Frame(form, bg=COLOR_BG)
        frame_botones.pack(fill="x", padx=24, pady=(4, PAD_SECTION * 2))

        self.btn_guardar = tk.Button(
            frame_botones, text="GUARDAR VEHICULO",
            font=("Segoe UI", 12, "bold"), fg="#ffffff", bg=COLOR_VERDE,
            activebackground=COLOR_VERDE_HOVER, activeforeground="#ffffff",
            relief="flat", padx=24, pady=10, cursor="hand2",
            command=self.guardar_vehiculo
        )
        self.btn_guardar.pack(side="left", padx=(0, 10))

        self.btn_eliminar = tk.Button(
            frame_botones, text="ELIMINAR",
            font=("Segoe UI", 11, "bold"), fg="#ffffff", bg=COLOR_ROJO,
            activebackground=COLOR_ROJO_HOVER, activeforeground="#ffffff",
            relief="flat", padx=18, pady=10, cursor="hand2",
            command=self.eliminar_vehiculo
        )
        # Oculto por defecto (solo aparece al editar)
        self.btn_eliminar.pack_forget()

        self.btn_cancelar = tk.Button(
            frame_botones, text="CANCELAR",
            font=("Segoe UI", 10), fg=COLOR_TEXTO_SECUNDARIO,
            bg=COLOR_BG_CARD, activebackground=COLOR_BG_HOVER,
            activeforeground=COLOR_TEXTO,
            relief="flat", padx=18, pady=10, cursor="hand2",
            command=self.limpiar_formulario
        )
        self.btn_cancelar.pack(side="right")

    def _crear_entry_simple(self, parent, placeholder=""):
        """Crea un entry simple sin grid."""
        var = tk.StringVar()
        entry = tk.Entry(
            parent, textvariable=var, font=("Segoe UI", 11),
            bg=COLOR_BG_INPUT, fg=COLOR_TEXTO, insertbackground=COLOR_TEXTO,
            relief="flat", bd=0, highlightthickness=1,
            highlightcolor=COLOR_ORO, highlightbackground=COLOR_BORDE_INPUT
        )
        entry.pack(fill="x", ipady=7, pady=2)
        if placeholder:
            self._agregar_placeholder(entry, var, placeholder)
        entry._variable = var
        return entry

    def _agregar_placeholder(self, entry, variable, texto):
        """Agrega texto placeholder a un Entry."""
        def on_focus_in(e):
            if entry.cget("fg") == COLOR_TEXTO_PLACEHOLDER:
                entry.delete(0, "end")
                entry.config(fg=COLOR_TEXTO)

        def on_focus_out(e):
            if not variable.get():
                entry.config(fg=COLOR_TEXTO_PLACEHOLDER)
                entry.insert(0, texto)

        if not variable.get():
            entry.config(fg=COLOR_TEXTO_PLACEHOLDER)
            entry.insert(0, texto)

        entry.bind("<FocusIn>", on_focus_in)
        entry.bind("<FocusOut>", on_focus_out)

    def _al_cambiar_marca(self, *args):
        """Muestra u oculta el campo de marca personalizada."""
        if self.var_marca.get() == "Otra":
            self.frame_marca_otra.pack(fill="x", pady=(0, PAD_FIELD))
        else:
            self.frame_marca_otra.pack_forget()

    # ──────────────────────────────────────────────────────────────────
    #  LISTA DE AUTOS (panel izquierdo)
    # ──────────────────────────────────────────────────────────────────
    def refrescar_lista(self):
        """Recarga la lista de autos en el panel izquierdo."""
        for widget in self.frame_lista_autos.winfo_children():
            widget.destroy()
        self.lista_thumbs.clear()

        autos = self.datos.get("autos", [])
        self.lbl_conteo.config(text=f"Vehiculos ({len(autos)})")

        if not autos:
            tk.Label(
                self.frame_lista_autos,
                text="\nNo hay vehiculos cargados.\n\nHace clic en '+ NUEVO'\npara agregar el primero.",
                font=("Segoe UI", 10), fg=COLOR_TEXTO_SECUNDARIO,
                bg=COLOR_BG_SIDEBAR, justify="center"
            ).pack(pady=50, padx=20)
            return

        for auto in autos:
            self._crear_item_lista(auto)

    def _crear_item_lista(self, auto):
        """Crea un elemento en la lista lateral para un auto."""
        es_seleccionado = (auto["id"] == self.auto_seleccionado_id)
        bg = COLOR_SELECCION if es_seleccionado else COLOR_BG_SIDEBAR

        frame_item = tk.Frame(
            self.frame_lista_autos, bg=bg, cursor="hand2",
            padx=12, pady=10
        )
        frame_item.pack(fill="x")

        # Separador sutil entre items
        tk.Frame(self.frame_lista_autos, bg=COLOR_BORDE, height=1).pack(fill="x")

        # Contenido horizontal: miniatura + info
        frame_contenido = tk.Frame(frame_item, bg=bg)
        frame_contenido.pack(fill="x")

        # Miniatura
        thumb = None
        if PILLOW_DISPONIBLE and auto.get("imagenes"):
            ruta_img = os.path.join(IMG_BASE_DIR, auto["id"], auto["imagenes"][0])
            if os.path.exists(ruta_img):
                thumb = crear_miniatura(ruta_img, THUMB_LISTA_SIZE)

        if thumb:
            lbl_thumb = tk.Label(frame_contenido, image=thumb, bg=bg, bd=0)
            lbl_thumb.pack(side="left", padx=(0, 10))
            self.lista_thumbs.append(thumb)
        else:
            # Placeholder sin imagen
            lbl_placeholder = tk.Frame(
                frame_contenido, bg=COLOR_BG_INPUT,
                width=THUMB_LISTA_SIZE[0], height=THUMB_LISTA_SIZE[1]
            )
            lbl_placeholder.pack(side="left", padx=(0, 10))
            lbl_placeholder.pack_propagate(False)
            tk.Label(
                lbl_placeholder, text="SIN\nFOTO",
                font=("Segoe UI", 7), fg=COLOR_TEXTO_SECUNDARIO,
                bg=COLOR_BG_INPUT, justify="center"
            ).pack(expand=True)

        # Info del auto
        frame_info = tk.Frame(frame_contenido, bg=bg)
        frame_info.pack(side="left", fill="x", expand=True)

        # Indicador de destacado
        titulo_texto = auto.get("titulo", "Sin titulo")
        if auto.get("destacado"):
            titulo_texto = f"[D] {titulo_texto}"

        lbl_titulo = tk.Label(
            frame_info, text=titulo_texto,
            font=("Segoe UI", 10, "bold"),
            fg=COLOR_ORO if auto.get("destacado") else COLOR_TEXTO,
            bg=bg, anchor="w"
        )
        lbl_titulo.pack(anchor="w")

        precio_texto = formatear_precio(auto.get("precio", 0))
        lbl_precio = tk.Label(
            frame_info, text=precio_texto,
            font=("Segoe UI", 10, "bold"), fg=COLOR_VERDE,
            bg=bg, anchor="w"
        )
        lbl_precio.pack(anchor="w")

        anio_texto = str(auto.get("ano", auto.get("año", "")))
        fotos_count = len(auto.get("imagenes", []))
        detalle = f"{anio_texto}  |  {fotos_count} foto(s)"

        lbl_detalle = tk.Label(
            frame_info, text=detalle,
            font=("Segoe UI", 9), fg=COLOR_TEXTO_SECUNDARIO,
            bg=bg, anchor="w"
        )
        lbl_detalle.pack(anchor="w")

        # Hacer clic en cualquier parte del item
        def al_clic(e, auto_id=auto["id"]):
            self.seleccionar_auto(auto_id)

        for w in [frame_item, frame_contenido, frame_info,
                  lbl_titulo, lbl_precio, lbl_detalle]:
            w.bind("<Button-1>", al_clic)

        # Hover effect
        def on_enter(e, f=frame_item, fc=frame_contenido, fi=frame_info,
                     lt=lbl_titulo, lp=lbl_precio, ld=lbl_detalle,
                     sel=es_seleccionado):
            if not sel:
                hover_bg = COLOR_BG_HOVER
                for widget in [f, fc, fi, ld]:
                    widget.config(bg=hover_bg)
                lt.config(bg=hover_bg)
                lp.config(bg=hover_bg)

        def on_leave(e, f=frame_item, fc=frame_contenido, fi=frame_info,
                     lt=lbl_titulo, lp=lbl_precio, ld=lbl_detalle,
                     sel=es_seleccionado):
            original_bg = COLOR_SELECCION if sel else COLOR_BG_SIDEBAR
            for widget in [f, fc, fi, ld]:
                widget.config(bg=original_bg)
            lt.config(bg=original_bg)
            lp.config(bg=original_bg)

        frame_item.bind("<Enter>", on_enter)
        frame_item.bind("<Leave>", on_leave)

    # ──────────────────────────────────────────────────────────────────
    #  SELECCION Y EDICION
    # ──────────────────────────────────────────────────────────────────
    def seleccionar_auto(self, auto_id):
        """Selecciona un auto de la lista y carga sus datos en el formulario."""
        auto = None
        for a in self.datos.get("autos", []):
            if a["id"] == auto_id:
                auto = a
                break

        if not auto:
            return

        self.auto_seleccionado_id = auto_id
        self.modo_edicion = True

        # Actualizar titulo del formulario
        self.lbl_titulo_form.config(text=f"Editar Vehiculo")
        self.lbl_subtitulo_form.config(text=f"  {auto.get('titulo', '')}")
        self.btn_guardar.config(text="GUARDAR CAMBIOS")

        # Mostrar boton eliminar
        self.btn_eliminar.pack(side="left", padx=(0, 10))

        # Cargar datos en los campos
        marca = auto.get("marca", "")
        if marca in MARCAS:
            self.var_marca.set(marca)
        else:
            self.var_marca.set("Otra")
            self.entry_marca_otra._variable.set(marca)

        self.var_modelo.set(auto.get("modelo", ""))
        self.var_version.set(auto.get("version", ""))

        anio = str(auto.get("ano", auto.get("año", "")))
        self.var_anio.set(anio)

        self.var_motor.set(auto.get("motor", ""))

        combustible = auto.get("combustible", "Nafta")
        if combustible in COMBUSTIBLES:
            self.var_combustible.set(combustible)
        else:
            self.var_combustible.set("Nafta")

        carroceria = auto.get("carroceria", "")
        if carroceria in CARROCERIAS:
            self.var_carroceria.set(carroceria)
        else:
            self.var_carroceria.set("")

        self.var_kilometraje.set(auto.get("kilometraje", ""))
        self.var_documentacion.set(auto.get("documentacion", ""))
        self.var_precio.set(str(auto.get("precio", "")))
        self.var_permuta.set(auto.get("permuta", True))
        self.var_destacado.set(auto.get("destacado", False))

        # Cargar fotos existentes
        self.fotos_lista = [
            ("existente", nombre) for nombre in auto.get("imagenes", [])
        ]
        # Verificar que los archivos realmente existen
        carpeta = os.path.join(IMG_BASE_DIR, auto_id)
        self.fotos_lista = [
            (t, v) for t, v in self.fotos_lista
            if os.path.exists(os.path.join(carpeta, v))
        ]

        # Refrescar visualizacion
        self.refrescar_lista()
        self._actualizar_galeria_fotos()

        # Scroll al tope del formulario
        self.canvas_form.yview_moveto(0)

        self.estado(f"Editando: {auto.get('titulo', auto_id)}")

    def nuevo_vehiculo(self):
        """Prepara el formulario para agregar un nuevo vehiculo."""
        self.limpiar_formulario()
        self.lbl_titulo_form.config(text="Nuevo Vehiculo")
        self.lbl_subtitulo_form.config(text="  Complete los datos del vehiculo")
        self.btn_guardar.config(text="GUARDAR VEHICULO")
        self.estado("Modo: Nuevo vehiculo")

        # Scroll al tope del formulario
        self.canvas_form.yview_moveto(0)

    def limpiar_formulario(self):
        """Limpia todos los campos del formulario."""
        self.auto_seleccionado_id = None
        self.modo_edicion = False

        self.lbl_titulo_form.config(text="Nuevo Vehiculo")
        self.lbl_subtitulo_form.config(text="  Complete los datos del vehiculo")
        self.btn_guardar.config(text="GUARDAR VEHICULO")
        self.btn_eliminar.pack_forget()

        # Limpiar variables
        self.var_marca.set("")
        self.var_modelo.set("")
        self.var_version.set("")
        self.var_anio.set("")
        self.var_motor.set("")
        self.var_combustible.set("Nafta")
        self.var_carroceria.set("")
        self.var_kilometraje.set("")
        self.var_documentacion.set("")
        self.var_precio.set("")
        self.var_permuta.set(True)
        self.var_destacado.set(False)

        self.frame_marca_otra.pack_forget()
        self.entry_marca_otra._variable.set("")

        # Limpiar fotos
        self.fotos_lista = []
        self._actualizar_galeria_fotos()

        # Refrescar lista (deseleccionar)
        self.refrescar_lista()

    # ──────────────────────────────────────────────────────────────────
    #  GESTION DE FOTOS
    # ──────────────────────────────────────────────────────────────────
    def agregar_fotos(self):
        """Abre el dialogo para seleccionar fotos."""
        archivos = filedialog.askopenfilenames(
            title="Seleccionar fotos del vehiculo",
            filetypes=[
                ("Imagenes", "*.jpg *.jpeg *.png *.webp"),
                ("JPEG", "*.jpg *.jpeg"),
                ("PNG", "*.png"),
                ("Todos", "*.*")
            ]
        )
        if archivos:
            for ruta in archivos:
                self.fotos_lista.append(("nueva", ruta))
            self._actualizar_galeria_fotos()
            self.estado(f"Se agregaron {len(archivos)} foto(s)")

    def _actualizar_galeria_fotos(self):
        """Actualiza la visualizacion de fotos en el formulario."""
        for widget in self.frame_fotos.winfo_children():
            widget.destroy()
        self.thumbs_cache.clear()

        if not self.fotos_lista:
            self.lbl_sin_fotos = tk.Label(
                self.frame_fotos,
                text="No hay fotos agregadas.\nHace clic en '+ AGREGAR FOTOS' para seleccionar imagenes.",
                font=("Segoe UI", 10), fg=COLOR_TEXTO_SECUNDARIO,
                bg=COLOR_BG_INPUT, justify="center", pady=45, padx=20
            )
            self.lbl_sin_fotos.pack()
            return

        total = len(self.fotos_lista)
        for idx, (tipo, valor) in enumerate(self.fotos_lista):
            if tipo == "existente":
                ruta = os.path.join(IMG_BASE_DIR, self.auto_seleccionado_id, valor)
                nombre = valor
            else:
                ruta = valor
                nombre = os.path.basename(valor)
            self._crear_item_foto(idx, tipo, ruta, nombre, total)

    def _crear_item_foto(self, indice, tipo, ruta, nombre, total):
        """Crea un elemento de foto en la galeria."""
        frame = tk.Frame(self.frame_fotos, bg=COLOR_BG_CARD, padx=5, pady=5)
        frame.pack(side="left", padx=4, pady=6)

        # Indicador de foto principal
        if indice == 0:
            lbl_principal = tk.Label(
                frame, text=" PRINCIPAL ",
                font=("Segoe UI", 7, "bold"),
                fg=COLOR_BG, bg=COLOR_ORO, padx=4, pady=1
            )
            lbl_principal.pack(fill="x")
        else:
            # Numero de foto
            tk.Label(
                frame, text=f" Foto {indice + 1} ",
                font=("Segoe UI", 7),
                fg=COLOR_TEXTO_SECUNDARIO, bg=COLOR_BG_CARD, padx=4
            ).pack(anchor="w")

        # Miniatura o nombre de archivo
        thumb = None
        if PILLOW_DISPONIBLE and os.path.exists(ruta):
            thumb = crear_miniatura(ruta, THUMB_FOTO_SIZE)

        if thumb:
            lbl_img = tk.Label(frame, image=thumb, bg=COLOR_BG_CARD, bd=0)
            lbl_img.pack(pady=3)
            self.thumbs_cache[f"foto_{indice}"] = thumb
        else:
            nombre_corto = nombre[:15] + "..." if len(nombre) > 15 else nombre
            tk.Label(
                frame, text=f"[{nombre_corto}]",
                font=("Segoe UI", 8), fg=COLOR_TEXTO_SECUNDARIO,
                bg=COLOR_BG_INPUT, width=16, height=5
            ).pack(pady=3)

        # Botones de control
        frame_btns = tk.Frame(frame, bg=COLOR_BG_CARD)
        frame_btns.pack(fill="x", pady=(2, 0))

        # Mover izquierda
        if indice > 0:
            btn_izq = tk.Button(
                frame_btns, text="<",
                font=("Segoe UI", 8, "bold"),
                fg=COLOR_TEXTO, bg=COLOR_BG_INPUT, relief="flat",
                width=3, cursor="hand2",
                command=lambda i=indice: self._mover_foto(i, -1)
            )
            btn_izq.pack(side="left", padx=1)
            Tooltip(btn_izq, "Mover a la izquierda")

        # Eliminar foto
        btn_del = tk.Button(
            frame_btns, text="X",
            font=("Segoe UI", 8, "bold"),
            fg="#ffffff", bg=COLOR_ROJO, relief="flat",
            width=3, cursor="hand2",
            command=lambda i=indice, t=tipo: self._eliminar_foto(i, t)
        )
        btn_del.pack(side="left", padx=1)
        Tooltip(btn_del, "Quitar esta foto")

        # Mover derecha
        if indice < total - 1:
            btn_der = tk.Button(
                frame_btns, text=">",
                font=("Segoe UI", 8, "bold"),
                fg=COLOR_TEXTO, bg=COLOR_BG_INPUT, relief="flat",
                width=3, cursor="hand2",
                command=lambda i=indice: self._mover_foto(i, 1)
            )
            btn_der.pack(side="left", padx=1)
            Tooltip(btn_der, "Mover a la derecha")

    def _mover_foto(self, indice, direccion):
        """Mueve una foto en la lista (direccion: -1=izquierda, +1=derecha)."""
        nuevo_indice = indice + direccion
        if 0 <= nuevo_indice < len(self.fotos_lista):
            self.fotos_lista[indice], self.fotos_lista[nuevo_indice] = \
                self.fotos_lista[nuevo_indice], self.fotos_lista[indice]
        self._actualizar_galeria_fotos()

    def _eliminar_foto(self, indice, tipo_eliminado):
        """Elimina una foto de la lista."""
        if 0 <= indice < len(self.fotos_lista):
            self.fotos_lista.pop(indice)
        self._actualizar_galeria_fotos()

    # ──────────────────────────────────────────────────────────────────
    #  GUARDAR VEHICULO
    # ──────────────────────────────────────────────────────────────────
    def guardar_vehiculo(self):
        """Valida y guarda el vehiculo (nuevo o editado)."""
        # ── Obtener marca ─────────────────────────────────────────────
        marca = self.var_marca.get()
        if marca == "Otra":
            marca = self.entry_marca_otra._variable.get().strip()

        modelo = self.var_modelo.get().strip()
        anio = self.var_anio.get().strip()
        precio_texto = self.var_precio.get().strip()

        # ── Validaciones ──────────────────────────────────────────────
        errores = []
        if not marca:
            errores.append("- Marca es obligatorio")
        if not modelo:
            errores.append("- Modelo es obligatorio")
        if not anio:
            errores.append("- Ano es obligatorio")
        if not precio_texto:
            errores.append("- Precio es obligatorio")
        else:
            try:
                precio = int(precio_texto.replace(".", "").replace(",", ""))
                if precio < 0:
                    errores.append("- El precio no puede ser negativo")
            except ValueError:
                errores.append("- El precio debe ser un numero valido")

        if errores:
            messagebox.showwarning(
                "Campos incompletos",
                "Por favor complete los siguientes campos:\n\n" + "\n".join(errores)
            )
            return

        precio = int(precio_texto.replace(".", "").replace(",", ""))

        # ── Generar ID ────────────────────────────────────────────────
        if self.modo_edicion:
            auto_id = self.auto_seleccionado_id
        else:
            id_base = generar_id(marca, modelo, anio)
            auto_id = id_unico(id_base, self.datos)

        # ── Construir titulo ──────────────────────────────────────────
        version = self.var_version.get().strip()
        motor = self.var_motor.get().strip()
        titulo_partes = [marca, modelo]
        if version:
            titulo_partes.append(version)
        if motor:
            titulo_partes.append(motor)
        titulo = " ".join(titulo_partes)

        # ── Preparar carpeta de imagenes ──────────────────────────────
        carpeta_img = os.path.join(IMG_BASE_DIR, auto_id)
        os.makedirs(carpeta_img, exist_ok=True)

        # ── Procesar fotos desde la lista unificada ────────────────────
        nombres_imagenes = []
        fotos_existentes_actuales = set()

        for tipo, valor in self.fotos_lista:
            if tipo == "existente":
                nombres_imagenes.append(valor)
                fotos_existentes_actuales.add(valor)
            elif tipo == "nueva":
                if os.path.exists(valor):
                    extension = os.path.splitext(valor)[1].lower()
                    if extension not in (".jpg", ".jpeg", ".png", ".webp"):
                        extension = ".jpg"
                    nombre_nuevo = f"{uuid.uuid4()}{extension}"
                    ruta_destino = os.path.join(carpeta_img, nombre_nuevo)
                    try:
                        shutil.copy2(valor, ruta_destino)
                        nombres_imagenes.append(nombre_nuevo)
                    except IOError as e:
                        messagebox.showerror(
                            "Error al copiar foto",
                            f"No se pudo copiar {os.path.basename(valor)}:\n{e}"
                        )

        # ── Eliminar fotos que se quitaron (al editar) ────────────────
        if self.modo_edicion:
            auto_original = None
            for a in self.datos.get("autos", []):
                if a["id"] == auto_id:
                    auto_original = a
                    break

            if auto_original:
                fotos_originales = set(auto_original.get("imagenes", []))
                fotos_eliminadas = fotos_originales - fotos_existentes_actuales

                for foto in fotos_eliminadas:
                    ruta_foto = os.path.join(carpeta_img, foto)
                    if os.path.exists(ruta_foto):
                        try:
                            os.remove(ruta_foto)
                        except OSError:
                            pass

        # ── Construir objeto del auto ─────────────────────────────────
        auto_data = {
            "id": auto_id,
            "titulo": titulo,
            "precio": precio,
            "marca": marca,
            "modelo": modelo,
            "año": int(anio),
            "motor": motor,
            "combustible": self.var_combustible.get() or "Nafta",
            "carroceria": self.var_carroceria.get() or "",
            "version": version,
            "kilometraje": self.var_kilometraje.get().strip(),
            "documentacion": self.var_documentacion.get().strip(),
            "permuta": self.var_permuta.get(),
            "destacado": self.var_destacado.get(),
            "imagenes": nombres_imagenes
        }

        # ── Actualizar o agregar en datos ─────────────────────────────
        if self.modo_edicion:
            for i, a in enumerate(self.datos["autos"]):
                if a["id"] == auto_id:
                    self.datos["autos"][i] = auto_data
                    break
            accion = "actualizado"
        else:
            self.datos["autos"].append(auto_data)
            accion = "agregado"

        # ── Guardar en disco ──────────────────────────────────────────
        try:
            guardar_datos(self.datos)
        except IOError as e:
            messagebox.showerror(
                "Error al guardar",
                f"No se pudo guardar data.json:\n{e}"
            )
            return

        # ── Exito ─────────────────────────────────────────────────────
        messagebox.showinfo(
            "Vehiculo guardado",
            f"El vehiculo '{titulo}' fue {accion} correctamente.\n\n"
            f"Se guardaron {len(nombres_imagenes)} foto(s)."
        )

        self.estado(f"Vehiculo {accion}: {titulo}")

        # Refrescar la vista
        self.limpiar_formulario()
        self.refrescar_lista()

    # ──────────────────────────────────────────────────────────────────
    #  ELIMINAR VEHICULO
    # ──────────────────────────────────────────────────────────────────
    def eliminar_vehiculo(self):
        """Elimina el vehiculo actualmente seleccionado."""
        if not self.auto_seleccionado_id:
            return

        auto = None
        for a in self.datos.get("autos", []):
            if a["id"] == self.auto_seleccionado_id:
                auto = a
                break

        if not auto:
            return

        titulo = auto.get("titulo", self.auto_seleccionado_id)

        respuesta = messagebox.askyesno(
            "Confirmar eliminacion",
            f"Esta seguro de que quiere eliminar '{titulo}'?\n\n"
            f"Se eliminaran tambien todas las fotos asociadas.\n\n"
            f"Esta accion no se puede deshacer.",
            icon="warning"
        )

        if not respuesta:
            return

        # Eliminar carpeta de imagenes
        carpeta_img = os.path.join(IMG_BASE_DIR, auto["id"])
        if os.path.exists(carpeta_img):
            try:
                shutil.rmtree(carpeta_img)
            except OSError as e:
                messagebox.showwarning(
                    "Advertencia",
                    f"No se pudo eliminar la carpeta de imagenes:\n{e}\n\n"
                    f"El vehiculo se eliminara del catalogo de todas formas."
                )

        # Eliminar del JSON
        self.datos["autos"] = [
            a for a in self.datos["autos"] if a["id"] != auto["id"]
        ]

        try:
            guardar_datos(self.datos)
        except IOError as e:
            messagebox.showerror(
                "Error al guardar",
                f"No se pudo actualizar data.json:\n{e}"
            )
            return

        messagebox.showinfo(
            "Vehiculo eliminado",
            f"'{titulo}' fue eliminado correctamente."
        )

        self.estado(f"Eliminado: {titulo}")
        self.limpiar_formulario()
        self.refrescar_lista()

    # ──────────────────────────────────────────────────────────────────
    #  GIT: PUBLICAR CAMBIOS
    # ──────────────────────────────────────────────────────────────────
    def publicar_cambios(self):
        """Ejecuta git add, commit y push."""
        respuesta = messagebox.askyesno(
            "Publicar cambios",
            "Esto va a subir todos los cambios al servidor.\n\n"
            "Quiere continuar?",
            icon="question"
        )

        if not respuesta:
            return

        self.estado("Publicando cambios...")
        self.root.update()

        try:
            # git add -A
            resultado_add = subprocess.run(
                ["git", "add", "-A"],
                cwd=BASE_DIR, capture_output=True, text=True, timeout=30
            )
            if resultado_add.returncode != 0:
                raise Exception(f"git add fallo:\n{resultado_add.stderr}")

            # Verificar si hay cambios para commitear
            resultado_status = subprocess.run(
                ["git", "status", "--porcelain"],
                cwd=BASE_DIR, capture_output=True, text=True, timeout=15
            )

            if not resultado_status.stdout.strip():
                messagebox.showinfo(
                    "Sin cambios",
                    "No hay cambios nuevos para publicar."
                )
                self.estado("No hay cambios para publicar")
                return

            # git commit
            resultado_commit = subprocess.run(
                ["git", "commit", "-m", "Auto: Actualizacion del catalogo de vehiculos"],
                cwd=BASE_DIR, capture_output=True, text=True, timeout=30
            )
            if resultado_commit.returncode != 0:
                raise Exception(f"git commit fallo:\n{resultado_commit.stderr}")

            # git push
            resultado_push = subprocess.run(
                ["git", "push"],
                cwd=BASE_DIR, capture_output=True, text=True, timeout=60
            )
            if resultado_push.returncode != 0:
                raise Exception(
                    f"git push fallo:\n{resultado_push.stderr}\n\n"
                    f"Los cambios fueron guardados localmente (commit), "
                    f"pero no se pudieron subir al servidor.\n\n"
                    f"Posibles causas:\n"
                    f"- No hay conexion a internet\n"
                    f"- Se necesita autenticacion (usuario/contrasena)\n"
                    f"- El repositorio remoto no esta configurado"
                )

            messagebox.showinfo(
                "Cambios publicados",
                "Los cambios se subieron correctamente al servidor."
            )
            self.estado("Cambios publicados exitosamente")

        except FileNotFoundError:
            messagebox.showerror(
                "Git no encontrado",
                "No se encontro el comando 'git' en el sistema.\n\n"
                "Git es necesario para publicar los cambios.\n"
                "Puede descargarlo de: https://git-scm.com/download/win"
            )
            self.estado("Error: Git no encontrado")

        except subprocess.TimeoutExpired:
            messagebox.showerror(
                "Tiempo agotado",
                "La operacion tardo demasiado.\n\n"
                "Revise su conexion a internet e intente de nuevo."
            )
            self.estado("Error: Tiempo agotado")

        except Exception as e:
            messagebox.showerror(
                "Error al publicar",
                f"Ocurrio un error:\n\n{str(e)}"
            )
            self.estado("Error al publicar cambios")

    # ──────────────────────────────────────────────────────────────────
    #  BARRA DE ESTADO
    # ──────────────────────────────────────────────────────────────────
    def estado(self, mensaje):
        """Actualiza el mensaje en la barra de estado."""
        self.barra_estado.config(text=f"  {mensaje}")
        self.root.update_idletasks()


# ══════════════════════════════════════════════════════════════════════════
#  PUNTO DE ENTRADA
# ══════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    # Mejorar la apariencia en Windows con DPI scaling
    try:
        from ctypes import windll
        windll.shcore.SetProcessDpiAwareness(1)
    except Exception:
        pass

    root = tk.Tk()

    # Crear y ejecutar la aplicacion
    app = AplicacionAdmin(root)

    # Centrar la ventana en la pantalla
    root.update_idletasks()
    ancho = root.winfo_width()
    alto = root.winfo_height()
    x = (root.winfo_screenwidth() // 2) - (ancho // 2)
    y = (root.winfo_screenheight() // 2) - (alto // 2)
    root.geometry(f"+{x}+{y}")

    root.mainloop()
