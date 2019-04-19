namespace View
{
    export class ViewModel
    {
        name: string;
        viewData: ViewDataModel[]
    }

    export class ViewDataModel
    {
        key: number;
        location: go.Point
    }

    export var Views: ViewModel[] = [];
    var currentViewData: ViewDataModel[] = [];
    var currentViewName: string;
    var callback: (name: string) => void;

    export function init()
    {
        $('#view-btn-ok').on('click', function ()
        {            
            $('#viewModal').modal('hide');
            callback($('#view-name').val() as string)
        });

        $('#view-btn-cancel').on('click', function ()
        {
            $('#viewModal').modal('hide');
        });
    }

    export function CreateView()
    {
        $('#view-name').val("");
        $('#viewModal').modal();
        $('#view-name').focus();
        callback = function (name: string)
        {
            currentViewName = name;
            currentViewData = [];
            Main._diagram.nodes.each(function (n: go.Node) 
            {
                if (n.visible)
                {
                    currentViewData.push(
                        {
                            key: n.data.key,
                            location: n.location
                        })
                }
            });

            Views.push({ name: currentViewName, viewData: currentViewData });
            Main.loadViews();
        }
    }

    export function UpdateView(name:string)
    {
        let view = Views.find(v => v.name == name);
        if (view)
        {
            currentViewData = [];
            currentViewName = view.name;

            Main._diagram.nodes.each(function (n: go.Node) 
            {
                if (n.visible)
                {
                    currentViewData.push(
                        {
                            key: n.data.key,
                            location: n.location
                        })
                }
            });
            view.viewData = currentViewData;
        }
        else
        {
            console.log(name + " view not found");
        }
    }

    export function RenameView(name: string)
    {
        $('#view-name').val(name);
        $('#viewModal').modal();
        $('#view-name').focus();
        callback = function (newName: string)
        {
            let view = Views.find(v => v.name == name);
            if (view)
            {
                view.name = newName;
                currentViewName = view.name;

                Main.loadViews();
            }
        }
    }

    export function DeleteView(name: string)
    {
        Views = Views.filter(v => v.name != name);
        Main.loadViews();
    }

    export function GetURL(name: string)
    {

    }
    export function View(name:string)
    {
        console.log(Views);
        let view = Views.find(v => v.name == name);
        if (view)
        {
            currentViewData = view.viewData;
            currentViewName = view.name;

            Util.showHideAll(Main._diagram, false, false);
            Main._diagram.nodes.each(function (n: go.Node) 
            {
                let v = currentViewData.find(d => d.key == n.data.key);
                if (v)
                {
                    n.visible = true;
                    n.location = new go.Point(v.location.x, v.location.y);
                }
            });
            Main.includeLinksVisible();
        }
        else
        {
            console.log(name + " view not found");
        }
    }

    //export function SetLocation(point: any, data: any)
    //{
    //    if (currentViewName)
    //    {
    //        var v = currentViewData.find(d => d.key == data.key)
    //        if (v)
    //        {
    //            v.location = point;
    //        }
    //        else
    //        {
    //            currentViewData.push(
    //                {
    //                    key: data.key,
    //                    location: point
    //                })
    //        }
    //        console.log(Views);
    //    }
    //}

    //export function GetLocation(key: number) : go.Point
    //{
    //    if (currentViewName)
    //    {
    //        return currentViewData.find(d => d.key == key).location;
    //    }
    //    else
    //        return null;
    //}
}