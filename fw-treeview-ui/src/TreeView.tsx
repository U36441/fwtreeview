import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Handle,
  Position,
} from 'reactflow';
import type { NodeTypes } from 'reactflow';
import 'reactflow/dist/style.css';
import { layoutElementsHorizontal } from './dagreLayout';

const CustomNode: React.FC<{ data: { label: string; canExpand: boolean; expanded: boolean; isRoot?: boolean; toggleNode?: () => void } }> = ({ data }) => (
  <div
    onClick={() => data.toggleNode && data.toggleNode()}
    className={
      `flex flex-col items-center p-2 rounded-lg shadow-sm min-w-[100px] cursor-pointer border ` +
      (data.isRoot ? 'border-pink-400 bg-white' : 'border-transparent bg-white')
    }
  >
    <Handle type="target" position={Position.Left} id="left" />
    <div className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
      {data.label}
      {data.canExpand && (
        <span className="ml-2 text-sm text-blue-500">{data.expanded ? '▼' : '▶'}</span>
      )}
    </div>
    <Handle type="source" position={Position.Right} id="right" />
  </div>
);

interface TreeViewProps {
  data: any;
}

function buildTree(
  data: any,
  name: string = 'root',
  parentId: string | null = null,
  nodes: Node[] = [],
  edges: Edge[] = [],
  path: string = 'root',
  depth = 0,
  index = 0,
  expandedMap: Record<string, boolean> = {},
  parentExpanded: boolean = true,
  siblingOffset: number = 0
): { nodes: Node[]; edges: Edge[] } {
  if (data === null || data === undefined) {
    return { nodes, edges };
  }

  const id = path;
  // detect common node structures
  const isObject = typeof data === 'object' && data !== null;
  const isLabelNode = isObject && typeof (data as any).label === 'string' && Array.isArray((data as any).children);

  const hasChildren = isLabelNode
    ? ((data as any).children as any[]).length > 0
    : isObject
    ? (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)
    : false;

  let label: string = name;
  if (isLabelNode) {
    label = (data as any).label;
  } else if (!isObject) {
    // primitive value
    label = `${name}: ${String(data)}`;
  } else {
    // object but not label-node: use the key name
    label = name;
  }

  // Vertical layout with indentation (smaller spacing)
  const spacingX = 140;
  const spacingY = 70;
  const expanded = expandedMap[id] ?? true;

  let x = depth * spacingX;
  let y = siblingOffset;

  if (parentExpanded) {
    nodes.push({
      id,
      data: { label, canExpand: hasChildren, expanded, isRoot: depth === 0 },
      position: { x, y },
      type: 'custom',
    });
    if (parentId) {
      edges.push({
        id: `e-${parentId}-${id}`,
        source: parentId,
        target: id,
        type: 'default',
        style: { stroke: '#9CA3AF', strokeWidth: 2 },
        markerEnd: {
          type: 'arrowclosed',
          color: '#9CA3AF',
        } as any,
      });
    }
  }

  if (hasChildren && expanded && parentExpanded) {
    if (isLabelNode) {
      const children = (data as any).children as any[];
      let childOffset = y;
      children.forEach((child, i) => {
        const childPath = `${path}.children[${i}]`;
        const childName = (child && typeof child === 'object' && child.label) ? child.label : String(i);
        buildTree(child, childName, id, nodes, edges, childPath, depth + 1, i, expandedMap, true, childOffset);
        childOffset += spacingY;
      });
    } else if (Array.isArray(data)) {
      let childOffset = y;
      data.forEach((child, i) => {
        const childPath = `${path}[${i}]`;
        buildTree(child, String(i), id, nodes, edges, childPath, depth + 1, i, expandedMap, true, childOffset);
        childOffset += spacingY;
      });
    } else {
      // object map
      let childOffset = y;
      Object.entries(data).forEach(([key, value], i) => {
        const childPath = `${path}.${key}`;
        buildTree(value, key, id, nodes, edges, childPath, depth + 1, i, expandedMap, true, childOffset);
        childOffset += spacingY;
      });
    }
  }

  return { nodes, edges };
}

export default function TreeView({ data }: TreeViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  const handleNodeClick = useCallback((event, node) => {
    if (node.data.canExpand) {
      setExpandedMap((prev) => ({ ...prev, [node.id]: !(prev[node.id] ?? true) }));
    }
  }, []);

  useEffect(() => {
    if (!data || (typeof data !== 'object' && !Array.isArray(data))) {
      setNodes([]);
      setEdges([]);
      return;
    }
    const { nodes: built, edges: builtE } = buildTree(data, 'Parent', null, [], [], 'root', 0, 0, expandedMap, true, 0);
    try {
      if (built.length === 0) {
        setNodes([]);
        setEdges([]);
        return;
      }
      const { nodes: laidOutNodes, edges: laidOutEdges } = layoutElementsHorizontal(built, builtE);
      setNodes(laidOutNodes);
      setEdges(laidOutEdges);
      // debug
      // console.log('laid out', laidOutNodes.length, laidOutEdges.length);
    } catch (err) {
      // fallback: set built without layout
      // eslint-disable-next-line no-console
      console.error('layout error', err);
      setNodes(built);
      setEdges(builtE);
    }
  }, [data, expandedMap, setNodes, setEdges]);

  const nodeTypes: NodeTypes = {
    custom: CustomNode
  };

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-lg">
        No data to display. Please upload a valid JSON file.
      </div>
    );
  }

  // attach toggle function to each node's data so clicking node toggles expansion
  const renderNodes = nodes.map((n) => ({
    ...n,
    data: {
      ...n.data,
      toggleNode: () => setExpandedMap((prev) => ({ ...prev, [n.id]: !(prev[n.id] ?? true) })),
      expanded: !!expandedMap[n.id],
    },
  }));

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={renderNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={true}
        nodesConnectable={false}
        zoomOnScroll={false}
        panOnScroll
      >
        <Controls />
        <Background gap={16} />
      </ReactFlow>
    </div>
  );
}