import api from "../api.js";

export const enviarCriaAlModeloAprendizaje = async (animal, nuevoAnimalConId, animales, animalesToros) => {
    try {

        // Se obtiene el animal para obtener el código de las vacas, ya que la simulación trabaja con el "código"
        const objVaca = animales.find((v) => v.id === parseInt(animal.madre));

        // Se obtiene el toro para obtener su código, ya que la simulación trabaja con el "código"
        const objToro = animalesToros.find((t) => t.id ===  parseInt(animal.padre));
        console.log("VACA: ", objVaca)
        console.log("TORO: ", objToro)
        console.log("madre: ", animal.madre)
        console.log("padre: ", animal.padre)
        if (!objVaca || !objToro) {
            console.error(" Reproductores no encontrados. Vaca:", objVaca?.id, "Toro:", objToro?.id);
            return;
        }

        const entrenamiento= {
            id_vaca: objVaca.codigo,
            id_toro: objToro.codigo,
            id_cria: nuevoAnimalConId.codigo,
            celulas_somaticas: parseFloat(animal.celulas_somaticas),
            produccion_leche: parseFloat(animal.produccion_leche),
            calidad_patas: parseFloat(animal.calidad_patas),
            calidad_ubres: parseFloat(animal.calidad_ubres),
            grasa: parseFloat(animal.grasa),
            proteinas: parseFloat(animal.proteinas),
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
