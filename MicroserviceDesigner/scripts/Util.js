var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        myDiagram.nodes.each(function (node) { node.visible = visible; });
        myDiagram.links.each(function (node) { node.visible = linksVisible; });
        myDiagram.layout = Util.getcurrentLayout();
        myDiagram.commitTransaction();
    }
    Util.showHideAll = showHideAll;
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
                if (linkedNodeKeys.some(function (n) { return link.fromNode.key == n.from && link.toNode.key == n.to; })) {
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
                console.log("success");
            },
            error: function (jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    }
    Util.saveData = saveData;
})(Util || (Util = {}));
//# sourceMappingURL=Util.js.map