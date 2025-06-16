import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
