import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { Code, Terminal, Puzzle, Zap, Rocket, ArrowRight, Github, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="container py-24 md:py-32">
        <div className="flex flex-col items-center text-center space-y-8">
          <Badge variant="secondary" className="px-4 py-2">
            <Zap className="h-4 w-4 mr-2" />
            Flow Blockchain Developer Toolkit
          </Badge>

          <div className="space-y-4 max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold text-balance">
              Build on Flow with <span className="text-primary">FlowDevKit</span>
            </h1>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Smart contract templates, deployment scripts, and frontend integration tools to help developers launch
              faster on the Flow blockchain.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link href="/contracts">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="https://github.com/flowdevkit" target="_blank">
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24 bg-muted/50">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">Everything you need to build on Flow</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Lower the entry barrier and help developers launch faster with our comprehensive toolkit.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Smart Contract Templates</CardTitle>
              <CardDescription>
                Ready-to-use Cadence contracts for NFTs, fungible tokens, and staking mechanisms.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• NFT collection with metadata</li>
                <li>• ERC-20 style fungible tokens</li>
                <li>• Staking and rewards contracts</li>
                <li>• Marketplace implementations</li>
              </ul>
              <Button variant="ghost" className="mt-4 p-0" asChild>
                <Link href="/contracts">
                  Explore Templates
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Terminal className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>CLI Deployment Tools</CardTitle>
              <CardDescription>
                Simple command-line scripts to deploy contracts and interact with the Flow network.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• One-command contract deployment</li>
                <li>• Interactive transaction scripts</li>
                <li>• Network configuration management</li>
                <li>• Account setup automation</li>
              </ul>
              <Button variant="ghost" className="mt-4 p-0" asChild>
                <Link href="/cli">
                  View CLI Tools
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Puzzle className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Frontend Integration</CardTitle>
              <CardDescription>
                React hooks and components for seamless wallet integration and blockchain interactions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Wallet connection hooks</li>
                <li>• Transaction signing components</li>
                <li>• NFT balance queries</li>
                <li>• Real-time event listening</li>
              </ul>
              <Button variant="ghost" className="mt-4 p-0" asChild>
                <Link href="/integration">
                  Integration Guide
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container py-24">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-4xl font-bold text-primary">10+</div>
            <div className="text-sm text-muted-foreground">Smart Contract Templates</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-primary">5+</div>
            <div className="text-sm text-muted-foreground">CLI Tools</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-primary">15+</div>
            <div className="text-sm text-muted-foreground">Integration Examples</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24 bg-muted/50">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to build on Flow?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join the growing community of developers building the future of digital assets on Flow.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/contracts">
                Start Building
                <Rocket className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/docs">
                Read Documentation
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                  <Code className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold">FlowDevKit</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Making Flow blockchain development accessible to everyone.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Resources</h4>
              <div className="space-y-2 text-sm">
                <Link href="/contracts" className="block text-muted-foreground hover:text-foreground">
                  Smart Contracts
                </Link>
                <Link href="/cli" className="block text-muted-foreground hover:text-foreground">
                  CLI Tools
                </Link>
                <Link href="/integration" className="block text-muted-foreground hover:text-foreground">
                  Integration
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Community</h4>
              <div className="space-y-2 text-sm">
                <Link
                  href="https://github.com/flowdevkit"
                  className="block text-muted-foreground hover:text-foreground"
                >
                  GitHub
                </Link>
                <Link href="https://discord.gg/flow" className="block text-muted-foreground hover:text-foreground">
                  Discord
                </Link>
                <Link href="https://forum.flow.com" className="block text-muted-foreground hover:text-foreground">
                  Forum
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Flow Ecosystem</h4>
              <div className="space-y-2 text-sm">
                <Link href="https://flow.com" className="block text-muted-foreground hover:text-foreground">
                  Flow.com
                </Link>
                <Link href="https://docs.flow.com" className="block text-muted-foreground hover:text-foreground">
                  Flow Docs
                </Link>
                <Link href="https://cadence-lang.org" className="block text-muted-foreground hover:text-foreground">
                  Cadence
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 FlowDevKit. Built for the Flow blockchain community.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
