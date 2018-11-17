
namespace mapper {
    declare var $RefParser: any;

    var mapperDiagram: go.Diagram;
    var callback;

    function setupModal() {
        $('#mapper-btn-ok').on('click', function () {
            callback();
            $('#mapper').hide();
        });

        $('#mapper-btn-cancel1').on('click', function () {
            $('#mapper').hide();
        });
        $('#mapper-btn-cancel2').on('click', function () {
            $('#mapper').hide();
        });
    }

    export function initMapper() {
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
        function checkLink(fn, fp, tn, tp, link) {
            // make sure the nodes are inside different Groups
            if (fn.containingGroup === null || fn.containingGroup.data.key !== -1)
                return false;
            if (tn.containingGroup === null || tn.containingGroup.data.key !== -2)
                return false;
            return true;
        }

        // Each node in a tree is defined using the default nodeTemplate.
        mapperDiagram.nodeTemplate = gojs(
            go.Node, //TreeNode
            { movable: false }, // user cannot move an individual node
            { selectionAdorned: false },
            new go.Binding('fromLinkable', 'group', function (k) {
                return k === -1;
            }),
            new go.Binding('toLinkable', 'group', function (k) {
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
                new go.Binding('background', 'isSelected', function (s) {
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
                    new go.Binding('text')
                ),
                gojs(go.Placeholder, { padding: 5 })
            )
        );
    }

     export function loadMapper(from: string, to: string, cb) {
        callback = cb;
        var nodeDataArray = [
            { isGroup: true, key: -1, text: 'From : ' + from, xy: '0 0', group: 0 },
            { isGroup: true, key: -2, text: 'To : ' + to, xy: '300 0', group: 0 }
        ];
        var linkDataArray = [
            { from: 6, to: 1012, category: 'Mapping' },
            { from: 4, to: 1006, category: 'Mapping' },
            { from: 9, to: 1004, category: 'Mapping' },
            { from: 1, to: 1009, category: 'Mapping' },
            { from: 14, to: 1010, category: 'Mapping' }
        ];

        // initialize tree on left side
        var root = { isGroup: false, key: 0, text: 'x', xy: '', group: -1, name:"root" };
        nodeDataArray.push(root);
        $RefParser.dereference('only.json')
             .then(function (schema) {
                 recurse(schema, nodeDataArray, linkDataArray, root);
                 mapperDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
             })
             .catch(function (err) {
                 console.error(err);
             });

        //for (var i = 0; i < 11;) {
        //    i = makeTree(
        //        3,
        //        i,
        //        17,
        //        nodeDataArray,
        //        linkDataArray,
        //        root,
        //        -1,
        //        root.key
        //    );
        //}

        // initialize tree on right side
         var root2 = { isGroup: false, key: 1000, text: '', xy: '', group: -2, name: "root" };
        nodeDataArray.push(root2);
        for (var i = 0; i < 15;) {
            i = makeTree(
                3,
                i,
                15,
                nodeDataArray,
                linkDataArray,
                root2,
                -2,
                root2.key
            );
        }
        
    }

    // help create a random tree structure
    function makeTree(
        level,
        count,
        max,
        nodeDataArray,
        linkDataArray,
        parentdata,
        groupkey,
        rootkey
    ) {
        var numchildren = Math.floor(Math.random() * 10);
        for (var i = 0; i < numchildren; i++) {
            if (count >= max) return count;
            count++;
            var childdata = { key: rootkey + count, group: groupkey };
            nodeDataArray.push(childdata);
            linkDataArray.push({ from: parentdata.key, to: childdata.key });
            if (level > 0 && Math.random() > 0.5) {
                count = makeTree(
                    level - 1,
                    count,
                    max,
                    nodeDataArray,
                    linkDataArray,
                    childdata,
                    groupkey,
                    rootkey
                );
            }
        }
        return count;
    }

    var id:number = 0;

    function recurse(schema, nodeDataArray, linkDataArray, parentdata) {
        for (var item in schema.properties) {
            id++;
            var childdata = { key: id, name:item, group:-1 }; 
            nodeDataArray.push(childdata);
            linkDataArray.push({ from: parentdata.key, to: childdata.key });

            console.log(id + ' - ' + item + ' (' + schema.properties[item].type + ') P' + parentdata.key);
            //console.log(parentdata.key);
            //console.log(childdata.key);
                
            if (schema.properties[item].properties) {
                console.log(':');
                recurse(schema.properties[item], nodeDataArray, linkDataArray, childdata);
            }
        }
    }
}