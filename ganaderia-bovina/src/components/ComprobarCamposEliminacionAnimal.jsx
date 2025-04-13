/*
* ------------------------------------------ ComprobarCamposEliminacionAnimal.jsx: ------------------------------------------
* Funcionalidad: se emplea para mostrar un mensaje de error y el campo en rojo.
* Hay mensajes destinados a las vacas, toros o para ambos.
* ERRORES:
*  - Indicar que el campo es obligatorio.
* -----------------------------------------------------------------------------------------------------------
* */
export const ComprobarCamposEliminacionAnimal = ({ motivo, fechaEliminacion }) => {
    const erroresTemp = {};

    // Validar si se ha seleccionado un motivo
    if (!motivo?.trim()) {
        erroresTemp.motivo = "Campo obligatorio";
    }

    // Validar la fecha si el motivo es Muerte o Vendida
    if ((motivo === "Muerte" || motivo === "Vendida") && !fechaEliminacion?.trim()) {
        erroresTemp.fechaEliminacion = "Campo obligatorio";
    }

    return erroresTemp;
};
