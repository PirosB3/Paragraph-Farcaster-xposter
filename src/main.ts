import Arweave from "arweave"
import { ArweaveBloggingEngine } from './bloggingEngines/arweave';
import { ApolloClient, InMemoryCache } from '@apollo/client/core';
import { RedisBackedCursor } from './cursor';
import { RedisClientType, createClient } from 'redis';
import { z } from "zod";
import { NeynarBackedCrossPoster } from "./crossPoster/farcaster";


let envSchema = z.object({
    NEYNAR_API_KEY: z.string().uuid(),
    NEYNAR_SIGNER_UUID: z.string().uuid(),
    PARAGRAPH_PUBLICATION_SLUG: z.string(),
    PARAGRAPH_URL: z.string().url(),
    REDIS_URL: z.string(),
    REDIS_KEY: z.string(),
});

async function main() {
    const environment = envSchema.parse(process.env);
    const arweave = Arweave.init({
        host: 'arweave.net',
        port: 443,
        protocol: 'https'
    });
    const graphqlClient = new ApolloClient({
        uri: 'https://arweave.net/graphql',
        cache: new InMemoryCache(),
    })
    const blogging = new ArweaveBloggingEngine(
        arweave,
        graphqlClient,
        [{
            "name": "AppName",
            "values": ["Paragraph"]
        },
        {
            "name": "PublicationSlug",
            "values": [environment.PARAGRAPH_PUBLICATION_SLUG]
        }],
        "https://cryptosapiens.xyz"
    );

    const client: RedisClientType<any> = createClient({
        url: environment.REDIS_URL,
    });
    await client.connect();
    const cursor = new RedisBackedCursor(
        client,
        environment.REDIS_KEY,
    );

    console.log("🔍 Searching for new articles");
    const articles = await blogging.getArticles()

    // Get articles that have not been seen
    const lastSeen = await cursor.getLastCursor();
    console.log(`Last seen: ${lastSeen}`);
    const newArticles = articles.filter(article => {
        if (!lastSeen) return true;
        return article.timestamp > lastSeen;
    }).slice(0, 3)
    console.log(`Found ${newArticles.length} new articles`);

    const neynarPoster = new NeynarBackedCrossPoster(
        environment.NEYNAR_API_KEY,
        environment.NEYNAR_SIGNER_UUID,
    )
    for (const articleMeta of newArticles) {
        const article = await blogging.getArticle(articleMeta);
        console.log(`Found new article: ${article.title}`);
        await neynarPoster.postArticle(article);
        await cursor.setCursor(article.timestamp);
        // return;
    }
}

main().catch(err => console.error(err));