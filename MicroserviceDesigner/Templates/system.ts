

namespace Template
{
    export function system()
    {
        var gojs = go.GraphObject.make;

        return gojs(go.Group, "Spot",
            {
                width: 100,
                height: 50,
                toolTip: toolTip(),
                doubleClick: function (e: go.InputEvent, obj: go.Part) { showDetails(e, obj) },
                contextMenu: gojs(go.Adornment, "Vertical",
                    contextMenuFocus(),
                    contextMenuHide(),
                    contextItemReferenceTo(),
                    contextItemReferenceFrom(),
                    contextMenuDetails())
            },
            gojs(go.Panel, "Auto",
                gojs(go.Shape, "RoundedRectangle",
                    {
                        fill: "gray",
                        strokeWidth: 0,
                        portId: "",
                        cursor: "pointer",
                        fromSpot: go.Spot.AllSides,
                        toSpot: go.Spot.AllSides,
                        fromLinkable: true,
                        toLinkable: true
                    }),
                gojs(go.TextBlock,
                    {
                        name: "name",
                        margin: 10,
                        wrap: go.TextBlock.WrapFit,
                        stroke: "white",
                        editable: true
                    },
                    new go.Binding("text", "name").makeTwoWay()
                )
            ),
            infoIcon()
        );
    }
}