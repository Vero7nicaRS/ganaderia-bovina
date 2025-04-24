/*
* ------------------------------------------ ListaToros.jsx: ------------------------------------------
* Funcionalidad: Muestra el listado de toros existente, pudiendo acceder a la información de cada uno de
* los toros, modificarlos o eliminarlos. Además, se pueden agregar nuevos toros.
* Por otra parte, se puede realizar un filtrado de los mismos según su identificador.
* --------------------------------------------------------------------------------------------------------
* */


import "../../styles/ListaToros.css";
import {NavLink} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import {TorosContext} from "../../DataAnimales/DataToros/TorosContext.jsx";

export const ListaToros = () => {

    const {animalesToros} = useContext(TorosContext);
    const [busquedaID, setBusquedaID] = useState(""); //Busqueda por ID en la lista de toros.
    const [animalesTorosFiltrados, setAnimalesTorosFiltrados] = useState(animalesToros); //Para almacenar los animales que han sido filtrados.

    //Realización del filtrado por ID
    // const datosFiltrados = animalesToros.filter((item) => {
    //     const coincideBusqueda =
    //         /*Se ignoran las mayúsculas y minúsculas, ya que tanto el ID que introduce el usuario como el almacenado
    //         se convierten a mayúsculas (toUpperCase)*/
    //         busquedaID === "" || item.id.toString().toUpperCase().includes(busquedaID.toUpperCase()); // Búsqueda por ID
    //     return coincideBusqueda ;
    // });
    useEffect(() => {
        const datosFiltrados = animalesToros.filter((item) => {
            const coincideBusqueda =
                /*Se ignoran las mayúsculas y minúsculas, ya que tanto el CÓDIGO que introduce el usuario como el almacenado
                se convierten a mayúsculas (toUpperCase)*/
                busquedaID === "" || item.codigo.toString().toUpperCase().includes(busquedaID.toUpperCase()); // Búsqueda por ID
            return coincideBusqueda ;
        });
        // Actualizar el estado de los animales filtrados
        setAnimalesTorosFiltrados(datosFiltrados);
    }, [busquedaID, animalesToros]);

    //Manejadores de las búsquedas realizadas por ID para encontrar al animal (toro)
    const manejarBusquedaID = (e) => {
        setBusquedaID(e.target.value);
    };

    return (
        <>
            <div className="contenedor">
                <div className="cuadradoVisualizarListaToros">VISUALIZAR LISTA DE TOROS</div>
                {/*<NavLink to="/agregar-animal" className="btn btn-info boton-derecha">AÑADIR ANIMAL</NavLink>*/}

                {/* Botón para AGREGAR un nuevo animal (vaca/ternero)*/}
                <NavLink
                    to="/formulario-toro"
                    state={{modo: "agregar"}} // Se pasa el estado "Agregar"
                    className="btn btn-info boton-derecha"
                >
                    AÑADIR TORO
                </NavLink>
            </div>
            <hr/>
            {/*Añade una línea/raya */}
            <div className="contenedor-filtro-tipoToro">
                <div className="contenedor-lineaToro">
                    <label htmlFor="filtroIDToro">Filtrar toro (ID):</label>
                    <input
                        id="filtroIDToro" //Obligatoriamente debe coincidir con htmlFor
                        name="filtroIDToro"
                        type="text"
                        className="cuadro-texto"
                        placeholder=""
                        value={busquedaID} //Maneja el valor que tiene el ID seleccionado
                        onChange={manejarBusquedaID}
                    />
                </div>
            </div>
                <div className="listaToros">Lista de toros:</div>

                <div className="contenedor-tablaLT">
                    <table className="table">
                        <thead>
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">NOMBRE</th>
                            <th scope="col">ACCIONES</th>
                        </tr>
                        </thead>
                        <tbody>
                        {/* Botones que aparecen al lado de cada uno de los toros: VER - MODIFICAR - ELIMINAR*/}
                        {
                            animalesTorosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="mensaje-no-hay-elementos">
                                        No hay toros existentes
                                    </td>
                                </tr>
                            ) : (
                            animalesTorosFiltrados.map((item) => (
                            <tr key={item.id}>
                                <td>{item.codigo}</td>
                                <td>{item.nombre}</td>

                                <td>
                                    {/* BOTÓN VER */}
                                    <NavLink
                                        to={`/formulario-toro/${item.id}`}
                                        state={{modo: "ver", animalToro: item}} //Se le pasa el ANIMAL (item)
                                        className="btn-ver">
                                        VER
                                    </NavLink>

                                    {/*Si el animal (toro) ha sido eliminado (estado = "Muerte")*, NO se muestran
                                los botones MODIFICAR y ELIMINAR */}

                                    {item.estado !== "Muerte" && item.estado !== "Otros"  && (
                                        <>
                                            {/* BOTÓN MODIFICAR */}
                                            <NavLink
                                                to={`/formulario-toro/${item.id}`}
                                                state={{modo: "modificar", animalToro: item}} //Se le pasa el MODO (modificar) y el ANIMAL (item)
                                                className="btn-modificar"
                                            >
                                                MODIFICAR
                                            </NavLink>

                                            {/* BOTÓN ELIMINAR */}
                                            <NavLink
                                                to="/eliminar-toro"
                                                state={{animalToro: item}} //Se le pasa el ANIMAL (item).
                                                className="btn-eliminar"

                                            >
                                                ELIMINAR
                                            </NavLink>
                                        </>

                                    )}


                                </td>
                            </tr>
                            ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* BOTÓN DE VOLVER AL MENÚ PRINCIPAL*/}
                <div className="boton-volver">
                    <NavLink to="/" className="btn btn-info">
                        VOLVER AL MENÚ
                    </NavLink>
                </div>
            </>
    );
};