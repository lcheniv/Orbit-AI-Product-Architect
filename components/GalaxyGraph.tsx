import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ArtifactData, ArtifactType, GraphLink, GraphNode } from '../types';
import { getIconPath } from './Icons';

interface GalaxyGraphProps {
  data: ArtifactData | null;
  onNodeSelect: (node: ArtifactData) => void;
  isDarkMode: boolean;
}

const GalaxyGraph: React.FC<GalaxyGraphProps> = ({ data, onNodeSelect, isDarkMode }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return;

    // 1. Flatten Data
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    const traverse = (node: ArtifactData, parentId: string | null) => {
      // Determine radius based on type
      let r = 5;
      if (node.type === ArtifactType.CORE) r = 45;
      if (node.type === ArtifactType.EPIC) r = 30;
      if (node.type === ArtifactType.FEATURE) r = 20;
      if (node.type === ArtifactType.STORY) r = 12;

      nodes.push({ 
        id: node.id, 
        type: node.type, 
        data: node, 
        r 
      });

      if (parentId) {
        links.push({ source: parentId, target: node.id });
      }

      if (node.children) {
        node.children.forEach(child => traverse(child, node.id));
      }
    };

    traverse(data, null);

    // 2. Setup D3
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .style("font-family", '"Space Mono", monospace');

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance((d) => {
           const target = d.target as GraphNode;
           if (target.type === ArtifactType.EPIC) return 180;
           if (target.type === ArtifactType.FEATURE) return 100;
           return 50;
      }))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius((d: any) => d.r + 15));

    // Glow filters
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Colors
    const getFill = (type: ArtifactType) => {
        switch(type) {
            case ArtifactType.CORE: return "#FFD700";
            case ArtifactType.EPIC: return "#7000FF";
            case ArtifactType.FEATURE: return "#00F0FF";
            case ArtifactType.STORY: return isDarkMode ? "#ffffff" : "#6B7280";
            default: return "#ccc";
        }
    }

    // Draw Links
    const link = svg.append("g")
      .attr("stroke", isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")
      .attr("stroke-width", 1)
      .selectAll("line")
      .data(links)
      .join("line");

    // Draw Nodes
    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "pointer")
      .on("click", (event, d) => {
         onNodeSelect(d.data);
      })
      .call(drag(simulation) as any);

    // Node circles
    node.append("circle")
      .attr("r", (d) => d.r || 5)
      .attr("fill", (d) => getFill(d.type))
      .attr("fill-opacity", isDarkMode ? 0.8 : 0.9)
      .attr("stroke", (d) => {
         if (d.type === ArtifactType.CORE) return "#FFA500";
         return isDarkMode ? "white" : "transparent";
      })
      .attr("stroke-width", (d) => d.type === ArtifactType.STORY ? 0 : 2)
      .style("filter", isDarkMode ? "url(#glow)" : "none")
      .style("box-shadow", "0 4px 6px -1px rgba(0, 0, 0, 0.1)");

    // Icons inside nodes
    node.append("path")
      .attr("d", d => getIconPath(d.type))
      .attr("fill", (d) => {
          if (d.type === ArtifactType.STORY) return isDarkMode ? "#000" : "#fff";
          return "#fff";
      })
      .attr("transform", (d) => {
          const scale = (d.r || 10) / 16;
          return `translate(-12, -12) scale(${scale})`;
      })
      .attr("opacity", 0.9);

    // Node Labels
    node.append("text")
      .text(d => {
        if (d.type === ArtifactType.STORY) return ""; 
        return d.data.title.length > 15 ? d.data.title.substring(0, 15) + '...' : d.data.title;
      })
      .attr("x", (d) => (d.r || 5) + 5)
      .attr("y", 4)
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("fill", isDarkMode ? "#ccc" : "#374151")
      .attr("stroke", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
            svg.selectAll("g").attr("transform", event.transform);
        });

    // @ts-ignore
    svg.call(zoom);

    return () => {
      simulation.stop();
    };
  }, [data, onNodeSelect, isDarkMode]);

  function drag(simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>) {
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      <svg ref={svgRef} className="w-full h-full"></svg>
      {/* Legend */}
      <div className="absolute bottom-4 left-4 text-xs font-mono pointer-events-none opacity-50">
        <div className="flex items-center gap-2 mb-1 text-space-900 dark:text-white"><div className="w-3 h-3 rounded-full bg-[#FFD700]"></div> Core</div>
        <div className="flex items-center gap-2 mb-1 text-space-900 dark:text-white"><div className="w-3 h-3 rounded-full bg-[#7000FF]"></div> Epic</div>
        <div className="flex items-center gap-2 mb-1 text-space-900 dark:text-white"><div className="w-3 h-3 rounded-full bg-[#00F0FF]"></div> Feature</div>
        <div className="flex items-center gap-2 text-space-900 dark:text-white"><div className="w-3 h-3 rounded-full bg-gray-500 dark:bg-white"></div> Story</div>
      </div>
    </div>
  );
};

export default GalaxyGraph;