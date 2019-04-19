function createDiagram(view)
{
    console.log('viewing ' + view);
    var gojs = go.GraphObject.make;
    _diagram = gojs(go.Diagram, "myDiagramDiv",
    {
        "animationManager.isEnabled": false,
        //"undoManager.isEnabled": true  // enable undo & redo
        contentAlignment: go.Spot.Center,
        LayoutCompleted: function(e) 
        {
        //     var dia = e.diagram;
        //     dia.div.style.height = (dia.documentBounds.height + 24) + "px";
        //     dia.div.style.width = (dia.documentBounds.width + 24) + "px";
           
            if (view)
            {
                console.log('viewing ' + view);
                View.View(view);
            }
        },
        // initialAutoScale: go.Diagram.UniformToFill,
        layout: gojs(go.LayeredDigraphLayout,
         {
             setsPortSpots: false,
             isOngoing: false
         }),
    });

    _diagram.groupTemplateMap.add("API", Template.api());
    _diagram.groupTemplateMap.add("Operation", Template.operation());
    _diagram.groupTemplateMap.add("Subscriber", Template.subscriber());
    _diagram.groupTemplateMap.add("InternalOperation", Template.internalOperation());
    _diagram.groupTemplateMap.add("Event", Template.event());
    _diagram.groupTemplateMap.add("Domain", Template.domain());
    _diagram.groupTemplateMap.add("System", Template.system());
    _diagram.linkTemplateMap.add("", Template.link());

    return _diagram;
}

