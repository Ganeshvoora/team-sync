'use client'

import React from 'react'
import ReactFlow, { Controls, MiniMap, Background, BackgroundVariant } from 'reactflow'
import 'reactflow/dist/style.css'

// Simple test data to verify edges work
const testNodes = [
  {
    id: 'ceo',
    position: { x: 400, y: 50 },
    data: { label: 'CEO' },
    style: { background: '#8B5CF6', color: 'white', border: '1px solid #fff', borderRadius: '8px', padding: '10px' }
  },
  {
    id: 'manager1',
    position: { x: 200, y: 200 },
    data: { label: 'Manager 1' },
    style: { background: '#3B82F6', color: 'white', border: '1px solid #fff', borderRadius: '8px', padding: '10px' }
  },
  {
    id: 'manager2',
    position: { x: 600, y: 200 },
    data: { label: 'Manager 2' },
    style: { background: '#3B82F6', color: 'white', border: '1px solid #fff', borderRadius: '8px', padding: '10px' }
  },
  {
    id: 'employee1',
    position: { x: 100, y: 350 },
    data: { label: 'Employee 1' },
    style: { background: '#10B981', color: 'white', border: '1px solid #fff', borderRadius: '8px', padding: '10px' }
  },
  {
    id: 'employee2',
    position: { x: 300, y: 350 },
    data: { label: 'Employee 2' },
    style: { background: '#10B981', color: 'white', border: '1px solid #fff', borderRadius: '8px', padding: '10px' }
  }
]

const testEdges = [
  {
    id: 'e-ceo-manager1',
    source: 'ceo',
    target: 'manager1',
    type: 'smoothstep',
    style: { stroke: '#8B5CF6', strokeWidth: 3 },
    animated: true
  },
  {
    id: 'e-ceo-manager2',
    source: 'ceo',
    target: 'manager2',
    type: 'smoothstep',
    style: { stroke: '#8B5CF6', strokeWidth: 3 },
    animated: true
  },
  {
    id: 'e-manager1-employee1',
    source: 'manager1',
    target: 'employee1',
    type: 'smoothstep',
    style: { stroke: '#3B82F6', strokeWidth: 2 },
    animated: true
  },
  {
    id: 'e-manager1-employee2',
    source: 'manager1',
    target: 'employee2',
    type: 'smoothstep',
    style: { stroke: '#3B82F6', strokeWidth: 2 },
    animated: true
  }
]

export default function TestOrgChart() {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 to-purple-900">
      <div className="absolute top-4 left-4 z-10 bg-black/40 backdrop-blur-xl rounded-lg p-4 border border-white/10">
        <h3 className="text-white font-semibold mb-2">Edge Test Chart</h3>
        <p className="text-gray-300 text-sm">This should show visible edges connecting the nodes</p>
        <div className="mt-2 text-xs text-gray-400">
          <p>Nodes: {testNodes.length}</p>
          <p>Edges: {testEdges.length}</p>
        </div>
      </div>
      
      <ReactFlow
        nodes={testNodes}
        edges={testEdges}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        className="bg-transparent"
      >
        <Controls className="bg-black/20 border border-white/20" />
        <MiniMap 
          className="bg-black/40 border border-white/20" 
          nodeColor="#8B5CF6"
        />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={15} 
          size={1.5} 
          color="#ffffff15" 
        />
      </ReactFlow>
    </div>
  )
}
