import './App.css'
import { useEffect, useState, useRef } from 'react'
import styled from 'styled-components';
import { useChat } from './containers/hooks/useChat'
import SignIn from './components/SignIn'
import ChatRoom from './containers/Chatroom';

const Wrapper = styled.div`
   // 改⾃ App.css 裡頭的 .App
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 500px;
  margin: auto;
`;

const App = () => {
  const { status, signedIn , displayStatus } = useChat()
  console.log("Running App.js")
  useEffect(() => {
    displayStatus(status)}, [status, displayStatus])
  return (
    <Wrapper> {signedIn? <ChatRoom /> : <SignIn />} </Wrapper>
  )
}

export default App;

