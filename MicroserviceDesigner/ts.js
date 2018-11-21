var Details;
(function (Details) {
    var _schemaDiagram;
    var _baseDiagram;
    var _thisNode;
    class Detail {
    }
    Details.Detail = Detail;
    var callback;
    function init() {
        initSchemaDiagram();
        _schemaDiagram.model = new go.GraphLinksModel();
        $('#detail-btn-ok').on('click', function () {
            var type = $('#detail-type').val();
            var internalChecked = document.getElementById('detail-internal').checked;
            let d = {
                type: type,
                name: $('#detail-name').val(),
                detailLink: $('#detail-url').val(),
                description: $('#detail-description').val(),
                schema: $('#detail-schema').val()
            };
            if (type == "Operation" && internalChecked) {
                d.type = "InternalOperation";
            }
            if (type == "InternalOperation" && !internalChecked) {
                d.type = "Operation";
            }
            $('#detailModal').modal('hide');
            $('a[data-toggle="tab"]:first').tab('show');
            callback(d, _schemaDiagram.model.nodeDataArray, _schemaDiagram.model.linkDataArray);
        });
        $('#detail-btn-cancel').on('click', function () {
            $('a[data-toggle="tab"]:first').tab('show');
            $('#detailModal').modal('hide');
        });
        $('#detail-fromSchema').click(function () {
            Details.loadFromSchema(_thisNode, function (newNodes, newLinks) {
                updateModelFromSchema(_baseDiagram, _thisNode, newNodes, newLinks);
            });
        });
        $('#detail-schema-tab').click(function () {
            _schemaDiagram.model = _baseDiagram.model;
            showAttributes(_thisNode);
        });
    }
    Details.init = init;
    function showDetails(baseDiagram, thisNode, cb) {
        _baseDiagram = baseDiagram;
        _thisNode = thisNode;
        if (thisNode.category == 'Operation' || thisNode.category == 'InternalOperation')
            $('#detail-internal-div').show();
        else
            $('#detail-internal-div').hide();
        if (thisNode.category == 'Operation' || thisNode.category == 'InternalOperation' || thisNode.category == 'System' || thisNode.category == 'Event')
            document.getElementById('detail-schema-tab').hidden = false;
        else
            document.getElementById('detail-schema-tab').hidden = true;
        $('#detail-name').val(thisNode.name.toString());
        if (thisNode.description)
            $('#detail-description').val(thisNode.description.toString());
        else
            $('#detail-description').val("");
        if (thisNode.schema)
            $('#detail-schema').val(thisNode.schema.toString());
        else
            $('#detail-schema').val("");
        var isInternal = document.getElementById('detail-internal');
        isInternal.checked = (thisNode.category == "InternalOperation");
        $('#detail-type').val(thisNode.category.toString());
        if (thisNode.detailLink)
            $('#detail-url').val(thisNode.detailLink.toString());
        else
            $('#detail-url').val("");
        callback = cb;
        $('#detailModal').modal();
    }
    Details.showDetails = showDetails;
    function showAttributes(thisNode) {
        _schemaDiagram.nodes.each(function (node) { node.visible = false; });
        _schemaDiagram.findNodeForKey(thisNode.key).visible = true;
        _schemaDiagram.nodes.each((n) => { if (n.data.group == thisNode.key)
            n.visible = true; });
    }
    function updateModelFromSchema(baseDiagram, rootNode, updatedSchemaNodes, updatedSchemaLinks) {
        _schemaDiagram.startTransaction();
        var glm = _schemaDiagram.model;
        var removeNodes = _schemaDiagram.model.nodeDataArray.filter((n) => { return (n.group == rootNode.key); });
        var removeLinks = glm.linkDataArray.filter((l) => { return (l.group == rootNode.key); });
        _schemaDiagram.model.removeNodeDataCollection(removeNodes);
        glm.removeLinkDataCollection(removeLinks);
        console.log(glm.linkDataArray);
        _schemaDiagram.model.addNodeDataCollection(updatedSchemaNodes);
        _schemaDiagram.model.addLinkDataCollection(updatedSchemaLinks);
        baseDiagram.nodes.each(function (node) { if (node.category == "Attribute")
            node.visible = false; });
        _schemaDiagram.commitTransaction();
    }
    function initSchemaDiagram() {
        var gojs = go.GraphObject.make;
        _schemaDiagram = gojs(go.Diagram, 'schemaDiagramDiv', {
            layout: gojs(go.TreeLayout, { nodeSpacing: 5 }),
            contentAlignment: go.Spot.Center,
            initialDocumentSpot: go.Spot.Center,
            initialViewportSpot: go.Spot.Center
        });
        _schemaDiagram.groupTemplate =
            gojs(go.Group, "Auto", new go.Binding("position", "xy", go.Point.parse).makeTwoWay(go.Point.stringify), {
                deletable: false,
                layout: gojs(go.TreeLayout, {
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
            }, gojs(go.Shape, { fill: "white", stroke: "lightgray" }), gojs(go.Panel, "Vertical", { defaultAlignment: go.Spot.Left }, gojs(go.TextBlock, { font: "bold 14pt sans-serif", margin: new go.Margin(5, 5, 0, 5) }, new go.Binding("text")), gojs(go.Placeholder, { padding: 5 })));
        _schemaDiagram.nodeTemplate = gojs(go.Node, { movable: false }, { selectionAdorned: false }, gojs('TreeExpanderButton', {
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
        }), gojs(go.Panel, 'Horizontal', { position: new go.Point(16, 0), alignment: go.Spot.Center }, gojs(go.TextBlock, new go.Binding('text', 'name'))));
        _schemaDiagram.linkTemplate = gojs(go.Link, {
            selectable: false,
            routing: go.Link.Orthogonal,
            fromEndSegmentLength: 4,
            toEndSegmentLength: 4,
            fromSpot: new go.Spot(0.001, 1, 7, 0),
            toSpot: go.Spot.Left
        }, gojs(go.Shape, { stroke: 'lightgray' }));
    }
    var id;
    function loadFromSchema(root, done) {
        var json = JSON.parse($('#detail-schema').val());
        id = root.key * 10000;
        $RefParser.dereference(json)
            .then(function (schema) {
            var nodeDataArray = new Array();
            var linkDataArray = new Array();
            recurse(root.key, schema, nodeDataArray, linkDataArray, root);
            done(nodeDataArray, linkDataArray);
        })
            .catch(function (err) {
            console.error(err);
        });
    }
    Details.loadFromSchema = loadFromSchema;
    function recurse(group, schema, nodeDataArray, linkDataArray, parentdata) {
        for (var item in schema.properties) {
            id++;
            var childdata = { key: id, name: item, category: "Attribute", group: group };
            nodeDataArray.push(childdata);
            if (parentdata.key != group)
                linkDataArray.push({ from: parentdata.key, to: childdata.key, group: group });
            if (schema.properties[item].properties) {
                recurse(group, schema.properties[item], nodeDataArray, linkDataArray, childdata);
            }
        }
    }
})(Details || (Details = {}));
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var myDiagram;
var dataString;
var project;
var debugMode;
function unsavedChanges(value) {
    if (value) {
        $("#unsavedChanges").show();
    }
    else {
        $("#unsavedChanges").hide();
    }
}
function confirmModal(callback) {
    $('#modal-btn-si').on('click', function () {
        callback(true);
        $('#confirmModal').modal('hide');
    });
    $('#modal-btn-no').on('click', function () {
        callback(false);
        $('#confirmModal').modal('hide');
    });
}
;
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const urlParams = new URLSearchParams(window.location.search);
        project = urlParams.get('project');
        if (urlParams.get('debugMode'))
            debugMode = true;
        Details.init();
        load();
        var gojs = go.GraphObject.make;
        myDiagram = gojs(go.Diagram, "myDiagramDiv", {
            "toolManager.hoverDelay": 500,
            LayoutCompleted: function () {
            },
            contentAlignment: go.Spot.Center,
            "undoManager.isEnabled": true,
            "draggingTool.isGridSnapEnabled": true,
            allowDrop: true,
            mouseDrop: function (e) {
                if (e.diagram.selection.first().category == "Operation")
                    e.diagram.currentTool.doCancel();
            },
            layout: Util.getcurrentLayout()
        });
        myDiagram.addModelChangedListener(function (evt) {
            if (evt.isTransactionFinished) {
                var latestData = myDiagram.model.toJson();
                if (dataString != latestData) {
                    dataString = latestData;
                    unsavedChanges(true);
                }
                loadAPIs(dataString);
                loadSystems(dataString);
                loadEvents(dataString);
                updateDebug(dataString);
                bindMenu();
            }
        });
        myDiagram.contextMenu = gojs(go.Adornment, "Vertical", gojs("ContextMenuButton", gojs(go.TextBlock, "New API"), {
            click: function (e, obj) {
                var diagram = e.diagram;
                diagram.startTransaction('new API');
                var data = {
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
        }), gojs("ContextMenuButton", gojs(go.TextBlock, "New Domain"), {
            click: function (e, obj) {
                var diagram = e.diagram;
                diagram.startTransaction('new Domain');
                var data = {
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
        }), gojs("ContextMenuButton", gojs(go.TextBlock, "New Event"), {
            click: function (e, obj) {
                var diagram = e.diagram;
                diagram.startTransaction('new event');
                var data = {
                    category: "Event",
                    name: "newEvent"
                };
                diagram.model.addNodeData(data);
                var part = diagram.findPartForData(data);
                part.location = diagram.toolManager.contextMenuTool.mouseDownPoint;
                diagram.commitTransaction('new event');
                var txt = part.findObject("name");
                diagram.commandHandler.editTextBlock(txt);
            }
        }), gojs("ContextMenuButton", gojs(go.TextBlock, "New System"), {
            click: function (e, obj) {
                var diagram = e.diagram;
                diagram.startTransaction('new system');
                var data = {
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
        }));
        myDiagram.groupTemplateMap.add("API", Template.api());
        myDiagram.nodeTemplateMap.add("Operation", Template.operation());
        myDiagram.nodeTemplateMap.add("InternalOperation", Template.internalOperation());
        myDiagram.nodeTemplateMap.add("Event", Template.event());
        myDiagram.groupTemplateMap.add("Domain", Template.domain());
        myDiagram.groupTemplateMap.add("System", Template.system());
        myDiagram.linkTemplateMap.add("", Template.link());
        mapper.init();
    });
}
;
function getCategory(dataString, category) {
    var data = JSON.parse(dataString);
    data.nodeDataArray = data.nodeDataArray.filter(function (node) {
        return node.category == category;
    });
    return data;
}
;
function includeNode(key) {
    if (myDiagram) {
        var fullNode = myDiagram.findNodeForKey(key);
        myDiagram.startTransaction();
        myDiagram.nodes.each(function (node) {
            if (node.data.key == key || (fullNode.containingGroup != null && node.data.key == fullNode.containingGroup.data.key)) {
                node.visible = true;
            }
        });
        myDiagram.layout = Util.getcurrentLayout();
        ;
        myDiagram.commitTransaction();
    }
}
function includeAPI(key) {
    myDiagram.startTransaction();
    myDiagram.nodes.each(function (node) {
        if (node.data.key == key || node.data.group == key) {
            node.visible = true;
        }
    });
    myDiagram.layout = Util.getcurrentLayout();
    myDiagram.commitTransaction();
}
function getInnerNodes(dataString, key) {
    var data = JSON.parse(dataString).nodeDataArray.filter(function (node) {
        return node.group == key;
    });
    return data;
}
;
function createMenuItem(dataString, node) {
    var a = $("<a class='dropdown-item' href='#' id='navbarDropdown' role='button' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>" + node.name + "</a>").on("click", function () { includeNode(node.key); });
    return a;
}
function createOperationHTML(dataString, node) {
    var listItem = $("<li class='dropdown-submenu'/>");
    var a = $("<a class='dropdown-item dropdown-toggle' href='#' id='navbarDropdown' role='button' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>" + node.name + "</a>").on("click", function () { includeAPI(node.key); });
    var ul = $("<ul class='dropdown-menu' aria-labelledby='navbarDropdown'/>");
    getInnerNodes(dataString, node.key).forEach(function (operationNode) {
        var li = $("<li/>");
        var ia = $("<a class='dropdown-item' href='#'>" + operationNode.name + "</a>").on("click", function () { includeNode(operationNode.key); });
        li.append(ia);
        ul.append(li);
    });
    listItem.append(a);
    listItem.append(ul);
    return listItem;
}
function loadAPIs(dataString) {
    var divList = $("#APIList");
    divList.empty();
    var list = getCategory(dataString, "API").nodeDataArray;
    list.forEach(function (node) {
        var api = createOperationHTML(dataString, node);
        divList.append(api);
    });
}
;
function loadSystems(dataString) {
    var divList = $("#SystemList");
    divList.empty();
    var list = getCategory(dataString, "System").nodeDataArray;
    list.forEach(function (node) {
        var api = createMenuItem(dataString, node);
        divList.append(api);
    });
}
;
function bindMenu() {
    var showHideAllFalseLink = $("#showHideAllFalseLink");
    showHideAllFalseLink.click(function () { Util.showHideAll(myDiagram, false, false); });
    var showHideAllTrueLink = $("#showHideAllTrueLink");
    showHideAllTrueLink.click(function () { Util.showHideAll(myDiagram, true, true); });
}
function loadEvents(dataString) {
    var divList = $("#EventList");
    divList.empty();
    var list = getCategory(dataString, "Event").nodeDataArray;
    list.forEach(function (node) {
        var api = createMenuItem(dataString, node);
        divList.append(api);
    });
}
;
function save() {
    return __awaiter(this, void 0, void 0, function* () {
        Util.saveData(myDiagram.model.toJson(), project);
        unsavedChanges(false);
        myDiagram.isModified = false;
    });
}
function load() {
    return __awaiter(this, void 0, void 0, function* () {
        var data = yield Util.getData(project);
        if (data == null) {
        }
        else {
            myDiagram.model = go.Model.fromJson(data);
            myDiagram.nodes.each((n) => { if (n.data.category == "Attribute")
                n.visible = false; });
        }
        dataString = data;
        unsavedChanges(false);
    });
}
function generateImageLink(x) {
    x.href = myDiagram.makeImage({
        scale: 5,
        maxSize: new go.Size(Infinity, Infinity)
    }).src;
}
function updateDebug(dataString) {
    if (debugMode)
        $("#dataDebugger").text(dataString);
}
var mapper;
(function (mapper) {
    var _baseDiagram;
    var mapperDiagram;
    var callback;
    function setupModal() {
        $('#mapper-btn-ok').on('click', function () {
            callback();
            $('#mapper').hide();
        });
        $('#mapper-btn-cancel1').on('click', function () {
            $('#mapper').hide();
        });
        $('#mapper-btn-cancel2').on('click', function () {
            $('#mapper').hide();
        });
    }
    function init() {
        setupModal();
        $('#mapper').hide();
        var gojs = go.GraphObject.make;
        mapperDiagram = gojs(go.Diagram, 'mapperDiv', {
            layout: gojs(go.TreeLayout, { nodeSpacing: 5 }),
            contentAlignment: go.Spot.Center,
            initialDocumentSpot: go.Spot.Center,
            initialViewportSpot: go.Spot.Center
        });
        mapperDiagram.groupTemplate =
            gojs(go.Group, "Auto", new go.Binding("position", "xy", go.Point.parse).makeTwoWay(go.Point.stringify), {
                deletable: false,
                layout: gojs(go.TreeLayout, {
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
            }, gojs(go.Shape, { fill: "white", stroke: "lightgray" }), gojs(go.Panel, "Vertical", { defaultAlignment: go.Spot.Left }, gojs(go.TextBlock, { font: "bold 14pt sans-serif", margin: new go.Margin(5, 5, 0, 5) }, new go.Binding("text")), gojs(go.Placeholder, { padding: 5 })));
        mapperDiagram.nodeTemplate = gojs(go.Node, { movable: false }, { selectionAdorned: false }, gojs('TreeExpanderButton', {
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
        }), gojs(go.Panel, 'Horizontal', { position: new go.Point(16, 0), alignment: go.Spot.Center }, gojs(go.TextBlock, new go.Binding('text', 'name'))));
        mapperDiagram.linkTemplate = gojs(go.Link, {
            selectable: false,
            routing: go.Link.Orthogonal,
            fromEndSegmentLength: 4,
            toEndSegmentLength: 4,
            fromSpot: new go.Spot(0.001, 1, 7, 0),
            toSpot: go.Spot.Left
        }, gojs(go.Shape, { stroke: 'lightgray' }));
    }
    mapper.init = init;
    function oldinit() {
        setupModal();
        $('#mapper').hide();
        var gojs = go.GraphObject.make;
        mapperDiagram = gojs(go.Diagram, 'mapperDiv', {
            'commandHandler.copiesTree': true,
            'commandHandler.deletesTree': true,
            'linkingTool.archetypeLinkData': { category: 'Mapping' },
            initialContentAlignment: go.Spot.Center,
            'undoManager.isEnabled': true
        });
        mapperDiagram.nodeTemplate = gojs(go.Node, { movable: false }, { selectionAdorned: false }, gojs('TreeExpanderButton', {
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
        }), gojs(go.Panel, 'Horizontal', { position: new go.Point(16, 0) }, new go.Binding('background', 'isSelected', function (s) {
            return s ? 'lightblue' : 'white';
        }).ofObject(), gojs(go.TextBlock, new go.Binding('text', 'name'))));
        mapperDiagram.linkTemplate = gojs(go.Link, {
            selectable: false,
            routing: go.Link.Orthogonal,
            fromEndSegmentLength: 4,
            toEndSegmentLength: 4,
            fromSpot: new go.Spot(0.001, 1, 7, 0),
            toSpot: go.Spot.Left
        }, gojs(go.Shape, { stroke: 'lightgray' }));
        mapperDiagram.linkTemplateMap.add('Mapping', gojs(go.Link, {
            isTreeLink: false,
            isLayoutPositioned: false,
            layerName: 'Foreground'
        }, { fromSpot: go.Spot.Right, toSpot: go.Spot.Left }, { relinkableFrom: true, relinkableTo: true }, gojs(go.Shape, { stroke: 'DodgerBlue', strokeWidth: 2 })));
        mapperDiagram.groupTemplate = gojs(go.Group, 'Auto', new go.Binding('position', 'xy', go.Point.parse).makeTwoWay(go.Point.stringify), {
            deletable: false,
            layout: gojs(go.TreeLayout, {
                alignment: go.TreeLayout.AlignmentStart,
                angle: 0,
                compaction: go.TreeLayout.CompactionNone,
                layerSpacing: 20,
                layerSpacingParentOverlap: 1,
                nodeIndentPastParent: 1.0,
                nodeSpacing: 1,
                setsPortSpot: false,
                setsChildPortSpot: false
            })
        }, gojs(go.Shape, { fill: 'white', stroke: 'lightgray' }), gojs(go.Panel, 'Vertical', { defaultAlignment: go.Spot.Left }, gojs(go.TextBlock, {
            font: 'bold 12pt Segoe UI',
            margin: new go.Margin(5, 5, 0, 5),
            stroke: 'DodgerBlue'
        }, new go.Binding('name')), gojs(go.Placeholder, { padding: 5 })));
    }
    mapper.oldinit = oldinit;
    function showMapper(baseDiagram, from, to, callback) {
        callback = callback;
        mapperDiagram.model = baseDiagram.model;
        mapperDiagram.nodes.each(function (node) { node.visible = false; });
        mapperDiagram.findNodeForKey(from.key).visible = true;
        mapperDiagram.findNodeForKey(to.key).visible = true;
        mapperDiagram.nodes.each((n) => { if (n.data.group == from.group || n.data.group == to.group)
            n.visible = true; console.log(n.data); });
        mapperDiagram.links.each((l) => { if (l.data.group == from.group || l.data.group == to.group)
            l.visible = true; });
    }
    mapper.showMapper = showMapper;
})(mapper || (mapper = {}));
var data;
(function (data) {
    class nodeData {
    }
    data.nodeData = nodeData;
    class linkData {
    }
    data.linkData = linkData;
})(data || (data = {}));
var Template;
(function (Template) {
    function api() {
        var gojs = go.GraphObject.make;
        return gojs(go.Group, "Vertical", {
            fromSpot: go.Spot.AllSides,
            toSpot: go.Spot.AllSides,
            stretch: go.GraphObject.Fill,
            ungroupable: true,
            computesBoundsAfterDrag: true,
            computesBoundsIncludingLocation: true,
            toolTip: Template.toolTip(),
            mouseDragEnter: function (e, group, prev) { group.isHighlighted = true; },
            mouseDragLeave: function (e, group, next) { group.isHighlighted = false; },
            mouseDrop: function (e, group) { group.addMembers(e.diagram.selection, true); },
            layout: gojs(go.LayeredDigraphLayout, {
                setsPortSpots: true,
                direction: 90
            }),
            doubleClick: function (e, obj) { Template.showDetails(e, obj); },
            contextMenu: gojs(go.Adornment, "Vertical", gojs("ContextMenuButton", gojs(go.TextBlock, "Focus"), {
                click: function (e, obj) { Util.focusOnAPI(e.diagram, obj.part.data.key); }
            }), gojs("ContextMenuButton", gojs(go.TextBlock, "New Operation"), {
                click: function (e, obj) {
                    var diagram = e.diagram;
                    diagram.startTransaction('new Operation');
                    var data = {
                        category: "Operation",
                        group: obj.part.data.key,
                        name: "newOperation"
                    };
                    diagram.model.addNodeData(data);
                    var part = diagram.findPartForData(data);
                    part.location = diagram.toolManager.contextMenuTool.mouseDownPoint;
                    diagram.commitTransaction('new Operation');
                    var txt = part.findObject("name");
                    diagram.commandHandler.editTextBlock(txt);
                }
            }), Template.contextMenuHide(), Template.contextMenuDetails())
        }, gojs(go.TextBlock, {
            name: "name",
            margin: 8,
            maxSize: new go.Size(160, NaN),
            wrap: go.TextBlock.WrapFit,
            stroke: "#00a1de",
            editable: true
        }, new go.Binding("text", "name").makeTwoWay()), gojs(go.Panel, "Spot", gojs(go.Panel, "Auto", gojs(go.Shape, "RoundedRectangle", {
            fill: "#00a1de",
            strokeWidth: 0,
        }), gojs(go.Placeholder, { padding: 20 })), Template.infoIcon()));
    }
    Template.api = api;
})(Template || (Template = {}));
var Template;
(function (Template) {
    function contextItemReferenceTo() {
        var gojs = go.GraphObject.make;
        return gojs("ContextMenuButton", gojs(go.TextBlock, "Include References To"), {
            click: function (e, obj) {
                var node = e.diagram.findNodeForKey(obj.part.data.key);
                e.diagram.startTransaction();
                node.findNodesInto().each(function (n) {
                    if (n.containingGroup != null)
                        n.containingGroup.visible = true;
                    n.visible = true;
                });
                e.diagram.layout = Util.getcurrentLayout();
                e.diagram.commitTransaction();
            }
        });
    }
    Template.contextItemReferenceTo = contextItemReferenceTo;
    function contextItemReferenceFrom() {
        var gojs = go.GraphObject.make;
        return gojs("ContextMenuButton", gojs(go.TextBlock, "Include References From"), {
            click: function (e, obj) {
                var node = e.diagram.findNodeForKey(obj.part.data.key);
                e.diagram.startTransaction();
                node.findNodesOutOf().each(function (n) {
                    if (n.containingGroup != null)
                        n.containingGroup.visible = true;
                    n.visible = true;
                });
                e.diagram.layout = Util.getcurrentLayout();
                e.diagram.commitTransaction();
            }
        });
    }
    Template.contextItemReferenceFrom = contextItemReferenceFrom;
    function contextMenuHide() {
        var gojs = go.GraphObject.make;
        return gojs("ContextMenuButton", gojs(go.TextBlock, "Hide"), {
            click: function (e, obj) {
                var node = e.diagram.findNodeForKey(obj.part.data.key);
                e.diagram.startTransaction();
                node.visible = false;
                e.diagram.commitTransaction();
            }
        });
    }
    Template.contextMenuHide = contextMenuHide;
    function contextMenuDetails() {
        var gojs = go.GraphObject.make;
        return gojs("ContextMenuButton", gojs(go.TextBlock, "Details"), {
            click: function (e, obj) {
                showDetails(e, obj);
            }
        });
    }
    Template.contextMenuDetails = contextMenuDetails;
    function showDetails(e, obj) {
        var node = obj.part.data;
        var diagram = e.diagram;
        Details.showDetails(diagram, node, function (detail) {
            diagram.startTransaction();
            diagram.model.setDataProperty(node, "name", detail.name);
            diagram.model.setDataProperty(node, "detailLink", detail.detailLink);
            diagram.model.setDataProperty(node, "description", detail.description);
            diagram.model.setDataProperty(node, "schema", detail.schema);
            diagram.model.setDataProperty(node, "category", detail.type);
            diagram.commitTransaction();
        });
    }
    Template.showDetails = showDetails;
    function contextMenuFocus() {
        var gojs = go.GraphObject.make;
        return gojs("ContextMenuButton", gojs(go.TextBlock, "Focus"), { click: function (e, obj) { Util.focus(e.diagram, obj.part.data.key); } });
    }
    Template.contextMenuFocus = contextMenuFocus;
    function infoIcon() {
        var gojs = go.GraphObject.make;
        return gojs(go.Picture, "info.png", {
            width: 14, height: 14,
            imageStretch: go.GraphObject.Uniform,
            alignment: new go.Spot(1, 0, -10, 10),
            click: function (e, obj) {
                window.open(obj.part.data.detailLink, "new");
            },
            cursor: "pointer"
        }, new go.Binding("visible", "", function (data, node) { if (data.detailLink)
            return true;
        else
            return false; }));
    }
    Template.infoIcon = infoIcon;
    function toolTip() {
        var gojs = go.GraphObject.make;
        return gojs(go.Adornment, "Auto", gojs(go.Shape, {
            fill: "#FFFFCC"
        }), gojs(go.TextBlock, { margin: 9 }, new go.Binding("text", "description")));
    }
    Template.toolTip = toolTip;
})(Template || (Template = {}));
var Template;
(function (Template) {
    function domain() {
        var gojs = go.GraphObject.make;
        return gojs(go.Group, "Vertical", {
            fromSpot: go.Spot.AllSides,
            toSpot: go.Spot.AllSides,
            stretch: go.GraphObject.Fill,
            ungroupable: true,
            computesBoundsAfterDrag: true,
            computesBoundsIncludingLocation: true,
            toolTip: Template.toolTip(),
            mouseDragEnter: function (e, group) { group.isHighlighted = true; },
            mouseDragLeave: function (e, group) { group.isHighlighted = false; },
            mouseDrop: function (e, group) { group.addMembers(e.diagram.selection, true); },
            layout: gojs(go.LayeredDigraphLayout, {
                setsPortSpots: true,
                direction: 90
            }),
            doubleClick: function (e, obj) { Template.showDetails(e, obj); },
            contextMenu: gojs(go.Adornment, "Vertical", gojs("ContextMenuButton", gojs(go.TextBlock, "Focus"), {
                click: function (e, obj) { Util.focusOnAPI(e.diagram, obj.part.data.key); }
            }), gojs("ContextMenuButton", gojs(go.TextBlock, "New API"), {
                click: function (e, obj) {
                    var diagram = e.diagram;
                    diagram.startTransaction('new API');
                    var data = {
                        category: "API",
                        isGroup: true,
                        group: obj.part.data.key,
                        name: "newAPI"
                    };
                    diagram.model.addNodeData(data);
                    var part = diagram.findPartForData(data);
                    part.location = diagram.toolManager.contextMenuTool.mouseDownPoint;
                    diagram.commitTransaction('new API');
                    var txt = part.findObject("name");
                    diagram.commandHandler.editTextBlock(txt);
                }
            }), Template.contextMenuHide(), Template.contextMenuDetails())
        }, gojs(go.TextBlock, {
            name: "name",
            margin: 8,
            maxSize: new go.Size(160, NaN),
            wrap: go.TextBlock.WrapFit,
            stroke: "darkGray",
            editable: true
        }, new go.Binding("text", "name").makeTwoWay()), gojs(go.Panel, "Auto", gojs(go.Shape, "RoundedRectangle", {
            fill: "white",
            strokeWidth: 1,
            stroke: "darkGray",
            strokeDashArray: [5, 10]
        }), gojs(go.Placeholder, {
            padding: 20
        })));
    }
    Template.domain = domain;
})(Template || (Template = {}));
var Template;
(function (Template) {
    function event() {
        var gojs = go.GraphObject.make;
        return gojs(go.Node, "Vertical", {
            alignment: go.Spot.Center
        }, gojs(go.Panel, "Auto", {
            width: 50,
            height: 50,
            toolTip: Template.toolTip(),
            doubleClick: function (e, obj) { Template.showDetails(e, obj); },
            contextMenu: gojs(go.Adornment, "Vertical", Template.contextMenuFocus(), Template.contextMenuHide(), Template.contextItemReferenceFrom(), Template.contextItemReferenceTo(), Template.contextMenuDetails()),
        }, gojs(go.Shape, "Hexagon", {
            fill: "#0F6E00",
            strokeWidth: 0,
            portId: "",
            cursor: "pointer",
            fromLinkable: true,
            toLinkable: true,
            fromSpot: go.Spot.AllSides,
            toSpot: go.Spot.AllSides
        }), gojs(go.Panel, "Auto", Template.infoIcon())), gojs(go.TextBlock, {
            name: "name",
            margin: 10,
            wrap: go.TextBlock.WrapFit,
            textAlign: "center",
            stroke: "#0F6E00",
            editable: true
        }, new go.Binding("text", "name").makeTwoWay()));
    }
    Template.event = event;
})(Template || (Template = {}));
var Template;
(function (Template) {
    function internalOperation() {
        var gojs = go.GraphObject.make;
        return gojs(go.Node, "Vertical", {
            alignment: go.Spot.Center
        }, gojs(go.Panel, "Auto", {
            width: 20,
            height: 20,
            toolTip: Template.toolTip(),
            doubleClick: function (e, obj) { Template.showDetails(e, obj); },
            contextMenu: gojs(go.Adornment, "Vertical", Template.contextMenuFocus(), Template.contextMenuHide(), Template.contextItemReferenceTo(), Template.contextItemReferenceFrom(), Template.contextMenuDetails())
        }, gojs(go.Shape, "Circle", {
            fill: "#008fc5",
            strokeWidth: 0,
            portId: "",
            cursor: "pointer",
            fromLinkable: true,
            toLinkable: true,
            fromSpot: go.Spot.AllSides,
            toSpot: go.Spot.AllSides,
            alignment: go.Spot.Center
        })), gojs(go.TextBlock, {
            name: "name",
            margin: 10,
            wrap: go.TextBlock.WrapFit,
            textAlign: "center",
            stroke: "white",
            editable: true
        }, new go.Binding("text", "name").makeTwoWay()));
    }
    Template.internalOperation = internalOperation;
})(Template || (Template = {}));
var Template;
(function (Template) {
    function link() {
        var gojs = go.GraphObject.make;
        return gojs(go.Link, {
            curve: go.Link.JumpOver,
            corner: 5,
            toolTip: Template.toolTip(),
            doubleClick: function (e, obj) {
                var from = e.diagram.model.findNodeDataForKey(obj.part.data.from);
                var to = e.diagram.model.findNodeDataForKey(obj.part.data.to);
                $('#mapper').show();
                mapper.showMapper(myDiagram, from, to, function () { console.log('mapped'); });
            },
            contextMenu: gojs(go.Adornment, "Vertical", gojs("ContextMenuButton", gojs(go.TextBlock, "Mapping"), {
                click: function (e, obj) {
                    var from = e.diagram.model.findNodeDataForKey(obj.part.data.from);
                    var to = e.diagram.model.findNodeDataForKey(obj.part.data.to);
                    $('#mapper').show();
                    mapper.showMapper(myDiagram, from, to, function () { console.log('mapped'); });
                }
            }))
        }, gojs(go.Shape, {
            stroke: "gray",
            strokeWidth: 1,
            toArrow: "Standard"
        }), gojs(go.Shape, {
            toArrow: "Standard",
            stroke: "gray",
            fill: "gray"
        }));
    }
    Template.link = link;
})(Template || (Template = {}));
var Template;
(function (Template) {
    function operation() {
        var gojs = go.GraphObject.make;
        return gojs(go.Node, "Vertical", {
            alignment: go.Spot.Center
        }, gojs(go.Panel, "Auto", {
            width: 20,
            height: 20,
            toolTip: Template.toolTip(),
            doubleClick: function (e, obj) { Template.showDetails(e, obj); },
            contextMenu: gojs(go.Adornment, "Vertical", Template.contextMenuFocus(), Template.contextMenuHide(), Template.contextItemReferenceTo(), Template.contextItemReferenceFrom(), Template.contextMenuDetails())
        }, gojs(go.Shape, "Circle", {
            fill: "#002776",
            strokeWidth: 0,
            portId: "",
            cursor: "pointer",
            fromLinkable: true,
            toLinkable: true,
            fromSpot: go.Spot.AllSides,
            toSpot: go.Spot.AllSides,
            alignment: go.Spot.Center
        })), gojs(go.TextBlock, {
            name: "name",
            margin: 10,
            wrap: go.TextBlock.WrapFit,
            textAlign: "center",
            stroke: "white",
            editable: true
        }, new go.Binding("text", "name").makeTwoWay()));
    }
    Template.operation = operation;
})(Template || (Template = {}));
var Template;
(function (Template) {
    function system() {
        var gojs = go.GraphObject.make;
        return gojs(go.Group, "Spot", {
            width: 100,
            height: 50,
            toolTip: Template.toolTip(),
            doubleClick: function (e, obj) { Template.showDetails(e, obj); },
            contextMenu: gojs(go.Adornment, "Vertical", Template.contextMenuFocus(), Template.contextMenuHide(), Template.contextItemReferenceTo(), Template.contextItemReferenceFrom(), Template.contextMenuDetails())
        }, gojs(go.Panel, "Auto", gojs(go.Shape, "RoundedRectangle", {
            fill: "gray",
            strokeWidth: 0,
            portId: "",
            cursor: "pointer",
            fromSpot: go.Spot.AllSides,
            toSpot: go.Spot.AllSides,
            fromLinkable: true,
            toLinkable: true
        }), gojs(go.TextBlock, {
            name: "name",
            margin: 10,
            wrap: go.TextBlock.WrapFit,
            stroke: "white",
            editable: true
        }, new go.Binding("text", "name").makeTwoWay())), Template.infoIcon());
    }
    Template.system = system;
})(Template || (Template = {}));
var Util;
(function (Util) {
    function getcurrentLayout() {
        return go.GraphObject.make(go.LayeredDigraphLayout, {
            setsPortSpots: false,
            isOngoing: false
        });
    }
    Util.getcurrentLayout = getcurrentLayout;
    function showHideAll(myDiagram, visible, linksVisible) {
        myDiagram.startTransaction();
        myDiagram.nodes.each(function (node) { node.visible = visible && node.category != "Attribute"; });
        myDiagram.links.each(function (node) { node.visible = linksVisible; });
        myDiagram.layout = Util.getcurrentLayout();
        myDiagram.commitTransaction();
    }
    Util.showHideAll = showHideAll;
    function getChildren(diagram, nodeData, eval) {
        var startNode = diagram.findNodeForKey(nodeData.key);
        console.log(nodeData.key);
        var nodeResults = [];
        var linkResults = [];
        var iterate = function (node) {
            node.findTreeChildrenNodes().each(function (n) {
                if (eval(n)) {
                    nodeResults.push(n.data);
                    console.log('node: ' + n.data.key);
                    n.findLinksConnected().each(function (l) {
                        linkResults.push(l.data);
                        console.log('link from ' + l.data.from + ' to ' + l.data.to);
                    });
                    iterate(n);
                }
            });
        };
        iterate(startNode);
        return { nodeResults, linkResults };
    }
    Util.getChildren = getChildren;
    function focusOnAPI(diagram, key) {
        showHideAll(diagram, false, true);
        diagram.startTransaction();
        var insideOperations = diagram.model.nodeDataArray.filter(function (node) { return node.group == key; });
        var linkedNodeKeys = diagram.model.linkDataArray.filter(function (f) {
            return insideOperations.some(function (operation) { return f.from == operation.key || f.to == operation.key; });
        });
        var linkedNodes = diagram.model.nodeDataArray.filter(function (node) {
            return linkedNodeKeys.some(function (link) { return link.from == node.key || link.to == node.key; });
        });
        diagram.nodes.each(function (node) {
            if (linkedNodes.some(function (ln) { return ln.key == node.data.key; })) {
                node.visible = true;
            }
        });
        var containerNodes = diagram.model.nodeDataArray.filter(function (node) {
            return linkedNodes.some(function (subset) { return subset.group == node.key; });
        });
        diagram.nodes.each(function (node) {
            if (containerNodes.some(function (c) { return c.key == node.data.key; })) {
                node.visible = true;
            }
        });
        diagram.layout = Util.getcurrentLayout();
        diagram.commitTransaction();
    }
    Util.focusOnAPI = focusOnAPI;
    function focus(diagram, key) {
        showHideAll(diagram, false, false);
        diagram.startTransaction();
        var linkedNodeKeys = diagram.model.linkDataArray.filter(function (f) { return f.from == key || f.to == key; });
        var linkedNodes = diagram.model.nodeDataArray.filter(function (node) {
            return linkedNodeKeys.some(function (link) { return link.from == node.key || link.to == node.key; });
        });
        diagram.nodes.each(function (node) {
            if (linkedNodes.some(function (ln) { return ln.key == node.data.key; })) {
                node.visible = true;
            }
        });
        var containerNodes = diagram.model.nodeDataArray.filter(function (node) {
            return linkedNodes.some(function (subset) { return subset.group == node.key; });
        });
        diagram.nodes.each(function (node) {
            if (containerNodes.some(function (c) { return c.key == node.data.key; })) {
                node.visible = true;
            }
        });
        diagram.links.each(function (link) {
            if (link.fromNode && link.toNode) {
                if (linkedNodeKeys.some(function (n) { return link.fromNode.data.key == n.from && link.toNode.data.key == n.to; })) {
                    link.visible = true;
                }
            }
        });
        diagram.layout = Util.getcurrentLayout();
        diagram.commitTransaction();
    }
    Util.focus = focus;
    function oneLayer(nodes, allData) {
        var links = allData.linkDataArray.filter(function (link) {
            return nodes.some(function (node) {
                return node.key == link.from || node.key == link.to;
            });
        });
        var outerNodes = allData.nodeDataArray.filter(function (node) {
            return links.some(function (link) {
                return (link.from == node.key || link.to == node.key);
            }) && !nodes.some(function (n) { return n.key == node.key; });
        });
        return outerNodes;
    }
    function getData(project) {
        return __awaiter(this, void 0, void 0, function* () {
            $("#Project").text(project);
            const list = yield $.ajax({
                url: "https://vizzyapi.azurewebsites.net/api/data/" + project,
            });
            if (list.length == 0)
                return null;
            const id = list[0];
            const result = yield $.ajax({
                url: "https://vizzyapi.azurewebsites.net/api/data/" + project + "/" + id,
            });
            return result;
        });
    }
    Util.getData = getData;
    function saveData(d, project) {
        $.ajax({
            url: "https://vizzyapi.azurewebsites.net/api/data/" + project,
            type: "POST",
            data: JSON.stringify(d),
            contentType: "application/json",
            dataType: "json",
            processData: false,
            success: function (result) {
                console.log("saved");
            },
            error: function (jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    }
    Util.saveData = saveData;
})(Util || (Util = {}));
//# sourceMappingURL=ts.js.map