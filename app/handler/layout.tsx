import HandlerHeader from "@/components/handler-header";
import { Card, CardContent } from "@/components/ui/card";

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <HandlerHeader />
      <div className="pt-4 flex items-start justify-center px-4">
        <Card className="w-full max-w-md mt-5">
          <CardContent className="p-0">
            {props.children}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}