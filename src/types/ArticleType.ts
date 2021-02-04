export default class ArticleType {
    articleId?: number;
    name?: string;
    excerpt?: string;
    description?: string;
    imageUrl?: string;
    pdfPath?: string;
    price?: number;

    status?: "available" | "visible" | "hidden";
    isPromoted?: number;
    articleFeatures?: {
        articleFeatureId: number;
        featureId: number;
        value: string;
    }[];
    features?: {
        featureId: number;
        name: string;
    }[];
    articlePrices?: {
        articlePriceId: number;
        price: number;
    }[];
    photos?: {
        photoId: number;
        imagePath: string;
    }[];
    documentations?: {
        documentationId: number;
        pdfPath: string;
    }[];
    categoryId?: number;
    category?: {
        name: string;
    };
}