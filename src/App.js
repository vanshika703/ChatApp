import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMsg, setNewMsg] = useState();
  const ref = useRef(null);

  const dbLink = process.env.REACT_APP_DATABASE_LINK;
  const dbKey = process.env.REACT_APP_API_KEY;
  const supabase = createClient(dbLink, dbKey);

  const fetchMessages = async () => {
    const { data, error } = await supabase.from("ChatMessages").select();
    console.log(data);
    setAllMessages(data);
  };

  const sendMessage = async (msg) => {
    console.log("sendMessage");
    if (!loading) {
      setLoading(true);
      await supabase.from("ChatMessages").insert({ message: msg });
      setMessage("");
      setLoading(false);
    }
  };

  /*   const subscribe = () => {
    channel.subscribe(async (status) => {
      console.log("status", status);
    });
  }; */

  const listen = () => {
    console.log("allMessages222", allMessages);
    supabase
      .channel("12")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ChatMessages",
        },
        (payload) => {
          console.log("inserted stuff", payload);
          setNewMsg(payload.new);
        }
      )
      .subscribe();
  };

  useEffect(() => {
    setAllMessages([...allMessages, newMsg]);
  }, [newMsg]);

  useEffect(() => {
    /*   subscribe(); */
    /* sendMessage(); */
    (async () => {
      await fetchMessages();

      listen();
    })();
  }, []);

  useEffect(() => {
    if (ref.current) {
      console.log(ref.current.scrollTo);
      ref.current.scrollIntoView();
    }
  }, [allMessages]);

  console.log("allMessages", allMessages);
  return (
    <div className="flex justify-center items-center bg-gray-800 w-full h-screen bg-gradient-to-r from-cyan-500 to-blue-500">
      <div className="relative w-1/5 h-4/5 bg-slate-100 rounded-lg shadow-2xl flex flex-col space-between p-5 pr-0">
        <div className="overflow-y-auto flex flex-col space-between items-end mb-14">
          {allMessages?.map((message, index) => (
            <p
              ref={index === allMessages.length - 1 ? ref : null}
              key={index}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 p-2 px-4 mr-4 m-1 rounded-lg shadow-sm text-stone-100 hover:shadow-xl"
            >
              {message?.message}
            </p>
          ))}
        </div>
        <div className="absolute bottom-4 h-12 bg-white rounded">
          <input
            className="m-1 p-2"
            type="text"
            placeholder="sent msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            className="m-1 p-2 bg-slate-900 rounded-lg text-stone-100 disabled:bg-gray-700 disabled:cursor-not-allowed"
            onClick={() => sendMessage(message)}
            disabled={loading}
          >
            Send
          </button>
        </div>
        {/* <p>{message}</p> */}
      </div>
    </div>
  );
}

export default App;
