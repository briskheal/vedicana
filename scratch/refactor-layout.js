import fs from 'fs';
import path from 'path';

function fixLayout() {
  const layoutPath = path.join(process.cwd(), 'src/app/layout.js');
  let content = fs.readFileSync(layoutPath, 'utf8');

  // 1. Add ConditionalLayout import
  content = content.replace(
    "import PageTransition from '../components/PageTransition';",
    "import PageTransition from '../components/PageTransition';\nimport ConditionalLayout from '../components/ConditionalLayout';"
  );

  // 2. Remove headers import and usage
  content = content.replace(/import { headers } from 'next\/headers';\n/g, '');
  
  content = content.replace(
    /  const headersList = await headers\(\);\n  const pathname = headersList\.get\('x-pathname'\) \|\| '';\n  const isAdmin = pathname\.startsWith\('\/admin'\) \|\| pathname\.startsWith\('\/api\/admin'\);\n  const isInvoice = pathname\.includes\('\/invoice'\);\n  const hideLayout = isAdmin \|\| isInvoice;\n/,
    ''
  );

  // 3. Wrap the main layout inside ConditionalLayout instead of using hideLayout
  
  // We will isolate the header, footer, and spinWheel into variables or just pass them directly
  // Actually, replacing all the JSX is easier using a targeted string replacement.
  
  const oldJSXStart = `        <CartProvider>
          {/* Skip directly to main content for screen readers / keyboard users */}
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-vedicana-green text-white px-4 py-2.5 rounded-lg font-bold z-[99999] text-xs uppercase tracking-wider shadow-md"
          >
            Skip to main content
          </a>

          {!hideLayout && (
            <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">`;

  const newJSXStart = `        <CartProvider>
          {/* Skip directly to main content for screen readers / keyboard users */}
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-vedicana-green text-white px-4 py-2.5 rounded-lg font-bold z-[99999] text-xs uppercase tracking-wider shadow-md"
          >
            Skip to main content
          </a>

          <ConditionalLayout
            header={
              <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">`;

  content = content.replace(oldJSXStart, newJSXStart);

  // Now replace the end of the header and start of main content
  const oldHeaderEnd = `            </header>
          )}

          <main id="main-content" className="flex-grow flex flex-col">
            <PageTransition>{children}</PageTransition>
          </main>

          {!hideLayout && <SpinWheelModal />}

          {!hideLayout && (
            <>
              <footer className="bg-black text-slate-300 pt-6 pb-4 border-t-[6px] border-vedicana-gold font-sans antialiased">`;

  const newHeaderEnd = `            </header>
            }
            spinWheel={<SpinWheelModal />}
            footer={
              <footer className="bg-black text-slate-300 pt-6 pb-4 border-t-[6px] border-vedicana-gold font-sans antialiased">`;

  content = content.replace(oldHeaderEnd, newHeaderEnd);

  // Now replace the end of the footer
  const oldFooterEnd = `              </footer>
            </>
          )}
        </CartProvider>
      </body>
    </html>
  );
}`;

  const newFooterEnd = `              </footer>
            }
          >
            <main id="main-content" className="flex-grow flex flex-col">
              <PageTransition>{children}</PageTransition>
            </main>
          </ConditionalLayout>
        </CartProvider>
      </body>
    </html>
  );
}`;

  content = content.replace(oldFooterEnd, newFooterEnd);

  fs.writeFileSync(layoutPath, content);
  console.log("Successfully refactored layout.js to use ConditionalLayout");
}

fixLayout();
