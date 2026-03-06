import React, { useEffect, useState, useRef } from 'react';
import { 
  Activity, 
  Database, 
  Network, 
  Cpu, 
  TrendingUp, 
  FileCode, 
  AlertCircle,
  ChevronRight,
  Users,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SimulationData, Node, Link } from './types';
import { PYTHON_CODE } from './constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [data, setData] = useState<SimulationData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'network' | 'training' | 'code'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/simulation-data')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Sidebar */}
      <nav className="fixed left-0 top-0 h-full w-20 md:w-64 bg-[#0a0a0a] border-r border-white/5 z-50 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Activity className="text-black w-6 h-6" />
          </div>
          <span className="hidden md:block font-bold text-xl tracking-tight">MedResource AI</span>
        </div>

        <div className="flex-1 px-4 space-y-2 mt-8">
          <NavItem 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
            icon={<Database className="w-5 h-5" />}
            label="Overview"
          />
          <NavItem 
            active={activeTab === 'network'} 
            onClick={() => setActiveTab('network')}
            icon={<Network className="w-5 h-5" />}
            label="Resource Network"
          />
          <NavItem 
            active={activeTab === 'training'} 
            onClick={() => setActiveTab('training')}
            icon={<TrendingUp className="w-5 h-5" />}
            label="RL Training"
          />
          <NavItem 
            active={activeTab === 'code'} 
            onClick={() => setActiveTab('code')}
            icon={<FileCode className="w-5 h-5" />}
            label="Python Logic"
          />
        </div>

        <div className="p-6">
          <div className="bg-zinc-900/50 rounded-2xl p-4 hidden md:block">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-zinc-400">System Active</span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              MIMIC-III Engine running PPO optimization.
            </p>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pl-20 md:pl-64 min-h-screen">
        <header className="h-20 border-bottom border-white/5 flex items-center justify-between px-8 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-zinc-100 font-medium capitalize">{activeTab}</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-sm font-medium transition-colors border border-white/5">
              Export Report
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 border-2 border-white/10" />
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && <Overview data={data!} />}
            {activeTab === 'network' && <NetworkView data={data!.network} />}
            {activeTab === 'training' && <TrainingView data={data!.trainingResults} />}
            {activeTab === 'code' && <CodeView code={PYTHON_CODE} />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
        active 
          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
          : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
      )}
    >
      {icon}
      <span className="hidden md:block font-medium text-sm">{label}</span>
      {active && <motion.div layoutId="active-pill" className="ml-auto w-1 h-4 bg-emerald-500 rounded-full hidden md:block" />}
    </button>
  );
}

function Overview({ data }: { data: SimulationData }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users className="text-blue-400" />} label="Active Patients" value="1,284" change="+12%" />
        <StatCard icon={<Clock className="text-amber-400" />} label="Avg. Wait Time" value="14.2m" change="-4.5%" />
        <StatCard icon={<Cpu className="text-emerald-400" />} label="PPO Efficiency" value="94.2%" change="+2.1%" />
        <StatCard icon={<CheckCircle2 className="text-purple-400" />} label="Resource Utilization" value="88.7%" change="+0.8%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Patient Flow Simulation (24h)
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.patientFlow}>
                <defs>
                  <linearGradient id="colorArrival" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="time" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="arrival" stroke="#10b981" fillOpacity={1} fill="url(#colorArrival)" />
                <Area type="monotone" dataKey="waiting" stroke="#f59e0b" fillOpacity={0.1} fill="#f59e0b" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
          <h3 className="text-lg font-semibold mb-6">System Health</h3>
          <div className="space-y-6">
            <HealthIndicator label="MIMIC-III Pipeline" status="online" progress={100} />
            <HealthIndicator label="CNA Feature Extraction" status="online" progress={100} />
            <HealthIndicator label="PPO Training Loop" status="active" progress={85} />
            <HealthIndicator label="Baseline Evaluation" status="waiting" progress={40} />
          </div>
          <div className="mt-8 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-emerald-500">Optimization Insight</p>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  PPO agent suggests shifting 15% of OR staff to ICU during peak hours (14:00-16:00) to reduce bottleneck risk.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ icon, label, value, change }: { icon: React.ReactNode; label: string; value: string; change: string }) {
  const isPositive = change.startsWith('+');
  return (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <span className={cn(
          "text-xs font-medium px-2 py-1 rounded-full",
          isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
        )}>
          {change}
        </span>
      </div>
      <p className="text-zinc-500 text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold mt-1 tracking-tight">{value}</p>
    </div>
  );
}

function HealthIndicator({ label, status, progress }: { label: string; status: string; progress: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className={cn(
          "capitalize font-medium",
          status === 'online' || status === 'active' ? "text-emerald-500" : "text-zinc-500"
        )}>{status}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-emerald-500"
        />
      </div>
    </div>
  );
}

function NetworkView({ data }: { data: { nodes: Node[]; links: Link[] } }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 500;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const simulation = d3.forceSimulation(data.nodes as any)
      .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .selectAll("line")
      .data(data.links)
      .enter().append("line")
      .attr("stroke", "#ffffff10")
      .attr("stroke-width", (d: any) => Math.sqrt(d.value));

    const node = svg.append("g")
      .selectAll("g")
      .data(data.nodes)
      .enter().append("g")
      .call(d3.drag<any, any>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    node.append("circle")
      .attr("r", 12)
      .attr("fill", (d: any) => d.group === 1 ? "#10b981" : d.group === 2 ? "#3b82f6" : "#f59e0b")
      .attr("stroke", "#050505")
      .attr("stroke-width", 2);

    node.append("text")
      .text((d: any) => d.label)
      .attr("x", 16)
      .attr("y", 4)
      .attr("fill", "#a1a1aa")
      .attr("font-size", "10px")
      .attr("font-weight", "500");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [data]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8"
    >
      <div className="mb-8">
        <h3 className="text-xl font-bold">Complex Resource Network (CNA)</h3>
        <p className="text-zinc-500 text-sm mt-2">
          Visualizing hospital resource dependencies based on patient flow centrality.
        </p>
      </div>
      <div className="flex justify-center bg-[#050505] rounded-2xl border border-white/5 overflow-hidden">
        <svg ref={svgRef} width="800" height="500" className="max-w-full" />
      </div>
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="p-4 bg-white/5 rounded-2xl">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">High Centrality</p>
          <p className="text-lg font-bold mt-1">ER, ICU</p>
        </div>
        <div className="p-4 bg-white/5 rounded-2xl">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Bottleneck Risk</p>
          <p className="text-lg font-bold mt-1 text-amber-500">LAB, RAD</p>
        </div>
        <div className="p-4 bg-white/5 rounded-2xl">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Network Density</p>
          <p className="text-lg font-bold mt-1">0.42</p>
        </div>
      </div>
    </motion.div>
  );
}

function TrainingView({ data }: { data: any[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold">RL Strategy Performance Comparison</h3>
            <p className="text-zinc-500 text-sm mt-1">PPO vs DQN vs DDQN cumulative reward over episodes.</p>
          </div>
          <div className="flex gap-4">
            <LegendItem color="#10b981" label="PPO (Ours)" />
            <LegendItem color="#3b82f6" label="DDQN" />
            <LegendItem color="#f59e0b" label="DQN" />
          </div>
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="episode" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="ppo" stroke="#10b981" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="ddqn" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              <Line type="monotone" dataKey="dqn" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricBox label="PPO Convergence" value="1,420 eps" sub="Fastest" />
        <MetricBox label="Mean Reward" value="84.2" sub="+18% vs DQN" />
        <MetricBox label="Policy Stability" value="High" sub="Low Variance" />
      </div>
    </motion.div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-xs text-zinc-400 font-medium">{label}</span>
    </div>
  );
}

function MetricBox({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
      <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
      <p className="text-xs text-emerald-500 mt-1 font-medium">{sub}</p>
    </div>
  );
}

function CodeView({ code }: { code: string }) {
  const markdownCode = "```python\n" + code + "\n```";
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden"
    >
      <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <FileCode className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="font-bold">medical_optimizer.py</h3>
        </div>
        <button 
          onClick={() => navigator.clipboard.writeText(code)}
          className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
          Copy Code
        </button>
      </div>
      <div className="p-8 overflow-x-auto">
        <div className="prose prose-invert max-w-none">
          <Markdown>
            {markdownCode}
          </Markdown>
        </div>
      </div>
    </motion.div>
  );
}
