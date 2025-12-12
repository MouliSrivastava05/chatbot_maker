"use client"
import React, { useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthContext } from '@/context/auth'
import './dashboard.css'
import { createChatbot, getChatbotsByCreator } from '@/services/chatbot'
import { getToken } from '@/helpers/auth'
const Dashboard = () => {
    const router = useRouter()
    const { isLoggedIn, logout } = useContext(AuthContext)
    const [chatbots, setChatbots] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        context: ''
    })

    // Load existing chatbots when component mounts
    useEffect(() => {
        const loadChatbots = async () => {
            if (!isLoggedIn) return;
            
            const token = getToken();
            if (!token) return;

            try {
                const serverChatbots = await getChatbotsByCreator({ token });
                if (Array.isArray(serverChatbots)) {
                    setChatbots(serverChatbots);
                }
            } catch (error) {
                console.warn('Failed to load chatbots from server:', error);
                // Try to load from localStorage as fallback
                try {
                    const localChatbots = localStorage.getItem('user_chatbots');
                    if (localChatbots) {
                        setChatbots(JSON.parse(localChatbots));
                    }
                } catch (localError) {
                    console.warn('Failed to load chatbots from localStorage:', localError);
                }
            }
        };

        loadChatbots();
    }, [isLoggedIn]);

    // Save chatbots to localStorage whenever they change
    useEffect(() => {
        if (chatbots.length > 0) {
            localStorage.setItem('user_chatbots', JSON.stringify(chatbots));
        }
    }, [chatbots]);
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }
    const handleCreateChatbot = async () => {
        if (!formData.name.trim() || !formData.context.trim()) {
            alert('Please fill in all fields')
            return
        }
        
        setIsLoading(true);
        
        try {
            const token = getToken();
            if (!token) {
                alert('Please log in to create chatbots');
                return;
            }

            // Check if this is an edit (updating existing chatbot)
            const existingChatbot = chatbots.find(c => c.name === formData.name);
            
            if (existingChatbot) {
                // Update existing chatbot
                await createChatbot({ 
                    name: formData.name, 
                    context: formData.context, 
                    token: token 
                });

                // Update in local state
                setChatbots(prev => prev.map(c => 
                    c.name === formData.name 
                        ? { ...c, context: formData.context, createdAt: new Date().toISOString() }
                        : c
                ));
                
                alert('Chatbot updated successfully!');
            } else {
                // Create new chatbot
                await createChatbot({ 
                    name: formData.name, 
                    context: formData.context, 
                    token: token 
                });

                // Create local chatbot object for UI
                const newChatbot = {
                    id: Date.now(),
                    name: formData.name,
                    context: formData.context,
                    creator: token.split('#@#')[1], // Extract email from token
                    createdAt: new Date().toISOString()
                };

                // Add to local state
                setChatbots(prev => [...prev, newChatbot]);
                
                alert('Chatbot created successfully!');
            }
            
            // Clear form
            setFormData({ name: '', context: '' });
            
        } catch (error) {
            console.error('Failed to create/update chatbot:', error);
            alert('Failed to create/update chatbot. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }
    const handleOpenChat = (chatbot) => {
        const encodedName = encodeURIComponent(chatbot.name)
        router.push(`/chatbot/${encodedName}`)
    }

    const handleEditChatbot = (chatbot) => {
        setFormData({
            name: chatbot.name,
            context: chatbot.context
        });
        // Scroll to top to show the form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleDeleteChatbot = async (chatbot) => {
        if (!confirm(`Are you sure you want to delete "${chatbot.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const token = getToken();
            if (!token) {
                alert('Please log in to delete chatbots');
                return;
            }

            // Remove from local state
            setChatbots(prev => prev.filter(c => c.id !== chatbot.id && c.name !== chatbot.name));
            
            // Remove from localStorage
            const localChatbots = localStorage.getItem('user_chatbots');
            if (localChatbots) {
                const parsed = JSON.parse(localChatbots);
                const filtered = parsed.filter(c => c.id !== chatbot.id && c.name !== chatbot.name);
                localStorage.setItem('user_chatbots', JSON.stringify(filtered));
            }

            alert('Chatbot deleted successfully!');
        } catch (error) {
            console.error('Failed to delete chatbot:', error);
            alert('Failed to delete chatbot. Please try again.');
        }
    }
    if (!isLoggedIn) {
        return (
            <div className="notLoggedIn">
                <h1>Not Logged In</h1>
                <p>Please log in to access the dashboard</p>
            </div>
        )
    } else {
        return (
            <div className="dashboard">
                <div className="dashboardHeader">
                    <h1>Dashboard</h1>
                </div>
                <div className="dashboardContent">
                    <div className="createChatbotSection">
                        <h2>Create New Chatbot</h2>
                        <div className="inputGroup">
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter chatbot name"
                                className="chatbotName"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            <input
                                type="text"
                                name="context"
                                placeholder="Enter chatbot context"
                                className="chatbotContext"
                                value={formData.context}
                                onChange={handleChange}
                            />
                            <button 
                                onClick={handleCreateChatbot} 
                                className="createChatbotButton"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Saving...' : (chatbots.find(c => c.name === formData.name) ? 'Update Chatbot' : 'Create Chatbot')}
                            </button>
                        </div>
                    </div>
                    <div className="chatbotsList">
                        <h2>Your Chatbots</h2>
                        {chatbots.length === 0 ? (
                            <p className="noChatbots">No chatbots created yet</p>
                        ) : (
                            <div className="chatbotGrid">
                                {chatbots.map((chatbot, index) => (
                                    <div key={chatbot.id || `chatbot-${index}-${chatbot.name}`} className="chatbotCard">
                                        <h3>{chatbot.name}</h3>
                                        <p className="context">{chatbot.context}</p>
                                        <p className="createdAt">
                                            Created: {new Date(chatbot.createdAt).toLocaleDateString()}
                                        </p>
                                        <div className="chatbotActions">
                                            <button
                                                onClick={() => handleOpenChat(chatbot)}
                                                className="openChatButton"
                                            >
                                                Open Chat
                                            </button>
                                            <button
                                                onClick={() => handleEditChatbot(chatbot)}
                                                className="editChatbotButton"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteChatbot(chatbot)}
                                                className="deleteChatbotButton"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }
}
export default Dashboard