﻿namespace Template
{

    export function contextItemReferenceTo(): go.Adornment
    {
        var gojs = go.GraphObject.make;
        return gojs("ContextMenuButton", gojs(go.TextBlock, "Include References To"), {
            click: function (e: go.InputEvent, obj: go.Part)
            {
                var node: go.Node = e.diagram.findNodeForKey(obj.part.data.key);
                e.diagram.startTransaction();
                node.findNodesInto().each(function (n)
                {
                    if (n.containingGroup != null)
                        n.containingGroup.visible = true;

                    n.visible = true;
                });
                Util.autoLayout();
                Main.includeOnlyLinksVisible();
                e.diagram.commitTransaction();
            }
        })
    }

    export function contextItemReferenceFrom(): go.Adornment
    {
        var gojs = go.GraphObject.make;
        return gojs("ContextMenuButton", gojs(go.TextBlock, "Include References From"), {
            click: function (e: go.InputEvent, obj: go.Part)
            {
                var node: go.Node = e.diagram.findNodeForKey(obj.part.data.key);
                e.diagram.startTransaction();
                node.findNodesOutOf().each(function (n)
                {
                    if (n.containingGroup != null)
                        n.containingGroup.visible = true;

                    n.visible = true;
                });
                Main.includeOnlyLinksVisible();
                Util.autoLayout();
                e.diagram.commitTransaction();
            }
        });
    }

    export function contextMenuHide(): go.Adornment
    {
        var gojs = go.GraphObject.make;
        return gojs("ContextMenuButton", gojs(go.TextBlock, "Hide"), {
            click: function (e: go.InputEvent, obj: go.Part)
            {
                var node = e.diagram.findNodeForKey(obj.part.data.key);
                e.diagram.startTransaction();
                node.visible = false;
                Main.includeOnlyLinksVisible();
                e.diagram.commitTransaction();
            }
        });
    }

    export function contextMenuDetails(): go.Adornment
    {
        var gojs = go.GraphObject.make;
        return gojs("ContextMenuButton", gojs(go.TextBlock, "Details"), {
            click: function (e: go.InputEvent, obj: go.Part)
            {
                showDetails(e, obj);
            }
        })
    }

    export function showDetails(e: go.InputEvent, obj: go.Part)
    {
        var node: data.nodeData = obj.part.data;
        var diagram: go.Diagram = e.diagram;

        Details.showDetails(node,
            function (detail : Details.Detail)
            {
                diagram.startTransaction();
                diagram.model.setDataProperty(node, "name", detail.name);
                diagram.model.setDataProperty(node, "detailLink", detail.detailLink);
                diagram.model.setDataProperty(node, "description", detail.description);
                diagram.model.setDataProperty(node, "schema", detail.schema);
                diagram.model.setDataProperty(node, "category", detail.type);
                diagram.model.setDataProperty(node, "estimatedComplexity", detail.estimatedComplexity);
                diagram.commitTransaction();
            })
    }

    export function contextMenuFocus(): go.Adornment
    {
        var gojs = go.GraphObject.make;
        return gojs("ContextMenuButton", gojs(go.TextBlock, "Focus"), { click: function (e: go.InputEvent, obj: go.Part) { Util.focus(e.diagram, obj.part.data.key) } });
    }

    export function infoIcon(): go.Adornment
    {
        var gojs = go.GraphObject.make;
        return gojs(go.Picture, "info.png",
            {
                width: 14, height: 14,
                imageStretch: go.GraphObject.Uniform,
                alignment: new go.Spot(1, 0, -10, 10),
                click: function (e: go.InputEvent, obj: go.Part)
                {
                    window.open(obj.part.data.detailLink, "new")
                },
                cursor: "pointer"
            },
            new go.Binding("visible", "", function (data, node) { if (data.detailLink && Options._projectOptions.showInfoIcons==true) return true; else return false; })
        );
    }

    export function toolTip()
    {
        var gojs = go.GraphObject.make;

        return gojs(go.Adornment, "Auto",
            gojs(go.Shape,
                {
                    fill: "#FFFFCC"
                }),
            gojs(go.TextBlock, { margin: 9 }, new go.Binding("text", "description"))
        );
    }
}