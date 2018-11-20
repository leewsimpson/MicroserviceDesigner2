namespace mapper
{
    var _baseDiagram: go.Diagram;
    var mapperDiagram: go.Diagram;
    var callback: () => void;

    function setupModal()
    {
        $('#mapper-btn-ok').on('click', function ()
        {
            callback();
            $('#mapper').hide();
        });

        $('#mapper-btn-cancel1').on('click', function ()
        {
            $('#mapper').hide();
        });
        $('#mapper-btn-cancel2').on('click', function ()
        {
            $('#mapper').hide();
        });
    }

    export function init()
    {
        setupModal();
        $('#mapper').hide();

        var gojs = go.GraphObject.make;

        mapperDiagram = gojs(go.Diagram, 'mapperDiv', {
            'commandHandler.copiesTree': true,
            'commandHandler.deletesTree': true,
            // newly drawn links always map a node in one tree to a node in another tree
            'linkingTool.archetypeLinkData': { category: 'Mapping' },
            'linkingTool.linkValidation': checkLink,
            'relinkingTool.linkValidation': checkLink,
            initialContentAlignment: go.Spot.Center,
            'undoManager.isEnabled': true
        });

        // All links must go from a node inside the "Left Side" Group to a node inside the "Right Side" Group.
        function checkLink(fromNode: go.Node, toNode: go.Node)
        {
            // make sure the nodes are inside different Groups
            if (fromNode.containingGroup === null || fromNode.containingGroup.data.key !== -1)
                return false;
            if (toNode.containingGroup === null || toNode.containingGroup.data.key !== -2)
                return false;
            return true;
        }

        // Each node in a tree is defined using the default nodeTemplate.
        mapperDiagram.nodeTemplate = gojs(
            go.Node, //TreeNode
            { movable: false }, // user cannot move an individual node
            { selectionAdorned: false },
            new go.Binding('fromLinkable', 'group', function (k)
            {
                return k === -1;
            }),
            new go.Binding('toLinkable', 'group', function (k)
            {
                return k === -2;
            }),
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
        mapperDiagram.linkTemplate = gojs(
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

        // These are the blue links connecting a tree node on the left side with one on the right side.
        mapperDiagram.linkTemplateMap.add(
            'Mapping',
            gojs(
                go.Link,
                {
                    isTreeLink: false,
                    isLayoutPositioned: false,
                    layerName: 'Foreground'
                },
                { fromSpot: go.Spot.Right, toSpot: go.Spot.Left },
                { relinkableFrom: true, relinkableTo: true },
                gojs(go.Shape, { stroke: 'DodgerBlue', strokeWidth: 2 })
            )
        );

        mapperDiagram.groupTemplate = gojs(
            go.Group,
            'Auto',
            new go.Binding('position', 'xy', go.Point.parse).makeTwoWay(
                go.Point.stringify
            ),
            {
                deletable: false,
                layout: gojs(go.TreeLayout, {
                    alignment: go.TreeLayout.AlignmentStart,
                    angle: 0,
                    compaction: go.TreeLayout.CompactionNone,
                    layerSpacing: 20,
                    layerSpacingParentOverlap: 1,
                    nodeIndentPastParent: 1.0,
                    nodeSpacing: 1,
                    setsPortSpot: false,
                    setsChildPortSpot: false
                })
            },
            gojs(go.Shape, { fill: 'white', stroke: 'lightgray' }),
            gojs(
                go.Panel,
                'Vertical',
                { defaultAlignment: go.Spot.Left },
                gojs(
                    go.TextBlock,
                    {
                        font: 'bold 12pt Segoe UI',
                        margin: new go.Margin(5, 5, 0, 5),
                        stroke: 'DodgerBlue'
                    },
                    new go.Binding('name')
                ),
                gojs(go.Placeholder, { padding: 5 })
            )
        );
    }

    export function showMapper(baseDiagram: go.Diagram, from: data.nodeData, to: data.nodeData, callback)
    {
        callback = callback;
        mapperDiagram.model = baseDiagram.model;

        //var nodeDataArray = [
        //    { isGroup: true, key: -1, text: 'From : ' + from.name, xy: '0 0', group: 0 },
        //    { isGroup: true, key: -2, text: 'To : ' + to.name, xy: '300 0', group: 0 }
        //];

        mapperDiagram.nodes.each(function (node: go.Node) { node.visible = false; });
        mapperDiagram.findNodeForKey(from.key).visible = true;
        mapperDiagram.findNodeForKey(to.key).visible = true;
        
        var results1 = Util.getChildren(mapperDiagram, from, function (n: go.Node) { return (n.data as data.nodeData).category == 'Attribute'; });
        var results2 = Util.getChildren(mapperDiagram, to, function (n: go.Node) { return (n.data as data.nodeData).category == 'Attribute'; });

        //todo link types

        results1.nodeResults.forEach(function (n: data.nodeData) { mapperDiagram.findNodeForKey(n.key).visible = true});
        results2.nodeResults.forEach(function (n: data.nodeData) { mapperDiagram.findNodeForKey(n.key).visible = true});
    }
}