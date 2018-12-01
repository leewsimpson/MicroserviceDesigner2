namespace Template
{
    export function domain()
    {
        var gojs = go.GraphObject.make;
        return gojs(go.Group, "Vertical",
            {
                fromSpot: go.Spot.AllSides,
                toSpot: go.Spot.AllSides,
                stretch: go.GraphObject.Fill,
                ungroupable: true,
                computesBoundsAfterDrag: true,
                computesBoundsIncludingLocation: true,
                toolTip: toolTip(),
                mouseDragEnter: function (e: go.InputEvent, group: go.Group) { group.isHighlighted = true; },
                mouseDragLeave: function (e: go.InputEvent, group:go.Group) { group.isHighlighted = false; },
                mouseDrop: function (e: go.InputEvent, group: go.Group) { group.addMembers(e.diagram.selection, true); },
                layout: gojs(go.LayeredDigraphLayout,
                    {
                        setsPortSpots: true,
                        direction: 90
                    }),
                doubleClick: function (e: go.InputEvent, obj: go.Part) { showDetails(e, obj) },
                selectionChanged: function (part: go.Part) { Util.changeSelectionNode(part.data) },
                contextMenu: gojs(go.Adornment, "Vertical",
                    gojs("ContextMenuButton", gojs(go.TextBlock, "Focus"),
                        {
                            click: function (e: go.InputEvent, obj: go.Part) { Util.focusOnAPI(e.diagram, obj.part.data.key) }
                        }),
                    gojs("ContextMenuButton", gojs(go.TextBlock, "New API"),
                        {
                            click: function (e: go.InputEvent, obj: go.Part)
                            {
                                var diagram = e.diagram;
                                diagram.startTransaction('new API');
                                var data =
                                {
                                    category: "API",
                                    isGroup: true,
                                    group: obj.part.data.key,
                                    name: "newAPI"
                                };
                                diagram.model.addNodeData(data);
                                var part = diagram.findPartForData(data);
                                part.location = diagram.toolManager.contextMenuTool.mouseDownPoint;
                                diagram.commitTransaction('new API');
                                var txt = part.findObject("name") as go.TextBlock
                                diagram.commandHandler.editTextBlock(txt);
                            }
                        }),
                    contextMenuHide(),
                    contextMenuDetails()
                )
            },
            gojs(go.TextBlock,
                {
                    name: "name",
                    margin: 8,
                    maxSize: new go.Size(160, NaN),
                    wrap: go.TextBlock.WrapFit,
                    stroke: "darkGray",
                    editable: true
                },
                new go.Binding("text", "name").makeTwoWay()
            ),
            gojs(go.Panel, "Auto",
                gojs(go.Shape, "RoundedRectangle",
                    {
                        fill: "white",
                        strokeWidth: 1,
                        stroke: "darkGray",
                        strokeDashArray: [5, 10]
                    }),
                gojs(go.Placeholder,
                    {
                        padding: 20
                    })
            )
        );
    }
}