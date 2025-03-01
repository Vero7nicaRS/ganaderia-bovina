/*
* ------------------------------------------ SimulacionesContext.jsx: ------------------------------------------
* Funcionalidad: se emplea para que el listado de simulaciones se encuentre disponible
* en las diferentes páginas.
*
* Se separa el Context del Provider porque se espera que cada archivo solo exporte componentes.
* -----------------------------------------------------------------------------------------------------------
* */

import {createContext} from "react";

export const SimulacionesContext = createContext(null);

