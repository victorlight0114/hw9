import { useState, useEffect, useContext, createContext } from 'react';
import { message, Tag } from 'antd'
const client = new WebSocket ('ws://localhost:4000')
client.addEventListener("open", () => {
    console.log("Client Websocket Connected!")
})
const sendData = async (data) =>{ 
    console.log("send data.")
    console.log(data)
    //await
    client.send(JSON.stringify(data));
    console.log("Data sent")
};

const ChatContext = createContext({
    status: {},
    me: ""
   ,
    signedIn: false,
    messages: [],
    sendMessage: () => {},
    clearMessages: () => {},
});

const LOCALSTORAGE_KEY = "save-me";
const savedMe = localStorage.getItem(LOCALSTORAGE_KEY);

const ChatProvider = (props) => {
    const [status, setStatus] = useState({});
    const [me, setMe] = useState(savedMe || "");
    const [signedIn, setSignedIn] = useState(false);
    const [messages, setMessages] = useState([]);
    const [ needScrolling, setNeedScrolling ] = useState(false)
    const makeName = (name, to) => { return [name, to].sort().join('_'); };

    client.onmessage = (byteString) => {
        const { data } = byteString;
        const [task, payload] = JSON.parse(data);
        switch(task) {
            case "output" : {
                console.log("client received output ")
                setMessages(() => [...messages, ...payload]);
                setNeedScrolling(true);
                break;
            }
            case "status": {
                displayStatus(payload); break; 
            }
            case "init": {
                const messageRec = payload;
                setMessages(messageRec);
                console.log("client received init ")
                console.log(messageRec)
                setNeedScrolling(true)
                break;
            }
            case "cleared": {
                setMessages([]);
                break;
            }
            default: break;
        }
    }

    const startChat = (name, to) => {
        let chatName = makeName(name, to)
        let newUser = to;
        let currentUser = name;
        console.log("Starting Chat " + chatName)
        sendData(["CHAT", {chatName, newUser, currentUser}]);
        return [];
    }

    const sendMessage = (payload) => {
        //console.log("Payload");
        //console.log(payload);
        //console.log(messages)
        sendData(["MESSAGE", payload]);
        // setMessages([...messages, payload]);
        // setStatus({
        //     type: "success",
        //     msg: "Message sent."
        // });
    }
    const clearMessages = () => {
        sendData(["clear"]);
    };
    const displayStatus = (s) => {
        console.log("Display Status called")
        if(s.msg) {
          const { type, msg } = s;
          const content = {
            content: msg, duration: 0.5
          }
          switch(type) {
            case 'success':
              message.success(content);
              break;
            case 'error':
            default:
              message.error(content);
              break;
          }
        }
      }

      useEffect(() => {
        displayStatus(status)
      }, [status])

      useEffect(() => {
        if (signedIn) {
            localStorage.setItem(LOCALSTORAGE_KEY, me);
        }
    }, [me, signedIn]);

    return (
    <ChatContext.Provider
        value={{
            status, me, signedIn, messages, needScrolling, setMe, setSignedIn,
            startChat, sendMessage, clearMessages, setNeedScrolling, displayStatus
        }}
        {...props}
    />
    );
   };
const useChat = () => useContext(ChatContext);
    // const [messages, setMessages] = useState([]);
    // const [status, setStatus] = useState({});
    // const [signedIn, setSignedIn] = useState(false);
    // const [me, setMe] = useState("")
    
    // return {
    //     status, signedIn, me, setMe, setSignedIn, displayStatus, messages, sendMessage, clearMessages
    // }

export { ChatProvider, useChat };
export default { ChatProvider, useChat }