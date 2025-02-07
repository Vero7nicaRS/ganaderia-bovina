/*
* ------------------------------------------ VTMock.jsx: ------------------------------------------
* Funcionalidad: Incluir un conjunto inicial de datos de vacunas y tratamientos.
* Se emplea para comprobar si las funcionalidades CRUD de InventarioVT funcionan con éxito.
* En el futuro, este fichero será sustituido por una base de datos.
* -------------------------------------------------------------------------------------------------------
*
* */

export const vtMock= [
    {
        id: "VT-1",
        tipo: "Tratamiento",
        nombre: "Somatotropina bovina (bST)",
        cantidad: "Sobre"
    },
    {
        id: "VT-2",
        tipo: "Tratamiento",
        nombre: "Terapia selectiva de vacas secas",
        cantidad: "Sobre"
    },
    {
        id: "VT-3",
        tipo: "Vacuna",
        nombre: "Leptóspira",
        cantidad: "Botella"
    },
    {
        id: "VT-4",
        tipo: "Vacuna",
        nombre: "Bovisan Diar",
        cantidad: "Botella"
    },

];