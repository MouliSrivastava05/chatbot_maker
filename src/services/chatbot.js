export const getChatbot = async({token}) =>{
    const response = await fetch("/api/chatbot/get", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      if (!response.ok) {
        const {err} = await response.json();
        console.log(err)
        throw new Error(err||"Error getting chatbot");
      }
      return response.json();
}
export const createChatbot = async({name,context,token}) =>{
    try {
        const response = await fetch("/api/chatbot/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name, context })
        });
        
        if (!response.ok) {
            let errorMessage = "Error creating chatbot";
            try {
                const errorData = await response.json();
                errorMessage = errorData.err || errorMessage;
            } catch (parseError) {
                console.warn('Failed to parse error response:', parseError);
            }
            throw new Error(errorMessage);
        }
        
        return response;
    } catch (error) {
        if (error instanceof SyntaxError) {
            console.warn('JSON parsing error in createChatbot:', error);
            throw new Error('Failed to create chatbot - invalid response');
        }
        throw error;
    }
}


export const getChatbotByName = async ({ token, name }) => {
    try {
        const response = await fetch(`/api/chatbot/getByChatbotName?name=${encodeURIComponent(name)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
        
        if (!response.ok) {
            let errorMessage = "Error getting chatbot by name";
            try {
                const errorData = await response.json();
                errorMessage = errorData.err || errorMessage;
            } catch (parseError) {
                console.warn('Failed to parse error response:', parseError);
            }
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        if (error instanceof SyntaxError) {
            console.warn('JSON parsing error in getChatbotByName:', error);
            throw new Error('Chatbot not found or invalid response');
        }
        throw error;
    }
}

export const getChatbotsByCreator = async ({ token }) => {
    try {
        const response = await fetch("/api/chatbot/getByCreator", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
        
        if (!response.ok) {
            let errorMessage = "Error getting chatbots by creator";
            try {
                const errorData = await response.json();
                errorMessage = errorData.err || errorMessage;
            } catch (parseError) {
                console.warn('Failed to parse error response:', parseError);
            }
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        if (error instanceof SyntaxError) {
            console.warn('JSON parsing error in getChatbotsByCreator:', error);
            return []; // Return empty array instead of throwing
        }
        throw error;
    }
}

