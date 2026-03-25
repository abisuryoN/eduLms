<x-mail::message>
# Halo, {{ $name }}!

Kami menerima permintaan untuk mereset password akun Anda di **LMS UNINDRA**.

<x-mail::button :url="'http://localhost:5173/reset-password?token=' . $token . '&email=' . urlencode($email)">
Reset Password
</x-mail::button>

Link reset password ini akan kadaluarsa dalam **60 menit**.

Jika Anda tidak merasa melakukan permintaan ini, abaikan saja email ini. Keamanan akun Anda tetap terjaga.

Jika tombol di atas tidak berfungsi, Anda dapat menyalin dan menempelkan URL berikut ke browser Anda:  
[http://localhost:5173/reset-password?token={{ $token }}&email={{ urlencode($email) }}](http://localhost:5173/reset-password?token={{ $token }}&email={{ urlencode($email) }})

Terima kasih,<br>
**LMS UNINDRA Team**
</x-mail::message>
