/*
* ------------------------------------------ VTListadoContext.jsx: ------------------------------------------
* Funcionalidad: se emplea para que el listado de vacunas y/o tratamientos de animales se encuentre disponible
* en las diferentes páginas.
*
* Se separa el Context del Provider porque se espera que cada archivo solo exporte componentes.
* -----------------------------------------------------------------------------------------------------------
* */

import { createContext } from "react";
/*Para evitar el warning: Invalid number of arguments, expected 1
* Le pasamos null como parámetro*/
export const VTListadoContext = createContext(null);