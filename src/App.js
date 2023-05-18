import { Box, Button, Container, HStack, Input, VStack, } from "@chakra-ui/react";
import { app } from "./firebase.js";
import Message from "./Componet/Message.jsx";
import { useEffect, useRef, useState } from "react";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, addDoc, collection, serverTimestamp, onSnapshot, query, orderBy } from "firebase/firestore"


const auth = getAuth(app);
const db = getFirestore(app);

const loginhendler = () => {
  const proveder = new GoogleAuthProvider();
  signInWithPopup(auth, proveder)
}

const logouthandler = () => {
  signOut(auth);
}


function App() {

  const [user, setUser] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])

  const divforscroll = useRef(null);

  const submithandler = async (e) => {
    e.preventDefault();

    try {
      setMessage("");
      await addDoc(collection(db, "Messages"), {
        text: message,
        uid: user.uid,
        uri: user.photoURL,
        createdAT: serverTimestamp()
      });

      divforscroll.current.scrollIntoView(false);
    }
    catch (error) {
      alert(error);
    }
  }

  useEffect(() => {
    const q = query(collection(db, "Messages"), orderBy("createdAT", "asc"))
    const unsubscribe = onAuthStateChanged(auth, (data) => {
      setUser(data);
    })

    const unsubscribeformessage = onSnapshot(q, (snap) => {
      setMessages(
        snap.docs.map((item) => {
          const id = item.id;
          return { id, ...item.data() }
        })
      );
    });



    return () => {
      unsubscribe();
      unsubscribeformessage();

    };
  }, []);

  return (
    // chakara-ui
    <Box bg={"red.50"}>

      {
        user ? (<Container h={"100vh"} bg={"white"}>
          <VStack h="full" paddingY={'4'} >
            <Button onClick={logouthandler} bg={"red"} w={"full"}>
              Logout
            </Button>

            <VStack h="full" w={"full"} overflowY={"auto"} css={{
              "&::-webkit-scrollbar": {
                display: "none",
              }
            }}>
              {
                messages.map((item) => (
                  <Message
                    key={item.id}
                    user={item.uid === user.uid ? "me" : "other"}
                    text={item.text}
                    uri={item.uri}
                  />
                ))
              }
              <div ref={divforscroll}></div>
            </VStack>

            <form onSubmit={submithandler} style={{ width: "100%" }}>
              <HStack>
                <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enter a message..." />
                <Button colorScheme={"purple"} type="submit">
                  send
                </Button>
              </HStack>
            </form>

          </VStack>
        </Container>) : <VStack justifyContent={'center'} bg={'white'} h={"100vh"}>
          <Button onClick={loginhendler} colorScheme="purple">Sign in with google</Button>

        </VStack>
      }
    </Box>
  );
}

export default App;
