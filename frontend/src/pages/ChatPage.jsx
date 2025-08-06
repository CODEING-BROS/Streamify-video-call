import { useParams } from "react-router-dom"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import  useAuthUser from "../hooks/useAuthUser"
import { getStreamToken } from "../lib/api"

import {
  Channel,
  MessageList,
  MessageInput,
  ChannelHeader,
  Window,
  Chat,
  Thread
} from "stream-chat-react"
import { useEffect } from "react"
import { StreamChat } from "stream-chat"
import toast from "react-hot-toast"
import ChatLoader from "../components/ChatLoader"

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY

import CallButton from "../components/CallButton";

const ChatPage = () => {

  const {id:targetUserId} = useParams();

  const [chatClient , setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading , setLoading] = useState(true);

  const {authUser} = useAuthUser();

  const {data:tokenData} = useQuery({
      queryKey: ["streamToken"],
      queryFn: getStreamToken,
      enabled: !!authUser // Only fetch if authenticated user exists
  });

  const handleVideoCall = () => {
    if(channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text : `Calling... Click the link below to join the video call: ${callUrl}`,
      })
      toast.success("Video call initiated successfully!");
    }
};


  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        console.log("Initializing chat client...");
        const client = StreamChat.getInstance(STREAM_API_KEY)
        
        await client.connectUser({
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePicture,
        } ,tokenData.token);

        const channelId = [authUser._id, targetUserId].sort().join("-");
        const currChannel = client.channel("messaging", channelId , {
          members : [authUser._id, targetUserId],
        });

        await currChannel.watch();
        setChatClient(client);
        setChannel(currChannel);

      } catch (error) {
        console.log("Error initializing chat client:", error);
        toast.error(error.message);
      }
      finally {
        setLoading(false);
      }
    }
       // ✅ Call the function
        initChat();
  }, [tokenData, authUser, targetUserId])

  if (loading || !chatClient || !channel) {
    return <ChatLoader />
  }

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  )
}

export default ChatPage
