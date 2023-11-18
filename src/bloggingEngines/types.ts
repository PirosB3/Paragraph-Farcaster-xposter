export type EmbedType = 'image'

export interface ArticleEmbed {
    type: EmbedType,
    url: string,
} 

export interface ArticleMetadata {
    id: string;
    timestamp: Date;
}

export interface Article extends ArticleMetadata {
    title: string;
    link: string;
    embeds: ArticleEmbed[];
}


export interface BlogEngine {
    getArticles(): Promise<ArticleMetadata[]>;
    getArticle(article: ArticleMetadata): Promise<Article>;
}