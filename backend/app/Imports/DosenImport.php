<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class DosenImport implements ToCollection, WithHeadingRow
{
    private array $parsedRows = [];

    public function collection(Collection $rows): void
    {
        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2;

            if (empty(array_filter($row->toArray()))) {
                continue;
            }

            $this->parsedRows[] = [
                'row_number' => $rowNumber,
                'data'       => $row->toArray(),
            ];
        }
    }

    public function getParsedRows(): array
    {
        return $this->parsedRows;
    }
}