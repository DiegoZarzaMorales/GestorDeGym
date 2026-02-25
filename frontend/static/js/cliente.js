const API_URL = '/api';

const noticiasGym = [
    {
        titulo: 'Nueva zona de peso libre habilitada',
        detalle: 'Ya está disponible el nuevo bloque con barras olímpicas y jaulas de sentadilla.',
        fecha: 'Hoy'
    },
    {
        titulo: 'Clases funcionales ampliadas',
        detalle: 'Se agregaron 3 horarios nuevos en la tarde para entrenamiento funcional.',
        fecha: 'Ayer'
    },
    {
        titulo: 'Mantenimiento de caminadoras',
        detalle: 'Mañana de 7:00 a 9:00 habrá revisión preventiva en el área de cardio.',
        fecha: 'Hace 2 días'
    }
];

const recomendacionesPorMeta = {
    general: [
        'Calienta 8-10 minutos antes de cada rutina.',
        'Prioriza técnica correcta sobre peso máximo.',
        'Hidrátate durante toda la sesión.'
    ],
    perdida_grasa: [
        'Combina fuerza con 20 minutos de cardio moderado.',
        'Mantén descansos entre series de 45-60 segundos.',
        'Incluye déficit calórico controlado y proteína suficiente.'
    ],
    ganancia_muscular: [
        'Trabaja cada grupo muscular 2 veces por semana.',
        'Usa progresión de cargas semanal.',
        'Asegura superávit calórico y 7-8 horas de sueño.'
    ],
    resistencia: [
        'Alterna intervalos HIIT con sesiones de ritmo estable.',
        'Incrementa volumen de forma gradual cada semana.',
        'Controla la respiración en cada bloque de esfuerzo.'
    ]
};

let entrenadoresDisponibles = [];

const actividadHoy = [
    '7:00 AM - Clase HIIT (12 inscritos)',
    '10:00 AM - Evaluaciones físicas (4 pendientes)',
    '6:00 PM - Bootcamp grupal (18 inscritos)',
    '8:00 PM - Cierre de día y limpieza de área funcional'
];

const publicacionesGym = [
    {
        postUrl: 'https://www.facebook.com/photo/?fbid=1340632868061468&set=a.381014237356674',
        tiempo: 'Publicación 1'
    },
    {
        postUrl: 'https://www.facebook.com/photo?fbid=1335248865266535&set=a.381014237356674',
        tiempo: 'Publicación 2'
    },
    {
        postUrl: 'https://www.facebook.com/photo?fbid=1327756926015729&set=a.381014237356674',
        tiempo: 'Publicación 3'
    },
    {
        postUrl: 'https://www.facebook.com/photo?fbid=1318041303653958&set=a.381014237356674',
        tiempo: 'Publicación 4'
    },
    {
        postUrl: 'https://www.facebook.com/photo?fbid=1312925714165517&set=a.381014237356674',
        tiempo: 'Publicación 5'
    },
    {
        postUrl: 'https://www.facebook.com/photo?fbid=1308574284600660&set=a.381014237356674',
        tiempo: 'Publicación 6'
    },
    {
        postUrl: 'https://www.facebook.com/photo/?fbid=1477604207704514&set=a.493045879493690',
        tiempo: 'Publicación 7'
    },
    {
        postUrl: 'https://www.facebook.com/photo/?fbid=1300477378743684&set=pb.100063443037193.-2207520000',
        tiempo: 'Publicación 8'
    }
];

document.addEventListener('DOMContentLoaded', () => {
    initClock();
    renderPublicaciones();
    renderNoticias();
    renderRecomendaciones('general');
    cargarEntrenadoresDisponibilidad();
    renderActividad();
    bindEvents();
    initPublicacionesSlider();
});

function bindEvents() {
    const goalSelector = document.getElementById('goal-selector');
    const refreshButton = document.getElementById('btn-refresh-client');

    goalSelector?.addEventListener('change', function () {
        renderRecomendaciones(this.value);
        showToast('Recomendaciones actualizadas');
    });

    refreshButton?.addEventListener('click', () => {
        renderPublicaciones();
        renderNoticias();
        cargarEntrenadoresDisponibilidad();
        renderActividad();
        showToast('Contenido actualizado');
    });
}

function esEntrenador(rol) {
    const rolNormalizado = (rol || '').toString().trim().toUpperCase();
    return ['ENTRENADOR', 'COACH', 'TRAINER', 'INSTRUCTOR'].includes(rolNormalizado);
}

async function cargarEntrenadoresDisponibilidad() {
    try {
        const [miembrosResponse, registrosResponse] = await Promise.all([
            fetch(`${API_URL}/miembros`),
            fetch(`${API_URL}/acceso/registros?limite=500`)
        ]);

        const [miembrosResult, registrosResult] = await Promise.all([
            miembrosResponse.json(),
            registrosResponse.json()
        ]);

        const miembros = miembrosResult.success ? miembrosResult.data : [];
        const registros = registrosResult.success ? registrosResult.data : [];
        const entrenadores = miembros.filter(miembro => esEntrenador(miembro.rol));

        const ultimoRegistroPorMiembro = new Map();
        registros.forEach(registro => {
            if (!ultimoRegistroPorMiembro.has(registro.id_miembro)) {
                ultimoRegistroPorMiembro.set(registro.id_miembro, registro);
            }
        });

        entrenadoresDisponibles = entrenadores.map(entrenador => {
            const registro = ultimoRegistroPorMiembro.get(entrenador.id_miembro);
            const disponible = registro ? registro.tipo === 'ENTRADA' : false;

            let horario = 'Sin registro de acceso';
            if (registro) {
                const fecha = new Date(registro.fecha_hora);
                horario = `${registro.tipo} · ${fecha.toLocaleDateString('es-ES')} ${fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
            }

            return {
                nombre: `${entrenador.nombre} ${entrenador.apellido}`,
                especialidad: 'Entrenador del gimnasio',
                horario,
                disponible
            };
        });

        renderEntrenadores();
    } catch (error) {
        entrenadoresDisponibles = [];
        renderEntrenadores();
        console.error('Error al cargar disponibilidad de entrenadores:', error);
    }
}

function renderPublicaciones() {
    const track = document.getElementById('posts-track');
    const dots = document.getElementById('posts-dots');
    if (!track || !dots) {
        return;
    }

    track.innerHTML = publicacionesGym.map((post, index) => `
        <article class="post-card ${index === 0 ? 'active' : ''}">
            <div class="post-card-head">
                <div class="post-author"><i class="fab fa-facebook"></i> 24/7 Las Alondras</div>
                <div class="post-time">${post.tiempo}</div>
            </div>
            <div class="post-embed">
                <iframe
                    title="${post.tiempo}"
                    src="https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(post.postUrl)}&show_text=true&width=500"
                    width="500"
                    height="620"
                    style="border:none;overflow:hidden"
                    scrolling="no"
                    frameborder="0"
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    allowfullscreen="true">
                </iframe>
            </div>
            <div class="post-card-body post-card-footer">
                <a class="post-open-link" href="${post.postUrl}" target="_blank" rel="noopener noreferrer">
                    Ver publicación completa
                </a>
            </div>
        </article>
    `).join('');

    dots.innerHTML = publicacionesGym.map((_, idx) => `<span class="dot ${idx === 0 ? 'active' : ''}" data-dot="${idx}"></span>`).join('');
}

function initPublicacionesSlider() {
    const track = document.getElementById('posts-track');
    const prevBtn = document.getElementById('posts-prev');
    const nextBtn = document.getElementById('posts-next');
    const dots = document.getElementById('posts-dots');

    if (!track || !prevBtn || !nextBtn || !dots) {
        return;
    }

    const AUTO_INTERVAL_MS = 5000;
    let autoSlideTimer = null;
    let currentIndex = 0;

    const getCards = () => Array.from(track.querySelectorAll('.post-card'));
    const getDots = () => Array.from(dots.querySelectorAll('.dot'));

    const updateUI = () => {
        const cards = getCards();
        const dotItems = getDots();
        if (!cards.length || !dotItems.length) {
            return;
        }

        cards.forEach((card, index) => {
            card.classList.toggle('active', index === currentIndex);
        });

        dotItems.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    };

    const goToIndex = (index) => {
        const cards = getCards();
        if (!cards.length) {
            return;
        }

        const total = cards.length;
        const normalizedIndex = ((index % total) + total) % total;
        currentIndex = normalizedIndex;
        updateUI();
    };

    const restartAutoSlide = () => {
        if (autoSlideTimer) {
            clearInterval(autoSlideTimer);
        }

        autoSlideTimer = setInterval(() => {
            goToIndex(currentIndex + 1);
        }, AUTO_INTERVAL_MS);
    };

    prevBtn.addEventListener('click', () => {
        goToIndex(currentIndex - 1);
        restartAutoSlide();
    });

    nextBtn.addEventListener('click', () => {
        goToIndex(currentIndex + 1);
        restartAutoSlide();
    });

    dots.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement) || !target.dataset.dot) {
            return;
        }

        const index = Number(target.dataset.dot);
        goToIndex(index);
        restartAutoSlide();
    });

    track.addEventListener('mouseenter', () => {
        if (autoSlideTimer) {
            clearInterval(autoSlideTimer);
            autoSlideTimer = null;
        }
    });

    track.addEventListener('mouseleave', () => {
        restartAutoSlide();
    });

    updateUI();
    restartAutoSlide();
}

function initClock() {
    const clock = document.getElementById('client-clock');
    const day = document.getElementById('today-date');

    const tick = () => {
        const now = new Date();
        if (clock) {
            clock.textContent = now.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        if (day) {
            day.textContent = now.toLocaleDateString('es-ES', {
                weekday: 'short',
                day: '2-digit',
                month: 'short'
            });
        }
    };

    tick();
    setInterval(tick, 1000);
}

function renderNoticias() {
    const list = document.getElementById('news-list');
    if (!list) {
        return;
    }

    list.innerHTML = noticiasGym.map(item => `
        <article class="news-item">
            <h4>${item.titulo}</h4>
            <p>${item.detalle}</p>
            <div class="item-meta">${item.fecha}</div>
        </article>
    `).join('');
}

function renderRecomendaciones(goal) {
    const list = document.getElementById('tips-list');
    if (!list) {
        return;
    }

    const tips = recomendacionesPorMeta[goal] || recomendacionesPorMeta.general;
    list.innerHTML = tips.map((tip, idx) => `
        <article class="tip-item">
            <h4>Tip ${idx + 1}</h4>
            <p>${tip}</p>
        </article>
    `).join('');
}

function renderEntrenadores() {
    const list = document.getElementById('trainers-list');
    if (!list) {
        return;
    }

    if (!entrenadoresDisponibles.length) {
        list.innerHTML = `
            <article class="trainer-item">
                <p>No hay entrenadores registrados todavía.</p>
                <div class="item-meta">Crea miembros con rol Entrenador en el panel admin.</div>
            </article>
        `;
        return;
    }

    list.innerHTML = entrenadoresDisponibles.map(trainer => `
        <article class="trainer-item">
            <div class="trainer-row">
                <h4>${trainer.nombre}</h4>
                <span class="badge ${trainer.disponible ? 'available' : 'busy'}">
                    ${trainer.disponible ? 'Disponible' : 'Ocupado'}
                </span>
            </div>
            <p>${trainer.especialidad}</p>
            <div class="item-meta">Horario: ${trainer.horario}</div>
        </article>
    `).join('');
}

function renderActividad() {
    const list = document.getElementById('activity-list');
    if (!list) {
        return;
    }

    list.innerHTML = actividadHoy.map(item => `
        <article class="activity-item">
            <p>${item}</p>
        </article>
    `).join('');
}

function showToast(message) {
    const toast = document.getElementById('client-toast');
    if (!toast) {
        return;
    }

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 1800);
}
