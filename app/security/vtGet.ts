import axios from "axios";
import Constants from "expo-constants";

const apiKey = Constants.expoConfig?.extra?.VIRUSTOTAL_API_KEY;
if (!apiKey) {
  throw new Error("VirusTotal API key not found in app.json");
}

export default async function getAnalysis(id: string): Promise<string> {
  const getOptions = {
    method: "GET",
    url: `https://www.virustotal.com/api/v3/analyses/${id}`,
    headers: {
      accept: "application/json",
      "x-apikey": apiKey,
    },
  };

  try {
    const scanningresults = await axios.request(getOptions);
    return scanningresults.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
