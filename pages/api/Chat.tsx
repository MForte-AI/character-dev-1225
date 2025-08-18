 import React, { useState, useEffect, useRef } from 'react';
import styles from './Chat.module.css';

interface Message {
role: 'user' | 'assistant';
content: string;
}

export default function Chat() {
const [messages, setMessages] = useState<Message[]>([]);
const [input, setInput] = useState('');
const [loading, setLoading] = useState(false);
const messagesEndRef = useRef<HTMLDivElement>(null);

// Auto-scroll to bottom on new message
useEffect(() => {
messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);

async function sendMessage() {
if (!input.trim()) return;

const userMessage: Message = { role: 'user', content: input };
setMessages((prev) => [...prev, userMessage]);
setInput('');
setLoading(true);

try {
const res = await fetch('/api/chat', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ messages: [...messages, userMessage] }),
});

if (!res.ok) throw new Error('API error');

const data = await res.json();
const botMessage: Message = { role: 'assistant', content: data.response };
setMessages((prev) => [...prev, botMessage]);
} catch (err) {
console.error(err);
const errorMsg: Message = { role: 'assistant', content: '⚠️ Error: Unable to get a response.' };
setMessages((prev) => [...prev, errorMsg]);
} finally {
setLoading(false);
}
}

return (
<div className={styles.chatContainer}>
<div className={styles.messages}>
{messages.map((m, i) => (
<div key={i} className={m.role === 'user' ? styles.userMessage : styles.botMessage}>
{m.content}
</div>
))}
<div ref={messagesEndRef} />
</div>

<div className={styles.inputContainer}>
<input
type="text"
value={input}
onChange={(e) => setInput(e.target.value)}
onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
placeholder="Type your message..."
disabled={loading}
/>
<button onClick={sendMessage} disabled={loading}>
{loading ? '...' : 'Send'}
</button>
</div>
</div>
);
}
