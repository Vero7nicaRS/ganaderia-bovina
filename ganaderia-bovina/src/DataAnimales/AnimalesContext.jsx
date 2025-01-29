/*
* ------------------------------------------ AnimalesContext.jsx: ------------------------------------------
* Funcionalidad: se emplea para que el listado de animales se encuentre disponible en las diferentes páginas.
*
* Se ssepara el Context del Provider porque se espera que daca archivo solo exporte componentes.
* -----------------------------------------------------------------------------------------------------------
* */
import { createContext } from "react";
/*Para evitar el warning: Invalid number of arguments, expected 1
* Le pasamos null como parámetro*/
export const AnimalesContext = createContext(null);
