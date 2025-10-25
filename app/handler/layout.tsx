import HandlerHeader from "@/components/handler-header";

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <HandlerHeader />
      <div className="pt-14">
        {props.children}
      </div>
    </div>
  )
}