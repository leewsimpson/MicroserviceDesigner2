function TreeNode() 
{
  go.Node.call(this);
  this.treeExpandedChanged = function(node) {
    if (node.containingGroup !== null) {
      node.containingGroup.findExternalLinksConnected().each(function(l) { l.invalidateRoute(); });
    }
  };
}

go.Diagram.inherit(TreeNode, go.Node);

/** @override */
TreeNode.prototype.findVisibleNode = function() 
{
  // redirect links to lowest visible "ancestor" in the tree
  var n = this;
  while (n !== null && !n.isVisible()) {
    n = n.findTreeParentNode();
  }
  return n;
};
// end TreeNode

function MappingLink()
{
  go.Link.call(this);
}

go.Diagram.inherit(MappingLink, go.Link);

MappingLink.prototype.getLinkPoint = function(node, port, spot, from, ortho, othernode, otherport) 
{
  var r = new go.Rect(port.getDocumentPoint(go.Spot.TopLeft), port.getDocumentPoint(go.Spot.BottomRight));
  var group = node.containingGroup;
  var b = (group !== null) ? group.actualBounds : node.actualBounds;
  var op = othernode.getDocumentPoint(go.Spot.Center);
  var x = (op.x > r.centerX) ? b.right : b.left;
  return new go.Point(x, r.centerY);
};
// end MappingLink
