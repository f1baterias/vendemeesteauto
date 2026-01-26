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
// 🚗 LISTA DE AUTOS - AQUÍ AGREGAS TUS AUTOS
// ============================================================================
// 
// ESTRUCTURA DE CARPETAS PARA IMÁGENES:
// 
//   res/
//   └── vehiculos/
//       ├── corolla1/           ← Carpeta para el primer Corolla
//       │   ├── 1.jpg
//       │   ├── 2.jpg
//       │   └── 3.jpg
//       ├── vento1/             ← Carpeta para el Vento
//       │   ├── 1.jpg
//       │   └── 2.jpg
//       └── ranger1/            ← Carpeta para la Ranger
//           ├── 1.jpg
//           ├── 2.jpg
//           ├── 3.jpg
//           └── 4.jpg
//
// CÓMO AGREGAR UN AUTO:
// 1. Crea una carpeta en res/vehiculos/ con un nombre único (ej: "fordfiesta2")
// 2. Mete las fotos del auto ahí (nombradas 1.jpg, 2.jpg, 3.jpg, etc.)
// 3. Copia el bloque de ejemplo y complétalo con los datos
// 4. En "carpeta" pones el nombre de la carpeta que creaste
// 5. En "imagenes" pones los nombres de las fotos
//
// TIPOS DE CARROCERÍA DISPONIBLES:
// "Coupé", "Camión", "Sedán", "Hatchback", "SUV", "Descapotable", 
// "Familiar", "Camioneta", "Coche pequeño", "Otra"
//
// ============================================================================

const LISTA_AUTOS = [
    
    // ──────────────────────────────────────────────────────────────────────────
    // AUTO #1 - EJEMPLO
    // ──────────────────────────────────────────────────────────────────────────
    {
        titulo: "Toyota Corolla XEI Pack CVT",
        precio: 18500000,
        marca: "Toyota",
        modelo: "Corolla",
        año: 2020,
        motor: "1.8 L",
        combustible: "Nafta",
        carroceria: "Sedán",                // NUEVO: Tipo de carrocería
        version: "XEI Pack CVT",
        kilometraje: "45.000 km",
        documentacion: "08 al día",
        permuta: true,
        carpeta: "corolla1",                // Nombre de la carpeta en res/vehiculos/
        imagenes: ["1.jpg", "2.jpg", "3.jpg"],  // Lista de imágenes dentro de esa carpeta
        destacado: true
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
        carroceria: "Sedán",
        version: "GLI",
        kilometraje: "38.000 km",
        documentacion: "08 al día",
        permuta: true,
        carpeta: "vento1",
        imagenes: ["1.jpg", "2.jpg"],
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
        carroceria: "Camioneta",
        version: "Limited 4x4 AT",
        kilometraje: "28.000 km",
        documentacion: "08 al día",
        permuta: false,
        carpeta: "ranger1",
        imagenes: ["1.jpg", "2.jpg", "3.jpg", "4.jpg"],
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
        carroceria: "Sedán",
        version: "LTZ+ AT",
        kilometraje: "62.000 km",
        documentacion: "08 al día",
        permuta: true,
        carpeta: "cruze1",
        imagenes: ["1.jpg", "2.jpg"],
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
        carroceria: "Sedán",
        version: "Precision AT",
        kilometraje: "15.000 km",
        documentacion: "08 al día",
        permuta: true,
        carpeta: "cronos1",
        imagenes: ["1.jpg", "2.jpg", "3.jpg"],
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
        carroceria: "Hatchback",
        version: "GT",
        kilometraje: "22.000 km",
        documentacion: "08 al día",
        permuta: true,
        carpeta: "208gt1",
        imagenes: ["1.jpg", "2.jpg"],
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
        carroceria: "SUV",
        version: "Iconic 4x4",
        kilometraje: "8.000 km",
        documentacion: "08 al día",
        permuta: true,
        carpeta: "duster1",
        imagenes: ["1.jpg", "2.jpg", "3.jpg"],
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
        carroceria: "SUV",
        version: "EXL CVT",
        kilometraje: "35.000 km",
        documentacion: "08 al día",
        permuta: true,
        carpeta: "hrv1",
        imagenes: ["1.jpg", "2.jpg"],
        destacado: false
    }

    // ──────────────────────────────────────────────────────────────────────────
    // PARA AGREGAR MÁS AUTOS:
    // 1. Pon una COMA después del último }
    // 2. Copia todo el bloque de un auto (desde { hasta })
    // 3. Pégalo aquí abajo
    // 4. Modifica los datos
    // 5. Crea la carpeta con las fotos en res/vehiculos/
    // ──────────────────────────────────────────────────────────────────────────

];


// ============================================================================
// OPCIONES DE FILTROS
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

const CARROCERIAS_DISPONIBLES = [
    "Coupé",
    "Camión",
    "Sedán",
    "Hatchback",
    "SUV",
    "Descapotable",
    "Familiar",
    "Camioneta",
    "Coche pequeño",
    "Otra"
];


// ============================================================================
// RANGOS DE PRECIO PREDEFINIDOS PARA FILTROS
// (El usuario también puede elegir un rango personalizado)
// ============================================================================

const RANGOS_PRECIO = [
    { etiqueta: "Hasta $10.000.000", min: 0, max: 10000000 },
    { etiqueta: "$10.000.000 - $15.000.000", min: 10000000, max: 15000000 },
    { etiqueta: "$15.000.000 - $20.000.000", min: 15000000, max: 20000000 },
    { etiqueta: "$20.000.000 - $30.000.000", min: 20000000, max: 30000000 },
    { etiqueta: "Más de $30.000.000", min: 30000000, max: 999999999 }
];


// ============================================================================
// AÑOS PARA FILTROS
// ============================================================================

const AÑOS_DISPONIBLES = [
    2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 
    2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005
    // Agrega o quita años según necesites
];
