import React, { useState, useCallback, useMemo } from 'react'; 
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Node, Edge, Controls, Background, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './ResearchMap.css';

interface ResearchNode extends Node {
  data: {
    label: string;
    summary?: string;
    embedding?: number[];
    confidence?: number;
    type: 'concept' | 'document' | 'section' | 'keyword';
    size?: number;
    color?: string;
  };
}

interface ResearchMapProps {
  documents?: Array<{
    id: string;
    title: string;
    summary: string;
    sections: Array<{
      id: string;
      title: string;
      content: string;
      embedding: number[];
    }>;
  }>;
  onNodeClick?: (node: ResearchNode) => void;
  onMapReduce?: (operation: 'cluster' | 'summarize' | 'filter') => void;
}

const ResearchMap: React.FC<ResearchMapProps> = ({ 
  documents = [], 
  onNodeClick, 
}) => {
  const [nodes, setNodes] = useState<ResearchNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

  useMemo(() => {
    const newNodes: ResearchNode[] = [];
    const newEdges: Edge[] = [];
    let nodeId = 0;

    documents.forEach((doc, docIndex) => {
      const docNode: ResearchNode = {
        id: `doc-${docIndex}`,
        type: 'default',
        position: { x: 100 + docIndex * 200, y: 100 },
        data: {
          label: doc.title,
          summary: doc.summary,
          type: 'document',
          color: '#3b82f6',
          size: 20
        }
      };
      newNodes.push(docNode);

      // Only add section nodes if there are actual sections with meaningful content
      if (doc.sections && doc.sections.length > 1) {
        doc.sections.forEach((section, sectionIndex) => {
          if (section.title && section.title !== doc.title) { // Avoid duplicate titles
            const sectionNode: ResearchNode = {
              id: `section-${docIndex}-${sectionIndex}`,
              type: 'default',
              position: { 
                x: 100 + docIndex * 200 + (sectionIndex - 1) * 150, 
                y: 250 + sectionIndex * 100 
              },
              data: {
                label: section.title,
                summary: section.content,
                embedding: section.embedding,
                type: 'section',
                color: '#10b981',
                size: 16
              }
            };
            newNodes.push(sectionNode);

            newEdges.push({
              id: `edge-${docIndex}-${sectionIndex}`,
              source: `doc-${docIndex}`,
              target: `section-${docIndex}-${sectionIndex}`,
              type: 'smoothstep'
            });
          }
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [documents]);

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onNodeClickHandler = useCallback((event: any, node: ResearchNode) => {
    setSelectedNodes(prev => 
      prev.indexOf(node.id) !== -1
        ? prev.filter(id => id !== node.id)
        : [...prev, node.id]
    );
    onNodeClick?.(node);
  }, [onNodeClick]);


  const nodeTypes = useMemo(() => ({
    default: ({ data }: { data: any }) => (
      <div 
        className="research-node"
        style={{
          backgroundColor: data.color,
          width: data.size || 20,
          height: data.size || 20,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: 'pointer',
          border: selectedNodes.indexOf(data.id) !== -1 ? '3px solid #f59e0b' : '2px solid #374151'
        }}
        title={data.summary || data.label}
      >
        {data.label.charAt(0).toUpperCase()}
      </div>
    )
  }), [selectedNodes]);

  return (
    <div className="research-map-container">
      <div className="research-map-controls">
      </div>
      
      <div className="research-map-flow">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClickHandler}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <Background />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
};

export default ResearchMap;





