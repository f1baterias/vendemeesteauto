/* ═══════════════════════════════════════════════════════════════════════════
   VENDEME ESTE AUTO - JAVASCRIPT
   Concesionaria de Autos
   ═══════════════════════════════════════════════════════════════════════════ */

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    cargarInformacionContacto();
    cargarFiltros();
    cargarAutos();
    inicializarEventos();
});

// ============================================================================
// CARGAR INFORMACIÓN DE CONTACTO
// ============================================================================

function cargarInformacionContacto() {
    // Header
    document.getElementById('display-telefono').textContent = INFORMACION_CONTACTO.telefono;
    document.getElementById('header-phone').href = 'tel:' + INFORMACION_CONTACTO.telefono.replace(/\s/g, '');
    document.getElementById('header-whatsapp').href = 'https://wa.me/' + INFORMACION_CONTACTO.whatsapp;
    
    // Barra de info
    document.getElementById('display-direccion').textContent = INFORMACION_CONTACTO.direccion + ', ' + INFORMACION_CONTACTO.ciudad;
    document.getElementById('display-horario').textContent = INFORMACION_CONTACTO.horario;
    document.getElementById('display-email').textContent = INFORMACION_CONTACTO.email;
    
    // Footer
    document.getElementById('footer-direccion').textContent = '📍 ' + INFORMACION_CONTACTO.direccion + ', ' + INFORMACION_CONTACTO.ciudad;
    document.getElementById('footer-telefono').textContent = '📞 ' + INFORMACION_CONTACTO.telefono;
    document.getElementById('footer-email').textContent = '✉️ ' + INFORMACION_CONTACTO.email;
    document.getElementById('footer-horario').textContent = '🕐 ' + INFORMACION_CONTACTO.horario;
    
    // Redes sociales
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
    
    // WhatsApp flotante
    document.getElementById('whatsapp-flotante').href = 'https://wa.me/' + INFORMACION_CONTACTO.whatsapp + '?text=Hola!%20Me%20interesa%20un%20vehículo';
    
    // Año actual
    document.getElementById('año-actual').textContent = new Date().getFullYear();
    
    // Total de autos
    document.getElementById('total-autos').textContent = LISTA_AUTOS.length;
}

// ============================================================================
// CARGAR FILTROS
// ============================================================================

function cargarFiltros() {
    // Filtro de precios
    const filtroPrecio = document.getElementById('filtro-precio');
    RANGOS_PRECIO.forEach((rango, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = rango.etiqueta;
        filtroPrecio.appendChild(option);
    });
    
    // Filtro de marcas
    const filtroMarca = document.getElementById('filtro-marca');
    MARCAS_DISPONIBLES.forEach(marca => {
        const option = document.createElement('option');
        option.value = marca;
        option.textContent = marca;
        filtroMarca.appendChild(option);
    });
    
    // Filtro de años
    const filtroAñoDesde = document.getElementById('filtro-año-desde');
    const filtroAñoHasta = document.getElementById('filtro-año-hasta');
    
    for (let año = AÑO_HASTA; año >= AÑO_DESDE; año--) {
        const optionDesde = document.createElement('option');
        optionDesde.value = año;
        optionDesde.textContent = año;
        filtroAñoDesde.appendChild(optionDesde);
        
        const optionHasta = document.createElement('option');
        optionHasta.value = año;
        optionHasta.textContent = año;
        filtroAñoHasta.appendChild(optionHasta);
    }
    
    // Filtro de combustible
    const filtroCombustible = document.getElementById('filtro-combustible');
    COMBUSTIBLES_DISPONIBLES.forEach(combustible => {
        const option = document.createElement('option');
        option.value = combustible;
        option.textContent = combustible;
        filtroCombustible.appendChild(option);
    });
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
    const marca = document.getElementById('filtro-marca').value;
    const añoDesde = document.getElementById('filtro-año-desde').value;
    const añoHasta = document.getElementById('filtro-año-hasta').value;
    const combustible = document.getElementById('filtro-combustible').value;
    const soloPermuta = document.getElementById('filtro-permuta').checked;
    
    return LISTA_AUTOS.filter(auto => {
        // Filtro de búsqueda
        if (busqueda) {
            const textoCompleto = `${auto.titulo} ${auto.marca} ${auto.modelo} ${auto.version}`.toLowerCase();
            if (!textoCompleto.includes(busqueda)) return false;
        }
        
        // Filtro de precio
        if (precioIndex !== '') {
            const rango = RANGOS_PRECIO[precioIndex];
            if (auto.precio < rango.min || auto.precio > rango.max) return false;
        }
        
        // Filtro de marca
        if (marca && auto.marca !== marca) return false;
        
        // Filtro de año desde
        if (añoDesde && auto.año < parseInt(añoDesde)) return false;
        
        // Filtro de año hasta
        if (añoHasta && auto.año > parseInt(añoHasta)) return false;
        
        // Filtro de combustible
        if (combustible && auto.combustible !== combustible) return false;
        
        // Filtro de permuta
        if (soloPermuta && !auto.permuta) return false;
        
        return true;
    });
}

function mostrarAutos(autos) {
    const grid = document.getElementById('autos-grid');
    const sinResultados = document.getElementById('sin-resultados');
    const contador = document.getElementById('contador-resultados');
    
    // Actualizar contador
    contador.textContent = autos.length;
    
    // Limpiar grid
    grid.innerHTML = '';
    
    if (autos.length === 0) {
        sinResultados.style.display = 'block';
        return;
    }
    
    sinResultados.style.display = 'none';
    
    // Ordenar: destacados primero
    const autosOrdenados = [...autos].sort((a, b) => {
        if (a.destacado && !b.destacado) return -1;
        if (!a.destacado && b.destacado) return 1;
        return 0;
    });
    
    // Crear cards
    autosOrdenados.forEach((auto, index) => {
        const card = crearCardAuto(auto, index);
        grid.appendChild(card);
    });
}

function crearCardAuto(auto, index) {
    const card = document.createElement('article');
    card.className = 'auto-card' + (auto.destacado ? ' destacado' : '');
    card.style.animationDelay = `${index * 0.1}s`;
    
    const imagenHTML = auto.imagen && auto.imagen !== 'sin-imagen.jpg'
        ? `<img src="imagenes/${auto.imagen}" alt="${auto.titulo}" class="auto-imagen" onerror="this.parentElement.innerHTML='<div class=\\'auto-imagen-placeholder\\'><span>🚗</span><span>Sin imagen</span></div>'">`
        : `<div class="auto-imagen-placeholder"><span>🚗</span><span>Sin imagen</span></div>`;
    
    card.innerHTML = `
        <div class="auto-imagen-container">
            ${imagenHTML}
        </div>
        <div class="auto-info">
            <span class="auto-marca">${auto.marca}</span>
            <h3 class="auto-titulo">${auto.titulo}</h3>
            <div class="auto-specs">
                <span class="auto-spec">📅 ${auto.año}</span>
                <span class="auto-spec">⛽ ${auto.combustible}</span>
                <span class="auto-spec">🛣️ ${auto.kilometraje}</span>
            </div>
            <div class="auto-precio-container">
                <span class="auto-precio">${formatearPrecio(auto.precio)}</span>
                ${auto.permuta 
                    ? '<span class="auto-permuta">✓ Permuta</span>' 
                    : '<span class="auto-no-permuta">✗ Sin permuta</span>'}
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => abrirModal(auto));
    
    return card;
}

// ============================================================================
// MODAL DE DETALLE
// ============================================================================

function abrirModal(auto) {
    const modal = document.getElementById('modal-auto');
    const body = document.getElementById('modal-body');
    
    const imagenHTML = auto.imagen && auto.imagen !== 'sin-imagen.jpg'
        ? `<img src="imagenes/${auto.imagen}" alt="${auto.titulo}" onerror="this.src=''; this.alt='Sin imagen disponible'">`
        : `<div class="auto-imagen-placeholder" style="height: 100%;"><span style="font-size: 5rem;">🚗</span><span>Sin imagen disponible</span></div>`;
    
    const mensajeWhatsApp = encodeURIComponent(
        `Hola! Me interesa el ${auto.titulo} (${auto.año}) publicado a ${formatearPrecio(auto.precio)}. ¿Está disponible?`
    );
    
    body.innerHTML = `
        <div class="modal-imagen">
            ${imagenHTML}
        </div>
        <div class="modal-detalles">
            <span class="modal-marca">${auto.marca}</span>
            <h2 class="modal-titulo">${auto.titulo}</h2>
            <span class="modal-precio">${formatearPrecio(auto.precio)}</span>
            
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
                    <span class="modal-spec-label">Kilometraje</span>
                    <span class="modal-spec-value">${auto.kilometraje}</span>
                </div>
                <div class="modal-spec">
                    <span class="modal-spec-label">Documentación</span>
                    <span class="modal-spec-value">${auto.documentacion}</span>
                </div>
            </div>
            
            ${auto.permuta 
                ? '<div class="modal-permuta">✓ ACEPTA PERMUTA<br><small>En permuta cambia el valor</small></div>'
                : '<div class="modal-no-permuta">✗ NO ACEPTA PERMUTA</div>'}
            
            <p class="modal-aviso">⚠️ NO TOMO MOTOS</p>
            
            <a href="https://wa.me/${INFORMACION_CONTACTO.whatsapp}?text=${mensajeWhatsApp}" 
               class="modal-contactar" 
               target="_blank" 
               rel="noopener">
                💬 Consultar por WhatsApp
            </a>
        </div>
    `;
    
    modal.classList.add('activo');
    document.body.style.overflow = 'hidden';
}

function cerrarModal() {
    const modal = document.getElementById('modal-auto');
    modal.classList.remove('activo');
    document.body.style.overflow = '';
}

// ============================================================================
// UTILIDADES
// ============================================================================

function formatearPrecio(precio) {
    return '$' + precio.toLocaleString('es-AR');
}

// ============================================================================
// EVENTOS
// ============================================================================

function inicializarEventos() {
    // Filtros
    document.getElementById('filtro-busqueda').addEventListener('input', cargarAutos);
    document.getElementById('filtro-precio').addEventListener('change', cargarAutos);
    document.getElementById('filtro-marca').addEventListener('change', cargarAutos);
    document.getElementById('filtro-año-desde').addEventListener('change', cargarAutos);
    document.getElementById('filtro-año-hasta').addEventListener('change', cargarAutos);
    document.getElementById('filtro-combustible').addEventListener('change', cargarAutos);
    document.getElementById('filtro-permuta').addEventListener('change', cargarAutos);
    
    // Limpiar filtros
    document.getElementById('btn-limpiar').addEventListener('click', limpiarFiltros);
    
    // Modal
    document.getElementById('modal-cerrar').addEventListener('click', cerrarModal);
    document.getElementById('modal-auto').addEventListener('click', (e) => {
        if (e.target.id === 'modal-auto') cerrarModal();
    });
    
    // Cerrar modal con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') cerrarModal();
    });
    
    // Filtros móvil
    document.getElementById('btn-filtros-movil').addEventListener('click', () => {
        document.getElementById('filtros').classList.add('activo');
        document.body.style.overflow = 'hidden';
    });
    
    document.getElementById('btn-aplicar-filtros').addEventListener('click', () => {
        document.getElementById('filtros').classList.remove('activo');
        document.body.style.overflow = '';
    });
}

function limpiarFiltros() {
    document.getElementById('filtro-busqueda').value = '';
    document.getElementById('filtro-precio').value = '';
    document.getElementById('filtro-marca').value = '';
    document.getElementById('filtro-año-desde').value = '';
    document.getElementById('filtro-año-hasta').value = '';
    document.getElementById('filtro-combustible').value = '';
    document.getElementById('filtro-permuta').checked = false;
    
    cargarAutos();
}
