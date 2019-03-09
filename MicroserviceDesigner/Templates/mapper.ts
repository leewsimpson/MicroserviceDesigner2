namespace Template
{
    export function mapper()
    {
        var gojs = go.GraphObject.make;
        return gojs
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
    }

    export function mapperLinkList()
    {
        var gojs = go.GraphObject.make;
        return gojs
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
    }

    export function mapperLink()
    {
        var gojs = go.GraphObject.make;
        return gojs(go.Link,
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
                }))
    }
}