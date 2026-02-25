import WorkflowBlocking from "@/src/components/WorkflowBlocking"; 

export default function WorkflowBlockingPage() { 
  return ( 
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50"> 
      <div className="max-w-4xl w-full"> 
        <h1 className="text-4xl font-bold text-center mb-8">Dify API</h1> 
        <WorkflowBlocking /> 
      </div> 
    </main> 
  ) 
}