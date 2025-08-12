export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-gray-600">This is a placeholder page. Use Supabase Studio to create users and sign in locally.</p>
        <form className="space-y-4" action="#" method="post" onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-2">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className="border rounded p-2" placeholder="you@example.com" />
          </div>
          <div className="grid gap-2">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" className="border rounded p-2" placeholder="••••••••" />
          </div>
          <button className="border rounded px-4 py-2" type="submit">Continue</button>
        </form>
      </div>
    </div>
  );
}


