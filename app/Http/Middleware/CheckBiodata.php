<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckBiodata
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if ($user && !$user->is_biodata_completed) {
            if (!$request->is('complete-biodata') && !$request->is('logout') && !$request->is('dashboard')) {
                return redirect()->route('dashboard'); // Redirect to dashboard to see the alert
            }
        }
        
        return $next($request);
    }
}
