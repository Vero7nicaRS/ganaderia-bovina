import {NavLink, useLocation, useNavigate} from "react-router-dom";
import {useContext, useEffect, useRef, useState} from "react";
import "../../styles/FormularioCorral.css";
import {AnimalesContext} from "../../DataAnimales/DataVacaTerneros/AnimalesContext.jsx";
import {ComprobarCamposFormularioCorral} from "../../components/ComprobarCamposFormularioCorral.jsx";
import {CorralesContext} from "../../DataAnimales/DataCorrales/CorralesContext.jsx";
import api from "../../api.js";
import { useParams } from "react-router-dom";
import { convertirCorralParaAPI} from "../../utilities/ConversorAnimal.js";
export const FormularioCorral = () => {

    //Se utiliza "location" para acceder a los datos (state) que han sido transmitidos mediante el NavLink (modo y vacuna/tratamiento)
    const location = useLocation();

    //Hook para navegar
    const navigate = useNavigate();

    /*
    * Desde ListaCorrales se le pasa un estado:
    * state={{modo: "ver", corral: item}}
    * Por lo que tiene que tener el mismo nombre para referenciarlo correctamente.
    * */
    const { id } = useParams();  // si defines la ruta como /formulario-corral/:id
    const { modo, corral: corralInicial } = location.state || {}; // Se recupera el modo y corral desde el state
    const modoFinal = modo || (id ? "ver" : "agregar")

    /* Se inicializa el corral con los datos del state.
    En caso de que el formulario este vacio, se inicializa con unos valores por defecto */
    const [corral, setCorral] = useState(corralInicial ||{
        id: null,
        codigo: "",
        nombre: "",
    });

    /*
    - Se obtiene "modificarAnimal" de "AnimalesContext" para actualizar el estado del "corral".
    - Se obtiene "animalesToros" para actualizar el animal que es trasladado de corral.
    - Para que haya un desplegable con el listado de  vacas disponibles, es necesario
    acceder al listado de los mismos. Para ello, se obtiene dicha información
    con "AnimalesContext"  */

    const {animales, modificarAnimal} = useContext(AnimalesContext); // Lista de vacas/terneros
    /* Se obtiene las funciones: agregarCorral y modificarCorral para hacer CU (agregar y modificar).
          Para ello se emplea useContext (se accede al contexto) ----> Se utiliza CorralesContext.
          También obtenemos "corrales", para ver los corrales que hay existentes y hacer comprobaciones
          en los nombres y evitar nombres duplicados.
    */
    const {agregarCorral, modificarCorral, corrales} = useContext(CorralesContext);


    //Se utiliza para controlar en que modo esta el formulario: VER, AGREGAR o MODIFICAR.
    const esVisualizar = modoFinal === "ver";
    const esAgregar = modoFinal === "agregar";
    const esModificar = modoFinal === "modificar";

    //Se emplea para gestionar el mensaje de error que indica que hay campos obligatorios.
    const [errores, setErrores] = useState({});

    //Se emplea para seleccionar los animales que se van añadir al corral.
    //Parte de los animales que ya están en el corral o si no hay ningún animal, coge una lista vacia.
    //const [animalesSeleccionados, setAnimalesSeleccionados] = useState(corral.listaAnimales || []);
    const [animalesSeleccionados, setAnimalesSeleccionados] = useState(() => {
        if ((esVisualizar || esModificar) && corral.id) {
            return animales.filter(a => a.corral === corral.id).map(a => a.id);
        }
        return [];
    });

    //Manejador para llevar acabo las modificaciones de los corrales (actualizar el estado de corral)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCorral({
            ...corral,
            [name]: value,
        });

        // Se elimina el error (error + mensaje de error) cuando el usuario seleccione una opción válida en el campo correspondiente.
        setErrores((prevErrores) => ({
            ...prevErrores,
            [name]: value ? "" : prevErrores[name], // Si hay un valor en el campo, borra el error (error + mensaje de error)
        }));
    };

    /* useEffect:
    Se encarga de cargar el corral desde el backend y asociar los animales que están asignados a ese corral.
    Se hace separado (se usa dos useEffects)
    ¿Por qué se separa el corral de los animales?
    Porque puede ser que los animales se encuentren vacios (no se hayan cargado) cuando se realice el filtrado
    porque procede del contexto y este, puede tardar un poquito más en iniciliazarse.

    La página de formulario-corral se ve correctamente tanto si:
     - Se accede desde la lista de corrales.
     - Introduciendo URL con id del corral.
     - Recargando la página del corral.
    */
    /* useEffect 1: Se realiza la carga del corral desde el backend cuando se accede mediante URL
     (no hay información en el location.state porque no se ha llegado por un NavLink que enviaba el estado)
     */
    const animalesOriginalesRef = useRef([]);

    useEffect(() => {
        const fetchCorral = async () => {
            if (!corralInicial && id) {
                try {
                    const response = await api.get(`/corrales/${id}/`);
                    setCorral(response.data);
                } catch (error) {
                    console.error("Error al cargar el corral:", error);
                }
            }
        };
             console.log("Animales actualizados en el contexto:", animales);
             console.log("Corrales actualizados en el contexto:", corrales);
        fetchCorral(); // Se llama después una única vez. Se ha añadido de nuevo porque no se puede poner async el "useEffect".
    }, [id, corralInicial,animales,corrales]);

    /* useEffect 2: Se realiza la asociación de los animales a ese corral una vez que
     el corral ya está cargado (corral.id) y los animales están disponibles (animales.length>0) */
    useEffect(() => {
        if (corral.id && animales.length > 0) {
            const relacionados = animales.filter(a => a.corral === corral.id);
            //setAnimalesSeleccionados(relacionados.map(a => a.id));
            const ids = relacionados.map(a => Number(a.id));
            animalesOriginalesRef.current = ids; // guardamos los originales
            setAnimalesSeleccionados(ids);       // también los usamos como seleccionados iniciales

        }
    }, [corral.id, animales]);

    //Para hacer el check-box de animales.
    const toggleSeleccionAnimal = (id) => {
        console.log('😉 Animal seleccionado: ', id);
        setAnimalesSeleccionados((prev) =>
            prev.includes(id) ? prev.filter((animalId) => animalId !== id) : [...prev, id]
        );
    };

    const validarFormulario = () => {
        const erroresTemp = ComprobarCamposFormularioCorral(corral, corrales); // Revisa todos los campos
        /* Se contempla que puede haber corrales vacíos, es decir, sin ningún animal.
         if (animalesSeleccionados.length === 0) erroresTemp.listaAnimales = "Debes seleccionar al menos un animal.";
         */
        setErrores(erroresTemp);

        console.log("Errores detectados:", erroresTemp);
        console.log("¿Formulario válido?", Object.keys(erroresTemp).length === 0);

        return Object.keys(erroresTemp).length === 0; // Retorna true si no hay errores
    };

    //Para llevar acabo las acciones de AGREGAR y MODIFICAR un corral.
    const handleAgregar = async (e) => {
        e.preventDefault();
        if (!validarFormulario()) return; // Si hay errores, no continúa

        const corralConvertido = convertirCorralParaAPI(corral);
        console.log("😀 Corral convertido: ", corral);
        let nuevoCorralId = corral.id;
        try {
            if (esAgregar) {
                const nuevoCorralCreado = await agregarCorral(corralConvertido);
                nuevoCorralId = nuevoCorralCreado.id;
                console.log("✅ Corral añadido:", nuevoCorralCreado);
            }

            /* Recorre la lista de animales (vacas/terneros) que han sido seleccionados
               para actualizar el "corral" donde se encuentra -----> (AnimalesContext).
               (Actualización de los animales en el contexto)
            */

            console.log("📋 Todos los animales en contexto:");
            animales.forEach(a => {
                console.log(`  → id: ${a.id}, código: ${a.codigo}`);
            });
            console.log("🧠 IDs seleccionados:", animalesSeleccionados);
            const nuevosAnimales = animalesSeleccionados.filter(
                id => !animalesOriginalesRef.current.includes(id)
            );
            // Se actualiza los animales, eliminándolos de sus corrales anteriores
            for (const id of nuevosAnimales) {
                // console.log("OEOEO id: ",id);
                // const animal = animales.find((animal) => animal.id === id);
                const idNum = Number(id); // 👈 Asegúrate de que sea número
                const animal = animales.find((a) => a.id === idNum);

                console.log("🔍 Buscando animal con ID:", idNum);
                if (animal) {
                    console.log("✅ Animal encontrado:", animal.codigo);
                    // Se elimina el animal del corral anterior para poder añadirlo al nuevo corral.
                    //const corralAnterior = corrales.find((corralBuscado) => corralBuscado.nombre === animal.corral);

                    // Si tiene un corral anterior, se procede a eliminar ese animal del corral.
                    /*if (corralAnterior) {
                        // Se elimina el animal de la lista de su corral anterior
                        corralAnterior.listaAnimales = corralAnterior.listaAnimales.filter(
                            (animalId) => animalId !== id
                        );
                        modificarCorral(corralAnterior); // Se actualiza el corral en el estado
                    }*/
                    const animalActualizado = {
                        ...animal,
                        corral: nuevoCorralId  // Aquí usamos el ID del corral, como espera el backend
                    };
                    // Se asigna al animal el nuevo corral.
                    //modificarAnimal({ ...animal, corral: corral.nombre });
                    await api.put(`/animales/${animal.id}/`, animalActualizado);
                    modificarAnimal(animalActualizado); // 👈 ACTUALIZA el contexto

                }
            }

            if (esModificar) {
                const corral_actualizado = await modificarCorral(corralConvertido);
                setCorral(corralConvertido); // Se actualiza el animal en el contexto (frontend) y se muestra la información en el frontend.
                console.log("✅ Corral modificado:", corral_actualizado);
            }

            /* Una vez que se haya agregado un nuevo corral o se modifique un corral existente,
            el usuario es redirigido a la página de "lista-corrales".
            */
            navigate("/lista-corrales");
        } catch (error) {
            console.error("❌ Error al guardar el corral o actualizar animales:", error);
            console.log("💬 Detalles del error:", error.response?.data);
        }
    };

    const handleAceptarYSeguir = async (e) => {
        console.log(corral); // Verifica el estado de la vacuna/tratamiento antes de validar
        e.preventDefault();
        if (!validarFormulario()) return; // Si hay errores, no continúa

        const corralConvertido = convertirCorralParaAPI(corral);
        let nuevoCorralId = corral.id;
        try {
            if (esAgregar) {
                const nuevoCorralCreado = await agregarCorral(corralConvertido);  // Se añade el nuevo corral al backend y se muestra la información en el frontend.
                nuevoCorralId = nuevoCorralCreado.id;
                console.log("✅ Corral añadido:", nuevoCorralCreado);
            }

            // Actualizar animales con el nuevo corral
            const nuevosAnimales = animalesSeleccionados.filter(
                id => !animalesOriginalesRef.current.includes(id)
            );

            for (const id of nuevosAnimales) {
                const idNum = Number(id);
                const animal = animales.find(a => a.id === idNum);

                if (animal) {
                    const animalActualizado = {
                        ...animal,
                        corral: nuevoCorralId
                    };
                    await api.put(`/animales/${animal.id}/`, animalActualizado);
                    modificarAnimal(animalActualizado); // 👈 Actualiza el contexto
                }
            }
            /* Una vez que se haya agregado un nuevo corral o se modifique un corral existente,
            el usuario puese seguir añadiendo nuevos corrales. ".
            */
            // 3. Limpiar formulario para seguir añadiendo
            setCorral({
                nombre: "",
                codigo: ""
                //listaAnimales: []
            });
            setAnimalesSeleccionados([]);
            setErrores({});
        } catch (error) {
            console.error("❌ Error al guardar el corral o actualizar animales:", error);
            console.log("💬 Detalles del error:", error.response?.data);
        }
    }

    // Manejo de la selección de animales
    const handleQuitarAnimal = (animal) => {
        setAnimalesSeleccionados(animalesSeleccionados.filter((animalito) => animalito !== animal));
    };

    return (
        <>
            {/* El cuadrado que aparece en la página indicando la ACCIÓN que se va a realizar:
                - VISUALIZAR CORRAL.
                - AGREGAR CORRAL.
                - MODIFICAR CORRAL.
            */}
            <div className="contenedor">
                <div className="cuadradoVisualizarAgregarModificarVT">
                    {esVisualizar
                        ? `VISUALIZAR CORRAL`
                        : esAgregar
                            ? "AÑADIR CORRAL"
                            : `MODIFICAR CORRAL`}
                </div>

                {/* En caso de que sea una acción de VISUALIZAR o MODIFICAR  (!esAgregar),
                se mostrará el ID del corral dentro de un cuadrado. */}
                {!esAgregar && (
                    <div className="cuadradoID">
                        <span className="identificador">ID</span>
                        <input
                            type="text"
                            name="id"
                            className="cuadro-texto"
                            value={corral.codigo || ""}
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
                            <div className="label">Nombre del corral</div>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre" //Debe coincidir con el nombre de const[corral, ...]
                                className={`cuadro-texto ${errores.nombre ? "error" : ""}`}
                                disabled={esVisualizar} //Se indica que el campo "nombre del corral" no se puede modificar cuando se Visualiza.
                                value={corral.nombre || ""}
                                onChange={handleChange}
                            />
                            {errores.nombre && <div className="mensaje-error">{errores.nombre}</div>}
                        </div>

                        {/* En caso de que sea una acción de VISUALIZAR, MODIFICAR O AGREGAR,
                        se mostrará el número total de animales que hay en el corral y los seleccionados. */}
                            <div className="contenedor-linea">
                                <div className="label">Número de animales: </div>
                                {animalesSeleccionados.length}
                            </div>

                        {/* En caso de que sea una acción de AGREGAR o MODIFICAR  (!esVisualizar),
                        se mostrará un listado de nombres de vacas/terneros con sus identificadores para poder
                        añadirlos al corral. */}
                        {!esVisualizar && (
                            <>
                                <div className="contenedor-linea">
                                    <div className="label">Añadir animales</div>
                                    <div className="lista-animales">
                                        {animales
                                            /* Se filtra por los animales que NO están en el corral y no tienen el estado
                                             "MUERTE" o "VENDIDA".
                                             De estos animales, se obtiene el identificador y corral donde están*/
                                            .filter(animal =>
                                                !animalesSeleccionados.includes(animal.id) &&
                                                animal.estado.toUpperCase() !== "MUERTE" &&
                                                animal.estado.toUpperCase() !== "VENDIDA"
                                            ).length === 0 ? (
                                                <div className="mensaje-no-animales">
                                                    No hay animales disponibles para añadir al corral.
                                                </div>
                                             ) : (
                                                animales
                                                .filter(animal =>
                                                    !animalesSeleccionados.includes(animal.id) &&
                                                    animal.estado.toUpperCase() !== "MUERTE" &&
                                                    animal.estado.toUpperCase() !== "VENDIDA"
                                                ).map((animal) => {
                                                        // 🔎 Buscamos el corral correspondiente por id
                                                        const corralAsignado = corrales.find(c => c.id === animal.corral);
                                                        const nombreCorral = corralAsignado ? corralAsignado.codigo : "Ninguno";
                                                        return (
                                                            <label key={animal.id} className="item-animal">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`animal-${animal.id}`}
                                                                    name={`animal-${animal.id}`}
                                                                    checked={animalesSeleccionados.includes(animal.id)}
                                                                    onChange={() => toggleSeleccionAnimal(animal.id)}
                                                                />
                                                                {/*Aparece el ID de la vaca/ternero y el CORRAL donde se encuentra */}
                                                                {/*{animal.codigo} ({nombreCorral})*/}
                                                                <label htmlFor={`animal-${animal.id}`}>
                                                                    {animal.codigo} ({nombreCorral})
                                                                </label>
                                                            </label>
                                                        );
                                                })
                                            )
                                        }
                                    </div>
                                </div>
                            </>
                        )}
                        <>
                            {/* LISTA DE ANIMALES SELECCIONADOS */}
                            <div className="listaAnimalesAgregadosEnCorral">Lista de animales en el corral:</div>

                            <table className="tabla-corrales">
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    {/*La columna ACCIÓN solo aparece cuando se AGREGA o MODIFICA un corral*/}
                                    {!esVisualizar && <th>ACCIÓN</th>}
                                </tr>
                                </thead>
                                <tbody>
                                {animalesSeleccionados.length === 0 ? (

                                    <tr>
                                        {/* - Si se VISUALIZA se muestra un mensaje indicando que no hay animales*/}
                                        {/*    en el corral. */}

                                        {/* - Si se AGREGA o MODIFICA se muestra un mensaje indicando que no*/}
                                        {/*    hay aniamles seleccionados.*/}
                                        <td colSpan="2" className="mensaje-no-animales">
                                            {esVisualizar ? "No hay animales en el corral" : "No hay animales seleccionados"}
                                        </td>
                                    </tr>
                                ) : (
                                    animalesSeleccionados.map((id) => {
                                        const animal = animales.find((a) => a.id === id);
                                        return animal ? (
                                            <tr key={id}>
                                                <td>{animal.codigo}</td>
                                                {/*El botón de QUITAR solo aparece cuando se AGREGA o MODIFICA un corral.*/}
                                                {/*Además, el botón solo aparece en los animales que NO estaban en el corral, es decir,*/}
                                                {/*se pone el botón en los que se están añadiendo ahora. Por tanto,*/}
                                                {/*se comprueba que los animales NO estén en la lista de animales del corral.*!/*/}
                                                {!esVisualizar && !animalesOriginalesRef.current.includes(id) && (
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleQuitarAnimal(id)}
                                                        >
                                                            QUITAR
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ) : null;
                                    })
                                )}
                                </tbody>
                            </table>
                        </>
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
                            <NavLink to="/lista-corrales" className="btn btn-info">CANCELAR</NavLink>
                        </div>
                    )}

                    {esVisualizar && (
                        <div className="boton-espacio">
                            <NavLink to="/lista-corrales" className="btn btn-info">
                                VOLVER AL LISTADO DE CORRALES
                            </NavLink>
                        </div>
                    )}
                </>

                {/* BOTÓN DE VOLVER AL MENÚ PRINCIPAL*/}
                <div className="boton-volver">
                    <NavLink to="/" className="btn btn-info">
                        VOLVER AL MENÚ
                    </NavLink>
                </div>
            </form>
        </>
    );
};