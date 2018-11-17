namespace Template
{
    //#region context menus
    function contextItemReferenceTo() : go.Adornment
    {
        var gojs = go.GraphObject.make;
        return gojs("ContextMenuButton",gojs(go.TextBlock, "Include References To"), { click: function(e, obj)
        {
            var node:go.Node = e.diagram.findNodeForKey(obj.part.data.key);                            
            e.diagram.startTransaction();
            node.findNodesInto().each(function(n)
            {
                if(n.containingGroup!=null)
                    n.containingGroup.visible = true;

                n.visible = true;
            });
            e.diagram.layout = Util.getcurrentLayout();
            e.diagram.commitTransaction();
        }})
    }

    function contextItemReferenceFrom() : go.Adornment
    {
        var gojs = go.GraphObject.make;
        return gojs("ContextMenuButton",gojs(go.TextBlock, "Include References From"), { click: function(e, obj)
        {
            var node:go.Node = e.diagram.findNodeForKey(obj.part.data.key);                            
            e.diagram.startTransaction();
            node.findNodesOutOf().each(function(n)
            {
                if(n.containingGroup!=null)
                    n.containingGroup.visible = true;
                
                n.visible = true;
            });
            e.diagram.layout = Util.getcurrentLayout();
            e.diagram.commitTransaction();
        }});
    }

    function contextMenuHide() : go.Adornment
    {
        var gojs = go.GraphObject.make;
        return gojs("ContextMenuButton", gojs(go.TextBlock, "Hide"), { click: function(e, obj)
        {
            var node = e.diagram.findNodeForKey(obj.part.data.key);
            e.diagram.startTransaction();
            node.visible=false;
            e.diagram.commitTransaction();
        }
        });
    }

    function contextMenuDetails() : go.Adornment
    {
        var gojs = go.GraphObject.make;
        return gojs("ContextMenuButton", gojs(go.TextBlock, "Details"), { click: function(e, obj)
        {
            var node = obj.part.data;
            var diagram:go.Diagram = e.diagram;
            let input: Details.Detail =
            {
                Name: node.name,
                Description: node.description,
                DetailLink: node.detailLink
            }

            Details.showDetails(input,  function (detail: Details.Detail)
            {                                
                diagram.startTransaction();
                diagram.model.setDataProperty(node, "name", detail.Name);
                diagram.model.setDataProperty(node, "detailLink", detail.DetailLink);
                diagram.model.setDataProperty(node, "description", detail.Description);
                diagram.commitTransaction();
            })
        }
        })
    }

    function contextMenuFocus() : go.Adornment
    {
        var gojs = go.GraphObject.make;
        return gojs("ContextMenuButton", gojs(go.TextBlock, "Focus"), { click: function(e, obj){Util.focus(e.diagram, obj.part.data.key)}});
    }
    //#endregion

    export function apiTemplate()
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
            mouseDragEnter: function(e, group, prev){group.isHighlighted = true;},
            mouseDragLeave: function(e, group, next){group.isHighlighted = false;},
            mouseDrop: function(e, group){group.addMembers(e.diagram.selection, true);},
            layout: gojs(go.LayeredDigraphLayout,
            {
                setsPortSpots: true,
                direction: 90
            }),
            contextMenu: gojs(go.Adornment, "Vertical", 
                gojs("ContextMenuButton", gojs(go.TextBlock, "Focus"), 
                {
                    click: function(e, obj){Util.focusOnAPI(e.diagram, obj.part.data.key)}
                }),
                gojs("ContextMenuButton", gojs(go.TextBlock, "New Operation"), 
                { 
                    click: function(e, obj)
                    {
                        var diagram = e.diagram;
                        diagram.startTransaction('new Operation');
                        var data = 
                        {
                            category : "Operation",
                            group : obj.part.data.key,
                            name : "newOperation"
                        };
                        diagram.model.addNodeData(data);
                        var part = diagram.findPartForData(data);
                        part.location = diagram.toolManager.contextMenuTool.mouseDownPoint;
                        diagram.commitTransaction('new Operation');
                        var txt = part.findObject("name");
                        diagram.commandHandler.editTextBlock(txt);                           
                    }
                }),
                contextMenuHide(),
                contextMenuDetails()
            )
            },
            gojs(go.TextBlock,
            {
                name:"name",
                margin: 8,
                maxSize: new go.Size(160, NaN),
                wrap: go.TextBlock.WrapFit,
                stroke: "#00a1de",
                editable: true
            },
                new go.Binding("text", "name").makeTwoWay()
            ),
            gojs(go.Panel, "Spot",
                gojs(go.Panel, "Auto",
                    gojs(go.Shape, "RoundedRectangle",
                    {
                        fill: "#00a1de",
                        strokeWidth: 0,                        
                    }),
                    gojs(go.Placeholder, {padding: 20})
                ),  
                infoIcon()                            
            )
        );
    }

    export function domainTemplate()
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
                mouseDragEnter: function(e, group, prev){group.isHighlighted = true;},
                mouseDragLeave: function(e, group, next){group.isHighlighted = false;},
                mouseDrop: function(e, group){group.addMembers(e.diagram.selection, true);},
                layout: gojs(go.LayeredDigraphLayout,
                {
                    setsPortSpots: true,
                    direction: 90
                }),
                contextMenu: gojs(go.Adornment, "Vertical", 
                    gojs("ContextMenuButton", gojs(go.TextBlock, "Focus"), 
                    {
                        click: function(e, obj){Util.focusOnAPI(e.diagram, obj.part.data.key)}
                    }),
                    gojs("ContextMenuButton", gojs(go.TextBlock, "New API"), 
                    { 
                        click: function(e, obj)
                        {
                            var diagram = e.diagram;
                            diagram.startTransaction('new API');
                            var data = 
                            {
                                category : "API",
                                isGroup : true,
                                group : obj.part.data.key,
                                name : "newAPI"
                            };
                            diagram.model.addNodeData(data);
                            var part = diagram.findPartForData(data);
                            part.location = diagram.toolManager.contextMenuTool.mouseDownPoint;
                            diagram.commitTransaction('new API');
                            var txt = part.findObject("name");
                            diagram.commandHandler.editTextBlock(txt);                           
                        }
                    }),
                    contextMenuHide(),
                    contextMenuDetails()                    
                    )},
                gojs(go.TextBlock,
                {
                    name:"name",
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
                        stroke:"darkGray",
                        strokeDashArray:[5,10]
                    }),
                    gojs(go.Placeholder,
                    {
                        padding: 20
                    })
            )
        );
    }

    export function eventTemplate()
    {
        var gojs = go.GraphObject.make;

        return gojs(go.Node, "Vertical",
            {
                alignment: go.Spot.Center
            },
            gojs(go.Panel, "Auto",
                {
                    width: 50,
                    height: 50,
                    toolTip: toolTip(),
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
                    name:"name",
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
    
    export function linkTemplate()
    {
        var gojs = go.GraphObject.make;

        return gojs(go.Link,
            {
                //routing:go.Link.AvoidsNodes,
                curve: go.Link.JumpOver,
                corner: 5,
                toolTip: toolTip(),
                contextMenu: gojs(go.Adornment, "Vertical", 
                    gojs("ContextMenuButton", gojs(go.TextBlock, "Mapping"), {click: function(e, obj)
                    {                        
                        var from = e.diagram.model.findNodeDataForKey(obj.part.data.from).name;
                        var to = e.diagram.model.findNodeDataForKey(obj.part.data.to).name;
                        $('#mapper').show(); 
                        mapper.loadMapper(from, to, function(){console.log('mapped');});
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

    export function operationTemplate()
    {
        var gojs = go.GraphObject.make;

        return gojs(go.Node, "Vertical",
            {
                alignment: go.Spot.Center
            },
            gojs(go.Panel, "Auto",
                {
                    width: 20,
                    height: 20,
                    toolTip: toolTip(),
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
                    name:"name",
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

    export function internalOperationTemplate()
    {
        var gojs = go.GraphObject.make;

        return gojs(go.Node, "Vertical",
            {
                alignment: go.Spot.Center
            },
            gojs(go.Panel, "Auto",
                {
                    width: 20,
                    height: 20,
                    toolTip: toolTip(),
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
                    name:"name",
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

    export function systemTemplate()
    {
        var gojs = go.GraphObject.make;

        return gojs(go.Node, "Spot",
        {
            width: 100,
            height: 50,
            toolTip: toolTip(),
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
                    name:"name",
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

    function infoIcon() : go.Adornment
    {
        var gojs = go.GraphObject.make;
        return gojs(go.Picture, "info.png", 
        {
            width: 14, height: 14,
            imageStretch: go.GraphObject.Uniform,
            alignment: new go.Spot(1,0,-10,10),
            click : function(e, obj)
            {
                window.open(obj.part.data.detailLink, "new")
            },
            cursor: "pointer"
        },
        new go.Binding("visible", "", function (data, node){if(data.detailLink) return true; else return false;})
        );
    }

    function toolTip()
    {
        var gojs = go.GraphObject.make;

        return gojs(go.Adornment, "Auto",
                gojs(go.Shape,
                {
                    fill: "#FFFFCC"
                }),
                gojs(go.TextBlock,{margin: 9}, new go.Binding("text", "description"))
            );
    }
}