import dagre from "dagre";
import type { Node, Edge } from "reactflow";

export function layoutElementsHorizontal(nodes: Node[], edges: Edge[]) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "LR" }); // Left-to-right horizontal layout

  const NODE_WIDTH = 120;
  const NODE_HEIGHT = 36;

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    // dagre gives the center point; React Flow expects top-left
    node.position = {
      x: nodeWithPosition.x - NODE_WIDTH / 2,
      y: nodeWithPosition.y - NODE_HEIGHT / 2,
    };
    // ensure position is not undefined
    if (!node.position) node.position = { x: 0, y: 0 };
  });

  return { nodes, edges };
}
