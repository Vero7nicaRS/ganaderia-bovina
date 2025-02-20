/*
* ------------------------------------------ VTListadoMock.jsx: ------------------------------------------
* Funcionalidad: Incluir un conjunto inicial de datos de vacunas y tratamientos de animales.
* Se emplea para comprobar si las funcionalidades CRUD de ListadoVT_Animales funcionan con éxito.
* En el futuro, este fichero será sustituido por una base de datos.
* -------------------------------------------------------------------------------------------------------
*
* */

export const vtListadoMock= [
    {
        id: "VTA-1",
        idAnimal: "V-1",
        tipo: "Tratamiento",
        nombre: "Somatotropina bovina (bST)",
        dosis: "1",
        ruta: "Intravenosa",
        fechaInicio: "2021-01-15",
        fechaFinalizacion: "2021-03-21",
        responsable: "Pepe Ramirez"
    },
    {
        id: "VTA-2",
        idAnimal: "V-2",
        tipo: "Tratamiento",
        nombre: "Terapia selectiva de vacas secas",
        dosis: "2",
        ruta: "Intravaginal ",
        fechaInicio: "2025-01-10",
        fechaFinalizacion: "2025-02-16",
        responsable: "Luis Ortiz"
    },
    {
        id: "VTA-3",
        tipo: "Vacuna",
        idAnimal: "V-1",
        nombre: "Leptóspira",
        dosis: "1",
        ruta: "Intramamaria",
        fechaInicio: "2024-12-23",
        fechaFinalizacion: "2024-12-24",
        responsable: "Rosa Galvez"
    },
    {
        id: "VTA-4",
        tipo: "Vacuna",
        idAnimal: "V-2",
        nombre: "Bovisan Diar",
        dosis: "3",
        ruta: "Oral",
        fechaInicio: "2025-02-19",
        fechaFinalizacion: "2025-03-01",
        responsable: "Pepe Ramirez"
    },

];