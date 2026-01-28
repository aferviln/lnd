// Contenedores del DOM
const contenedor = document.getElementById('contenedor-luchadores');
const pantalla = document.getElementById('pantalla-combate');
const log = document.getElementById('log-combate');
const visor1 = document.getElementById('visor-p1');
const visor2 = document.getElementById('visor-p2');

let seleccionados = [];
let pelea = null;

// =========================
// CARGAR LUCHADORES DESDE PARTICIPANTES.TXT
// =========================
async function cargarLuchadores() {
  try {
    const res = await fetch('participantes.txt');
    const txt = await res.text();

    // Lista de nombres, ignorando index y líneas vacías
    const nombresLuchadores = txt
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && line.toLowerCase() !== 'index');

    for (const nombreArchivo of nombresLuchadores) {
      try {
        const resHtml = await fetch(`${nombreArchivo}.html`);
        const htmlText = await resHtml.text();

        // Parsear el HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');

        // Extraer datos por IDs
        const nombre = doc.getElementById('nombre-luchador')?.innerText.trim() || 'Sin Nombre';
        const hp = parseInt(doc.getElementById('puntos-vida')?.innerText.trim()) || 0;
        const atk = parseInt(doc.getElementById('puntos-ataque')?.innerText.trim()) || 0;
        const spd = parseInt(doc.getElementById('puntos-velocidad')?.innerText.trim()) || 0;
        const img = doc.getElementById('imagen-luchador')?.src || '';

        // Crear ficha para seleccionar
        const fichaHTML = `
         <div style="background:rgba(0, 0, 0, 0.5); border:1px solid #444; padding:10px; width:150px; text-align:center; border-radius:10px;">
          <img src="${img}" alt="${nombre}" style="width: 100%; height: 150px; object-fit: cover; border-radius:8px; cursor:pointer;">
          <strong style="display:block; margin-top:10px;">${nombre}</strong><br>
          HP:${hp} ATK:${atk} SPD:${spd}<br>
          <button onclick="seleccionar('${nombre}', ${hp}, ${atk}, ${spd}, '${img}')">Seleccionar</button>
          <button onclick="window.open('${nombreArchivo}.html', '_blank')">Ver ficha técnica</button>
         </div>
        `;


        contenedor.innerHTML += fichaHTML;

      } catch (err) {
        console.error(`Error cargando ${nombreArchivo}.html:`, err);
      }
    }
  } catch (err) {
    console.error('No se pudo cargar participantes.txt', err);
  }
}

// =========================
// SELECCIONAR LUCHADORES
// =========================
function seleccionar(nombre, hp, atk, spd, img) {
  if (seleccionados.length >= 2) return;
  seleccionados.push({ nombre, hp, atk, spd, img, maxHp: hp });
  if (seleccionados.length === 2) iniciarCombate();
}

// =========================
// INICIAR COMBATE
// =========================
function iniciarCombate() {
  contenedor.style.display = 'none';
  pantalla.style.display = 'block';
  log.innerHTML = '';

  // Ordenar por velocidad
  seleccionados.sort((a, b) => b.spd - a.spd);

  const [p1, p2] = seleccionados;

  visor1.innerHTML = crearVisor(p1, 1);
  visor2.innerHTML = crearVisor(p2, 2);

  actualizarBarra(p1, 1);
  actualizarBarra(p2, 2);

  pelea = setInterval(() => {
    atacar(p1, p2, 2);
    if (p2.hp <= 0) { fin(p1); return; }

    atacar(p2, p1, 1);
    if (p1.hp <= 0) { fin(p2); }

  }, 1000);
}

// =========================
// CREAR VISOR DEL LUCHADOR
// =========================
function crearVisor(p, n) {
  return `
    <div style="background:rgba(0, 0, 0, 0.5); border-radius:10px; padding:10px;">
      <h3>${p.nombre}</h3>
      <img src="${p.img}" style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px;"><br>
      <div class="barra">
        <div id="vida${n}" class="vida"></div>
      </div>
      <p>HP: <span id="hp${n}">${p.hp}</span></p>
    </div>
  `;
}

// =========================
// ATAQUE
// =========================
function atacar(a, d, n) {
  const dmg = Math.max(5, a.atk - Math.floor(d.spd / 4));
  d.hp -= dmg;
  document.getElementById(`hp${n}`).innerText = Math.max(0, d.hp);
  actualizarBarra(d, n);
  log.innerHTML += `${a.nombre} ataca (-${dmg})<br>`;
  log.scrollTop = log.scrollHeight;
}

// =========================
// ACTUALIZAR BARRA DE VIDA
// =========================
function actualizarBarra(p, n) {
  const pct = Math.max(0, (p.hp / p.maxHp) * 100);
  const b = document.getElementById(`vida${n}`);
  b.style.width = pct + '%';
  b.style.background = pct < 30 ? 'red' : pct < 60 ? 'orange' : 'limegreen';
}

// =========================
// FIN DEL COMBATE
// =========================
function fin(ganador) {
  clearInterval(pelea);
  log.innerHTML += `<strong>🏆 GANA ${ganador.nombre}</strong><br><br>`;
  // No añadimos ningún botón, solo el mensaje
}

// =========================
// REINICIAR COMBATE
// =========================
function reiniciar() {
  location.reload();
}

// =========================
// CARGAR LUCHADORES AL INICIAR PÁGINA
// =========================
window.onload = cargarLuchadores;
