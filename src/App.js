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
    setAllMessages(data);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!loading && message !== "") {
      setLoading(true);
      await supabase.from("ChatMessages").insert({ message: message });
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
      ref.current.scrollIntoView();
    }
  }, [allMessages]);

  return (
    <div className="flex justify-center items-center bg-gray-800 w-full h-screen bg-gradient-to-r from-cyan-500 to-blue-500">
      <div className="relative w-80 h-4/5 bg-slate-100 rounded-lg shadow-2xl flex flex-col space-between p-5 pr-0">
        <div className="overflow-y-auto flex flex-col space-between items-end mb-14 text-right">
          {allMessages?.map((message, index) => (
            <p
              ref={index === allMessages.length - 1 ? ref : null}
              key={index}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 p-2 px-4 mr-4 m-1 rounded-lg shadow-sm text-stone-100  hover:shadow-lg"
            >
              {message?.message}
            </p>
          ))}
        </div>
        <form onSubmit={sendMessage}>
          <div className="absolute bottom-4 h-12 w-full">
            <input
              className="m-1 p-2 focus:outline-none rounded-lg w-56"
              type="text"
              placeholder="Start Typing..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              className="m-1 p-2 bg-slate-700 rounded-lg text-stone-100 disabled:bg-gray-700 disabled:cursor-not-allowed hover:bg-slate-600 font-bold"
              disabled={loading}
            >
              {">>"}
            </button>
          </div>
        </form>
        {/* <p>{message}</p> */}
      </div>
    </div>
  );
}

export default App;
