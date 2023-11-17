export type EmbedType = 'image'

export interface ArticleEmbed {
    type: EmbedType,
    url: string,
} 

export interface ArticleMetadata {
    id: string;
    timestamp: number;
}

export interface Article extends ArticleMetadata {
    title: string;
    link: string;
    embeds: ArticleEmbed[];
    pubDate: Date;
}


export interface BlogEngine {
    getArticles(): Promise<ArticleMetadata[]>;
    getArticle(id: string): Promise<Article>;
}