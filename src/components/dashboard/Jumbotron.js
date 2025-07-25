import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import "./Jumbotron.css";

const Jumbotron = () => {
  const { supabase } = useApp();
  const [messages, setMessages] = useState([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch active jumbotron messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!supabase) return;

      try {
        setLoading(true);
        const { data: messagesData, error: messagesError } = await supabase
          .from("jumbotron_messages")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (messagesError) {
          console.error("Error fetching jumbotron messages:", messagesError);
          return;
        }

        setMessages(messagesData || []);
      } catch (err) {
        console.error("Error fetching jumbotron messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [supabase]);

  // Cycle through messages every 8 seconds
  useEffect(() => {
    if (messages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => 
        prevIndex === messages.length - 1 ? 0 : prevIndex + 1
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [messages.length]);

  // Don't render if loading or no messages
  if (loading || messages.length === 0) {
    return null;
  }

  const currentMessage = messages[currentMessageIndex];

  return (
    <div className="jumbotron-container">
      <div 
        className="jumbotron-message"
        style={{
          backgroundColor: currentMessage.background_color,
          color: currentMessage.text_color,
        }}
      >
        <div className="jumbotron-content">
          <div className="scrolling-text">
            {currentMessage.message}
          </div>
        </div>
        
        {/* Message indicators */}
        {messages.length > 1 && (
          <div className="message-indicators">
            {messages.map((_, index) => (
              <div
                key={index}
                className={`indicator ${index === currentMessageIndex ? 'active' : ''}`}
                style={{
                  backgroundColor: index === currentMessageIndex 
                    ? currentMessage.text_color 
                    : `${currentMessage.text_color}50`
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jumbotron;
