import "../../styles/MovimientoCorral.css";
import {NavLink, useNavigate} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import {AnimalesContext} from "../../DataAnimales/DataVacaTerneros/AnimalesContext.jsx";
import {CorralesContext} from "../../DataAnimales/DataCorrales/CorralesContext.jsx";
import {ComprobarCamposMovimientoCorral} from "../../components/ComprobarCamposMovimientoCorral.jsx";

/*
* ------------------------------------------ MovimientoCorral.jsx: ------------------------------------------
* Funcionalidad: se muestra un formulario para mover de corral a un animal (vaca/ternero).
* TODO: Se tiene que realizar la parte de visualización, ya que no está incluido la barra de
*  tratamientos, vacunas, inseminaciones y árbol genealógico. Y por consiguiente, añadir el apartado de
*  datos generales que sí está implementado.
*
* --------------------------------------------------------------------------------------------------------
* */

export const MovimientoCorral = () => {

    //Hook para navegar
    const navigate = useNavigate();

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
    const [animal, setAnimal] = useState( estadoInicial);

    /* Se obtiene las funciones: agregarAnimal y modificarAnimal para hacer CU (agregar y modificar).
       Para ello se emplea useContext (se accede al contexto) ----> Se utiliza AnimalesContext
       */
    const {modificarAnimal} = useContext(AnimalesContext)


    /* Se extrae la información de las vacas, terneros, toros y corrales existentes para poder
    * utilizarlo en el formulario y seleccionar animales dichos animales. */
    const { animales } = useContext(AnimalesContext); // Lista de vacas/terneros
    const { corrales, modificarCorral } = useContext(CorralesContext); // Lista de corrales

    //Se emplea para gestionar el mensaje de error que indica que hay campos obligatorios.
    const [errores, setErrores] = useState({});

    // Se almacena el estado del animal seleccionado.
    const [animalSeleccionado, setAnimalSeleccionado] = useState("");

    // Se almacena el estado del corral origen del animal que ha sido seleccionado.
    const [corralOrigen, setCorralOrigen] = useState("");
    const [corralOrigenId, setCorralOrigenId] = useState(null);


    // Me creo "una variable temporal" para almacenar el corral destino del animal.
    const [corralDestino, setCorralDestino] = useState(""); // Variable temporal para el corral destino

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
        const datosMovimiento = {
            idAnimal: animalSeleccionado, // Donde tenemos guardado el animal que se ha seleccionado.
            corralDestino: corralDestino // Donde tenemos guardado el corral de destino seleccionad.
        };
        const erroresTemp = ComprobarCamposMovimientoCorral(datosMovimiento); // Revisa todos los campos
        setErrores(erroresTemp);

        console.log("Errores detectados:", erroresTemp);
        console.log("¿Formulario válido?", Object.keys(erroresTemp).length === 0);

        return Object.keys(erroresTemp).length === 0; // Retorna true si no hay errores
    };
    /* ----------------------- MANEJADOR CORRALCONTEXT: ACEPTAR, AGREGAR Y SEGUIR MOVIENDO ANIMALES, Y CANCELAR ----------------------- */


    // handleAgregar: agreg
    const handleAgregar = async (e) => {
        e.preventDefault();
        if (!validarFormulario()) return; // Si hay errores, no continúa

        // Se obtiene el animal que ha sido seleccionado
        const animalObjSelec = animales.find((animal) => animal.id === parseInt(animalSeleccionado));
        console.log("😀 Animal seleccionado ID: ", animalObjSelec.id, " con CODIGO: ",animalObjSelec.codigo)
        console.log("--- Corral origen: ", animalObjSelec.corral)
        if (animalObjSelec) {
            // Buscar el corral destino por su nombre (corralDestino guarda el nombre del corral seleccionado)
            const corralDestinoObj = corrales.find((corral) => corral.nombre === corralDestino);
            console.log("--- Corral destino: ", corralDestinoObj.id)
            if (corralDestinoObj) {

                // Se modifica el animal existente
                const animal_actualizado = await modificarAnimal({
                    ...animalObjSelec,
                    corral: corralDestinoObj.id,
                });
                setAnimal(animal_actualizado); // Se actualiza el animal en el contexto (frontend) y se muestra la información en el frontend.
            }
        }

        /* Una vez que se haya agregado un nuevo corral de destino para el animal.
           El usuario es redirigido a la página de "lista-corrales".
        */
        console.log("El animal", animalObjSelec.codigo,"ha sido movido de corral.");
        navigate("/lista-corrales");
    };

    //Para llevar acabo las acciones de AGREGAR Y SEGUIR AÑADIENDO un animal.
    //Le permite al usuario añadir un animal y continuar con el formulario vacio para añadir nuevos animales.
    const handleAceptarYSeguir = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) return; // Si hay errores, no continúa

        // Se obtiene el animal que ha sido seleccionado
        const animalObjSelec = animales.find((animal) => animal.id === parseInt(animalSeleccionado));
        console.log("😀 Animal seleccionado ID: ", animalObjSelec.id, " con CODIGO: ",animalObjSelec.codigo)
        console.log("--- Corral origen: ", animalObjSelec.corral)
        if (animalObjSelec) {
            // Buscar el corral destino por su nombre (corralDestino guarda el nombre del corral seleccionado)
            const corralDestinoObj = corrales.find((corral) => corral.nombre === corralDestino);
            console.log("--- Corral destino: ", corralDestinoObj.id)
            if (corralDestinoObj) {

                // Se modifica el animal existente
                const animal_actualizado = await modificarAnimal({
                    ...animalObjSelec,
                    corral: corralDestinoObj.id,
                });
                setAnimal(animal_actualizado); // Se actualiza el animal en el contexto (frontend) y se muestra la información en el frontend.
            }
        }

        /* Una vez que se haya agregado un nuevo corral de destino para el animal.
           El usuario puede continuar realizando más movimientos de corral.
        */

        setAnimalSeleccionado(""); //El campo de identificador del animal se vuelve vacío.
        setCorralOrigen(""); // El campo de origen del corral se vuelve vacío.
        setCorralDestino(""); // El campo de destino del corral se vuelve vacío.
        setAnimal({}); // El estado del animal se pone vacío.

        console.log("El animal", animalObjSelec.codigo,"ha sido movido de corral, se continúa haciendo más movimientos de corral.");
    };

      // Función para manejar la selección del animal y por tanto, actualizar el corral de origen.
        const handleSeleccionAnimal = (e) => {
            const id = e.target.value;
            setAnimalSeleccionado(id);
            console.log("🧩 ID del animal seleccionado: ", id)
            // Se busca el animal por su identificador en la lista de animales (Context).
            const animalObj = animales.find((animal) => animal.id === parseInt(id));
            if (animalObj && animalObj.corral !== null) {
                const corral = corrales.find((c) => c.id === animalObj.corral);
                setCorralOrigen(corral ? corral.codigo : "Ninguno");
                setCorralOrigenId(corral ? corral.id : null); // <-- guardar ID
            } else {
                setCorralOrigen("Ninguno");
                setCorralOrigenId(null);
            }
        };
    /* ----------------------- FIN MANEJADOR ANIMALESCONTEXT: ACEPTAR MOVIMIENTO DE CORRAL Y AGREGAR Y SEGUIR MOVIENDO ANIMALES ----------------------- */

    return (
        <>

            {/* El cuadrado que aparece en la página indica que se realiza un MOVIMIENTO DE CORRAL */}
            <div className="contenedor">
                <div className="cuadradoMovimientoCorral"> MOVER DE CORRAL  </div>
            </div>

            <hr/>

            <form>
                <div className="contenedor-flex">
                    <div className="contenedor-izquierda">

                        <div className="contenedor-linea">
                            <div className="label">Identificador animal</div>
                            <select
                                className={`form-select ${errores.idAnimal ? "error" : ""}`}
                                name="idAnimal"
                                value={animalSeleccionado}
                                onChange={ (e) => {
                                    handleChange(e); //Maneja los cambios en el formulario y errores.
                                    handleSeleccionAnimal(e);
                                }}
                            >
                                <option value="">Selecciona un animal</option>
                                {animales && animales.length > 0 ? (
                                    animales
                                        /*Se filtra por el tipo "Vaca" ya que "animales" contiene también "Terneros".
                                        Además, la vaca no debe estar muerta ni vendida, por lo tanto se añade a la
                                        condición del filtro*/
                                        .filter((animal) =>
                                            (animal.tipo.toUpperCase() === "Vaca".toUpperCase()
                                                || animal.tipo.toUpperCase() === "Ternero".toUpperCase())
                                            && animal.estado.toUpperCase() !== "Muerte".toUpperCase()
                                            && animal.estado.toUpperCase() !== "Vendida".toUpperCase()
                                        )
                                        .map((animalVacaTernero) => (
                                            <option
                                                key={animalVacaTernero.id}
                                                value={animalVacaTernero.id}>
                                                {animalVacaTernero.codigo}
                                            </option>
                                        ))
                                ) : (
                                    <option>No hay animales disponibles</option>
                                )}
                            </select>
                            {errores.idAnimal && <div className="mensaje-error-movimiento-corral">{errores.idAnimal}</div>}
                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Corral origen</div>
                            {/* Se muestra el corral del Identificador del animal (campo anterior) */}
                            <input
                                type="text"
                                name="corralOrigen"
                                className="cuadro-texto"
                                value={corralOrigen}
                                disabled //No se permite que se modifique, ya que queremos ver en qué corral está el animal.
                            />
                        </div>

                        <div className="contenedor-linea">

                            <div className="label">Corral destino</div>
                            <select
                                className={`form-select ${errores.corralDestino ? "error" : ""}`}
                                name="corralDestino"
                                value={corralDestino || ""}
                                onChange={(e) => {
                                    handleChange(e); //Maneja los cambios en el formulario y errores.
                                    setCorralDestino(e.target.value);
                                }}
                            >
                                {/* Aparece un listado con los corrales destino y NO aparece el corral de Origen
                                del animal que ha sido seleccionado. */}
                                <option value="">Selecciona un corral</option>
                                {corrales && corrales.length > 0 ? (
                                    corrales
                                        .filter((corral) => corral.id !== corralOrigenId) //Almacena todos los corrales excepto el corral de origen.
                                        .map((corral) => (
                                            <option key={corral.id} value={corral.nombre}>
                                                {corral.codigo}
                                            </option>
                                        ))
                                ) : (
                                    <option>No hay corrales disponibles</option>
                                )}
                            </select>
                            {errores.corralDestino && <div className="mensaje-error-movimiento-corral">{errores.corralDestino}</div>}
                        </div>
                    </div>
                </div>

                <>
                    <div className="boton-espacio">
                        <button type="button"
                                className="btn btn-info"
                                onClick={handleAgregar}>
                            ACEPTAR
                        </button>
                        <>
                            <button type="button"
                                    className="btn btn-info"
                                    onClick={handleAceptarYSeguir}>
                                ACEPTAR Y SEGUIR MOVIENDO
                            </button>
                        </>
                        <NavLink to="/lista-corrales" className="btn btn-info">CANCELAR</NavLink>
                    </div>
                </>

                {/* BOTÓN DE VOLVER AL MENÚ PRINCIPAL*/}
                <div className="boton-volver">
                    <NavLink to="/" className="btn btn-info">VOLVER AL MENÚ</NavLink>
                </div>
            </form>
        </>
    );
};