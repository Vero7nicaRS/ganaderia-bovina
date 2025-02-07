/*
* ------------------------------------------ InseminacionesMock.jsx: ------------------------------------------
* Funcionalidad: Incluir un conjunto inicial de datos de inseminaciones.
* Se emplea para comprobar si las funcionalidades CRUD de ListaInseminaciones funcionan con éxito.
* En el futuro, este fichero será sustituido por una base de datos.
* -------------------------------------------------------------------------------------------------------
*
* */
export const inseminacionesMock= [
    {
        id: "I-1",
        tipo: "Inseminación",
        idVaca: "V-1",
        idToro: "T-2",
        razon: "Celo",
        tipoSemen: "Sexado",
        fechaInseminacion: "2022-05-16",
        horaInseminacion: "13:05",
        responsable: "Juan"
    },
    {
        id: "I-2",
        tipo: "Inseminación",
        idVaca: "V-1",
        idToro: "T-1",
        razon: "Celo",
        tipoSemen: "No sexado",
        fechaInseminacion: "2021-10-21",
        horaInseminacion: "14:05",
        responsable: "Juan"
    }, {
        id: "I-3",
        tipo: "Inseminación",
        idVaca: "V-2",
        idToro: "T-2",
        razon: "Celo",
        tipoSemen: "No sexado",
        fechaInseminacion: "2024-01-09",
        horaInseminacion: "13:45",
        responsable: "Juan"
    }, {
        id: "I-4",
        tipo: "Inseminación",
        idVaca: "V-2",
        idToro: "T-1",
        razon: "Celo",
        tipoSemen: "Sexado",
        fechaInseminacion: "2019-02-07",
        horaInseminacion: "14:52",
        responsable: "Juan"
    },

];