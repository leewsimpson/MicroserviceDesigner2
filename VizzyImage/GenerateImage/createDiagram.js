function createDiagram(view, completed)
{
    var complete=false;
    var gojs = go.GraphObject.make;
    _diagram = gojs(go.Diagram, "myDiagramDiv",
    {
        "animationManager.isEnabled": false,
        //"undoManager.isEnabled": true  // enable undo & redo
        contentAlignment: go.Spot.Center,
        LayoutCompleted: function(e) 
        {
        //     //var dia = e.diagram;
        //     //dia.div.style.height = (dia.documentBounds.height + 24) + "px";
        //     //dia.div.style.width = (dia.documentBounds.width + 24) + "px";
            complete = true;
            console.log('complete');
            //completed();
        }
         //initialAutoScale: go.Diagram.UniformToFill,
        //layout: gojs(go.LayeredDigraphLayout,
        // {
        //     setsPortSpots: false,
        //     isOngoing: false
        // }),
    });

    _diagram.groupTemplateMap.add("API", Template.api());
    _diagram.groupTemplateMap.add("Operation", Template.operation());
    _diagram.groupTemplateMap.add("Subscriber", Template.subscriber());
    _diagram.groupTemplateMap.add("InternalOperation", Template.internalOperation());
    _diagram.groupTemplateMap.add("Event", Template.event());
    _diagram.groupTemplateMap.add("Domain", Template.domain());
    _diagram.groupTemplateMap.add("System", Template.system());
    _diagram.linkTemplateMap.add("", Template.link());

    //while(!complete){console.log('waiting...')}
    console.log('diagram setup.');
    return _diagram;
}

