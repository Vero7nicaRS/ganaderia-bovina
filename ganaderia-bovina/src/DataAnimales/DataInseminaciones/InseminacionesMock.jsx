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
        idVaca: "V-4",
        idToro: "T-3",
        razon: "Celo",
        tipoSemen: "Sexado",
        fechaInseminacion: "2021-01-15",
        horaInseminacion: "13:05",
        responsable: "Juan"
    },
    {
        id: "I-2",
        tipo: "Inseminación",
        idVaca: "V-3",
        idToro: "T-1",
        razon: "Celo",
        tipoSemen: "No",
        fechaInseminacion: "13-04-2024",
        horaInseminacion: "14:05",
        responsable: "Juan"
    }, {
        id: "I-3",
        tipo: "Inseminación",
        idVaca: "V-2",
        idToro: "T-1",
        razon: "Celo",
        tipoSemen: "Sexado",
        fechaInseminacion: "11-04-2024",
        horaInseminacion: "13:45",
        responsable: "Juan"
    }, {
        id: "I-4",
        tipo: "Inseminación",
        idVaca: "V-2",
        idToro: "T-1",
        razon: "Celo",
        tipoSemen: "No",
        fechaInseminacion: "15-03-2024",
        horaInseminacion: "14:52",
        responsable: "Juan"
    },

];