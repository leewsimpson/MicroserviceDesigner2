

namespace Template
{
    export function link()
    {
        var gojs = go.GraphObject.make;

        return gojs(go.Link,
            {
                //routing:go.Link.AvoidsNodes,
                curve: go.Link.JumpOver,
                corner: 5,
                toolTip: toolTip(),
                contextMenu: gojs(go.Adornment, "Vertical",
                    gojs("ContextMenuButton", gojs(go.TextBlock, "Mapping"), {
                        click: function (e: go.InputEvent, obj: go.Part)
                        {
                            var from = e.diagram.model.findNodeDataForKey(obj.part.data.from).name;
                            var to = e.diagram.model.findNodeDataForKey(obj.part.data.to).name;
                            $('#mapper').show();
                            mapper.loadMapper(from, to, function () { console.log('mapped'); });
                        }
                    })
                )
                // routing: go.Link.Orthogonal ,
                //layerName: "Foreground",
                //reshapable: true
                //toShortLength: 4
            },
            gojs(go.Shape,
                {
                    stroke: "gray",
                    strokeWidth: 1,
                    toArrow: "Standard"
                }),
            gojs(go.Shape,
                {
                    toArrow: "Standard",
                    stroke: "gray",
                    fill: "gray"
                })
            // gojs(go.TextBlock, "Calls", {segmentOffset: new go.Point(0,-10)})
        );
    }
}