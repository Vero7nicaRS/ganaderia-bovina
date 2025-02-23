import {NavLink, useLocation, useNavigate} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import "../../styles/FormularioCorral.css";
import {AnimalesContext} from "../../DataAnimales/DataVacaTerneros/AnimalesContext.jsx";
import {ComprobarCamposFormularioCorral} from "../../components/ComprobarCamposFormularioCorral.jsx";
import {CorralesContext} from "../../DataAnimales/DataCorrales/CorralesContext.jsx";
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
    const { modo, corral: corralInicial } = location.state || {}; // Se recupera el modo y corral desde el state


    /* Se inicializa el corral con los datos del state.
       En caso de que el formulario este vacio, se inicializa con unos valores por defecto */
    const [corral, setCorral] = useState(corralInicial || {
        nombre: "",
        listaAnimales: []

    });

    /*
    - Se obtiene "modificarAnimal" de "AnimalesContext" para actualizar el estado del "corral".
    - Para que haya un desplegable con el listado de  vacas disponibles, es necesario
    acceder al listado de los mismos. Para ello, se obtiene dicha información
    con "AnimalesContext"  */

    const { animales,modificarAnimal  } = useContext(AnimalesContext); // Lista de vacas/terneros

    /* Se obtiene las funciones: agregarCorral y modificarCorral para hacer CU (agregar y modificar).
          Para ello se emplea useContext (se accede al contexto) ----> Se utiliza CorralesContext.
          También obtenemos "corrales", para ver los corrales que hay existentes y hacer comprobaciones
          en los nombres y evitar nombres duplicados.
    */
    const {agregarCorral, modificarCorral, corrales} = useContext(CorralesContext);

    //Se utiliza para controlar en que modo esta el formulario: VER, AGREGAR o MODIFICAR.
    const esVisualizar = modo === "ver";
    const esAgregar = modo === "agregar";
    const esModificar = modo === "modificar";

    //Se emplea para gestionar el mensaje de error que indica que hay campos obligatorios.
    const [errores, setErrores] = useState({});

    //Se emplea para seleccionar los animales que se van añadir al corral.
    //Parte de los animales que ya están en el corral o si no hay ningún animal, coge una lista vacia.
    const [animalesSeleccionados, setAnimalesSeleccionados] = useState(corral.listaAnimales || []);

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

    useEffect(() => {
        console.log("Animales actualizados en el contexto:", animales);
    }, [animales]);

    //Para hacer el check-box de animales.
    const toggleSeleccionAnimal = (id) => {
        setAnimalesSeleccionados((prev) =>
            prev.includes(id) ? prev.filter((animalId) => animalId !== id) : [...prev, id]
        );
    };


    const validarFormulario = () => {
        const erroresTemp = ComprobarCamposFormularioCorral(corral, corrales); // Revisa todos los campos
        // Contemplamos que puede haber corrales vacios.
        // if (animalesSeleccionados.length === 0) erroresTemp.listaAnimales = "Debes seleccionar al menos un animal.";
        setErrores(erroresTemp);

        console.log("Errores detectados:", erroresTemp);
        console.log("¿Formulario válido?", Object.keys(erroresTemp).length === 0);

        return Object.keys(erroresTemp).length === 0; // Retorna true si no hay errores
    };

    //Para llevar acabo las acciones de AGREGAR y MODIFICAR un corral.
    //TODO: ERROR, NO SE ME HACE BIEN.
    const handleAgregar = (e) => {
        console.log(corral); // Verifica el estado del corral antes de validar

        /* Hay que actualizar el estado de corral del animal. Y también, hay que modificar
           el listado de animales que están en los corrales.
        */
        e.preventDefault();
        if (!validarFormulario()) return; // Si hay errores, no continúa

        // Se crea el nuevo objeto corral con la lista actualizada de las vacas/terneros.
        const nuevoCorral = { ...corral, listaAnimales: animalesSeleccionados  };

        /* Se recorre el listado de corrales existente para modificar algún corral que haya sido modificado,
        ya que se han podido agregar o eliminar animales de ese corral.*/
        const corralesActualizados = corrales.map((corralExistente) => {
            // Si es el corral donde estaba algún animal y no es el mismo que el nuevo, lo modificamos
            if (corralExistente.listaAnimales.some((id) => animalesSeleccionados.includes(id))
                && corralExistente.nombre !== nuevoCorral.nombre) {
                return {
                    ...corralExistente,
                    listaAnimales: corralExistente.listaAnimales.filter((id) => !animalesSeleccionados.includes(id)),
                };
            }
            return corralExistente;
        });

        // Se aplica las modificaciones en el contexto de corrales ---> CorralesContext.
        corralesActualizados.forEach((corral) => modificarCorral(corral));

        // Se agrega o modifica el corral.
        if (esAgregar) {
            agregarCorral(nuevoCorral);
        } else if (esModificar) {
            modificarCorral(nuevoCorral);
        }

        /* Recorre la lista de animales (vacas/terneros) que han sido seleccionados
           para actualizar el "corral" donde se encuentra -----> (AnimalesContext).
        */
        animalesSeleccionados.forEach((id) => {
            const animal = animales.find((a) => a.id === id);
            if (animal) {
                modificarAnimal({ ...animal, corral: corral.nombre }); // Asigna el nombre del corral al animal
            }
        });



        /* Una vez que se haya agregado una nuevo corral o se modifique un corral existente,
         el usuario es redirigido a la página de "lista-corrales".
         */
        navigate("/lista-corrales");
    };

    const handleAceptarYSeguir = (e) => {
        console.log(corral); // Verifica el estado de la vacuna/tratamiento antes de validar
        e.preventDefault();
        if (!validarFormulario()) return; // Si hay errores, no continúa

        if(esAgregar){
            console.log("Se ha añadido el corral y se continua añadiendo nuevos corrales");
            agregarCorral({ ...corral, listaAnimales: animalesSeleccionados }); // Llamada a la función agregar de CorralesContext: Se añade el nuevo corral al listado de corrales
            setCorral({ nombre: "", listaAnimales: [] }); //Se pone el formulario a vacio, al introducir el campo con un valor vacío.
            setAnimalesSeleccionados([]);
        }
    }

    // Manejo de la selección de animales
    const handleAgregarAnimal = (animal) => {
        if (!animalesSeleccionados.includes(animal)) {
            setAnimalesSeleccionados([...animalesSeleccionados, animal]);
        }
    };

    const handleQuitarAnimal = (animal) => {
        setAnimalesSeleccionados(animalesSeleccionados.filter((a) => a !== animal));
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
                            value={corral.id || ""}
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
                                disabled={esVisualizar} //Se indica que el campo "Responsable" no se puede modificar cuando se Visualiza.
                                value={corral.nombre || ""}
                                onChange={handleChange}
                            />
                            {errores.nombre && <div className="mensaje-error">{errores.nombre}</div>}

                        </div>

                        {/* En caso de que sea una acción de VISUALIZAR, MODIFICAR O AGREGAR,
                        se mostrará el número total de animales que hay en el corral y los seleccionados. */}
                            <div className="contenedor-linea">
                                <div className="label">Número de animales</div>
                                {animalesSeleccionados.length}
                            </div>

                        {/* En caso de que sea una acción de AGREGAR o MODIFICAR  (!esVisualizar),
                        se mostrará un listado de nombres de vacas/terneros con sus identificadores para poder
                        añadirlos al corral. */}
                        {!esVisualizar && (
                            <>
                                <div className="contenedor-linea">
                                    <div className="label">Añadir Animales:</div>
                                    <div className="lista-animales">
                                        {animales.map((animal) => (
                                            <label key={animal.id} className="item-animal">
                                                <input
                                                    type="checkbox"
                                                    name="listaAnimales"
                                                    checked={animalesSeleccionados.includes(animal.id)}
                                                    onChange={() => toggleSeleccionAnimal(animal.id)}
                                                    disabled={esVisualizar}
                                                />
                                                {/*Aparece el ID de la vaca/ternero y el CORRAL donde se encuentra*/}
                                              {animal.id} ({animal.corral})
                                            </label>
                                        ))}
                                    </div>
                                        {errores.listaAnimales && <div className="mensaje-error">{errores.listaAnimales}
                                        </div>}

                                </div>


                            </>
                        )}
                        {
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
                                    {
                                        animalesSeleccionados.length === 0 ? (
                                              /* - Si se VISUALIZA se muestra un mensaje indicando que no hay animales
                                                 en el corral.
                                                 - Si se AGREGA o MODIFICA se muestra un mensaje indicando que no
                                                 hay aniamles seleccionados.*/
                                            <tr>
                                                {esVisualizar && ( //Se visualiza corral.
                                                    <td colSpan="2" className="mensaje-no-animales">No hay animales
                                                        en el corral
                                                    </td>
                                                    )
                                                }
                                                {!esVisualizar && ( //Se agrega o modifica corral.
                                                    <td colSpan="2" className="mensaje-no-animales">No hay animales
                                                        seleccionados
                                                    </td>
                                                )
                                                }

                                            </tr>
                                        ) : (
                                            animalesSeleccionados.map((id) => {
                                                const animal = animales.find((a) => a.id === id);
                                                return animal ? (
                                                    <tr key={id}>
                                                        <td>{animal.id}</td>
                                                        {/*El botón de QUITAR solo aparece cuando se AGREGA o MODIFICA un corral*/}
                                                        {!esVisualizar && (
                                                            <td>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-danger btn-sm"
                                                                    onClick={() => handleQuitarAnimal(id)}
                                                                >
                                                                    Quitar
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

                        }

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
                            <NavLink to="/lista-corrales" className="btn btn-info">VOLVER AL LISTADO DE CORRALES</NavLink>
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