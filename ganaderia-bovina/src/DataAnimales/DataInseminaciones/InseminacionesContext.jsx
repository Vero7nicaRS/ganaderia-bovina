/*
* ------------------------------------------ InseminacionesContext.jsx: ------------------------------------------
* Funcionalidad: se emplea para que el listado de inseminaciones se encuentre disponible
* en las diferentes páginas.
*
* Se separa el Context del Provider porque se espera que cada archivo solo exporte componentes.
* -----------------------------------------------------------------------------------------------------------
* */

import {createContext} from "react";

export const InseminacionesContext = createContext(null);

