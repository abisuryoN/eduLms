<?php

namespace App\Services;

use App\Models\Quiz;
use App\Models\Soal;
use App\Models\JawabanMahasiswa;
use Illuminate\Support\Facades\DB;

class QuizService
{
    /**
     * Create quiz with soal.
     */
    public function create(array $data, array $soalList): Quiz
    {
        return DB::transaction(function () use ($data, $soalList) {
            $quiz = Quiz::create($data);

            foreach ($soalList as $soalData) {
                $soalData['quiz_id'] = $quiz->id;
                Soal::create($soalData);
            }

            return $quiz->load('soal');
        });
    }

    /**
     * Update quiz.
     */
    public function update(Quiz $quiz, array $data): Quiz
    {
        $quiz->update($data);
        return $quiz->fresh();
    }

    /**
     * Submit jawaban mahasiswa & auto-grade.
     * $jawaban = [ ['soal_id' => 1, 'jawaban' => 'a'], ... ]
     */
    public function submitJawaban(int $quizId, int $mahasiswaId, array $jawaban): array
    {
        return DB::transaction(function () use ($quizId, $mahasiswaId, $jawaban) {
            $totalPoin   = 0;
            $correctCount = 0;

            foreach ($jawaban as $j) {
                $soal = Soal::findOrFail($j['soal_id']);
                $isCorrect = $soal->jawaban_benar === $j['jawaban'];
                $poin = $isCorrect ? $soal->poin : 0;

                JawabanMahasiswa::updateOrCreate(
                    ['soal_id' => $j['soal_id'], 'mahasiswa_id' => $mahasiswaId],
                    [
                        'quiz_id'    => $quizId,
                        'jawaban'    => $j['jawaban'],
                        'is_correct' => $isCorrect,
                        'poin'       => $poin,
                    ]
                );

                $totalPoin += $poin;
                if ($isCorrect) $correctCount++;
            }

            return [
                'total_soal'  => count($jawaban),
                'benar'       => $correctCount,
                'total_poin'  => $totalPoin,
            ];
        });
    }

    /**
     * Get quiz result for a mahasiswa.
     */
    public function getResult(int $quizId, int $mahasiswaId): array
    {
        $jawaban = JawabanMahasiswa::where('quiz_id', $quizId)
            ->where('mahasiswa_id', $mahasiswaId)
            ->with('soal')
            ->get();

        return [
            'total_soal' => $jawaban->count(),
            'benar'      => $jawaban->where('is_correct', true)->count(),
            'total_poin' => $jawaban->sum('poin'),
            'jawaban'    => $jawaban,
        ];
    }
}
