import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);

  const supabase = createClient(
    "https://prtgqwomdgjyytuhgcek.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydGdxd29tZGdqeXl0dWhnY2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzk1NjM0NzEsImV4cCI6MTk5NTEzOTQ3MX0.kyKppd5dSjyRBqQ2uCQ9j7bk2bR9TqaJelCmxFR_3gM"
  );

  const channel = supabase.channel("1");

  const fetchMessages = async () => {
    const { data, error } = await supabase.from("ChatMessages").select();
    console.log(data);
    setAllMessages(data);
  };

  const sendMessage = async (msg) => {
    console.log("sendMessage");
    await supabase.from("ChatMessages").insert({ message: msg });
  };

  /*   const subscribe = () => {
    channel.subscribe(async (status) => {
      console.log("status", status);
    });
  }; */

  const listen = () => {
    supabase
      .channel("1")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ChatMessages",
        },
        (payload) => console.log("inserted stuff", payload)
      )
      .subscribe();
  };

  useEffect(() => {
    /*   subscribe(); */
    /* sendMessage(); */
    /* listen(); */
    fetchMessages();
  }, [message]);
  return (
    <div className="App">
      {allMessages.map((message) => (
        <p key={message.id}>{message.message}</p>
      ))}
      <input
        type="text"
        placeholder="sent msg"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={() => sendMessage(message)}>Send</button>
      {/* <p>{message}</p> */}
    </div>
  );
}

export default App;
