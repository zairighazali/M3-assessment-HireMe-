import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { Container, Form, Button, ListGroup, Card } from "react-bootstrap";

export default function ChatPage() {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [userUid, setUserUid] = useState(null);

  const getToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("Not logged in");
    setUserUid(user.uid);
    return await user.getIdToken(true);
  };

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch messages");
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newMessage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send message");
      setNewMessage("");
      fetchMessages();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000); // polling every 2s
    return () => clearInterval(interval);
  }, [conversationId]);

  return (
    <Container className="py-4">
      <h3>Conversation</h3>
      <Card className="mb-3" style={{ maxHeight: "60vh", overflowY: "auto" }}>
        <ListGroup variant="flush">
          {messages.map(msg => (
            <ListGroup.Item
              key={msg.id}
              className={`d-flex ${msg.sender_uid === userUid ? "justify-content-end" : "justify-content-start"}`}
            >
              <span
                className={`px-3 py-1 rounded ${msg.sender_uid === userUid ? "bg-primary text-white" : "bg-light"}`}
              >
                {msg.content}
              </span>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card>

      <Form onSubmit={handleSend} className="d-flex">
        <Form.Control
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button type="submit" disabled={loading} className="ms-2">
          Send
        </Button>
      </Form>
    </Container>
  );
}