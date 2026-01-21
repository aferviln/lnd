// 1. FUNCIÓN PARA LEER LA LISTA DE PARTICIPANTES DESDE EL TXT
async function obtenerNombresDesdeArchivo() {
    try {
        const respuesta = await fetch('participantes.txt');
        const texto = await respuesta.text();
        
        // Convertimos el texto en un Array, eliminando espacios y líneas vacías
        const nombres = texto.split('\n')
                             .map(nombre => nombre.trim())
                             .filter(nombre => nombre !== "");
        
        return nombres;
    } catch (error) {
        console.error("Error leyendo participantes.txt:", error);
        return [];
    }
}

// 2. FUNCIÓN PRINCIPAL QUE MONTA LA ARENA
async function cargarLuchadores() {
    const contenedor = document.getElementById('contenedor-luchadores');
    const nombresAlumnos = await obtenerNombresDesdeArchivo(); // <-- Aquí lee el TXT

    for (let nombreArchivo of nombresAlumnos) {
        try {
            const respuesta = await fetch(`${nombreArchivo}.html`);
            if (!respuesta.ok) throw new Error("Archivo no encontrado");
            
            const htmlTexto = await respuesta.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlTexto, 'text/html');

            // Extraemos datos (usando los IDs que ellos deben respetar)
            const nombre = doc.getElementById('nombre-luchador').innerText;
            const vida = doc.getElementById('puntos-vida').innerText;
            const ataque = doc.getElementById('puntos-ataque').innerText;
            const velocidad = doc.getElementById('puntos-velocidad').innerText;
            const imagen = doc.getElementById('imagen-luchador').getAttribute('src');

            contenedor.innerHTML += `
                <div class="tarjeta-miniatura" onclick="preparar('${nombre}', ${vida}, ${ataque}, ${velocidad}, '${imagen}')">
                    <img src="${imagen}" alt="${nombre}">
                    <h3>${nombre}</h3>
                    <p>HP: ${vida} | ATK: ${ataque} | SPD: ${velocidad}</p>
                </div>
            `;
        } catch (e) {
            console.warn(`No se pudo cargar el luchador "${nombreArchivo}":`, e.message);
        }
    }
}

// Iniciar la carga al abrir la página
cargarLuchadores();