/* ═══════════════════════════════════════════════════════════════════════════
   VENDEME ESTE AUTO - JAVASCRIPT
   Concesionaria de Autos
   ═══════════════════════════════════════════════════════════════════════════ */

// ============================================================================
// ESTADO GLOBAL
// ============================================================================

let LISTA_AUTOS = [];
let cotizacionDolar = 0; // 0 = no definido aún
let mostrarEnPesos = false;

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

document.addEventListener('DOMContentLoaded', async function() {
    cargarInformacionContacto();
    cargarFiltros();
    inicializarEventos();
    inicializarVisor();
    await cargarInventario();
    obtenerCotizacionBlue();
});

// ============================================================================
// CARGA DEL INVENTARIO (data.json local)
// ============================================================================

async function cargarInventario() {
    const grid = document.getElementById('autos-grid');
    const sinResultados = document.getElementById('sin-resultados');

    sinResultados.style.display = 'none';
    grid.innerHTML = `
        <div class="estado-carga">
            <div class="carga-spinner"></div>
            <p>Cargando vehículos...</p>
        </div>
    `;

    try {
        const response = await fetch(RUTAS.dataJson);

        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data.autos || !Array.isArray(data.autos)) {
            throw new Error('Formato de datos inválido');
        }

        LISTA_AUTOS = data.autos;

        // Aplicar configuracion de la pagina si existe
        if (data.config) {
            aplicarConfig(data.config);
        }

        document.getElementById('total-autos').textContent = LISTA_AUTOS.length;
        cargarAutos();

    } catch (error) {
        console.error('Error cargando inventario:', error);
        grid.innerHTML = `
            <div class="estado-error">
                <span class="estado-error-icono"><img src="res/ico/warning.svg" alt="Error" style="width:48px;height:48px"></span>
                <h3>No se pudieron cargar los vehículos</h3>
                <p>Verificá que el archivo data.json esté accesible.</p>
                <button class="btn-reintentar" onclick="cargarInventario()">Reintentar</button>
            </div>
        `;
    }
}

// ============================================================================
// UTILIDADES DE IMÁGENES (rutas locales)
// ============================================================================

function obtenerRutaImagen(auto, indice) {
    if (!auto.imagenes || auto.imagenes.length === 0 || indice >= auto.imagenes.length) {
        return null;
    }
    return `${RUTAS.imagenesBase}/${auto.id}/${auto.imagenes[indice]}`;
}

function obtenerTodasLasImagenes(auto) {
    if (!auto.imagenes || auto.imagenes.length === 0) {
        return [];
    }
    return auto.imagenes.map((img, i) => obtenerRutaImagen(auto, i));
}

// ============================================================================
// CARGAR INFORMACIÓN DE CONTACTO
// ============================================================================

function cargarInformacionContacto() {
    const telLimpio = INFORMACION_CONTACTO.telefono.replace(/\s/g, '');
    const waUrl = 'https://wa.me/' + INFORMACION_CONTACTO.whatsapp;

    document.getElementById('display-telefono').textContent = INFORMACION_CONTACTO.telefono;
    document.getElementById('header-phone').href = 'tel:' + telLimpio;
    document.getElementById('header-whatsapp').href = waUrl;

    // Mobile header buttons
    const waMobile = document.getElementById('header-whatsapp-mobile');
    if (waMobile) waMobile.href = waUrl + '?text=' + encodeURIComponent('Hola! Me interesa un vehiculo');
    const phoneMobile = document.getElementById('header-phone-mobile');
    if (phoneMobile) phoneMobile.href = 'tel:' + telLimpio;

    document.getElementById('display-direccion').textContent = INFORMACION_CONTACTO.direccion + ', ' + INFORMACION_CONTACTO.ciudad;
    document.getElementById('display-horario').textContent = INFORMACION_CONTACTO.horario;
    document.getElementById('display-telefono-info').textContent = INFORMACION_CONTACTO.telefono;

    document.getElementById('footer-direccion').innerHTML = '<img src="res/ico/location.svg" alt="" style="width:16px;height:16px;display:inline;vertical-align:middle;margin-right:6px">' + INFORMACION_CONTACTO.direccion + ', ' + INFORMACION_CONTACTO.ciudad;
    document.getElementById('footer-telefono').innerHTML = '<img src="res/ico/phone.svg" alt="" style="width:16px;height:16px;display:inline;vertical-align:middle;margin-right:6px">' + INFORMACION_CONTACTO.telefono;
    document.getElementById('footer-horario').innerHTML = '<img src="res/ico/clock.svg" alt="" style="width:16px;height:16px;display:inline;vertical-align:middle;margin-right:6px">' + INFORMACION_CONTACTO.horario;

    if (REDES_SOCIALES.instagram) {
        document.getElementById('link-instagram').href = REDES_SOCIALES.instagram;
    } else {
        document.getElementById('link-instagram').style.display = 'none';
    }

    if (REDES_SOCIALES.facebook) {
        document.getElementById('link-facebook').href = REDES_SOCIALES.facebook;
    } else {
        document.getElementById('link-facebook').style.display = 'none';
    }

    if (REDES_SOCIALES.whatsapp) {
        document.getElementById('link-whatsapp-footer').href = REDES_SOCIALES.whatsapp;
    }

    document.getElementById('whatsapp-flotante').href = 'https://wa.me/' + INFORMACION_CONTACTO.whatsapp + '?text=Hola!%20Me%20interesa%20un%20vehículo';
    document.getElementById('año-actual').textContent = new Date().getFullYear();
    document.getElementById('total-autos').textContent = '...';
}

// ============================================================================
// APLICAR CONFIGURACION DESDE data.json
// ============================================================================

function aplicarConfig(config) {
    // Sobreescribir datos de contacto si vienen en config
    if (config.telefono) INFORMACION_CONTACTO.telefono = config.telefono;
    if (config.whatsapp) INFORMACION_CONTACTO.whatsapp = config.whatsapp;
    if (config.direccion) INFORMACION_CONTACTO.direccion = config.direccion;
    if (config.ciudad) INFORMACION_CONTACTO.ciudad = config.ciudad;
    if (config.email) INFORMACION_CONTACTO.email = config.email;
    if (config.horario) INFORMACION_CONTACTO.horario = config.horario;

    // Sobreescribir redes sociales
    if (config.instagram) REDES_SOCIALES.instagram = config.instagram;
    if (config.facebook) REDES_SOCIALES.facebook = config.facebook;
    if (config.whatsapp) REDES_SOCIALES.whatsapp = 'https://wa.me/' + config.whatsapp;

    // Re-aplicar contacto con los datos actualizados
    cargarInformacionContacto();

    // Titulo del hero
    const heroLine1 = document.getElementById('hero-titulo-1');
    const heroLine2 = document.getElementById('hero-titulo-2');
    if (heroLine1 && config.titulo_linea1) heroLine1.textContent = config.titulo_linea1;
    if (heroLine2 && config.titulo_linea2) heroLine2.textContent = config.titulo_linea2;

    // Logo
    if (config.logo) {
        const logos = document.querySelectorAll('.logo-icon img');
        logos.forEach(img => { img.src = config.logo; });
        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon) favicon.href = config.logo;
    }

    // Marcas dinámicas desde config
    if (config.marcas && Array.isArray(config.marcas)) {
        cargarFiltros(config.marcas);
    }

    // Sección destacados
    cargarDestacados(config);
}

// ============================================================================
// SECCIÓN DESTACADOS
// ============================================================================

function cargarDestacados(config) {
    const seccion = document.getElementById('seccion-destacados');
    const grid = document.getElementById('destacados-grid');
    if (!seccion || !grid) return;

    if (!config.destacados_activos || !config.destacados_ids || config.destacados_ids.length === 0) {
        seccion.style.display = 'none';
        return;
    }

    // Filtrar autos destacados (máx 3)
    const destacados = config.destacados_ids
        .slice(0, 3)
        .map(id => LISTA_AUTOS.find(a => a.id === id))
        .filter(Boolean);

    if (destacados.length === 0) {
        seccion.style.display = 'none';
        return;
    }

    grid.innerHTML = '';
    destacados.forEach(auto => {
        const img = obtenerRutaImagen(auto, 0);
        const mensajeWA = encodeURIComponent(
            `Hola! Me interesa el ${auto.titulo} (${auto.año}) publicado a ${formatearPrecio(auto.precio)}. ¿Está disponible?`
        );

        // Precio: si tiene oferta, mostrar tachado + oferta
        let precioHTML;
        if (auto.oferta && auto.precio_oferta) {
            precioHTML = `
                <span class="destacado-precio-original">${formatearPrecio(auto.precio)}</span>
                <span class="destacado-precio-oferta">${formatearPrecio(auto.precio_oferta)}</span>
            `;
        } else {
            precioHTML = `<span class="destacado-precio">${formatearPrecio(auto.precio)}</span>`;
        }

        const card = document.createElement('article');
        card.className = 'destacado-card';
        card.innerHTML = `
            <div class="destacado-img-container">
                <span class="destacado-badge">${auto.oferta ? 'OFERTA' : '★ DESTACADO'}</span>
                <img src="${img || ''}" alt="${auto.titulo}" class="destacado-img" loading="lazy"
                     onerror="this.src=''; this.alt='Sin imagen'">
            </div>
            <div class="destacado-info">
                <span class="destacado-marca">${auto.marca}</span>
                <h3 class="destacado-titulo">${auto.titulo}</h3>
                <div class="destacado-specs">
                    <span>${auto.año}</span>
                    <span>${auto.combustible}</span>
                    <span>${auto.kilometraje || ''}</span>
                </div>
                ${precioHTML}
                <div class="destacado-acciones">
                    <a href="https://wa.me/${INFORMACION_CONTACTO.whatsapp}?text=${mensajeWA}"
                       class="btn-destacado-wa" target="_blank" rel="noopener" onclick="event.stopPropagation()">
                        <img src="res/ico/whatsapp.svg" alt="" style="width:16px;height:16px"> Consultar
                    </a>
                    <button class="btn-destacado-ver" onclick="event.stopPropagation()">Ver detalles</button>
                </div>
            </div>
        `;

        card.addEventListener('click', () => abrirModal(auto));
        const btnVer = card.querySelector('.btn-destacado-ver');
        if (btnVer) btnVer.addEventListener('click', (e) => { e.stopPropagation(); abrirModal(auto); });

        grid.appendChild(card);
    });

    seccion.style.display = 'block';
}

// ============================================================================
// CARGAR FILTROS
// ============================================================================

function cargarFiltros(marcasOverride) {
    const filtroPrecio = document.getElementById('filtro-precio');
    if (filtroPrecio.options.length <= 1) {
        RANGOS_PRECIO.forEach((rango, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = rango.etiqueta;
            filtroPrecio.appendChild(option);
        });
    }

    // Marcas: usar override de config o fallback a MARCAS_DISPONIBLES
    const filtroMarca = document.getElementById('filtro-marca');
    const marcas = marcasOverride || MARCAS_DISPONIBLES;
    // Limpiar opciones existentes (excepto la primera "Todas")
    while (filtroMarca.options.length > 1) filtroMarca.remove(1);
    marcas.forEach(marca => {
        const option = document.createElement('option');
        option.value = marca;
        option.textContent = marca;
        filtroMarca.appendChild(option);
    });

    // Año: ahora es rango manual, no se cargan opciones

    const filtroCarroceria = document.getElementById('filtro-carroceria');
    if (filtroCarroceria.options.length <= 1) {
        CARROCERIAS_DISPONIBLES.forEach(carroceria => {
            const option = document.createElement('option');
            option.value = carroceria;
            option.textContent = carroceria;
            filtroCarroceria.appendChild(option);
        });
    }

    const filtroCombustible = document.getElementById('filtro-combustible');
    if (filtroCombustible.options.length <= 1) {
        COMBUSTIBLES_DISPONIBLES.forEach(combustible => {
            const option = document.createElement('option');
            option.value = combustible;
            option.textContent = combustible;
            filtroCombustible.appendChild(option);
        });
    }
}

// ============================================================================
// CARGAR Y MOSTRAR AUTOS
// ============================================================================

function cargarAutos() {
    const autosFiltrados = filtrarAutos();
    mostrarAutos(autosFiltrados);
}

function filtrarAutos() {
    const busqueda = document.getElementById('filtro-busqueda').value.toLowerCase();
    const precioIndex = document.getElementById('filtro-precio').value;
    const precioMin = document.getElementById('precio-min').value;
    const precioMax = document.getElementById('precio-max').value;
    const marca = document.getElementById('filtro-marca').value;
    const añoMin = document.getElementById('filtro-año-min').value;
    const añoMax = document.getElementById('filtro-año-max').value;
    const carroceria = document.getElementById('filtro-carroceria').value;
    const combustible = document.getElementById('filtro-combustible').value;

    return LISTA_AUTOS.filter(auto => {
        if (busqueda) {
            const textoCompleto = `${auto.titulo} ${auto.marca} ${auto.modelo} ${auto.version}`.toLowerCase();
            if (!textoCompleto.includes(busqueda)) return false;
        }

        if (precioMin || precioMax) {
            const min = precioMin ? parseInt(precioMin) : 0;
            const max = precioMax ? parseInt(precioMax) : Infinity;
            if (auto.precio < min || auto.precio > max) return false;
        } else if (precioIndex !== '') {
            const rango = RANGOS_PRECIO[precioIndex];
            if (auto.precio < rango.min || auto.precio > rango.max) return false;
        }

        if (marca && auto.marca !== marca) return false;

        // Filtro de año por rango
        if (añoMin && auto.año < parseInt(añoMin)) return false;
        if (añoMax && auto.año > parseInt(añoMax)) return false;

        if (carroceria && auto.carroceria !== carroceria) return false;
        if (combustible && auto.combustible !== combustible) return false;

        return true;
    });
}

function mostrarAutos(autos) {
    const grid = document.getElementById('autos-grid');
    const sinResultados = document.getElementById('sin-resultados');
    const contador = document.getElementById('contador-resultados');

    contador.textContent = autos.length;
    grid.innerHTML = '';

    if (autos.length === 0) {
        sinResultados.style.display = 'block';
        return;
    }

    sinResultados.style.display = 'none';

    // Ordenar segun selector
    const orden = document.getElementById('ordenar-por').value;
    const autosOrdenados = [...autos].sort((a, b) => {
        switch (orden) {
            case 'precio-asc': return a.precio - b.precio;
            case 'precio-desc': return b.precio - a.precio;
            case 'año-desc': return (b.año || 0) - (a.año || 0);
            case 'año-asc': return (a.año || 0) - (b.año || 0);
            default: // destacados
                if (a.destacado && !b.destacado) return -1;
                if (!a.destacado && b.destacado) return 1;
                return 0;
        }
    });

    autosOrdenados.forEach((auto, index) => {
        const card = crearCardAuto(auto, index);
        grid.appendChild(card);
    });

    // Actualizar filtros activos (chips)
    actualizarFiltrosActivos();
}

function crearCardAuto(auto, index) {
    const card = document.createElement('article');
    const esOferta = auto.oferta && auto.precio_oferta;
    card.className = 'auto-card' + (auto.destacado ? ' destacado' : '') + (esOferta ? ' en-oferta' : '');
    card.style.animationDelay = `${index * 0.1}s`;

    const primeraImagen = obtenerRutaImagen(auto, 0);
    const imagenHTML = primeraImagen
        ? `<img src="${primeraImagen}" alt="${auto.titulo}" class="auto-imagen" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'auto-imagen-placeholder\\'><span>Sin imagen</span></div>'">`
        : `<div class="auto-imagen-placeholder"><span>Sin imagen</span></div>`;

    const cantidadFotos = auto.imagenes ? auto.imagenes.length : 0;
    const indicadorFotos = cantidadFotos > 1
        ? `<span class="fotos-cantidad"><img src="res/ico/camera.svg" alt="" style="width:12px;height:12px;display:inline;vertical-align:middle;margin-right:3px">${cantidadFotos}</span>`
        : '';

    // Badge oferta
    const ofertaBadge = esOferta ? '<span class="oferta-badge">OFERTA</span>' : '';

    // Precio: oferta o normal, con soporte pesos
    let precioPrincipalHTML, precioSecundarioHTML;
    const precioMostrar = esOferta ? auto.precio_oferta : auto.precio;

    if (esOferta) {
        if (mostrarEnPesos && cotizacionDolar > 0) {
            precioPrincipalHTML = `
                <span class="auto-precio-original">$ ${(auto.precio * cotizacionDolar).toLocaleString('es-AR')}</span>
                <span class="auto-precio-oferta">$ ${(auto.precio_oferta * cotizacionDolar).toLocaleString('es-AR')}</span>
            `;
            precioSecundarioHTML = `<span class="auto-precio-secundario">${formatearPrecio(auto.precio_oferta)}</span>`;
        } else {
            precioPrincipalHTML = `
                <span class="auto-precio-original">${formatearPrecio(auto.precio)}</span>
                <span class="auto-precio-oferta">${formatearPrecio(auto.precio_oferta)}</span>
            `;
            precioSecundarioHTML = '';
        }
    } else {
        if (mostrarEnPesos && cotizacionDolar > 0) {
            precioPrincipalHTML = `<span class="auto-precio">$ ${(auto.precio * cotizacionDolar).toLocaleString('es-AR')}</span>`;
            precioSecundarioHTML = `<span class="auto-precio-secundario">${formatearPrecio(auto.precio)}</span>`;
        } else {
            precioPrincipalHTML = `<span class="auto-precio">${formatearPrecio(auto.precio)}</span>`;
            precioSecundarioHTML = '';
        }
    }

    const precioWA = esOferta ? auto.precio_oferta : auto.precio;
    const mensajeWA = encodeURIComponent(
        `Hola! Me interesa el ${auto.titulo} (${auto.año}) publicado a ${formatearPrecio(precioWA)}. ¿Está disponible?`
    );

    card.innerHTML = `
        <div class="auto-imagen-container">
            ${imagenHTML}
            ${indicadorFotos}
            ${ofertaBadge}
        </div>
        <div class="auto-info">
            <span class="auto-marca">${auto.marca}</span>
            <h3 class="auto-titulo">${auto.titulo}</h3>
            <div class="auto-specs">
                <span class="auto-spec"><img src="res/ico/calendar.svg" alt="" class="spec-icon"> ${auto.año}</span>
                <span class="auto-spec"><img src="res/ico/fuel.svg" alt="" class="spec-icon"> ${auto.combustible}</span>
                <span class="auto-spec"><img src="res/ico/car-body.svg" alt="" class="spec-icon"> ${auto.carroceria || 'N/A'}</span>
            </div>
            <div class="auto-precio-container">
                <div class="auto-precio-bloque">
                    ${precioPrincipalHTML}
                    ${precioSecundarioHTML}
                </div>
            </div>
            <div class="auto-card-acciones">
                <a href="https://wa.me/${INFORMACION_CONTACTO.whatsapp}?text=${mensajeWA}"
                   class="btn-card-whatsapp" target="_blank" rel="noopener" onclick="event.stopPropagation()">
                    <img src="res/ico/whatsapp.svg" alt="" style="width:16px;height:16px"> Consultar
                </a>
                <button class="btn-card-ver" onclick="event.stopPropagation()">Ver detalles</button>
            </div>
        </div>
    `;

    // Click en card o boton "Ver detalles" abre modal
    card.addEventListener('click', () => abrirModal(auto));
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirModal(auto); }
    });
    // Boton ver detalles
    const btnVer = card.querySelector('.btn-card-ver');
    if (btnVer) btnVer.addEventListener('click', (e) => { e.stopPropagation(); abrirModal(auto); });

    return card;
}

// ============================================================================
// MODAL DE DETALLE CON GALERÍA + ZOOM
// ============================================================================

let imagenActual = 0;
let imagenesGaleria = [];
let zoomActivo = false;

function abrirModal(auto) {
    const modal = document.getElementById('modal-auto');
    const body = document.getElementById('modal-body');

    imagenesGaleria = obtenerTodasLasImagenes(auto);
    imagenActual = 0;
    zoomActivo = false;

    let galeriaHTML;
    if (imagenesGaleria.length > 0) {
        const thumbnailsHTML = imagenesGaleria.length > 1
            ? `<div class="galeria-thumbnails">
                ${imagenesGaleria.map((img, i) =>
                    `<img src="${img}" alt="Foto ${i + 1}" class="thumbnail ${i === 0 ? 'activo' : ''}" onclick="cambiarImagen(${i})" loading="lazy" onerror="this.style.display='none'">`
                ).join('')}
               </div>`
            : '';

        const navegacionHTML = imagenesGaleria.length > 1
            ? `<button class="galeria-btn galeria-prev" onclick="event.stopPropagation(); imagenAnterior()">❮</button>
               <button class="galeria-btn galeria-next" onclick="event.stopPropagation(); imagenSiguiente()">❯</button>
               <span class="galeria-contador">${imagenActual + 1} / ${imagenesGaleria.length}</span>`
            : '';

        galeriaHTML = `
            <div class="galeria-container">
                <div class="galeria-principal" onclick="toggleZoom(event)">
                    <img src="${imagenesGaleria[0]}" alt="${auto.titulo}" id="imagen-principal" class="zoom-cursor" onerror="this.src=''; this.alt='Sin imagen disponible'">
                    ${navegacionHTML}
                    <button class="galeria-btn-zoom" onclick="event.stopPropagation(); toggleZoom(event)" title="Zoom">
                        <img src="res/ico/search.svg" alt="Zoom" style="width:16px;height:16px;filter:brightness(10)">
                    </button>
                </div>
                ${thumbnailsHTML}
            </div>
        `;
    } else {
        galeriaHTML = `
            <div class="galeria-container">
                <div class="galeria-principal">
                    <div class="auto-imagen-placeholder" style="height: 100%;">
                        <span>Sin imágenes disponibles</span>
                    </div>
                </div>
            </div>
        `;
    }

    const esOferta = auto.oferta && auto.precio_oferta;
    const precioWA = esOferta ? auto.precio_oferta : auto.precio;
    const mensajeWhatsApp = encodeURIComponent(
        `Hola! Me interesa el ${auto.titulo} (${auto.año}) publicado a ${formatearPrecio(precioWA)}. ¿Está disponible?`
    );

    // Precio principal y secundario en modal
    let modalPrecioPrincipal, modalPrecioSecundario;
    if (esOferta) {
        if (mostrarEnPesos && cotizacionDolar > 0) {
            modalPrecioPrincipal = `
                <span class="modal-precio-original">$ ${(auto.precio * cotizacionDolar).toLocaleString('es-AR')}</span>
                <span class="modal-precio-oferta">$ ${(auto.precio_oferta * cotizacionDolar).toLocaleString('es-AR')}</span>
            `;
            modalPrecioSecundario = `<span class="modal-precio-secundario">${formatearPrecio(auto.precio_oferta)}</span>`;
        } else {
            modalPrecioPrincipal = `
                <span class="modal-precio-original">${formatearPrecio(auto.precio)}</span>
                <span class="modal-precio-oferta">${formatearPrecio(auto.precio_oferta)}</span>
            `;
            modalPrecioSecundario = '';
        }
    } else {
        if (mostrarEnPesos && cotizacionDolar > 0) {
            modalPrecioPrincipal = `<span class="modal-precio">$ ${(auto.precio * cotizacionDolar).toLocaleString('es-AR')}</span>`;
            modalPrecioSecundario = `<span class="modal-precio-secundario">${formatearPrecio(auto.precio)}</span>`;
        } else {
            modalPrecioPrincipal = `<span class="modal-precio">${formatearPrecio(auto.precio)}</span>`;
            modalPrecioSecundario = '';
        }
    }

    body.innerHTML = `
        <div class="modal-imagen">
            ${galeriaHTML}
        </div>
        <div class="modal-detalles">
            <span class="modal-marca">${auto.marca}</span>
            <h2 class="modal-titulo">${auto.titulo}</h2>

            <div class="modal-specs">
                <div class="modal-spec">
                    <span class="modal-spec-label">Marca</span>
                    <span class="modal-spec-value">${auto.marca}</span>
                </div>
                <div class="modal-spec">
                    <span class="modal-spec-label">Modelo</span>
                    <span class="modal-spec-value">${auto.modelo}</span>
                </div>
                <div class="modal-spec">
                    <span class="modal-spec-label">Año</span>
                    <span class="modal-spec-value">${auto.año}</span>
                </div>
                <div class="modal-spec">
                    <span class="modal-spec-label">Versión</span>
                    <span class="modal-spec-value">${auto.version}</span>
                </div>
                <div class="modal-spec">
                    <span class="modal-spec-label">Motor</span>
                    <span class="modal-spec-value">${auto.motor}</span>
                </div>
                <div class="modal-spec">
                    <span class="modal-spec-label">Combustible</span>
                    <span class="modal-spec-value">${auto.combustible}</span>
                </div>
                <div class="modal-spec">
                    <span class="modal-spec-label">Carrocería</span>
                    <span class="modal-spec-value">${auto.carroceria || 'N/A'}</span>
                </div>
                <div class="modal-spec">
                    <span class="modal-spec-label">Kilometraje</span>
                    <span class="modal-spec-value">${auto.kilometraje}</span>
                </div>
                <div class="modal-spec">
                    <span class="modal-spec-label">Documentación</span>
                    <span class="modal-spec-value">${auto.documentacion}</span>
                </div>
            </div>

            <div class="modal-precio-bloque">
                ${modalPrecioPrincipal}
                ${modalPrecioSecundario}
            </div>

            <a href="https://wa.me/${INFORMACION_CONTACTO.whatsapp}?text=${mensajeWhatsApp}"
               class="modal-contactar"
               target="_blank"
               rel="noopener">
                <img src="res/ico/whatsapp.svg" alt="" style="width:18px;height:18px;display:inline;vertical-align:middle;margin-right:6px"> Consultar por WhatsApp
            </a>
        </div>
    `;

    modal.classList.add('activo');
    document.body.style.overflow = 'hidden';
}

// ============================================================================
// ZOOM DE IMAGEN (Desktop: CSS zoom | Mobile: visor fullscreen)
// ============================================================================

function esMobile() {
    return window.innerWidth <= 768 || ('ontouchstart' in window);
}

function toggleZoom(event) {
    if (esMobile()) {
        // En mobile, abrir visor fullscreen
        abrirVisorFullscreen(imagenActual);
        return;
    }

    // Desktop: zoom CSS como antes
    const galeriaPrincipal = document.querySelector('.galeria-principal');
    const img = document.getElementById('imagen-principal');
    if (!galeriaPrincipal || !img) return;

    zoomActivo = !zoomActivo;
    galeriaPrincipal.classList.toggle('zoom-activo', zoomActivo);

    if (zoomActivo) {
        const rect = galeriaPrincipal.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        img.style.transformOrigin = `${x}% ${y}%`;
    } else {
        img.style.transformOrigin = 'center center';
    }
}

// Mover zoom al mover el mouse (solo desktop)
document.addEventListener('mousemove', function(event) {
    if (!zoomActivo || esMobile()) return;
    const galeriaPrincipal = document.querySelector('.galeria-principal.zoom-activo');
    if (!galeriaPrincipal) return;

    const img = document.getElementById('imagen-principal');
    if (!img) return;

    const rect = galeriaPrincipal.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    img.style.transformOrigin = `${x}% ${y}%`;
});

// ============================================================================
// VISOR FULLSCREEN (MOBILE) - Pinch to Zoom + Swipe
// ============================================================================

let visorScale = 1;
let visorPanX = 0;
let visorPanY = 0;
let visorStartDist = 0;
let visorStartScale = 1;
let visorStartPanX = 0;
let visorStartPanY = 0;
let visorStartMidX = 0;
let visorStartMidY = 0;
let visorTouchStartX = 0;
let visorTouchStartY = 0;
let visorTouchStartTime = 0;
let visorImagenActual = 0;

function abrirVisorFullscreen(indice) {
    const visor = document.getElementById('visor-fullscreen');
    const img = document.getElementById('visor-imagen');
    if (!visor || imagenesGaleria.length === 0) return;

    visorImagenActual = indice;
    img.src = imagenesGaleria[visorImagenActual];
    actualizarVisorContador();
    resetearVisorZoom();

    // Mostrar/ocultar nav si hay más de 1 imagen
    const navBtns = visor.querySelector('.visor-nav');
    if (navBtns) navBtns.style.display = imagenesGaleria.length > 1 ? 'flex' : 'none';

    visor.classList.add('activo');
    document.body.style.overflow = 'hidden';
}

function cerrarVisorFullscreen() {
    const visor = document.getElementById('visor-fullscreen');
    if (visor) visor.classList.remove('activo');
    document.body.style.overflow = 'hidden'; // modal sigue abierto
    resetearVisorZoom();
}

function resetearVisorZoom() {
    visorScale = 1;
    visorPanX = 0;
    visorPanY = 0;
    aplicarVisorTransform();
}

function aplicarVisorTransform() {
    const img = document.getElementById('visor-imagen');
    if (img) {
        img.style.transform = `translate(${visorPanX}px, ${visorPanY}px) scale(${visorScale})`;
    }
}

function actualizarVisorContador() {
    const contador = document.getElementById('visor-contador');
    if (contador) {
        contador.textContent = `${visorImagenActual + 1} / ${imagenesGaleria.length}`;
    }
}

function visorCambiarImagen(indice) {
    if (indice < 0 || indice >= imagenesGaleria.length) return;
    visorImagenActual = indice;
    const img = document.getElementById('visor-imagen');
    if (img) img.src = imagenesGaleria[visorImagenActual];
    resetearVisorZoom();
    actualizarVisorContador();

    // Sincronizar con la galería del modal
    cambiarImagen(visorImagenActual);
}

function visorImagenAnterior() {
    const nuevo = visorImagenActual === 0 ? imagenesGaleria.length - 1 : visorImagenActual - 1;
    visorCambiarImagen(nuevo);
}

function visorImagenSiguiente() {
    const nuevo = visorImagenActual === imagenesGaleria.length - 1 ? 0 : visorImagenActual + 1;
    visorCambiarImagen(nuevo);
}

function getDistancia(t1, t2) {
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
}

function getMidpoint(t1, t2) {
    return {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2
    };
}

// Inicializar eventos del visor
function inicializarVisor() {
    const visor = document.getElementById('visor-fullscreen');
    const container = document.getElementById('visor-imagen-container');
    if (!visor || !container) return;

    // Cerrar
    document.getElementById('visor-cerrar').addEventListener('click', cerrarVisorFullscreen);
    document.getElementById('visor-prev').addEventListener('click', visorImagenAnterior);
    document.getElementById('visor-next').addEventListener('click', visorImagenSiguiente);

    // Touch events para pinch-to-zoom y swipe
    container.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
            // Pinch start
            e.preventDefault();
            visorStartDist = getDistancia(e.touches[0], e.touches[1]);
            visorStartScale = visorScale;
            const mid = getMidpoint(e.touches[0], e.touches[1]);
            visorStartMidX = mid.x;
            visorStartMidY = mid.y;
            visorStartPanX = visorPanX;
            visorStartPanY = visorPanY;
        } else if (e.touches.length === 1) {
            visorTouchStartX = e.touches[0].clientX;
            visorTouchStartY = e.touches[0].clientY;
            visorTouchStartTime = Date.now();
            visorStartPanX = visorPanX;
            visorStartPanY = visorPanY;
        }
    }, { passive: false });

    container.addEventListener('touchmove', function(e) {
        if (e.touches.length === 2) {
            // Pinch zoom
            e.preventDefault();
            const dist = getDistancia(e.touches[0], e.touches[1]);
            const scaleFactor = dist / visorStartDist;
            visorScale = Math.min(Math.max(visorStartScale * scaleFactor, 1), 5);

            // Pan while zooming
            const mid = getMidpoint(e.touches[0], e.touches[1]);
            visorPanX = visorStartPanX + (mid.x - visorStartMidX);
            visorPanY = visorStartPanY + (mid.y - visorStartMidY);

            aplicarVisorTransform();
        } else if (e.touches.length === 1 && visorScale > 1) {
            // Pan cuando está con zoom
            e.preventDefault();
            const dx = e.touches[0].clientX - visorTouchStartX;
            const dy = e.touches[0].clientY - visorTouchStartY;
            visorPanX = visorStartPanX + dx;
            visorPanY = visorStartPanY + dy;
            aplicarVisorTransform();
        }
    }, { passive: false });

    container.addEventListener('touchend', function(e) {
        if (e.touches.length === 0 && visorScale <= 1) {
            // Detectar swipe para cambiar imagen
            const dx = e.changedTouches[0].clientX - visorTouchStartX;
            const dy = e.changedTouches[0].clientY - visorTouchStartY;
            const dt = Date.now() - visorTouchStartTime;

            if (dt < 300 && Math.abs(dx) < 10 && Math.abs(dy) < 10) {
                // Tap: no hacer nada especial o podría cerrar
                return;
            }

            if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && dt < 500) {
                if (dx > 0) {
                    visorImagenAnterior();
                } else {
                    visorImagenSiguiente();
                }
            }
        }

        // Si queda en scale ~1, resetear
        if (e.touches.length === 0 && visorScale < 1.05) {
            visorScale = 1;
            visorPanX = 0;
            visorPanY = 0;
            aplicarVisorTransform();
        }

        // Limitar pan para que no se salga demasiado
        if (e.touches.length === 0 && visorScale > 1) {
            const maxPan = (visorScale - 1) * 150;
            visorPanX = Math.min(maxPan, Math.max(-maxPan, visorPanX));
            visorPanY = Math.min(maxPan, Math.max(-maxPan, visorPanY));
            aplicarVisorTransform();
        }
    });

    // Doble tap para zoom toggle
    let lastTapTime = 0;
    container.addEventListener('touchend', function(e) {
        if (e.touches.length > 0) return;
        const now = Date.now();
        if (now - lastTapTime < 300) {
            // Doble tap
            if (visorScale > 1) {
                resetearVisorZoom();
            } else {
                visorScale = 2.5;
                // Centrar zoom en punto del tap
                const rect = container.getBoundingClientRect();
                const tapX = e.changedTouches[0].clientX - rect.left - rect.width / 2;
                const tapY = e.changedTouches[0].clientY - rect.top - rect.height / 2;
                visorPanX = -tapX * 1.5;
                visorPanY = -tapY * 1.5;
                aplicarVisorTransform();
            }
            lastTapTime = 0;
        } else {
            lastTapTime = now;
        }
    });
};

function cambiarImagen(indice) {
    if (indice < 0 || indice >= imagenesGaleria.length) return;

    imagenActual = indice;

    // Desactivar zoom al cambiar imagen
    zoomActivo = false;
    const galeriaPrincipal = document.querySelector('.galeria-principal');
    if (galeriaPrincipal) galeriaPrincipal.classList.remove('zoom-activo');

    const imgPrincipal = document.getElementById('imagen-principal');
    if (imgPrincipal) {
        imgPrincipal.src = imagenesGaleria[indice];
        imgPrincipal.style.transformOrigin = 'center center';
    }

    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb, i) => {
        thumb.classList.toggle('activo', i === indice);
    });

    const contador = document.querySelector('.galeria-contador');
    if (contador) {
        contador.textContent = `${indice + 1} / ${imagenesGaleria.length}`;
    }
}

function imagenAnterior() {
    const nuevoIndice = imagenActual === 0 ? imagenesGaleria.length - 1 : imagenActual - 1;
    cambiarImagen(nuevoIndice);
}

function imagenSiguiente() {
    const nuevoIndice = imagenActual === imagenesGaleria.length - 1 ? 0 : imagenActual + 1;
    cambiarImagen(nuevoIndice);
}

function cerrarModal() {
    const modal = document.getElementById('modal-auto');
    modal.classList.remove('activo');
    document.body.style.overflow = '';
    zoomActivo = false;

    // Cerrar visor si está abierto
    const visor = document.getElementById('visor-fullscreen');
    if (visor && visor.classList.contains('activo')) {
        visor.classList.remove('activo');
    }
}

// ============================================================================
// CONVERSOR USD → ARS
// ============================================================================

async function obtenerCotizacionBlue() {
    try {
        const response = await fetch('https://dolarapi.com/v1/dolares/blue');
        if (!response.ok) throw new Error('Error obteniendo cotización');
        const data = await response.json();

        if (data.venta && data.venta > 0) {
            // Desktop
            const input = document.getElementById('cotizacion-dolar');
            input.value = data.venta;
            input.placeholder = `Blue: $${data.venta}`;
            // Mobile
            const inputMovil = document.getElementById('cotizacion-dolar-movil');
            if (inputMovil) {
                inputMovil.value = data.venta;
                inputMovil.placeholder = `Blue: $${data.venta}`;
            }
        }
    } catch (error) {
        console.warn('No se pudo obtener la cotización del dólar blue:', error);
    }
}

function sincronizarCotizacion(origen) {
    // Sincronizar valores entre desktop y mobile
    const inputDesktop = document.getElementById('cotizacion-dolar');
    const inputMovil = document.getElementById('cotizacion-dolar-movil');
    const toggleDesktop = document.getElementById('toggle-pesos');
    const toggleMovil = document.getElementById('toggle-pesos-movil');

    if (origen === 'desktop') {
        mostrarEnPesos = toggleDesktop.checked;
        if (toggleMovil) toggleMovil.checked = mostrarEnPesos;
        if (inputMovil) {
            inputMovil.value = inputDesktop.value;
            inputMovil.disabled = !mostrarEnPesos;
        }
    } else {
        mostrarEnPesos = toggleMovil.checked;
        if (toggleDesktop) toggleDesktop.checked = mostrarEnPesos;
        if (inputDesktop) {
            inputDesktop.value = inputMovil.value;
            inputDesktop.disabled = !mostrarEnPesos;
        }
    }

    inputDesktop.disabled = !mostrarEnPesos;
    if (inputMovil) inputMovil.disabled = !mostrarEnPesos;

    if (mostrarEnPesos) {
        const valor = parseFloat(origen === 'desktop' ? inputDesktop.value : inputMovil.value);
        cotizacionDolar = (valor && valor > 0) ? valor : 0;
    } else {
        cotizacionDolar = 0;
    }

    cargarAutos();
    actualizarIndicadorCotizacion();
}

function actualizarCotizacionDesdeInput(origen) {
    const inputDesktop = document.getElementById('cotizacion-dolar');
    const inputMovil = document.getElementById('cotizacion-dolar-movil');

    if (origen === 'desktop' && inputMovil) {
        inputMovil.value = inputDesktop.value;
    } else if (origen === 'movil' && inputDesktop) {
        inputDesktop.value = inputMovil.value;
    }

    const valor = parseFloat(origen === 'desktop' ? inputDesktop.value : inputMovil.value);
    cotizacionDolar = (valor && valor > 0) ? valor : 0;

    cargarAutos();
    actualizarIndicadorCotizacion();
}

function actualizarIndicadorCotizacion() {
    const texto = mostrarEnPesos && cotizacionDolar > 0
        ? `1 USD = $ ${cotizacionDolar.toLocaleString('es-AR')} ARS`
        : '';
    const mostrar = mostrarEnPesos && cotizacionDolar > 0;

    // Desktop
    const indicador = document.getElementById('cotizacion-activa');
    if (indicador) {
        indicador.textContent = texto;
        indicador.style.display = mostrar ? 'block' : 'none';
    }
    // Mobile
    const indicadorMovil = document.getElementById('cotizacion-activa-movil');
    if (indicadorMovil) {
        indicadorMovil.textContent = texto;
        indicadorMovil.style.display = mostrar ? 'block' : 'none';
    }
}

// ============================================================================
// UTILIDADES
// ============================================================================

function formatearPrecio(precio) {
    return 'U$S ' + precio.toLocaleString('en-US');
}

// ============================================================================
// EVENTOS
// ============================================================================

function inicializarEventos() {
    document.getElementById('filtro-busqueda').addEventListener('input', cargarAutos);
    document.getElementById('filtro-precio').addEventListener('change', function() {
        if (this.value !== '') {
            document.getElementById('precio-min').value = '';
            document.getElementById('precio-max').value = '';
        }
        cargarAutos();
    });
    document.getElementById('filtro-marca').addEventListener('change', cargarAutos);
    document.getElementById('filtro-año-min').addEventListener('input', cargarAutos);
    document.getElementById('filtro-año-max').addEventListener('input', cargarAutos);
    document.getElementById('filtro-carroceria').addEventListener('change', cargarAutos);
    document.getElementById('filtro-combustible').addEventListener('change', cargarAutos);

    document.getElementById('precio-min').addEventListener('input', function() {
        if (this.value !== '') {
            document.getElementById('filtro-precio').value = '';
        }
        cargarAutos();
    });
    document.getElementById('precio-max').addEventListener('input', function() {
        if (this.value !== '') {
            document.getElementById('filtro-precio').value = '';
        }
        cargarAutos();
    });

    document.getElementById('btn-limpiar').addEventListener('click', limpiarFiltros);

    // Ordenar
    document.getElementById('ordenar-por').addEventListener('change', cargarAutos);

    // Toggle pesos y cotización - Desktop
    document.getElementById('toggle-pesos').addEventListener('change', () => sincronizarCotizacion('desktop'));
    document.getElementById('cotizacion-dolar').addEventListener('input', () => actualizarCotizacionDesdeInput('desktop'));

    // Toggle pesos y cotización - Mobile
    const toggleMovil = document.getElementById('toggle-pesos-movil');
    if (toggleMovil) {
        toggleMovil.addEventListener('change', () => sincronizarCotizacion('movil'));
    }
    const inputMovil = document.getElementById('cotizacion-dolar-movil');
    if (inputMovil) {
        inputMovil.addEventListener('input', () => actualizarCotizacionDesdeInput('movil'));
    }

    // Modal
    document.getElementById('modal-cerrar').addEventListener('click', cerrarModal);
    document.getElementById('modal-auto').addEventListener('click', (e) => {
        if (e.target.id === 'modal-auto') cerrarModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const visor = document.getElementById('visor-fullscreen');
            if (visor && visor.classList.contains('activo')) {
                cerrarVisorFullscreen();
            } else if (zoomActivo) {
                zoomActivo = false;
                const gp = document.querySelector('.galeria-principal');
                if (gp) gp.classList.remove('zoom-activo');
            } else if (filtrosPanel.classList.contains('activo')) {
                cerrarFiltros();
            } else {
                cerrarModal();
            }
        }
        if (e.key === 'ArrowLeft' && document.getElementById('modal-auto').classList.contains('activo')) {
            imagenAnterior();
        }
        if (e.key === 'ArrowRight' && document.getElementById('modal-auto').classList.contains('activo')) {
            imagenSiguiente();
        }
    });

    // Botón hamburguesa del header → abre/cierra filtros
    const menuBtn = document.getElementById('mobile-menu-btn');
    const filtrosPanel = document.getElementById('filtros');

    function abrirFiltros() {
        filtrosPanel.classList.add('activo');
        menuBtn.classList.add('activo');
        document.body.style.overflow = 'hidden';
    }

    function cerrarFiltros() {
        filtrosPanel.classList.remove('activo');
        menuBtn.classList.remove('activo');
        document.body.style.overflow = '';
    }

    menuBtn.addEventListener('click', () => {
        if (filtrosPanel.classList.contains('activo')) {
            cerrarFiltros();
        } else {
            abrirFiltros();
        }
        menuBtn.setAttribute('aria-expanded', filtrosPanel.classList.contains('activo'));
    });

    document.getElementById('btn-filtros-movil').addEventListener('click', () => {
        abrirFiltros();
    });

    document.getElementById('btn-aplicar-filtros').addEventListener('click', () => {
        cerrarFiltros();
    });

    document.getElementById('btn-cerrar-filtros').addEventListener('click', () => {
        cerrarFiltros();
    });
}

function limpiarFiltros() {
    document.getElementById('filtro-busqueda').value = '';
    document.getElementById('filtro-precio').value = '';
    document.getElementById('precio-min').value = '';
    document.getElementById('precio-max').value = '';
    document.getElementById('filtro-marca').value = '';
    document.getElementById('filtro-año-min').value = '';
    document.getElementById('filtro-año-max').value = '';
    document.getElementById('filtro-carroceria').value = '';
    document.getElementById('filtro-combustible').value = '';

    cargarAutos();
}

// ============================================================================
// FILTROS ACTIVOS (CHIPS)
// ============================================================================

function actualizarFiltrosActivos() {
    const contenedor = document.getElementById('filtros-activos');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    const filtros = [];

    const busqueda = document.getElementById('filtro-busqueda').value;
    if (busqueda) filtros.push({ label: `"${busqueda}"`, clear: () => { document.getElementById('filtro-busqueda').value = ''; } });

    const marca = document.getElementById('filtro-marca').value;
    if (marca) filtros.push({ label: marca, clear: () => { document.getElementById('filtro-marca').value = ''; } });

    const añoMin = document.getElementById('filtro-año-min').value;
    const añoMax = document.getElementById('filtro-año-max').value;
    if (añoMin || añoMax) {
        const label = `Año: ${añoMin || '...'} - ${añoMax || '...'}`;
        filtros.push({ label, clear: () => { document.getElementById('filtro-año-min').value = ''; document.getElementById('filtro-año-max').value = ''; } });
    }

    const carroceria = document.getElementById('filtro-carroceria').value;
    if (carroceria) filtros.push({ label: carroceria, clear: () => { document.getElementById('filtro-carroceria').value = ''; } });

    const combustible = document.getElementById('filtro-combustible').value;
    if (combustible) filtros.push({ label: combustible, clear: () => { document.getElementById('filtro-combustible').value = ''; } });

    const precioIdx = document.getElementById('filtro-precio').value;
    if (precioIdx !== '') filtros.push({ label: RANGOS_PRECIO[precioIdx].etiqueta, clear: () => { document.getElementById('filtro-precio').value = ''; } });

    const pMin = document.getElementById('precio-min').value;
    const pMax = document.getElementById('precio-max').value;
    if (pMin || pMax) {
        const label = `U$S ${pMin || '0'} - ${pMax || '...'}`;
        filtros.push({ label, clear: () => { document.getElementById('precio-min').value = ''; document.getElementById('precio-max').value = ''; } });
    }

    if (filtros.length === 0) {
        contenedor.style.display = 'none';
        return;
    }

    contenedor.style.display = 'flex';
    filtros.forEach(f => {
        const chip = document.createElement('span');
        chip.className = 'filtro-chip';
        chip.innerHTML = `${f.label} <button class="filtro-chip-cerrar" aria-label="Quitar filtro ${f.label}">&times;</button>`;
        chip.querySelector('.filtro-chip-cerrar').addEventListener('click', () => {
            f.clear();
            cargarAutos();
        });
        contenedor.appendChild(chip);
    });
}
