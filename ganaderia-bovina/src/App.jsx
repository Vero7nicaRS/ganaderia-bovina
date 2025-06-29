import './styles/App.css'
import './styles/cuadradosHome.css'
import {Navigate, Route, Routes, useLocation} from "react-router-dom";
import {Home} from "./pages/00_Home/Home.jsx";
import {NavBar} from "./components/NavBar.jsx"
import {Footer} from "./components/Footer.jsx"
import {ListaAnimales} from "./pages/01_Animales/ListaAnimales.jsx";
import {InventarioVT} from "./pages/02_VacunacionesTratamientos/InventarioVT.jsx";
import {FormularioVT} from "./pages/02_VacunacionesTratamientos/FormularioVT.jsx";
import {ListaCorrales} from "./pages/03_MovimientosDeCorral/ListaCorrales.jsx";
import {ListaInseminaciones} from "./pages/04_Inseminaciones/ListaInseminaciones.jsx";
import {SimulacionCrias} from "./pages/05_SimulacionCrias/SimulacionCrias.jsx";
import {ListaToros} from "./pages/06_Toros/ListaToros.jsx";
import {FormularioAnimal} from "./pages/01_Animales/FormularioAnimal.jsx";
import {EliminarAnimal} from "./pages/01_Animales/EliminarAnimal.jsx";
import {FormularioToro} from "./pages/06_Toros/FormularioToro.jsx";
import {EliminarToro} from "./pages/06_Toros/EliminarToro.jsx";
import {FormularioInseminacion} from "./pages/04_Inseminaciones/FormularioInseminacion.jsx";
import {ListadoVT_Animales} from "./pages/02_VacunacionesTratamientos/02_0_Listado_VT_Animales/ListadoVT_Animales.jsx";
import {FormularioVT_Animales} from "./pages/02_VacunacionesTratamientos/02_0_Listado_VT_Animales/FormularioVT_Animales.jsx";
import {ArbolGenealogico} from "./pages/07_ArbolGenealogico/ArbolGenealogico.jsx";
import {FormularioCorral} from "./pages/03_MovimientosDeCorral/FormularioCorral.jsx";
import {MovimientoCorral} from "./pages/03_MovimientosDeCorral/MovimientoCorral.jsx"
import {EliminarVT} from "./pages/02_VacunacionesTratamientos/EliminarVT.jsx";
import {InicioSesion} from "./pages/InicioSesion/InicioSesion.jsx";
import {ProtegerRuta} from "./authentication/ProtegerRuta.jsx";
import fondoVaca from "./assets/fondo_manchas_vaca.jpg"
import {useAuthContext} from "./authentication/AuthContext.jsx";
export const App = () => {
    const { accessToken } = useAuthContext();

    const localizacion = useLocation(); //Ubicación actual de la página
     return (

         <div
             style={{
                 backgroundImage: `url(${fondoVaca})`,
                 backgroundRepeat: 'repeat',
                 backgroundSize: 'cover',
                 backgroundAttachment: 'fixed',
                 position: 'absolute',
                 top: 0,
                 left: 0,
                 right: 0,
                 bottom: 0,
                 overflowX: 'hidden',
             }}
         >
             <>

                 {localizacion.pathname !== "/inicio-sesion" && <NavBar/>}
                 {/*
                Lo uso para controlar que el NavBar (barra de tareas) aparezca siempre al principio de la página,
                excepto en la página de inicio de sesión ( "/inicio-sesion") que no aparecerá.
             */}
                 <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

                     {/* Contiene todas las rutas que hay en la aplicación*/}
                     <div className="container">
                         <Routes>
                             <Route path="/" element={
                                 accessToken ? <Home /> : <Navigate to="/inicio-sesion" />
                             }/>

                             {/* ---------- Páginas referentes a LISTA DE ANIMALES (Vacas/Terneros) ----------*/}
                             <Route path="/visualizar-animales" element={<ListaAnimales/>}/>
                             {/*<Route path="/agregar-animal" element={<AgregarAnimal/>}/>
                            Cuando no estaba centralizado en el formularioAnimal
                         */}
                             <Route path="/eliminar-animal"
                                    element={
                                        <ProtegerRuta requiereRol="Administrador">
                                            <EliminarAnimal/>
                                        </ProtegerRuta>
                                    }
                             />
                             <Route path="/formulario-animal"
                                    element={
                                        <ProtegerRuta requiereRol="Administrador">
                                            <FormularioAnimal/>
                                        </ProtegerRuta>
                                    }
                             />
                             {/* Para permitir que si se recarga la página, se consigan los datos de dicho animal
                         Sin tener que navegar a otra página.*/}
                             <Route path="/formulario-animal/:id" element={<FormularioAnimal/>}/>

                             {/* ---------- Páginas referentes a INVENTARIO DE VACUNAS Y/O TRATAMIENTOS ----------*/}
                             <Route path="/inventario-vt" element={<InventarioVT/>}/>
                             <Route path="/eliminar-inventario-vt"
                                    element={
                                        <ProtegerRuta requiereRol="Administrador">
                                            <EliminarVT/>
                                        </ProtegerRuta>
                                    }
                             />
                             <Route path="/formulario-vt"
                                    element={
                                        <ProtegerRuta requiereRol="Administrador">
                                            <FormularioVT/>
                                        </ProtegerRuta>
                                    }
                             />
                             {/* Para permitir que si se recarga la página, se consigan los datos de dicha vacuna/tratamiento.
                         Sin tener que navegar a otra página.*/}
                             <Route path="/formulario-vt/:id" element={<FormularioVT/>}/>
                             <Route path="/agregar-tipo-vt" element={<FormularioVT/>}/>

                             {/* ---------- Páginas referentes a LISTADO DE VACUNAS Y/O TRATAMIENTOS EN ANIMALES ----------*/}
                             <Route path="/listado-vt-animal" element={<ListadoVT_Animales/>}/>
                             <Route path="/formulario-vt-animal"
                                    element={
                                        <ProtegerRuta requiereRol="Administrador">
                                            <FormularioVT_Animales/>
                                        </ProtegerRuta>
                                    }
                             />
                             {/* Para permitir que si se recarga la página, se consigan los datos de
                         la vacuna/tratamiento suministrada al animal.
                         Sin tener que navegar a otra página.*/}
                             <Route path="/formulario-vt-animal/:id" element={<FormularioVT_Animales/>}/>


                             {/* ---------- Páginas referentes a LISTA DE CORRALES ----------*/}
                             <Route path="/lista-corrales" element={<ListaCorrales/>}/>
                             <Route path="/formulario-corral"
                                    element={
                                        <ProtegerRuta requiereRol="Administrador">
                                            <FormularioCorral/>
                                        </ProtegerRuta>
                                    }
                             />
                             {/* Para permitir que si se recarga la página, se consigan los datos de dicho corral
                         Sin tener que navegar a otra página.*/}
                             <Route path="/formulario-corral/:id" element={<FormularioCorral/>}/>
                             <Route path="/movimiento-de-corral"
                                    element={
                                        <ProtegerRuta requiereRol="Administrador">
                                            <MovimientoCorral/>
                                        </ProtegerRuta>
                                    }
                             />


                             {/* ---------- Páginas referentes a LISTA DE INSEMINACIONES  ----------*/}
                             <Route path="/lista-inseminaciones" element={<ListaInseminaciones/>}/>
                             <Route path="/formulario-inseminacion"
                                    element={
                                        <ProtegerRuta requiereRol="Administrador">
                                            <FormularioInseminacion/>
                                        </ProtegerRuta>
                                    }
                             />
                             {/* Para permitir que si se recarga la página, se consigan los datos de dicho corral
                         Sin tener que navegar a otra página.*/}
                             <Route path="/formulario-inseminacion/:id" element={<FormularioInseminacion/>}/>

                             <Route path="/simulacion-crias" element={<SimulacionCrias/>}/>


                             {/* ---------- Páginas referentes a LISTA DE TOROS ----------*/}
                             <Route path="/visualizar-toros" element={<ListaToros/>}/>
                             <Route path="/formulario-toro"
                                    element={
                                        <ProtegerRuta requiereRol="Administrador">
                                            <FormularioToro/>
                                        </ProtegerRuta>
                                    }
                             />
                             {/* Para permitir que si se recarga la página, se consigan los datos de dicho corral
                         Sin tener que navegar a otra página.*/}
                             <Route path="/formulario-toro/:id" element={<FormularioToro/>}/>
                             <Route path="/eliminar-toro"
                                    element={
                                        <ProtegerRuta requiereRol="Administrador">
                                            <EliminarToro/>
                                        </ProtegerRuta>
                                    }
                             />

                             {/* ---------- Páginas referentes a ARBOL GENEALÓGICO ----------*/}
                             <Route path="/arbol-genealogico" element={<ArbolGenealogico/>}/>

                             {/* ---------- Páginas referentes a INICIO DE SESIÓN ----------*/}
                             <Route path="/inicio-sesion" element={<InicioSesion/>}/>

                             {/*<Route path="/*" element={<Navigate to='/'/>}></Route>*/}
                             <Route path="/*" element={<Navigate to={accessToken ? "/" : "/inicio-sesion"} />} />

                         </Routes>
                     </div>
                     <Footer></Footer>
                 </div>
             </>

         </div>
             )
             }

