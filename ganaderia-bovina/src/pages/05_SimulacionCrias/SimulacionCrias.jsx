import {useContext, useState} from "react";
import {AnimalesContext} from "../../DataAnimales/DataVacaTerneros/AnimalesContext.jsx";
import {TorosContext} from "../../DataAnimales/DataToros/TorosContext.jsx";
import {NavLink} from "react-router-dom";
import "../../styles/SimulacionCrias.css";
import api from "../../api.js";
import {ComprobarCamposSimulacion} from "../../components/ComprobarCamposSimulacion.jsx";

export const SimulacionCrias = () => {
    const { animales } = useContext(AnimalesContext); // Lista de vacas/terneros
    const { animalesToros } = useContext(TorosContext); // Lista de toros

    //Se emplea para gestionar el mensaje de error que indica que hay campos obligatorios.
    const [errores, setErrores] = useState({});

    // Almacena los datos de la simulación
    const [datosSimulacion, setDatosSimulacion] = useState({
        idToro: "",
        atributo_prioridad: "celulas_somaticas",
    });

    const [resultadoSimulacion, setResultadoSimulacion] = useState(null);
    //Manejador para llevar acabo las modificaciones de los animales (actualizar el estado del animal)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setDatosSimulacion((prev) => ({ ...prev, [name]: value }));
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
        // setAnimalesSeleccionados((prev) =>
        //     prev.includes(id) ? prev.filter((animalId) => animalId !== id) : [...prev, id]
        // );
        const animal = animales.find((a) => a.id === id);
        if (!animal) return;
        setAnimalesSeleccionados((prev) =>
            prev.includes(animal.codigo)
                ? prev.filter((codigo) => codigo !== animal.codigo)
                : [...prev, animal.codigo]
        );
    };

    const validarFormulario = () => {
        const erroresTemp = ComprobarCamposSimulacion(datosSimulacion,animalesSeleccionados); // Revisa todos los campos
        setErrores(erroresTemp);

        console.log("Errores detectados:", erroresTemp);
        console.log("¿Formulario válido?", Object.keys(erroresTemp).length === 0);

        return Object.keys(erroresTemp).length === 0; // Retorna true si no hay errores
    };

    const handleSimular = async (e) => {

        e.preventDefault();
        if (!validarFormulario()) return; // Si hay errores, no continúa
        // 1. Se realiza la petición al backend.
        try {
            const response = await api.post("/simular-cria/", {
                id_vacas: animalesSeleccionados,
                id_toro: datosSimulacion.idToro,
                atributo_prioridad: datosSimulacion.atributo_prioridad,
            });
            console.log("✅ Simulación exitosa:", response.data);
            setResultadoSimulacion(response.data);

            // Aquí puedes mostrar el resultado al usuario (ej: en un modal o mensaje)
        }
        catch (error) {
            console.error("❌ Error al hacer la simulación:", error);
            console.log("💬 Respuesta del backend:", error.response?.data);
        }

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
                                            <option key={toro.id} value={toro.codigo}>
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
                    <button
                        type ="button"
                        className="btn btn-info boton-derecha"
                        onClick={handleSimular}
                    >
                        INICIAR SIMULACIÓN
                    </button>



                </>
                <>
                    {resultadoSimulacion && (
                        <div className="resultado-simulacion">
                            <h4>🐄 Resultado de la cría óptima:</h4>
                            <p><strong>Vaca:</strong> {resultadoSimulacion.id_vaca}</p>
                            <p><strong>Toro:</strong> {resultadoSimulacion.id_toro}</p>
                            <p><strong>Atributo optimizado:</strong> {datosSimulacion.atributo_prioridad.replace("_", " ")}</p>
                            <p><strong>Valor óptimo:</strong> {resultadoSimulacion.valor_prioridad.toFixed(2)}</p>

                            <h5>Características predichas de la cría:</h5>
                            <ul>
                                <li>Células somáticas: {Math.round(resultadoSimulacion.atributos.celulas_somaticas)}</li>
                                <li>Producción de leche: {resultadoSimulacion.atributos.produccion_leche.toFixed(2)}</li>
                                <li>Calidad de patas: {resultadoSimulacion.atributos.calidad_patas.toFixed(2)}</li>
                                <li>Calidad de ubres: {resultadoSimulacion.atributos.calidad_ubres.toFixed(2)}</li>
                                <li>Grasa: {resultadoSimulacion.atributos.grasa.toFixed(2)}</li>
                                <li>Proteínas: {resultadoSimulacion.atributos.proteinas.toFixed(2)}</li>
                            </ul>
                        </div>
                    )}
                </>
                {/* BOTÓN DE VOLVER AL MENÚ PRINCIPAL*/}
                <div className="boton-volver">
                    <NavLink to="/" className="btn btn-info">VOLVER AL MENÚ</NavLink>
                </div>
            </form>
        </>
    )
}