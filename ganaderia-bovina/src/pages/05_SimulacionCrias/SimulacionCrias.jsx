import {useContext, useState} from "react";
import {AnimalesContext} from "../../DataAnimales/DataVacaTerneros/AnimalesContext.jsx";
import {TorosContext} from "../../DataAnimales/DataToros/TorosContext.jsx";
import {NavLink} from "react-router-dom";
import "../../styles/SimulacionCrias.css";
export const SimulacionCrias = () => {
    const { animales } = useContext(AnimalesContext); // Lista de vacas/terneros
    const { animalesToros } = useContext(TorosContext); // Lista de toros

    //Se emplea para gestionar el mensaje de error que indica que hay campos obligatorios.
    const [errores, setErrores] = useState({});

    //Manejador para llevar acabo las modificaciones de los animales (actualizar el estado del animal)
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Se elimina el error (error + mensaje de error) cuando el usuario seleccione una opción válida en el campo correspondiente.
        setErrores((prevErrores) => ({
            ...prevErrores,
            [name]: value ? "" : prevErrores[name], // Si hay un valor en el campo, borra el error (error + mensaje de error)
        }));
    };

    //Se emplea para seleccionar los animales que se van añadir al corral.
    //Parte de los animales que ya están en el corral o si no hay ningún animal, coge una lista vacia.
    const [animalesSeleccionados, setAnimalesSeleccionados] = useState(animales.listaAnimales || []);

    //Para hacer el check-box de animales.
    const toggleSeleccionAnimal = (id) => {
        setAnimalesSeleccionados((prev) =>
            prev.includes(id) ? prev.filter((animalId) => animalId !== id) : [...prev, id]
        );
    };
    return (
        <>
            <div className="contenedor">
                <div className="cuadradoVisualizarAgregarModificar">
                    SIMULACIÓN CRÍAS
                </div>
            </div>
            <hr/> {/*Añade una línea/raya */}

            <form>
                {/*onSubmit={handleSubmit}*/}
                <div className="contenedor-flex">
                    <div className="contenedor-izquierda">
                        <div className="contenedor-linea">
                            <div className="label">Identificador vaca</div>
                            <div className="lista-animales">
                               {animales && animales.length > 0 ? (
                                   animales.filter((animal) => animal.tipo.toUpperCase() === "Vaca".toUpperCase()
                                           && animal.estado.toUpperCase() !== "Muerte".toUpperCase()
                                           && animal.estado.toUpperCase() !== "Vendida".toUpperCase()
                                       )
                                    .map((animal) => (
                                    <label key={animal.id} className="item-animal">
                                        <input
                                            type="checkbox"
                                            name="listaAnimales"
                                            checked={animalesSeleccionados.includes(animal.id)}
                                            onChange={() => toggleSeleccionAnimal(animal.id)}
                                        />
                                        {/*Aparece el ID de la vaca/ternero y el CORRAL donde se encuentra*/}
                                        {animal.codigo}
                                    </label>
                                ))
                                    ) : (
                                    <div className="mensaje-no-animales">No hay vacas disponibles</div>
                                    )
                               }
                            </div>
                            {errores.listaAnimales && <div className="mensaje-error">{errores.listaAnimales}
                            </div>}

                        </div>
                    </div>

                    <div className="contenedor-derecha">
                        <div className="contenedor-linea">
                            <div className="label">Identificador toro</div>
                            <select
                                className={`form-select ${errores.toro ? "error" : ""}`}
                                name="idToro"
                                onChange={handleChange}
                            >
                                <option value="">Identificador toro</option>
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
                                                {toro.codigo}
                                            </option>
                                        ))
                                ) : (
                                    <option>No hay toros disponibles</option>
                                )
                                }
                            </select>
                            {errores.toro && <div className="mensaje-error">{errores.toro}</div>}
                        </div>

                        {/* Se añade desplegable para seleccionar el atributo que se desea optimizar*/}
                        <div className="contenedor-linea">
                            <div className="label">Característica a optimizar</div>
                            <select
                                className={`form-select ${errores.toro ? "error" : ""}`}
                                name="atributo_prioridad"
                                onChange={handleChange}
                            >
                                <option value="celulas_somaticas">Células somáticas</option>
                                <option value="produccion_leche">Producción leche</option>
                                <option value="calidad_patas">Calidad patas</option>
                                <option value="calidad_ubres">Calidad ubres</option>
                                <option value="grasa">Grasa</option>
                                <option value="proteinas">Proteinas</option>
                            </select>
                            {errores.toro && <div className="mensaje-error">{errores.toro}</div>}
                        </div>
                    </div>
                </div>


                {/* BOTÓN DE INICIAR SIMULACIÓN */}
                <>
                    <button className="btn btn-info boton-derecha">
                        INICIAR SIMULACIÓN
                    </button>
                </>

                {/* BOTÓN DE VOLVER AL MENÚ PRINCIPAL*/}
                <div className="boton-volver">
                    <NavLink to="/" className="btn btn-info">VOLVER AL MENÚ</NavLink>
                </div>
            </form>
        </>
    )
}