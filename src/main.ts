import Arweave from "arweave";
import { ArweaveBloggingEngine } from './bloggingEngines/arweave';
import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client/core';
import { RedisBackedCursor } from './cursor';
import { RedisClientType, createClient } from 'redis';
import { z } from "zod";
import { NeynarBackedCrossPoster } from "./crossPoster/farcaster";
import { EnvironmentSchema } from "./types";


// Reduce the number of posts per iteration to avoid rate limiting
const MAX_POSTS_PER_ITERATION = 3;


function initializeArweave(): Arweave {
    console.log("🌐 Initializing Arweave...");
    return Arweave.init({
        host: 'arweave.net',
        port: 443,
        protocol: 'https'
    });
}

function initializeApolloClient(): ApolloClient<NormalizedCacheObject> {
    console.log("🚀 Initializing Apollo Client...");
    return new ApolloClient({
        uri: 'https://arweave.net/graphql',
        cache: new InMemoryCache(),
    });
}

function initializeBloggingEngine(arweave: Arweave, graphqlClient: ApolloClient<NormalizedCacheObject>, environment: z.infer<typeof EnvironmentSchema>): ArweaveBloggingEngine {
    console.log("✍️ Initializing Blogging Engine...");
    return new ArweaveBloggingEngine(
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
}

async function initializeRedisClient(environment: z.infer<typeof EnvironmentSchema>): Promise<RedisClientType<any>> {
    console.log("🔌 Initializing Redis Client...");
    const client: RedisClientType<any> = createClient({ url: environment.REDIS_URL });
    await client.connect();
    return client;
}

async function processNewArticles(blogging: ArweaveBloggingEngine, cursor: RedisBackedCursor, environment: z.infer<typeof EnvironmentSchema>) {
    console.log("🔎 Searching for new articles");
    const articles = await blogging.getArticles();

    const lastSeen = await cursor.getLastCursor();
    console.log(`🕒 Last seen: ${lastSeen}`);
    const newArticles = articles.filter(article => !lastSeen || article.timestamp > lastSeen).slice(0, MAX_POSTS_PER_ITERATION);
    console.log(`📰 Cross-posting ${newArticles.length} new articles`);

    const neynarPoster = new NeynarBackedCrossPoster(environment.NEYNAR_API_KEY, environment.NEYNAR_SIGNER_UUID);

    for (const articleMeta of newArticles) {
        const article = await blogging.getArticle(articleMeta);
        console.log(`🆕 Found new article: ${article.title}`);
        await neynarPoster.postArticle(article);
        await cursor.setCursor(article.timestamp);
    }
    console.log("✅ Done");
}

async function main() {
    const environment = EnvironmentSchema.parse(process.env);

    const arweave = initializeArweave();
    const graphqlClient = initializeApolloClient();
    const blogging = initializeBloggingEngine(arweave, graphqlClient, environment);

    const redisClient = await initializeRedisClient(environment);
    const cursor = new RedisBackedCursor(redisClient, environment.REDIS_KEY);

    await processNewArticles(blogging, cursor, environment);
}

main().catch(err => console.error("🔥 Fatal Error:", err));
