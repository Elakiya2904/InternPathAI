
"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';
import { GenerateMindMapOutput } from '@/ai/flows/generate-mind-map';
import { GeneratePersonalizedRoadmapOutput } from '@/ai/flows/generate-personalized-roadmap';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CheckCircle, ListTodo, BookOpen, Lightbulb, BrainCircuit, type LucideIcon, icons } from 'lucide-react';


type MindMapNodeProps = {
  node: GenerateMindMapOutput['nodes'][0] & { children: any[] };
  level: number;
  roadmapDetails: GeneratePersonalizedRoadmapOutput['roadmap'];
};

const NodeDetailsDialog = ({ node, roadmapDetails }: { node: GenerateMindMapOutput['nodes'][0], roadmapDetails: GeneratePersonalizedRoadmapOutput['roadmap'] }) => {
    const detail = roadmapDetails.find(d => d.title.toLowerCase() === node.label.toLowerCase());

    if (!detail) {
        return (
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{node.label}</DialogTitle>
                    <DialogDescription>No detailed information available for this skill.</DialogDescription>
                </DialogHeader>
            </DialogContent>
        );
    }
    const Icon = icons[detail.icon as keyof typeof icons] as LucideIcon || BrainCircuit;

    return (
         <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-3"><Icon className="w-8 h-8 text-primary"/>{detail.title}</DialogTitle>
                <DialogDescription className="text-base">{detail.description}</DialogDescription>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-6">
                <div>
                    <h4 className="font-bold text-xl mb-3 flex items-center gap-2 text-primary"><ListTodo/> Tasks</h4>
                    <ul className="space-y-3">
                        {detail.tasks.map((task, i) => (
                            <li key={i} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-md">
                                <CheckCircle className="w-5 h-5 mt-1 text-green-500 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">{task.subTaskTitle}</p>
                                    <p className="text-muted-foreground text-sm">{task.description}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-xl mb-3 flex items-center gap-2 text-primary"><BookOpen/> Resources</h4>
                    <ul className="space-y-2 list-disc list-inside text-muted-foreground pl-2">
                        {detail.resources.map((resource, i) => <li key={i} className="mb-1">{resource}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-xl mb-3 flex items-center gap-2 text-primary"><Lightbulb/> Project Idea</h4>
                    <p className="text-muted-foreground p-4 bg-secondary/50 rounded-md border border-border">{detail.project}</p>
                </div>
            </div>
        </DialogContent>
    )
}


const MindMapNode = ({ node, level, roadmapDetails }: MindMapNodeProps) => {
  const hasChildren = node.children && node.children.length > 0;
  const isRoot = level === 0;

  const detail = roadmapDetails.find(d => d.title.toLowerCase() === node.label.toLowerCase());

  const NodeContent = () => (
    <div
      className={cn(
        'relative p-3 rounded-lg border-2 w-max min-w-[120px] text-center transition-all duration-300',
        isRoot 
          ? 'bg-primary text-primary-foreground border-primary text-lg font-bold' 
          : 'bg-card text-card-foreground border-border',
        detail ? 'cursor-pointer hover:border-primary hover:shadow-lg' : 'cursor-default',
        'shadow-md'
      )}
    >
      {node.label}
    </div>
  );

  return (
    <div className="relative flex items-center">
      {detail ? (
        <Dialog>
            <DialogTrigger asChild><NodeContent /></DialogTrigger>
            <NodeDetailsDialog node={node} roadmapDetails={roadmapDetails} />
        </Dialog>
      ) : (
        <NodeContent />
      )}

      {hasChildren && (
        <div className="pl-8 flex flex-col justify-center">
          {node.children.map((child: any, index: number) => (
            <div key={child.id} className="relative flex items-center my-2">
              <div className="absolute -left-8 h-full w-4 flex items-center justify-end">
                <div className="h-0.5 w-4 bg-primary/50"></div>
                {/* Vertical Connector from parent to this horizontal line */}
                <div className={cn("absolute w-0.5 bg-primary/50",
                  node.children.length === 1 ? "h-0" :
                  index === 0 ? "h-1/2 top-1/2" :
                  index === node.children.length - 1 ? "h-1/2 bottom-1/2" :
                  "h-full"
                )}></div>
              </div>
              <MindMapNode node={child} level={level + 1} roadmapDetails={roadmapDetails} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


type MindMapProps = {
  data: GenerateMindMapOutput;
  roadmapDetails: GeneratePersonalizedRoadmapOutput['roadmap'];
};

export const MindMap = ({ data, roadmapDetails }: MindMapProps) => {
  const rootNode = data.nodes.find(n => !data.edges.some(e => e.target === n.id));

  if (!rootNode) {
    return <div>Error: Could not find the root node of the mind map.</div>;
  }

  const buildHierarchy = (nodeId: string): GenerateMindMapOutput['nodes'][0] & { children: any[] } => {
    const node = data.nodes.find(n => n.id === nodeId)!;
    const childrenIds = data.edges.filter(e => e.source === nodeId).map(e => e.target);
    const children = childrenIds.map(childId => buildHierarchy(childId));
    return { ...node, children };
  };

  const hierarchicalData = buildHierarchy(rootNode.id);

  return (
    <div className="flex justify-center items-center w-full p-4 overflow-x-auto">
        <div className="flex items-center">
            <MindMapNode node={hierarchicalData} level={0} roadmapDetails={roadmapDetails}/>
        </div>
    </div>
  );
};
