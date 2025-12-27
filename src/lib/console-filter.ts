// Console filter to suppress development noise
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args: any[]) => {
    const message = args.join(' ');
    
    // Suppress connection errors
    if (message.includes('Could not establish connection') || 
        message.includes('Receiving end does not exist')) {
      return;
    }
    
    // Suppress useInsertionEffect warnings (various formats)
    if (message.includes('useInsertionEffect') || 
        message.includes('useInsertionEffect must not schedule updates') ||
        message.toLowerCase().includes('useinsertioneffect')) {
      return;
    }
    
    // Suppress Permissions-Policy warnings
    if (message.includes('Permissions-Policy header')) {
      return;
    }
    
    // Suppress extra attributes warnings
    if (message.includes('Extra attributes from the server')) {
      return;
    }
    
    // Suppress hydration warnings
    if (message.includes('Hydration failed') || 
        message.includes('Text content does not match')) {
      return;
    }
    
    originalError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    
    // Suppress connection warnings
    if (message.includes('Could not establish connection') || 
        message.includes('Receiving end does not exist')) {
      return;
    }
    
    // Suppress useInsertionEffect warnings (various formats)
    if (message.includes('useInsertionEffect') || 
        message.includes('useInsertionEffect must not schedule updates') ||
        message.toLowerCase().includes('useinsertioneffect')) {
      return;
    }
    
    // Suppress Permissions-Policy warnings
    if (message.includes('Permissions-Policy header')) {
      return;
    }
    
    // Suppress extra attributes warnings
    if (message.includes('Extra attributes from the server')) {
      return;
    }
    
    // Suppress hydration warnings
    if (message.includes('Hydration failed') || 
        message.includes('Text content does not match')) {
      return;
    }
    
    originalWarn.apply(console, args);
  };
} 