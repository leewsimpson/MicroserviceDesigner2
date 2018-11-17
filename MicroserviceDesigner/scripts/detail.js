var Details;
(function (Details) {
    class Detail {
    }
    Details.Detail = Detail;
    var callback;
    function init() {
        $('#detail-btn-ok').on('click', function () {
            let d = {
                Name: $('#detail-name').val(),
                DetailLink: $('#detail-url').val(),
                Description: $('#detail-description').val()
            };
            $('#detailModal').modal('hide');
            callback(d);
        });
        $('#detail-btn-cancel').on('click', function () {
            $('#detailModal').modal('hide');
        });
    }
    Details.init = init;
    function showDetails(input, cb) {
        $('#detail-name').val(input.Name.toString());
        if (input.Description)
            $('#detail-description').val(input.Description.toString());
        else
            $('#detail-description').val("");
        if (input.DetailLink)
            $('#detail-url').val(input.DetailLink.toString());
        else
            $('#detail-url').val("");
        callback = cb;
        $('#detailModal').modal();
    }
    Details.showDetails = showDetails;
})(Details || (Details = {}));
//# sourceMappingURL=detail.js.map