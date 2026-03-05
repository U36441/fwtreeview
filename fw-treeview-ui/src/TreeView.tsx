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

const CustomNode: React.FC<{
  data: {
    label: string;
    canExpand: boolean;
    expanded: boolean;
    isRoot?: boolean;
    toggleNode?: () => void;
    meta?: any;
  };
}> = ({ data }) => {
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.canExpand && data.toggleNode) {
      data.toggleNode();
    }
  };

  return (
    <div
      onClick={handleToggle}
      className={
        `flex flex-col items-center p-2 rounded-lg shadow-sm min-w-[100px] border cursor-pointer ` +
        (data.isRoot ? 'border-pink-400 bg-white' : 'border-gray-200 bg-white')
      }
    >
      <Handle type="target" position={Position.Left} id="left" />

      <div className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <span>{data.label}</span>
        {data.canExpand && (
          <span className="text-blue-500">
            {data.expanded ? '▼' : '▶'}
          </span>
        )}
      </div>

      {data.meta && typeof data.meta === 'object' && (
        <div className="text-xs text-gray-600 mt-1 space-y-0.5">
          {Object.entries(data.meta).filter(([k]) => k !== 'label').map(([k, v]) => (
            <div key={k} className="capitalize">
              <span className="font-medium text-gray-700">{k}:</span>{' '}
              <span className="text-gray-600">{String(v)}</span>
            </div>
          ))}
        </div>
      )}

      <Handle type="source" position={Position.Right} id="right" />
    </div>
  );
};

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

  const isObject = typeof data === 'object' && data !== null;
  const isLabelNode =
    isObject &&
    typeof (data as any).label === 'string' &&
    Array.isArray((data as any).children);

  let hasChildren: boolean;
  if (isLabelNode) {
    hasChildren = ((data as any).children as any[]).length > 0;
  } else if (isObject) {
    if (Object.prototype.hasOwnProperty.call(data, 'children') && Array.isArray((data as any).children)) {
      hasChildren = ((data as any).children as any[]).length > 0;
    } else if (Array.isArray(data)) {
      hasChildren = data.length > 0;
    } else {
      if (Object.prototype.hasOwnProperty.call(data, 'label')) {
        hasChildren = false;
      } else {
        hasChildren = Object.keys(data).length > 0;
      }
    }
  } else {
    hasChildren = false;
  }

  let label: string = name;

  if (isLabelNode) {
    label = (data as any).label;
  } else if (!isObject) {
    label = `${name}: ${String(data)}`;
  } else {
    label = name;
  }

  
  let metaData: any = undefined;
  if (isObject) {
    try {
      metaData = { ...(data as object as any) };
      if (metaData && Object.prototype.hasOwnProperty.call(metaData, 'children')) {
        delete metaData.children;
      }
    } catch (e) {
      metaData = undefined;
    }
  } else {
    metaData = data;
  }

  const spacingX = 140;
  const spacingY = 70;

  const expanded = expandedMap.hasOwnProperty(id)
    ? expandedMap[id]
    : true;

  let x = depth * spacingX;
  let y = siblingOffset;

  if (parentExpanded) {
    nodes.push({
      id,
      data: {
        label,
        canExpand: hasChildren,
        expanded,
        isRoot: depth === 0,
        meta: metaData,
      },
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
        const childName =
          child && typeof child === 'object' && child.label
            ? child.label
            : String(i);

        buildTree(
          child,
          childName,
          id,
          nodes,
          edges,
          childPath,
          depth + 1,
          i,
          expandedMap,
          true,
          childOffset
        );

        childOffset += spacingY;
      });
    } else if (Array.isArray(data)) {
      let childOffset = y;

      data.forEach((child, i) => {
        const childPath = `${path}[${i}]`;

        buildTree(
          child,
          String(i),
          id,
          nodes,
          edges,
          childPath,
          depth + 1,
          i,
          expandedMap,
          true,
          childOffset
        );

        childOffset += spacingY;
      });
    } else {
      let childOffset = y;

      Object.entries(data).forEach(([key, value], i) => {
        const childPath = `${path}.${key}`;

        buildTree(
          value,
          key,
          id,
          nodes,
          edges,
          childPath,
          depth + 1,
          i,
          expandedMap,
          true,
          childOffset
        );

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

  useEffect(() => {
    if (!data || (typeof data !== 'object' && !Array.isArray(data))) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const { nodes: built, edges: builtE } = buildTree(
      data,
      'Parent',
      null,
      [],
      [],
      'root',
      0,
      0,
      expandedMap,
      true,
      0
    );

    if (built.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    try {
      const { nodes: laidOutNodes, edges: laidOutEdges } =
        layoutElementsHorizontal(built, builtE);

      setNodes(laidOutNodes);
      setEdges(laidOutEdges);
    } catch (err) {
      setNodes(built);
      setEdges(builtE);
    }
  }, [data, expandedMap, setNodes, setEdges]);

  const nodeTypes: NodeTypes = {
    custom: CustomNode,
  };

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-lg">
        No data to display. Please upload a valid JSON file.
      </div>
    );
  }

  const renderNodes = nodes.map((n) => ({
    ...n,
    data: {
      ...n.data,
      toggleNode: () =>
        setExpandedMap((prev) => ({
          ...prev,
          [n.id]: !(prev[n.id] ?? true),
        })),
      expanded: expandedMap[n.id] ?? true,
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