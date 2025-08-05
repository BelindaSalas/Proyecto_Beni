const apiUrl = import.meta.env.VITE_API_URL;

export const create = async (data) => {
    try {
        const result = await fetch(`${apiUrl}/users`, {
            method: "POST", 
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify(data)
        })

        if(result.ok) {
            return {message: "Usuario creado exitosamente", status: 200};
        }

        return result.json();

    } catch (error) {
        return {message: "Error al guardar el usuario", status: 500}
    }
}