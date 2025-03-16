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
    const [animal, setAnimal] = useState( {
        id: "",
        tipo: "Vaca",
        estado: "Vacía",
        nombre: "",
        fechaNacimiento: "",
        padre: "",
        madre: "",
        corral: "",
        celulasSomaticas: "",
        produccionLeche: "",
        calidadPatas: "",
        calidadUbres: "",
        grasa: "",
        proteinas: ""
    });

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

    // Me creo "una variable temporal" para almacenar el corral destino del animal.
    const [corralDestino, setCorralDestino] = useState(""); // Variable temporal para el corral destino


    // Se emplea para comprobar si dos listas son iguales (en este caso, si dos corrales tienen los mismos elementos)
    const sonIgualesListas = (lista1, lista2) => {
        if (lista1.length !== lista2.length) return false;
        // Se ordenan las listas para comparar los elementos.
        const lista1Ordenada = [...lista1].sort();
        const lista2Ordenada = [...lista2].sort();
        return lista1Ordenada.every((val, index) => val === lista2Ordenada[index]);
    };

    /* El "useEffect" gestiona la actualización de los datos. Se ejecuta después de la
   renderización del componente y de los cambios realizados en las dependencias.
   En este caso, el useEffect se ejecutará cuando se hayan realizado la ejecución
   de todas las funciones, y una vez renderizado, se evalúan las dependencias que son
   "animales", "corrales" y "modificarCorral".
   Por tanto, cada vez que el estado "animales" o "corrales" cambie, se ejecutará el UseEffect.
   Esto asegura que los animales y los corrales están actualizándose en el contexto (tienen todos los valores actualizados).
   Además, con "console.log" nos muestra por consola el estado actualizado de "animales" y "corrales".

   Razón de las dependencias escogidas:
    - animales: cada vez que cambie la lista de animales (agregar o modificar), se quiere que se ejecute
    para que la información esté sincronizada.
    - corrales: cada vez que cambie la lista de corrales (agregar o modificar), "".
    - modificarCorral: aparece dentro del UseEffect.

    En resumen, cada vez que haya un cambio en las dependencias, queremos que la información esté
    actualizada.
   * */
    useEffect(() => {

        // Se recorre cada corral (corral) de la lista de corrales (corrales - Context) viendo los animales que tiene, para así actualizarlo.
        corrales.forEach((corral) => {
            // Se obtienen los IDs de los animales que tienen ese corral asignado.
            const animalesAsignados = animales
                .filter((animal) => animal.corral === corral.nombre) // ¿Animal está en ese corral?
                .map((animal) => animal.id); //Si está, dame el identificador del animal.

            // Si la lista del corral es distinta de los animales asignados, se actualiza el corral
            if (!sonIgualesListas(corral.listaAnimales, animalesAsignados)) {
                const actualizarCorral = { ...corral, listaAnimales: animalesAsignados };
                modificarCorral(actualizarCorral);
            }
        });
        console.log("Animales actualizados en el contexto:", animales);
        console.log("Corrales actualizados en el contexto:", corrales);
    }, [animales, corrales, modificarCorral]);

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
    const handleAgregar = (e) => {
        e.preventDefault();
        if (!validarFormulario()) return; // Si hay errores, no continúa

        // Se obtiene el animal que ha sido seleccionado
        const animalObjSelec = animales.find((animal) => animal.id === animalSeleccionado); // Buscar el animal seleccionado (id)
        if (animalObjSelec) {

            // Se busca el corral Origen --> Se recorren todos los corrales y se busca el corral donde está el animal "animalObjSelec".
            const corralOrigenObj = corrales.find((corralOrigenBuscado) => corralOrigenBuscado.nombre === animalObjSelec.corral);

            // Se busca el corral Destino --> Se recorren todos los corrales y se busca el corral donde quiere estar el animal "corralDestinoObj".
            const corralDestinoObj = corrales.find((corralDestinoBuscado) => corralDestinoBuscado.nombre === corralDestino);

            // Si tenemos datos del corral origen y el de destino, realizamos las modificaciones en los corrales.
            if (corralOrigenObj && corralDestinoObj) {
                /* Se elimina el animal del corral origen --> Se escogen todos los animales del corral EXCEPTO el seleccionado porque lo
                queremos eliminar */
                corralOrigenObj.listaAnimales = corralOrigenObj.listaAnimales.filter((id) => id !== animalSeleccionado);
                modificarCorral(corralOrigenObj);

                // Se añade el animal al corral nuevo (destino).
                corralDestinoObj.listaAnimales = [...corralDestinoObj.listaAnimales, animalSeleccionado];
                modificarCorral(corralDestinoObj);

                // Se modifica el animal para actualizar su corral.
                modificarAnimal({ ...animalObjSelec, corral: corralDestino });
            }
        }
        /* Una vez que se haya agregado un nuevo corral de destino para el animal.
           El usuario es redirigido a la página de "lista-corrales".
        */
        navigate("/lista-corrales");
    };

    //Para llevar acabo las acciones de AGREGAR Y SEGUIR AÑADIENDO un animal.
    //Le permite al usuario añadir un animal y continuar con el formulario vacio para añadir nuevos animales.
    const handleAceptarYSeguir = (e) => {
        e.preventDefault();

        if (!validarFormulario()) return; // Si hay errores, no continúa

        // Se obtiene el animal que ha sido seleccionado
        const animalObjSelec = animales.find((animal) => animal.id === animalSeleccionado); // Buscar el animal seleccionado (id)

        if (animalObjSelec) {
            // Obtener el corral de origen y el corral de destino
            const corralOrigenObj = corrales.find((corralBuscado) => corralBuscado.nombre === animalObjSelec.corral);
            const corralDestinoObj = corrales.find((corralBuscado) => corralBuscado.nombre === corralDestino);

            // Si tenemos datos del corral origen y el de destino, realizamos las modificaciones en los corrales.
            if (corralOrigenObj && corralDestinoObj) {
                /* Se elimina el animal del corral origen --> Se escogen todos los animales del corral EXCEPTO el seleccionado porque lo
                queremos eliminar */
                corralOrigenObj.listaAnimales = corralOrigenObj.listaAnimales.filter((id) => id !== animalSeleccionado);
                modificarCorral(corralOrigenObj); // Actualizamos el corral de origen

                // Se añade el animal al corral nuevo (destino).
                corralDestinoObj.listaAnimales = [...corralDestinoObj.listaAnimales, animalSeleccionado];
                modificarCorral(corralDestinoObj); // Actualizamos el corral de destino

                // Se modifica el animal para actualizar su corral.
                modificarAnimal({ ...animalObjSelec, corral: corralDestino });
            }
        }

        /* Una vez que se haya agregado un nuevo corral de destino para el animal.
           El usuario puede continuar realizando más movimientos de corral.
        */

        setAnimalSeleccionado(""); //El campo de identificador del animal se vuelve vacío.
        setCorralOrigen(""); // El campo de origen del corral se vuelve vacío.
        setCorralDestino({}); // El campo de destino del corral se vuelve vacío.
        setAnimal({}); // El estado del animal se pone vacío.

        console.log("El animal ha sido movido de corral, se continúa haciendo más movimientos de corral.");
    };

      // Función para manejar la selección del animal y por tanto, actualizar el corral de origen.
        const handleSeleccionAnimal = (e) => {
            const id = e.target.value;
            setAnimalSeleccionado(id);
            // Se busca el animal por su identificador en la lista de animales (Context).
            const animalObj = animales.find((animal) => animal.id === id);
            if (animalObj) {
                setCorralOrigen(animalObj.corral);
            } else {
                setCorralOrigen("");
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
                                                {animalVacaTernero.id}
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
                                        .filter((corral) => corral.nombre !== corralOrigen) //Almacena todos los corrales excepto el corral de origen.
                                        .map((corral) => (
                                            <option key={corral.nombre} value={corral.nombre}>
                                                {corral.nombre}
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