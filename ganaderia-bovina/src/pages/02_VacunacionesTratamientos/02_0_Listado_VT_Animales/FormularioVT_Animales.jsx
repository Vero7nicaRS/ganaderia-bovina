/*
* ------------------------------------------ FormularioVT.jsx: ------------------------------------------
* Funcionalidad: se muestra un formulario para visualizar, agregar y modificar una vacuna y/o tratamiento.
* con un determinado identificador (ID)
* --------------------------------------------------------------------------------------------------------
* */
import "../../../styles/FormularioVTAnimal.css";
import {NavLink, useLocation, useNavigate, useParams} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import {VTListadoContext} from "../../../DataAnimales/DataVacunasTratamientos/DataListadoVTAnimales/VTListadoContext.jsx";
import {ComprobarCamposFormularioVT} from "../../../components/ComprobarCamposFormularioVT.jsx";
import {AnimalesContext} from "../../../DataAnimales/DataVacaTerneros/AnimalesContext.jsx";
import {VTContext} from "../../../DataAnimales/DataVacunasTratamientos/VTContext.jsx";
import api from "../../../api.js";
export const FormularioVT_Animales= () => {
    //Se utiliza "location" para acceder a los datos (state) que han sido transmitidos mediante el NavLink (modo y vacuna/tratamiento)
    const location = useLocation();

    //Hook para navegar
    const navigate = useNavigate();

    const { modo, vt_animal: vt_Animal_Inicial } = location.state || {}; // Se recupera el modo y vacuna/tratamiento desde el state
    const {id} = useParams(); // Se emplea para acceder mediante URL
    const modoFinal = modo || (id ? "ver" : "agregar") // Se indica el modo en el que debe estar el formulario, si ha sido pasado por el state o no.


    const estadoInicialVTAnimal = {
        id: null,
        tipo: "Tratamiento",
        nombre_vt: "",
        ruta: "Intravenosa",
        fecha_inicio: "",
        fecha_finalizacion: "",
        responsable: "",
        inventario_vt: null
    }
    /* Se inicializa el tratamiento/vacuna con los datos del state.
       En caso de que el formulario este vacio, se inicializa con unos valores por defecto */
    const [vt_animal, setVT_Animal] = useState(vt_Animal_Inicial || estadoInicialVTAnimal);


    /* Para que haya un desplegable con el listado de toros y vacas disponibles, es necesario
    * acceder al listado de los mismos. Para ello, se obtiene dicha información con
    * con "AnimalesContext" y TorosContext* */
    const { animales } = useContext(AnimalesContext); // Lista de vacas/terneros

    /* Para que haya un desplegable con el listado de vacunas y tratamientos disponibles, es necesario
    * acceder al listado de los mismos. Para ello, se obtiene dicha información con
    * con "VTContext" */
    const {vt, obtenerInventarioVT} = useContext(VTContext); //Lista de vacunas/tratamientos y la función de modificarVT.

    /* Se obtiene las funciones: agregarVT_Animal y modificarVT_Animal para hacer CU (agregar y modificar).
       Para ello se emplea useContext (se accede al contexto) ----> Se utiliza VTListadoContext
       */
    const { vt_animal: listadoVTAnimales, agregarVT_Animal, modificarVT_Animal} = useContext(VTListadoContext);

    //Se utiliza para controlar en qué modo esta el formulario: VER, AGREGAR o MODIFICAR.
    const esVisualizar = modoFinal === "ver";
    const esAgregar = modoFinal === "agregar";
    const esModificar = modoFinal === "modificar";


    // Si "tipo" se encuentra vacio, se establece "tipo: tratamiento" correctamente.
    // useEffect: Se ejecuta una única vez al montar el componente para asegurar que el "tipo" tiene un valor adecuado.
    useEffect(() => {
        if (!vt_animal.tipo) {
            setVT_Animal((prevVT) => ({ ...prevVT, tipo: "Tratamiento" }));
        }
    }, [vt, vt_animal.tipo]); // Las dependencias son "vt" y "vt_animal.tipo"

    useEffect(() => {
        const fetchVT = async () => {
            // Si se accedió mediante URL, es decir, no se ha pasado ningún animal en el estado.
            if (!vt_Animal_Inicial && (esVisualizar || esModificar) && id) {
                try {
                    const response = await api.get(`/vtanimales/${id}/`);
                    setVT_Animal(response.data);
                } catch (error) {
                    console.error("Error al cargar la vacuna/tratamiento:", error);
                }
            }
        };
        fetchVT(); // Se llama después una única vez. Se ha añadido de nuevo porque no se puede poner async el "useEffect".
    }, [id, esVisualizar, esModificar]);


    //Manejador para llevar a cabo las modificaciones de los tratamientos/vacunas (actualizar el estado del tratamiento/vacuna)
    const handleChange = (e) => {
        const { name, value } = e.target;

        setVT_Animal({
            ...vt_animal,
            [name]: value,
        });
        // Se elimina el error (error + mensaje de error) cuando el usuario seleccione una opción válida en el campo correspondiente.
        setErrores((prevErrores) => ({
            ...prevErrores,
            [name]: value ? "" : prevErrores[name], // Si hay un valor en el campo, borra el error (error + mensaje de error)
        }));
    };

    //Se emplea para gestionar el mensaje de error que indica que hay campos obligatorios.
    const [errores, setErrores] = useState({});

    const validarFormulario = () => {
        const erroresTemp = ComprobarCamposFormularioVT(vt_animal, "VTanimal", listadoVTAnimales, animales);
        /* Revisa todos los campos y le indicamos que es un listado de animales,
        ya que estamos usando ComprobarCamposFormularioVT para el inventario de VT y el listado de VT en animales.*/

        setErrores(erroresTemp);

        console.log("Errores detectados:", erroresTemp);
        console.log("¿Formulario válido?", Object.keys(erroresTemp).length === 0);

        return Object.keys(erroresTemp).length === 0; // Retorna true si no hay errores
    };

    /* ----------------------- MANEJADOR VTListadoContext: AGREGAR, AGREGAR Y SEGUIR, Y MODIFICAR ----------------------- */

    //Para llevar acabo las acciones de AGREGAR y MODIFICAR una vacuna/tratamiento.
    const handleAgregar = async (e) => {
        console.log(vt_animal); // Verifica el estado de la vacuna/tratamiento antes de validar

        e.preventDefault();
        if (!validarFormulario()) return; // Si hay errores, no continúa
        try {
            const vtinventario = vt.find(obj_vactra => obj_vactra.nombre === vt_animal.nombre_vt)

            if (vtinventario) {
                console.log("Objeto vacuna/tratamiento buscado:", vtinventario);
                console.log("ID vacuna/tratamiento buscado:", vtinventario.id);

                const vt_suministrada = {
                    ...vt_animal,
                    inventario_vt: vtinventario.id
                }
                if (esAgregar) {
                    console.log("Se ha añadido la vacuna/tratamiento del inventario");
                    await agregarVT_Animal(vt_suministrada); // Llamada a la función agregar de VTListadoContext: Se añade el nuevo tratamiento/vacuna al inventario
                } else if (esModificar) {
                    console.log("Se ha modificado la vacuna/tratamiento del animal inventario");
                    await modificarVT_Animal(vt_suministrada); // Llamada a la función modificar de VTListadoContext: Se modifica el tratamiento/vacuna existente
                }
                await obtenerInventarioVT(); // Se actualiza el contexto
            } else {
                console.error("No se encontró el tratamiento/vacuna en el inventario");
            }

        } catch (error) {
            console.error("❌ Error al guardar la vacuna/tratamiento suministrada:", error);
            console.log("💬 Respuesta del backend:", error.response?.data);
        }

        /* Una vez que se haya agregado una nueva vacuna/tratamiento o se modifique un tratamiento/vacuna existente,
         el usuario es redirigido a la página de "inventario-vt".
         */
        navigate("/listado-vt-animal");
    };

    //Para llevar acabo las acciones de AGREGAR Y SEGUIR AÑADIENDO una vacuna/tratamiento.
    //Le permite al usuario añadir un tratamiento/vacuna y continuar con el formulario vacio para añadir nuevos tratamientos/vacunas.
    const handleAceptarYSeguir = async (e) => {
        console.log(vt_animal); // Verifica el estado de la vacuna/tratamiento antes de validar
        e.preventDefault();
        if (!validarFormulario()) return; // Si hay errores, no continúa

        try {

            /* Hay que obtener el identificador del "inventario_vt", ya que se guarda en el backend.
               Como no lo obtenemos en el formulario, cogemos el "nombre_vt" que sí lo tenemos
               y lo buscamos en el inventariovt.
               Una vez que se haya encontrado el objeto, obtenemos su "id" para pasárselo al backend.
            */
            //const vtinventario = vt.filter(sol => sol.nombre === vt_animal.nombre_vt);
            const vtinventario = vt.find(sol => sol.nombre === vt_animal.nombre_vt)

            // console.log("Objeto vacuna/tratamiento buscado: ", vtinventario);
            // console.log("ID vacuna/tratamiento buscado: ", vtinventario[0].id);

            if (vtinventario) {
                console.log("Objeto vacuna/tratamiento buscado:", vtinventario);
                console.log("ID vacuna/tratamiento buscado:", vtinventario.id);

                const vt_suministrada = {
                    ...vt_animal,
                    //inventario_vt: vtinventario[0].id
                    inventario_vt: vtinventario.id
                }

                if (esAgregar) {
                    //Se busca la posición del nombre del tratamiento/vacuna que se ha escogido para el animal,
                    // en el inventario.
                    //const indexVT = vt.findIndex((item) => item.nombre === vt_animal.nombre_vt);
                    console.log("Se ha añadido la vacuna/tratamiento al animal y se continua añadiendo nuevas vacunas/tratamientos a los animales");
                    // Se añade la nueva vacuna/tratamiento suministrada al backend y se muestra la información en el frontend.
                    await agregarVT_Animal(vt_suministrada);
                    await obtenerInventarioVT(); // Se actualiza en el contexto (listado de vacunas/tratamientos suministrados)
                    setVT_Animal(estadoInicialVTAnimal); //Se pone el formulario a vacio, al introducir el campo con un valor vacío.
                }
            } else {
                console.error("No se encontró el tratamiento/vacuna en el inventario");
            }
        } catch (error) {
            console.error("❌ Error al guardar la vacuna/tratamiento suministrada:", error);
            console.log("💬 Respuesta del backend:", error.response?.data);
        }
    }

    /* ----------------------- FIN MANEJADOR VTListadoContext: AGREGAR, AGREGAR Y SEGUIR, Y MODIFICAR  -----------------------*/

    return (
        <>
            {/* El cuadrado que aparece en la página indicando la ACCIÓN que se va a realizar:
                - VISUALIZAR VACUNA/TRATAMIENTO.
                - AGREGAR VACUNA/TRATAMIENTO.
                - MODIFICAR VACUNA/TRATAMIENTO.
            */}
            <div className="contenedor">

                <div className="cuadradoVisualizarAgregarmodificarVT_Animal">
                    {esVisualizar
                        ? `VISUALIZAR ${vt_animal.tipo.toUpperCase()} DEL ANIMAL`
                        : esAgregar
                            ? "AÑADIR TRATAMIENTO/VACUNA AL ANIMAL"
                            : `MODIFICAR ${vt_animal.tipo.toUpperCase()} DEL ANIMAL`}
                </div>

                {/* En caso de que sea una acción de VISUALIZAR o MODIFICAR  (!esAgregar),
                se mostrará el ID de la vacuna/tratamiento dentro de un cuadrado. */}
                {!esAgregar && (
                    <div className="cuadradoID">
                        <span className="identificador">ID</span>
                        <input
                            type="text"
                            name="id"
                            className="cuadro-texto"
                            value={vt_animal.codigo || ""}
                            disabled
                        />
                    </div>
                )}
            </div>

            <hr/>

            <form>
                {/*onSubmit={handleSubmit}*/}
                <div className="contenedor-flex">

                    {/* Parte de la IZQUIERDA del formulario*/}
                    <div className="contenedor-izquierda">
                        <div className="contenedor-linea">
                            <div className="label">Identificador animal</div>
                            <select
                                className={`form-select ${errores.id_animal ? "error" : ""}`}
                                name="id_animal"
                                disabled={esVisualizar}
                                // value={inseminacion.id_vaca || ""}
                                value={vt_animal.id_animal !== null ? vt_animal.id_animal : "eliminada"}
                                onChange={handleChange}
                            >
                                <option value="">Selecciona una vaca</option>

                                {/* Mostrar mensaje si la vaca ya no existe (eliminada por ERROR, id_vaca === null) */}
                                {esVisualizar && vt_animal.id_animal === null && (
                                    <option value="eliminada">No existente</option>
                                )}
                                {/* A la hora de agregar una inseminación, en el desplegable se van a
                                Se van a mostrar las vacas que están vivas.
                                Por tanto:
                                  - Se filtra por el tipo "Vaca" ya que "animales" contiene también "Terneros".
                                  - La vaca no debe tener el estado "muerte" ni "vendida".
                                Se muestran las vacas activas: */}
                                {animales && animales.length > 0 ? (
                                    animales
                                        .filter(
                                            (animal) =>
                                                animal.tipo.toUpperCase() === "VACA" &&
                                                animal.estado.toUpperCase() !== "MUERTE" &&
                                                animal.estado.toUpperCase() !== "VENDIDA"
                                        )
                                        .map((vaca) => (
                                            <option key={vaca.id} value={vaca.id}>
                                                {vaca.codigo}
                                            </option>
                                        ))
                                ) : (
                                    <option>No hay vacas disponibles</option>
                                )}

                                {/* A la hora de visualizar, si la vaca ha sido eliminada por "muerte" o "vendida".
                                Aparecerá su nombre junto a su estado (Ej: V-3 (Muerte) )
                                Se muestra la vaca seleccionada a pesar de que esté eliminada: */}
                                {esVisualizar &&
                                    animales
                                        .filter(
                                            (animal) =>
                                                animal.tipo.toUpperCase() === "VACA" &&
                                                (animal.estado.toUpperCase() === "MUERTE" ||
                                                    animal.estado.toUpperCase() === "VENDIDA") &&
                                                animal.id === vt_animal.id_animal
                                        )
                                        .map((vaca) => (
                                            <option key={vaca.id} value={vaca.id}>
                                                {vaca.codigo} ({vaca.estado})
                                            </option>
                                        ))}
                            </select>
                            {errores.id_animal && (
                                <div className="mensaje-error-inseminacion">{errores.id_animal}</div>
                            )}
                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Tipo</div>
                            <select
                                className="form-select"
                                name="tipo"
                                disabled={esVisualizar || esModificar}
                                /*Se indica que el campo "Tipo" no se puede modificar cuando se Visualiza o se Modifica.*/
                                value={vt_animal.tipo || "Tratamiento"}
                                onChange={(e) => {
                                    handleChange(e);
                                    /* Se actualizan los campos "Nombre" y "Dosis" al modificar el campo "Tipo".
                                    El campo "Nombre" se actualiza cada vez que se modifique el campo "Tipo",
                                    debido a que tienen que aparecer el nombre de las vacunas cuando son vacunas,
                                    y el nombre de tratamientos cuando se trate de tratamientos.
                                    Ej: Bovisan: cantidad 6 (INVENTARIO)
                                        Nombre: Bosivan.
                                    */
                                    setVT_Animal((prev) => ({...prev, nombre_vt: ""}))
                                }}
                            >
                                <option value="Tratamiento">Tratamiento</option>
                                <option value="Vacuna">Vacuna</option>
                            </select>
                        </div>


                        <div className="contenedor-linea">
                            <div className="label">Nombre</div>
                            <select
                                className={`form-select ${errores.nombre_vt ? "error" : ""}`}
                                name="nombre_vt"
                                disabled={esVisualizar}
                                value={vt_animal.nombre_vt !== null ? vt_animal.nombre_vt : "eliminada"}
                                onChange={(e) => {
                                    handleChange(e);
                                }}
                            >
                                <option value="">Selecciona</option>

                                {(esVisualizar || esModificar) ? (
                                    <>
                                        {/* Si había un tratamiento/vacuna asignado al animal
                                            (es decir, el animal tenía indicado un tratamiento/vacuna), se muestra
                                            aunque ya no exista en el inventario o esté con el estado "inactivo".
                                            En estos dos últimos casos saldra "(No existente)" o "Nombre (Estado)".
                                        */}
                                        {vt_animal.nombre_vt && (
                                            <option value={vt_animal.nombre_vt}>
                                                {/* Buscamos si existe aún en el inventario */}
                                                {(() => {
                                                    const inventarioEncontrado = vt.find(
                                                        (vt_del_animal) => vt_del_animal.nombre === vt_animal.nombre_vt
                                                    );
                                                    if (!inventarioEncontrado) {
                                                        // No está en el inventario
                                                        return "No existente";
                                                    } else if (inventarioEncontrado.estado.toUpperCase() !== "ACTIVA") {
                                                        // Está INACTIVA
                                                        return `${vt_animal.nombre_vt} (${inventarioEncontrado.estado})`;
                                                    } else {
                                                        return `${vt_animal.nombre_vt} (${inventarioEncontrado.unidades})`;
                                                    }
                                                })()}
                                            </option>
                                        )}
                                        {/* Se muestran todas las vacunas/tratamientos que tienen
                                            unidades disponibles (>=1), el estado "ACTIVA" y sin repetir
                                            esa vacuna/tratamiento, en caso de que esté asignada al animal.
                                        */}
                                        {vt && vt.length > 0 ? (
                                            vt
                                                .filter(vt_del_animal =>
                                                    vt_del_animal.tipo.toUpperCase() === vt_animal.tipo.toUpperCase() &&
                                                    vt_del_animal.estado.toUpperCase() === "ACTIVA" &&
                                                    vt_del_animal.unidades > 0 &&
                                                    vt_del_animal.nombre !== vt_animal.nombre_vt
                                                )
                                                .map((vt_del_animal) => (
                                                    <option key={vt_del_animal.nombre} value={vt_del_animal.nombre}>
                                                        {vt_del_animal.nombre} ({vt_del_animal.unidades})
                                                    </option>
                                                ))
                                        ) : (
                                            <option disabled>No hay disponibles</option>
                                        )}
                                    </>
                                ) : (
                                    // Modo AGREGAR
                                    <>
                                        {/* Se muestran todas las vacunas/tratamientos que tienen
                                            unidades disponibles (>=1), el estado "ACTIVA" y sin repetir
                                            esa vacuna/tratamiento, en caso de que esté asignada al animal.
                                            Modo Agregar: solo mostramos las que están ACTIVAS y con unidades */}
                                        {vt && vt.length > 0 ? (
                                            vt
                                                .filter(vt_del_animal =>
                                                    vt_del_animal.tipo.toUpperCase() === vt_animal.tipo.toUpperCase() &&
                                                    vt_del_animal.estado.toUpperCase() === "ACTIVA" &&
                                                    vt_del_animal.unidades > 0
                                                )
                                                .map((vt_del_animal) => (
                                                    <option key={vt_del_animal.nombre} value={vt_del_animal.nombre}>
                                                        {vt_del_animal.nombre} ({vt_del_animal.unidades})
                                                    </option>
                                                ))
                                        ) : (
                                            <option disabled>No hay disponibles</option>
                                        )}
                                    </>
                                )}
                            </select>
                            {errores.nombre_vt && <div className="mensaje-error">{errores.nombre_vt}</div>}
                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Ruta</div>
                            <select
                                className="form-select"
                                name="ruta"
                                disabled={esVisualizar}
                                /*Se indica que el campo "Unidades" no se puede modificar cuando se Visualiza.*/
                                value={vt_animal.ruta || "Intravenosa"}
                                onChange={handleChange}
                            >
                                <option value="Intravenosa">Intravenosa</option>
                                <option value="Intramamaria">Intramamaria</option>
                                <option value="Intramuscular">Intramuscular</option>
                                <option value="Intravaginal">Intravaginal</option>
                                <option value="Oral">Oral</option>
                                <option value="Nasal">Nasal</option>
                                <option value="Subcutánea">Subcutánea</option>
                            </select>
                        </div>
                    </div>

                    <div className="contenedor-derecha">
                        <div className="contenedor-linea">
                            <div className="label">Fecha de inicio</div>
                            <input
                                type="date"
                                className={`cuadro-texto ${errores.fecha_inicio ? "error" : ""}`}
                                name="fecha_inicio"
                                disabled={esVisualizar} //Se indica que el campo "Fecha de nacimiento" no se puede modificar cuando se Visualiza.
                                value={vt_animal.fecha_inicio || ""}
                                onChange={handleChange}
                            />
                            {errores.fecha_inicio &&
                                <div className="mensaje-error">{errores.fecha_inicio}</div>}
                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Fecha de finalización</div>
                            <input
                                type="date"
                                className={`cuadro-texto ${errores.fecha_finalizacion ? "error" : ""}`}
                                name="fecha_finalizacion"
                                disabled={esVisualizar} //Se indica que el campo "Fecha de nacimiento" no se puede modificar cuando se Visualiza.
                                value={vt_animal.fecha_finalizacion || ""}
                                onChange={handleChange}
                            />
                            {errores.fecha_finalizacion &&
                                <div className="mensaje-error">{errores.fecha_finalizacion}</div>}
                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Responsable</div>
                            <input
                                type="text"
                                className={`cuadro-texto ${errores.responsable ? "error" : ""}`}
                                name="responsable"
                                disabled={esVisualizar} //Se indica que el campo "Responsable" no se puede modificar cuando se Visualiza.
                                value={vt_animal.responsable || ""}
                                onChange={handleChange}
                            />
                            {errores.responsable && <div className="mensaje-error">{errores.responsable}</div>}
                        </div>
                    </div>
                </div>

                <>
                    {/* Si es una acción de AGREGAR o MODIFICAR: Aparecen los siguientes botones:
                        BOTONES DE ACEPTAR, ACEPTAR Y SEGUIR AÑADIENDO, Y CANCELAR */}

                    {/* Si es una acción de AGREGAR o MODIFICAR: Aparece el siguiente botón:
                        ACEPTAR */}
                    {!esVisualizar && (
                        <div className="boton-espacio">
                            <button type="button"
                                    className="btn btn-info"
                                    onClick={handleAgregar}>
                                ACEPTAR
                            </button>
                            <>
                                {/* Si es una acción de AGREGAR: Aparece el siguiente botón:
                                    BOTÓN DE ACEPTAR Y SEGUIR AÑADIENDO */}
                                {esAgregar && (
                                    <button type="button"
                                            className="btn btn-info"
                                            onClick={handleAceptarYSeguir}>
                                        ACEPTAR Y SEGUIR AÑADIENDO
                                    </button>
                                )}

                            </>
                            {/* Si es una acción de AGREGAR o MODIFICAR: Aparece el siguiente botón:
                                BOTÓN CANCELAR */}
                            {/*<NavLink type = "submit" className="btn btn-info">ACEPTAR</NavLink>*/}
                            <NavLink to="/listado-vt-animal" className="btn btn-info">CANCELAR</NavLink>
                        </div>
                    )}

                    {esVisualizar && (
                        <div className="boton-espacio">
                        <NavLink to="/listado-vt-animal" className="btn btn-info">VISUALIZAR OTROS TRATAMIENTOS/VACUNAS DE LOS ANIMALES</NavLink>
                        </div>
                    )}
                </>

                {/* BOTÓN DE VOLVER AL MENÚ PRINCIPAL*/}
                <div className="boton-volver">
                    <NavLink to="/" className="btn btn-info">VOLVER AL MENÚ</NavLink>
                </div>
            </form>
        </>
    );
};