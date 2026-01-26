// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                    DATOS DE LA CONCESIONARIA                               ║
// ║           "Vendeme este auto" - ARCHIVO FÁCIL DE EDITAR                    ║
// ╚════════════════════════════════════════════════════════════════════════════╝

// ============================================================================
// INFORMACIÓN DE CONTACTO - Modifica estos datos con tu información
// ============================================================================

const INFORMACION_CONTACTO = {
    telefono: "+54 11 1234-5678",           // Tu número de teléfono
    whatsapp: "5491112345678",               // Tu WhatsApp SIN espacios ni guiones
    direccion: "Av. Libertador 1234",        // Tu dirección
    ciudad: "Buenos Aires, Argentina",       // Tu ciudad
    email: "ventas@vendemesteauto.com",      // Tu email
    horario: "Lun - Sáb: 9:00 - 19:00"      // Tu horario de atención
};


// ============================================================================
// REDES SOCIALES - Cambia los links por los tuyos (deja vacío "" si no tienes)
// ============================================================================

const REDES_SOCIALES = {
    instagram: "https://instagram.com/vendemesteauto",
    facebook: "https://facebook.com/vendemesteauto",
    whatsapp: "https://wa.me/5491112345678"  // Usa tu número de WhatsApp
};


// ============================================================================
// LISTA DE AUTOS - AQUÍ AGREGAS TUS AUTOS
// ============================================================================
// 
// Para agregar un auto nuevo, copia el bloque de ejemplo entre { } y pégalo
// después del último auto. Recuerda poner una coma después de cada auto.
//
// IMPORTANTE: 
// - Las imágenes ponelas en la carpeta "imagenes" y escribe solo el nombre
// - Si no tienes imagen, escribe: "sin-imagen.jpg"
// - Los precios van SIN puntos ni comas (ejemplo: 15000000)
//
// ============================================================================

const LISTA_AUTOS = [
    
    // ──────────────────────────────────────────────────────────────────────────
    // AUTO #1 - EJEMPLO (puedes modificar o borrar este)
    // ──────────────────────────────────────────────────────────────────────────
    {
        titulo: "Toyota Corolla XEI Pack CVT",
        precio: 18500000,
        marca: "Toyota",
        modelo: "Corolla",
        año: 2020,
        motor: "1.8 L",
        combustible: "Nafta",
        version: "XEI Pack CVT",
        kilometraje: "45.000 km",
        documentacion: "08 al día",
        permuta: true,              // true = acepta permuta, false = no acepta
        imagen: "corolla.jpg",      // Nombre del archivo de imagen
        destacado: true             // true = aparece como destacado
    },

    // ──────────────────────────────────────────────────────────────────────────
    // AUTO #2
    // ──────────────────────────────────────────────────────────────────────────
    {
        titulo: "Volkswagen Vento GLI 2.0 TSI",
        precio: 22000000,
        marca: "Volkswagen",
        modelo: "Vento",
        año: 2019,
        motor: "2.0 TSI",
        combustible: "Nafta",
        version: "GLI",
        kilometraje: "38.000 km",
        documentacion: "08 al día",
        permuta: true,
        imagen: "vento.jpg",
        destacado: true
    },

    // ──────────────────────────────────────────────────────────────────────────
    // AUTO #3
    // ──────────────────────────────────────────────────────────────────────────
    {
        titulo: "Ford Ranger Limited 3.2 4x4 AT",
        precio: 35000000,
        marca: "Ford",
        modelo: "Ranger",
        año: 2021,
        motor: "3.2 TDCi",
        combustible: "Diesel",
        version: "Limited 4x4 AT",
        kilometraje: "28.000 km",
        documentacion: "08 al día",
        permuta: false,
        imagen: "ranger.jpg",
        destacado: true
    },

    // ──────────────────────────────────────────────────────────────────────────
    // AUTO #4
    // ──────────────────────────────────────────────────────────────────────────
    {
        titulo: "Chevrolet Cruze LTZ+ AT",
        precio: 16500000,
        marca: "Chevrolet",
        modelo: "Cruze",
        año: 2018,
        motor: "1.4 Turbo",
        combustible: "Nafta",
        version: "LTZ+ AT",
        kilometraje: "62.000 km",
        documentacion: "08 al día",
        permuta: true,
        imagen: "cruze.jpg",
        destacado: false
    },

    // ──────────────────────────────────────────────────────────────────────────
    // AUTO #5
    // ──────────────────────────────────────────────────────────────────────────
    {
        titulo: "Fiat Cronos Precision 1.8 AT",
        precio: 12800000,
        marca: "Fiat",
        modelo: "Cronos",
        año: 2022,
        motor: "1.8 E.torQ",
        combustible: "Nafta",
        version: "Precision AT",
        kilometraje: "15.000 km",
        documentacion: "08 al día",
        permuta: true,
        imagen: "cronos.jpg",
        destacado: false
    },

    // ──────────────────────────────────────────────────────────────────────────
    // AUTO #6
    // ──────────────────────────────────────────────────────────────────────────
    {
        titulo: "Peugeot 208 GT 1.6 THP",
        precio: 19500000,
        marca: "Peugeot",
        modelo: "208",
        año: 2021,
        motor: "1.6 THP",
        combustible: "Nafta",
        version: "GT",
        kilometraje: "22.000 km",
        documentacion: "08 al día",
        permuta: true,
        imagen: "208gt.jpg",
        destacado: false
    },

    // ──────────────────────────────────────────────────────────────────────────
    // AUTO #7
    // ──────────────────────────────────────────────────────────────────────────
    {
        titulo: "Renault Duster Iconic 1.3 TCe 4x4",
        precio: 21000000,
        marca: "Renault",
        modelo: "Duster",
        año: 2023,
        motor: "1.3 TCe",
        combustible: "Nafta",
        version: "Iconic 4x4",
        kilometraje: "8.000 km",
        documentacion: "08 al día",
        permuta: true,
        imagen: "duster.jpg",
        destacado: false
    },

    // ──────────────────────────────────────────────────────────────────────────
    // AUTO #8
    // ──────────────────────────────────────────────────────────────────────────
    {
        titulo: "Honda HR-V EXL CVT",
        precio: 24500000,
        marca: "Honda",
        modelo: "HR-V",
        año: 2020,
        motor: "1.8 i-VTEC",
        combustible: "Nafta",
        version: "EXL CVT",
        kilometraje: "35.000 km",
        documentacion: "08 al día",
        permuta: true,
        imagen: "hrv.jpg",
        destacado: false
    }

    // ──────────────────────────────────────────────────────────────────────────
    // PARA AGREGAR MÁS AUTOS:
    // 1. Pon una COMA después del último }
    // 2. Copia todo el bloque de un auto (desde { hasta })
    // 3. Pégalo aquí abajo
    // 4. Modifica los datos
    // ──────────────────────────────────────────────────────────────────────────

];


// ============================================================================
// OPCIONES DE FILTROS - Modifica según las marcas que manejes
// ============================================================================

const MARCAS_DISPONIBLES = [
    "Toyota",
    "Volkswagen", 
    "Ford",
    "Chevrolet",
    "Fiat",
    "Peugeot",
    "Renault",
    "Honda",
    "Nissan",
    "Jeep",
    "Citroën"
    // Agrega más marcas separadas por comas
];

const COMBUSTIBLES_DISPONIBLES = [
    "Nafta",
    "Diesel",
    "GNC",
    "Híbrido",
    "Eléctrico"
];


// ============================================================================
// RANGOS DE PRECIO PARA FILTROS
// ============================================================================

const RANGOS_PRECIO = [
    { etiqueta: "Hasta $10.000.000", min: 0, max: 10000000 },
    { etiqueta: "$10.000.000 - $15.000.000", min: 10000000, max: 15000000 },
    { etiqueta: "$15.000.000 - $20.000.000", min: 15000000, max: 20000000 },
    { etiqueta: "$20.000.000 - $30.000.000", min: 20000000, max: 30000000 },
    { etiqueta: "Más de $30.000.000", min: 30000000, max: 999999999 }
];


// ============================================================================
// AÑOS PARA FILTROS (desde - hasta)
// ============================================================================

const AÑO_DESDE = 2010;  // Año mínimo en los filtros
const AÑO_HASTA = 2024;  // Año máximo en los filtros
