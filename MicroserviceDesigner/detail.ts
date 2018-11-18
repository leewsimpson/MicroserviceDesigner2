namespace Details
{
    var schemaDiagram: go.Diagram;

    export class Detail
    {
        type: String;
        name: String;
        detailLink: string;
        description: string;
        schema?: string;
    }

    var callback: (arg0: Detail, nodes: Array<data.nodeData>, links: Array<data.linkData>) => void;

    export function init()
    {
        initSchemaDiagram();
        schemaDiagram.model = new go.GraphLinksModel();

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
            
            if (type == "Operation" && internalChecked)
            {
                d.type = "InternalOperation"
            }
            if (type == "InternalOperation" && !internalChecked)
            {
                d.type = "Operation"
            }

            $('#detailModal').modal('hide');

            callback(d, schemaDiagram.model.nodeDataArray as Array<data.nodeData>, (schemaDiagram.model as go.GraphLinksModel).linkDataArray as Array<data.linkData>);
        });

        $('#detail-btn-cancel').on('click', function ()
        {
            $('#detailModal').modal('hide');
        });
    }

    export function showDetails(baseDiagram:go.Diagram, thisNode: data.nodeData, cb: (detail: Detail) => void)
    {
        if (thisNode.category == 'Operation' || thisNode.category == 'InternalOperation')
            $('#detail-internal-div').show()
        else
            $('#detail-internal-div').hide()
        $('#home-tab').click();
        if (thisNode.category == 'Operation' || thisNode.category == 'InternalOperation' || thisNode.category == 'System' || thisNode.category == 'Event')
            document.getElementById('detail-schema-tab').hidden = false;
        else
            document.getElementById('detail-schema-tab').hidden = true;


        $('#detail-name').val(thisNode.name.toString());
        if (thisNode.description)
            $('#detail-description').val(thisNode.description.toString());
        else
            $('#detail-description').val("");

        if (thisNode.schema)
            $('#detail-schema').val(thisNode.schema.toString());
        else
            $('#detail-schema').val("");

        var isInternal = document.getElementById('detail-internal') as HTMLInputElement;
        isInternal.checked = (thisNode.category == "InternalOperation");

        $('#detail-type').val(thisNode.category.toString());

        if (thisNode.detailLink)
            $('#detail-url').val(thisNode.detailLink.toString());
        else
            $('#detail-url').val("");

        schemaDiagram.model = baseDiagram.model;
        onlyShowAttributes();

        $('#detail-fromSchema').click(function ()
        {
            Details.loadFromSchema(thisNode, function (newNodes, newLinks)
            {
                updateModelFromSchema(baseDiagram, thisNode, newNodes, newLinks);
            });
        });
        callback = cb;
        $('#detailModal').modal();
    }

    function onlyShowAttributes()
    {
        schemaDiagram.startTransaction();
        schemaDiagram.nodes.each(function (node: go.Node)
        {            
            node.visible = (node.category == "Attribute");  
        });
        schemaDiagram.commitTransaction();
    }

    function updateModelFromSchema(baseDiagram:go.Diagram, rootNode: data.nodeData, updatedSchemaNodes: Array<data.nodeData>, updatedSchemaLinks: Array<data.linkData>)
    {
        schemaDiagram.startTransaction();
        schemaDiagram.nodes.each(function (node: go.Node)
        {
            var nodeData = node.data as data.nodeData;
            if (nodeData.category == "Attribute")
            {
                schemaDiagram.model.removeNodeData(nodeData);
            }
        });

        schemaDiagram.model.addNodeDataCollection(updatedSchemaNodes);
        (schemaDiagram.model as go.GraphLinksModel).addLinkDataCollection(updatedSchemaLinks);
        baseDiagram.nodes.each(function (node: go.Node) { if(node.category == "Attribute") node.visible = false; });
        schemaDiagram.commitTransaction();
        console.log(schemaDiagram.model);
    }

    function initSchemaDiagram()
    {        
        var gojs = go.GraphObject.make;

        schemaDiagram = gojs(go.Diagram, 'schemaDiagramDiv',
            {
                layout: gojs(go.TreeLayout, { nodeSpacing: 3 }),
                initialContentAlignment: go.Spot.Center,                
            });

        schemaDiagram.nodeTemplate = gojs(
            go.Node, //TreeNode
            { movable: false }, // user cannot move an individual node
            { selectionAdorned: false },
            gojs('TreeExpanderButton', {
                width: 14,
                height: 14,
                'ButtonIcon.stroke': 'white',
                'ButtonIcon.strokeWidth': 2,
                'ButtonBorder.fill': 'DodgerBlue',
                'ButtonBorder.stroke': null,
                'ButtonBorder.figure': 'Rectangle',
                _buttonFillOver: 'RoyalBlue',
                _buttonStrokeOver: null,
                _buttonFillPressed: null
            }),
            gojs(
                go.Panel,
                'Horizontal',
                { position: new go.Point(16, 0) },
                new go.Binding('background', 'isSelected', function (s)
                {
                    return s ? 'lightblue' : 'white';
                }).ofObject(),
                gojs(
                    go.TextBlock,
                    new go.Binding('text', 'name'))
            )
        );

        // These are the links connecting tree nodes within each group.
        schemaDiagram.linkTemplate = gojs(
            go.Link,
            {
                selectable: false,
                routing: go.Link.Orthogonal,
                fromEndSegmentLength: 4,
                toEndSegmentLength: 4,
                fromSpot: new go.Spot(0.001, 1, 7, 0),
                toSpot: go.Spot.Left
            },
            gojs(go.Shape, { stroke: 'lightgray' })
        );
    }

    declare var $RefParser: any;
    var id: number = 1000;

    export function loadFromSchema(root:data.nodeData, done: (nodes: Array<data.nodeData>, links: Array<data.linkData>) => void)
    {
        var json = JSON.parse($('#detail-schema').val() as string) as JSON;

        $RefParser.dereference(json)
            .then(function (schema)
            {
                var nodeDataArray: Array<data.nodeData> = new Array<data.nodeData>();
                var linkDataArray: Array<data.linkData> = new Array<data.linkData>();
                recurse(schema, nodeDataArray, linkDataArray, root);
                
                done(nodeDataArray, linkDataArray);
            })
            .catch(function (err)
            {
                console.error(err);
            });
    }

    function recurse(schema: any, nodeDataArray, linkDataArray, parentdata: data.nodeData)
    {
        for (var item in schema.properties)
        {
            id++;
            var childdata = { key: id, name: item, category: "Attribute" };
            nodeDataArray.push(childdata);
            linkDataArray.push({ from: parentdata.key, to: childdata.key });
            //console.log(id + ' - ' + item + ' (' + schema.properties[item].type + ') P' + parentdata.key);

            if (schema.properties[item].properties)
            {
                recurse(schema.properties[item], nodeDataArray, linkDataArray, childdata);
            }
        }
    }
}