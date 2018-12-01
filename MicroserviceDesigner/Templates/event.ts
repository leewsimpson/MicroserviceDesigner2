

namespace Template
{
    export function event()
    {
        var gojs = go.GraphObject.make;

        return gojs(go.Group, "Vertical",
            {
                alignment: go.Spot.Center,
                selectionChanged: function (part: go.Part) { Util.changeSelectionNode(part.data) }
            },
            gojs(go.Panel, "Auto",
                {
                    width: 50,
                    height: 50,
                    toolTip: toolTip(),
                    doubleClick: function (e: go.InputEvent, obj: go.Part) { showDetails(e, obj) },                    
                    contextMenu: gojs(go.Adornment, "Vertical",
                        contextMenuFocus(),
                        contextMenuHide(),
                        contextItemReferenceFrom(),
                        contextItemReferenceTo(),
                        contextMenuDetails()
                    ),
                },
                gojs(go.Shape, "Hexagon",
                    {
                        fill: "#0F6E00",
                        strokeWidth: 0,
                        portId: "",
                        cursor: "pointer",
                        fromLinkable: true,
                        toLinkable: true,
                        fromSpot: go.Spot.AllSides,
                        toSpot: go.Spot.AllSides
                    }),
                gojs(go.Panel, "Auto", infoIcon())
            ),
            gojs(go.TextBlock,
                {
                    name: "name",
                    margin: 10,
                    //maxSize: new go.Size(160, NaN),
                    wrap: go.TextBlock.WrapFit,
                    textAlign: "center",
                    stroke: "#0F6E00",
                    editable: true
                },
                new go.Binding("text", "name").makeTwoWay()
            )
        );
    }

}