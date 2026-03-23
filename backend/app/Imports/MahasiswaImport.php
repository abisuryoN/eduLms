<?php

namespace App\Imports;

use App\Services\NimGeneratorService;
use Maatwebsite\Excel\Concerns\ToArray;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class MahasiswaImport implements ToArray, WithHeadingRow
{
    private array $parsedRows = [];

    public function __construct(
        private NimGeneratorService $nimGenerator
    ) {}

    /**
     * Parse rows dari Excel — TIDAK insert ke DB.
     * Semua logic insert/validasi dipindahkan ke MahasiswaImportService.
     */
    public function array(array $rows): void
    {
        foreach ($rows as $index => $row) {
            $this->parsedRows[] = [
                'row_number' => $index + 2, // +2 karena header + zero-index
                'data'       => [
                    'nama'          => trim($row['nama'] ?? ''),
                    'tanggal_lahir' => trim($row['tanggal_lahir'] ?? ''),
                    'tanggal_masuk' => trim($row['tanggal_masuk'] ?? ''),
                    'email'         => trim($row['email'] ?? ''),
                    'kode_prodi'    => trim($row['kode_prodi'] ?? ''),
                ],
            ];
        }
    }

    public function getParsedRows(): array
    {
        return $this->parsedRows;
    }
}
