<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LoginSlide;

class LoginSlideSeeder extends Seeder
{
    public function run(): void
    {
        $slides = [
            [
                'text' => "Knowledge is the theoretical understanding of something, which is acquired through lectures and textbooks. Knowledge-based learning, therefore, refers to reading, listening, and watching to obtain the information needed before progressing to the next stage of learning. Skills can be acquired by doing, and the best way to master something is through regular practise or trial and error.",
                'author' => "Emily Gorsky",
                'sub' => "In The Loop",
                'order' => 1,
            ],
            [
                'text' => "Collaborative learning is a situation in which two or more people learn or attempt to learn something together.",
                'author' => "Wikipedia",
                'sub' => "Educational Technology",
                'order' => 2,
            ],
            [
                'text' => "Education is the most powerful weapon which you can use to change the world.",
                'author' => "Nelson Mandela",
                'sub' => "Freedom Fighter",
                'order' => 3,
            ],
        ];

        foreach ($slides as $slide) {
            LoginSlide::create($slide);
        }
    }
}
