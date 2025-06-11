import api from "../api.js";

export const enviarCriaAlModeloAprendizaje = async (nuevoAnimalConId, animales, animalesToros) => {
    try {
        // Se obtiene el animal para obtener el código de las vacas, ya que la simulación trabaja con el "código"
        const objVaca = animales.find((v) => v.id === parseInt(nuevoAnimalConId.madre));

        // Se obtiene el toro para obtener su código, ya que la simulación trabaja con el "código"
        const objToro = animalesToros.find((t) => t.id ===  parseInt(nuevoAnimalConId.padre));
        if (!objVaca || !objToro) {
            console.error(" Reproductores no encontrados. Vaca:", objVaca?.id, "Toro:", objToro?.id);
            return;
        }

        const entrenamiento= {
            id_vaca: objVaca.codigo,
            id_toro: objToro.codigo,
            id_cria: nuevoAnimalConId.codigo,
            celulas_somaticas: parseFloat(nuevoAnimalConId.celulas_somaticas),
            produccion_leche: parseFloat(nuevoAnimalConId.produccion_leche),
            calidad_patas: parseFloat(nuevoAnimalConId.calidad_patas),
            calidad_ubres: parseFloat(nuevoAnimalConId.calidad_ubres),
            grasa: parseFloat(nuevoAnimalConId.grasa),
            proteinas: parseFloat(nuevoAnimalConId.proteinas),
            cs_vaca: objVaca.celulas_somaticas,
            pl_vaca: objVaca.produccion_leche,
            pa_vaca: objVaca.calidad_patas,
            u_vaca: objVaca.calidad_ubres,
            g_vaca: objVaca.grasa,
            pr_vaca: objVaca.proteinas,
            cs_toro: objToro.celulas_somaticas,
            pl_toro: objToro.transmision_leche,
            pa_toro: objToro.calidad_patas,
            u_toro: objToro.calidad_ubres,
            g_toro: objToro.grasa,
            pr_toro: objToro.proteinas,
        };

        console.log(" Payload a enviar:", entrenamiento);

        const response = await api.post("/reentrenar-cria/", entrenamiento);
        console.log("Reentrenamiento completado con éxito:", response.data);
    } catch (error) {
        console.error(" Error al reentrenar modelo:", error);
        console.log(" Error completo:", error.response?.data?.traceback);
    }
}
