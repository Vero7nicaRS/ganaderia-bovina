import "../../styles/FormularioAnimal.css";
import {NavLink, useLocation, useNavigate} from "react-router-dom";
import {useContext, useState} from "react";
import {AnimalesContext} from "../../DataAnimales/AnimalesContext.jsx";

//import "../01_Animales/ListaAnimales.jsx"
//export const FormularioAnimal = ({ modo, animal: animalInicial, onSubmit }) => {
export const FormularioAnimal = () => {

    //Se utiliza "location" para acceder a los datos (state) que han sido transmitidos mediante el NavLink (modo y animal)
    const location = useLocation();

    //Hook para navegar
    const navigate = useNavigate();


    const { modo, animal: animalInicial } = location.state || { tipo: "Vaca", estado:"Vacía", corral: "1 - Vacas"}; // Se recupera el modo y animal desde el state

    /* Se inicializa el animal con los datos del state.
       En caso de que el formulario este vacio, se inicializa con unos valores por defecto */
    const [animal, setAnimal] = useState(animalInicial || {
        tipo: "Vaca",
        estado: "Vacía",
        nombre: "",
        fechaNacimiento: "",
        padre: "",
        madre: "",
        corral: "1",
        celulasSomaticas: "",
        calidadPatas: "",
        calidadUbres: "",
        grasa: "",
        proteinas: ""
    });


    /* Se obtiene las funciones: agregarAnimal y modificarAnimal para hacer CU (agregar y modificar).
       Para ello se emplea useContext (se accede al contexto) ----> Se utiliza AnimalesContext
       */
    const {agregarAnimal, modificarAnimal} = useContext(AnimalesContext)

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


    /* ----------------------- MANEJADOR ANIMALESCONTEXT: AGREGAR, AGREGAR Y SEGUIR, Y MODIFICAR ----------------------- */

    //Para llevar acabo las acciones de AGREGAR y MODIFICAR un animal.
    const handleAgregar = (e) => {
        console.log(animal); // Verifica el estado de animal antes de validar

        e.preventDefault();

        if(esAgregar){
            console.log("Se ha añadido el animal");
            agregarAnimal(animal); // Llamada a la función agregar de AnimalesContext: Se añade el nuevo animal (vaca/ternero)

        }else if (esModificar){
            console.log("Se ha modificado el animal");
            modificarAnimal(animal); // Llamada a la función modificar de AnimalesContext: Se modifica el animal existente (vaca/ternero)
        }

        /* Una vez que se haya agregado un nuevo animal o se modifique un animal existente,
         el usuario es redirigido a la página de "visualizar-animales".
         */
        navigate("/visualizar-animales");
    };

    //Para llevar acabo las acciones de AGREGAR Y SEGUIR AÑADIENDO un animal.
    //Le permite al usuario añadir un animal y continuar con el formulario vacio para añadir nuevos animales.
    const handleAceptarYSeguir = (e) => {
        console.log(animal); // Verifica el estado de animal antes de validar
        e.preventDefault();
        if(esAgregar){
            console.log("Se ha añadido el animal y se continua añadiendo nuevos animales");
            agregarAnimal(animal); // Llamada a la función agregar de AnimalesContext: Se añade el nuevo animal (vaca/ternero)
            setAnimal({}); //Se pone el formulario a vacio, al introducir el campo con un valor vacío.
        }

    }

    /* ----------------------- FIN MANEJADOR ANIMALESCONTEXT: AGREGAR, AGREGAR Y SEGUIR, Y MODIFICAR  -----------------------*/

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
                            <div className="label">Tipo</div>
                            <select
                                className="form-select"
                                name="tipo"
                                disabled={esVisualizar}
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
                                disabled={esVisualizar}
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
                                className="cuadro-texto"
                                name="nombre"
                                disabled={esVisualizar}
                                value={animal.nombre || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="contenedor-linea">
                            <div className="label">Fecha de nacimiento</div>
                            <input
                                type="date"
                                className="cuadro-texto"
                                name="fechaNacimiento"
                                disabled={esVisualizar}
                                value={animal.fechaNacimiento || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="contenedor-linea">
                            <div className="label">Identificador padre</div>
                            <input
                                type="text"
                                className="cuadro-texto"
                                name="padre"
                                disabled={esVisualizar}
                                value={animal.padre || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="contenedor-linea">
                            <div className="label">Identificador madre</div>
                            <input
                                type="text"
                                className="cuadro-texto"
                                name="madre"
                                disabled={esVisualizar}
                                value={animal.madre || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="contenedor-linea">
                            <div className="label">Corral:</div>
                            <select
                                className="form-select"
                                name="corral"
                                disabled={esVisualizar}
                                value={animal.corral || "1"}
                                onChange={handleChange}
                            >
                                <option value="0">0 - Crías</option>
                                <option value="1">1 - Vacas</option>
                                <option value="2">2 - Vacas</option>
                                <option value="3">3 - Secar</option>
                                <option value="4">4 - Enfermería</option>
                                {/*<option value="5" disabled>Ninguno</option>*/}
                                {/* Opción oculta pero mostrada si ya estaba asignada */}
                                {["Ninguno"].includes(animal.corral) && (
                                    <option value={animal.corral}>{animal.corral}</option>
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="contenedor-derecha">
                        <div className="contenedor-linea">
                            <div className="label">Células somáticas</div>
                            <input
                                type="text"
                                className="cuadro-texto"
                                name="celulasSomaticas"
                                disabled={esVisualizar}
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
                                disabled={esVisualizar}
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
                                disabled={esVisualizar}
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
                                disabled={esVisualizar}
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
                                disabled={esVisualizar}
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
                            <NavLink to="/visualizar-animales" className="btn btn-info">CANCELAR</NavLink>

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
