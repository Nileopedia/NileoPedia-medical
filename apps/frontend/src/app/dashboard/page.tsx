import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { Search } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600">NileoPedia</h1>
          <ThemeToggle />
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Medical Knowledge Assistant</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Ask medical questions and receive evidence-based, citation-grounded responses.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>New Medical Query</CardTitle>
            <CardDescription>
              Enter your medical question for AI-assisted research
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="e.g., What are the treatment options for acute myocardial infarction?"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button className="bg-primary-600 hover:bg-primary-700">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Recent Queries</h3>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    What are the diagnostic criteria for sepsis?
                  </CardTitle>
                  <CardDescription>
                    Asked 2 hours ago • Validated Response
                  </CardDescription>
                </div>
                <Badge variant="success">Approved</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sepsis is defined as life-threatening organ dysfunction caused by a dysregulated host response to infection...
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    First-line treatment for community-acquired pneumonia
                  </CardTitle>
                  <CardDescription>
                    Asked 1 day ago • Pending Validation
                  </CardDescription>
                </div>
                <Badge variant="warning">Pending</Badge>
              </div>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  )
}