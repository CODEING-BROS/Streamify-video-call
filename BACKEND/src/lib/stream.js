import { StreamChat } from "stream-chat";
import "dotenv/config";

const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;

if (!api_key ||!api_secret) {
    console.log('API_KEY and API_SECRET must be set in your environment variables.');
}

const streamClient = StreamChat.getInstance(api_key , api_secret);

export const upsertStreamUser = async (userData) => {
  if (!userData?.id) {
    throw new Error("userData must include an 'id' field.");
  }

  try {
    await streamClient.upsertUsers(
      [userData]
    );
    console.log("Stream user created:", userData.id);
    return userData;
  } catch (error) {
    console.error("Error upserting Stream user:", error);
    throw error;
  }
};

export const generateStreamToken = async (userId) => {
    try {
      // ensure userId is a string
      const userIdString = userId.toString();
      return streamClient.createToken(userIdString);
    } catch (error) {
      console.error("Error generating Stream token:", error);
    }
};

