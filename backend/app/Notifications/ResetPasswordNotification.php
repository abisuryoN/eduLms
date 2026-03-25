<?php

namespace App\Notifications;

use App\Mail\ResetPasswordMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public $token;

    public function __construct($token)
    {
        $this->token = $token;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): ResetPasswordMail
    {
        return (new ResetPasswordMail(
            $this->token,
            $notifiable->getEmailForPasswordReset(),
            $notifiable->name ?? 'User'
        ))->to($notifiable->getEmailForPasswordReset());
    }
}
