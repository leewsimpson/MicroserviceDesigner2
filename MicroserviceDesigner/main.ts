namespace Main
{
    export var _diagram: go.Diagram;
    //var _model: go.GraphLinksModel;
    var _dataString: string;
    export var _projectName: string;
    var _isDebugMode: boolean;
    export var _selectedKey: number;
    declare var editormd: any;
    export let _markDownControl: any;
    export let _mainMarkDown: string = '';


    function unsavedChanges(value: boolean)
    {
        if (value)
        {
            $("#unsavedChanges").show();
        }
        else
        {
            $("#unsavedChanges").hide();
        }
    }

    export async function init()
    {
        
        //_markDownControl = new SimpleMDE({ element: document.getElementById("editor"), spellChecker: false, autofocus:true, parsingConfig: { allowAtxHeaderWithoutSpace: true } });
        _markDownControl = editormd("editorDiv", {
            width: "100%",
            //height: "90%",
            watch: true,
            flowChart: true,
            sequenceDiagram: true,   
            emoji: true,
            syncScrolling: "single",
            path: "editormd/lib/",
            onload: function ()
            {                _markDownControl.previewing();                _markDownControl.previewing();                //this.previewing();            },
            onchange: function ()
            {
                console.log("onchange =>", this, this.id, this.settings, this.state);
                if (_selectedKey != null)
                {
                    let node = _diagram.findNodeForKey(_selectedKey);
                    node.data.markDown = _markDownControl.getValue();
                }
                else
                {
                    _mainMarkDown = _markDownControl.getValue();
                }
            }
        });        $('#editorDiv').on('click', function ()        {            if (_markDownControl.state.preview)            {                _markDownControl.previewing();
            }
        });
        //SimpleMDE.togglePreview(_markDownControl);
        //_markDownControl.codemirror.on("change", function ()
        //{
        //    if (_selectedKey != null)
        //    {
        //        let node = _diagram.findNodeForKey(_selectedKey);
        //        node.data.markDown = _markDownControl.value();
        //    }
        //    else
        //    {
        //        _mainMarkDown = _markDownControl.value();
        //    }
        //});

        const urlParams = new URLSearchParams(window.location.search);
        _projectName = urlParams.get('project');

        if (urlParams.get('debugMode'))
        {
            _isDebugMode = true;
            $('#dataDebugger').show();
        }
        else
        {
            $('#dataDebugger').hide();
        }

        load();

        var gojs = go.GraphObject.make;
        _diagram = gojs(go.Diagram, "myDiagramDiv",
            {
                "toolManager.hoverDelay": 500,
                LayoutCompleted: function () 
                {
                    //debugger;
                    //var dia = e.diagram;
                    // add height for horizontal scrollbar
                    //dia.div.style.height = (dia.documentBounds.height + 24) + "px";
                    //dia.div.style.width = (dia.documentBounds.width + 24) + "px";
                },
                contentAlignment: go.Spot.Center,
                "undoManager.isEnabled": true,
                click: function () { Util.changeSelectionNon() },
                "draggingTool.isGridSnapEnabled": true,
                //"commandHandler.canDeleteSelection": function ()
                //{
                //    $('#modal-btn-si').on('click', function ()
                //    {
                //        $('#confirmModal').modal('hide');
                //        return go.CommandHandler.prototype.canDeleteSelection.call(myDiagram.commandHandler);
                //    });

                //    $('#modal-btn-no').on('click', function ()
                //    {
                //        $('#confirmModal').modal('hide');
                //    });
                //    $('#confirmModal').modal();
                //},
                allowDrop: true,
                mouseDrop: function (e: any) 
                {
                    if (e.diagram.selection.first().category == "Operation")
                        e.diagram.currentTool.doCancel();
                },
                layout: Util.getcurrentLayout()
            });

        _diagram.addModelChangedListener(function (evt) 
        {
            if (evt.isTransactionFinished) 
            {
                var latestData = _diagram.model.toJson();
                if (_dataString != latestData)
                {
                    _dataString = latestData;
                    unsavedChanges(true);
                }

                loadAPIs(_dataString);
                loadSystems(_dataString);
                loadEvents(_dataString);
                updateDebug(_dataString);
                bindMenu();
            }
        });
        //gojs(go.TextBlock, "Undo"),{ click: function(e, obj) { e.diagram.commandHandler.undo(); } },

        _diagram.contextMenu = gojs(go.Adornment, "Vertical",
            gojs("ContextMenuButton", gojs(go.TextBlock, "New API"),
                {
                    click: function (e: any, obj: any) 
                    {
                        var diagram = e.diagram;
                        diagram.startTransaction('new API');
                        var data: data.nodeData =
                        {
                            category: "API",
                            isGroup: true,
                            name: "newAPI"
                        };
                        diagram.model.addNodeData(data);
                        var part = diagram.findPartForData(data);
                        part.location = diagram.toolManager.contextMenuTool.mouseDownPoint;
                        diagram.commitTransaction('new API');
                        var txt = part.findObject("name");
                        diagram.commandHandler.editTextBlock(txt);
                    }
                }),
            gojs("ContextMenuButton", gojs(go.TextBlock, "New Domain"),
                {
                    click: function (e: any, obj: any) 
                    {
                        var diagram = e.diagram;
                        diagram.startTransaction('new Domain');
                        var data: data.nodeData =
                        {
                            category: "Domain",
                            isGroup: true,
                            name: "newDomain"
                        };
                        diagram.model.addNodeData(data);
                        var part = diagram.findPartForData(data);
                        part.location = diagram.toolManager.contextMenuTool.mouseDownPoint;
                        diagram.commitTransaction('new Domain');
                        var txt = part.findObject("name");
                        diagram.commandHandler.editTextBlock(txt);
                    }
                }),
            gojs("ContextMenuButton", gojs(go.TextBlock, "New Event"),
                {
                    click: function (e: any, obj: any) 
                    {
                        var diagram = e.diagram;
                        diagram.startTransaction('new event');
                        var data: data.nodeData =
                        {
                            category: "Event",
                            name: "newEvent",
                            isGroup: true,
                        };
                        diagram.model.addNodeData(data);
                        var part = diagram.findPartForData(data);
                        part.location = diagram.toolManager.contextMenuTool.mouseDownPoint;
                        diagram.commitTransaction('new event');
                        var txt = part.findObject("name");
                        diagram.commandHandler.editTextBlock(txt);
                    }
                }),
            gojs("ContextMenuButton", gojs(go.TextBlock, "New System"),
                {
                    click: function (e: any, obj: any) 
                    {
                        var diagram = e.diagram;
                        diagram.startTransaction('new system');
                        var data: data.nodeData =
                        {
                            category: "System",
                            name: "newSystem",
                            isGroup: true,
                        };
                        diagram.model.addNodeData(data);
                        var part = diagram.findPartForData(data);
                        part.location = diagram.toolManager.contextMenuTool.mouseDownPoint;
                        diagram.commitTransaction('new system');
                        var txt = part.findObject("name");
                        diagram.commandHandler.editTextBlock(txt);
                    }
                })
        );

        _diagram.groupTemplateMap.add("API", Template.api());
        _diagram.groupTemplateMap.add("Operation", Template.operation());
        _diagram.groupTemplateMap.add("InternalOperation", Template.internalOperation());
        _diagram.groupTemplateMap.add("Event", Template.event());
        _diagram.groupTemplateMap.add("Domain", Template.domain());
        _diagram.groupTemplateMap.add("System", Template.system());
        _diagram.linkTemplateMap.add("", Template.link());

        _diagram.model = new go.GraphLinksModel();
        mapper.init();
        Details.init();
    };

    function getCategory(dataString: string, category: string)
    {
        var data = JSON.parse(dataString);
        data.nodeDataArray = data.nodeDataArray.filter(function (node: data.nodeData)
        {
            return node.category == category;
        });
        return data;
    };

    function includeNode(key: number)
    {
        if (_diagram)
        {
            var fullNode = _diagram.findNodeForKey(key);
            _diagram.startTransaction();
            _diagram.nodes.each(function (node: go.Node) 
            {
                if (node.data.key == key || (fullNode.containingGroup != null && node.data.key == fullNode.containingGroup.data.key))
                {
                    node.visible = true;
                }
            });

            console.log(_diagram.links.count);
            _diagram.links.each((l) =>
            {
                if (l.fromNode && l.toNode)
                {
                    console.log(l.data);
                    if (l.fromNode.data.key == key || l.toNode.data.key == key)
                    {
                        l.visible = true;
                    }
                }
            });

            _diagram.layout = Util.getcurrentLayout();;
            _diagram.commitTransaction();
        }
    }

    function includeAPI(key: number)
    {
        _diagram.startTransaction();
        _diagram.nodes.each(function (node: go.Node) 
        {
            if (node.data.key == key || node.data.group == key)
            {
                node.visible = true;
            }
        });
        _diagram.layout = Util.getcurrentLayout();
        _diagram.commitTransaction();
    }

    function getInnerNodes(dataString: string, key: number)
    {
        var data = JSON.parse(dataString).nodeDataArray.filter(function (node: data.nodeData)
        {
            return node.group == key;
        });
        return data;
    };

    function createMenuItem(dataString: string, node: data.nodeData)
    {
        //var listItem = $("<li class='dropdown-submenu'/>");
        var a = $("<a class='dropdown-item' href='#' id='navbarDropdown' role='button' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>" + node.name + "</a>").on("click", function () { includeNode(node.key) });
        //listItem.append(a)
        return a;
    }

    function createOperationHTML(dataString: string, node: data.nodeData)
    {
        var listItem = $("<li class='dropdown-submenu'/>");
        var a = $("<a class='dropdown-item dropdown-toggle' href='#' id='navbarDropdown' role='button' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>" + node.name + "</a>").on("click", function () { includeAPI(node.key) });
        var ul = $("<ul class='dropdown-menu' aria-labelledby='navbarDropdown'/>");

        getInnerNodes(dataString, node.key).forEach(function (operationNode: data.nodeData)
        {
            var li = $("<li/>");
            var ia = $("<a class='dropdown-item' href='#'>" + operationNode.name + "</a>").on("click", function () { includeNode(operationNode.key) });
            li.append(ia);
            ul.append(li);
        });

        listItem.append(a)
        listItem.append(ul);
        return listItem;
    }

    function loadAPIs(dataString: string)
    {
        var divList = $("#APIList");
        divList.empty();

        var list = getCategory(dataString, "API").nodeDataArray;

        list.forEach(function (node: data.nodeData) 
        {
            var api = createOperationHTML(dataString, node);
            divList.append(api);
        });
    };

    function loadSystems(dataString: string)
    {
        var divList = $("#SystemList");
        divList.empty();

        var list = getCategory(dataString, "System").nodeDataArray;
        list.forEach(function (node: data.nodeData) 
        {
            var api = createMenuItem(dataString, node);
            divList.append(api);
        });
    };

    function bindMenu()
    {
        var showHideAllFalseLink = $("#showHideAllFalseLink") as JQuery<HTMLLinkElement>;
        showHideAllFalseLink.click(function () { Util.showHideAll(_diagram, false, false) });

        var showHideAllTrueLink = $("#showHideAllTrueLink") as JQuery<HTMLLinkElement>;
        showHideAllTrueLink.click(function () { Util.showHideAll(_diagram, true, true) });
    }

    function loadEvents(dataString: string)
    {
        var divList = $("#EventList");
        divList.empty();

        var list = getCategory(dataString, "Event").nodeDataArray;
        list.forEach(function (node: data.nodeData) 
        {
            var api = createMenuItem(dataString, node);
            divList.append(api);
        });
    };

    export async function save()
    {
        let data = _diagram.model.toJson();
        let dataObject = JSON.parse(data);
        dataObject.mainMarkDown = _mainMarkDown;

        Util.saveData(JSON.stringify(dataObject), _projectName);
        unsavedChanges(false);
        _diagram.isModified = false;
    }

    export async function load()
    {
        var data = await Util.getData(_projectName);
        if (data == null)
        {
            //myDiagram.model = new go.Model();
        }
        else
        {
            let model = go.Model.fromJson(data.result);

            model.nodeDataArray.forEach((n: data.nodeData) =>
            {
                if (n.category == 'System') n.isGroup = true;
                if (n.category == 'Operation') n.isGroup = true;
                if (n.category == 'Event') n.isGroup = true;
            });

            _diagram.model = model;
            _mainMarkDown = JSON.parse(data.result).mainMarkDown;
            if (!_mainMarkDown) _mainMarkDown = '';
            _dataString = JSON.stringify(model);
            Util.hideOtherNodes(_diagram);
            Util.changeSelectionNon()
        }
        unsavedChanges(false);
    }

    export function generateImageLink(x: HTMLLinkElement)
    {
        x.href = _diagram.makeImage(
            {
                scale: 5,
                maxSize: new go.Size(Infinity, Infinity)
            }
        ).src;
    }

    function updateDebug(dataString: string)
    {
        if (_isDebugMode)
            $("#dataDebugger").text(dataString);
    }
}