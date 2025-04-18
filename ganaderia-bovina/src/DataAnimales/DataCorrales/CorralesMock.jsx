/*
* ------------------------------------------ CorralesMock.jsx: ------------------------------------------
* Funcionalidad: Incluir un conjunto inicial de datos de corrales.
* Se emplea para comprobar si las funcionalidades CRUD de ListaCorrales funcionan con éxito.
* En el futuro, este fichero será sustituido por una base de datos.
* -------------------------------------------------------------------------------------------------------
*
* */
export const corralesMock= [
    {
        id: "1",
        codigo: "CORRAL-1",
        nombre: "Corral vacas 1",
        listaAnimales: ["V-1", "V-2"],
    },
    {
        id: "2",
        codigo: "CORRAL-2",
        nombre: "Corral terneros",
        listaAnimales: ["C-1", "C-2"],
    }, {
        id: "3",
        codigo: "CORRAL-3",
        nombre: "Corral vacas 2",
        listaAnimales: [],
    }, {
        id: "4",
        codigo: "CORRAL-4",
        nombre: "Corral vacas 3",
        listaAnimales: [],
    },
];