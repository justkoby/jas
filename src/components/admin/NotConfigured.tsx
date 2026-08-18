/**
 * Shown at /admin while Supabase environment variables are missing.
 * Mirrors the storefront's graceful-fallback behaviour.
 */
export function NotConfigured() {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full bg-white border border-brand-border rounded-lg shadow-card p-8 md:p-10">
        <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-brand-burgundy mb-2">
          JAS Admin
        </p>
        <h1 className="font-serif text-2xl md:text-3xl text-brand-charcoal mb-3">
          Backend not configured
        </h1>
        <p className="font-sans text-sm text-brand-taupe leading-relaxed mb-8">
          The admin dashboard needs a Supabase project. Once the steps below are
          done, sign in with a staff account and this page becomes your dashboard.
        </p>

        <ol className="space-y-5 font-sans text-sm text-brand-charcoal">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-beige border border-brand-border text-[11px] font-bold flex items-center justify-center">
              1
            </span>
            <div>
              <p className="font-semibold">Create a Supabase project</p>
              <p className="text-brand-taupe text-xs mt-1 leading-relaxed">
                Copy <code className="bg-brand-beige px-1 rounded">.env.example</code> to{" "}
                <code className="bg-brand-beige px-1 rounded">.env.local</code> and fill in{" "}
                <code className="bg-brand-beige px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
                <code className="bg-brand-beige px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and{" "}
                <code className="bg-brand-beige px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code>.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-beige border border-brand-border text-[11px] font-bold flex items-center justify-center">
              2
            </span>
            <div>
              <p className="font-semibold">Run the migrations</p>
              <p className="text-brand-taupe text-xs mt-1 leading-relaxed">
                Apply <code className="bg-brand-beige px-1 rounded">supabase/migrations/0001</code> through{" "}
                <code className="bg-brand-beige px-1 rounded">0010</code> in the Supabase SQL editor, in order.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-beige border border-brand-border text-[11px] font-bold flex items-center justify-center">
              3
            </span>
            <div>
              <p className="font-semibold">Seed the catalogue</p>
              <p className="text-brand-taupe text-xs mt-1 leading-relaxed">
                Run <code className="bg-brand-beige px-1 rounded">npm run seed</code> to load categories,
                products, delivery methods and the WELCOME10 code.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-beige border border-brand-border text-[11px] font-bold flex items-center justify-center">
              4
            </span>
            <div>
              <p className="font-semibold">Promote your account</p>
              <p className="text-brand-taupe text-xs mt-1 leading-relaxed">
                Register on the storefront, then run in the SQL editor:{" "}
                <code className="bg-brand-beige px-1 rounded">
                  update profiles set role = &apos;super_admin&apos; where id = &apos;&lt;your-user-id&gt;&apos;;
                </code>
              </p>
            </div>
          </li>
        </ol>

        <p className="font-sans text-xs text-brand-taupe mt-8 leading-relaxed border-t border-brand-border pt-4">
          The storefront keeps working with demo data until then — only the admin
          area requires a live backend.
        </p>
      </div>
    </div>
  );
}
