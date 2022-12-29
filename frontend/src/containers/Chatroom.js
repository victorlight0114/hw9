import { Button, Input, Tag, Tabs, Modal, Form, message } from 'antd'
import { useState, useEffect, useRef } from "react"
import { useChat } from "./hooks/useChat"
import AppTitle from '../components/Title'
import styled from 'styled-components'

const ChatBoxWrapper = styled.div`
  width: 100%;
  height: 220px;
  background: #eeeeee52;
  border-radius: 10px;
  margin: 0px;
  padding: 0px;
  overflow: auto;
`;
const ChatBoxesWrapper = styled(Tabs)`
  width: 100%;
  height: 300px;
  background: #eeeeee52;
  border-radius: 10px;
  margin: 20px;
  padding: 20px;
  /*overflow: auto;*/
`;
const StyledMessage = styled.div`
  display: flex;
  align-items: center;
  flex-direction: ${({isMe}) => (isMe ? 'row-reverse' : 'row')};
  margin: 8px 10px;
  & p:first-child {
  margin: 0 5px;
  }
  & p:last-child {
  padding: 2px 5px;
  border-radius: 5px;
  background: #eee;
  color: gray;
  margin: auto 0;
 }
`
;
const Message = ({ isMe, message}) => {
 return (
 <StyledMessage isMe={isMe}>
 <p>{message}</p>
 </StyledMessage>
 );
};

const ChatModal = ({ open, onCreate, onCancel }) => {
  const [form] = Form.useForm();
  return (
  <Modal
    open={open}
    title="Create a new chat room"
    okText="Create"
    cancelText="Cancel"
    onCancel={onCancel}
    onOk={() => {
      form
      .validateFields()
      .then((values) => {
      form.resetFields();
      onCreate(values);
      })
      .catch((e) => {
      window.alert(e);
      });
    }}
  >
    <Form form={form} layout="vertical" name="form_in_modal">
      <Form.Item name="name" label="Name"
      rules={[{
        required: true,
        message: 'Error: Please enter the name of the person to chat!',
      },
      ]} >
        <Input />
      </Form.Item>
    </Form>
  </Modal>
 );};
const FootRef = styled.div`
 height: 20px;
`;

function Chatroom() {
    const { status, me, setMe, messages, needScrolling, displayStatus, setNeedScrolling,
      startChat, sendMessage, clearMessages } = useChat()
    const [ body, setBody ] = useState('')
    const [ chatBoxes, setChatBoxes ] = useState([
      // { label: 'Tab 1', key: 'item-1', children: 'Content 1' }, // remember to pass the key prop
      // { label: 'Tab 2', key: 'item-2', children: 'Content 2' },
    ])
    const [ activeKey, setActiveKey ] = useState(0)
    const [modalOpen, setModalOpen] = useState(false);
    //const [ msgSent, setMsgSent ] = useState(false)
    const bodyRef = useRef(null)
    const msgFooter = useRef(null)
    const scrollToBottom = () => {
      msgFooter.current?.scrollIntoView
      ({ behavior: 'smooth', block: "start" });
    };
    const displayMessages = (messageslot) => ( 
      messageslot.length === 0 ? (                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
        <p style={{ color: '#ccc' }}>
          No messages... 
        </p>
      ) : 
        (messageslot.map(({ sender, receiver , body }, index) => 
          <Message isMe={sender === me} message={body} key={index}/>
        // <p className="App-message" key={index}>
        //   {/*console.log("Print msg: " + name + body )*/}
        //   <Tag color='blue'>{name}</Tag> {body}
        // </p>
      ) ) 
    )
    useEffect(() => {
      console.log("Detect messages change ")
      console.log(messages)
      if(activeKey && chatBoxes){ 
      const indexAct = chatBoxes.findIndex(({key}) => key === activeKey);
      //console.log(chatBoxes)
      setChatBoxes(chatBoxes.map(({label, children, key}, index) => (
        indexAct === index ? 
        {label, children: renderChat(messages.filter(
          element => ((element.sender === me && element.receiver === activeKey) || (element.sender === activeKey && element.receiver === me))
          )), key} :
        {label, children, key}
      )))
      }
    }, [messages]);
    
    useEffect(() => {
      scrollToBottom();
      setNeedScrolling(false);
    }, [needScrolling]);

    const renderChat = (chatmsgs) => (
      <ChatBoxWrapper>
        {displayMessages(chatmsgs)}
        <FootRef ref={msgFooter} />
      </ChatBoxWrapper>); // 產⽣ chat 的 DOM nodes
    // const extractChat = (friend) => {
    //   return renderChat(messages.filter(({name, body}) => ((name === friend) || (name === me))));
    // }

    const createChatBox = (friend) => {
      if (chatBoxes.some(({key}) => key === friend)) {
       throw new Error(friend +"'s chat box has already opened.");
       }
       console.log("Creating Chatbox with friend " + friend)
       const chatmsgs = startChat(me, friend);
       setChatBoxes([...chatBoxes,
       { label: friend, children: chatmsgs,
       key: friend }]);
       setNeedScrolling(true);
       return friend;
    };
    const removeChatBox =
      (targetKey, activeKey) => {
      const index = chatBoxes.findIndex
      (({key}) => key === activeKey);
      const newChatBoxes = chatBoxes
      .filter(({key}) => key !== targetKey);
      setChatBoxes(newChatBoxes);
      return(activeKey?
        activeKey === targetKey?
        index === 0?
        '' : chatBoxes[index - 1].key
        : activeKey
        : '')
    };


    return (
      <div className="App">
        <AppTitle name={me} />
        <ChatBoxesWrapper 
          type="editable-card"
          items={chatBoxes}
          onChange={(key) => {
            setActiveKey(key);
            //extractChat(key);
            startChat(me, key)
          }}
          activeKey={activeKey}
          onEdit={(targetKey, action) => {
            if (action === 'add') setModalOpen(true);
            else if (action === 'remove') {
            setActiveKey(removeChatBox(targetKey, activeKey));
            }
          }}
          />
          <ChatModal
            open={modalOpen}
            onCreate={({ name }) => {
            setActiveKey(createChatBox(name));
            //extractChat(name);
            setModalOpen(false);
            startChat(me, name)
            }}
            onCancel={() => { setModalOpen(false);}}
          />
        
        <Input
          placeholder="Username"
          value={me}
          onChange={(e) => setMe(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              bodyRef.current.focus()
            }}}
          style={{ marginBottom: 10 }}
        ></Input>
        <Input.Search
          ref={bodyRef}
          value={body}
          onChange={(e) => setBody(e.target.value)} 
          enterButton="Send"
          placeholder="Type a message here..."
          onSearch={(msg) => {
            if (!msg || !me) {
              displayStatus({
                type: 'error',
                msg: 'Please enter a username and a message body.'
              })
              return
            }
            sendMessage({ sender: me, receiver: activeKey, body: msg})
            setBody('')
            setNeedScrolling(true)
            scrollToBottom();
          }}
        ></Input.Search>
      </div>
    )
  }
  
  export default Chatroom
  