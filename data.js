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
// RUTA AL INVENTARIO Y A LAS IMÁGENES
// ============================================================================

const RUTAS = {
    dataJson: "data/cars/data.json",         // Archivo JSON con el inventario
    imagenesBase: "res/cars/img"             // Carpeta base de imágenes
};


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
// RANGOS DE PRECIO PREDEFINIDOS PARA FILTROS (en USD)
// ============================================================================

const RANGOS_PRECIO = [
    { etiqueta: "Hasta U$S 3.000", min: 0, max: 3000 },
    { etiqueta: "U$S 3.000 - U$S 5.000", min: 3000, max: 5000 },
    { etiqueta: "U$S 5.000 - U$S 8.000", min: 5000, max: 8000 },
    { etiqueta: "U$S 8.000 - U$S 12.000", min: 8000, max: 12000 },
    { etiqueta: "Más de U$S 12.000", min: 12000, max: 999999 }
];


// ============================================================================
// AÑOS PARA FILTROS
// ============================================================================

const AÑOS_DISPONIBLES = [
    2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015,
    2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005,
    2004, 2003, 2002, 2001, 2000, 1999, 1998, 1997, 1996, 1995,
    1994, 1993, 1992
];
