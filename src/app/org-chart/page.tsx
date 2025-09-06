'use client'

import React, { useCallback, useState, useEffect, useMemo } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  BackgroundVariant,
  Handle,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import PageHeader from '@/components/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { X, User, Mail, Phone, MapPin, Calendar, Users, Award, RotateCcw } from 'lucide-react'
import { getLayoutedElements } from '@/utils/orgChartLayout'

// Custom node component for organization chart
const OrgChartNode = ({ data }: { data: any }) => {
  const isCurrentUser = data.isCurrentUser;
  const canManage = data.canManage;
  const isAdmin = data.isAdmin;
  
  return (
    <div 
      className={`backdrop-blur-xl border rounded-xl p-4 min-w-[220px] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer ${
        isCurrentUser 
          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/50' 
          : 'bg-white dark:bg-white/10 border-gray-200 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/15'
      }`}
      onClick={() => data.onNodeClick && data.onNodeClick(data)}
    >
      {/* Handle for incoming connections (from manager above) */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!bg-transparent !border-transparent !w-2 !h-2" 
        style={{ opacity: 0 }}
      />

      <div className="flex items-center space-x-3">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
          isCurrentUser 
            ? 'bg-gradient-to-r from-blue-400 to-purple-400' 
            : 'bg-gradient-to-r from-blue-500 to-purple-500'
        }`}>
          <span className="text-white font-medium text-lg">
            {data.name.split(' ').map((n: string) => n[0]).join('')}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-gray-900 dark:text-white font-semibold text-sm">{data.name}</h3>
            {isCurrentUser && (
              <span className="bg-blue-100 dark:bg-blue-400/20 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded">You</span>
            )}
          </div>
          <p className="text-blue-700 dark:text-blue-200 text-xs">{data.role}</p>
          <p className="text-purple-700 dark:text-purple-200 text-xs">{data.department}</p>
          {data.employeeId && (
            <p className="text-gray-600 dark:text-gray-300 text-xs">{data.employeeId}</p>
          )}
        </div>
      </div>
      
      <div className="mt-3 flex justify-between items-center">
        {data.teamSize > 0 && (
          <div className="bg-gray-100 dark:bg-white/10 rounded-lg px-2 py-1">
            <p className="text-gray-900 dark:text-white text-xs font-medium">Team: {data.teamSize}</p>
          </div>
        )}
        
        {canManage && (
          <span className="bg-green-100 dark:bg-green-400/20 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded">
            {isAdmin ? 'Admin Access' : 'Manageable'}
          </span>
        )}
      </div>

      {/* Handle for outgoing connections (to direct reports below) */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!bg-transparent !border-transparent !w-2 !h-2" 
        style={{ opacity: 0 }}
      />
    </div>
  )
}

const nodeTypes = {
  orgNode: OrgChartNode,
}

export default function OrgChartPage() {
  const [rawNodes, setRawNodes] = useState<any[]>([])
  const [rawEdges, setRawEdges] = useState<any[]>([])
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [sidebarUser, setSidebarUser] = useState<any>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [popupUser, setPopupUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('TB')

  // Handle node click for sidebar
  const handleNodeClick = useCallback((userData: any) => {
    setSidebarUser(userData)
  }, [])

  // Apply Dagre layout to nodes and edges
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    if (rawNodes.length === 0 || rawEdges.length === 0) {
      console.log('No raw data available for layout')
      return { nodes: [], edges: [] }
    }

    console.log('Processing layout with:', {
      rawNodesCount: rawNodes.length,
      rawEdgesCount: rawEdges.length,
      layoutDirection
    })

    // Add click handlers to nodes before layout
    const nodesWithHandlers = rawNodes.map((node: any) => ({
      ...node,
      data: {
        ...node.data,
        onNodeClick: handleNodeClick
      }
    }))

    // Ensure edges have proper format and styling
    const processedEdges = rawEdges.map((edge: any) => ({
      id: edge.id || `edge-${edge.source}-${edge.target}`,
      source: String(edge.source), // Ensure string type
      target: String(edge.target), // Ensure string type
      type: 'smoothstep',
      style: { 
        stroke: '#8B5CF6', 
        strokeWidth: 3,
        strokeDasharray: '5,5'
      },
      animated: true,
      ...edge // Preserve any additional properties
    }))

    console.log('Processed edges:', processedEdges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target
    })))

    return getLayoutedElements(nodesWithHandlers, processedEdges, layoutDirection)
  }, [rawNodes, rawEdges, layoutDirection, handleNodeClick])

  // Use React Flow state management
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges)

  // Update React Flow nodes/edges when layout changes
  useEffect(() => {
    setNodes(layoutedNodes)
    setEdges(layoutedEdges)
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges])

  // Load org chart data
  useEffect(() => {
    const loadOrgData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Add timeout to prevent infinite loading
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 15 second timeout
        
        const response = await fetch('/api/org-chart', {
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Please log in to view the organization chart')
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }
        
        if (data.nodes && data.edges) {
          console.log('Raw API Data:', {
            nodesCount: data.nodes.length,
            edgesCount: data.edges.length,
            sampleNode: data.nodes[0],
            sampleEdge: data.edges[0]
          })
          
          // Verify node IDs and edge connections
          const nodeIds = data.nodes.map((node: any) => node.id)
          const edgeConnections = data.edges.map((edge: any) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceExists: nodeIds.includes(edge.source),
            targetExists: nodeIds.includes(edge.target)
          }))
          
          console.log('Node IDs:', nodeIds)
          console.log('Edge Connections:', edgeConnections)
          
          // Store raw data for layout processing
          setRawNodes(data.nodes)
          setRawEdges(data.edges)
          setStats(data.stats)
        } else {
          console.warn('No nodes or edges data received')
          setError('No organization data available')
        }
      } catch (error: any) {
        console.error('Error loading org chart data:', error)
        setError(error.name === 'AbortError' ? 'Request timeout - please try again' : 'Failed to load organization chart')
        // Set empty data to stop loading state
        setRawNodes([])
        setRawEdges([])
      } finally {
        setLoading(false)
      }
    }

    loadOrgData()
  }, []) // Removed dependencies since we're using raw state now

  // Refresh layout function
  const refreshLayout = useCallback(() => {
    if (rawNodes.length > 0 && rawEdges.length > 0) {
      // Force re-layout by toggling direction or triggering re-calculation
      const { nodes: newNodes, edges: newEdges } = getLayoutedElements(
        rawNodes.map((node: any) => ({
          ...node,
          data: {
            ...node.data,
            onNodeClick: handleNodeClick
          }
        })),
        rawEdges.map((edge: any) => ({
          ...edge,
          style: { 
            stroke: '#8B5CF6', 
            strokeWidth: 3,
            strokeDasharray: '5,5'
          },
          animated: true,
          type: 'smoothstep'
        })),
        layoutDirection
      )
      setNodes(newNodes)
      setEdges(newEdges)
    }
  }, [rawNodes, rawEdges, layoutDirection, handleNodeClick, setNodes, setEdges])

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.data)
  }, [])

  if (loading) {
    return (
      <div className="p-4">
        <PageHeader title="Organization Chart" subtitle="Interactive View" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-white mx-auto mb-4"></div>
            <div className="text-gray-900 dark:text-white text-xl mb-2">Loading organization chart...</div>
            <div className="text-blue-600 dark:text-blue-300 text-sm">This should take just a moment</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <PageHeader title="Organization Chart" subtitle="Interactive View" />
        <div className="bg-white dark:bg-white/10 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-white/20 p-8 text-center">
          <div className="text-red-500 dark:text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-gray-900 dark:text-white text-xl font-semibold mb-2">Unable to Load Organization Chart</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          {error.includes('log in') ? (
            <a
              href="/login"
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 inline-block"
            >
              Go to Login
            </a>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <PageHeader title="Organization Chart" subtitle="Interactive View" />
      {stats && stats.adminView && (
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/20 p-4 mb-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-500/20 mr-3">
              <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-gray-900 dark:text-white text-lg font-medium">{stats.userRole === 'CEO' ? 'CEO Organization View' : 'Administrator Organization View'}</h2>
              <p className="text-purple-700 dark:text-purple-200 text-sm">
                You have full visibility and management capabilities over all team members
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex min-h-[80vh] gap-4">
        {/* Main Chart Area */}
        <div className={`bg-white dark:bg-white/5 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-white/10 p-6 relative transition-all duration-300 ${
          sidebarUser ? 'flex-1' : 'w-full'
        }`}>
          {/* Debug Panel */}
          {/* <div className="absolute bottom-6 left-6 z-10 bg-gray-100 dark:bg-black/40 backdrop-blur-xl rounded-lg p-4 border border-gray-200 dark:border-white/10 max-w-sm">
            <h3 className="text-gray-900 dark:text-white font-semibold mb-2 text-sm">Debug Info</h3>
            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
              <p>Nodes: {nodes.length}</p>
              <p>Edges: {edges.length}</p>
              <p>Raw Nodes: {rawNodes.length}</p>
              <p>Raw Edges: {rawEdges.length}</p>
              {edges.length > 0 && (
                <div className="mt-2">
                  <p className="text-gray-400">Sample Edge:</p>
                  <pre className="text-xs bg-black/20 p-2 rounded mt-1 overflow-auto max-h-20">
                    {JSON.stringify(edges[0], null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div> */}

          {/* Layout Controls */}
          <div className="absolute top-6 right-6 z-10 bg-white dark:bg-black/40 backdrop-blur-xl rounded-lg p-3 border border-gray-200 dark:border-white/10">
            <div className="flex items-center space-x-2">
              <span className="text-gray-900 dark:text-white text-sm">Layout:</span>
              <Button
                variant={layoutDirection === 'TB' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLayoutDirection('TB')}
                className="text-xs h-8"
              >
                Vertical
              </Button>
              <Button
                variant={layoutDirection === 'LR' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLayoutDirection('LR')}
                className="text-xs h-8"
              >
                Horizontal
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshLayout}
                className="text-xs h-8 ml-2"
                title="Refresh Layout"
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Statistics Panel */}
          {stats && (
            <div className="absolute top-6 left-6 z-10 bg-white/90 dark:bg-black/40 backdrop-blur-xl rounded-lg p-4 border border-gray-200 dark:border-white/10">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-gray-900 dark:text-white font-semibold">Organization Stats</h3>
                {stats.adminView && (
                  <Badge variant="outline" className="ml-2 bg-purple-100 dark:bg-purple-600/30 border-purple-300 dark:border-purple-500/30 text-purple-700 dark:text-purple-200 text-xs">
                    {stats.userRole === 'CEO' ? 'CEO View' : 'Admin View'} • Full Access
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Total Users:</span>
                  <p className="text-gray-900 dark:text-white font-medium">{stats.totalUsers}</p>
                  {stats.adminView && (
                    <p className="text-purple-600 dark:text-purple-300 text-xs">Organization-wide</p>
                  )}
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Departments:</span>
                  <p className="text-gray-900 dark:text-white font-medium">{stats.departments}</p>
                  {stats.adminView && (
                    <p className="text-purple-600 dark:text-purple-300 text-xs">All departments</p>
                  )}
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Managers:</span>
                  <p className="text-gray-900 dark:text-white font-medium">{stats.managers}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Direct Reports:</span>
                  <p className="text-gray-900 dark:text-white font-medium">{stats.directReports}</p>
                </div>
              </div>
            </div>
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{
              padding: 0.3,
              minZoom: 0.3,
              maxZoom: 1.5
            }}
            minZoom={0.1}
            maxZoom={2}
            className="bg-transparent"
            proOptions={{ hideAttribution: true }}
          >
            <Controls className="bg-white/20 dark:bg-black/20 border border-gray-300 dark:border-white/20" />
            <MiniMap 
              className="bg-white/40 dark:bg-black/40 border border-gray-300 dark:border-white/20" 
              nodeColor={(node) => node.data.isCurrentUser ? '#3B82F6' : '#8B5CF6'}
              pannable
              zoomable
            />
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={15} 
              size={1.5} 
              color="#ffffff15" 
            />
          </ReactFlow>
        </div>

        {/* Profile Sidebar */}
        {sidebarUser && (
          <div className="w-80 bg-white dark:bg-white/10 backdrop-blur-xl rounded-xl border border-gray-300 dark:border-white/20 p-6 overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-gray-900 dark:text-white font-bold text-lg">Profile Details</h3>
                {sidebarUser.isAdmin && sidebarUser.canManage && (
                  <div className="flex items-center mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                    <span className="text-xs text-green-700 dark:text-green-300 font-semibold">
                      Administrative access to this employee
                    </span>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarUser(null)}
                className="text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Profile Header */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-extrabold text-2xl">
                    {sidebarUser.name.split(' ').map((n: string) => n[0]).join('')}
                  </span>
                </div>
                <h4 className="text-gray-900 dark:text-white font-bold text-lg">{sidebarUser.name}</h4>
                <p className="text-blue-700 dark:text-blue-200 text-sm font-medium">{sidebarUser.email}</p>
                <div className="flex justify-center space-x-2 mt-2">
                  <Badge variant="secondary" className="bg-blue-200 dark:bg-blue-400/20 text-blue-900 dark:text-blue-300 font-semibold">
                    {sidebarUser.role}
                  </Badge>
                  <Badge variant="outline" className="border-purple-300 dark:border-purple-400/50 text-purple-800 dark:text-purple-300 font-semibold">
                    {sidebarUser.department}
                  </Badge>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-white/5 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Personal Info</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    {sidebarUser.employeeId && (
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-400 font-medium">Employee ID:</span>
                        <span className="text-gray-900 dark:text-white font-semibold">{sidebarUser.employeeId}</span>
                      </div>
                    )}
                    {sidebarUser.contactNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-400 font-medium">Phone:</span>
                        <span className="text-gray-900 dark:text-white font-semibold">{sidebarUser.contactNumber}</span>
                      </div>
                    )}
                    {sidebarUser.location && (
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-400 font-medium">Location:</span>
                        <span className="text-gray-900 dark:text-white font-semibold">{sidebarUser.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {sidebarUser.teamSize > 0 && (
                  <div className="bg-green-50 dark:bg-white/5 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-700 dark:text-gray-300 font-semibold">Team Lead</span>
                    </div>
                    <p className="text-green-900 dark:text-white text-sm font-semibold">Manages {sidebarUser.teamSize} team members</p>
                  </div>
                )}

                {sidebarUser.skills && (
                  <div className="bg-yellow-50 dark:bg-white/5 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Award className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-yellow-700 dark:text-gray-300 font-semibold">Skills</span>
                    </div>
                    <p className="text-yellow-900 dark:text-white text-sm font-semibold">{sidebarUser.skills}</p>
                  </div>
                )}

                {sidebarUser.bio && (
                  <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-3">
                    <span className="text-sm text-gray-700 dark:text-gray-300 block mb-2 font-semibold">Bio</span>
                    <p className="text-gray-900 dark:text-white text-sm font-semibold">{sidebarUser.bio}</p>
                  </div>
                )}
              </div>

              {/* View More Button */}
              <Button
                onClick={() => {
                  setPopupUser(sidebarUser)
                  setShowPopup(true)
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                View Full Profile
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Full Profile Popup */}
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {popupUser?.name.split(' ').map((n: string) => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="text-xl">{popupUser?.name}</h3>
                <p className="text-sm text-gray-300">{popupUser?.role} • {popupUser?.department}</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {popupUser && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Contact Information */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Mail className="w-5 h-5" />
                    <span>Contact Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-gray-400 text-sm">Email:</span>
                    <p className="text-white">{popupUser.email}</p>
                  </div>
                  {popupUser.contactNumber && (
                    <div>
                      <span className="text-gray-400 text-sm">Phone:</span>
                      <p className="text-white">{popupUser.contactNumber}</p>
                    </div>
                  )}
                  {popupUser.location && (
                    <div>
                      <span className="text-gray-400 text-sm">Location:</span>
                      <p className="text-white">{popupUser.location}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Professional Details */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>Professional Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-gray-400 text-sm">Role:</span>
                    <p className="text-white">{popupUser.role}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Department:</span>
                    <p className="text-white">{popupUser.department}</p>
                  </div>
                  {popupUser.employeeId && (
                    <div>
                      <span className="text-gray-400 text-sm">Employee ID:</span>
                      <p className="text-white">{popupUser.employeeId}</p>
                    </div>
                  )}
                  {popupUser.teamSize > 0 && (
                    <div>
                      <span className="text-gray-400 text-sm">Team Size:</span>
                      <p className="text-white">{popupUser.teamSize} members</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Skills & Bio */}
              {(popupUser.skills || popupUser.bio) && (
                <Card className="bg-white/5 border-white/10 md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-white">About</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {popupUser.skills && (
                      <div>
                        <span className="text-gray-400 text-sm block mb-2">Skills:</span>
                        <p className="text-white">{popupUser.skills}</p>
                      </div>
                    )}
                    {popupUser.bio && (
                      <div>
                        <span className="text-gray-400 text-sm block mb-2">Bio:</span>
                        <p className="text-white">{popupUser.bio}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
