namespace data
{
    export class nodeData
    {
        key?: number;
        description?: string;
        markDown?: string;

        name: string;
        category?: string;
        isGroup?: boolean;       
        group?: number;
        schema?: string;        
        detailLink?: string;
        estimatedComplexity?:string 
    }

    export class linkData
    {
        key?: number;
        description?: string;
        markDown?: string;

        from: number;
        to: number;
        group: number;
        category?: string;
    }
}