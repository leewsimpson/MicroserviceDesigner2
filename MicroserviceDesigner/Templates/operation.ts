namespace Template
{
    export function operation()
    {
        var gojs = go.GraphObject.make;

        return gojs(go.Group, "Vertical",
            {
                alignment: go.Spot.Center
            },
            gojs(go.Panel, "Auto",
                {
                    width: 20,
                    height: 20,
                    toolTip: toolTip(),
                    doubleClick: function (e: go.InputEvent, obj: go.Part) { showDetails(e, obj) },
                    contextMenu: gojs(go.Adornment, "Vertical",
                        contextMenuFocus(),
                        contextMenuHide(),
                        contextItemReferenceTo(),
                        contextItemReferenceFrom(),
                        contextMenuDetails())
                },
                gojs(go.Shape, "Circle",
                    {
                        fill: "#002776",
                        strokeWidth: 0,
                        portId: "",
                        cursor: "pointer", // the Shape is the port, not the whole Node
                        fromLinkable: true,
                        toLinkable: true,
                        fromSpot: go.Spot.AllSides,
                        toSpot: go.Spot.AllSides,
                        alignment: go.Spot.Center

                    })
            ),

            gojs(go.TextBlock,
                {
                    name: "name",
                    margin: 10,
                    //maxSize: new go.Size(160, NaN),
                    wrap: go.TextBlock.WrapFit,
                    textAlign: "center",
                    stroke: "white",
                    editable: true
                },
                new go.Binding("text", "name").makeTwoWay()
            )
        );
    }

}