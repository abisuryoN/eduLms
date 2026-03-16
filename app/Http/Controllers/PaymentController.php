<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if (!$user->student) {
            return back()->with('error', 'Akses hanya untuk Mahasiswa.');
        }

        $payments = Payment::where('student_id', $user->student->id)
            ->where('status', 'unpaid')
            ->orderBy('created_at', 'desc')
            ->get();

        return view('dashboard.payment.index', compact('payments'));
    }

    public function history()
    {
        $user = Auth::user();
        if (!$user->student) {
            return back()->with('error', 'Akses hanya untuk Mahasiswa.');
        }

        $payments = Payment::where('student_id', $user->student->id)
            ->where('status', 'paid')
            ->orderBy('created_at', 'desc')
            ->get();

        return view('dashboard.payment.history', compact('payments'));
    }
}
