import HandlerHeader from "@/components/handler-header";
import { Card, CardContent } from "@/components/ui/card";

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <HandlerHeader />
      <div className="pt-8 flex items-start justify-center px-6">
        <Card className="w-full max-w-6xl mt-8">
          <CardContent className="p-8">
            {props.children}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}