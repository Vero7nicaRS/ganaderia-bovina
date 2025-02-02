/*
* ------------------------------------------ ListaAnimales.jsx: ------------------------------------------
* Funcionalidad: Muestra el listado de animales existente, pudiendo acceder a la información de cada uno de
* los animales (vacas y terneros), modificarlos o eliminarlos. Además, se pueden agregar nuevos animales (vacas y terneros).
* Por otra parte, se puede realizar un filtrado de los mismos: (tipo y/o identificador)
* --------------------------------------------------------------------------------------------------------
* */


import "../../styles/ListaAnimales.css";
import { useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import { AnimalesContext } from "../../DataAnimales/DataVacaTerneros/AnimalesContext.jsx";

export const ListaAnimales = () => {


    /* Obtener datos mocks para probar las funcionalidades CRUD de ListaAnimales.
       Para ello se emplea useContext (se accede al contexto) ----> Se utiliza AnimalesContext
       */
    const {animales} = useContext(AnimalesContext);
    //, eliminarAnimal
    //Creación de busquedaID y tipoSeleccionado para realizar un filtrado en la tabla de animales.
    const [busquedaID, setBusquedaID] = useState(""); //Busqueda por ID en la lista de animales.
    const [tipoSeleccionado, setTipoSeleccionado] = useState("Sin filtro"); //Busqueda por TIPO en la lista de animales.


    //Realización del filtrado por ID y por TIPO
    const datosFiltrados = animales.filter((item) => {
        const coincideBusqueda =
            /*Se ignoran las mayúsculas y minúsculas, ya que tanto el ID que introduce el usuario como el almacenado
            se convierten a mayúsculas (toUpperCase)*/
            busquedaID === "" || item.id.toString().toUpperCase().includes(busquedaID.toUpperCase()); // Búsqueda por ID
        const coincideTipo =
            tipoSeleccionado === "Sin filtro" || item.tipo === tipoSeleccionado; // Búsqueda por TIPO
        return coincideBusqueda && coincideTipo;
    });

    //Manejadores de las búsquedas realizadas por ID y por TIPO para encontrar al animal (vaca/ternero)
    const manejarBusquedaID = (e) => {
        setBusquedaID(e.target.value);
    };
    const manejarTipoSeleccionado = (e) => {
        setTipoSeleccionado(e.target.value);
    };


    /* ----------------------- MANEJADOR ANIMALESCONTEXT: ELIMINAR -----------------------*/
    // Manejadores de eliminar, modificar y agregar un nuevo animal (ternero/vaca)
    // const manejarEliminar = (id) => {
    //     if (window.confirm("¿Estás seguro de eliminar este animal?")) {
    //         eliminarAnimal(id); // Llamada a la función eliminar de AnimalesContext: Se elimina el animal existente (vaca/ternero)
    //         console.log("Se ha eliminado el animal");
    //     }
    // };

    /* ----------------------- FIN MANEJADOR ANIMALESCONTEXT: ELIMINAR -----------------------*/
    return (
        <>
            <div className="contenedor">
                <div className="cuadradoVisualizarLista">VISUALIZAR LISTA DE ANIMALES</div>
                {/*<NavLink to="/agregar-animal" className="btn btn-info boton-derecha">AÑADIR ANIMAL</NavLink>*/}

                {/* Botón para AGREGAR un nuevo animal (vaca/ternero)*/}
                <NavLink
                    to="/formulario-animal"
                    state={{ modo: "agregar" }} // Se pasa el estado "Agregar"
                    className="btn btn-info boton-derecha"
                >
                    AÑADIR ANIMAL
                </NavLink>
            </div>

            <hr /> {/*Añade una línea/raya */}


            {/*Con el contenedor-filtro-tipo consigo que esté el texto y el campo para escribir en la misma línea*/}
            <div className="contenedor-filtro-tipo">
                <div className="contenedor-linea">
                    <label>Filtrar animal (ID):</label>
                    <input
                        type="text"
                        className="cuadro-texto"
                        placeholder=""
                        value={busquedaID} //Maneja el valor que tiene el ID seleccionado
                        onChange={manejarBusquedaID}
                    />
                </div>

                <div className="contenedor-linea">
                    <label>Filtrar por tipo:</label>
                    <select
                        className="form-select"
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

            <div className="listaAnimales">Lista de animales:</div>
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

                {/* Botones que aparecen al lado de cada uno de los animales: VER - MODIFICAR - ELIMINAR*/}
                {datosFiltrados.map((item) => (
                    <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.tipo}</td>
                        <td>{item.nombre}</td>

                        <td>
                            {/* BOTÓN VER */}
                            <NavLink
                                to="/formulario-animal"
                                state={{modo: "ver", animal: item}} //Se le pasa el ANIMAL (item)
                                className="btn-ver">
                                VER
                            </NavLink>

                            {/*Si el animal ha sido eliminado (estado = "Muerte" o "Vendida")*, NO se muestran
                            los botones MODIFICAR y ELIMINAR */}

                            {item.estado !== "Muerte" && item.estado !== "Vendida" && (
                                <>
                                    {/* BOTÓN MODIFICAR */}
                                    <NavLink
                                        to="/formulario-animal"
                                        state={{modo: "modificar", animal: item}} //Se le pasa el MODO (modificar) y el ANIMAL (item)
                                        className="btn-modificar"
                                    >
                                        MODIFICAR
                                    </NavLink>
                                    {/*<button*/}
                                    {/*    className="btn-eliminar"*/}
                                    {/*     onClick={ () => manejarEliminar(item.id)}*/}
                                    {/*>*/}
                                    {/*    ELIMINAR*/}
                                    {/*</button>*/}

                                    {/* BOTÓN ELIMINAR */}

                                    <NavLink
                                        to="/eliminar-animal"
                                        state={{animal: item}} //Se le pasa el ANIMAL (item)
                                        className="btn-eliminar"
                                        // onClick={ () => manejarEliminar(item.id)}
                                    >
                                        ELIMINAR
                                    </NavLink>
                                </>

                            )}


                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* BOTÓN DE VOLVER AL MENÚ PRINCIPAL*/}
            <div className="boton-volver">
                <NavLink to="/" className="btn btn-info">
                    VOLVER AL MENÚ
                </NavLink>
            </div>
        </>
    );
};

// import "../../styles/ListaAnimales.css"
// import {useContext, useState} from "react";
// import {NavLink} from "react-router-dom";
// import {AnimalesContext} from "../../DataAnimales/AnimalesContext.jsx";
// export const ListaAnimales = () => {
//
//
//     //Creación de busquedaID y tipoSeleccionado para realizar un filtrado en la tabla de animales.
//     const [busquedaID, setBusquedaID] = useState(""); //ID
//     const [tipoSeleccionado, setTipoSeleccionado] = useState("Sin filtro"); //TIPO
//
//     // const datos = [
//     //     { id: 1, nombre: "Ana", tipo: "Vaca" },
//     //     { id: 2, nombre: "Lolito", tipo: "Ternero" },
//     //     { id: 3, nombre: "Pepa", tipo: "Vaca" },
//     // ];
//
//     const {datos} = useContext(AnimalesContext);
//     //Realización del filtrado por ID y por TIPO
//     // const datosFiltrados = datos.filter((item) => {
//     //     const coincideBusqueda =
//     //         busquedaID === "" || item.id.toString().includes(busquedaID);  //Busqueda por ID en la lista de animales.
//     //     const coincideTipo =
//     //         tipoSeleccionado === "Sin filtro" || item.tipo === tipoSeleccionado; //Busqueda por TIPO en la lista de animales.
//     //     return coincideBusqueda && coincideTipo;
//     // });
//
//     const datosFiltrados = animales.filter((item) => {
//         const coincideBusqueda =
//             busquedaID === "" || item.id.toString().includes(busquedaID); // Búsqueda por ID
//         const coincideTipo =
//             tipoSeleccionado === "Sin filtro" || item.tipo === tipoSeleccionado; // Búsqueda por tipo
//         return coincideBusqueda && coincideTipo;
//     });
//     //Manejador de las búsquedas realizadas por ID y por TIPO
//     const manejarBusquedaID = (e) => {
//         setBusquedaID(e.target.value);
//     };
//     const manejarTipoSeleccionado = (e) => {
//         setTipoSeleccionado(e.target.value);
//     }
//
//     return (
//
//         <>
//
//             <div className="contenedor">
//                 <div className="cuadradoVisualizar">VISUALIZAR LISTA ANIMALES</div>
//                 {/*<NavLink to="/agregar-animal" className="btn btn-info boton-derecha">AÑADIR ANIMAL</NavLink>*/}
//                 <NavLink
//                 to = "/formulario-animal"
//                 state = {{modo: "agregar"}} //Se pasa el estado "Agregar"
//                 className="btn btn-info boton-derecha"
//                 >AÑADIR ANIMAL</NavLink>
//             </div>
//
//
//             <hr/>
//             {/*Añade una línea/raya */}
//
//
//             <div className="contenedor-filtro-tipo">
//
//                 <div className="contenedor-linea">
//                     <label>Filtrar animal (ID):</label>
//
//                     <input
//                         type="text"
//                         className="cuadro-texto"
//                         placeholder=""
//                         value={busquedaID} //Maneja el valor que tiene el ID seleccionado
//                         onChange={manejarBusquedaID}
//                     />
//                 </div>
//
//
//                 {/*Con el contenedor-filtro-tipo consigo que esté el texto y el campo para escribir en la misma línea*/}
//                 <div className="contenedor-linea">
//                     <label>Filtrar por tipo:</label>
//                     <select
//                         className="form-select"
//                         aria-label="Default select example"
//                         value={tipoSeleccionado} //Maneja el valor que tiene el tipoSeleccionado
//                         onChange={manejarTipoSeleccionado}
//                     >
//                         <option value="Sin filtro">Sin filtro</option>
//                         <option value="Vaca">Vaca</option>
//                         <option value="Ternero">Ternero</option>
//                     </select>
//                 </div>
//             </div>
//
//             <div className="listaAnimales">Lista de animales:</div>
//             <table className="table">
//                 <thead>
//                 <tr>
//                     <th scope="col">ID</th>
//                     <th scope="col">TIPO</th>
//                     <th scope="col">NOMBRE</th>
//                     <th scope="col">ACCIONES</th>
//                 </tr>
//                 </thead>
//                 <tbody>
//                 {datosFiltrados.map((item) => (
//                     <tr key={item.id}>
//                         <td>{item.id}</td>
//                         <td>{item.nombre}</td>
//                         <td>{item.tipo}</td>
//                         <td>
//                             <button className="btn-ver">VER</button>
//                             <button className="btn-modificar">MODIFICAR</button>
//                             <button className="btn-eliminar">ELIMINAR</button>
//                         </td>
//                     </tr>
//                 ))}
//
//                 </tbody>
//             </table>
//
//             <div className="boton-volver">
//                 <NavLink to="/" className="btn btn-info">VOLVER AL MENÚ</NavLink>
//             </div>
//
//
//         </>
//
//     );
// };