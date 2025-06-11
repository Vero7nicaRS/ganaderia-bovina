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
        unidades: "1",
        cantidad: "Sobre"
    },
    {
        id: "VT-2",
        tipo: "Tratamiento",
        nombre: "Terapia selectiva de vacas secas",
        unidades: "5",
        cantidad: "Sobre"
    },
    {
        id: "VT-3",
        tipo: "Vacuna",
        nombre: "Leptóspira",
        unidades: "10",
        cantidad: "Botella"
    },
    {
        id: "VT-4",
        tipo: "Vacuna",
        nombre: "Bovisan Diar",
        unidades: "6",
        cantidad: "Botella"
    },
];