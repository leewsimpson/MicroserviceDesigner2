namespace Template
{
    export function mapperNode()
    {
        var gojs = go.GraphObject.make;

        return gojs(
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
    }
}