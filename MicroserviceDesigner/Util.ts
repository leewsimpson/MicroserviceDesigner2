

namespace Util
{
    export function getcurrentLayout()
    {
        return go.GraphObject.make(go.LayeredDigraphLayout,
        {
            setsPortSpots:false,
            isOngoing:false
        });
    }

    export function showHideAll(myDiagram:go.Diagram, visible:boolean, linksVisible:boolean)
    {
        myDiagram.startTransaction();
        myDiagram.nodes.each(function(node: go.Node) {node.visible = visible && node.category!="Attribute";});
        myDiagram.links.each(function(node: go.Link) {node.visible = linksVisible;});
        myDiagram.layout = Util.getcurrentLayout();
        myDiagram.commitTransaction();
    }

    export function focusOnAPI(diagram: go.Diagram, key: number)
    {
        showHideAll(diagram, false, true);
        diagram.startTransaction();

        var insideOperations = diagram.model.nodeDataArray.filter(function(node: data.nodeData){return node.group == key;});
        
        var linkedNodeKeys = (diagram.model as go.GraphLinksModel).linkDataArray.filter(function(f: data.linkData) 
        {
            return insideOperations.some(function(operation: data.linkData) { return f.from == operation.key || f.to == operation.key});
        });

        var linkedNodes = diagram.model.nodeDataArray.filter(function(node: data.nodeData)
        {
            return linkedNodeKeys.some(function (link: data.linkData) {return link.from==node.key || link.to == node.key});
        });

        diagram.nodes.each(function(node) 
        {
            if (linkedNodes.some(function (ln: data.linkData){return ln.key==node.data.key})){node.visible = true;}
        });
        
        var containerNodes = diagram.model.nodeDataArray.filter(function(node: data.nodeData)
        {
            return linkedNodes.some(function(subset: data.nodeData) {return subset.group==node.key;});        
        });
        diagram.nodes.each(function(node) 
        {
            if(containerNodes.some(function(c: data.nodeData) {return c.key==node.data.key})){node.visible = true;}
        });

        diagram.layout = Util.getcurrentLayout();
        diagram.commitTransaction();    
    }

    export function focus(diagram: go.Diagram, key: number)
    {
        showHideAll(diagram, false, false);
        diagram.startTransaction();

        var linkedNodeKeys: Array<data.linkData> = (diagram.model as go.GraphLinksModel).linkDataArray.filter(function (f: data.linkData) { return f.from == key || f.to == key; }) as Array<data.linkData>;
        var linkedNodes = diagram.model.nodeDataArray.filter(function(node: data.nodeData)
        {
            return linkedNodeKeys.some(function (link: data.linkData) {return link.from==node.key || link.to == node.key;});
        });
        
        diagram.nodes.each(function(node: go.Node) 
        {
            if (linkedNodes.some(function (ln: data.linkData){return ln.key==node.data.key})){node.visible = true;}
        });
        
        var containerNodes = diagram.model.nodeDataArray.filter(function(node: data.nodeData)
        {
            return linkedNodes.some(function(subset: data.nodeData) {return subset.group==node.key;});        
        });
        diagram.nodes.each(function(node: go.Node) 
        {
            if(containerNodes.some(function(c: data.nodeData) {return c.key==node.data.key})){node.visible = true;}
        });
        diagram.links.each(function(link: go.Link) 
        {   
            if(link.fromNode && link.toNode)
            {
                if (linkedNodeKeys.some(function (n: data.linkData) {return link.fromNode.data.key==n.from && link.toNode.data.key == n.to;}))
                {
                    link.visible = true;
                }
            }
        });

        diagram.layout = Util.getcurrentLayout();
        diagram.commitTransaction();    
    }

    function oneLayer(nodes, allData)
    {
        var links = allData.linkDataArray.filter(function (link)
        {
            return nodes.some(function(node) 
            {
                return node.key==link.from || node.key==link.to;
            });
        })

        var outerNodes = allData.nodeDataArray.filter(function (node)
        {
            return links.some(function (link)
            {
                return (link.from == node.key || link.to == node.key) 
            }) && !nodes.some(function (n){return n.key == node.key});
        });

        return outerNodes;
    }

    export async function getData(project:string)
    {
        $("#Project").text(project);
        const list = await $.ajax(
        {
            url: "https://vizzyapi.azurewebsites.net/api/data/" + project,
        });

        if(list.length==0)
            return null;

        const id = list[0];

        const result = await $.ajax(
            {
                url: "https://vizzyapi.azurewebsites.net/api/data/" + project + "/" + id,
            });
            
        return result;
    }

    export function saveData(d, project:string)
    {
        $.ajax(
            {
                url: "https://vizzyapi.azurewebsites.net/api/data/" + project,
                type: "POST",
                data: JSON.stringify(d),
                contentType: "application/json",
                dataType: "json",
                processData: false,
                success: function(result)
                {
                    console.log("saved");
                },
                error: function( jqXhr, textStatus, errorThrown ){
                    console.log( errorThrown );
                }
            });
    }
}