import "../../styles/FormularioAnimal.css";
import {NavLink, useLocation, useNavigate} from "react-router-dom";
import {useContext, useState} from "react";
import {TorosContext} from "../../DataAnimales/DataToros/TorosContext.jsx";

/*
* ------------------------------------------ FormularioToro.jsx: ------------------------------------------
* Funcionalidad: se muestra un formulario para visualizar, agregar y modificar un animal (vaca/ternero).
* con un determinado identificador (ID)
*
* --------------------------------------------------------------------------------------------------------
* */

export const FormularioToro = () => {

    //Se utiliza "location" para acceder a los datos (state) que han sido transmitidos mediante el NavLink (modo y animal)
    const location = useLocation();

    //Hook para navegar
    const navigate = useNavigate();


    const { modo, animal: animalInicial } = location.state || { tipo: "Vaca", estado:"Vacía", corral: "1 - Vacas"}; // Se recupera el modo y animal desde el state

    /* Se inicializa el animal con los datos del state.
       En caso de que el formulario este vacio, se inicializa con unos valores por defecto */
    const [animal, setAnimal] = useState(animalInicial || {
        estado: "Vivo",
        nombre: "",
        cantidadSemen: "",
        celulasSomaticas: "",
        calidadPatas: "",
        calidadUbres: "",
        grasa: "",
        proteinas: ""
    });


    /* Se obtiene las funciones: agregarAnimal y modificarAnimal para hacer CU (agregar y modificar).
       Para ello se emplea useContext (se accede al contexto) ----> Se utiliza TorosContext
       */
    const {agregarAnimal, modificarAnimal} = useContext(TorosContext);

    //Se utiliza para controlar en que modo esta el formulario: VER, AGREGAR o MODIFICAR.
    const esVisualizar = modo === "ver";
    const esAgregar = modo === "agregar";
    const esModificar = modo === "modificar";

    //Manejador para llevar acabo las modificaciones de los animales (actualizar el estado del animal)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setAnimal({
            ...animal,
            [name]: value,
        });
    };


    /* ----------------------- MANEJADOR TOROSCONTEXT: AGREGAR, AGREGAR Y SEGUIR, Y MODIFICAR ----------------------- */

    //Para llevar acabo las acciones de AGREGAR y MODIFICAR un animal.
    const handleAgregar = (e) => {
        console.log(animal); // Verifica el estado de animal antes de validar

        e.preventDefault();

        if(esAgregar){
            console.log("Se ha añadido el toro");
            agregarAnimal(animal); // Llamada a la función agregar de TorosContext: Se añade el nuevo animal (toro)

        }else if (esModificar){
            console.log("Se ha modificado el toro");
            modificarAnimal(animal); // Llamada a la función modificar de TorosContext: Se modifica el animal existente (toro)
        }

        /* Una vez que se haya agregado un nuevo animal (toro) o se modifique un animal existente (toro),
         el usuario es redirigido a la página de "visualizar-toros".
         */
        navigate("/visualizar-toros");
    };

    //Para llevar acabo las acciones de AGREGAR Y SEGUIR AÑADIENDO un animal.
    //Le permite al usuario añadir un animal y continuar con el formulario vacio para añadir nuevos animales.
    const handleAceptarYSeguir = (e) => {
        console.log(animal); // Verifica el estado de animal antes de validar
        e.preventDefault();
        if(esAgregar){
            console.log("Se ha añadido el toro y se continua añadiendo nuevos toros");
            agregarAnimal(animal); // Llamada a la función agregar de TorosContext: Se añade el nuevo animal (vaca/ternero)
            setAnimal({}); //Se pone el formulario a vacio, al introducir el campo con un valor vacío.
        }

    }

    /* ----------------------- FIN MANEJADOR ANIMALESCONTEXT: AGREGAR, AGREGAR Y SEGUIR, Y MODIFICAR  -----------------------*/

    return (
        <>

            {/* El cuadrado que aparece en la página indicando la ACCIÓN que se va a realizar:
                - VISUALIZAR TORO.
                - AGREGAR TORO.
                - MODIFICAR TORO.
            */}

            <div className="contenedor">

                <div className="cuadradoVisualizarAgregarModificar">
                    {esVisualizar
                        ? "VISUALIZAR TORO"
                        : esAgregar
                            ? "AGREGAR TORO"
                            : "MODIFICAR TORO"}
                </div>

                {/* En caso de que sea una acción de VISUALIZAR o MODIFICAR  (!esAgregar),
                se mostrará el ID del animal (toro) dentro de un cuadrado. */}
                {!esAgregar && (

                    <div className="cuadradoID">
                        <span className="identificador">ID</span>
                        <input
                            type="text"
                            className="cuadro-texto"
                            value={animal.id || ""}
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
                            <div className="label">Nombre</div>
                            <input
                                type="text"
                                className="cuadro-texto"
                                name="nombre"
                                disabled={esVisualizar} //Se indica que el campo "Nombre" no se puede modificar cuando se Visualiza.
                                value={animal.nombre || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="contenedor-linea">
                            <div className="label">Estado</div>
                            <select
                                className="form-select"
                                name="estado"
                                disabled={esVisualizar || esModificar} //Se indica que el campo "Estado" no se puede modificar cuando se Visualiza.
                                value={animal.estado || "Vivo"}
                                onChange={handleChange}
                            >
                                <option value="Vivo">Vivo</option>

                                {/* Opción oculta pero mostrada si ya estaba asignada */}
                                {["Muerte", "Otros"].includes(animal.estado) && (
                                    <option value={animal.estado}>{animal.estado}</option>
                                )}
                            </select>
                        </div>
                        <div className="contenedor-linea">
                            <div className="label">Cantidad de semen</div>
                            <input
                                type="text"
                                className="cuadro-texto"
                                name="cantidadSemen"
                                disabled={esVisualizar} //Se indica que el campo "Nombre" no se puede modificar cuando se Visualiza.
                                value={animal.cantidadSemen || ""}
                                onChange={handleChange}
                            />
                        </div>

                    </div>

                    <div className="contenedor-derecha">
                        <div className="contenedor-linea">
                            <div className="label">Células somáticas</div>
                            <input
                                type="text"
                                className="cuadro-texto"
                                name="celulasSomaticas"
                                disabled={esVisualizar} //Se indica que el campo "Células somáticas" no se puede modificar cuando se Visualiza.
                                value={animal.celulasSomaticas || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="contenedor-linea">
                            <div className="label">Calidad de patas</div>
                            <input
                                type="text"
                                className="cuadro-texto"
                                name="calidadPatas"
                                disabled={esVisualizar} //Se indica que el campo "Calidad de patas" no se puede modificar cuando se Visualiza.
                                value={animal.calidadPatas || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="contenedor-linea">
                            <div className="label">Calidad de ubres</div>
                            <input
                                type="text"
                                className="cuadro-texto"
                                name="calidadUbres"
                                disabled={esVisualizar} //Se indica que el campo "Calidad de ubres" no se puede modificar cuando se Visualiza.
                                value={animal.calidadUbres || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="contenedor-linea">
                            <div className="label">Grasa</div>
                            <input
                                type="text"
                                className="cuadro-texto"
                                name="grasa"
                                disabled={esVisualizar} //Se indica que el campo "Grasa" no se puede modificar cuando se Visualiza.
                                value={animal.grasa || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="contenedor-linea">
                            <div className="label">Proteínas</div>
                            <input
                                type="text"
                                className="cuadro-texto"
                                name="proteinas"
                                disabled={esVisualizar} //Se indica que el campo "Proteínas" no se puede modificar cuando se Visualiza.
                                value={animal.proteinas || ""}
                                onChange={handleChange}
                            />
                        </div>

                        {/*Si se ha añadido un comentario al animal cuando se ha eliminado,
                         aparece la información en color rojo
                         */}
                        <div>
                            {animal.comentario && (
                                <div style={{ color: 'red', marginTop: '10px' }}>
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
                            <NavLink to="/visualizar-toros" className="btn btn-info">CANCELAR</NavLink>

                        </div>


                    )}

                    {esVisualizar && (

                        <div className="boton-espacio">
                            <NavLink to="/visualizar-toros" className="btn btn-info">VISUALIZAR OTROS TOROS</NavLink>
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
