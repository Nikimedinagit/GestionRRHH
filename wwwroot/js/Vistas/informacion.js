//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA OBTENER LA INFO DEL USUARIO LOGUEADO
//////////////////////////////////////////////////////////////////////////////////////
async function ObtenerMiInformacion() {
    try {
        const resp = await authFetch('Empleados/MiInformacion', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const empleado = await resp.json();
        console.log(empleado);
        MostrarMiInformacion(empleado);

    } catch (error) {
        console.error(error);
        const contenedor = document.getElementById('contenedorInformacionPersonal');
        contenedor.innerHTML = `<p class="text-danger">No se pudo cargar la información personal.</p>`;
    }
}

//////////////////////////////////////////////////////////////////////////////////////
// FUNCION PARA MOSTRAR LA CARD DEL USUARIO LOGUEADO
//////////////////////////////////////////////////////////////////////////////////////
function MostrarMiInformacion(empleado) {
    const contenedor = $("#contenedorInformacionPersonal");
    contenedor.empty();

    const bordeColor = "#0d6efd";

    const card = `
    <div class="col-12 d-flex">
        <div class="card shadow-sm rounded-3 w-100 h-100" style="border-left: 4px solid ${bordeColor};">
            <div class="d-flex align-items-center p-3 bg-light">
                <img src="${empleado.fotoRuta || 'https://via.placeholder.com/100'}"
                     alt="Foto" class="rounded-circle me-3"
                     style="width: 80px; height: 80px; object-fit: cover;">
                <div>
                    <h5 class="mb-1 fw-bold">${empleado.nombreCompleto}</h5>
                    <div class="d-flex flex-wrap gap-2">
                        <span class="badge text-bg-primary">${empleado.puestoIdString}</span>
                        <span class="badge text-bg-secondary">${empleado.localidadIdString}</span>
                        <span class="badge text-bg-info">${empleado.tipoSexoString}</span>
                        <span class="badge text-bg-light text-dark">${empleado.estadoCivilesString}</span>
                    </div>
                </div>
            </div>

            <div class="px-3 pb-3 pt-2">
                <h6 class="fw-bold text-primary mb-2">Contacto</h6>
                <div class="row mb-3">
                    <div class="col-md-6"><strong>Email:</strong> <div>${empleado.email || ""}</div></div>
                    <div class="col-md-6"><strong>Teléfono:</strong> <div>${empleado.telefono || ""}</div></div>
                </div>

                <h6 class="fw-bold text-primary mb-2">Datos Personales</h6>
                <div class="row mb-3">
                    <div class="col-md-6"><strong>DNI:</strong> <div>${empleado.dni || ""}</div></div>
                    <div class="col-md-6"><strong>Cuil:</strong> <div>${empleado.cuil || ""}</div></div>
                    <div class="col-md-6"><strong>Fecha de Nacimiento:</strong> <div>${empleado.fechaNacimientoString || ""}</div></div>
                    <div class="col-md-6"><strong>Dirección:</strong> <div>${empleado.direccion || ""}</div></div>
                    <div class="col-md-6"><strong>Cantidad de Hijos:</strong> <div>${empleado.cantidadHijos || ""}</div></div>
                </div>

                <h6 class="fw-bold text-primary mb-2">Información Laboral</h6>
                <div class="row mb-2">
                    <div class="col-md-6"><strong>Puesto:</strong> <div>${empleado.puestoIdString || ""}</div></div>
                    <div class="col-md-6"><strong>Localidad:</strong> <div>${empleado.localidadIdString || ""}</div></div>
                    <div class="col-md-6"><strong>Número de Legajo:</strong> <div>${empleado.nroLegajo || ""}</div></div>
                </div>
            </div>
        </div>
    </div>
    `;

    contenedor.append(card);
}


//////////////////////////////////////////////////////////////////////////////////////
// LLAMAR A LA FUNCION AL CARGAR LA VISTA
//////////////////////////////////////////////////////////////////////////////////////
ObtenerMiInformacion();
