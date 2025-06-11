
/*
* ------------------------------------------ AnimalesMock.jsx: ------------------------------------------
* Funcionalidad: Incluir un conjunto inicial de datos de animales: terneros y vacas.
* Se emplea para comprobar si las funcionalidades CRUD de ListaAnimales funcionan con éxito.
* En el futuro, este fichero será sustituido por una base de datos.
* -------------------------------------------------------------------------------------------------------
*
* */

export const animalesMock = [
    {
        id: 1,
        codigo: "V-1",
        tipo: "Vaca",
        estado: "Vacía",
        nombre: "Luna",
        fechaNacimiento: "2021-01-15",
        padre: "T-1",
        madre: "V-2",
        corral: "Corral vacas 1",
        celulasSomaticas: "20000",
        produccionLeche: "14000",
        calidadPatas: "8",
        calidadUbres: "7",
        grasa: "4.5",
        proteinas: "3.2",
        fechaEliminacion:"",
    },
    {
        id: 2,
        codigo: "C-1",
        tipo: "Ternero",
        estado: "Joven",
        nombre: "Sol",
        fechaNacimiento: "2023-06-10",
        padre: "T-2",
        madre: "V-2",
        corral: "Corral terneros",
        celulasSomaticas: "15000",
        produccionLeche: "0",
        calidadPatas: "6",
        calidadUbres: "N/A",
        grasa: "N/A",
        proteinas: "N/A",
        fechaEliminacion:""
    },
    {
        id: 3,
        codigo: "V-2",
        tipo: "Vaca",
        estado: "Vacía",
        nombre: "Pepita",
        fechaNacimiento: "2022-02-25",
        padre: "T-3",
        madre: "V-1",
        corral: "Corral vacas 1",
        celulasSomaticas: "15000",
        produccionLeche: "11000",
        calidadPatas: "9",
        calidadUbres: "4",
        grasa: "5.6",
        proteinas: "3.7",
        fechaEliminacion:"",
    },
    {
        id: 4,
        codigo: "C-2",
        tipo: "Ternero",
        estado: "Joven",
        nombre: "Pio",
        fechaNacimiento: "2024-12-14",
        padre: "T-4",
        madre: "V-2",
        corral: "Corral terneros",
        celulasSomaticas: "14500",
        produccionLeche: "0",
        calidadPatas: "7",
        calidadUbres: "5",
        grasa: "3",
        proteinas: "2",
        fechaEliminacion:"",
    },
];