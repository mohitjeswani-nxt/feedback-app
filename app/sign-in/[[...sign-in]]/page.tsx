import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Feedback Management System</h1>
          <p className="text-muted-foreground mt-2">Sign in to access your dashboard</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              card: "bg-card border border-border",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
            },
          }}
        />
      </div>
    </div>
  )
}
