namespace Details
{
    export class Detail
    {
        Name: String;
        DetailLink: string;
        Description: string;
    }

    var callback;

    export function init()
    {
        $('#detail-btn-ok').on('click', function()
        {
            let d:Detail =
            {
                Name : <string>$('#detail-name').val(),
                DetailLink : <string>$('#detail-url').val(),
                Description : <string>$('#detail-description').val()
            }
            $('#detailModal').modal('hide');

            callback(d);
        });

        $('#detail-btn-cancel').on('click', function()
        {
            $('#detailModal').modal('hide');
        });
    }

    export function showDetails(input: Detail, cb)
    {   
        $('#detail-name').val(input.Name.toString());
        if(input.Description) 
            $('#detail-description').val(input.Description.toString());
        else
            $('#detail-description').val("");

        if(input.DetailLink) 
            $('#detail-url').val(input.DetailLink.toString());
        else
            $('#detail-url').val(""); 

        callback = cb;
        $('#detailModal').modal();
    }
}