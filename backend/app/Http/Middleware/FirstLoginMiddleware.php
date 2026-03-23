<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class FirstLoginMiddleware
{
    /**
     * If user has is_first_login=true, force them to change password.
     * Only allow /api/change-password and /api/logout.
     */
    public function handle(Request $request, Closure $next): mixed
    {
        $user = $request->user();

        if ($user && $user->is_first_login) {
            $allowedPaths = ['api/change-password', 'api/logout', 'api/me'];

            if (!in_array($request->path(), $allowedPaths)) {
                return response()->json([
                    'message'              => 'Anda harus mengganti password terlebih dahulu.',
                    'must_change_password'  => true,
                ], 403);
            }
        }

        return $next($request);
    }
}
