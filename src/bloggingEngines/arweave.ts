import Arweave from "arweave";
import { Article, ArticleMetadata, BlogEngine } from "./types";
import { ApolloClient, NormalizedCacheObject } from '@apollo/client/core';
import { gql } from "../__generated__/gql";
import { GetParagraphPostsQuery, TagFilter } from "../__generated__/graphql";


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
        private readonly searchTags: TagFilter[],
        private readonly graphqlClient: ApolloClient<NormalizedCacheObject>
    ) {
    }
    async getArticle(id: string): Promise<Article> {
        throw new Error("Method not implemented.");
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
            const timestamp = node.block?.timestamp ? new Date(node.block.timestamp / 1000) : new Date();
            articles.push({
                id: node.id,
                timestamp,
            })
        }
        return articles;
    }
}