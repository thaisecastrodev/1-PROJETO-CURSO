
// A variável da chave já vem do config.js (window.API_KEY)

async function enviarPergunta() {
    const inputField = document.getElementById("user-question");
    const question = inputField.value.trim();

    
    // URL usando o modelo que o chatgpt indicou 20-05-2026  const API_URL =
    const API_URL ="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key="+ window.API_KEY;
    
    if (!question) return;

    // URL usando o modelo que o chatgpt indicou 20-05-2026  const API_URL =



    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: question }] }]
            })
        });

        const data = await response.json();
        console.log("Resposta do Google:", data); // Isso vai mostrar a resposta no console
        
        // Se a resposta chegar, você verá o texto aqui
        if (data.candidates) {
            console.log("IA respondeu:", data.candidates[0].content.parts[0].text);
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
    }
}

            
function salvarContexto() {

    const contexto =
        document.getElementById("context-database").value;

    localStorage.setItem("contexto", contexto);

    document.getElementById("status").style.display = "block";

}


