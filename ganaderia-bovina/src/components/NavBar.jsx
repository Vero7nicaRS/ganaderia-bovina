import {NavLink} from "react-router-dom"
import {useAuthContext} from "../authentication/AuthContext.jsx";
import "../styles/NavBar.css";

export const NavBar = () => {
    const { rol, logout } = useAuthContext(); // Controlar lo que ven del NavBar según el rol de usuario.

    return (

        <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid">

                {/* Enlace a la página "Home" */}
                <NavLink to='/' className="navbar-brand" href="#">Home</NavLink> {/* El origen de la página es el HOME "/" */}
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                        aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item dropdown">
                            {/* Desplegable de la sección "Animales" */}
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                               aria-expanded="false">
                                Animales
                            </a>
                            <ul className="dropdown-menu">
                                {/* Enlace a la página "Visualizar animales" */}
                                <li><NavLink to='/visualizar-animales' className="dropdown-item">
                                    Visualizar animales</NavLink>
                                </li>
                                {/* Solo el rol de ADMINISTRADOR puede AGREGAR un animal */}
                                {rol === "Administrador" && (
                                    <>
                                        <li>
                                            <hr className="dropdown-divider"/>
                                        </li>
                                        {/* Enlace a la página "Agregar animal" */}
                                        <li>
                                            <NavLink to="/formulario-animal"
                                                     state={{modo: "agregar"}}
                                                     className="dropdown-item">
                                                Agregar animal
                                            </NavLink>
                                        </li>
                                    </>
                                )}
                                <li>
                                    <hr className="dropdown-divider"/>
                                </li>
                                {/* Enlace a la página "ÁRBOL GENEALÓGICO" */}
                                <li><NavLink to='/arbol-genealogico' className="dropdown-item">Árbol genealógico
                                </NavLink>
                                </li>

                            </ul>
                        </li>

                        <li className="nav-item dropdown">
                            {/* Desplegable de la sección "Vacunas/Tratamientos" */}
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                               aria-expanded="false">
                                Vacunaciones/Tratamientos
                            </a>
                            <ul className="dropdown-menu">
                                {/* Enlace a la página "Visualizar animales" */}
                                <li>
                                    <NavLink to='/inventario-vt' className="dropdown-item">
                                        Inventario
                                    </NavLink>
                                </li>
                                {/* Solo el rol de ADMINISTRADOR puede AGREGAR un nuevo tipo de vacuna/tratamiento
                                    al inventario */}
                                {rol === "Administrador" && (
                                    <>
                                        <li>
                                            <hr className="dropdown-divider"/>
                                        </li>
                                        {/* Enlace a la página "Agregar nuevo tipo" */}
                                        <li>
                                            <NavLink to='/formulario-vt' state={{modo: "agregar"}}
                                                     className="dropdown-item">
                                                Agregar nuevo tipo
                                            </NavLink>
                                        </li>
                                    </>
                                )}
                                <li>
                                    <hr className="dropdown-divider"/>
                                </li>
                                {/* Enlace a la página "Listado de animales" */}
                                <li>
                                    <NavLink to='/listado-vt-animal' className="dropdown-item">Listado de
                                        animales</NavLink>
                                </li>
                                {/* Solo el rol de ADMINISTRADOR puede AGREGAR una vacuna/tratamiento a un animal */}
                                {rol === "Administrador" && (
                                    <>
                                        <li>
                                            <hr className="dropdown-divider"/>
                                        </li>
                                        {/* Enlace a la página "Insertar tipo al animal" */}
                                        <li>
                                            <NavLink to='/formulario-vt-animal' state={{modo: "agregar"}}
                                                     className="dropdown-item">Insertar tipo al animal
                                            </NavLink>
                                        </li>
                                    </>
                                )}
                            </ul>

                        </li>
                        <li className="nav-item dropdown">
                            {/* Desplegable de la sección "Movimientos de corral" */}
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                               aria-expanded="false">
                                Movimientos de corral
                            </a>
                            <ul className="dropdown-menu">
                                {/* Enlace a la página "Lista de corrales" */}
                                <li>
                                    <NavLink to='/lista-corrales' className="dropdown-item">
                                        Lista de corrales
                                    </NavLink>
                                </li>
                                {/* Solo el rol de ADMINISTRADOR puede AGREGAR un corral y mover animales del corral*/}
                                {rol === "Administrador" && (
                                    <>
                                        <li>
                                            <hr className="dropdown-divider"/>
                                        </li>
                                        {/* Enlace a la página "Agregar corral" */}
                                        <li>
                                            <NavLink to='/formulario-corral' state={{modo: "agregar"}}
                                                     className="dropdown-item">Agregar corral
                                            </NavLink>
                                        </li>

                                        <li>
                                            <hr className="dropdown-divider"/>
                                        </li>
                                        {/* Enlace a la página "Movimiento de corral" */}
                                        <li>
                                            <NavLink to='/movimiento-de-corral'
                                                     className="dropdown-item">Mover animal de corral
                                            </NavLink>

                                        </li>
                                    </>
                                )}
                            </ul>
                        </li>
                        <li className="nav-item dropdown">
                            {/* Desplegable de la sección "Inseminaciones" */}
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                               aria-expanded="false">
                                Inseminaciones
                            </a>
                            <ul className="dropdown-menu">
                                {/* Enlace a la página "Lista de inseminaciones" */}
                                <li>
                                    <NavLink to='/lista-inseminaciones' className="dropdown-item">
                                        Lista de inseminaciones
                                    </NavLink>
                                </li>
                                {/* Solo el rol de ADMINISTRADOR puede AGREGAR una inseminación a un animal */}
                                {rol === "Administrador" && (
                                    <>
                                        <li>
                                            <hr className="dropdown-divider"/>
                                        </li>
                                        {/* Enlace a la página "Inseminación animal" */}
                                        <li>
                                            <NavLink to='/formulario-inseminacion'
                                                     state={{modo: "agregar"}}
                                                     className="dropdown-item">
                                                Inseminación animal
                                            </NavLink>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </li>

                        {/* Enlace a la página "Simulación crias" */}
                        <li className="nav-item">
                            <NavLink to='/simulacion-crias' className="nav-link">Simulación crías</NavLink>
                        </li>
                        <li className="nav-item dropdown">
                            {/* Desplegable de la sección "Toros" */}
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                               aria-expanded="false">
                                Toros
                            </a>
                            <ul className="dropdown-menu">
                                {/* Enlace a la página "Visualizar toros" */}
                                <li>
                                    <NavLink to='/visualizar-toros' className="dropdown-item">
                                        Visualizar toros
                                    </NavLink>
                                </li>
                                {/* Solo el rol de ADMINISTRADOR puede AGREGAR un toro */}
                                {rol === "Administrador" && (
                                    <>
                                        <li>
                                            <hr className="dropdown-divider"/>
                                        </li>
                                        {/* Enlace a la página "Formulario toro" */}
                                        <li>
                                            <NavLink to='/formulario-toro' state={{modo: "agregar"}}
                                                     className="dropdown-item">
                                                Agregar toro
                                            </NavLink>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </li>
                    </ul>

                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                        {/* Desplegable de la sección "Usuarios" posicionada a la derecha */}
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                               aria-expanded="false">Usuario</a>
                            <ul className="dropdown-menu dropdown-menu-end">
                                {/* Enlace a la página "Perfil de usuario" --> NO IMPLEMENTADO */}
                                {/*<li>*/}
                                {/*    <NavLink to='/perfil-usuario'*/}
                                {/*             className="dropdown-item">*/}
                                {/*        Perfil de usuario*/}
                                {/*    </NavLink>*/}
                                {/*</li>*/}
                                {/*<li>*/}
                                {/*    <hr className="dropdown-divider"/>*/}
                                {/*</li>*/}
                                {/* Enlace a la página "Cerrar sesión" */}
                                <li>
                                    <button onClick={logout}
                                            className="dropdown-item dropdown-item-button">
                                        Cerrar sesión
                                    </button>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}