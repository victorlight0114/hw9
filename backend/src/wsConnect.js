import { ChatBoxModel, MessageModel, UserModel } from "./models/chatbox";
import Message from "./models/message"

// 在 global scope 將 chatBoxes 宣告成空物件
const chatBoxes = {};
const makeName = (name, to) => { return [name, to].sort().join('_'); };
const validateChatBox = async (name, participants) => {
    let box = await ChatBoxModel.findOne({ name });
    if (!box){
        console.log("Starting new ChatBox")
        box = await new ChatBoxModel({ name, users: participants }).save();
    }
        
    return box.populate(["users", {path: 'messages', populate: 'sender' }]);
};
const sendData = (data, ws) => {
    ws.send(JSON.stringify(data));
}
const sendStatus = (payload, ws) => {
    sendData(["status", payload], ws);
}
const broadcastMessage = (wss, data, status) => {
    wss.clients.forEach((client) => {
        sendData(data, client);
        sendStatus(status, client);
    });
};


export default {
    initData: (ws) => {

        // Message.find().sort({ created_at: -1 }).limit(100)
        // .exec((err, res) => {
        //     if (err) throw err;
        //     // initialize app with existing messages
        //     console.log("send init data msg")
        //     sendData(["init", res], ws);
        // });
    },
    onMessage: (wss, ws)=> (
        // console.log("WSS server is in onMessage function. ")
        async (byteString) => {
            console.log("Dealing wirh byte string")
            const { data } = byteString
            const [ task, payload ] = JSON.parse(data)
            console.log("TASK")
            console.log(task)
            switch (task) {
                case 'CHAT' : {
                    const { chatName, newUser, currentUser } = payload
                    // delete ws from old chatbox
                    if (ws.box !== "" && chatBoxes[ws.box])
                        chatBoxes[ws.box].delete(ws);
                    // current chatbox name
                    const chatBoxName = makeName(currentUser, newUser);
                    
                    // let user = null;
                    // console.log("Enter asyns awaits")
                    // await UserModel.findOne({name: "currentUse"}).then((result, err) => {
                    //     if(err) console.log("Find error " + err)
                    //     console.log('Finish Searching old'); user = result});
                    // console.log("This is user!")
                    // console.log(user);
                    // console.log("-----user---------")

                    // const newUserModel = new UserModel({name: "currentUse", chatBoxes:[]})
                    // console.log(newUserModel)
                    // //const newUserModel2 = new UserModel({name: "Ghost", chatBoxes:[]})
                    // newUserModel.save().then((res, err) =>  {
                    //     if(err) console.log("Save error " + err);
                    //     UserModel.findOne({name: "currentUse"}).then((result, err) => {
                    //         if(err) console.log("Find erroe " + err)
                    //         console.log('Finish Searching NEW'); user = result
                    //         console.log("This is New user!")
                    //         console.log(user);
                    //         console.log("-----New user---------")
                    //     });
                    // })
                
                    // make sure the chatbox exist in db
                    let curUserModal = null;
                    await UserModel.findOne({name: currentUser}).then((result, err) => {
                        if(err) console.log("Find error " + err)
                        curUserModal = result
                        if(result === null) {
                            curUserModal = new UserModel ({name: currentUser, chatBoxes:[]})
                            curUserModal.save()
                        }
                    });
                    console.log("This is current user!")
                    console.log(curUserModal);
                    console.log("-----current user---------")
                    

                    let newUserModal = null;
                    await UserModel.findOne({name: newUser}).then((result, err) => {
                        if(err) console.log("Find error " + err)
                        newUserModal = result
                        if(result === null) {
                            newUserModal = new UserModel ({name: newUser, chatBoxes:[]})
                            newUserModal.save()
                        }
                    });
                    console.log("This is new user!")
                    console.log(newUserModal);
                    console.log("-----new user---------")

                    await validateChatBox(chatBoxName, [curUserModal, newUserModal]);

                    // add ws to new chatbox
                    if (!chatBoxes[chatBoxName])
                        chatBoxes[chatBoxName] = new Set();
                    chatBoxes[chatBoxName].add(ws);
                    ws.box = chatBoxName;

                    // TODO: find chatbox with name ws.box, send all the messages of the chatbox to ws
                    /* Hint
                        * db 裡存的東西如果是 reference, 提取時需要 populate
                        ChatBoxModel.findOne({filter}).populate('what you want to populate').exec((_,res)=>{
                            sendData({your payload}, ws);
                        })
                        * 確認好payload的形式和前端接收的形式相同
                    */
                    console.log("Start Finding ChatBox")
                    var chatBoxMdl = null;
                    await ChatBoxModel.findOne({name: chatName})
                    .then((res, err) => {
                        if (err) console.log("Find Chatbox error: " +  err);
                        chatBoxMdl = res;
                    });

                    // initialize app with existing messages
                    console.log("send CHAT data msg" )
                    console.log(payload)
                    var filledChatBox = null;
                    await chatBoxMdl.populate(["users", {path: 'messages', populate: ['sender'] }])
                    .then((res, err) => {
                        if (err) console.log("Populate Chatbox error: " +  err);
                        filledChatBox = res;
                    })
                    console.log("filledChatBox")
                    console.log(filledChatBox)
                    var resendMsgs = []
                    filledChatBox.messages.map((value, index) => {
                        //value.populate("sender").then((res, err) => {
                            console.log({ sender: value.sender.name, 
                                receiver: (newUser === value.sender.name)? currentUser : newUser,  body: value.body })
                            resendMsgs.push({ sender: value.sender.name, 
                                receiver: (newUser === value.sender.name)? currentUser : newUser,  body: value.body })
                        //}
                        //)
                    })

                    console.log("resendMsgs")
                    console.log(resendMsgs)
                    sendData(["init", resendMsgs ], ws);
                    ws.box = chatName
                    
                        
                        // if(res === null){
                            // const user = UserModel.findOne({name: currentUser})
                            // console.log(user)
                            // .exec((error, result) => {
                            //     console.log("Searching")
                            //     if(error) throw error;
                            //     console.log("Search result")
                            //     console.log(result)
                            //     console.log("Search result ends.")
                            // })
                            // console.log("HA plz search")
                            // if(UserModel.findOne({name: currentUser}) === null){
                            //     const curUser = new UserModel({name: currentUser, chatBoxes: null})
                            //     console.log("Created newUser "  + currentUser)
                            // }
                            // const addedUser = new UserModel({name: newUser, chatBoxes: null})
                            //console.log(addedUser)
                            // const newChatBox = new ChatBoxModel({name: chatName, users: addedUser})
                            // addedUser.chatBoxes = [newChatBox]
                            // let originalChatBoxes = UserModel.findOne({name: currentUser}).chatBoxes
                            // console.log("Original me chatboxes")
                            // console.log(originalChatBoxes)
                            // UserModel.findOne({name: currentUser}).chatBoxes = [...originalChatBoxes, newChatBox]
                        // } 
                    break;
                }
                case 'MESSAGE' : {
                    const { sender, receiver , body } = payload
                    console.log("Client sent MESSAGE request to server, sender is ")
                    console.log(sender)
                    console.log("Receiver is ")
                    console.log(receiver)
                    const chatName = makeName(sender, receiver)

                    let senderModal = null;
                    await UserModel.findOne({name: sender}).then((result, err) => {
                        if(err) console.log("Find error " + err)
                        senderModal = result
                        if(result === null) {
                            console.log("CANNOT FIND SENDER")
                        }
                    });

                    ChatBoxModel.findOne({name: chatName})
                    .then((res, err) => {
                        if (err) console.log("Find Chatbox error: " +  err);
                        // initialize app with existing messages
                        console.log("case MESSAGE data msg" )
                        console.log(payload)
                        res.populate(["users", {path: 'messages', populate: 'sender' }]).then((res, err) => {
                            if (err) console.log("Populate Chatbox error: " +  err);
                            let ChatBoxMdl = res
                            console.log(ChatBoxMdl)

                            //Save payload to db
                            const message = new MessageModel({ chatBox: res, sender: senderModal, body: body })
                            console.log("Trying to save message into DB")
                            message.save().then((res, err) => {
                                if(err) console.log("MessageModel DB save error: " + err)
                                console.log("Chat Msgs")
                                console.log(ChatBoxMdl.messages.length)
                                
                                if(ChatBoxMdl.messages.length === 0){
                                    var newMessages = [message];
                                } else {
                                    var newMessages = [...ChatBoxMdl.messages, message]
                                }
                                ChatBoxModel.updateOne({name: chatName}, {messages: newMessages}).then((res, err) => {
                                    ChatBoxModel.findOne({name: chatName})
                                    .then((res, err) => {
                                        if (err) console.log("Find Chatbox error: " +  err);
                                        // initialize app with existing messages
                                        console.log("Re-examine chatbox" )
                                        
                                        res.populate(["users", {path: 'messages', populate: 'sender' }]).then((res, err) => {
                                            if (err) console.log("Populate Chatbox error: " +  err);
                                            let ChatBoxMdl = res
                                            console.log(ChatBoxMdl)})
                                        
                                    }) 
                                })

                                console.log(newMessages)
                                //Respond to client
                                var opData = ['output', [{ sender, receiver, body}]] 
                                var opStatus = {
                                    type: 'success',
                                    msg: 'Message sent.'
                                }
                                broadcastMessage(wss, opData, opStatus)
                            })
                            
                        })
                    })
                    
                    break;
                }
                case 'input' : {
                    const { name, body } = payload
                    console.log("Client sent input request to server")
                    console.log(payload)
                    //Save payload to db
                    const message = new MessageModel({ chatBox: ws.box, sender: name, body: body })
                    try { 
                        await message.save();
                        console.log("Trying to save message into DB")
                    } catch (e) {
                        throw new Error ("MessageModel DB save error: " + e);
                    }
                    //Respond to client
                    var opData = ['output', [payload]] 
                    var opStatus = {
                        type: 'success',
                        msg: 'Message sent.'
                    }
                    broadcastMessage(wss, opData, opStatus)
                    break;
                }
                case 'clear': {
                    Message.deleteMany({}, () => {
                        var opData = ['cleared'] 
                        var opStatus = { type: 'info', msg: 'Message cache cleared.'} 
                        broadcastMessage(wss, opData, opStatus)
                    })
                    break
                }
                default:
                    console.log("Bro this is not found, ERROR")
                break;
            }
        }
    )
}