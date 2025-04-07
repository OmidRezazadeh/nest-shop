import { registerAs } from "@nestjs/config";

export default registerAs("googleOAuth",()=>({

    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_SECRET,
    callbackUrl:process.env.GOOGLE_CALL_BACK_URL
}))