import React, { useState, useEffect, useRef, useCallback } from "react";
import "./Chat.css";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Get user and community info
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName') || 'You';
  const communityId = localStorage.getItem('communityId');
  const token = localStorage.getItem('token');

  // Function to fetch messages
  const fetchMessages = useCallback(() => {
    if (!communityId) return Promise.resolve();
    
    console.log('Fetching messages for community:', communityId);
    
    return fetch(`http://localhost:5000/api/message/${communityId}`, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log('Raw messages from server:', JSON.stringify(data, null, 2));
      
      if (Array.isArray(data)) {
        const processedMessages = data.map((msg, index) => {
          console.log(`\n--- Processing message ${index + 1} ---`);
          console.log('Raw message data:', JSON.stringify(msg, null, 2));
          // Determine if this is the current user's message
          const senderId = typeof msg.sender === 'object' ? msg.sender?._id?.toString() : msg.sender?.toString();
          const isOwn = senderId === userId;
          
          // Get the best available display name
          const displayName = msg.senderName || 
                            (typeof msg.sender === 'object' ? msg.sender?.name : null) || 
                            'User';
          
          const processedMsg = {
            ...msg,
            id: msg._id,
            senderId: senderId,
            senderName: displayName,
            isOwnMessage: isOwn,
            isSystem: false,
            time: new Date(msg.time).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit', 
              hour12: true 
            })
          };
          
          console.log('Processed message:', JSON.stringify({
            id: processedMsg.id,
            senderId: processedMsg.senderId,
            senderName: processedMsg.senderName,
            isOwnMessage: processedMsg.isOwnMessage,
            text: processedMsg.text.substring(0, 30) + (processedMsg.text.length > 30 ? '...' : '')
          }, null, 2));
          
          return processedMsg;
        });
        
        console.log('All processed messages:', JSON.stringify(processedMessages.map(m => ({
          id: m.id,
          senderId: m.senderId,
          senderName: m.senderName,
          isOwnMessage: m.isOwnMessage,
          text: m.text.substring(0, 20) + '...'
        })), null, 2));
        
        setMessages(processedMessages);
      }
    });
  }, [communityId, token, userId]);

  // Initial fetch and set up polling
  useEffect(() => {
    // Initial fetch
    fetchMessages();
    
    // Set up polling every 3 seconds
    const intervalId = setInterval(fetchMessages, 3000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchMessages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !communityId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/message/${communityId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ text: newMessage.trim() })
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => ([
          ...prev,
          {
            ...msg,
            id: msg._id,
            senderId: userId,
            senderName: userName,
            isOwnMessage: true,
            isSystem: false,
            time: new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
          }
        ]));
        setNewMessage("");
      }
    } catch {
      // Optionally handle error
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`message ${msg.isSystem ? 'system-message' : msg.isOwnMessage ? 'my-message' : 'other-message'}`}
            >
              {!msg.isSystem && (
                <div className="message-header">
                  <span className="message-sender">
                    {msg.isOwnMessage ? 'You' : msg.senderName}
                  </span>
                  <span className="message-time">{msg.time}</span>
                </div>
              )}
              <div className="message-content">
                {msg.isSystem 
                  ? <span dangerouslySetInnerHTML={{ __html: msg.text }} />
                  : msg.text}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-chat">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;
