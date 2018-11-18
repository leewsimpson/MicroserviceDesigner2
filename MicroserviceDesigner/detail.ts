namespace Details
{
    export class Detail
    {
        type: String;
        name: String;
        detailLink: string;
        description: string;
        schema?: string;
    }

    var callback: (arg0: Detail) => void;

    export function init()
    {
        $('#detail-btn-ok').on('click', function ()
        {
            var type = $('#detail-type').val() as string;
            var internalChecked = (document.getElementById('detail-internal') as HTMLInputElement).checked;
            let d: Detail =
            {
                type: type,
                name: $('#detail-name').val() as string,
                detailLink: $('#detail-url').val() as string,
                description: $('#detail-description').val() as string,
                schema: $('#detail-schema').val() as string
            }
            console.log(internalChecked);
            if (type == "Operation" && internalChecked)
            {
                d.type = "InternalOperation"
            }
            if (type == "InternalOperation" && !internalChecked)
            {
                d.type = "Operation"
            }

            $('#detailModal').modal('hide');

            callback(d);
        });

        $('#detail-btn-cancel').on('click', function ()
        {
            $('#detailModal').modal('hide');
        });
    }

    export function showDetails(input: Detail, cb: (detail: Detail) => void)
    {
        if (input.type == 'Operation' || input.type == 'InternalOperation')
            $('#detail-internal-div').show()
        else
            $('#detail-internal-div').hide()

        if (input.type == 'Operation' || input.type == 'InternalOperation' || input.type == 'System' || input.type == 'Event')
            $('#detail-schema-div').show()
        else
            $('#detail-schema-div').hide()


        $('#detail-name').val(input.name.toString());
        if (input.description)
            $('#detail-description').val(input.description.toString());
        else
            $('#detail-description').val("");

        if (input.schema)
            $('#detail-schema').val(input.schema.toString());
        else
            $('#detail-schema').val("");

        var isInternal = document.getElementById('detail-internal') as HTMLInputElement;
        isInternal.checked = (input.type == "InternalOperation");

        $('#detail-type').val(input.type.toString());

        if (input.detailLink)
            $('#detail-url').val(input.detailLink.toString());
        else
            $('#detail-url').val("");

        callback = cb;
        $('#detailModal').modal();
    }
}