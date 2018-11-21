namespace data
{
    export class nodeData
    {
        name: string;
        category?: string;
        isGroup?: boolean;
        key?: number;
        group?: number;
        schema?: string;
        description?: string;
        detailLink?: string;
        //isInternal?: boolean;
    }

    export class linkData
    {
        from: number;
        to: number;
        key?: number;
        group: number;
        category?: string;
    }
}