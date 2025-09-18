import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CodeBlock } from "@/components/code-block"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BookOpen,
  Rocket,
  Code,
  Terminal,
  Puzzle,
  ArrowRight,
  ExternalLink,
  CheckCircle,
  Clock,
  Users,
  Lightbulb,
  Info,
} from "lucide-react"
import Link from "next/link"

const quickStartSteps = [
  {
    title: "Install Flow CLI",
    description: "Set up the Flow command line interface",
    time: "2 min",
    code: `# Install Flow CLI
curl -fsSL https://raw.githubusercontent.com/onflow/flow-cli/master/install.sh | sh

# Verify installation
flow version`,
  },
  {
    title: "Initialize Project",
    description: "Create a new Flow project with FlowDevKit",
    time: "1 min",
    code: `# Initialize new project
flow init my-flow-app
cd my-flow-app

# Download FlowDevKit templates
git clone https://github.com/flowdevkit/templates.git`,
  },
  {
    title: "Deploy Your First Contract",
    description: "Deploy an NFT contract to testnet",
    time: "3 min",
    code: `# Copy NFT template
cp templates/contracts/NFT.cdc contracts/

# Deploy to testnet
flow project deploy --network=testnet`,
  },
  {
    title: "Build Frontend",
    description: "Create a React app with wallet integration",
    time: "5 min",
    code: `# Install dependencies
npm install @onflow/fcl @onflow/types

# Add wallet connection
import { useFlowWallet } from '@/hooks/useFlowWallet'`,
  },
]

const documentationSections = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Everything you need to start building on Flow",
    icon: Rocket,
    articles: [
      { title: "What is FlowDevKit?", href: "/docs/introduction", time: "3 min read" },
      { title: "Quick Start Guide", href: "/docs/quickstart", time: "10 min read" },
      { title: "Flow Blockchain Basics", href: "/docs/flow-basics", time: "8 min read" },
      { title: "Development Environment Setup", href: "/docs/environment", time: "5 min read" },
    ],
  },
  {
    id: "smart-contracts",
    title: "Smart Contracts",
    description: "Learn Cadence and deploy contracts",
    icon: Code,
    articles: [
      { title: "Cadence Language Guide", href: "/docs/cadence", time: "15 min read" },
      { title: "NFT Contract Tutorial", href: "/docs/nft-tutorial", time: "20 min read" },
      { title: "Token Contract Tutorial", href: "/docs/token-tutorial", time: "18 min read" },
      { title: "Contract Security Best Practices", href: "/docs/security", time: "12 min read" },
    ],
  },
  {
    id: "cli-tools",
    title: "CLI Tools",
    description: "Command line tools and scripts",
    icon: Terminal,
    articles: [
      { title: "CLI Installation & Setup", href: "/docs/cli-setup", time: "5 min read" },
      { title: "Deployment Scripts", href: "/docs/deployment", time: "10 min read" },
      { title: "Transaction Scripts", href: "/docs/transactions", time: "8 min read" },
      { title: "Network Configuration", href: "/docs/networks", time: "6 min read" },
    ],
  },
  {
    id: "frontend",
    title: "Frontend Integration",
    description: "React hooks and components",
    icon: Puzzle,
    articles: [
      { title: "React Integration Guide", href: "/docs/react", time: "12 min read" },
      { title: "Wallet Connection", href: "/docs/wallet-connection", time: "8 min read" },
      { title: "Transaction Handling", href: "/docs/transaction-handling", time: "10 min read" },
      { title: "Real-time Updates", href: "/docs/real-time", time: "7 min read" },
    ],
  },
]

const exampleProjects = [
  {
    title: "NFT Marketplace",
    description: "Complete NFT marketplace with listing, buying, and selling functionality",
    tech: ["React", "Next.js", "FCL", "Cadence"],
    difficulty: "Intermediate",
    time: "2-3 hours",
    github: "https://github.com/flowdevkit/nft-marketplace",
    demo: "https://nft-marketplace.flowdevkit.com",
  },
  {
    title: "Token Swap DApp",
    description: "Decentralized exchange for swapping fungible tokens",
    tech: ["React", "TypeScript", "FCL", "Cadence"],
    difficulty: "Advanced",
    time: "4-5 hours",
    github: "https://github.com/flowdevkit/token-swap",
    demo: "https://token-swap.flowdevkit.com",
  },
  {
    title: "DAO Governance",
    description: "Decentralized autonomous organization with voting mechanisms",
    tech: ["React", "Next.js", "FCL", "Cadence"],
    difficulty: "Advanced",
    time: "6-8 hours",
    github: "https://github.com/flowdevkit/dao-governance",
    demo: "https://dao.flowdevkit.com",
  },
]

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container py-12">
        <div className="space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Documentation</Badge>
            </div>
            <h1 className="text-4xl font-bold text-balance">FlowDevKit Documentation</h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Comprehensive guides, tutorials, and examples to help you build amazing applications on the Flow
              blockchain. From beginner tutorials to advanced patterns.
            </p>
          </div>

          {/* Quick Start */}
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Quick Start</h2>
            </div>
            <p className="text-muted-foreground">
              Get up and running with FlowDevKit in under 15 minutes. Follow these steps to deploy your first contract
              and build a frontend.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {quickStartSteps.map((step, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{step.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{step.time}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    <CodeBlock code={step.code} language="bash" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>New to Flow?</strong> Start with our{" "}
                <Link href="/docs/flow-basics" className="text-primary hover:underline">
                  Flow Blockchain Basics
                </Link>{" "}
                guide to understand the fundamentals before diving into development.
              </AlertDescription>
            </Alert>
          </section>

          {/* Documentation Sections */}
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Documentation</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {documentationSections.map((section) => (
                <Card key={section.id} className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <section.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{section.title}</CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {section.articles.map((article, index) => (
                        <div key={index}>
                          <Link
                            href={article.href}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                          >
                            <div className="space-y-1">
                              <p className="font-medium group-hover:text-primary transition-colors">{article.title}</p>
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{article.time}</span>
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </Link>
                          {index < section.articles.length - 1 && <Separator className="my-1" />}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Example Projects */}
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Example Projects</h2>
            </div>
            <p className="text-muted-foreground">
              Learn by example with these complete applications built using FlowDevKit. Each project includes full
              source code, deployment instructions, and live demos.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exampleProjects.map((project, index) => (
                <Card key={index} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={project.difficulty === "Advanced" ? "destructive" : "secondary"}>
                            {project.difficulty}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {project.time}
                          </div>
                        </div>
                      </div>
                    </div>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {project.tech.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                        <Link href={project.github} target="_blank">
                          <Code className="h-3 w-3 mr-1" />
                          Code
                        </Link>
                      </Button>
                      <Button size="sm" asChild className="flex-1">
                        <Link href={project.demo} target="_blank">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Demo
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Community & Support */}
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Community & Support</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Join the Community</CardTitle>
                  <CardDescription>
                    Connect with other Flow developers, ask questions, and share your projects
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="https://discord.gg/flow" target="_blank">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Discord Community
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="https://developers.flow.com/ecosystem/developer-support-hub" target="_blank">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Flow Forum
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="https://github.com/onflow" target="_blank">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      GitHub Organization
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Additional Resources</CardTitle>
                  <CardDescription>Official Flow documentation and learning materials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="https://developers.flow.com/" target="_blank">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Flow Documentation
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="https://cadence-lang.org" target="_blank">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Cadence Language
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="https://academy.ecdao.org" target="_blank">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Emerald Academy
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Getting Help */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Need Help?
              </CardTitle>
              <CardDescription>
                Can't find what you're looking for? Here are the best ways to get help with FlowDevKit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Documentation Issues</h4>
                  <p className="text-sm text-muted-foreground">
                    Found a bug in the docs or have suggestions for improvement?
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="https://github.com/Izi-27/Flow-dev-starter/issues" target="_blank">
                      Report Issue
                    </Link>
                  </Button>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Technical Support</h4>
                  <p className="text-sm text-muted-foreground">Having trouble with implementation or deployment?</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="https://discord.gg/flow" target="_blank">
                      Ask on Discord
                    </Link>
                  </Button>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Feature Requests</h4>
                  <p className="text-sm text-muted-foreground">Have an idea for a new template or feature?</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="https://github.com/Izi-27/Flow-dev-starter" target="_blank">
                      Start Discussion
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
