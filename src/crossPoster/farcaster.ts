import axios from "axios";
import { Article } from "../bloggingEngines/types";


const BASE_URL = "https://api.neynar.com"

export class NeynarBackedCrossPoster {
    constructor(
        private readonly apiKey: string,
        private readonly signerUuid: string,
        private readonly timeoutMs: number = 5000
    ) {}

    async postArticle(article: Article): Promise<void> {
        console.log("📪 Posting cast via Neynar");
    
        const headers = { "Content-Type": "application/json", "api_key": this.apiKey };
        const text = `New article: ${article.title}`


        const embedUrls: { url: string }[] = [
            {
                url: article.link,
            },
            
            // For now, only post the first image
            ...article.embeds.map(embed => ({url: embed.url}))
        ];
        const data = {
            "signer_uuid": this.signerUuid,
            "text": text,
            "embeds": embedUrls,
        };
        try {
            const response = await axios.post(`${BASE_URL}/v2/farcaster/cast`, data, { headers, timeout: this.timeoutMs });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}