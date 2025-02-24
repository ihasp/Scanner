import axios from "axios";
import Constants from "expo-constants";

const apiKey = Constants.expoConfig?.extra?.VIRUSTOTAL_API_KEY;
if (!apiKey) {
  throw new Error("VirusTotal API key not found in app.json");
}

export default async function scanUrl(url: string): Promise<string> {
  const encodedParams = new URLSearchParams();
  encodedParams.set("url", url);

  const postOptions = {
    method: "POST",
    url: "https://www.virustotal.com/api/v3/urls",
    headers: {
      accept: "application/json",
      "x-apikey": apiKey,
      "content-type": "application/x-www-form-urlencoded",
    },
    data: encodedParams,
  };

  try {
    const response = await axios.request(postOptions);
    const analysisId = response.data.data.id;
    return analysisId;
  } catch (err) {
    console.error(err);
    throw err;
  }
}