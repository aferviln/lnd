async function cargarLuchadores() {
    const contenedor = document.getElementById('contenedor-luchadores');
    
    try {
        const respuestaTxt = await fetch('participantes.txt');
        const lista = await respuestaTxt.text();
        const nombres = lista.split('\n').map(n => n.trim()).filter(n => n !== "");

        for (let archivo of nombres) {
            try {
                const resHtml = await fetch(`${archivo}.html`);
                const html = await resHtml.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                // Extraer datos por ID
                const nombre = doc.getElementById('nombre-luchador').innerText;
                const hp = doc.getElementById('puntos-vida').innerText;
                const atk = doc.getElementById('puntos-ataque').innerText;
                const spd = doc.getElementById('puntos-velocidad').innerText;
                const img = doc.getElementById('imagen-luchador').src;

                // Crear miniatura
                contenedor.innerHTML += `
                    <div style="border: 1px solid #ccc; padding: 10px; text-align: center; width: 150px;">
                        <a href="${archivo}.html" target="_blank" title="Ver ficha técnica">
                            <img src="${img}" alt="${nombre}" style="width: 100%; height: 150px; object-fit: cover; cursor: zoom-in;">
                        </a><br>
                        <h3>${nombre}</h3><br>
                        <p>HP: ${hp} ATK: ${atk} SPD: ${spd}</p><br>
                        <button onclick="seleccionar('${nombre}', ${hp}, ${atk}, ${spd}, '${img}')">Seleccionar</button>
                    </div>`;
            } catch (err) { console.error("No se pudo cargar: " + archivo); }
        }
    } catch (e) { console.error("Error al leer participantes.txt"); }
}

let seleccionados = [];

function seleccionar(n, h, a, s, i) {
    if (seleccionados.length < 2) {
        seleccionados.push({ nombre: n, hp: parseInt(h), atk: parseInt(a), spd: parseInt(s), img: i });
        console.log("Seleccionado: " + n);
    }
    if (seleccionados.length === 2) iniciarCombate();
}

function iniciarCombate() {
    document.getElementById('pantalla-combate').style.display = 'block';
    const log = document.getElementById('log-combate');
    let p1 = seleccionados[0];
    let p2 = seleccionados[1];

    document.getElementById('visor-p1').innerHTML = `<img src="${p1.img}" width="150"><h3>${p1.nombre}</h3><p>HP: <span id="hp1">${p1.hp}</span></p>`;
    document.getElementById('visor-p2').innerHTML = `<img src="${p2.img}" width="150"><h3>${p2.nombre}</h3><p>HP: <span id="hp2">${p2.hp}</span></p>`;

    let pelea = setInterval(() => {
        // Ataque P1
        let dmg1 = Math.max(5, p1.atk - Math.floor(p2.spd / 4));
        p2.hp -= dmg1;
        document.getElementById('hp2').innerText = Math.max(0, p2.hp);
        log.innerHTML += `${p1.nombre} ataca: -${dmg1} HP<br>`;

        if (p2.hp <= 0) {
            log.innerHTML += `<strong>🏆 GANA ${p1.nombre}</strong>`;
            clearInterval(pelea); return;
        }

        // Ataque P2
        let dmg2 = Math.max(5, p2.atk - Math.floor(p1.spd / 4));
        p1.hp -= dmg2;
        document.getElementById('hp1').innerText = Math.max(0, p1.hp);
        log.innerHTML += `${p2.nombre} ataca: -${dmg2} HP<br>`;

        if (p1.hp <= 0) {
            log.innerHTML += `<strong>🏆 GANA ${p2.nombre}</strong>`;
            clearInterval(pelea);
        }
        log.scrollTop = log.scrollHeight;
    }, 1000);
}

cargarLuchadores();