namespace mapper
{
    var _mapperDiagram: go.Diagram;
    var _callback: () => void;

    function setupModal()
    {
        $('#mapper-btn-ok').on('click', function ()
        {
            _callback();
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

        _mapperDiagram = gojs(go.Diagram, 'mapperDiv',
            {
                layout: gojs(go.TreeLayout, { nodeSpacing: 5 }),
                'linkingTool.archetypeLinkData': { category: 'Mapping' },
                contentAlignment: go.Spot.Center,
                initialDocumentSpot: go.Spot.Center,
                initialViewportSpot: go.Spot.Center
            });

        _mapperDiagram.groupTemplate = gojs
            (
            go.Group, "Auto",
            {
                selectionAdorned: false,
                layout: gojs(go.TreeLayout, {})
            },
            { deletable: false },
            gojs(go.Shape, { fill: "white", stroke: "white" }),
            gojs
                (
                go.Panel, "Vertical",
                { defaultAlignment: go.Spot.Left },
                //gojs(go.TextBlock, { font: "bold 12pt sans-serif", margin: new go.Margin(5, 5, 0, 5) }, new go.Binding("text", "name")),
                gojs(go.Placeholder, { padding: 5 })
                )
            );

        _mapperDiagram.groupTemplateMap.add('RR', gojs
            (
            go.Group, "Auto",
            {
                deletable: false,
                movable: false,
                layout: gojs(go.TreeLayout,
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
            { selectionAdorned: false },
            gojs(go.Shape, { fill: "white", stroke: "white" }),
            gojs
                (
                go.Panel, "Vertical", { defaultAlignment: go.Spot.Left },
                gojs(go.TextBlock, { font: "bold 10pt sans-serif", margin: new go.Margin(5, 5, 0, 5) }, new go.Binding("text", "name")),
                gojs(go.Placeholder, { padding: 5 })
                )
            )
        );

        _mapperDiagram.nodeTemplate = gojs(
            go.Node,
            {
                deletable: false,
                movable: false,
                fromLinkable: true,
                toLinkable: true
            },
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
            gojs
                (
                go.Panel,
                'Horizontal',
                { position: new go.Point(16, 0), alignment: go.Spot.Center },
                new go.Binding('background', 'isSelected', function (s) { return s ? 'lightblue' : 'white' }).ofObject(),
                gojs(go.TextBlock, new go.Binding('text', 'name'))
                )
        );

        _mapperDiagram.linkTemplate = gojs
            (
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

        _mapperDiagram.linkTemplateMap.add('Mapping', gojs(go.Link,
            {
                isTreeLink: false,
                isLayoutPositioned: false,
                layerName: 'Foreground',
                relinkableFrom: true,
                relinkableTo: true
            },
            gojs(go.Shape, { stroke: 'DodgerBlue', strokeWidth: 2, toArrow: "Standard" }),
            gojs(go.Shape,
                {
                    stroke: "DodgerBlue",
                    toArrow: "Standard",
                    fill: "DodgerBlue"
                })
        )
        );
    }

    export function showMapper(from: data.nodeData, to: data.nodeData, callback: any)
    {
        _callback = callback;
        _mapperDiagram.model = Main._diagram.model;

        _mapperDiagram.nodes.each(function (node: go.Node) { node.visible = false; });
        _mapperDiagram.findNodeForKey(from.key).visible = true;
        _mapperDiagram.findNodeForKey(to.key).visible = true;
        Util.showAllParents(_mapperDiagram, from)
        Util.showAllParents(_mapperDiagram, to)

        _mapperDiagram.nodes.each((n) =>
        {
            if (n.data.group == from.key) n.visible = true;
            _mapperDiagram.nodes.each((m) => { if (m.data.group == n.data.key) m.visible = true });
        });
    }


}