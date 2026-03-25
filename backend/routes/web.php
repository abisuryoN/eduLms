<?php

use Illuminate\Support\Facades\Mail;

Route::get('/test-mail', function () {
    Mail::raw('Test email Laravel', function ($message) {
            $message->to('suryonegoro2006@gmail.com')
                ->subject('Test Email');
        }
        );

        return 'Email sent!';    });
