import Arweave from "arweave";
import { Article, ArticleMetadata, BlogEngine } from "./types";

interface ArweaveSearchTag {
    name: string;
    values: string[];
}

export class ArweaveBloggingEngine implements BlogEngine {
    
    constructor(
        private readonly arweave: Arweave,
        private readonly searchTags: ArweaveSearchTag[],
    ) {
    }
    getArticle(id: string): Promise<Article> {
        throw new Error("Method not implemented.");
    }

    async getArticles(): Promise<ArticleMetadata[]> {
        return []
    }
}