var Details;
(function (Details) {
    var _requestSchemaDiagram;
    var _responseSchemaDiagram;
    var _requestNode;
    var _responseNode;
    class Detail {
    }
    Details.Detail = Detail;
    var callback;
    function init() {
        $('#detail-btn-ok').on('click', function () {
            var type = $('#detail-type').val();
            var internalChecked = document.getElementById('detail-internal').checked;
            let d = {
                type: type,
                name: $('#detail-name').val(),
                detailLink: $('#detail-url').val(),
                description: $('#detail-description').val(),
                schema: $('#detail-schema').val(),
                estimatedComplexity: $('#detail-estimatedComplexity').val()
            };
            if (type == "Operation" && internalChecked) {
                d.type = "InternalOperation";
            }
            if (type == "InternalOperation" && !internalChecked) {
                d.type = "Operation";
            }
            $('#detailModal').modal('hide');
            $('a[data-toggle="tab"]:first').tab('show');
            callback(d, _requestSchemaDiagram.model.nodeDataArray, _requestSchemaDiagram.model.linkDataArray);
        });
        $('#detail-btn-cancel').on('click', function () {
            $('a[data-toggle="tab"]:first').tab('show');
            $('#detailModal').modal('hide');
        });
        $('#detail-fromSchema-request').click(() => Details.loadFromSchema(_requestNode, '#detail-schema-request', (newNodes, newLinks) => updateModelFromSchema(_requestSchemaDiagram, _requestNode, newNodes, newLinks)));
        $('#detail-fromSchema-response').click(() => Details.loadFromSchema(_responseNode, '#detail-schema-response', (newNodes, newLinks) => updateModelFromSchema(_responseSchemaDiagram, _responseNode, newNodes, newLinks)));
        $('#request-tab').on('shown.bs.tab', () => showOnlyThisNode(_requestSchemaDiagram, _requestNode));
        $('#response-tab').on('shown.bs.tab', () => showOnlyThisNode(_responseSchemaDiagram, _responseNode));
        _requestSchemaDiagram = initSchemaDiagram('requestSchemaDiagramDiv');
        _responseSchemaDiagram = initSchemaDiagram('responseSchemaDiagramDiv');
    }
    Details.init = init;
    function showDetails(thisNode, cb) {
        _requestSchemaDiagram.model = Main._diagram.model;
        _responseSchemaDiagram.model = Main._diagram.model;
        var req = _requestSchemaDiagram.nodes.filter((n) => { var data = n.data; return (data.name == 'Request' && data.group == thisNode.key); }).first();
        var res = _responseSchemaDiagram.nodes.filter((n) => { var data = n.data; return (data.name == 'Response' && data.group == thisNode.key); }).first();
        if (req == null) {
            _requestNode =
                {
                    name: 'Request',
                    group: thisNode.key,
                    category: 'RR',
                    isGroup: true
                };
            _requestSchemaDiagram.model.addNodeData(_requestNode);
        }
        else {
            _requestNode = req.data;
        }
        if (res == null) {
            _responseNode =
                {
                    name: 'Response',
                    group: thisNode.key,
                    category: 'RR',
                    isGroup: true
                };
            _requestSchemaDiagram.model.addNodeData(_responseNode);
        }
        else {
            _responseNode = res.data;
        }
        Util.hideOtherNodes(Main._diagram);
        if (thisNode.category == 'Operation' || thisNode.category == 'InternalOperation')
            $('#detail-internal-div').show();
        else
            $('#detail-internal-div').hide();
        $('#detail-estimatedComplexity').val(thisNode.estimatedComplexity);
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
    function showOnlyThisNode(diagram, thisNode) {
        diagram.nodes.each(function (node) { node.visible = false; });
        diagram.findNodeForKey(thisNode.key).visible = true;
        Util.showAllParents(diagram, thisNode);
        diagram.nodes.each((n) => { if (n.data.group == thisNode.key)
            n.visible = true; });
    }
    function updateModelFromSchema(diagram, rootNode, updatedSchemaNodes, updatedSchemaLinks) {
        _requestSchemaDiagram.startTransaction();
        var glm = _requestSchemaDiagram.model;
        var removeNodes = _requestSchemaDiagram.model.nodeDataArray.filter((n) => { return (n.group == rootNode.key); });
        var removeLinks = glm.linkDataArray.filter((l) => { return (l.group == rootNode.key); });
        _requestSchemaDiagram.model.removeNodeDataCollection(removeNodes);
        glm.removeLinkDataCollection(removeLinks);
        _requestSchemaDiagram.model.addNodeDataCollection(updatedSchemaNodes);
        _requestSchemaDiagram.model.addLinkDataCollection(updatedSchemaLinks);
        _requestSchemaDiagram.nodes.each(function (node) { if (node.category == "Attribute")
            node.visible = false; });
        _requestSchemaDiagram.commitTransaction();
        showOnlyThisNode(diagram, rootNode);
        Util.hideOtherNodes(Main._diagram);
    }
    function initSchemaDiagram(divName) {
        var gojs = go.GraphObject.make;
        var diagram = gojs(go.Diagram, divName, {
            layout: gojs(go.TreeLayout, { nodeSpacing: 5 }),
            contentAlignment: go.Spot.Center,
            initialDocumentSpot: go.Spot.Center,
            initialViewportSpot: go.Spot.Center
        });
        diagram.groupTemplate =
            gojs(go.Group, "Auto", {
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
            }, gojs(go.Panel, "Vertical", { defaultAlignment: go.Spot.Left }, gojs(go.Placeholder, { padding: 5 })));
        diagram.nodeTemplate = gojs(go.Node, { movable: false }, { selectionAdorned: false }, gojs('TreeExpanderButton', {
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
        diagram.linkTemplate = gojs(go.Link, {
            selectable: false,
            routing: go.Link.Orthogonal,
            fromEndSegmentLength: 4,
            toEndSegmentLength: 4,
            fromSpot: new go.Spot(0.001, 1, 7, 0),
            toSpot: go.Spot.Left
        }, gojs(go.Shape, { stroke: 'lightgray' }));
        return diagram;
    }
    var id;
    function loadFromSchema(root, textId, done) {
        var json = JSON.parse($(textId).val());
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
            var childdata = { key: id, name: item, group: group };
            nodeDataArray.push(childdata);
            if (parentdata.key != group)
                linkDataArray.push({ from: parentdata.key, to: childdata.key, group: group });
            if (schema.properties[item].properties) {
                recurse(group, schema.properties[item], nodeDataArray, linkDataArray, childdata);
            }
        }
    }
})(Details || (Details = {}));
var Main;
(function (Main) {
    var _dataString;
    var _isDebugMode;
    Main._mainMarkDown = '';
    function unsavedChanges(value) {
        if (value) {
            $("#unsavedChanges").show();
        }
        else {
            $("#unsavedChanges").hide();
        }
    }
    async function init() {
        const urlParams = new URLSearchParams(window.location.search);
        Main._projectName = urlParams.get('project');
        if (urlParams.get('debugMode')) {
            _isDebugMode = true;
            $('#dataDebugger').show();
        }
        else {
            $('#dataDebugger').hide();
        }
        load();
        var gojs = go.GraphObject.make;
        Main._diagram = gojs(go.Diagram, "myDiagramDiv", {
            "toolManager.hoverDelay": 500,
            LayoutCompleted: function () {
            },
            contentAlignment: go.Spot.Center,
            "undoManager.isEnabled": true,
            click: function () { Util.changeSelectionNon(); },
            "draggingTool.isGridSnapEnabled": true,
            allowDrop: true,
            mouseDrop: function (e) {
                if (e.diagram.selection.first().category == "Operation")
                    e.diagram.currentTool.doCancel();
            },
        });
        Main._diagram.addModelChangedListener(function (evt) {
            if (evt.isTransactionFinished) {
                var latestData = Main._diagram.model.toJson();
                if (_dataString != latestData) {
                    _dataString = latestData;
                    unsavedChanges(true);
                }
                loadAPIs(_dataString);
                loadSystems(_dataString);
                loadEvents(_dataString);
                loadViews();
                updateDebug(_dataString);
                bindMenu();
            }
        });
        Main._diagram.contextMenu = gojs(go.Adornment, "Vertical", gojs("ContextMenuButton", gojs(go.TextBlock, "New API"), {
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
        Main._diagram.groupTemplateMap.add("API", Template.api());
        Main._diagram.groupTemplateMap.add("Operation", Template.operation());
        Main._diagram.groupTemplateMap.add("Subscriber", Template.subscriber());
        Main._diagram.groupTemplateMap.add("InternalOperation", Template.internalOperation());
        Main._diagram.groupTemplateMap.add("Event", Template.event());
        Main._diagram.groupTemplateMap.add("Domain", Template.domain());
        Main._diagram.groupTemplateMap.add("System", Template.system());
        Main._diagram.linkTemplateMap.add("", Template.link());
        Main._diagram.model = new go.GraphLinksModel();
        mapper.init();
        Details.init();
        View.init();
    }
    Main.init = init;
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
        if (Main._diagram) {
            var fullNode = Main._diagram.findNodeForKey(key);
            Main._diagram.startTransaction();
            Main._diagram.nodes.each(function (node) {
                if (node.data.key == key || (fullNode.containingGroup != null && node.data.key == fullNode.containingGroup.data.key)) {
                    node.visible = true;
                }
            });
            includeLinksVisible();
            Main._diagram.layout = Util.getcurrentLayout();
            ;
            Main._diagram.commitTransaction();
        }
    }
    function includeAPI(key) {
        Main._diagram.startTransaction();
        Main._diagram.nodes.each(function (node) {
            if (node.data.key == key || node.data.group == key) {
                node.visible = true;
            }
        });
        includeLinksVisible();
        Main._diagram.layout = Util.getcurrentLayout();
        Main._diagram.commitTransaction();
    }
    function includeLinksVisible() {
        Main._diagram.links.each((l) => {
            if (l.fromNode && l.toNode) {
                console.log(l.data);
                if (l.fromNode.visible && l.toNode.visible) {
                    l.visible = true;
                }
            }
        });
    }
    Main.includeLinksVisible = includeLinksVisible;
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
    function createViewHTML(view) {
        var listItem = $("<li class='dropdown-submenu'/>");
        var a = $("<a class='dropdown-item dropdown-toggle' href='#' id='navbarDropdown' role='button' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>" + view.name + "</a>").on("click", function () { View.View(view.name); });
        var ul = $("<ul class='dropdown-menu' aria-labelledby='navbarDropdown'/>");
        var li = $("<li/>");
        var ia = $("<a class='dropdown-item' href='#'>Update</a>").on("click", function () { View.UpdateView(view.name); });
        li.append(ia);
        ul.append(li);
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
    function loadViews() {
        var divList = $("#ViewList");
        divList.empty();
        var a = $("<a class='dropdown-item' href='#'>Create View</a>").on("click", function () { View.CreateView(); });
        divList.append(a);
        View.Views.forEach(function (view) {
            var v = createViewHTML(view);
            divList.append(v);
        });
    }
    Main.loadViews = loadViews;
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
        showHideAllFalseLink.click(function () { Util.showHideAll(Main._diagram, false, false); });
        var showHideAllTrueLink = $("#showHideAllTrueLink");
        showHideAllTrueLink.click(function () { Util.showHideAll(Main._diagram, true, true); });
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
    async function save() {
        let data = Main._diagram.model.toJson();
        let dataObject = JSON.parse(data);
        dataObject.mainMarkDown = Main._mainMarkDown;
        Util.saveData(JSON.stringify(dataObject), Main._projectName);
        unsavedChanges(false);
        Main._diagram.isModified = false;
    }
    Main.save = save;
    async function load() {
        var data = await Util.getData(Main._projectName);
        if (data == null) {
        }
        else {
            let model = go.Model.fromJson(data.result);
            model.nodeDataArray.forEach((n) => {
                if (n.category == 'System')
                    n.isGroup = true;
                if (n.category == 'Operation')
                    n.isGroup = true;
                if (n.category == 'Event')
                    n.isGroup = true;
            });
            Main._diagram.model = model;
            Main._mainMarkDown = JSON.parse(data.result).mainMarkDown;
            if (!Main._mainMarkDown)
                Main._mainMarkDown = '';
            _dataString = JSON.stringify(model);
            Util.hideOtherNodes(Main._diagram);
            Util.changeSelectionNon();
        }
        unsavedChanges(false);
    }
    Main.load = load;
    function generateImageLink(x) {
        x.href = Main._diagram.makeImage({
            scale: 5,
            maxSize: new go.Size(Infinity, Infinity)
        }).src;
    }
    Main.generateImageLink = generateImageLink;
    function updateDebug(dataString) {
        if (_isDebugMode)
            $("#dataDebugger").text(dataString);
    }
})(Main || (Main = {}));
var mapper;
(function (mapper) {
    var _mapperDiagram;
    var _callback;
    function setupModal() {
        $('#mapper-btn-ok').on('click', function () {
            _callback();
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
        _mapperDiagram = gojs(go.Diagram, 'mapperDiv', {
            layout: gojs(go.TreeLayout, { nodeSpacing: 5 }),
            'linkingTool.archetypeLinkData': { category: 'Mapping' },
            contentAlignment: go.Spot.Center,
            initialDocumentSpot: go.Spot.Center,
            initialViewportSpot: go.Spot.Center
        });
        _mapperDiagram.groupTemplate = gojs(go.Group, "Auto", {
            selectionAdorned: false,
            layout: gojs(go.TreeLayout, {})
        }, { deletable: false }, gojs(go.Shape, { fill: "white", stroke: "white" }), gojs(go.Panel, "Vertical", { defaultAlignment: go.Spot.Left }, gojs(go.Placeholder, { padding: 5 })));
        _mapperDiagram.groupTemplateMap.add('RR', gojs(go.Group, "Auto", {
            deletable: false,
            movable: false,
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
        }, { selectionAdorned: false }, gojs(go.Shape, { fill: "white", stroke: "white" }), gojs(go.Panel, "Vertical", { defaultAlignment: go.Spot.Left }, gojs(go.TextBlock, { font: "bold 10pt sans-serif", margin: new go.Margin(5, 5, 0, 5) }, new go.Binding("text", "name")), gojs(go.Placeholder, { padding: 5 }))));
        _mapperDiagram.nodeTemplate = gojs(go.Node, {
            deletable: false,
            movable: false,
            fromLinkable: true,
            toLinkable: true
        }, { selectionAdorned: false }, gojs('TreeExpanderButton', {
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
        }), gojs(go.Panel, 'Horizontal', { position: new go.Point(16, 0), alignment: go.Spot.Center }, new go.Binding('background', 'isSelected', function (s) { return s ? 'lightblue' : 'white'; }).ofObject(), gojs(go.TextBlock, new go.Binding('text', 'name'))));
        _mapperDiagram.linkTemplate = gojs(go.Link, {
            selectable: false,
            routing: go.Link.Orthogonal,
            fromEndSegmentLength: 4,
            toEndSegmentLength: 4,
            fromSpot: new go.Spot(0.001, 1, 7, 0),
            toSpot: go.Spot.Left
        }, gojs(go.Shape, { stroke: 'lightgray' }));
        _mapperDiagram.linkTemplateMap.add('Mapping', gojs(go.Link, {
            isTreeLink: false,
            isLayoutPositioned: false,
            layerName: 'Foreground',
            relinkableFrom: true,
            relinkableTo: true
        }, gojs(go.Shape, { stroke: 'DodgerBlue', strokeWidth: 2, toArrow: "Standard" }), gojs(go.Shape, {
            stroke: "DodgerBlue",
            toArrow: "Standard",
            fill: "DodgerBlue"
        })));
    }
    mapper.init = init;
    function showMapper(from, to, callback) {
        _callback = callback;
        _mapperDiagram.model = Main._diagram.model;
        _mapperDiagram.nodes.each(function (node) { node.visible = false; });
        _mapperDiagram.findNodeForKey(from.key).visible = true;
        _mapperDiagram.findNodeForKey(to.key).visible = true;
        Util.showAllParents(_mapperDiagram, from);
        Util.showAllParents(_mapperDiagram, to);
        _mapperDiagram.nodes.each((n) => {
            if (n.data.group == from.key)
                n.visible = true;
            _mapperDiagram.nodes.each((m) => { if (m.data.group == n.data.key)
                m.visible = true; });
        });
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
var Options;
(function (Options) {
    class Project {
        constructor() {
            this.showMarkDown = true;
            this.showInfoIcons = true;
        }
    }
    Options.Project = Project;
    Options._projectOptions = new Options.Project();
    function toggleViewMarkup(show, diagramDiv, editorDiv) {
        Options._projectOptions.showMarkDown = show;
        editorDiv.hidden = !show;
        if (show) {
            diagramDiv.style.right = "30%";
        }
        else {
            diagramDiv.style.right = "0";
        }
        Main._diagram.layout = Util.getcurrentLayout();
    }
    Options.toggleViewMarkup = toggleViewMarkup;
    function toggleViewInfoIcons(show) {
        Options._projectOptions.showInfoIcons = show;
        Main._diagram.layout = Util.getcurrentLayout();
    }
    Options.toggleViewInfoIcons = toggleViewInfoIcons;
})(Options || (Options = {}));
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
            selectionChanged: function (part) { Util.changeSelectionNode(part.data); },
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
                        name: "newOperation",
                        isGroup: true
                    };
                    diagram.model.addNodeData(data);
                    var part = diagram.findPartForData(data);
                    part.location = diagram.toolManager.contextMenuTool.mouseDownPoint;
                    diagram.commitTransaction('new Operation');
                    var txt = part.findObject("name");
                    diagram.commandHandler.editTextBlock(txt);
                }
            }), gojs("ContextMenuButton", gojs(go.TextBlock, "New Subscriber"), {
                click: function (e, obj) {
                    var diagram = e.diagram;
                    diagram.startTransaction('new Operation');
                    var data = {
                        category: "Subscriber",
                        group: obj.part.data.key,
                        name: "newSubscriber",
                        isGroup: true
                    };
                    diagram.model.addNodeData(data);
                    var part = diagram.findPartForData(data);
                    part.location = diagram.toolManager.contextMenuTool.mouseDownPoint;
                    diagram.commitTransaction('new Subscriber');
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
        Details.showDetails(node, function (detail) {
            diagram.startTransaction();
            diagram.model.setDataProperty(node, "name", detail.name);
            diagram.model.setDataProperty(node, "detailLink", detail.detailLink);
            diagram.model.setDataProperty(node, "description", detail.description);
            diagram.model.setDataProperty(node, "schema", detail.schema);
            diagram.model.setDataProperty(node, "category", detail.type);
            diagram.model.setDataProperty(node, "estimatedComplexity", detail.estimatedComplexity);
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
        }, new go.Binding("visible", "", function (data, node) { if (data.detailLink && Options._projectOptions.showInfoIcons == true)
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
            selectionChanged: function (part) { Util.changeSelectionNode(part.data); },
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
        return gojs(go.Group, "Vertical", {
            alignment: go.Spot.Center,
            selectionChanged: function (part) { Util.changeSelectionNode(part.data); }
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
        return gojs(go.Group, "Vertical", {
            alignment: go.Spot.Center,
            selectionChanged: function (part) { Util.changeSelectionNode(part.data); }
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
                mapper.showMapper(from, to, function () { Util.hideOtherNodes(Main._diagram); });
            },
            selectionChanged: function (part) { Util.changeSelectionLink(part.data); },
            contextMenu: gojs(go.Adornment, "Vertical", gojs("ContextMenuButton", gojs(go.TextBlock, "Mapping"), {
                click: function (e, obj) {
                    var from = e.diagram.model.findNodeDataForKey(obj.part.data.from);
                    var to = e.diagram.model.findNodeDataForKey(obj.part.data.to);
                    $('#mapper').show();
                    mapper.showMapper(from, to, function () { Util.hideOtherNodes(Main._diagram); });
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
        return gojs(go.Group, "Vertical", {
            alignment: go.Spot.Center,
            selectionChanged: function (part) { Util.changeSelectionNode(part.data); }
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
    function subscriber() {
        var gojs = go.GraphObject.make;
        return gojs(go.Group, "Vertical", {
            alignment: go.Spot.Center,
            selectionChanged: function (part) { Util.changeSelectionNode(part.data); }
        }, gojs(go.Panel, "Auto", {
            width: 20,
            height: 20,
            toolTip: Template.toolTip(),
            doubleClick: function (e, obj) { Template.showDetails(e, obj); },
            contextMenu: gojs(go.Adornment, "Vertical", Template.contextMenuFocus(), Template.contextMenuHide(), Template.contextItemReferenceTo(), Template.contextItemReferenceFrom(), Template.contextMenuDetails())
        }, gojs(go.Shape, "Square", {
            fill: "#0F6E00",
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
    Template.subscriber = subscriber;
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
            selectionChanged: function (part) { Util.changeSelectionNode(part.data); },
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
    function changeSelectionNon() { }
    Util.changeSelectionNon = changeSelectionNon;
    function changeSelectionNode(s) { }
    Util.changeSelectionNode = changeSelectionNode;
    function changeSelectionLink(s) { }
    Util.changeSelectionLink = changeSelectionLink;
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
        hideOtherNodes(myDiagram);
    }
    Util.showHideAll = showHideAll;
    function hideOtherNodes(myDiagram) {
        myDiagram.nodes.each((n) => {
            if (n.data.category == 'RR')
                n.visible = false;
        });
        myDiagram.links.each((n) => {
            if (n.data.category == 'Mapping')
                n.visible = false;
        });
    }
    Util.hideOtherNodes = hideOtherNodes;
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
    async function getData(project) {
        $("#Project").text(project);
        const list = await $.ajax({
            url: "https://vizzyapi.azurewebsites.net/api/data/" + project,
        });
        if (list.length == 0)
            return null;
        const id = list[0];
        const result = await $.ajax({
            url: "https://vizzyapi.azurewebsites.net/api/data/" + project + "/" + id,
        });
        return { result };
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
    function showAllParents(diagram, nodeData) {
        var p = diagram.findNodeForKey(nodeData.group);
        if (p) {
            p.visible = true;
            showAllParents(diagram, p.data);
        }
    }
    Util.showAllParents = showAllParents;
})(Util || (Util = {}));
var View;
(function (View_1) {
    class ViewModel {
    }
    View_1.ViewModel = ViewModel;
    class ViewDataModel {
    }
    View_1.ViewDataModel = ViewDataModel;
    View_1.Views = [];
    var currentViewData = [];
    var currentViewName;
    var callback;
    function init() {
        $('#view-btn-ok').on('click', function () {
            $('#viewModal').modal('hide');
            callback($('#view-name').val());
        });
        $('#view-btn-cancel').on('click', function () {
            $('#viewModal').modal('hide');
        });
    }
    View_1.init = init;
    function CreateView() {
        $('#viewModal').modal();
        callback = function (name) {
            currentViewName = name;
            currentViewData = [];
            Main._diagram.nodes.each(function (n) {
                if (n.visible) {
                    currentViewData.push({
                        key: n.data.key,
                        location: n.location
                    });
                }
            });
            View_1.Views.push({ name: currentViewName, viewData: currentViewData });
            Main.loadViews();
        };
    }
    View_1.CreateView = CreateView;
    function UpdateView(name) {
        let view = View_1.Views.find(v => v.name == name);
        if (view) {
            currentViewData = [];
            currentViewName = view.name;
            Main._diagram.nodes.each(function (n) {
                if (n.visible) {
                    currentViewData.push({
                        key: n.data.key,
                        location: n.location
                    });
                }
            });
            Main.loadViews();
        }
        else {
            console.log(name + " view not found");
        }
    }
    View_1.UpdateView = UpdateView;
    function View(name) {
        console.log(View_1.Views);
        let view = View_1.Views.find(v => v.name == name);
        if (view) {
            currentViewData = view.viewData;
            currentViewName = view.name;
            Util.showHideAll(Main._diagram, false, false);
            Main._diagram.nodes.each(function (n) {
                let v = currentViewData.find(d => d.key == n.data.key);
                if (v) {
                    n.visible = true;
                    n.location = v.location;
                }
            });
            Main.includeLinksVisible();
        }
        else {
            console.log(name + " view not found");
        }
    }
    View_1.View = View;
})(View || (View = {}));
//# sourceMappingURL=ts.js.map