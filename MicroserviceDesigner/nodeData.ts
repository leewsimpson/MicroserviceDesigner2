namespace data
{
    export class nodeData
    {
        name: string;
        category?: string;
        isGroup?: boolean;
        key?: string;
        group?: string;
        schema?: string;
        description?: string;
        detailLink?: string;
        //isInternal?: boolean;
    }

    export class linkData
    {
        from: string;
        to: string;
        key?: string;
    }
}