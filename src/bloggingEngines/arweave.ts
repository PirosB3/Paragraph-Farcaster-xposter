import Arweave from "arweave";
import { Article, ArticleEmbed, ArticleMetadata, BlogEngine } from "./types";
import { ApolloClient, NormalizedCacheObject } from '@apollo/client/core';
import { gql } from "../__generated__/gql";
import { GetParagraphPostsQuery, TagFilter } from "../__generated__/graphql";
import { z } from "zod";


const ArweaveJSONSchema = z.object({
  title: z.string(),
  slug: z.string(),
  createdAt: z.number(),
  cover_img: z.object({
    img: z.object({
      src: z.string().url(),
      width: z.number(),
      height: z.number(),
    })
  }).nullable().optional()
});


const GET_ROCKET_INVENTORY = gql(/* GraphQL */ `
query GetParagraphPosts($tags: [TagFilter!]!) {
    transactions(tags: $tags, first: 100){
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          block {
            timestamp
          }
          tags {
            name
            value
          }
        }
      }
    }
  }
`);

export class ArweaveBloggingEngine implements BlogEngine {

  constructor(
    private readonly arweave: Arweave,
    private readonly graphqlClient: ApolloClient<NormalizedCacheObject>,
    private readonly searchTags: TagFilter[],
    private readonly blogUrl: string,
  ) {
  }
  async getArticle(metadata: ArticleMetadata): Promise<Article> {
    const { data } = await this.arweave.transactions.get(metadata.id);

    const buffer = Buffer.from(data)
    const jsonString = buffer.toString('utf8');
    const schema = ArweaveJSONSchema.parse(JSON.parse(jsonString))

    const timestamp = new Date(schema.createdAt);
    const embed: ArticleEmbed | undefined = schema.cover_img?.img ? {
      type: "image",
      url: schema.cover_img.img.src,
    } : undefined;
    return {
      ...metadata,
      title: schema.title,
      link: `${this.blogUrl}/${schema.slug}`,
      embeds: embed ? [embed] : [],
    }
  }

  async getArticles(): Promise<ArticleMetadata[]> {
    const seenSlugs = new Set<string>();

    const result = await this.graphqlClient.query<GetParagraphPostsQuery>({
      query: GET_ROCKET_INVENTORY,
      variables: {
        tags: this.searchTags,
      }
    });

    const articles: ArticleMetadata[] = [];
    for (const edge of result.data.transactions.edges) {
      const node = edge.node;

      // Tags
      const postSlug = node.tags.find(tag => tag.name === "PostSlug");
      if (!postSlug) {
        console.error(`Post ${node.id} does not have a PostSlug tag`);
        continue;
      }
      if (seenSlugs.has(postSlug.value)) {
        continue;
      }
      seenSlugs.add(postSlug.value);

      // If block timestamp does not exist, block is pending (so default to current time)
      const timestamp = node.block?.timestamp ? new Date(node.block.timestamp * 1000) : new Date();
      articles.push({
        id: node.id,
        timestamp,
      })
    }
    articles.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    return articles;
  }
}