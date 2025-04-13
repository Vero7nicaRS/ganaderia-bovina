/*
* ------------------------------------------ ComprobarCamposEliminacionAnimal.jsx: ------------------------------------------
* Funcionalidad: se emplea para mostrar un mensaje de error y el campo en rojo.
* Hay mensajes destinados a los animales (vacas/terneros).
* ERRORES:
*  - Indicar que el campo es obligatorio.
* -----------------------------------------------------------------------------------------------------------
* */
export const ComprobarCamposEliminacionAnimal = ({ motivo, fechaEliminacion }) => {
    const erroresTemp = {};

    // Validaciones comunes para la eliminación de los animales.
    if (!motivo?.trim()) {
        erroresTemp.motivo = "Campo obligatorio";
    }

    // Validar la fecha de eliminación si el motivo es Muerte o Vendida
    if ((motivo === "Muerte" || motivo === "Vendida") && !fechaEliminacion?.trim()) {
        erroresTemp.fechaEliminacion = "Campo obligatorio";
    }

    return erroresTemp;
};
