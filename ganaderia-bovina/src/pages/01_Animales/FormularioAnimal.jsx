import "../../styles/FormularioAnimal.css";
import {NavLink, useLocation, useNavigate, useParams} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import {AnimalesContext} from "../../DataAnimales/DataVacaTerneros/AnimalesContext.jsx";
import {ComprobarCamposFormularioAnimal} from "../../components/ComprobarCamposFormularioAnimal.jsx";
import {TorosContext} from "../../DataAnimales/DataToros/TorosContext.jsx";
import {CorralesContext} from "../../DataAnimales/DataCorrales/CorralesContext.jsx";
// Fusión del backend con el frontend:
import api from "../../api.js"
import { convertirAnimalParaAPI } from "../../utilities/ConversorAnimal.js"

/*
* ------------------------------------------ FormularioAnimal.jsx: ------------------------------------------
* Funcionalidad: se muestra un formulario para visualizar, agregar y modificar un animal (vaca/ternero).
* con un determinado identificador (ID)
* TODO: Se tiene que realizar la parte de visualización, ya que no está incluido la barra de
*  tratamientos, vacunas, inseminaciones y árbol genealógico. Y por consiguiente, añadir el apartado de
*  datos generales que sí está implementado.
*
* --------------------------------------------------------------------------------------------------------
* */

export const FormularioAnimal = () => {

    //Se utiliza "location" para acceder a los datos (state) que han sido transmitidos mediante el NavLink (modo y animal)
    const location = useLocation();

    //Hook para navegar
    const navigate = useNavigate();

    const { modo, animal: animalInicial } = location.state || { tipo: "Vaca", estado:"Vacía", corral: "Corral vacas 1"}; // Se recupera el modo y animal desde el state
    const {id} = useParams(); // Se emplea para acceder mediante URL
    const modoFinal = modo || (id ? "ver" : "agregar") // Se indica el modo en el que debe estar el formulario, si ha sido pasado por el state o no.

    /* Se inicializa el animal con los datos del state.
       En caso de que el formulario este vacio, se inicializa con unos valores por defecto */
    const estadoInicial = {
        id: null,
        tipo: "Vaca",
        estado: "Vacía",
        nombre: "",
        fecha_nacimiento: "",
        padre: null,
        madre: null,
        corral: null,
        celulas_somaticas: "",
        produccion_leche: "",
        calidad_patas: "",
        calidad_ubres: "",
        grasa: "",
        proteinas: "",
    }
    const [animal, setAnimal] = useState(animalInicial || estadoInicial);

    /* Se obtiene las funciones: agregarAnimal y modificarAnimal para hacer CU (agregar y modificar).
       Para ello se emplea useContext (se accede al contexto) ----> Se utiliza AnimalesContext
       */
     const {agregarAnimal, modificarAnimal} = useContext(AnimalesContext)

    /* Se extrae la información de las vacas, terneros, toros y corrales existentes para poder
    * utilizarlo en el formulario y seleccionar animales dichos animales. */
    const { animales } = useContext(AnimalesContext); // Lista de vacas/terneros
    const { animalesToros } = useContext(TorosContext); // Lista de toros
    const { corrales, modificarCorral } = useContext(CorralesContext); // Lista de corrales

    //Se utiliza para controlar en que modo esta el formulario: VER, AGREGAR o MODIFICAR.
    const esVisualizar = modoFinal === "ver";
    const esAgregar = modoFinal === "agregar";
    const esModificar = modoFinal === "modificar";

    //Se emplea para gestionar el mensaje de error que indica que hay campos obligatorios.
    const [errores, setErrores] = useState({});

    /* El "useEffect" gestiona la actualización de los datos. Se ejecuta después de la
    renderización del componente y de los cambios realizados en las dependencias.
    En este caso, el useEffect se ejecutará cuando se hayan realizado la ejecución
    de todas las funciones, y una vez renderizado, se evalúan las dependencias que son:
    "id", "esVisualizar", "esModificar", "animalInicial", "animales" y "corrales".
    Por tanto, cada vez que el estado de las dependencias ("id", "animales", "corrales", etc.) cambie,
    se ejecutará el UseEffect.
    Esto asegura que los animales y los corrales están actualizándose en el contexto (tienen todos los valores actualizados).
    Además, con "console.log" nos muestra por consola el estado actualizado de "animales" y "corrales".

    En resumen, cada vez que haya un cambio en las dependencias, queremos que la información esté
    actualizada.

    Este useEffect se encarga de cargar el animal desde el backend en caso de que se acceda al formulario
    mediante URL (es decir, sin que venga desde un NavLink con estado [location.state]).

    OBSERVACIONES:
    - NO se puede hacer "useEffect(async () => {...})", por ello se tiene que definir "fetchAnimal" dentro
    y se le llama posteriormente.
    - Se ejecuta cuando:
       - Hay un ID en la URL (modo "ver" o "modificar").
       - No se ha recibido al animal desde el Navlink (es decir, desde el location.state).

    * */
    useEffect(() => {
        const fetchAnimal = async () => {
            // Si se accedió mediante URL, es decir, no se ha pasado ningún animal en el estado.
            if (!animalInicial && (esVisualizar || esModificar) && id) {
                try {
                    const response = await api.get(`/animales/${id}/`);
                    setAnimal(response.data);
                } catch (error) {
                    console.error("Error al cargar el animal:", error);
                }
            }
        };
        fetchAnimal(); // Se llama después una única vez. Se ha añadido de nuevo porque no se puede poner async el "useEffect".
        console.log("Animales actualizados en el contexto:", animales);
        console.log("Corrales actualizados en el contexto:", corrales);
    }, [id, esVisualizar, esModificar, animalInicial,animales, corrales]);

    //Manejador para llevar acabo las modificaciones de los animales (actualizar el estado del animal)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setAnimal({
            ...animal,
            [name]: value,
        });

        // Se elimina el error (error + mensaje de error) cuando el usuario seleccione una opción válida en el campo correspondiente.
        setErrores((prevErrores) => ({
            ...prevErrores,
            [name]: value ? "" : prevErrores[name], // Si hay un valor en el campo, borra el error (error + mensaje de error)
        }));
    };

    const validarFormulario = () => {
        const erroresTemp = ComprobarCamposFormularioAnimal(animal, animal.tipo); // Revisa todos los campos
        setErrores(erroresTemp);

        console.log("Errores detectados:", erroresTemp);
        console.log("¿Formulario válido?", Object.keys(erroresTemp).length === 0);

        return Object.keys(erroresTemp).length === 0; // Retorna true si no hay errores
    };
    /* ----------------------- MANEJADOR ANIMALESCONTEXT: AGREGAR, AGREGAR Y SEGUIR, Y MODIFICAR ----------------------- */


    //Para llevar acabo las acciones de AGREGAR y MODIFICAR un animal.
    const handleAgregar = async (e) => {

        e.preventDefault();
        if (!validarFormulario()) return; // Si hay errores, no continúa

        console.log("Animal antes de ser añadido: ", animal); // Verifica el estado de animal antes de validar
        let nuevoAnimalConId; // Almacena el resultado de "agregarAnimal".
        const animalConvertido = convertirAnimalParaAPI(animal, corrales, animales, animalesToros);

        // 1. Se realiza la petición al backend.
        try{
            if (esAgregar) {
                console.log("Se ha añadido el animal");
                nuevoAnimalConId = await agregarAnimal(animalConvertido); // Se añade el nuevo animal al backend y se muestra la información en el frontend.
            } else if (esModificar) {
                console.log("Se ha modificado el animal");
                // Se actualiza el animal en el contexto (frontend) y se muestra la información en el frontend.
                await modificarAnimal(animalConvertido); // Se modifica el animal existente
            }
        }catch (error){
            console.error("❌ Error al guardar el animal:", error);
            console.log("💬 Respuesta del backend:", error.response?.data);
        }

        // 2. Se actualiza el estado del corral (contexto) con el animal asignado.
        try{
            if (nuevoAnimalConId) {
                const corralSeleccionado = corrales.find((c) => c.id === nuevoAnimalConId.corral);
                console.log("Corral seleccionado:", corralSeleccionado);
                // Ahora, se actualiza el corral al que se asigna el animal
                if (corralSeleccionado) {
                    modificarCorral(corralSeleccionado);
                }
            }
        }catch(error){
            console.error("❌ Error al guardar el animal:", error);
            console.log("💬 Respuesta del backend:", error.response?.data);
        }

        /* Una vez que se haya agregado un nuevo animal o se modifique un animal existente,
         el usuario es redirigido a la página de "visualizar-animales".
         */
        navigate("/visualizar-animales");
    };

    //Para llevar acabo las acciones de AGREGAR Y SEGUIR AÑADIENDO un animal.
    //Le permite al usuario añadir un animal y continuar con el formulario vacio para añadir nuevos animales.
    const handleAceptarYSeguir = async (e) => {
        console.log(animal); // Verifica el estado de animal antes de validar
        e.preventDefault();
        if (!validarFormulario()) return; // Si hay errores, no continúa
        const animalConvertido = convertirAnimalParaAPI(animal, corrales, animales, animalesToros);

        try{
            if (esAgregar) {
                console.log("Se ha añadido el animal y se continua añadiendo nuevos animales");
                await agregarAnimal(animalConvertido); // Se añade el nuevo animal al backend y se muestra la información en el frontend.
                setAnimal(estadoInicial); //Se pone el formulario a vacio, al introducir el campo con un valor vacío.
                // También, se actualiza el animal en el contexto (frontend) y se muestra la información en el frontend.
            }
        }catch(error){
            console.error("❌ Error al guardar el animal:", error);
            console.log("💬 Respuesta del backend:", error.response?.data); // <-- Añade esto
        }
    }

    /* ----------------------- FIN MANEJADOR ANIMALESCONTEXT: AGREGAR, AGREGAR Y SEGUIR, Y MODIFICAR  -----------------------*/

    /* Se utiliza para mostrar "CODIGO" en vez de "ID" en el campo corral cuando se agrega un nuevo animal
       como cuando se modifica.
    */
    const corralSeleccionado = corrales.find((c) => c.id === animal.corral);
    const codigoCorralActual = corralSeleccionado ? corralSeleccionado.codigo : animal.corral;
    return (
        <>
            {/* El cuadrado que aparece en la página indicando la ACCIÓN que se va a realizar:
                - VISUALIZAR ANIMAL.
                - AGREGAR ANIMAL.
                - MODIFICAR ANIMAL.
            */}
            <div className="contenedor">
                <div className="cuadradoVisualizarAgregarModificar">
                    {esVisualizar
                        ? "VISUALIZAR ANIMAL"
                        : esAgregar
                            ? "AGREGAR ANIMAL"
                            : "MODIFICAR ANIMAL"}
                </div>

                {/* En caso de que sea una acción de VISUALIZAR o MODIFICAR  (!esAgregar),
                se mostrará el ID del animal dentro de un cuadrado. */}
                {!esAgregar && (
                        <div className="cuadradoID">
                            <span className="identificador">ID</span>
                            <input
                                type="text"
                                name="id"
                                className="cuadro-texto"
                                value={animal.codigo || ""}
                                disabled
                            />
                    </div>
                )}
            </div>

            <hr/>

            <form>
                {/*onSubmit={handleSubmit}*/}
                <div className="contenedor-flex">
                    <div className="contenedor-izquierda">

                        <div className="contenedor-linea">
                            <div className="label">Tipo</div>
                            <select
                                className="form-select"
                                name="tipo"
                                disabled={esVisualizar || esModificar}
                                /*Se indica que el campo "Tipo" no se puede modificar cuando se Visualiza o se Modifica.*/
                                value={animal.tipo || "Vaca"}
                                onChange={handleChange}
                            >
                                <option value="Vaca">Vaca</option>
                                <option value="Ternero">Ternero</option>
                            </select>
                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Estado</div>
                            <select
                                className="form-select"
                                name="estado"
                                disabled={esVisualizar} //Se indica que el campo "Estado" no se puede modificar cuando se Visualiza.
                                value={animal.estado || "Vacía"}
                                onChange={handleChange}
                            >
                                <option value="Vacía">Vacía</option>
                                <option value="Inseminada">Inseminada</option>
                                <option value="Preñada">Preñada</option>
                                <option value="No inseminar">No inseminar</option>
                                <option value="Joven">Joven</option>
                                {/*<option value="Muerta" disabled>Muerta</option>*/}
                                {/*<option value="Vendida" disabled>Vendida</option>*/}

                                {/* Opción oculta pero mostrada si ya estaba asignada */}
                                {["Muerte", "Vendida"].includes(animal.estado) && (
                                    <option value={animal.estado}>{animal.estado}</option>
                                )}
                            </select>
                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Nombre</div>
                            <input
                                type="text"
                                // className="cuadro-texto"
                                className={`cuadro-texto ${errores.nombre ? "error" : ""}`}
                                name="nombre"
                                disabled={esVisualizar} //Se indica que el campo "Nombre" no se puede modificar cuando se Visualiza.
                                value={animal.nombre || ""}
                                onChange={handleChange}
                                required // Hace que el campo sea obligatorio

                            />
                            {errores.nombre && <div className="mensaje-error">{errores.nombre}</div>}
                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Fecha de nacimiento</div>
                            <input
                                type="date"
                                className={`cuadro-texto ${errores.fecha_nacimiento ? "error" : ""}`}
                                name="fecha_nacimiento"
                                disabled={esVisualizar} //Se indica que el campo "Fecha de nacimiento" no se puede modificar cuando se Visualiza.
                                value={animal.fecha_nacimiento || ""}
                                onChange={handleChange}
                            />
                            {errores.fecha_nacimiento && <div className="mensaje-error">{errores.fecha_nacimiento}</div>}
                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Identificador padre</div>
                            <select
                                className={`form-select ${errores.padre ? "error" : ""}`}
                                name="padre"
                                disabled={esVisualizar}
                                value={animal.padre || ""}
                                onChange={handleChange}
                            >
                                <option value="">Selecciona un toro</option>
                                {animalesToros && animalesToros.length > 0 ? (
                                    animalesToros
                                        /*Se filtra por el tipo "Toro" para asegurar el contenido de tipo.
                                        Además, el toro no debe estar con el estado "muerto" ni "otros", por lo tanto se añade a la
                                        condición del filtro*/
                                        .filter((animalToro) => animalToro.tipo.toUpperCase() === "Toro".toUpperCase()
                                            && animalToro.estado.toUpperCase() !== "Muerte".toUpperCase()
                                            && animalToro.estado.toUpperCase() !== "Otros".toUpperCase()
                                        )
                                        //.filter((animal) => animal.id.startsWith("V-")) //Se filtra por el identificador ya que "animales" contiene también "Terneros"
                                        // .filter((animal) => animal.tipo === "vaca" || animal.id.startsWith("V-")) //Se filtra tanto por tipo o por id.
                                        .map((toro) => (
                                            <option key={toro.id} value={toro.id}>
                                                {toro.codigo} {/*Se pone código en vez de id. Para ver "T-x" en vez "5" */}
                                            </option>
                                        ))
                                ) : (
                                    <option>No hay toros disponibles</option>
                                )}
                            </select>
                            {errores.padre && <div className="mensaje-error">{errores.padre}</div>}
                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Identificador madre</div>
                            <select
                                className={`form-select ${errores.madre ? "error" : ""}`}
                                name="madre"
                                disabled={esVisualizar}
                                value={animal.madre || ""}
                                onChange={handleChange}
                            >
                                <option value="">Selecciona una vaca</option>
                                {animales && animales.length > 0 ? (
                                    animales
                                        /*Se filtra por el tipo "Vaca" ya que "animales" contiene también "Terneros".
                                        Además, la vaca no debe estar muerta ni vendida, por lo tanto se añade a la
                                        condición del filtro*/
                                        .filter((animal) => animal.tipo.toUpperCase() === "Vaca".toUpperCase()
                                            && animal.estado.toUpperCase() !== "Muerte".toUpperCase()
                                            && animal.estado.toUpperCase() !== "Vendida".toUpperCase()
                                        )
                                        //.filter((animal) => animal.id.startsWith("V-")) //Se filtra por el identificador ya que "animales" contiene también "Terneros"
                                        // .filter((animal) => animal.tipo === "vaca" || animal.id.startsWith("V-")) //Se filtra tanto por tipo o por id.
                                        .map((vaca) => (
                                            <option key={vaca.id} value={vaca.id}>
                                                {vaca.codigo} {/*Se pone código en vez de id. Para ver "V-x" en vez "5" */}
                                            </option>
                                        ))
                                ) : (
                                    <option>No hay vacas disponibles</option>
                                )}
                            </select>
                            {errores.madre && <div className="mensaje-error">{errores.madre}</div>}
                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Corral</div>
                            <select
                                className={`form-select ${errores.corral ? "error" : ""}`}
                                name="corral"
                                disabled={esVisualizar} //Se indica que el campo "Corral" no se puede modificar cuando se Visualiza.
                                //value={esVisualizar ? codigoCorralActual : animal.corral || ""}
                                /* El valor del campo "corral" es:
                                    - null: aparece "Ninguno" (esta situación es cuando un animal tiene el estado
                                        "VENDIDA" o "MUERTE").
                                    - codigoCorralActual: se muestra el código del corral.
                                   Cuando estamos MODIFICANDO al animal, NO se puede escoger "Ninguno".
                                */
                                value={esVisualizar || esModificar
                                    ? (animal.corral === null ? "Ninguno" : codigoCorralActual)
                                    : animal.corral || ""}
                                onChange={handleChange}
                            >
                                <option value="">Selecciona un corral</option>
                                {/* Si el animal ha sido vendido o muerto, el corral tiene como valor
                                    ninguno. Opción oculta pero mostrada si ya estaba asignada */}
                                {esVisualizar && animal.corral === null && (
                                    <option value="Ninguno">Ninguno</option>
                                )}
                                {/*{animal.corral && (*/}
                                {/*    !corrales.some((c) => c.codigo === animal.corral) */}
                                {/*                                || animal.corral === "Ninguno"*/}
                                {/*) && (*/}
                                {/*    <option value={animal.corral}>{animal.corral}</option>*/}
                                {/*)}*/}
                                {/* Aparece un listado de los nombres de los corrales existentes.*/}
                                {corrales.length > 0 ? (
                                    corrales.map((corral) => (
                                        <option key={corral.id} value={corral.codigo}>
                                            {corral.codigo} {/*Se pone código en vez de id. Para ver "CORRAL-x" en vez "5" */}
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>No hay corrales disponibles</option>
                                )}
                            </select>
                            {errores.corral && <div className="mensaje-error">{errores.corral}</div>}
                        </div>
                    </div>

                    <div className="contenedor-derecha">
                        <div className="contenedor-linea">
                            <div className="label">Células somáticas</div>
                            <input
                                type="text"
                                className={`cuadro-texto ${errores.celulas_somaticas ? "error" : ""}`}
                                name="celulas_somaticas"
                                disabled={esVisualizar} //Se indica que el campo "Células somáticas" no se puede modificar cuando se Visualiza.
                                value={animal.celulas_somaticas || ""}
                                onChange={handleChange}
                            />
                            {errores.celulas_somaticas &&
                                <div className="mensaje-error">{errores.celulas_somaticas}</div>}
                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Producción de leche</div>
                            <input
                                type="text"
                                className={`cuadro-texto ${errores.produccion_leche ? "error" : ""}`}
                                name="produccion_leche"
                                disabled={esVisualizar} //Se indica que el campo "Producción de leche" no se puede modificar cuando se Visualiza.
                                value={animal.produccion_leche || ""}
                                onChange={handleChange}
                            />
                            {errores.produccion_leche && <div className="mensaje-error">{errores.produccion_leche}</div>}
                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Calidad de patas</div>
                            <input
                                type="text"
                                className={`cuadro-texto ${errores.calidad_patas ? "error" : ""}`}
                                name="calidad_patas"
                                disabled={esVisualizar} //Se indica que el campo "Calidad de patas" no se puede modificar cuando se Visualiza.
                                value={animal.calidad_patas || ""}
                                onChange={handleChange}
                            />
                            {errores.calidad_patas && <div className="mensaje-error">{errores.calidad_patas}</div>}
                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Calidad de ubres</div>
                            <input
                                type="text"
                                className={`cuadro-texto ${errores.calidad_ubres ? "error" : ""}`}
                                name="calidad_ubres"
                                disabled={esVisualizar} //Se indica que el campo "Calidad de ubres" no se puede modificar cuando se Visualiza.
                                value={animal.calidad_ubres || ""}
                                onChange={handleChange}
                            />
                            {errores.calidad_ubres && <div className="mensaje-error">{errores.calidad_ubres}</div>}
                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Grasa</div>
                            <input
                                type="text"
                                className={`cuadro-texto ${errores.grasa ? "error" : ""}`}
                                name="grasa"
                                disabled={esVisualizar} //Se indica que el campo "Grasa" no se puede modificar cuando se Visualiza.
                                value={animal.grasa || ""}
                                onChange={handleChange}
                            />
                            {errores.grasa && <div className="mensaje-error">{errores.grasa}</div>}
                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Proteínas</div>
                            <input
                                type="text"
                                className={`cuadro-texto ${errores.proteinas ? "error" : ""}`}
                                name="proteinas"
                                disabled={esVisualizar} //Se indica que el campo "Proteínas" no se puede modificar cuando se Visualiza.
                                value={animal.proteinas || ""}
                                onChange={handleChange}
                            />
                            {errores.proteinas && <div className="mensaje-error">{errores.proteinas}</div>}
                        </div>

                        {/*Se muestra la fecha de eliminación del animal cuando se ha eliminado a un animal
                        por los motivos de "Muerte" o "Vendida"*/}
                        {["Muerte", "Vendida"].includes(animal.estado) && animal.fecha_eliminacion && (
                            <div className="contenedor-linea">
                                <div className="label">Fecha de eliminación</div>
                                <input
                                    type="date"
                                    className="cuadro-texto"
                                    name="fecha_eliminacion"
                                    value={animal.fecha_eliminacion}
                                    disabled
                                />
                            </div>
                        )}
                        {/*Si se ha añadido un comentario al animal cuando se ha eliminado,
                         aparece la información en color rojo
                         */}
                        <div>
                            {animal.comentario && (
                                <div style={{color: 'red', marginTop: '10px'}}>
                                    <strong>Comentarios:</strong> {animal.comentario}
                                </div>
                            )}
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
                            <NavLink to="/visualizar-animales" className="btn btn-info">CANCELAR</NavLink>
                        </div>
                    )}

                    {esVisualizar && (
                        <div className="boton-espacio">
                            <NavLink to="/visualizar-animales" className="btn btn-info">VISUALIZAR OTROS ANIMALES</NavLink>
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