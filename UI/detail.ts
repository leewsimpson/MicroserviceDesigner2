namespace Details
{
    var _requestSchemaDiagram: go.Diagram;
    var _responseSchemaDiagram: go.Diagram;
    var _requestNode: data.nodeData;
    var _responseNode: data.nodeData;

    export class Detail
    {
        type: String;
        name: String;
        detailLink: string;
        description: string;
        schema?: string;
        estimatedComplexity?: string;
    }

    var callback: (arg0: Detail, nodes: Array<data.nodeData>, links: Array<data.linkData>) => void;

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
                schema: $('#detail-schema').val() as string,
                estimatedComplexity: $('#detail-estimatedComplexity').val() as string
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
            $('a[data-toggle="tab"]:first').tab('show');

            callback(d, _requestSchemaDiagram.model.nodeDataArray as Array<data.nodeData>, (_requestSchemaDiagram.model as go.GraphLinksModel).linkDataArray as Array<data.linkData>);
        });

        $('#detail-btn-cancel').on('click', function ()
        {
            $('a[data-toggle="tab"]:first').tab('show');
            $('#detailModal').modal('hide');
        });

        $('#detail-fromSchema-request').click(() => Details.loadFromSchema(_requestNode, '#detail-schema-request', (newNodes, newLinks) => updateModelFromSchema(_requestSchemaDiagram, _requestNode, newNodes, newLinks)));
        $('#detail-fromSchema-response').click(() => Details.loadFromSchema(_responseNode, '#detail-schema-response', (newNodes, newLinks) => updateModelFromSchema(_responseSchemaDiagram, _responseNode, newNodes, newLinks)));

        $('#request-tab').on('shown.bs.tab', () => showOnlyThisNode(_requestSchemaDiagram, _requestNode));
        $('#response-tab').on('shown.bs.tab', () => showOnlyThisNode(_responseSchemaDiagram, _responseNode));

        _requestSchemaDiagram = initSchemaDiagram('requestSchemaDiagramDiv');
        _responseSchemaDiagram = initSchemaDiagram('responseSchemaDiagramDiv');
    }

    export function showDetails(thisNode: data.nodeData, cb: (detail: Detail) => void)
    {
        _requestSchemaDiagram.model = Main._diagram.model;
        _responseSchemaDiagram.model = Main._diagram.model;

        var req = _requestSchemaDiagram.nodes.filter((n) => { var data = n.data as data.nodeData; return (data.name == 'Request' && data.group == thisNode.key) }).first();
        var res = _responseSchemaDiagram.nodes.filter((n) => { var data = n.data as data.nodeData; return (data.name == 'Response' && data.group == thisNode.key) }).first();

        if (req == null)
        {
            _requestNode =
                {
                    name: 'Request',
                    group: thisNode.key,
                    category: 'RR',
                    isGroup: true
                }
            _requestSchemaDiagram.model.addNodeData(_requestNode);
        }
        else
        {
            _requestNode = req.data;
        }

        if (res == null)
        {
            _responseNode =
                {
                    name: 'Response',
                    group: thisNode.key,
                    category: 'RR',
                    isGroup: true
                }
            _requestSchemaDiagram.model.addNodeData(_responseNode);
        }
        else
        {
            _responseNode = res.data;
        }
        Util.hideOtherNodes(Main._diagram);

        if (thisNode.category == 'Operation' || thisNode.category == 'InternalOperation')
            $('#detail-internal-div').show()
        else
            $('#detail-internal-div').hide()

        $('#detail-estimatedComplexity').val(thisNode.estimatedComplexity);


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


        callback = cb;
        $('#detailModal').modal();
    }

    function showOnlyThisNode(diagram: go.Diagram, thisNode: data.nodeData)
    {
        diagram.nodes.each(function (node: go.Node) { node.visible = false; });
        diagram.findNodeForKey(thisNode.key).visible = true;
        Util.showAllParents(diagram, thisNode)

        //var p1 = diagram.findNodeForKey(thisNode.group);
        //p1.visible = true;

        //var p2 = diagram.findNodeForKey(p1.data.group);
        //if (p2) p2.visible = true;

        diagram.nodes.each((n) => { if (n.data.group == thisNode.key) n.visible = true });
    }

    function updateModelFromSchema(diagram: go.Diagram, rootNode: data.nodeData, updatedSchemaNodes: Array<data.nodeData>, updatedSchemaLinks: Array<data.linkData>)
    {
        _requestSchemaDiagram.startTransaction();
        var glm = _requestSchemaDiagram.model as go.GraphLinksModel;

        var removeNodes = _requestSchemaDiagram.model.nodeDataArray.filter((n: data.nodeData) => { return (n.group == rootNode.key) })
        var removeLinks = glm.linkDataArray.filter((l: data.linkData) => { return (l.group == rootNode.key) });

        _requestSchemaDiagram.model.removeNodeDataCollection(removeNodes);
        glm.removeLinkDataCollection(removeLinks);

        _requestSchemaDiagram.model.addNodeDataCollection(updatedSchemaNodes);
        (_requestSchemaDiagram.model as go.GraphLinksModel).addLinkDataCollection(updatedSchemaLinks);
        _requestSchemaDiagram.nodes.each(function (node: go.Node) { if (node.category == "Attribute") node.visible = false; });
        _requestSchemaDiagram.commitTransaction();
        showOnlyThisNode(diagram, rootNode);
        Util.hideOtherNodes(Main._diagram);
    }

    function initSchemaDiagram(divName: string)
    {
        var gojs = go.GraphObject.make;

        var diagram = gojs(go.Diagram, divName,
            {
                layout: gojs(go.TreeLayout, { nodeSpacing: 5 }),
                contentAlignment: go.Spot.Center,
                initialDocumentSpot: go.Spot.Center,
                initialViewportSpot: go.Spot.Center
            });

        diagram.groupTemplate =
            gojs(go.Group, "Auto",
                {
                    deletable: false,
                    layout:
                        gojs(go.TreeLayout,
                            {
                                alignment: go.TreeLayout.AlignmentStart,
                                angle: 0,
                                compaction: go.TreeLayout.CompactionNone,
                                layerSpacing: 16,
                                layerSpacingParentOverlap: 1,
                                nodeIndentPastParent: 1.0,
                                nodeSpacing: 0,
                                setsPortSpot: false,
                                setsChildPortSpot: false
                            })
                },
                //gojs(go.Shape, { fill: "white", stroke: "lightgray" }),
                gojs(go.Panel, "Vertical",
                    { defaultAlignment: go.Spot.Left },
                    //gojs(go.TextBlock,
                    //    { font: "bold 14pt sans-serif", margin: new go.Margin(5, 5, 0, 5) },
                    //    new go.Binding("text", "name")),
                    gojs(go.Placeholder, { padding: 5 })
                )
            );

        diagram.nodeTemplate = gojs(
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
                { position: new go.Point(16, 0), alignment: go.Spot.Center },
                //new go.Binding('background', 'isSelected', function (s)
                //{
                //    return s ? 'lightblue' : 'white';
                //}).ofObject(),
                gojs(
                    go.TextBlock,
                    new go.Binding('text', 'name'))
            )
        );

        // These are the links connecting tree nodes within each group.
        diagram.linkTemplate = gojs(
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

        return diagram;
    }

    declare var $RefParser: any;
    var id: number;

    export function loadFromSchema(root: data.nodeData, textId: string, done: (nodes: Array<data.nodeData>, links: Array<data.linkData>) => void)
    {
        var json = JSON.parse($(textId).val() as string) as JSON;
        id = root.key * 10000;

        $RefParser.dereference(json)
            .then(function (schema: any)
            {
                var nodeDataArray: Array<data.nodeData> = new Array<data.nodeData>();
                var linkDataArray: Array<data.linkData> = new Array<data.linkData>();
                recurse(root.key, schema, nodeDataArray, linkDataArray, root);

                done(nodeDataArray, linkDataArray);
            })
            .catch(function (err: any)
            {
                console.error(err);
            });
    }

    function recurse(group: number, schema: any, nodeDataArray: data.nodeData[], linkDataArray: data.linkData[], parentdata: data.nodeData)
    {
        for (var item in schema.properties)
        {
            id++;
            var childdata = { key: id, name: item, group: group };  //category: "Attribute"
            nodeDataArray.push(childdata);
            if (parentdata.key != group)
                linkDataArray.push({ from: parentdata.key, to: childdata.key, group: group });
            //console.log(id + ' - ' + item + ' (' + schema.properties[item].type + ') P' + parentdata.key);

            if (schema.properties[item].properties)
            {
                recurse(group, schema.properties[item], nodeDataArray, linkDataArray, childdata);
            }
        }
    }
}