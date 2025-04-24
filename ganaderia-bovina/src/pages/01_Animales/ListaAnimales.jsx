/*
* ------------------------------------------ ListaAnimales.jsx: ------------------------------------------
* Funcionalidad: Muestra el listado de animales existente, pudiendo acceder a la información de cada uno de
* los animales (vacas y terneros), modificarlos o eliminarlos. Además, se pueden agregar nuevos animales (vacas y terneros).
* Por otra parte, se puede realizar un filtrado de los mismos: (tipo y/o identificador)
* --------------------------------------------------------------------------------------------------------
* */

import "../../styles/ListaAnimales.css";
import {useState, useContext, useEffect} from "react";
import {NavLink} from "react-router-dom";
import {AnimalesContext} from "../../DataAnimales/DataVacaTerneros/AnimalesContext.jsx";

export const ListaAnimales = () => {


    /* Obtener datos mocks para probar las funcionalidades CRUD de ListaAnimales.
       Para ello se emplea useContext (se accede al contexto) ----> Se utiliza AnimalesContext
       */
    const {animales} = useContext(AnimalesContext);
    //, eliminarAnimal
    //Creación de busquedaID y tipoSeleccionado para realizar un filtrado en la tabla de animales.
    const [busquedaID, setBusquedaID] = useState(""); //Busqueda por ID en la lista de animales.
    const [tipoSeleccionado, setTipoSeleccionado] = useState("Sin filtro"); //Busqueda por TIPO en la lista de animales.
    const [animalesFiltrados, setAnimalesFiltrados] = useState(animales); // Estado para almacenar los animales filtrados


    //Realización del filtrado por ID y por TIPO
    // const datosFiltrados = animales.filter((item) => {
    //     const coincideBusqueda =
    //         /*Se ignoran las mayúsculas y minúsculas, ya que tanto el ID que introduce el usuario como el almacenado
    //         se convierten a mayúsculas (toUpperCase)*/
    //         busquedaID === "" || item.id.toString().toUpperCase().includes(busquedaID.toUpperCase()); // Búsqueda por ID
    //     const coincideTipo =
    //         tipoSeleccionado === "Sin filtro" || item.tipo === tipoSeleccionado; // Búsqueda por TIPO
    //     return coincideBusqueda && coincideTipo;
    // });

    // Realización del filtrado por ID y por TIPO
    useEffect(() => {
        // Filtrar animales cada vez que cambien los filtros de búsqueda
        const datosFiltrados = animales.filter((item) => {
            const coincideBusqueda =
                /*Se ignoran las mayúsculas y minúsculas, ya que tanto el CÓDIGO que introduce el usuario como el almacenado
                 se convierten a mayúsculas (toUpperCase)*/
                busquedaID === "" || item.codigo.toString().toUpperCase().includes(busquedaID.toUpperCase());
            const coincideTipo = tipoSeleccionado === "Sin filtro" || item.tipo === tipoSeleccionado;
            return coincideBusqueda && coincideTipo;
        });

        // Se actualiza el estado de los animales filtrados (vacas/terneros)
        setAnimalesFiltrados(datosFiltrados);
    }, [busquedaID, tipoSeleccionado, animales]); // Tiene como dependencia cada uno de los filtros (ID y TIPO) y los animales

    //Manejadores de las búsquedas realizadas por ID y por TIPO para encontrar al animal (vaca/ternero)
    const manejarBusquedaID = (e) => {
        setBusquedaID(e.target.value);
    };
    const manejarTipoSeleccionado = (e) => {
        setTipoSeleccionado(e.target.value);
    };


    return (
        <>
            <div className="contenedor">
                <div className="cuadradoVisualizarLista">VISUALIZAR LISTA DE ANIMALES</div>
                {/*<NavLink to="/agregar-animal" className="btn btn-info boton-derecha">AÑADIR ANIMAL</NavLink>*/}

                {/* Botón para AGREGAR un nuevo animal (vaca/ternero)*/}
                <NavLink
                    to="/formulario-animal"
                    state={{modo: "agregar"}} // Se pasa el estado "Agregar"
                    className="btn btn-info boton-derecha"
                >
                    AÑADIR ANIMAL
                </NavLink>
            </div>

            <hr/>
            {/*Añade una línea/raya */}


            {/*Con el contenedor-filtro-tipo consigo que esté el texto y el campo para escribir en la misma línea*/}
            <div className="contenedor-filtro-tipo">
                <div className="contenedor-linea">
                    <label htmlFor="filtroIDAnimal">Filtrar animal (ID):</label>
                    <input
                        type="text"
                        id="filtroIDAnimal" //Obligatoriamente debe coincidir con htmlFor
                        name="filtroIDAnimal"
                        className="cuadro-texto"
                        placeholder=""
                        value={busquedaID} //Maneja el valor que tiene el ID seleccionado
                        onChange={manejarBusquedaID}
                    />
                </div>

                <div className="contenedor-linea">
                    <label htmlFor="filtroTipoAnimal">Filtrar por tipo:</label>
                    <select
                        className="form-select"
                        id="filtroTipoAnimal" //Obligatoriamente debe coincidir con htmlFor
                        name="filtroTipoAnimal"
                        aria-label="Default select example"
                        value={tipoSeleccionado} // Maneja el valor que tiene el tipoSeleccionado
                        onChange={manejarTipoSeleccionado}
                    >
                        <option value="Sin filtro">Sin filtro</option>
                        <option value="Vaca">Vaca</option>
                        <option value="Ternero">Ternero</option>
                    </select>
                </div>
            </div>
            {/* Botones que aparecen al lado de cada uno de los animales: VER - MODIFICAR - ELIMINAR*/}
            <div className="listaAnimales">Lista de animales:</div>

            <div className="contenedor-tablaLA">

                <table className="table">
                    <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">TIPO</th>
                        <th scope="col">NOMBRE</th>
                        <th scope="col">ACCIONES</th>
                    </tr>
                    </thead>
                    <tbody>
                    {/* Cada fila consta de un identificador único, en este caso es el ID del animal (vaca/ternero)*/}
                    { /* Si la tabla no contiene ningún elemento, aparece un mensaje indicando que no hay elementos disponibles*/
                        animalesFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="mensaje-no-hay-elementos">
                                    No hay animales existentes
                                </td>
                            </tr>
                        ) : (
                        animalesFiltrados.map((item) => (
                        <tr key={item.id}>
                            <td>{item.codigo}</td>
                            <td>{item.tipo}</td>
                            <td>{item.nombre}</td>
                            <td>
                                {/* BOTÓN VER */}
                                {/*<NavLink*/}
                                {/*    to="/formulario-animal"*/}
                                {/*    state={{modo: "ver", animal: item}} //Se le pasa el modo (ver) y ANIMAL (item)*/}
                                {/*    className="btn-ver"*/}
                                {/*>*/}
                                {/*    VER*/}
                                {/*</NavLink>*/}
                                <NavLink
                                    to={`/formulario-animal/${item.id}`}
                                    state={{modo: "ver", animal: item}}
                                    className="btn-ver"
                                >
                                    VER
                                </NavLink>
                                {/*Si el animal ha sido eliminado (estado = "Muerte" o "Vendida")*, NO se muestran
                                 los botones MODIFICAR y ELIMINAR */}
                                {item.estado !== "Muerte" && item.estado !== "Vendida" && (
                                    <>
                                        {/* BOTÓN MODIFICAR */}
                                        {/*<NavLink*/}
                                        {/*    to="/formulario-animal"*/}
                                        {/*    state={{modo: "modificar", animal: item}} //Se le pasa el modo (modificar) y ANIMAL (item)*/}
                                        {/*    className="btn-modificar"*/}
                                        {/*>*/}
                                        {/*    MODIFICAR*/}
                                        {/*</NavLink>*/}
                                        <NavLink
                                            to={`/formulario-animal/${item.id}`}
                                            state={{modo: "modificar", animal: item}}
                                            className="btn-modificar"
                                        >
                                            MODIFICAR
                                        </NavLink>

                                        {/* BOTÓN ELIMINAR */}
                                        <NavLink
                                            to="/eliminar-animal"
                                            state={{animal: item}} //Se le pasa el ANIMAL (item)
                                            className="btn-eliminar"
                                            // onClick={ () => manejarEliminar(item.id)
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
