import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// Adjust these values to match your node sizes
const nodeWidth = 260; // Increased to account for min-w-[220px] + padding and margins
const nodeHeight = 140; // Increased to account for node content height

export const getLayoutedElements = (nodes: any[], edges: any[], direction = 'TB') => {
  console.log('Layout Input:', {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    direction,
    sampleNode: nodes[0],
    sampleEdge: edges[0]
  })

  const isHorizontal = direction === 'LR';
  
  // Set layout configuration with better spacing for org charts
  dagreGraph.setGraph({ 
    rankdir: direction, 
    nodesep: isHorizontal ? 200 : 180,  // Horizontal spacing between nodes on same level
    ranksep: isHorizontal ? 250 : 200,  // Vertical spacing between levels  
    marginx: 80,   // Margin around the graph
    marginy: 80,
    acyclicer: 'greedy', // Handle cycles in the graph
    ranker: 'tight-tree' // Use tight tree ranking for better hierarchy
  });

  // Clear previous graph data
  nodes.forEach((node) => {
    if (dagreGraph.hasNode(node.id)) {
      dagreGraph.removeNode(node.id);
    }
  });

  edges.forEach((edge) => {
    if (dagreGraph.hasEdge(edge.source, edge.target)) {
      dagreGraph.removeEdge(edge.source, edge.target);
    }
  });

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // Add edges to dagre graph - verify IDs exist
  const validEdges = edges.filter(edge => {
    const sourceExists = nodes.find(n => n.id === edge.source)
    const targetExists = nodes.find(n => n.id === edge.target)
    
    if (!sourceExists) {
      console.warn(`Edge ${edge.id}: Source node ${edge.source} not found`)
      return false
    }
    if (!targetExists) {
      console.warn(`Edge ${edge.id}: Target node ${edge.target} not found`)
      return false
    }
    return true
  })

  console.log(`Valid edges: ${validEdges.length}/${edges.length}`)

  validEdges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Run the layout algorithm
  dagre.layout(dagreGraph);

  // Update node positions based on dagre calculations
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    // Set connection point positions based on layout direction
    const updatedNode = {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      // Shift the dagre node position (anchor=center) to match React Flow (anchor=top-left)
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };

    return updatedNode;
  });

  // Ensure edges maintain their styling and properties
  const layoutedEdges = validEdges.map(edge => ({
    ...edge,
    // Ensure proper edge styling
    style: {
      stroke: '#8B5CF6',
      strokeWidth: 3,
      ...edge.style
    },
    type: edge.type || 'smoothstep',
    animated: edge.animated !== false
  }))

  console.log('Layout Output:', {
    nodeCount: layoutedNodes.length,
    edgeCount: layoutedEdges.length,
    sampleLayoutedNode: layoutedNodes[0],
    sampleLayoutedEdge: layoutedEdges[0]
  })

  return { nodes: layoutedNodes, edges: layoutedEdges };
};

// Helper function to re-layout existing nodes and edges
export const applyLayout = (nodes: any[], edges: any[], direction = 'TB') => {
  return getLayoutedElements(nodes, edges, direction);
};
